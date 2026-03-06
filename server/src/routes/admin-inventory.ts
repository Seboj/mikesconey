import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import * as inv from "../services/inventory.service.js";
import { scanInvoice, parseSalesText, suggestRecipe } from "../services/cortex.service.js";
import { uploadFile } from "../services/s3.service.js";

export const adminInventoryRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ── Vendors ──

adminInventoryRouter.get("/inventory/vendors", async (_req, res) => {
  const vendors = await inv.listVendors();
  res.json(vendors);
});

adminInventoryRouter.post("/inventory/vendors", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).max(200),
    contact: z.string().max(255).optional(),
    category: z.string().max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
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

adminInventoryRouter.post("/inventory/po/scan", upload.single("invoice"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No image file provided" }); return; }

  try {
    const base64 = req.file.buffer.toString("base64");
    const result = await scanInvoice(base64, req.file.mimetype);

    // Upload the raw document to S3 (non-fatal — skip in dev without creds)
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
  const po = await inv.confirmPurchaseOrder(req.params.id);
  if (!po) { res.status(404).json({ error: "PO not found" }); return; }
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
    const suggestion = await suggestRecipe(mi.name, items.map((i) => ({ id: i.id, name: i.name, unit: i.unit })));
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
