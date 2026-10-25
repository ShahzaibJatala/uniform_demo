import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  Item,
  Transaction,
  UniformStock,
  ItemWithBalance,
  CategorySummary,
  DailyItemRow,
  ItemCategory,
} from '../types';
import {
  INITIAL_ITEMS,
  INITIAL_TRANSACTIONS,
  INITIAL_UNIFORMS,
} from '../data/seedData';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  urduSubtitle?: string;
}

interface StockContextType {
  items: Item[];
  transactions: Transaction[];
  uniforms: UniformStock[];
  itemsWithBalance: ItemWithBalance[];
  itemMap: Map<string, ItemWithBalance>;
  
  // Dashboard Metrics
  kpis: {
    totalPurchasedQty: number;
    totalPurchasedRs: number;
    totalUsedQty: number;
    totalUsedRs: number;
    totalRemainingQty: number;
    remainingStockValueRs: number;
    uniformsSoldRs: number;
    totalUniformsProduced: number;
    totalUniformsSold: number;
    totalUniformsRemaining: number;
    totalItemsCount: number;
  };
  
  categorySummaries: CategorySummary[];
  lowStockItems: ItemWithBalance[];
  recentTransactions: (Transaction & { itemName: string; itemUnit: string })[];

  // Daily check & balance selector
  getDailyData: (selectedDate: string) => {
    rows: DailyItemRow[];
    totals: {
      opening: number;
      came: number;
      used: number;
      closing: number;
      value: number;
      isBalanced: boolean;
    };
  };

  // Actions
  addItem: (itemData: Omit<Item, 'id'>) => string;
  updateItem: (id: string, updates: Partial<Item>) => void;
  addTransaction: (data: {
    date: string;
    itemId: string;
    type: 'IN' | 'USED';
    qty: number;
    rate: number;
    supplier?: string;
    note?: string;
  }) => { success: boolean; message: string; error?: string };

  addUniformProduction: (data: {
    product: string;
    school: string;
    size: string;
    quantity: number;
    rate?: number;
  }) => void;

  addUniformSale: (data: {
    uniformId: string;
    quantity: number;
    amount?: number;
    destination?: string;
  }) => { success: boolean; message: string; error?: string };

  resetDemoData: () => void;

  // Toasts
  toasts: ToastNotification[];
  showToast: (title: string, message: string, type?: ToastNotification['type'], urduSubtitle?: string) => void;
  removeToast: (id: string) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ITEMS: 'unistock_items_v3',
  TRANSACTIONS: 'unistock_tx_v3',
  UNIFORMS: 'unistock_uniforms_v3',
};

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [uniforms, setUniforms] = useState<UniformStock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNIFORMS);
      return saved ? JSON.parse(saved) : INITIAL_UNIFORMS;
    } catch {
      return INITIAL_UNIFORMS;
    }
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIFORMS, JSON.stringify(uniforms));
  }, [uniforms]);

  const showToast = (
    title: string,
    message: string,
    type: ToastNotification['type'] = 'success',
    urduSubtitle?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastNotification = { id, title, message, type, urduSubtitle };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // -------------------------------------------------------------
  // CORE CALCULATION: ITEMS WITH BALANCE
  // Balance = total IN minus total USED, always calculated!
  // -------------------------------------------------------------
  const { itemsWithBalance, itemMap } = useMemo(() => {
    const map = new Map<string, ItemWithBalance>();

    // Initial state per item
    items.forEach((item) => {
      map.set(item.id, {
        item,
        totalIn: 0,
        totalUsed: 0,
        remaining: 0,
        stockValue: 0,
        isLowStock: false,
      });
    });

    // Replay transactions
    transactions.forEach((tx) => {
      const rec = map.get(tx.itemId);
      if (rec) {
        if (tx.type === 'IN') {
          rec.totalIn += tx.qty;
        } else if (tx.type === 'USED') {
          rec.totalUsed += tx.qty;
        }
      }
    });

    // Finalize remaining balance and value
    const list: ItemWithBalance[] = [];
    map.forEach((rec) => {
      rec.remaining = Math.max(0, rec.totalIn - rec.totalUsed);
      rec.stockValue = rec.remaining * rec.item.rate;
      rec.isLowStock = rec.remaining <= rec.item.minLevel;
      list.push(rec);
    });

    return { itemsWithBalance: list, itemMap: map };
  }, [items, transactions]);

  // -------------------------------------------------------------
  // DASHBOARD KPIS
  // -------------------------------------------------------------
  const kpis = useMemo(() => {
    let totalPurchasedRs = 0;
    let totalUsedRs = 0;
    let totalPurchasedQty = 0;
    let totalUsedQty = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'IN') {
        totalPurchasedRs += tx.amount;
        totalPurchasedQty += tx.qty;
      } else if (tx.type === 'USED') {
        totalUsedRs += tx.amount;
        totalUsedQty += tx.qty;
      }
    });

    const totalRemainingQty = itemsWithBalance.reduce((sum, item) => sum + item.remaining, 0);
    const remainingStockValueRs = itemsWithBalance.reduce((sum, item) => sum + item.stockValue, 0);

    let totalUniformsProduced = 0;
    let totalUniformsSold = 0;
    let uniformsSoldRs = 0;

    uniforms.forEach((u) => {
      totalUniformsProduced += u.produced;
      totalUniformsSold += u.sold;
      uniformsSoldRs += u.sold * u.rate;
    });

    const totalUniformsRemaining = totalUniformsProduced - totalUniformsSold;

    return {
      totalPurchasedQty,
      totalPurchasedRs,
      totalUsedQty,
      totalUsedRs,
      totalRemainingQty,
      remainingStockValueRs,
      uniformsSoldRs,
      totalUniformsProduced,
      totalUniformsSold,
      totalUniformsRemaining,
      totalItemsCount: items.length,
    };
  }, [transactions, itemsWithBalance, uniforms, items]);

  // -------------------------------------------------------------
  // CATEGORY SUMMARIES (Fabric, Buttons, Sewing Thread, Other)
  // -------------------------------------------------------------
  const categorySummaries = useMemo((): CategorySummary[] => {
    const cats: { key: ItemCategory; urdu: string; unit: string }[] = [
      { key: 'Fabric', urdu: 'کپڑا', unit: 'meters' },
      { key: 'Buttons', urdu: 'بٹن', unit: 'pieces' },
      { key: 'Sewing Thread', urdu: 'سلائی دھاگہ', unit: 'cones' },
      { key: 'Other', urdu: 'دیگر سامان', unit: 'pieces' },
    ];

    return cats.map(({ key, urdu, unit }) => {
      const catItems = itemsWithBalance.filter((i) => i.item.category === key);
      const boughtQty = catItems.reduce((sum, i) => sum + i.totalIn, 0);
      const usedQty = catItems.reduce((sum, i) => sum + i.totalUsed, 0);
      const remainingQty = catItems.reduce((sum, i) => sum + i.remaining, 0);

      // Amount bought and used in this category
      let boughtRs = 0;
      let usedRs = 0;

      const itemIds = new Set(catItems.map((i) => i.item.id));
      transactions.forEach((tx) => {
        if (itemIds.has(tx.itemId)) {
          if (tx.type === 'IN') boughtRs += tx.amount;
          if (tx.type === 'USED') usedRs += tx.amount;
        }
      });

      const remainingRs = catItems.reduce((sum, i) => sum + i.stockValue, 0);
      const usedPercent = boughtQty > 0 ? Math.min(100, Math.round((usedQty / boughtQty) * 100)) : 0;

      return {
        category: key,
        categoryUrdu: urdu,
        boughtQty,
        boughtRs,
        usedQty,
        usedRs,
        remainingQty,
        remainingRs,
        usedPercent,
        unit,
      };
    });
  }, [itemsWithBalance, transactions]);

  // -------------------------------------------------------------
  // LOW STOCK ITEMS
  // -------------------------------------------------------------
  const lowStockItems = useMemo(() => {
    return itemsWithBalance.filter((i) => i.isLowStock);
  }, [itemsWithBalance]);

  // -------------------------------------------------------------
  // RECENT TRANSACTIONS LIST
  // -------------------------------------------------------------
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .slice(0, 8)
      .map((tx) => {
        const item = items.find((i) => i.id === tx.itemId);
        return {
          ...tx,
          itemName: item?.name || 'Item',
          itemUnit: item?.unit || 'units',
        };
      });
  }, [transactions, items]);

  // -------------------------------------------------------------
  // SCREEN 2: DAILY CHECK & BALANCE GENERATOR
  // Computes exact Opening, Came (IN), Used, Closing, and Value
  // -------------------------------------------------------------
  const getDailyData = (selectedDate: string) => {
    const rows: DailyItemRow[] = items.map((item) => {
      let opening = 0;
      let came = 0;
      let used = 0;

      transactions.forEach((tx) => {
        if (tx.itemId === item.id) {
          if (tx.date < selectedDate) {
            if (tx.type === 'IN') opening += tx.qty;
            if (tx.type === 'USED') opening -= tx.qty;
          } else if (tx.date === selectedDate) {
            if (tx.type === 'IN') came += tx.qty;
            if (tx.type === 'USED') used += tx.qty;
          }
        }
      });

      const safeOpening = Math.max(0, opening);
      const closing = Math.max(0, safeOpening + came - used);
      const value = closing * item.rate;

      return {
        itemId: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        rate: item.rate,
        opening: safeOpening,
        came,
        used,
        closing,
        value,
      };
    });

    const totalOpening = rows.reduce((s, r) => s + r.opening, 0);
    const totalCame = rows.reduce((s, r) => s + r.came, 0);
    const totalUsed = rows.reduce((s, r) => s + r.used, 0);
    const totalClosing = rows.reduce((s, r) => s + r.closing, 0);
    const totalValue = rows.reduce((s, r) => s + r.value, 0);

    const isBalanced = totalOpening + totalCame - totalUsed === totalClosing;

    return {
      rows,
      totals: {
        opening: totalOpening,
        came: totalCame,
        used: totalUsed,
        closing: totalClosing,
        value: totalValue,
        isBalanced,
      },
    };
  };

  // -------------------------------------------------------------
  // ACTION: ADD TRANSACTION (IN / USED)
  // Blocks over-usage if type === 'USED'!
  // -------------------------------------------------------------
  const addTransaction = (data: {
    date: string;
    itemId: string;
    type: 'IN' | 'USED';
    qty: number;
    rate: number;
    supplier?: string;
    note?: string;
  }) => {
    const itemRec = itemMap.get(data.itemId);
    if (!itemRec) {
      return { success: false, message: 'Item not found', error: 'Item not found' };
    }

    if (data.qty <= 0) {
      return { success: false, message: 'Quantity must be greater than zero', error: 'Invalid quantity' };
    }

    // STRICT CHECK: Block if quantity used > available balance!
    if (data.type === 'USED') {
      if (data.qty > itemRec.remaining) {
        const errorMsg = `Insufficient Stock! You entered ${data.qty} ${itemRec.item.unit}, but only ${itemRec.remaining} ${itemRec.item.unit} are available in ${itemRec.item.rackLocation}.`;
        showToast('Insufficient Balance', errorMsg, 'error');
        return { success: false, message: errorMsg, error: 'Insufficient stock' };
      }
    }

    const amount = data.qty * data.rate;
    const newTx: Transaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      date: data.date,
      itemId: data.itemId,
      type: data.type,
      qty: data.qty,
      rate: data.rate,
      amount,
      supplier: data.supplier || itemRec.item.supplier,
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update item rate if IN and rate changed
    if (data.type === 'IN' && data.rate !== itemRec.item.rate) {
      setItems((prev) =>
        prev.map((i) => (i.id === data.itemId ? { ...i, rate: data.rate } : i))
      );
    }

    if (data.type === 'IN') {
      showToast(
        'Stock In Saved',
        `Added ${data.qty.toLocaleString()} ${itemRec.item.unit} of ${itemRec.item.name} (Rs. ${amount.toLocaleString()}).`,
        'success'
      );
    } else {
      showToast(
        'Item Used Saved',
        `Used ${data.qty.toLocaleString()} ${itemRec.item.unit} of ${itemRec.item.name}. Remaining: ${(itemRec.remaining - data.qty).toLocaleString()} ${itemRec.item.unit}.`,
        'info'
      );
    }

    return { success: true, message: 'Transaction recorded successfully' };
  };

  // -------------------------------------------------------------
  // ACTION: ADD ITEM
  // -------------------------------------------------------------
  const addItem = (itemData: Omit<Item, 'id'>) => {
    const id = `ITEM-${Date.now().toString().slice(-4)}`;
    const newItem: Item = { ...itemData, id };

    setItems((prev) => [...prev, newItem]);

    showToast(
      'New Item Added',
      `Registered "${itemData.name}" (${itemData.category}) in ${itemData.rackLocation}.`,
      'success'
    );

    return id;
  };

  // -------------------------------------------------------------
  // ACTION: UPDATE ITEM
  // -------------------------------------------------------------
  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    showToast('Item Updated', 'Item details updated successfully.', 'success');
  };

  // -------------------------------------------------------------
  // ACTION: UNIFORM PRODUCTION
  // -------------------------------------------------------------
  const addUniformProduction = (data: {
    product: string;
    school: string;
    size: string;
    quantity: number;
    rate?: number;
  }) => {
    const existing = uniforms.find(
      (u) => u.product === data.product && u.school === data.school && u.size === data.size
    );

    if (existing) {
      setUniforms((prev) =>
        prev.map((u) =>
          u.id === existing.id
            ? { ...u, produced: u.produced + data.quantity, rate: data.rate || u.rate }
            : u
        )
      );
    } else {
      const newUni: UniformStock = {
        id: `UNI-${Date.now().toString().slice(-4)}`,
        product: data.product,
        school: data.school,
        size: data.size,
        produced: data.quantity,
        sold: 0,
        rate: data.rate || 850,
      };
      setUniforms((prev) => [...prev, newUni]);
    }

    showToast(
      'Uniform Produced',
      `Added ${data.quantity} pcs of ${data.school} ${data.product} (Size ${data.size}) to stock.`,
      'success'
    );
  };

  // -------------------------------------------------------------
  // ACTION: UNIFORM SALE / DISPATCH
  // -------------------------------------------------------------
  const addUniformSale = (data: {
    uniformId: string;
    quantity: number;
    amount?: number;
    destination?: string;
  }) => {
    const uniform = uniforms.find((u) => u.id === data.uniformId);
    if (!uniform) {
      return { success: false, message: 'Uniform not found', error: 'Uniform not found' };
    }

    const available = uniform.produced - uniform.sold;
    if (data.quantity > available) {
      const errorMsg = `Over-dispatch blocked! Requested ${data.quantity} pcs, but only ${available} pcs in stock.`;
      showToast('Over-Dispatch Blocked', errorMsg, 'error');
      return { success: false, message: errorMsg, error: 'Over-dispatch' };
    }

    setUniforms((prev) =>
      prev.map((u) => (u.id === uniform.id ? { ...u, sold: u.sold + data.quantity } : u))
    );

    showToast(
      'Sale Dispatched',
      `Dispatched ${data.quantity} pcs of ${uniform.school} ${uniform.product} (Size ${uniform.size}) to ${data.destination || 'School'}.`,
      'success'
    );

    return { success: true, message: 'Dispatched successfully' };
  };

  // -------------------------------------------------------------
  // ACTION: RESET DEMO DATA
  // -------------------------------------------------------------
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.UNIFORMS);

    setItems(INITIAL_ITEMS);
    setTransactions(INITIAL_TRANSACTIONS);
    setUniforms(INITIAL_UNIFORMS);

    showToast(
      'Demo Reset Complete',
      'Initial 15 items, 14 days of history, and uniform stock restored.',
      'info'
    );
  };

  return (
    <StockContext.Provider
      value={{
        items,
        transactions,
        uniforms,
        itemsWithBalance,
        itemMap,
        kpis,
        categorySummaries,
        lowStockItems,
        recentTransactions,
        getDailyData,
        addItem,
        updateItem,
        addTransaction,
        addUniformProduction,
        addUniformSale,
        resetDemoData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
