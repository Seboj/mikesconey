export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  optInEmail: boolean;
  optInSms: boolean;
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  optInEmail?: boolean;
  optInSms?: boolean;
  source?: string;
}

export interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  optInEmail?: boolean;
  optInSms?: boolean;
  notes?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  newThisWeek: number;
  newThisMonth: number;
  optInEmail: number;
  optInSms: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
}

// Site content types

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  tags: string[];
}

export interface MenuCategory {
  name: string;
  description: string;
  items: MenuItem[];
}

export interface MenuContent {
  categories: MenuCategory[];
}

export interface HoursEntry {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export type HoursContent = HoursEntry[];

export interface FaqEntry {
  question: string;
  answer: string;
}

export type FaqContent = FaqEntry[];

export interface ReviewEntry {
  text: string;
  author: string;
  rating: number;
}

export interface ReviewsContent {
  overallRating: number;
  reviewCount: number;
  reviews: ReviewEntry[];
}

export interface SiteInfoContent {
  name: string;
  tagline: string;
  since: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  phone: {
    display: string;
    tel: string;
  };
  social: {
    instagram: string;
    facebook: string;
  };
  maps: {
    embedUrl: string;
    directionsUrl: string;
  };
  seo: {
    titleTemplate: string;
    description: string;
    ogImage: string;
  };
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category: string;
  isPlaceholder: boolean;
}

export type GalleryContent = GalleryImage[];

export interface Special {
  day: string;
  title: string;
  description: string;
  price?: string;
  active: boolean;
}

export type SpecialsContent = Special[];

// ── Inventory Module ──

export interface Vendor {
  id: string;
  name: string;
  contact: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  paymentTerms: string | null;
  notes: string | null;
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  category: string | null;
  currentQty: string;
  parLevel: string;
  defaultVendorId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string | null;
  orderDate: string;
  totalCost: string | null;
  rawDocUrl: string | null;
  rawDocS3Key: string | null;
  status: string;
  invoiceNumber: string | null;
  dueDate: string | null;
  poReference: string | null;
  subtotal: string | null;
  freight: string | null;
  tax: string | null;
  paymentStatus: string | null;
  paymentDate: string | null;
  paymentMethod: string | null;
  receivingNotes: string | null;
  createdAt: string;
  updatedAt: string;
  vendor?: Vendor;
  lineItems?: POLineItem[];
}

export interface POLineItem {
  id: string;
  poId: string;
  itemId: string | null;
  description: string;
  qty: string;
  unitCost: string | null;
  totalCost: string | null;
  rawDescription: string | null;
  canonicalName: string | null;
  category: string | null;
  baseUnit: string | null;
  unitsPerPack: string | null;
  packsPerCase: string | null;
  totalBaseUnits: string | null;
  unitCostBase: string | null;
  confidence: string | null;
  matchStatus: string | null;
}

export interface MenuItemInventory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  inventoryItemId: string;
  qtyPerServing: string;
  unit: string;
  inventoryItem?: InventoryItem;
}

export interface SalesEntry {
  id: string;
  saleDate: string;
  notes: string | null;
  createdAt: string;
  lines?: SalesLine[];
}

export interface SalesLine {
  id: string;
  entryId: string;
  menuItemId: string;
  qtySold: number;
  menuItem?: MenuItemInventory;
}

export interface UsageRecord {
  id: string;
  usageDate: string;
  inventoryItemId: string;
  qtyConsumed: string;
  sourceEntryId: string | null;
  createdAt: string;
  inventoryItem?: InventoryItem;
}

export interface VendorItemPrice {
  id: string;
  vendorId: string;
  itemId: string;
  packDescription: string | null;
  packUnitCost: string | null;
  lastSeenDate: string | null;
}

// ── 4-Stage PO Pipeline Types ──

export interface ExtractedVendorInfo {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface ExtractedInvoiceMeta {
  invoiceNumber: string | null;
  date: string | null;
  dueDate: string | null;
  poReference: string | null;
}

export interface ExtractedLineItem {
  rawDescription: string;
  qty: number;
  unitAsPrinted: string;
  unitPrice: number;
  lineTotal: number;
  confidence: number;
}

export interface ExtractedTotals {
  subtotal: number | null;
  freight: number | null;
  tax: number | null;
  total: number;
}

export interface DocumentExtractionResult {
  vendor: ExtractedVendorInfo;
  invoice: ExtractedInvoiceMeta;
  lineItems: ExtractedLineItem[];
  totals: ExtractedTotals;
  overallConfidence: number;
  rawDocUrl?: string | null;
  rawDocS3Key?: string | null;
}

export interface NormalizedLineItem {
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
  // Carry forward from extraction
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface NormalizeResult {
  items: NormalizedLineItem[];
}

export interface VendorMatchCandidate {
  vendorId: string;
  vendorName: string;
  confidence: number;
  matchLevel: "green" | "amber" | "red";
}

export interface VendorMatchResult {
  candidates: VendorMatchCandidate[];
  extractedName: string;
}

export interface SalesParsed {
  items: Array<{
    menuItemName: string;
    qty: number;
    menuItemId?: string;
  }>;
}

export interface InventoryDashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalVendors: number;
  pendingPOs: number;
  totalPOValue: string;
  recentActivity: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}
