export type StationType = 'BARISTA' | 'KITCHEN';

export type UserRole = 'CASHIER' | 'MANAGER' | 'OWNER';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  pin: string; // 4-6 digit quick PIN
  isActive: boolean;
}

// ========================
// MENU & MODIFIERS
// ========================

export type ProductCategory = 
  | 'espresso_based'
  | 'manual_brew'
  | 'tea_mocktail'
  | 'milk_based'
  | 'food_pastry'
  | 'food_snack'
  | 'retail_beans';

export type TemperatureModifier = 'HOT' | 'ICE';
export type SweetnessModifier = '0%' | '50%' | '100%';
export type EspressoRatioModifier = 'SINGLE' | 'DOUBLE' | 'SPLIT';
export type MilkTypeModifier = 'FRESH_MILK' | 'OAT_MILK' | 'ALMOND_MILK' | 'NONE';

export interface SelectedModifiers {
  temperature?: TemperatureModifier;
  sweetness?: SweetnessModifier;
  espressoRatio?: EspressoRatioModifier;
  milkType?: MilkTypeModifier;
  extraNotes?: string;
  extraSyrupPump?: number;
  extraEspressoShot?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  targetStation: StationType; // FR-SO-05: Routing Barista vs Kitchen
  imageUrl?: string;
  description?: string;
  isAvailable: boolean;
  supportedModifiers: {
    temperature: boolean;
    sweetness: boolean;
    espressoRatio: boolean;
    milkType: boolean;
  };
  extraPrices?: {
    oatMilkSurcharge?: number;
    almondMilkSurcharge?: number;
    extraShotPrice?: number;
    extraSyrupPrice?: number;
  };
}

// ========================
// BOM & INVENTORY
// ========================

export type UnitOfMeasure = 'g' | 'ml' | 'pcs';

export interface Ingredient {
  id: string;
  name: string;
  unit: UnitOfMeasure;
  currentStock: number;
  minThreshold: number; // FR-SO-08: low-stock warning threshold
  costPerUnit: number; // HPP dasar per gram / ml / pcs
  category: 'coffee_beans' | 'dairy_milk' | 'syrup_flavor' | 'packaging' | 'other';
}

export interface RecipeRequirement {
  ingredientId: string;
  amount: number;
  unit: UnitOfMeasure;
  // Kondisi modifier tertentu, misalnya jika milkType === 'OAT_MILK', ganti susu biasa ke oat milk
  conditionRule?: 'DEFAULT' | 'IF_ICE' | 'IF_HOT' | 'IF_DOUBLE_SHOT' | 'IF_OAT' | 'IF_ALMOND';
}

export interface ProductRecipe {
  productId: string;
  ingredients: RecipeRequirement[];
}

export interface StockOpnameEntry {
  id: string;
  sessionId: string;
  ingredientId: string;
  systemStock: number;
  physicalStock: number;
  variance: number; // physicalStock - systemStock
  variancePercentage: number;
  notes?: string;
  recordedAt: string;
}

// ========================
// ORDER & TRANSACTIONS
// ========================

export type OrderStatus = 'DRAFT' | 'OPEN_TAB' | 'PAID' | 'CANCELLED' | 'VOIDED';

export type KdsItemStatus = 'QUEUED' | 'BREWING' | 'READY' | 'SERVED';

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  modifiers: SelectedModifiers;
  targetStation: StationType;
  kdsStatus: KdsItemStatus;
  calculatedCogs: number; // Total HPP riil bahan untuk item ini
}

export type PaymentMethod = 
  | 'CASH'
  | 'EDC_DEBIT'
  | 'EDC_CREDIT'
  | 'QRIS_DYNAMIC'
  | 'COFFEE_PASS'
  | 'SPLIT';

export interface PaymentRecord {
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string; // nomor auth EDC atau ID QRIS
  cashReceived?: number;
  cashChange?: number;
}

export interface Order {
  id: string;
  orderNumber: string; // misal: #082
  dailySequence: number;
  type: 'DINE_IN' | 'TAKEAWAY';
  tableName?: string; // untuk Open Tab atau Dine In
  customerName?: string;
  customerId?: string; // WhatsApp CRM ID jika terdaftar
  cashierUserId: string;
  cashierName: string;
  items: OrderLineItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  totalCogs: number; // Total HPP pesanan
  margin: number; // totalAmount - totalCogs
  status: OrderStatus;
  payments: PaymentRecord[];
  createdAt: string;
  paidAt?: string;
  notes?: string;
  syncedToCloud: boolean;
}

// ========================
// CRM & RETENTION
// ========================

export interface CustomerProfile {
  id: string;
  phoneNumber: string; // WhatsApp number: format 628xxxxxxxx
  name: string;
  email?: string;
  stampBalance: number; // 0 to 7 (FR-SO-11: Buy 7 Get 1 Free)
  totalRewardsRedeemed: number;
  coffeePassBalance: number; // Sisa cup prepaid
  totalVisits: number;
  totalSpent: number;
  firstVisitAt: string;
  lastVisitAt: string;
  tags?: string[];
}

export interface StampLedgerEntry {
  id: string;
  customerId: string;
  orderId?: string;
  change: number; // +1 per cup or -7 when redeemed
  newBalance: number;
  description: string;
  createdAt: string;
}

export interface CoffeePassLedgerEntry {
  id: string;
  customerId: string;
  orderId?: string;
  change: number; // +10 on purchase, -1 on cup redemption
  newBalance: number;
  otpCode?: string;
  createdAt: string;
}

// ========================
// CASH BALANCE & RECONCILIATION
// ========================

export interface CashDrawerSession {
  id: string;
  cashierUserId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number; // Kas kasir awal
  systemCashSales: number; // Total penjualan tunai sistem
  systemExpectedCash: number; // openingFloat + systemCashSales - pettyCashOut + pettyCashIn
  actualCountedCash?: number; // Kas fisik saat hitung tutup laci
  variance?: number; // actualCountedCash - systemExpectedCash
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface PettyCashMutation {
  id: string;
  sessionId: string;
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
}

// ========================
// WEBSOCKET REAL-TIME EVENTS (LAN)
// ========================

export type WsEventType =
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'KDS_STATUS_CHANGED'
  | 'CUSTOMER_DISPLAY_UPDATE'
  | 'LOW_STOCK_ALERT'
  | 'CASH_DRAWER_OPENED';

export interface WsMessage<T = unknown> {
  event: WsEventType;
  payload: T;
  timestamp: string;
}

export * from './wkluhur-data';

