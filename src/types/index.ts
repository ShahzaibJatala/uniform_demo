export type ItemCategory = 'Fabric' | 'Buttons' | 'Sewing Thread' | 'Other';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  quality: string; // e.g. "Cotton Poplin", "Gabardine", "Wash & Wear"
  colour: string;
  school: string; // e.g. "Beaconhouse School System", "City Grammar School", "Army Public School", "General"
  supplier: string;
  unit: 'meters' | 'pieces' | 'cones';
  rate: number; // PKR per unit
  rackLocation: string; // e.g. "Godown 1, Rack B-2"
  minLevel: number; // Low stock threshold
}

export interface Transaction {
  id: string;
  date: string; // "YYYY-MM-DD"
  itemId: string;
  type: 'IN' | 'USED';
  qty: number;
  rate: number;
  amount: number; // qty * rate
  supplier?: string;
  note?: string; // e.g. "Class 5 boys shirts"
}

export interface UniformStock {
  id: string;
  product: string; // "Boys Shirt", "Girls Shirt", "Trouser", "Skirt", "Tie", "Sweater", "Blazer"
  school: string;
  size: string; // "26", "28", "30", "32", "34", "36", "38"
  produced: number;
  sold: number;
  rate: number; // Sale price in PKR
}

export interface ItemWithBalance {
  item: Item;
  totalIn: number;
  totalUsed: number;
  remaining: number;
  stockValue: number;
  isLowStock: boolean;
}

export interface CategorySummary {
  category: ItemCategory;
  categoryUrdu: string;
  boughtQty: number;
  boughtRs: number;
  usedQty: number;
  usedRs: number;
  remainingQty: number;
  remainingRs: number;
  usedPercent: number;
  unit: string;
}

export interface DailyItemRow {
  itemId: string;
  name: string;
  category: ItemCategory;
  unit: string;
  rate: number;
  opening: number;
  came: number;
  used: number;
  closing: number;
  value: number;
}
