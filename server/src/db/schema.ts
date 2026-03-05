import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
  numeric,
  date,
} from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).default("").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  optInEmail: boolean("opt_in_email").default(true).notNull(),
  optInSms: boolean("opt_in_sms").default(false).notNull(),
  source: varchar("source", { length: 50 }).default("website").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const siteContent = pgTable("site_content", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Inventory Module ──

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  contact: varchar("contact", { length: 255 }),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }),
  currentQty: numeric("current_qty", { precision: 12, scale: 3 }).default("0").notNull(),
  parLevel: numeric("par_level", { precision: 12, scale: 3 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id").references(() => vendors.id),
  orderDate: date("order_date").defaultNow().notNull(),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }),
  rawDocUrl: text("raw_doc_url"),
  rawDocS3Key: text("raw_doc_s3_key"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const poLineItems = pgTable("po_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  poId: uuid("po_id").references(() => purchaseOrders.id, { onDelete: "cascade" }).notNull(),
  itemId: uuid("item_id").references(() => inventoryItems.id),
  description: varchar("description", { length: 500 }).notNull(),
  qty: numeric("qty", { precision: 12, scale: 3 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }),
});

export const menuItemsInventory = pgTable("menu_items_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  menuItemId: uuid("menu_item_id").references(() => menuItemsInventory.id, { onDelete: "cascade" }).notNull(),
  inventoryItemId: uuid("inventory_item_id").references(() => inventoryItems.id).notNull(),
  qtyPerServing: numeric("qty_per_serving", { precision: 12, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
});

export const salesEntries = pgTable("sales_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleDate: date("sale_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const salesLines = pgTable("sales_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id").references(() => salesEntries.id, { onDelete: "cascade" }).notNull(),
  menuItemId: uuid("menu_item_id").references(() => menuItemsInventory.id).notNull(),
  qtySold: integer("qty_sold").notNull(),
});

export const usageRecords = pgTable("usage_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  usageDate: date("usage_date").defaultNow().notNull(),
  inventoryItemId: uuid("inventory_item_id").references(() => inventoryItems.id).notNull(),
  qtyConsumed: numeric("qty_consumed", { precision: 12, scale: 3 }).notNull(),
  sourceEntryId: uuid("source_entry_id").references(() => salesEntries.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
