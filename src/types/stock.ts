export type StockMovementType = 
  | 'PURCHASE_IN'           // مال آمد (خریداری)
  | 'ISSUE_TO_PRODUCTION'   // کٹنگ / پروڈکشن جاری
  | 'ADJUSTMENT'            // کٹوتی / ضیاع / درستگی
  | 'PRODUCTION_IN'         // تیار شدہ یونیفارم آمد
  | 'DISPATCH_OUT'          // روانگی برائے سکول یا آؤٹ لیٹ
  | 'RETURN_IN';            // واپسی مال

export type RawCategory = 'Fabric' | 'Buttons' | 'Thread' | 'Others';

export interface RawMaterialVariant {
  id: string;
  category: RawCategory;
  name: string;
  nameUrdu: string;
  fabricQuality?: 'Cotton Poplin' | 'Gabardine' | 'Wash & Wear' | 'Oxford Cotton';
  colour: string;
  school: string; // 'Beaconhouse School' | 'City Grammar School' | 'Army Public School' | 'General'
  unit: 'meters' | 'pieces' | 'cones' | 'zippers' | 'rolls' | 'packets';
  rackLocation: string; // e.g. "Godown 1, Rack B-2"
  minStockLevel: number;
  suppliers: string[];
  notes?: string;
}

export type UniformProduct = 
  | 'Boys Shirt' 
  | 'Girls Shirt' 
  | 'Trouser' 
  | 'Skirt' 
  | 'Tie' 
  | 'Sweater' 
  | 'Blazer';

export const UNIFORM_SIZES = ['24', '26', '28', '30', '32', '34', '36', '38', '40'] as const;
export type UniformSize = typeof UNIFORM_SIZES[number];

export const SCHOOL_LIST = [
  'Beaconhouse School System',
  'City Grammar School',
  'Army Public School (APS)',
  'General Uniforms'
] as const;

export const DESTINATIONS = [
  'Beaconhouse School (Main Campus)',
  'City Grammar School (North Campus)',
  'Army Public School (Cantt)',
  'Factory Outlet (Dharampura)'
] as const;

export interface StockLedgerEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  time?: string;
  type: StockMovementType;
  itemCategory: 'RAW_MATERIAL' | 'FINISHED_UNIFORM';
  itemId: string; // references RawMaterialVariant id or FinishedUniform key
  itemName: string;
  qty: number; // positive number; type determines if it increases or decreases balance
  rate: number; // in PKR
  value: number; // qty * rate
  fromLocation: string;
  toLocation: string;
  party: string; // Supplier name, Cutting master, School, Driver, etc.
  reference: string; // Invoice #, Challan #, Job Card #, etc.
  notes?: string;
  // Finished uniform specific attributes:
  school?: string;
  product?: UniformProduct;
  size?: UniformSize;
  // Specific for adjustments:
  reason?: 'Damaged in transit' | 'Cutting wastage' | 'Shrinkage loss' | 'Physical count mismatch' | 'Defective lot' | 'Sample used';
  invoicePhotoUrl?: string;
  driverNote?: string;
  cuttingMaster?: string;
}

export interface Supplier {
  id: string;
  name: string;
  nameUrdu: string;
  phone: string;
  city: string;
  category: string;
  openingBalanceDue: number; // PKR
  address: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  amount: number;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque';
  reference: string;
  notes?: string;
}

export interface ChallanRecord {
  id: string;
  challanNumber: string;
  date: string;
  destination: string;
  school: string;
  driverName: string;
  vehicleNumber: string;
  items: {
    product: UniformProduct;
    size: UniformSize;
    qty: number;
    unitPrice?: number;
  }[];
  totalPieces: number;
  receivedBy?: string;
  notes?: string;
}

export interface ItemCalculatedBalance {
  variant: RawMaterialVariant;
  currentBalance: number;
  weightedAvgRate: number;
  stockValue: number;
  totalPurchased: number;
  totalIssued: number;
  totalAdjusted: number;
  isLowStock: boolean;
  lastPurchaseDate?: string;
  lastIssueDate?: string;
}
