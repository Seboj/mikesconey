CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"category" varchar(100),
	"current_qty" numeric(12, 3) DEFAULT '0' NOT NULL,
	"par_level" numeric(12, 3) DEFAULT '0' NOT NULL,
	"default_vendor_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "po_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_id" uuid NOT NULL,
	"item_id" uuid,
	"description" varchar(500) NOT NULL,
	"qty" numeric(12, 3) NOT NULL,
	"unit_cost" numeric(12, 2),
	"total_cost" numeric(12, 2),
	"raw_description" varchar(500),
	"canonical_name" varchar(200),
	"category" varchar(100),
	"base_unit" varchar(50),
	"units_per_pack" numeric(12, 3),
	"packs_per_case" numeric(12, 3),
	"total_base_units" numeric(12, 3),
	"unit_cost_base" numeric(12, 4),
	"confidence" numeric(5, 4),
	"match_status" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid,
	"order_date" date DEFAULT now() NOT NULL,
	"total_cost" numeric(12, 2),
	"raw_doc_url" text,
	"raw_doc_s3_key" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"invoice_number" varchar(100),
	"due_date" date,
	"po_reference" varchar(100),
	"subtotal" numeric(12, 2),
	"freight" numeric(12, 2),
	"tax" numeric(12, 2),
	"payment_status" varchar(20) DEFAULT 'unpaid',
	"payment_date" date,
	"payment_method" varchar(50),
	"receiving_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"qty_per_serving" numeric(12, 3) NOT NULL,
	"unit" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_date" date DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"qty_sold" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usage_date" date DEFAULT now() NOT NULL,
	"inventory_item_id" uuid NOT NULL,
	"qty_consumed" numeric(12, 3) NOT NULL,
	"source_entry_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_item_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"pack_description" varchar(200),
	"pack_unit_cost" numeric(12, 2),
	"last_seen_date" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"contact" varchar(255),
	"category" varchar(100),
	"address" text,
	"phone" varchar(50),
	"email" varchar(255),
	"payment_terms" varchar(100),
	"notes" text,
	"last_order_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_default_vendor_id_vendors_id_fk" FOREIGN KEY ("default_vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "po_line_items" ADD CONSTRAINT "po_line_items_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "po_line_items" ADD CONSTRAINT "po_line_items_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_menu_item_id_menu_items_inventory_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items_inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_lines" ADD CONSTRAINT "sales_lines_entry_id_sales_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."sales_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_lines" ADD CONSTRAINT "sales_lines_menu_item_id_menu_items_inventory_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items_inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_source_entry_id_sales_entries_id_fk" FOREIGN KEY ("source_entry_id") REFERENCES "public"."sales_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_item_prices" ADD CONSTRAINT "vendor_item_prices_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_item_prices" ADD CONSTRAINT "vendor_item_prices_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;