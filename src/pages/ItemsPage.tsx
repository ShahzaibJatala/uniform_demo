import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { 
  Search, 
  Plus, 
  Edit3, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  Building2, 
  Coins
} from 'lucide-react';
import type { Item, ItemCategory, ItemWithBalance, Transaction } from '../types';

export const ItemsPage: React.FC = () => {
  const { 
    itemsWithBalance, 
    transactions, 
    addItem, 
    updateItem 
  } = useStock();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Selected item for Detail / History Modal
  const [selectedItemDetail, setSelectedItemDetail] = useState<ItemWithBalance | null>(null);

  // Modal State for Add / Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fabric' as ItemCategory,
    quality: '',
    colour: '',
    school: 'General',
    supplier: 'Faisal Textiles',
    unit: 'meters' as 'meters' | 'pieces' | 'cones',
    rate: '450',
    rackLocation: 'Godown 1, Rack A',
    minLevel: '100',
  });

  // Filtered Items
  const filteredItems = useMemo(() => {
    return itemsWithBalance.filter((record) => {
      if (selectedCat !== 'All' && record.item.category !== selectedCat) return false;
      if (showLowStockOnly && !record.isLowStock) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.item.name.toLowerCase().includes(q);
        const matchesCat = record.item.category.toLowerCase().includes(q);
        const matchesQuality = record.item.quality.toLowerCase().includes(q);
        const matchesColour = record.item.colour.toLowerCase().includes(q);
        const matchesSchool = record.item.school.toLowerCase().includes(q);
        const matchesSupplier = record.item.supplier.toLowerCase().includes(q);
        const matchesRack = record.item.rackLocation.toLowerCase().includes(q);

        if (!matchesName && !matchesCat && !matchesQuality && !matchesColour && !matchesSchool && !matchesSupplier && !matchesRack) {
          return false;
        }
      }

      return true;
    });
  }, [itemsWithBalance, selectedCat, showLowStockOnly, searchQuery]);

  // Compute Item History with Running Balance
  const itemHistory = useMemo(() => {
    if (!selectedItemDetail) return [];

    const itemTxs = transactions
      .filter((t) => t.itemId === selectedItemDetail.item.id)
      .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

    let running = 0;
    const historyWithBalance: (Transaction & { runningBalance: number })[] = [];

    itemTxs.forEach((tx) => {
      if (tx.type === 'IN') {
        running += tx.qty;
      } else {
        running -= tx.qty;
      }
      historyWithBalance.push({
        ...tx,
        runningBalance: Math.max(0, running),
      });
    });

    return historyWithBalance.reverse();
  }, [selectedItemDetail, transactions]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Fabric',
      quality: '',
      colour: '',
      school: 'General',
      supplier: 'Faisal Textiles',
      unit: 'meters',
      rate: '450',
      rackLocation: 'Godown 1, Rack A',
      minLevel: '100',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quality: item.quality,
      colour: item.colour,
      school: item.school,
      supplier: item.supplier,
      unit: item.unit,
      rate: item.rate.toString(),
      rackLocation: item.rackLocation,
      minLevel: item.minLevel.toString(),
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      updateItem(editingItem.id, {
        name: formData.name.trim(),
        category: formData.category,
        quality: formData.quality.trim(),
        colour: formData.colour.trim(),
        school: formData.school,
        supplier: formData.supplier.trim(),
        unit: formData.unit,
        rate: parseFloat(formData.rate) || 100,
        rackLocation: formData.rackLocation.trim(),
        minLevel: parseFloat(formData.minLevel) || 50,
      });

      if (selectedItemDetail && selectedItemDetail.item.id === editingItem.id) {
        setSelectedItemDetail((prev) =>
          prev
            ? {
                ...prev,
                item: {
                  ...prev.item,
                  name: formData.name.trim(),
                  category: formData.category,
                  quality: formData.quality.trim(),
                  colour: formData.colour.trim(),
                  school: formData.school,
                  supplier: formData.supplier.trim(),
                  unit: formData.unit,
                  rate: parseFloat(formData.rate) || 100,
                  rackLocation: formData.rackLocation.trim(),
                  minLevel: parseFloat(formData.minLevel) || 50,
                },
              }
            : null
        );
      }
    } else {
      addItem({
        name: formData.name.trim(),
        category: formData.category,
        quality: formData.quality.trim(),
        colour: formData.colour.trim(),
        school: formData.school,
        supplier: formData.supplier.trim(),
        unit: formData.unit,
        rate: parseFloat(formData.rate) || 100,
        rackLocation: formData.rackLocation.trim(),
        minLevel: parseFloat(formData.minLevel) || 50,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Raw Material Stock
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse all variants with godown locations, current balances, and stock movement history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, colour, school, supplier, rack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-4 py-2.5 text-sm font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              showLowStockOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Alerts Only</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Fabric', 'Buttons', 'Sewing Thread', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCat === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS GRID */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
          <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">No items match your criteria</p>
          <p className="text-sm text-slate-400 mt-1">Try clearing your search query or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((record) => {
            const { item, totalIn, totalUsed, remaining, isLowStock, stockValue } = record;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemDetail(record)}
                className={`bg-white rounded-2xl p-6 border shadow-sm transition-all cursor-pointer hover:shadow-md relative group ${
                  isLowStock
                    ? 'border-rose-300 ring-1 ring-rose-300/40'
                    : 'border-slate-200/80 hover:border-teal-500/50'
                }`}
              >
                {/* Low Stock Badge */}
                {isLowStock && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>LOW STOCK</span>
                  </div>
                )}

                {/* Category & School */}
                <div className="flex items-center gap-2 mb-2 pr-24">
                  <span className="text-sm uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <span className="text-sm text-teal-700 font-semibold truncate">
                    {item.school}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors leading-tight mb-1">
                  {item.name}
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                  {item.quality} • {item.colour}
                </p>

                {/* Godown Location & Supplier Info */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-sm text-slate-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      Location:
                    </span>
                    <span className="font-semibold text-slate-800">{item.rackLocation}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      Supplier:
                    </span>
                    <span className="font-medium text-slate-700 truncate max-w-[170px] text-right">
                      {item.supplier}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Coins className="w-4 h-4 text-amber-500" />
                      Rate:
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      Rs. {item.rate.toLocaleString()} / {item.unit}
                    </span>
                  </div>
                </div>

                {/* Balance Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <div className="text-sm font-semibold text-slate-500">Bought</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">{totalIn.toLocaleString()}</div>
                  </div>
                  <div className="bg-amber-50/70 p-2.5 rounded-xl text-amber-800">
                    <div className="text-sm font-semibold text-amber-600">Used</div>
                    <div className="font-mono font-bold mt-0.5">{totalUsed.toLocaleString()}</div>
                  </div>
                  <div className={`p-2.5 rounded-xl font-bold ${
                    isLowStock
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    <div className="text-sm font-semibold opacity-90">Remaining</div>
                    <div className="font-mono mt-0.5">{remaining.toLocaleString()}</div>
                  </div>
                </div>

                {/* Stock Value & Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-400 block text-sm">Stock Value</span>
                    <span className="font-mono font-bold text-slate-900 text-base">
                      Rs. {stockValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenEdit(item, e)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-teal-700 group-hover:underline flex items-center gap-1">
                      History <History className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ITEM DETAIL & TRANSACTION HISTORY MODAL */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                  {selectedItemDetail.item.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedItemDetail.item.name}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedItemDetail.item.quality} • {selectedItemDetail.item.colour} • {selectedItemDetail.item.school}
                </p>
              </div>

              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 shrink-0 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-semibold text-sm">Location</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedItemDetail.item.rackLocation}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-semibold text-sm">Rate</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  Rs. {selectedItemDetail.item.rate.toLocaleString()}/{selectedItemDetail.item.unit}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-semibold text-sm">Min Stock</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                  {selectedItemDetail.item.minLevel} {selectedItemDetail.item.unit}
                </span>
              </div>
              <div className={`p-3 rounded-xl border font-bold ${
                selectedItemDetail.isLowStock
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}>
                <span className="block text-sm">Remaining</span>
                <span className="font-mono text-base mt-0.5 block">
                  {selectedItemDetail.remaining.toLocaleString()} {selectedItemDetail.item.unit}
                </span>
              </div>
            </div>

            {/* Transaction History Header */}
            <div className="flex items-center justify-between pt-3 pb-2 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <History className="w-4 h-4 text-teal-600" />
                <span>Ledger Movement History ({itemHistory.length} Transactions)</span>
              </div>
            </div>

            {/* Scrollable Transaction List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {itemHistory.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No transactions recorded yet for this item.
                </div>
              ) : (
                itemHistory.map((tx) => {
                  const isCame = tx.type === 'IN';
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isCame ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isCame ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{tx.date}</span>
                            <span className={`text-sm px-2.5 py-0.5 rounded-full font-bold ${
                              isCame ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isCame ? 'Stock In' : 'Used'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {tx.note || (isCame ? `Supplier: ${tx.supplier || 'N/A'}` : 'Cutting issue')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-bold text-base ${
                          isCame ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {isCame ? `+${tx.qty.toLocaleString()}` : `-${tx.qty.toLocaleString()}`} {selectedItemDetail.item.unit}
                        </div>
                        <div className="text-sm font-mono text-slate-400">
                          Balance: <strong className="text-slate-800">{tx.runningBalance.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Item Details' : 'Add New Raw Material Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navy Blue Gabardine Fabric"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
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
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'meters' | 'pieces' | 'cones' })}
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
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Colour</label>
                  <input
                    type="text"
                    placeholder="e.g. Navy Blue"
                    value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Target School</label>
                  <select
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
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
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={formData.rackLocation}
                    onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Min Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minLevel}
                    onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm"
                >
                  {editingItem ? 'Save Updates' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
