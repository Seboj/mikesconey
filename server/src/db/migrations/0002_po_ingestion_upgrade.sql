-- Phase 1 PO Ingestion Upgrade Migration

-- vendors: add new columns
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone varchar(50);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email varchar(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_terms varchar(100);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_order_date date;

-- inventory_items: add new columns
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS default_vendor_id uuid REFERENCES vendors(id);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS notes text;

-- purchase_orders: add new columns
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS invoice_number varchar(100);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_reference varchar(100);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS subtotal numeric(12,2);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS freight numeric(12,2);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS tax numeric(12,2);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_status varchar(20) DEFAULT 'unpaid';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_date date;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_method varchar(50);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS receiving_notes text;

-- po_line_items: add new columns
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS raw_description varchar(500);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS canonical_name varchar(200);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS category varchar(100);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS base_unit varchar(50);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS units_per_pack numeric(12,3);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS packs_per_case numeric(12,3);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS total_base_units numeric(12,3);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS unit_cost_base numeric(12,4);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS confidence numeric(5,4);
ALTER TABLE po_line_items ADD COLUMN IF NOT EXISTS match_status varchar(20);

-- vendor_item_prices: new table
CREATE TABLE IF NOT EXISTS vendor_item_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  pack_description varchar(200),
  pack_unit_cost numeric(12,2),
  last_seen_date date DEFAULT CURRENT_DATE
);
