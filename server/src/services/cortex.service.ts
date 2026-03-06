const CORTEX_URL = "https://cortexapi.nfinitmonkeys.com/v1/chat/completions";
const CORTEX_MODEL = process.env.CORTEX_MODEL || "Qwen/Qwen3-14B";
const CORTEX_VLM_MODEL = process.env.CORTEX_VLM_MODEL || "Qwen/Qwen2.5-VL-7B-Instruct";

interface CortexMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface CortexOptions {
  pool?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function cortexChat(
  messages: CortexMessage[],
  options: CortexOptions = {}
): Promise<string> {
  const apiKey = process.env.CORTEX_API_KEY;
  if (!apiKey) throw new Error("CORTEX_API_KEY not configured");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (options.pool) {
    headers["X-Cortex-Pool"] = options.pool;
  }

  const response = await fetch(CORTEX_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: options.model || CORTEX_MODEL,
      messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature ?? 0.2,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cortex API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error("No response from Cortex");
  return reply;
}

/**
 * Stage 1: Extract raw document data using VLM (CortexVLM pool).
 * Returns vendor info, invoice metadata, line items AS PRINTED, and totals.
 * Never normalizes — extracts text exactly as it appears on the document.
 */
export async function extractDocument(
  base64Image: string,
  mimeType: string
): Promise<{
  vendor: { name: string; address: string | null; phone: string | null; email: string | null };
  invoice: { invoiceNumber: string | null; date: string | null; dueDate: string | null; poReference: string | null };
  lineItems: Array<{ rawDescription: string; qty: number; unitAsPrinted: string; unitPrice: number; lineTotal: number; confidence: number }>;
  totals: { subtotal: number | null; freight: number | null; tax: number | null; total: number };
  overallConfidence: number;
}> {
  const systemPrompt = `You are a document extraction system. Extract data from this invoice/receipt image EXACTLY as printed — do not normalize, rename, or reformat any text.

Return ONLY valid JSON with this schema:
{
  "vendor": {
    "name": "vendor name as printed",
    "address": "full address or null",
    "phone": "phone or null",
    "email": "email or null"
  },
  "invoice": {
    "invoiceNumber": "invoice/receipt number or null",
    "date": "YYYY-MM-DD or null",
    "dueDate": "YYYY-MM-DD or null",
    "poReference": "PO reference or null"
  },
  "lineItems": [
    {
      "rawDescription": "item description EXACTLY as printed on invoice",
      "qty": 1,
      "unitAsPrinted": "the unit label as printed (e.g. 'CS', 'EA', '6/10#', '4/1GAL')",
      "unitPrice": 0.00,
      "lineTotal": 0.00,
      "confidence": 0.95
    }
  ],
  "totals": {
    "subtotal": 0.00,
    "freight": 0.00,
    "tax": 0.00,
    "total": 0.00
  },
  "overallConfidence": 0.90
}

Rules:
- Extract rawDescription VERBATIM — do not rename or simplify
- unitAsPrinted should capture the exact pack/unit notation (e.g. "6/10#", "4/1GAL", "50LB", "CS", "EA")
- If a field is not visible, set it to null
- Set confidence lower for items that are hard to read
- No markdown, no explanation — only JSON.`;

  const reply = await cortexChat(
    [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all data from this invoice exactly as printed." },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
        ],
      },
    ],
    { pool: "CortexVLM", model: CORTEX_VLM_MODEL, maxTokens: 4000 }
  );

  const jsonStr = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

/**
 * Stage 2: Normalize line items using default LLM pool.
 * Takes raw extracted items + existing inventory items, returns canonical names,
 * pack format explosion to base units, and fuzzy match against existing items.
 */
export async function normalizeLineItems(
  rawItems: Array<{ rawDescription: string; qty: number; unitAsPrinted: string; unitPrice: number; lineTotal: number }>,
  existingItems: Array<{ id: string; name: string; unit: string; category: string | null }>
): Promise<Array<{
  rawDescription: string;
  canonicalName: string;
  category: string;
  baseUnit: string;
  unitsPerPack: number;
  packsPerCase: number;
  totalBaseUnits: number;
  unitCostBase: number;
  confidence: number;
  matchStatus: "matched" | "suggested" | "new";
  matchedItemId: string | null;
  matchedItemName: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}>> {
  const itemList = existingItems.map((i) => `- "${i.name}" (id: ${i.id}, unit: ${i.unit}, category: ${i.category || "uncategorized"})`).join("\n");

  const systemPrompt = `You normalize raw invoice line items into canonical inventory items with proper base unit conversion.

Existing inventory items:
${itemList || "(none yet)"}

For each raw item, return:
1. canonicalName: SHORT clean product name for inventory tracking. Strip ALL pack sizes, counts, weights, container types, and unit info. Examples:
   - "HEINZ KETCHUP 114OZ JUG" → "Ketchup"
   - "BEEF PATTY 4OZ 40CT" → "Beef Patty"
   - "FRENCH FRIES 5LB BAG CRINKLE CUT" → "French Fries Crinkle Cut"
   - "YELLOW MUSTARD 4/1GAL" → "Yellow Mustard"
   - "HOT DOG BUN 8CT" → "Hot Dog Bun"
   - "COCA COLA 24/12OZ CAN" → "Coca Cola"
   The name should read like a grocery item label — no numbers, no weights, no container words.
2. category: food category (Protein, Produce, Dairy, Dry Goods, Condiments, Paper/Supplies, Beverage, Other)
3. baseUnit: the MEASURABLE recipe-friendly unit. ONLY these values are allowed: oz, lb, each, gal, floz
   - Weight items (meat, cheese, fries, etc.) → "oz" or "lb"
   - Liquid items (ketchup, mustard, oil, etc.) → "oz" or "gal" or "floz"
   - Countable items (buns, patties, cups, napkins) → "each"
   - NEVER use container words as baseUnit (not "jug", "bag", "can", "box", "case", "tub", "jar", "bottle", "pouch", "carton")
4. unitsPerPack: how many base units in one pack (e.g. "6/10#" = 6 cans of 10lb = 60lb → unitsPerPack=60 if baseUnit=lb; "114OZ JUG" = unitsPerPack=114 if baseUnit=oz)
5. packsPerCase: if qty represents cases containing multiple packs (default 1)
6. totalBaseUnits: qty × unitsPerPack × packsPerCase
7. unitCostBase: lineTotal / totalBaseUnits (cost per base unit)
8. matchStatus: "matched" if exact/near-exact match to existing item, "suggested" if similar item exists, "new" if no match
9. matchedItemId: id of matched existing item (or null)
10. matchedItemName: name of matched existing item (or null)

IMPORTANT: If an existing inventory item matches, use its EXACT name and unit for canonicalName and baseUnit.

Pack format examples:
- "6/10#" = 6 cans × 10 lbs = 60 lb per case → baseUnit "lb", unitsPerPack 60
- "4/1GAL" = 4 × 1 gallon = 4 gal per case → baseUnit "gal", unitsPerPack 4
- "50LB" = 50 lb bag → baseUnit "lb", unitsPerPack 50
- "114OZ JUG" = 114 oz jug → baseUnit "oz", unitsPerPack 114
- "CS" with context = look at description for pack info
- "EA" = 1 each → baseUnit "each", unitsPerPack 1

Return ONLY valid JSON array. No markdown, no explanation.`;

  const reply = await cortexChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(rawItems) },
    ],
    { maxTokens: 4000 }
  );

  const jsonStr = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

/**
 * Stage 2b: Match extracted vendor name against existing vendors using default LLM pool.
 * Returns ranked candidates with confidence scores.
 */
export async function matchVendor(
  extractedVendorName: string,
  existingVendors: Array<{ id: string; name: string; category: string | null }>
): Promise<Array<{ vendorId: string; vendorName: string; confidence: number }>> {
  if (!existingVendors.length) return [];

  const vendorList = existingVendors.map((v) => `- "${v.name}" (id: ${v.id}, category: ${v.category || "uncategorized"})`).join("\n");

  const systemPrompt = `You match a vendor name extracted from an invoice against a list of existing vendors.
Consider abbreviations, alternate spellings, and DBA names (e.g. "SYSCO DETROIT" matches "Sysco", "GFS" matches "Gordon Food Service").

Existing vendors:
${vendorList}

Return a JSON array of matches sorted by confidence (highest first). Only include vendors with confidence > 0.3.
Format: [{ "vendorId": "uuid", "vendorName": "name", "confidence": 0.95 }]

If no reasonable match exists, return an empty array [].
No markdown, no explanation — only JSON.`;

  const reply = await cortexChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Match this vendor: "${extractedVendorName}"` },
    ],
    { maxTokens: 1000 }
  );

  const jsonStr = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

export async function parseSalesText(
  text: string,
  menuItems: Array<{ id: string; name: string }>
): Promise<Array<{ menuItemName: string; qty: number; menuItemId?: string }>> {
  const menuList = menuItems.map((m) => `- ${m.name} (id: ${m.id})`).join("\n");

  const systemPrompt = `You parse natural-language sales entries into structured data.
Available menu items:
${menuList}

Return ONLY valid JSON array:
[{ "menuItemName": "exact name from list", "qty": 5, "menuItemId": "uuid" }]
Match user input to the closest menu item. If no match, omit menuItemId. No markdown, no explanation.`;

  const reply = await cortexChat([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);

  const jsonStr = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

export async function matchCSVItems(
  csvItemNames: string[],
  menuItems: Array<{ id: string; name: string }>
): Promise<Array<{ csvItem: string; menuItemId: string | null; menuItemName: string | null; confidence: number }>> {
  const menuList = menuItems.map((m) => `- "${m.name}" (id: ${m.id})`).join("\n");

  const systemPrompt = `You match POS/CSV item names to a restaurant's menu items. Items may use abbreviations, short names, or slight variations.

Menu items:
${menuList}

For each CSV item name provided, return the best matching menu item. Consider:
- "Reg Coney" → "Regular Coney"
- "Chz Burger" → "Cheeseburger"
- "Fries" → "French Fries"
- "Coke" or "Pepsi" or "Dr Pepper" → "Soft Drinks"
- "OJ" → "Orange Juice"
- "Eggs" → "Two Eggs Any Style"
- "Pancakes" → "Short Stack Pancakes"
- Item names are case-insensitive

Return ONLY a valid JSON array with one entry per input item:
[{ "csvItem": "original name from input", "menuItemId": "uuid or null", "menuItemName": "matched menu name or null", "confidence": 0.95 }]

Rules:
- If confident match (>0.7), set menuItemId and menuItemName
- If no reasonable match, set menuItemId and menuItemName to null
- confidence: 1.0 = exact match, 0.8+ = very likely, 0.5-0.7 = possible, <0.5 = no match
- Every input item must appear exactly once in output
No markdown, no explanation — only JSON.`;

  const reply = await cortexChat([
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(csvItemNames) },
  ]);

  const jsonStr = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

export async function suggestRecipe(
  menuItemName: string,
  inventoryItems: Array<{ id: string; name: string; unit: string }>
): Promise<Array<{ ingredientName: string; inventoryItemId: string | null; inventoryItemName: string | null; qtyPerServing: number; unit: string; category: string; inInventory: boolean }>> {
  const itemList = inventoryItems.map((i) => `- ${i.name} (id: ${i.id}, unit: ${i.unit})`).join("\n");

  const systemPrompt = `You are a restaurant recipe consultant for a coney island diner. Given a menu item, suggest ALL ingredients a real recipe needs — with quantities per single serving.

Current inventory (may be incomplete):
${itemList || "(empty)"}

RULES:
1. Suggest EVERY ingredient the recipe truly needs, even if it's NOT in inventory.
2. If an ingredient matches an existing inventory item, set inventoryItemId to that item's id and use its exact unit.
3. If an ingredient is NOT in inventory, set inventoryItemId to null and use a sensible base unit (oz, lb, each, floz, gal).
4. Be realistic — a cheese omelette needs eggs, cheese, butter, salt, pepper. Not flour, bread, or ketchup.
5. Use recipe-friendly units: oz, lb, each, floz, gal. Never container units (jug, bag, case, box).
6. For each ingredient, include a category from: Protein, Produce, Dairy, Dry Goods, Condiments, Paper/Supplies, Beverage, Other.

Return ONLY valid JSON array:
[{ "ingredientName": "Eggs", "inventoryItemId": null, "inventoryItemName": null, "qtyPerServing": 3, "unit": "each", "category": "Protein" }]
No markdown, no explanation.`;

  const reply = await cortexChat([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Suggest a recipe for: ${menuItemName}` },
  ]);

  const jsonStr = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}
