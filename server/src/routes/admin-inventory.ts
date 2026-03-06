import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import * as inv from "../services/inventory.service.js";
import { extractDocument, normalizeLineItems, matchVendor, parseSalesText, matchCSVItems, suggestRecipe } from "../services/cortex.service.js";
import { uploadFile } from "../services/s3.service.js";

export const adminInventoryRouter = Router();

/** Parse a single CSV line, handling quoted fields with commas inside */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { result.push(current); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) cb(null, true);
    else cb(new Error("Only CSV files are allowed"));
  },
});

// ── Vendors ──

adminInventoryRouter.get("/inventory/vendors", async (_req, res) => {
  const vendors = await inv.listVendors();
  res.json(vendors);
});

adminInventoryRouter.post("/inventory/vendors", async (req, res) => {
  const vendorSchema = z.object({
    name: z.string().min(1).max(200),
    contact: z.string().max(255).optional(),
    category: z.string().max(100).optional(),
    address: z.string().optional(),
    phone: z.string().max(50).optional(),
    email: z.string().max(255).optional(),
    paymentTerms: z.string().max(100).optional(),
    notes: z.string().optional(),
  });
  const parsed = vendorSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }
  const vendor = await inv.createVendor(parsed.data);
  res.status(201).json(vendor);
});

adminInventoryRouter.patch("/inventory/vendors/:id", async (req, res) => {
  const updated = await inv.updateVendor(req.params.id, req.body);
  if (!updated) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.json(updated);
});

adminInventoryRouter.delete("/inventory/vendors/:id", async (req, res) => {
  const deleted = await inv.deleteVendor(req.params.id);
  if (!deleted) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.json({ success: true });
});

// ── Inventory Items ──

adminInventoryRouter.get("/inventory/items", async (_req, res) => {
  const items = await inv.listInventoryItems();
  res.json(items);
});

adminInventoryRouter.post("/inventory/items", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).max(200),
    unit: z.string().min(1).max(50),
    category: z.string().max(100).optional(),
    currentQty: z.string().optional(),
    parLevel: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }
  const item = await inv.createInventoryItem(parsed.data);
  res.status(201).json(item);
});

adminInventoryRouter.patch("/inventory/items/:id", async (req, res) => {
  const updated = await inv.updateInventoryItem(req.params.id, req.body);
  if (!updated) { res.status(404).json({ error: "Item not found" }); return; }
  res.json(updated);
});

adminInventoryRouter.delete("/inventory/items/:id", async (req, res) => {
  const deleted = await inv.deleteInventoryItem(req.params.id);
  if (!deleted) { res.status(404).json({ error: "Item not found" }); return; }
  res.json({ success: true });
});

// ── Purchase Orders ──

// Stage 1: Extract document with VLM
adminInventoryRouter.post("/inventory/po/scan", upload.single("invoice"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No image file provided" }); return; }

  try {
    const base64 = req.file.buffer.toString("base64");
    const result = await extractDocument(base64, req.file.mimetype);

    // Upload the raw document to S3 (non-fatal)
    let rawDocUrl: string | null = null;
    let rawDocS3Key: string | null = null;
    try {
      const ext = req.file.mimetype.split("/")[1] || "jpg";
      const uploaded = await uploadFile(req.file.buffer, req.file.mimetype, "invoices", ext);
      rawDocUrl = uploaded.url;
      rawDocS3Key = uploaded.key;
    } catch (s3Err) {
      console.warn("[inventory] S3 upload skipped:", (s3Err as Error).message);
    }

    res.json({ ...result, rawDocUrl, rawDocS3Key });
  } catch (err: any) {
    console.error("[inventory] Invoice scan error:", err);
    res.status(500).json({ error: "Failed to scan invoice", details: err.message });
  }
});

// Stage 2a: Match vendor name against existing vendors (LLM)
adminInventoryRouter.post("/inventory/po/match-vendor", async (req, res) => {
  const { vendorName } = req.body;
  if (!vendorName) { res.status(400).json({ error: "vendorName is required" }); return; }

  try {
    const existingVendors = await inv.listVendors();
    const candidates = await matchVendor(
      vendorName,
      existingVendors.map((v) => ({ id: v.id, name: v.name, category: v.category }))
    );

    // Add match level coloring
    const ranked = candidates.map((c) => ({
      ...c,
      matchLevel: c.confidence >= 0.9 ? "green" : c.confidence >= 0.6 ? "amber" : "red",
    }));

    res.json({ extractedName: vendorName, candidates: ranked });
  } catch (err: any) {
    console.error("[inventory] Vendor match error:", err);
    res.status(500).json({ error: "Failed to match vendor", details: err.message });
  }
});

// Stage 2b: Normalize line items with LLM
adminInventoryRouter.post("/inventory/po/normalize", async (req, res) => {
  const { lineItems } = req.body;
  if (!lineItems?.length) { res.status(400).json({ error: "lineItems array is required" }); return; }

  try {
    const existingItems = await inv.listInventoryItems();
    const normalized = await normalizeLineItems(
      lineItems,
      existingItems.map((i) => ({ id: i.id, name: i.name, unit: i.unit, category: i.category }))
    );
    res.json({ items: normalized });
  } catch (err: any) {
    console.error("[inventory] Normalize error:", err);
    res.status(500).json({ error: "Failed to normalize items", details: err.message });
  }
});

// Check duplicate invoice
adminInventoryRouter.post("/inventory/po/check-duplicate", async (req, res) => {
  const { vendorId, invoiceNumber } = req.body;
  if (!vendorId || !invoiceNumber) { res.json({ duplicates: [] }); return; }
  const dupes = await inv.checkDuplicateInvoice(vendorId, invoiceNumber);
  res.json({ duplicates: dupes });
});

adminInventoryRouter.get("/inventory/po", async (_req, res) => {
  const pos = await inv.listPurchaseOrders();
  res.json(pos);
});

adminInventoryRouter.post("/inventory/po", async (req, res) => {
  const po = await inv.createPurchaseOrder(req.body);
  res.status(201).json(po);
});

adminInventoryRouter.get("/inventory/po/:id", async (req, res) => {
  const po = await inv.getPurchaseOrder(req.params.id);
  if (!po) { res.status(404).json({ error: "PO not found" }); return; }
  res.json(po);
});

adminInventoryRouter.patch("/inventory/po/:id", async (req, res) => {
  const po = await inv.updatePurchaseOrder(req.params.id, req.body);
  if (!po) { res.status(404).json({ error: "PO not found" }); return; }
  res.json(po);
});

adminInventoryRouter.delete("/inventory/po/:id", async (req, res) => {
  const deleted = await inv.deletePurchaseOrder(req.params.id);
  if (!deleted) { res.status(404).json({ error: "PO not found" }); return; }
  res.json({ success: true });
});

adminInventoryRouter.post("/inventory/po/:id/confirm", async (req, res) => {
  const po = await inv.confirmPurchaseOrder(req.params.id, req.body);
  if (!po) { res.status(404).json({ error: "PO not found" }); return; }
  res.json(po);
});

adminInventoryRouter.post("/inventory/po/:id/void", async (req, res) => {
  const po = await inv.voidPurchaseOrder(req.params.id);
  if (!po) { res.status(404).json({ error: "PO not found or not confirmed" }); return; }
  res.json(po);
});

// ── Menu Items ──

adminInventoryRouter.get("/inventory/menu-items", async (_req, res) => {
  const items = await inv.listMenuItems();
  res.json(items);
});

adminInventoryRouter.post("/inventory/menu-items", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }
  const item = await inv.createMenuItem(parsed.data);
  res.status(201).json(item);
});

adminInventoryRouter.patch("/inventory/menu-items/:id", async (req, res) => {
  const updated = await inv.updateMenuItem(req.params.id, req.body);
  if (!updated) { res.status(404).json({ error: "Menu item not found" }); return; }
  res.json(updated);
});

adminInventoryRouter.delete("/inventory/menu-items/:id", async (req, res) => {
  const deleted = await inv.deleteMenuItem(req.params.id);
  if (!deleted) { res.status(404).json({ error: "Menu item not found" }); return; }
  res.json({ success: true });
});

adminInventoryRouter.post("/inventory/menu-items/sync", async (req, res) => {
  // Sync from site_content menu: import menu items that don't exist yet
  const { getContent } = await import("../services/content.service.js");
  const menuContent = await getContent("menu") as { categories?: Array<{ items: Array<{ name: string; description?: string }> }> } | null;
  if (!menuContent?.categories) { res.json({ synced: 0 }); return; }

  const existingItems = await inv.listMenuItems();
  const existingNames = new Set(existingItems.map((i) => i.name.toLowerCase()));

  let synced = 0;
  for (const cat of menuContent.categories) {
    for (const item of cat.items || []) {
      if (!existingNames.has(item.name.toLowerCase())) {
        await inv.createMenuItem({ name: item.name, description: item.description });
        existingNames.add(item.name.toLowerCase());
        synced++;
      }
    }
  }

  res.json({ synced });
});

// ── Recipes ──

adminInventoryRouter.get("/inventory/recipes/:menuItemId", async (req, res) => {
  const recipeList = await inv.getRecipes(req.params.menuItemId);
  res.json(recipeList);
});

adminInventoryRouter.put("/inventory/recipes/:menuItemId", async (req, res) => {
  const schema = z.array(z.object({
    inventoryItemId: z.string().uuid(),
    qtyPerServing: z.string(),
    unit: z.string().min(1),
  }));
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }
  const recipeList = await inv.setRecipes(req.params.menuItemId, parsed.data);
  res.json(recipeList);
});

adminInventoryRouter.post("/inventory/recipes/:menuItemId/suggest", async (req, res) => {
  const menuItems = await inv.listMenuItems();
  const mi = menuItems.find((m) => m.id === req.params.menuItemId);
  if (!mi) { res.status(404).json({ error: "Menu item not found" }); return; }

  const items = await inv.listInventoryItems();
  try {
    const raw = await suggestRecipe(mi.name, items.map((i) => ({ id: i.id, name: i.name, unit: i.unit })));

    // Server-side matching: verify LLM-provided IDs and try fuzzy match for missing ones
    const suggestion = raw.map((s) => {
      const category = s.category || "Other";
      const exactMatch = s.inventoryItemId ? items.find((i) => i.id === s.inventoryItemId) : null;
      if (exactMatch) {
        return { ...s, inventoryItemName: exactMatch.name, unit: exactMatch.unit, category, inInventory: true };
      }
      // Fuzzy match by name
      const byName = items.find((i) => i.name.toLowerCase() === (s.ingredientName || "").toLowerCase());
      if (byName) {
        return { ...s, inventoryItemId: byName.id, inventoryItemName: byName.name, unit: byName.unit, category, inInventory: true };
      }
      const fuzzy = items.find((i) =>
        i.name.toLowerCase().includes((s.ingredientName || "").toLowerCase()) ||
        (s.ingredientName || "").toLowerCase().includes(i.name.toLowerCase())
      );
      if (fuzzy) {
        return { ...s, inventoryItemId: fuzzy.id, inventoryItemName: fuzzy.name, unit: fuzzy.unit, category, inInventory: true };
      }
      return { ...s, inventoryItemId: null, inventoryItemName: null, category, inInventory: false };
    });

    res.json(suggestion);
  } catch (err: any) {
    console.error("[inventory] Recipe suggestion error:", err);
    res.status(500).json({ error: "Failed to generate suggestion", details: err.message });
  }
});

// ── Sales ──

adminInventoryRouter.post("/inventory/sales/parse", async (req, res) => {
  const { text } = req.body;
  if (!text) { res.status(400).json({ error: "Text is required" }); return; }

  const menuItems = await inv.listMenuItems();
  try {
    const parsed = await parseSalesText(text, menuItems.map((m) => ({ id: m.id, name: m.name })));
    res.json({ items: parsed });
  } catch (err: any) {
    console.error("[inventory] Sales parse error:", err);
    res.status(500).json({ error: "Failed to parse sales text", details: err.message });
  }
});

adminInventoryRouter.get("/inventory/sales", async (_req, res) => {
  const entries = await inv.listSalesEntries();
  res.json(entries);
});

adminInventoryRouter.post("/inventory/sales", async (req, res) => {
  const entry = await inv.createSalesEntry(req.body);
  res.status(201).json(entry);
});

adminInventoryRouter.get("/inventory/sales/:id", async (req, res) => {
  const entries = await inv.listSalesEntries();
  const entry = entries.find((e) => e.id === req.params.id);
  if (!entry) { res.status(404).json({ error: "Sales entry not found" }); return; }
  res.json(entry);
});

adminInventoryRouter.delete("/inventory/sales/:id", async (req, res) => {
  const deleted = await inv.deleteSalesEntry(req.params.id);
  if (!deleted) { res.status(404).json({ error: "Sales entry not found" }); return; }
  res.json({ success: true });
});

// CSV Upload: parse and preview
adminInventoryRouter.post("/inventory/sales/upload-csv", csvUpload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No CSV file provided" }); return; }

  try {
    const text = req.file.buffer.toString("utf-8");
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) { res.status(400).json({ error: "CSV must have a header row and at least one data row" }); return; }

    // Parse header
    const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    const dateIdx = header.indexOf("date");
    const itemIdx = header.indexOf("item");
    const qtyIdx = header.indexOf("qty");
    if (dateIdx === -1 || itemIdx === -1 || qtyIdx === -1) {
      res.status(400).json({ error: "CSV must have date, item, and qty columns" }); return;
    }

    // Parse data rows
    const rows: Array<{ date: string; item: string; qty: number; modifications?: string; unitPrice?: number }> = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 3) continue;
      const qty = parseInt(cols[qtyIdx], 10);
      if (isNaN(qty) || qty <= 0) continue;
      rows.push({
        date: cols[dateIdx]?.trim(),
        item: cols[itemIdx]?.trim(),
        qty,
        modifications: header.indexOf("modifications") >= 0 ? cols[header.indexOf("modifications")]?.trim() : undefined,
        unitPrice: header.indexOf("unit_price") >= 0 ? parseFloat(cols[header.indexOf("unit_price")]) || undefined : undefined,
      });
    }

    // AI-match unique item names against menu items
    const menuItems = await inv.listMenuItems();
    const uniqueItems = [...new Set(rows.map((r) => r.item))];
    const aiMatches = await matchCSVItems(
      uniqueItems,
      menuItems.map((m) => ({ id: m.id, name: m.name }))
    );

    // Build lookup: csvItem → match result
    const matchMap = new Map<string, { menuItemId: string | null; menuItemName: string | null; confidence: number }>();
    for (const m of aiMatches) {
      matchMap.set(m.csvItem, { menuItemId: m.menuItemId, menuItemName: m.menuItemName, confidence: m.confidence });
    }

    const preview = rows.map((r) => {
      const match = matchMap.get(r.item);
      const hasMatch = match?.menuItemId != null && (match.confidence ?? 0) >= 0.7;
      return {
        ...r,
        menuItemId: hasMatch ? match!.menuItemId : null,
        menuItemName: hasMatch ? match!.menuItemName : null,
        confidence: match?.confidence ?? 0,
        matchStatus: hasMatch ? "matched" as const : "unmatched" as const,
      };
    });

    const summary = {
      totalRows: rows.length,
      matched: preview.filter((p) => p.matchStatus === "matched").length,
      unmatched: preview.filter((p) => p.matchStatus === "unmatched").length,
      dates: [...new Set(rows.map((r) => r.date))].sort(),
    };

    res.json({ preview, summary, menuItems: menuItems.map((m) => ({ id: m.id, name: m.name })) });
  } catch (err: any) {
    console.error("[inventory] CSV upload error:", err);
    res.status(500).json({ error: "Failed to parse CSV", details: err.message });
  }
});

// CSV Import: create sales entries from confirmed preview
adminInventoryRouter.post("/inventory/sales/import-csv", async (req, res) => {
  const schema = z.object({
    lines: z.array(z.object({
      date: z.string(),
      menuItemId: z.string().uuid(),
      qty: z.number().int().positive(),
    })),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }

  try {
    // Group by date
    const byDate = new Map<string, Array<{ menuItemId: string; qtySold: number }>>();
    for (const line of parsed.data.lines) {
      const existing = byDate.get(line.date) || [];
      // Aggregate same menu item on same date
      const found = existing.find((e) => e.menuItemId === line.menuItemId);
      if (found) { found.qtySold += line.qty; }
      else { existing.push({ menuItemId: line.menuItemId, qtySold: line.qty }); }
      byDate.set(line.date, existing);
    }

    const entries: any[] = [];
    for (const [date, lines] of byDate) {
      const entry = await inv.createSalesEntry({ saleDate: date, notes: "CSV import", lines });
      entries.push(entry);
    }

    res.json({ success: true, entriesCreated: entries.length, entries });
  } catch (err: any) {
    console.error("[inventory] CSV import error:", err);
    res.status(500).json({ error: "Failed to import sales", details: err.message });
  }
});

// ── Reports ──

adminInventoryRouter.get("/inventory/reports/summary", async (_req, res) => {
  const summary = await inv.getDashboardSummary();
  res.json(summary);
});

adminInventoryRouter.get("/inventory/reports/vendor-spend", async (_req, res) => {
  const spend = await inv.getVendorSpend();
  res.json(spend);
});

adminInventoryRouter.get("/inventory/reports/usage", async (_req, res) => {
  const usage = await inv.getUsageSummary();
  res.json(usage);
});
