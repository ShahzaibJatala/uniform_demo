import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  Download, 
  Printer, 
  PlusCircle, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import type { ItemCategory } from '../types';

export const DailyCheckPage: React.FC = () => {
  const { 
    items, 
    itemsWithBalance, 
    getDailyData, 
    addTransaction, 
    addItem, 
    transactions 
  } = useStock();

  // Selected Date - default today in demo
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-25');

  // FORM 1: ITEM CAME (IN)
  const [cameItemId, setCameItemId] = useState<string>(items[0]?.id || '');
  const [cameQty, setCameQty] = useState<string>('');
  const [cameRate, setCameRate] = useState<string>('');
  const [cameSupplier, setCameSupplier] = useState<string>('');
  const [showNewItemModal, setShowNewItemModal] = useState(false);

  // FORM 2: ITEM USED
  const [usedItemId, setUsedItemId] = useState<string>(items[0]?.id || '');
  const [usedQty, setUsedQty] = useState<string>('');
  const [usedNote, setUsedNote] = useState<string>('');
  const [usedError, setUsedError] = useState<string | null>(null);

  // New Item Quick Form Modal state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<ItemCategory>('Fabric');
  const [newItemQuality, setNewItemQuality] = useState('');
  const [newItemColour, setNewItemColour] = useState('');
  const [newItemSchool, setNewItemSchool] = useState('General');
  const [newItemSupplier, setNewItemSupplier] = useState('Faisal Textiles');
  const [newItemUnit, setNewItemUnit] = useState<'meters' | 'pieces' | 'cones'>('meters');
  const [newItemRate, setNewItemRate] = useState('450');
  const [newItemRack, setNewItemRack] = useState('Godown 1, Rack A');
  const [newItemMin, setNewItemMin] = useState('100');

  // Current selected items for details
  const selectedCameItem = useMemo(() => {
    return items.find((i) => i.id === cameItemId) || items[0];
  }, [items, cameItemId]);

  const selectedUsedItem = useMemo(() => {
    return itemsWithBalance.find((i) => i.item.id === usedItemId) || itemsWithBalance[0];
  }, [itemsWithBalance, usedItemId]);

  // Update default rate and supplier when cameItemId changes
  const handleCameItemSelect = (id: string) => {
    setCameItemId(id);
    const item = items.find((i) => i.id === id);
    if (item) {
      setCameRate(item.rate.toString());
      setCameSupplier(item.supplier);
    }
  };

  // Initialize came rate & supplier on first load if empty
  React.useEffect(() => {
    if (selectedCameItem && !cameRate) {
      setCameRate(selectedCameItem.rate.toString());
      setCameSupplier(selectedCameItem.supplier);
    }
  }, [selectedCameItem, cameRate]);

  // Calculate came total amount
  const cameTotalAmount = useMemo(() => {
    const q = parseFloat(cameQty) || 0;
    const r = parseFloat(cameRate) || (selectedCameItem?.rate ?? 0);
    return q * r;
  }, [cameQty, cameRate, selectedCameItem]);

  // Compute daily data for selected date
  const dailyData = useMemo(() => {
    return getDailyData(selectedDate);
  }, [getDailyData, selectedDate, transactions, items]);

  // Handle Save: Item Came (IN)
  const handleSaveCame = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(cameQty);
    const rate = parseFloat(cameRate);

    if (!cameItemId) return;
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }

    const res = addTransaction({
      date: selectedDate,
      itemId: cameItemId,
      type: 'IN',
      qty,
      rate: isNaN(rate) || rate <= 0 ? (selectedCameItem?.rate || 100) : rate,
      supplier: cameSupplier || selectedCameItem?.supplier,
      note: 'Stock In purchase received',
    });

    if (res.success) {
      setCameQty('');
    }
  };

  // Handle Save: Item Used
  const handleSaveUsed = (e: React.FormEvent) => {
    e.preventDefault();
    setUsedError(null);
    const qty = parseFloat(usedQty);

    if (!usedItemId) return;
    if (isNaN(qty) || qty <= 0) {
      setUsedError('Please enter a valid positive quantity.');
      return;
    }

    if (selectedUsedItem && qty > selectedUsedItem.remaining) {
      setUsedError(
        `Insufficient Stock! Available balance is ${selectedUsedItem.remaining.toLocaleString()} ${selectedUsedItem.item.unit}. You entered ${qty.toLocaleString()} ${selectedUsedItem.item.unit}.`
      );
      return;
    }

    const res = addTransaction({
      date: selectedDate,
      itemId: usedItemId,
      type: 'USED',
      qty,
      rate: selectedUsedItem?.item.rate || 0,
      note: usedNote.trim() || 'Issued for cutting and production',
    });

    if (res.success) {
      setUsedQty('');
      setUsedNote('');
      setUsedError(null);
    } else if (res.error) {
      setUsedError(res.message);
    }
  };

  // Quick Add Item Handler
  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newId = addItem({
      name: newItemName.trim(),
      category: newItemCat,
      quality: newItemQuality.trim() || 'Standard',
      colour: newItemColour.trim() || 'Standard',
      school: newItemSchool,
      supplier: newItemSupplier,
      unit: newItemUnit,
      rate: parseFloat(newItemRate) || 100,
      rackLocation: newItemRack.trim() || 'Godown 1',
      minLevel: parseFloat(newItemMin) || 50,
    });

    setCameItemId(newId);
    setCameRate(newItemRate);
    setCameSupplier(newItemSupplier);
    setShowNewItemModal(false);

    setNewItemName('');
    setNewItemQuality('');
    setNewItemColour('');
  };

  // Date step helper (previous / next day)
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Item Name', 'Category', 'Unit', 'Opening Balance', 'Came (IN)', 'Used', 'Closing Balance', 'Rate (PKR)', 'Stock Value (PKR)'];
    const rows = dailyData.rows.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      r.category,
      r.unit,
      r.opening,
      r.came,
      r.used,
      r.closing,
      r.rate,
      r.value,
    ]);

    rows.push([
      '"TOTALS"',
      '""',
      '""',
      dailyData.totals.opening,
      dailyData.totals.came,
      dailyData.totals.used,
      dailyData.totals.closing,
      '""',
      dailyData.totals.value,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UniStock_Daily_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 w-full">

      {/* TWO BIG ACTION CARDS SIDE BY SIDE (mobile: stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: ITEM CAME */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    Item Came
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">Record received raw material</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNewItemModal(true)}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-xl border border-teal-200 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Item</span>
              </button>
            </div>

            <form onSubmit={handleSaveCame} className="space-y-4">
              {/* Select Item */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Select Item
                </label>
                <select
                  value={cameItemId}
                  onChange={(e) => handleCameItemSelect(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-teal-500 outline-none transition-all"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit}) - {i.rackLocation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid: Quantity & Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Quantity ({selectedCameItem?.unit || 'units'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={cameQty}
                    onChange={(e) => setCameQty(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:bg-white focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Rate per Unit (Rs.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="Rate"
                    value={cameRate}
                    onChange={(e) => setCameRate(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:bg-white focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Supplier
                </label>
                <input
                  type="text"
                  placeholder="Supplier name"
                  value={cameSupplier}
                  onChange={(e) => setCameSupplier(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-teal-500 outline-none transition-all"
                />
              </div>

              {/* Auto Total Calculation Display */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Total Amount:</span>
                <span className="font-bold text-slate-900 font-mono text-base">
                  Rs. {cameTotalAmount.toLocaleString()}
                </span>
              </div>

              {/* Big Action Button with Urdu Subtitle */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-base shadow-sm transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Save Stock In</span>
                <span className="text-sm font-urdu font-normal opacity-90">مال آمد محفوظ کریں</span>
              </button>
            </form>
          </div>
        </div>

        {/* CARD 2: ITEM USED */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    Item Used
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">Issue raw stock for production</p>
                </div>
              </div>

              {selectedUsedItem && (
                <div className="text-right">
                  <div className="text-sm text-slate-500 font-medium">In Stock:</div>
                  <div className="text-sm font-bold font-mono text-teal-800">
                    {selectedUsedItem.remaining.toLocaleString()} {selectedUsedItem.item.unit}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveUsed} className="space-y-4">
              {/* Select Item */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Select Item
                </label>
                <select
                  value={usedItemId}
                  onChange={(e) => {
                    setUsedItemId(e.target.value);
                    setUsedError(null);
                  }}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-amber-500 outline-none transition-all"
                >
                  {itemsWithBalance.map((i) => (
                    <option key={i.item.id} value={i.item.id}>
                      {i.item.name} • Available: {i.remaining.toLocaleString()} {i.item.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Used */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Quantity Used ({selectedUsedItem?.item.unit || 'units'})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedUsedItem?.remaining || undefined}
                  step="any"
                  required
                  placeholder="e.g. 150"
                  value={usedQty}
                  onChange={(e) => {
                    setUsedQty(e.target.value);
                    setUsedError(null);
                  }}
                  className={`w-full text-sm bg-slate-50 border rounded-xl p-3 text-slate-900 font-semibold focus:bg-white outline-none transition-all ${
                    usedError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Note / Purpose */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Purpose / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 5 Boys Shirts cutting"
                  value={usedNote}
                  onChange={(e) => setUsedNote(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
                />
              </div>

              {/* Error Message if Over-issue */}
              {usedError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{usedError}</span>
                </div>
              )}

              {/* Info banner */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-500" />
                  Applied Rate: Rs. {selectedUsedItem?.item.rate || 0}/unit
                </span>
                <span className="font-mono font-bold text-slate-900 text-base">
                  Rs. {((parseFloat(usedQty) || 0) * (selectedUsedItem?.item.rate || 0)).toLocaleString()}
                </span>
              </div>

              {/* Big Action Button with Urdu Subtitle */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-base shadow-sm transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <span>Save Item Used</span>
                <span className="text-sm font-urdu font-normal opacity-90">استعمال محفوظ کریں</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* DAILY TABLE (Opening, Came, Used, Closing, Value) WITH DATE PICKER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        
        {/* Date Picker Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Daily Stock Ledger
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Balance check: Opening + Came − Used = Closing
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Picker Controls */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => shiftDate(-1)}
                className="p-2 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => shiftDate(1)}
                className="p-2 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate('2026-10-25')}
              className="px-3.5 py-2 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              Today
            </button>

            {/* Balanced Indicator */}
            {dailyData.totals.isBalanced && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-sm font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Balanced</span>
              </div>
            )}

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-sm font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Export CSV"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 text-sm font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Table on Tablet & Desktop */}
        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-sm">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4 text-right">Opening</th>
                <th className="py-3.5 px-4 text-right text-teal-700">Came</th>
                <th className="py-3.5 px-4 text-right text-amber-700">Used</th>
                <th className="py-3.5 px-4 text-right font-bold text-slate-900">Closing</th>
                <th className="py-3.5 px-4 text-right">Value (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {dailyData.rows.map((row) => (
                <tr key={row.itemId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    {row.opening.toLocaleString()} {row.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-teal-700 font-bold">
                    {row.came > 0 ? `+${row.came.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-700 font-bold">
                    {row.used > 0 ? `-${row.used.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {row.closing.toLocaleString()} {row.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    Rs. {row.value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-sm border-t-2 border-slate-800">
                <td className="py-4 px-4">TOTALS</td>
                <td className="py-4 px-4 text-right font-mono">
                  {dailyData.totals.opening.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-mono text-teal-400">
                  +{dailyData.totals.came.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-mono text-amber-400">
                  -{dailyData.totals.used.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-mono text-teal-300 font-black">
                  {dailyData.totals.closing.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right font-mono text-teal-300 font-black">
                  Rs. {dailyData.totals.value.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Stacked Cards (Phone: single-column cards, no horizontal scroll) */}
        <div className="md:hidden divide-y divide-slate-100 mt-2">
          {dailyData.rows.map((row) => (
            <div key={row.itemId} className="py-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-base text-slate-900">{row.name}</div>
                <span className="font-bold font-mono text-sm px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
                  Closing: {row.closing.toLocaleString()} {row.unit}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-slate-500 font-medium">Opening</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{row.opening}</div>
                </div>
                <div className="bg-teal-50/70 p-2.5 rounded-xl text-teal-800">
                  <div className="text-teal-700 font-medium">Came</div>
                  <div className="font-mono font-bold mt-0.5">+{row.came}</div>
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded-xl text-amber-800">
                  <div className="text-amber-700 font-medium">Used</div>
                  <div className="font-mono font-bold mt-0.5">-{row.used}</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-500">Value:</span>
                <span className="font-bold text-slate-900 font-mono text-base">
                  Rs. {row.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {/* Mobile Totals Footer */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Closing Stock:</span>
              <span className="font-mono font-bold text-teal-300">
                {dailyData.totals.closing.toLocaleString()} units
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Stock Value:</span>
              <span className="font-mono font-bold text-white text-base">
                Rs. {dailyData.totals.value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* QUICK ADD ITEM MODAL */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Raw Material</h3>
              <button
                type="button"
                onClick={() => setShowNewItemModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navy Blue Gabardine Fabric"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value as ItemCategory)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  >
                    <option value="Fabric">Fabric</option>
                    <option value="Buttons">Buttons</option>
                    <option value="Sewing Thread">Sewing Thread</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as 'meters' | 'pieces' | 'cones')}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  >
                    <option value="meters">meters</option>
                    <option value="pieces">pieces</option>
                    <option value="cones">cones</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quality</label>
                  <input
                    type="text"
                    placeholder="e.g. Cotton Poplin"
                    value={newItemQuality}
                    onChange={(e) => setNewItemQuality(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Colour</label>
                  <input
                    type="text"
                    placeholder="e.g. Navy Blue"
                    value={newItemColour}
                    onChange={(e) => setNewItemColour(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">School</label>
                  <select
                    value={newItemSchool}
                    onChange={(e) => setNewItemSchool(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Beaconhouse School System">Beaconhouse</option>
                    <option value="City Grammar School">City Grammar</option>
                    <option value="Army Public School">Army Public School</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Rate (Rs.)</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemRate}
                    onChange={(e) => setNewItemRate(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={newItemRack}
                    onChange={(e) => setNewItemRack(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Min Level</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemMin}
                    onChange={(e) => setNewItemMin(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="flex-1 py-3 text-sm font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
