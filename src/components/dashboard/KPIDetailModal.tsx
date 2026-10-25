import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  ShoppingCart, 
  Scissors, 
  Warehouse, 
  Shirt, 
  Download, 
  Building2, 
  Calendar, 
  MapPin
} from 'lucide-react';
import type { Item, ItemWithBalance, Transaction, UniformStock } from '../../types';

export type KPIType = 'PURCHASED' | 'USED' | 'IN_STOCK' | 'SOLD';

interface KPIDetailModalProps {
  isOpen: boolean;
  type: KPIType | null;
  onClose: () => void;
  transactions: Transaction[];
  items: Item[];
  itemsWithBalance: ItemWithBalance[];
  uniforms: UniformStock[];
}

export const KPIDetailModal: React.FC<KPIDetailModalProps> = ({
  isOpen,
  type,
  onClose,
  transactions,
  items,
  itemsWithBalance,
  uniforms,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  React.useEffect(() => {
    setSearchQuery('');
    setCategoryFilter('All');
  }, [type, isOpen]);

  const itemMap = useMemo(() => {
    return new Map(items.map((i) => [i.id, i]));
  }, [items]);

  // 1. PURCHASED DATA
  const purchasedData = useMemo(() => {
    if (type !== 'PURCHASED') return [];
    return transactions
      .filter((t) => t.type === 'IN')
      .map((tx) => {
        const itm = itemMap.get(tx.itemId);
        return {
          id: tx.id,
          date: tx.date,
          itemName: itm?.name || 'Raw Material',
          quality: itm?.quality || '-',
          colour: itm?.colour || '-',
          school: itm?.school || 'General',
          category: itm?.category || 'Fabric',
          unit: itm?.unit || 'units',
          qty: tx.qty,
          rate: tx.rate,
          amount: tx.amount,
          supplier: tx.supplier || itm?.supplier || 'Unknown Supplier',
          rackLocation: itm?.rackLocation || 'Godown 1',
          note: tx.note || 'Purchase Stock In',
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [type, transactions, itemMap]);

  // 2. USED DATA
  const usedData = useMemo(() => {
    if (type !== 'USED') return [];
    return transactions
      .filter((t) => t.type === 'USED')
      .map((tx) => {
        const itm = itemMap.get(tx.itemId);
        return {
          id: tx.id,
          date: tx.date,
          itemName: itm?.name || 'Raw Material',
          quality: itm?.quality || '-',
          colour: itm?.colour || '-',
          school: itm?.school || 'General',
          category: itm?.category || 'Fabric',
          unit: itm?.unit || 'units',
          qty: tx.qty,
          rate: tx.rate,
          amount: tx.amount,
          note: tx.note || 'Cutting & Production Issue',
          rackLocation: itm?.rackLocation || 'Godown 1',
          supplier: itm?.supplier || 'N/A',
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [type, transactions, itemMap]);

  // 3. IN STOCK DATA
  const inStockData = useMemo(() => {
    if (type !== 'IN_STOCK') return [];
    return itemsWithBalance.map((rec) => ({
      id: rec.item.id,
      itemName: rec.item.name,
      quality: rec.item.quality,
      colour: rec.item.colour,
      school: rec.item.school,
      category: rec.item.category,
      unit: rec.item.unit,
      remaining: rec.remaining,
      totalIn: rec.totalIn,
      totalUsed: rec.totalUsed,
      minLevel: rec.item.minLevel,
      rackLocation: rec.item.rackLocation,
      supplier: rec.item.supplier,
      rate: rec.item.rate,
      stockValue: rec.stockValue,
      isLowStock: rec.isLowStock,
    }));
  }, [type, itemsWithBalance]);

  // 4. SOLD DATA
  const soldData = useMemo(() => {
    if (type !== 'SOLD') return [];
    return uniforms.map((u) => ({
      id: u.id,
      product: u.product,
      school: u.school,
      size: u.size,
      produced: u.produced,
      sold: u.sold,
      remaining: u.produced - u.sold,
      rate: u.rate,
      revenue: u.sold * u.rate,
      destination: u.school.includes('Beaconhouse') ? 'School Direct & Outlet' : 'Factory Outlet',
    }));
  }, [type, uniforms]);

  // Filtered rows
  const filteredPurchased = useMemo(() => {
    return purchasedData.filter((r) => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.itemName.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q) ||
          r.quality.toLowerCase().includes(q) ||
          r.colour.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q) ||
          r.date.includes(q) ||
          r.rackLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [purchasedData, categoryFilter, searchQuery]);

  const filteredUsed = useMemo(() => {
    return usedData.filter((r) => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.itemName.toLowerCase().includes(q) ||
          r.note.toLowerCase().includes(q) ||
          r.quality.toLowerCase().includes(q) ||
          r.colour.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q) ||
          r.date.includes(q)
        );
      }
      return true;
    });
  }, [usedData, categoryFilter, searchQuery]);

  const filteredInStock = useMemo(() => {
    return inStockData.filter((r) => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.itemName.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q) ||
          r.quality.toLowerCase().includes(q) ||
          r.colour.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q) ||
          r.rackLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inStockData, categoryFilter, searchQuery]);

  const filteredSold = useMemo(() => {
    return soldData.filter((r) => {
      if (categoryFilter !== 'All' && r.school !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.product.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q) ||
          r.size.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [soldData, categoryFilter, searchQuery]);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = 'UniStock_Report.csv';

    if (type === 'PURCHASED') {
      filename = 'UniStock_Purchased_Items_Detail.csv';
      headers = ['Date', 'Item Name', 'Quality', 'Colour', 'Category', 'Target School', 'Supplier Company', 'Quantity', 'Unit', 'Rate (PKR)', 'Total Amount (PKR)', 'Location'];
      rows = filteredPurchased.map((r) => [
        r.date,
        `"${r.itemName.replace(/"/g, '""')}"`,
        r.quality,
        r.colour,
        r.category,
        r.school,
        `"${r.supplier.replace(/"/g, '""')}"`,
        r.qty,
        r.unit,
        r.rate,
        r.amount,
        r.rackLocation,
      ]);
    } else if (type === 'USED') {
      filename = 'UniStock_Used_Items_Detail.csv';
      headers = ['Date', 'Item Name', 'Quality', 'Colour', 'Category', 'Quantity Used', 'Unit', 'Purpose Note', 'Rate (PKR)', 'Cost Value (PKR)'];
      rows = filteredUsed.map((r) => [
        r.date,
        `"${r.itemName.replace(/"/g, '""')}"`,
        r.quality,
        r.colour,
        r.category,
        r.qty,
        r.unit,
        `"${r.note.replace(/"/g, '""')}"`,
        r.rate,
        r.amount,
      ]);
    } else if (type === 'IN_STOCK') {
      filename = 'UniStock_InStock_Items_Detail.csv';
      headers = ['Item Name', 'Quality', 'Colour', 'Category', 'Target School', 'Remaining In Stock', 'Unit', 'Godown Rack', 'Supplier Company', 'Rate (PKR)', 'Stock Value (PKR)', 'Status'];
      rows = filteredInStock.map((r) => [
        `"${r.itemName.replace(/"/g, '""')}"`,
        r.quality,
        r.colour,
        r.category,
        r.school,
        r.remaining,
        r.unit,
        r.rackLocation,
        `"${r.supplier.replace(/"/g, '""')}"`,
        r.rate,
        r.stockValue,
        r.isLowStock ? 'LOW STOCK' : 'HEALTHY',
      ]);
    } else if (type === 'SOLD') {
      filename = 'UniStock_Uniforms_Sold_Detail.csv';
      headers = ['Product', 'School', 'Size', 'Pieces Produced', 'Pieces Sold', 'Remaining In Factory', 'Sale Rate (PKR)', 'Revenue (PKR)', 'Destination'];
      rows = filteredSold.map((r) => [
        `"${r.product.replace(/"/g, '""')}"`,
        `"${r.school.replace(/"/g, '""')}"`,
        r.size,
        r.produced,
        r.sold,
        r.remaining,
        r.rate,
        r.revenue,
        r.destination,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className={`p-6 text-white shrink-0 flex items-center justify-between ${
          type === 'PURCHASED'
            ? 'bg-teal-700'
            : type === 'USED'
            ? 'bg-amber-700'
            : type === 'IN_STOCK'
            ? 'bg-slate-900'
            : 'bg-blue-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
              {type === 'PURCHASED' && <ShoppingCart className="w-6 h-6" />}
              {type === 'USED' && <Scissors className="w-6 h-6" />}
              {type === 'IN_STOCK' && <Warehouse className="w-6 h-6" />}
              {type === 'SOLD' && <Shirt className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight">
                  {type === 'PURCHASED' && 'Purchased Items Breakdown'}
                  {type === 'USED' && 'Used Items Breakdown'}
                  {type === 'IN_STOCK' && 'In-Stock Inventory Breakdown'}
                  {type === 'SOLD' && 'Uniforms Sold Breakdown'}
                </h2>
                <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-white/20">
                  {type === 'PURCHASED' && `${filteredPurchased.length} Purchases`}
                  {type === 'USED' && `${filteredUsed.length} Records`}
                  {type === 'IN_STOCK' && `${filteredInStock.length} Variants`}
                  {type === 'SOLD' && `${filteredSold.length} Garments`}
                </span>
              </div>
              <p className="text-sm text-white/90 mt-0.5">
                {type === 'PURCHASED' && 'Which item was bought, quantity, date, unit rate, and supplier company'}
                {type === 'USED' && 'Which item was used, quantity, date, purpose, and cost value'}
                {type === 'IN_STOCK' && 'All available items in stock with balances, rack location, and supplier'}
                {type === 'SOLD' && 'Finished garments sold and dispatched by school and size'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={
                type === 'PURCHASED'
                  ? 'Search by item, company, date...'
                  : type === 'USED'
                  ? 'Search by item, purpose, date...'
                  : type === 'IN_STOCK'
                  ? 'Search by item, supplier, rack...'
                  : 'Search by product, school, size...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(type === 'SOLD'
                ? ['All', 'Beaconhouse School System', 'City Grammar School', 'Army Public School']
                : ['All', 'Fabric', 'Buttons', 'Sewing Thread', 'Other']
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'All' ? 'All' : cat.length > 15 ? cat.slice(0, 12) + '...' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              title="Download CSV"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* PURCHASED BREAKDOWN */}
          {type === 'PURCHASED' && (
            <div>
              {filteredPurchased.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-base font-medium">
                  No purchase records found matching your search.
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Item & Variant</th>
                          <th className="py-3.5 px-4">Supplier Company</th>
                          <th className="py-3.5 px-3 text-right">Quantity</th>
                          <th className="py-3.5 px-3 text-right">Rate</th>
                          <th className="py-3.5 px-4 text-right">Total Amount</th>
                          <th className="py-3.5 px-4">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredPurchased.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                                <span>{row.date}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{row.itemName}</div>
                              <div className="text-sm text-slate-500">
                                {row.quality} • {row.colour}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>{row.supplier}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-700 text-base">
                              +{row.qty.toLocaleString()} <span className="text-sm font-normal text-slate-500">{row.unit}</span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                              Rs. {row.rate.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-base">
                              Rs. {row.amount.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-sm whitespace-nowrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-teal-600" />
                                {row.rackLocation}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {filteredPurchased.map((row) => (
                      <div key={row.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-base text-slate-900">{row.itemName}</div>
                            <div className="text-sm text-slate-500">{row.quality} • {row.colour}</div>
                          </div>
                          <span className="font-mono font-bold text-sm text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                            +{row.qty.toLocaleString()} {row.unit}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm py-1.5 border-y border-slate-200">
                          <div>
                            <span className="text-slate-500 block font-medium">Supplier</span>
                            <strong className="text-slate-800">{row.supplier}</strong>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 block font-medium">Date</span>
                            <span className="font-mono text-slate-700">{row.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm pt-1">
                          <span className="text-slate-500">Rate: Rs. {row.rate}/{row.unit}</span>
                          <span className="font-mono font-bold text-slate-900 text-base">
                            Total: Rs. {row.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* USED BREAKDOWN */}
          {type === 'USED' && (
            <div>
              {filteredUsed.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-base font-medium">
                  No usage records found matching your search.
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Item & Variant</th>
                          <th className="py-3.5 px-5">Purpose / Cutting Note</th>
                          <th className="py-3.5 px-3 text-right">Quantity Used</th>
                          <th className="py-3.5 px-3 text-right">Rate</th>
                          <th className="py-3.5 px-4 text-right">Cost Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredUsed.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{row.date}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{row.itemName}</div>
                              <div className="text-sm text-slate-500">
                                {row.quality} • {row.colour}
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="font-semibold text-slate-800">{row.note}</div>
                              <div className="text-sm text-slate-500">From: {row.rackLocation}</div>
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-700 text-base">
                              -{row.qty.toLocaleString()} <span className="text-sm font-normal text-slate-500">{row.unit}</span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                              Rs. {row.rate.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-base">
                              Rs. {row.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {filteredUsed.map((row) => (
                      <div key={row.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-base text-slate-900">{row.itemName}</div>
                            <div className="text-sm text-slate-500">{row.quality} • {row.colour}</div>
                          </div>
                          <span className="font-mono font-bold text-sm text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            -{row.qty.toLocaleString()} {row.unit}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-sm">
                          <span className="text-slate-500 font-semibold block">Purpose & Note</span>
                          <span className="font-bold text-slate-900">{row.note}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm pt-1">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            {row.date}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-base">
                            Rs. {row.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* IN STOCK BREAKDOWN */}
          {type === 'IN_STOCK' && (
            <div>
              {filteredInStock.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-base font-medium">
                  No stock records found matching your search.
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                          <th className="py-3.5 px-4">Item & Variant</th>
                          <th className="py-3.5 px-4">Godown Location</th>
                          <th className="py-3.5 px-4">Supplier Company</th>
                          <th className="py-3.5 px-3 text-right">Bought</th>
                          <th className="py-3.5 px-3 text-right">Used</th>
                          <th className="py-3.5 px-3 text-right font-black text-teal-800">Remaining Balance</th>
                          <th className="py-3.5 px-3 text-right">Rate</th>
                          <th className="py-3.5 px-4 text-right">Stock Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredInStock.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-slate-900">{row.itemName}</div>
                                {row.isLowStock && (
                                  <span className="px-2 py-0.5 rounded-full text-sm font-bold bg-rose-100 text-rose-800">
                                    LOW
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-slate-500">
                                {row.quality} • {row.colour}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-teal-600" />
                                {row.rackLocation}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>{row.supplier}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                              {row.totalIn.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-amber-600">
                              {row.totalUsed.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 text-base">
                              {row.remaining.toLocaleString()} <span className="text-sm font-normal text-slate-500">{row.unit}</span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                              Rs. {row.rate.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-800 text-base">
                              Rs. {row.stockValue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {filteredInStock.map((row) => (
                      <div key={row.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-base text-slate-900">{row.itemName}</div>
                            <div className="text-sm text-slate-500">{row.quality} • {row.colour}</div>
                          </div>
                          <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${
                            row.isLowStock
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}>
                            {row.remaining.toLocaleString()} {row.unit}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm bg-white p-3 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-slate-500 font-medium block">Location</span>
                            <span className="font-bold text-slate-900">{row.rackLocation}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium block">Supplier</span>
                            <span className="font-bold text-slate-900 truncate block">{row.supplier}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm pt-1">
                          <span className="text-slate-500">Rate: Rs. {row.rate}/{row.unit}</span>
                          <span className="font-mono font-bold text-slate-900 text-base">
                            Value: Rs. {row.stockValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* SOLD BREAKDOWN */}
          {type === 'SOLD' && (
            <div>
              {filteredSold.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-base font-medium">
                  No uniform sales found matching your search.
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                          <th className="py-3.5 px-4">Uniform Product</th>
                          <th className="py-3.5 px-4">School</th>
                          <th className="py-3.5 px-3">Size</th>
                          <th className="py-3.5 px-4">Destination</th>
                          <th className="py-3.5 px-3 text-right">Produced</th>
                          <th className="py-3.5 px-3 text-right font-black text-blue-700">Sold</th>
                          <th className="py-3.5 px-3 text-right text-amber-700">Remaining</th>
                          <th className="py-3.5 px-3 text-right">Sale Rate</th>
                          <th className="py-3.5 px-4 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredSold.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {row.product}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-semibold">
                              {row.school}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                {row.size}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {row.destination}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                              {row.produced.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-700 text-base">
                              {row.sold.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-amber-700 font-bold">
                              {row.remaining.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                              Rs. {row.rate.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-base">
                              Rs. {row.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {filteredSold.map((row) => (
                      <div key={row.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-base text-slate-900">{row.product}</div>
                            <div className="text-sm text-teal-700 font-semibold">{row.school} (Size {row.size})</div>
                          </div>
                          <span className="font-mono font-bold text-sm text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            {row.sold.toLocaleString()} sold
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm bg-white p-3 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-slate-500 block font-medium">Destination</span>
                            <span className="font-semibold text-slate-800">{row.destination}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 block font-medium">Factory Remaining</span>
                            <span className="font-mono font-bold text-amber-700">{row.remaining} pcs</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm pt-1">
                          <span className="text-slate-500">Rate: Rs. {row.rate}/pc</span>
                          <span className="font-mono font-bold text-slate-900 text-base">
                            Revenue: Rs. {row.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER TOTALS */}
        <div className="p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="text-slate-300">
              Total Quantity:{' '}
              <strong className="text-teal-400 font-mono text-base">
                {type === 'PURCHASED' && filteredPurchased.reduce((s, r) => s + r.qty, 0).toLocaleString()}
                {type === 'USED' && filteredUsed.reduce((s, r) => s + r.qty, 0).toLocaleString()}
                {type === 'IN_STOCK' && filteredInStock.reduce((s, r) => s + r.remaining, 0).toLocaleString()}
                {type === 'SOLD' && filteredSold.reduce((s, r) => s + r.sold, 0).toLocaleString()}
              </strong>
            </span>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <span className="text-slate-300">
              Total Amount:{' '}
              <strong className="text-teal-300 font-mono text-base">
                Rs.{' '}
                {type === 'PURCHASED' && filteredPurchased.reduce((s, r) => s + r.amount, 0).toLocaleString()}
                {type === 'USED' && filteredUsed.reduce((s, r) => s + r.amount, 0).toLocaleString()}
                {type === 'IN_STOCK' && filteredInStock.reduce((s, r) => s + r.stockValue, 0).toLocaleString()}
                {type === 'SOLD' && filteredSold.reduce((s, r) => s + r.revenue, 0).toLocaleString()}
              </strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
