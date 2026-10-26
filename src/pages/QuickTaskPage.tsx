import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

type TaskMode = 'CAME' | 'USED' | 'DISPATCH';

export const QuickTaskPage: React.FC = () => {
  const { 
    items, 
    itemsWithBalance, 
    uniforms, 
    transactions, 
    addTransaction, 
    addUniformSale 
  } = useStock();

  // Active Task Mode
  const [taskMode, setTaskMode] = useState<TaskMode>('CAME');

  // FORM 1: ITEM CAME
  const [cameItemId, setCameItemId] = useState<string>(items[0]?.id || '');
  const [cameQty, setCameQty] = useState<string>('');
  const [cameSupplier, setCameSupplier] = useState<string>('');

  // FORM 2: ITEM USED
  const [usedItemId, setUsedItemId] = useState<string>(items[0]?.id || '');
  const [usedQty, setUsedQty] = useState<string>('');
  const [usedNote, setUsedNote] = useState<string>('');
  const [usedError, setUsedError] = useState<string | null>(null);

  // FORM 3: UNIFORM DISPATCH
  const [dispatchUniformId, setDispatchUniformId] = useState<string>(uniforms[0]?.id || '');
  const [dispatchQty, setDispatchQty] = useState<string>('');
  const [dispatchDest, setDispatchDest] = useState<string>('Outlet');
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // Success Feedback Message
  const [lastSavedMsg, setLastSavedMsg] = useState<{
    title: string;
    detail: string;
    type: 'success';
  } | null>(null);

  // Today's date
  const todayDate = '2026-10-25';

  // Selected item references
  const selectedCameItem = useMemo(() => {
    return items.find((i) => i.id === cameItemId) || items[0];
  }, [items, cameItemId]);

  const selectedUsedItem = useMemo(() => {
    return itemsWithBalance.find((i) => i.item.id === usedItemId) || itemsWithBalance[0];
  }, [itemsWithBalance, usedItemId]);

  const selectedDispatchUniform = useMemo(() => {
    return uniforms.find((u) => u.id === dispatchUniformId) || uniforms[0];
  }, [uniforms, dispatchUniformId]);

  // Update supplier default when cameItemId changes
  const handleCameItemSelect = (id: string) => {
    setCameItemId(id);
    const item = items.find((i) => i.id === id);
    if (item) {
      setCameSupplier(item.supplier);
    }
  };

  // Quick quantity adder helper
  const addQty = (amount: number, current: string, setter: (val: string) => void) => {
    const num = (parseFloat(current) || 0) + amount;
    setter(num.toString());
  };

  // SUBMIT 1: ITEM CAME
  const handleSaveCame = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(cameQty);
    if (!cameItemId || isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    const res = addTransaction({
      date: todayDate,
      itemId: cameItemId,
      type: 'IN',
      qty,
      rate: selectedCameItem?.rate || 100,
      supplier: cameSupplier || selectedCameItem?.supplier,
      note: 'Stock In purchase received',
    });

    if (res.success) {
      setLastSavedMsg({
        title: 'Stock In Recorded!',
        detail: `Added ${qty.toLocaleString()} ${selectedCameItem?.unit} of ${selectedCameItem?.name}.`,
        type: 'success',
      });
      setCameQty('');
    }
  };

  // SUBMIT 2: ITEM USED
  const handleSaveUsed = (e: React.FormEvent) => {
    e.preventDefault();
    setUsedError(null);
    const qty = parseFloat(usedQty);

    if (!usedItemId || isNaN(qty) || qty <= 0) {
      setUsedError('Please enter a valid quantity.');
      return;
    }

    if (selectedUsedItem && qty > selectedUsedItem.remaining) {
      setUsedError(
        `Not enough stock! Only ${selectedUsedItem.remaining.toLocaleString()} ${selectedUsedItem.item.unit} available in godown.`
      );
      return;
    }

    const res = addTransaction({
      date: todayDate,
      itemId: usedItemId,
      type: 'USED',
      qty,
      rate: selectedUsedItem?.item.rate || 0,
      note: usedNote.trim() || 'Issued for cutting master',
    });

    if (res.success) {
      const newBalance = selectedUsedItem.remaining - qty;
      setLastSavedMsg({
        title: 'Item Issue Recorded!',
        detail: `Issued ${qty.toLocaleString()} ${selectedUsedItem?.item.unit} of ${selectedUsedItem?.item.name}. Remaining balance is now ${newBalance.toLocaleString()} ${selectedUsedItem?.item.unit}.`,
        type: 'success',
      });
      setUsedQty('');
      setUsedNote('');
      setUsedError(null);
    } else if (res.error) {
      setUsedError(res.message);
    }
  };

  // SUBMIT 3: UNIFORM DISPATCH
  const handleSaveDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchError(null);
    const qty = parseInt(dispatchQty, 10);

    if (!selectedDispatchUniform || isNaN(qty) || qty <= 0) {
      setDispatchError('Please enter a valid quantity.');
      return;
    }

    const available = selectedDispatchUniform.produced - selectedDispatchUniform.sold;
    if (qty > available) {
      setDispatchError(
        `Over-dispatch blocked! Only ${available} pcs available in stock.`
      );
      return;
    }

    const res = addUniformSale({
      uniformId: selectedDispatchUniform.id,
      quantity: qty,
      destination: dispatchDest,
    });

    if (res.success) {
      const newRemaining = available - qty;
      setLastSavedMsg({
        title: 'Uniform Dispatch Recorded!',
        detail: `Dispatched ${qty} pcs of ${selectedDispatchUniform.product} to ${dispatchDest}. Remaining in factory: ${newRemaining} pcs.`,
        type: 'success',
      });
      setDispatchQty('');
      setDispatchError(null);
    } else if (res.error) {
      setDispatchError(res.message);
    }
  };

  // Today's Entries (List of entries entered today)
  const todayEntries = useMemo(() => {
    return transactions
      .filter((t) => t.date === todayDate)
      .map((tx) => {
        const item = items.find((i) => i.id === tx.itemId);
        return {
          id: tx.id,
          type: tx.type,
          name: item?.name || 'Item',
          qty: tx.qty,
          unit: item?.unit || 'units',
          note: tx.note || (tx.type === 'IN' ? `Supplier: ${tx.supplier || 'Factory'}` : 'Production Issue'),
        };
      })
      .slice(0, 6);
  }, [transactions, items]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8 w-full max-w-4xl mx-auto">
      
      {/* Top Welcome & Mode Switch Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daily Quick Work
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose what happened today, enter quantity, and tap Save. Fast and simple.
          </p>
        </div>

        <Link
          to="/details"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shrink-0 shadow-sm"
        >
          <span>View Details & Reports</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3 BIG TASK ACTION SELECTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* BUTTON 1: STOCK CAME */}
        <button
          type="button"
          onClick={() => {
            setTaskMode('CAME');
            setLastSavedMsg(null);
          }}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-sm ${
            taskMode === 'CAME'
              ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-600/30 shadow-md'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-teal-500/50 hover:bg-teal-50/20'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              taskMode === 'CAME' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'
            }`}>
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold leading-tight">1. Stock Received</div>
              <div className={`text-sm mt-0.5 ${taskMode === 'CAME' ? 'text-teal-100' : 'text-slate-500'}`}>
                New cloth / buttons came
              </div>
            </div>
          </div>
        </button>

        {/* BUTTON 2: STOCK USED */}
        <button
          type="button"
          onClick={() => {
            setTaskMode('USED');
            setLastSavedMsg(null);
          }}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-sm ${
            taskMode === 'USED'
              ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600/30 shadow-md'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-amber-500/50 hover:bg-amber-50/20'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              taskMode === 'USED' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
            }`}>
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold leading-tight">2. Stock Issued</div>
              <div className={`text-sm mt-0.5 ${taskMode === 'USED' ? 'text-amber-100' : 'text-slate-500'}`}>
                Given to cutting / master
              </div>
            </div>
          </div>
        </button>

        {/* BUTTON 3: UNIFORM SENT */}
        <button
          type="button"
          onClick={() => {
            setTaskMode('DISPATCH');
            setLastSavedMsg(null);
          }}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between shadow-sm ${
            taskMode === 'DISPATCH'
              ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/30 shadow-md'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-blue-500/50 hover:bg-blue-50/20'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              taskMode === 'DISPATCH' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
            }`}>
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold leading-tight">3. Uniform Sent</div>
              <div className={`text-sm mt-0.5 ${taskMode === 'DISPATCH' ? 'text-blue-100' : 'text-slate-500'}`}>
                Sent to shop or school
              </div>
            </div>
          </div>
        </button>

      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {lastSavedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-base">{lastSavedMsg.title}</div>
            <div className="text-sm text-emerald-800 mt-0.5">{lastSavedMsg.detail}</div>
          </div>
        </div>
      )}

      {/* ACTIVE TASK FORM CARD */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        
        {/* ================= TASK 1: STOCK RECEIVED ================= */}
        {taskMode === 'CAME' && (
          <form onSubmit={handleSaveCame} className="space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Record Stock Received
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Fabric roll, buttons, or thread cones arrived at godown.
              </p>
            </div>

            {/* Select Item */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                What item came in?
              </label>
              <select
                value={cameItemId}
                onChange={(e) => handleCameItemSelect(e.target.value)}
                className="w-full text-base bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:border-teal-500 outline-none"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} • {i.quality} ({i.unit}) — Location: {i.rackLocation}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input with Quick Stepper Buttons */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                How many {selectedCameItem?.unit || 'units'} arrived?
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="Enter quantity"
                  value={cameQty}
                  onChange={(e) => setCameQty(e.target.value)}
                  className="w-full text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              {/* Quick Stepper Pills */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-500 font-medium">Quick add:</span>
                {[50, 100, 200, 500].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => addQty(num, cameQty, setCameQty)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Supplier / Company */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Supplier Company
              </label>
              <input
                type="text"
                placeholder="Supplier name"
                value={cameSupplier || selectedCameItem?.supplier || ''}
                onChange={(e) => setCameSupplier(e.target.value)}
                className="w-full text-base bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-teal-500 outline-none"
              />
            </div>

            {/* Big Action Button with Urdu Subtitle */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-lg shadow-sm transition-all flex flex-col items-center justify-center cursor-pointer mt-4"
            >
              <span>Save Stock In</span>
              <span className="text-sm font-urdu font-normal opacity-90">مال آمد محفوظ کریں</span>
            </button>
          </form>
        )}

        {/* ================= TASK 2: STOCK USED ================= */}
        {taskMode === 'USED' && (
          <form onSubmit={handleSaveUsed} className="space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Record Stock Given / Used
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Material issued to cutting master or production floor.
              </p>
            </div>

            {/* Select Item */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                What item was taken?
              </label>
              <select
                value={usedItemId}
                onChange={(e) => {
                  setUsedItemId(e.target.value);
                  setUsedError(null);
                }}
                className="w-full text-base bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:border-amber-500 outline-none"
              >
                {itemsWithBalance.map((i) => (
                  <option key={i.item.id} value={i.item.id}>
                    {i.item.name} • Available in stock: {i.remaining.toLocaleString()} {i.item.unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  How many {selectedUsedItem?.item.unit || 'units'} given?
                </label>
                <span className="text-sm text-teal-800 font-bold">
                  Stock in godown: {selectedUsedItem?.remaining.toLocaleString()} {selectedUsedItem?.item.unit}
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={selectedUsedItem?.remaining || undefined}
                step="any"
                required
                placeholder="Enter quantity given"
                value={usedQty}
                onChange={(e) => {
                  setUsedQty(e.target.value);
                  setUsedError(null);
                }}
                className={`w-full text-lg font-bold text-slate-900 bg-slate-50 border rounded-xl p-3.5 focus:bg-white outline-none ${
                  usedError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                }`}
              />

              {/* Quick Stepper Pills */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-500 font-medium">Quick add:</span>
                {[20, 50, 100, 200].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => addQty(num, usedQty, setUsedQty)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message if Exceeds Stock */}
            {usedError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{usedError}</span>
              </div>
            )}

            {/* Given to Note */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Who took it / Purpose?
              </label>
              <input
                type="text"
                placeholder="e.g. Master Aslam (Class 5 boys shirts)"
                value={usedNote}
                onChange={(e) => setUsedNote(e.target.value)}
                className="w-full text-base bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>

            {/* Big Action Button with Urdu Subtitle */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-lg shadow-sm transition-all flex flex-col items-center justify-center cursor-pointer mt-4"
            >
              <span>Save Item Used</span>
              <span className="text-sm font-urdu font-normal opacity-90">استعمال محفوظ کریں</span>
            </button>
          </form>
        )}

        {/* ================= TASK 3: UNIFORM DISPATCH ================= */}
        {taskMode === 'DISPATCH' && (
          <form onSubmit={handleSaveDispatch} className="space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Record Uniform Dispatch
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Ready stitched uniforms sent to factory outlet or school.
              </p>
            </div>

            {/* Select Uniform */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Select Uniform Garment
              </label>
              <select
                value={dispatchUniformId}
                onChange={(e) => {
                  setDispatchUniformId(e.target.value);
                  setDispatchError(null);
                }}
                className="w-full text-base bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 outline-none"
              >
                {uniforms.map((u) => {
                  const available = u.produced - u.sold;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.school} — {u.product} (Size {u.size}) • Available: {available} pcs
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Destination & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Where sent?
                </label>
                <select
                  value={dispatchDest}
                  onChange={(e) => setDispatchDest(e.target.value)}
                  className="w-full text-base bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 font-medium focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value="Outlet">Factory Outlet Shop</option>
                  <option value="School Direct">Direct to School Campus</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Quantity (pieces)
                  </label>
                  {selectedDispatchUniform && (
                    <span className="text-sm text-blue-700 font-bold">
                      In Stock: {selectedDispatchUniform.produced - selectedDispatchUniform.sold} pcs
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter pieces"
                  value={dispatchQty}
                  onChange={(e) => {
                    setDispatchQty(e.target.value);
                    setDispatchError(null);
                  }}
                  className={`w-full text-lg font-bold text-slate-900 bg-slate-50 border rounded-xl p-3.5 focus:bg-white outline-none ${
                    dispatchError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {dispatchError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{dispatchError}</span>
              </div>
            )}

            {/* Action Button with Urdu Subtitle */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-lg shadow-sm transition-all flex flex-col items-center justify-center cursor-pointer mt-4"
            >
              <span>Save Uniform Dispatch</span>
              <span className="text-sm font-urdu font-normal opacity-90">ترسیل محفوظ کریں</span>
            </button>
          </form>
        )}

      </div>

      {/* TODAY'S COMPLETED WORK LOG */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Today's Entries ({todayEntries.length})
            </h3>
          </div>
          <span className="text-sm text-slate-500 font-medium">
            Oct 25, 2026
          </span>
        </div>

        {todayEntries.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No entries recorded yet today. Choose an action above to record your first task!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayEntries.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    item.type === 'IN' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.type === 'IN' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-base text-slate-900">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.note}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-base ${
                    item.type === 'IN' ? 'text-teal-700' : 'text-amber-700'
                  }`}>
                    {item.type === 'IN' ? `+${item.qty.toLocaleString()}` : `-${item.qty.toLocaleString()}`} {item.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEPARATE DETAILS SECTION CALLOUT */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">
            Need Detailed Accounts, Charts, or Stock Sheets?
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            View total financial values, 14-day charts, category progress, and opening/closing daily sheets in the separate Details section.
          </p>
        </div>

        <Link
          to="/details"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-sm transition-all shrink-0 cursor-pointer shadow-sm"
        >
          <span>Open Details & Reports</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
