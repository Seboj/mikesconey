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

export async function scanInvoice(base64Image: string, mimeType: string): Promise<any> {
  const systemPrompt = `You are an invoice data extraction system. Extract structured data from the invoice image.
Return ONLY valid JSON with this exact schema:
{
  "vendor": "vendor name",
  "date": "YYYY-MM-DD",
  "lineItems": [
    { "description": "item name", "qty": 1, "unitCost": 0.00, "totalCost": 0.00 }
  ],
  "confidence": 0.95
}
If you cannot read part of the invoice, set confidence lower and include what you can extract. No markdown, no explanation — only JSON.`;

  const reply = await cortexChat(
    [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all line items from this invoice." },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
        ],
      },
    ],
    { pool: "CortexVLM", model: CORTEX_VLM_MODEL, maxTokens: 3000 }
  );

  // Parse JSON from reply, stripping markdown fences if present
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

export async function suggestRecipe(
  menuItemName: string,
  inventoryItems: Array<{ id: string; name: string; unit: string }>
): Promise<Array<{ inventoryItemId: string; inventoryItemName: string; qtyPerServing: number; unit: string }>> {
  const itemList = inventoryItems.map((i) => `- ${i.name} (id: ${i.id}, unit: ${i.unit})`).join("\n");

  const systemPrompt = `You are a restaurant recipe consultant. Given a menu item name and available inventory items, suggest the recipe ingredients with quantities per single serving.

Available inventory items:
${itemList}

Return ONLY valid JSON array:
[{ "inventoryItemId": "uuid", "inventoryItemName": "name", "qtyPerServing": 0.5, "unit": "lb" }]
Only use items from the list above. Be realistic for a coney island diner. No markdown, no explanation.`;

  const reply = await cortexChat([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Suggest a recipe for: ${menuItemName}` },
  ]);

  const jsonStr = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}
