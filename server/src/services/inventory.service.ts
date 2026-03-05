import { db, schema } from "../db/index.js";
import { eq, sql, desc, and } from "drizzle-orm";

const {
  vendors,
  inventoryItems,
  purchaseOrders,
  poLineItems,
  menuItemsInventory,
  recipes,
  salesEntries,
  salesLines,
  usageRecords,
} = schema;

// ── Vendors ──

export async function listVendors() {
  return db.select().from(vendors).orderBy(vendors.name);
}

export async function createVendor(data: { name: string; contact?: string; category?: string }) {
  const [row] = await db.insert(vendors).values(data).returning();
  return row;
}

export async function updateVendor(id: string, data: Partial<{ name: string; contact: string | null; category: string | null }>) {
  const [row] = await db.update(vendors).set({ ...data, updatedAt: new Date() }).where(eq(vendors.id, id)).returning();
  return row;
}

export async function deleteVendor(id: string) {
  const [row] = await db.delete(vendors).where(eq(vendors.id, id)).returning();
  return row;
}

// ── Inventory Items ──

export async function listInventoryItems() {
  return db.select().from(inventoryItems).orderBy(inventoryItems.name);
}

export async function createInventoryItem(data: { name: string; unit: string; category?: string; currentQty?: string; parLevel?: string }) {
  const [row] = await db.insert(inventoryItems).values(data).returning();
  return row;
}

export async function updateInventoryItem(id: string, data: Partial<{ name: string; unit: string; category: string | null; currentQty: string; parLevel: string }>) {
  const [row] = await db.update(inventoryItems).set({ ...data, updatedAt: new Date() }).where(eq(inventoryItems.id, id)).returning();
  return row;
}

export async function deleteInventoryItem(id: string) {
  const [row] = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();
  return row;
}

// ── Purchase Orders ──

export async function listPurchaseOrders() {
  const pos = await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  // Attach vendor names
  const vendorList = await db.select().from(vendors);
  const vendorMap = Object.fromEntries(vendorList.map((v) => [v.id, v]));
  return pos.map((po) => ({
    ...po,
    vendor: po.vendorId ? vendorMap[po.vendorId] || null : null,
  }));
}

export async function getPurchaseOrder(id: string) {
  const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
  if (!po) return null;
  const lines = await db.select().from(poLineItems).where(eq(poLineItems.poId, id));
  const vendorRow = po.vendorId
    ? (await db.select().from(vendors).where(eq(vendors.id, po.vendorId)))[0] || null
    : null;
  return { ...po, lineItems: lines, vendor: vendorRow };
}

export async function createPurchaseOrder(data: {
  vendorId?: string;
  orderDate?: string;
  totalCost?: string;
  rawDocUrl?: string;
  rawDocS3Key?: string;
  status?: string;
  lineItems?: Array<{ itemId?: string; description: string; qty: string; unitCost?: string; totalCost?: string }>;
}) {
  const { lineItems, ...poData } = data;
  const [po] = await db.insert(purchaseOrders).values(poData).returning();

  if (lineItems?.length) {
    await db.insert(poLineItems).values(
      lineItems.map((li) => ({ ...li, poId: po.id }))
    );
  }

  return getPurchaseOrder(po.id);
}

export async function updatePurchaseOrder(id: string, data: Partial<{
  vendorId: string | null;
  orderDate: string;
  totalCost: string;
  status: string;
  lineItems: Array<{ itemId?: string; description: string; qty: string; unitCost?: string; totalCost?: string }>;
}>) {
  const { lineItems, ...poData } = data;
  const [po] = await db.update(purchaseOrders).set({ ...poData, updatedAt: new Date() }).where(eq(purchaseOrders.id, id)).returning();
  if (!po) return null;

  if (lineItems !== undefined) {
    await db.delete(poLineItems).where(eq(poLineItems.poId, id));
    if (lineItems.length) {
      await db.insert(poLineItems).values(
        lineItems.map((li) => ({ ...li, poId: id }))
      );
    }
  }

  return getPurchaseOrder(id);
}

export async function deletePurchaseOrder(id: string) {
  const [row] = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id)).returning();
  return row;
}

export async function confirmPurchaseOrder(id: string) {
  const po = await getPurchaseOrder(id);
  if (!po) return null;

  // Update PO status
  await db.update(purchaseOrders).set({ status: "confirmed", updatedAt: new Date() }).where(eq(purchaseOrders.id, id));

  // Add quantities to inventory for matched items
  for (const line of po.lineItems || []) {
    if (line.itemId) {
      await db
        .update(inventoryItems)
        .set({
          currentQty: sql`${inventoryItems.currentQty} + ${line.qty}`,
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.id, line.itemId));
    }
  }

  return getPurchaseOrder(id);
}

// ── Menu Items (Inventory) ──

export async function listMenuItems() {
  return db.select().from(menuItemsInventory).orderBy(menuItemsInventory.name);
}

export async function createMenuItem(data: { name: string; description?: string }) {
  const [row] = await db.insert(menuItemsInventory).values(data).returning();
  return row;
}

export async function updateMenuItem(id: string, data: Partial<{ name: string; description: string | null }>) {
  const [row] = await db.update(menuItemsInventory).set({ ...data, updatedAt: new Date() }).where(eq(menuItemsInventory.id, id)).returning();
  return row;
}

export async function deleteMenuItem(id: string) {
  const [row] = await db.delete(menuItemsInventory).where(eq(menuItemsInventory.id, id)).returning();
  return row;
}

// ── Recipes ──

export async function getRecipes(menuItemId: string) {
  const rows = await db.select().from(recipes).where(eq(recipes.menuItemId, menuItemId));
  // Attach inventory item info
  const items = await db.select().from(inventoryItems);
  const itemMap = Object.fromEntries(items.map((i) => [i.id, i]));
  return rows.map((r) => ({ ...r, inventoryItem: itemMap[r.inventoryItemId] || null }));
}

export async function setRecipes(
  menuItemId: string,
  items: Array<{ inventoryItemId: string; qtyPerServing: string; unit: string }>
) {
  await db.delete(recipes).where(eq(recipes.menuItemId, menuItemId));
  if (items.length) {
    await db.insert(recipes).values(items.map((i) => ({ ...i, menuItemId })));
  }
  return getRecipes(menuItemId);
}

// ── Sales ──

export async function listSalesEntries() {
  const entries = await db.select().from(salesEntries).orderBy(desc(salesEntries.createdAt));
  const allLines = await db.select().from(salesLines);
  const allMenuItems = await db.select().from(menuItemsInventory);
  const miMap = Object.fromEntries(allMenuItems.map((m) => [m.id, m]));

  return entries.map((e) => ({
    ...e,
    lines: allLines
      .filter((l) => l.entryId === e.id)
      .map((l) => ({ ...l, menuItem: miMap[l.menuItemId] || null })),
  }));
}

export async function createSalesEntry(data: {
  saleDate?: string;
  notes?: string;
  lines: Array<{ menuItemId: string; qtySold: number }>;
}) {
  const { lines, ...entryData } = data;
  const [entry] = await db.insert(salesEntries).values(entryData).returning();

  if (lines.length) {
    await db.insert(salesLines).values(lines.map((l) => ({ ...l, entryId: entry.id })));
  }

  // Calculate usage from recipes
  for (const line of lines) {
    const recipeRows = await db.select().from(recipes).where(eq(recipes.menuItemId, line.menuItemId));
    for (const r of recipeRows) {
      const consumed = parseFloat(r.qtyPerServing) * line.qtySold;
      await db.insert(usageRecords).values({
        usageDate: entry.saleDate,
        inventoryItemId: r.inventoryItemId,
        qtyConsumed: consumed.toString(),
        sourceEntryId: entry.id,
      });
      // Decrement inventory
      await db
        .update(inventoryItems)
        .set({
          currentQty: sql`GREATEST(${inventoryItems.currentQty} - ${consumed.toString()}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.id, r.inventoryItemId));
    }
  }

  return entry;
}

export async function deleteSalesEntry(id: string) {
  // Remove associated usage records (but don't restore inventory — too complex for simple delete)
  await db.delete(usageRecords).where(eq(usageRecords.sourceEntryId, id));
  const [row] = await db.delete(salesEntries).where(eq(salesEntries.id, id)).returning();
  return row;
}

// ── Reports ──

export async function getDashboardSummary() {
  const allItems = await db.select().from(inventoryItems);
  const lowStock = allItems.filter((i) => parseFloat(i.currentQty) <= parseFloat(i.parLevel));
  const vendorCount = await db.select({ count: sql<number>`count(*)` }).from(vendors);
  const pendingPOs = await db
    .select({ count: sql<number>`count(*)`, total: sql<string>`COALESCE(SUM(total_cost::numeric), 0)` })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.status, "draft"));

  // Recent activity: last 10 POs + sales
  const recentPOs = await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt)).limit(5);
  const recentSales = await db.select().from(salesEntries).orderBy(desc(salesEntries.createdAt)).limit(5);

  const activity = [
    ...recentPOs.map((po) => ({
      type: "po" as const,
      description: `PO created (${po.status})`,
      date: po.createdAt.toISOString(),
    })),
    ...recentSales.map((s) => ({
      type: "sale" as const,
      description: s.notes || "Sales entry",
      date: s.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return {
    totalItems: allItems.length,
    lowStockItems: lowStock.length,
    totalVendors: Number(vendorCount[0]?.count || 0),
    pendingPOs: Number(pendingPOs[0]?.count || 0),
    totalPOValue: pendingPOs[0]?.total || "0",
    recentActivity: activity,
    lowStockList: lowStock,
  };
}

export async function getVendorSpend() {
  const rows = await db
    .select({
      vendorId: purchaseOrders.vendorId,
      totalSpend: sql<string>`COALESCE(SUM(${purchaseOrders.totalCost}::numeric), 0)`,
      orderCount: sql<number>`count(*)`,
    })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.status, "confirmed"))
    .groupBy(purchaseOrders.vendorId);

  const vendorList = await db.select().from(vendors);
  const vendorMap = Object.fromEntries(vendorList.map((v) => [v.id, v]));

  return rows.map((r) => ({
    vendor: r.vendorId ? vendorMap[r.vendorId] || null : null,
    totalSpend: r.totalSpend,
    orderCount: r.orderCount,
  }));
}

export async function getUsageSummary() {
  const rows = await db
    .select({
      inventoryItemId: usageRecords.inventoryItemId,
      totalConsumed: sql<string>`COALESCE(SUM(${usageRecords.qtyConsumed}::numeric), 0)`,
    })
    .from(usageRecords)
    .groupBy(usageRecords.inventoryItemId);

  const items = await db.select().from(inventoryItems);
  const itemMap = Object.fromEntries(items.map((i) => [i.id, i]));

  return rows.map((r) => ({
    inventoryItem: itemMap[r.inventoryItemId] || null,
    totalConsumed: r.totalConsumed,
  }));
}
