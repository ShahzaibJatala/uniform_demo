import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { 
  Shirt, 
  PlusCircle, 
  Send, 
  AlertCircle, 
  Search,
  Printer, 
  Coins, 
  Layers
} from 'lucide-react';

const PRODUCTS = [
  'Boys Shirt',
  'Girls Shirt',
  'Trouser',
  'Skirt',
  'Tie',
  'Sweater',
  'Blazer',
];

const SIZES = ['26', '28', '30', '32', '34', '36', '38', '40'];

const SCHOOLS = [
  'Beaconhouse School System',
  'City Grammar School',
  'Army Public School',
];

export const UniformsPage: React.FC = () => {
  const { uniforms, addUniformProduction, addUniformSale } = useStock();

  // Search & Filter
  const [selectedSchool, setSelectedSchool] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // FORM 1: PRODUCTION
  const [prodProduct, setProdProduct] = useState(PRODUCTS[0]);
  const [prodSchool, setProdSchool] = useState(SCHOOLS[0]);
  const [prodSize, setProdSize] = useState('32');
  const [prodQty, setProdQty] = useState('');
  const [prodRate, setProdRate] = useState('850');

  // FORM 2: SALE / DISPATCH
  const [saleUniformId, setSaleUniformId] = useState<string>(uniforms[0]?.id || '');
  const [saleDestination, setSaleDestination] = useState<string>('Outlet');
  const [saleQty, setSaleQty] = useState('');
  const [saleError, setSaleError] = useState<string | null>(null);

  // Selected Uniform for Sale
  const selectedSaleUniform = useMemo(() => {
    return uniforms.find((u) => u.id === saleUniformId) || uniforms[0];
  }, [uniforms, saleUniformId]);

  // Derived KPI calculations
  const totalProduced = useMemo(() => uniforms.reduce((s, u) => s + u.produced, 0), [uniforms]);
  const totalSold = useMemo(() => uniforms.reduce((s, u) => s + u.sold, 0), [uniforms]);
  const totalRemaining = totalProduced - totalSold;
  const totalRevenue = useMemo(() => uniforms.reduce((s, u) => s + (u.sold * u.rate), 0), [uniforms]);

  // Filtered Uniforms
  const filteredUniforms = useMemo(() => {
    return uniforms.filter((u) => {
      if (selectedSchool !== 'All' && u.school !== selectedSchool) return false;
      if (selectedProduct !== 'All' && u.product !== selectedProduct) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.product.toLowerCase().includes(q);
        const matchesSchool = u.school.toLowerCase().includes(q);
        const matchesSize = u.size.toLowerCase().includes(q);
        if (!matchesName && !matchesSchool && !matchesSize) return false;
      }
      return true;
    });
  }, [uniforms, selectedSchool, selectedProduct, searchQuery]);

  // Handle Save Production
  const handleSaveProduction = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(prodQty, 10);
    const rate = parseFloat(prodRate) || 850;

    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    addUniformProduction({
      product: prodProduct,
      school: prodSchool,
      size: prodSize,
      quantity: qty,
      rate,
    });

    setProdQty('');
  };

  // Handle Save Sale / Dispatch
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError(null);
    const qty = parseInt(saleQty, 10);

    if (!selectedSaleUniform) return;
    if (isNaN(qty) || qty <= 0) {
      setSaleError('Please enter a valid quantity.');
      return;
    }

    const available = selectedSaleUniform.produced - selectedSaleUniform.sold;
    if (qty > available) {
      setSaleError(
        `Over-dispatch blocked! Requested ${qty} pcs, but only ${available} pcs in stock.`
      );
      return;
    }

    const res = addUniformSale({
      uniformId: selectedSaleUniform.id,
      quantity: qty,
      destination: saleDestination,
    });

    if (res.success) {
      setSaleQty('');
      setSaleError(null);
    } else if (res.error) {
      setSaleError(res.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 w-full">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Finished Uniform Stock
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track produced garments, school & outlet dispatches, and factory stock balance by size.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print Stock Sheet</span>
        </button>
      </div>

      {/* 4 SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-lg font-bold text-slate-700">Produced</span>
            <Shirt className="w-5 h-5 text-teal-600" />
          </div>
          <div className="font-mono text-[30px] font-bold text-slate-900 leading-tight">
            {totalProduced.toLocaleString()} <span className="text-base font-normal text-slate-400">pcs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-lg font-bold text-slate-700">Dispatched / Sold</span>
            <Send className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="font-mono text-[30px] font-bold text-emerald-700 leading-tight">
            {totalSold.toLocaleString()} <span className="text-base font-normal text-slate-400">pcs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-lg font-bold text-slate-700">Remaining</span>
            <Layers className="w-5 h-5 text-amber-600" />
          </div>
          <div className="font-mono text-[30px] font-bold text-amber-700 leading-tight">
            {totalRemaining.toLocaleString()} <span className="text-base font-normal text-slate-400">pcs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-lg font-bold text-slate-700">Revenue Realized</span>
            <Coins className="w-5 h-5 text-teal-600" />
          </div>
          <div className="font-mono text-[30px] font-bold text-slate-900 leading-tight">
            Rs. {totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* TWO ACTION CARDS: ADD PRODUCTION & ADD SALE / DISPATCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: ADD PRODUCTION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Add Uniform Production
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Record finished garments sewn</p>
            </div>
          </div>

          <form onSubmit={handleSaveProduction} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                School
              </label>
              <select
                value={prodSchool}
                onChange={(e) => setProdSchool(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-teal-500 outline-none"
              >
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Product</label>
                <select
                  value={prodProduct}
                  onChange={(e) => setProdProduct(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-teal-500 outline-none"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Size</label>
                <select
                  value={prodSize}
                  onChange={(e) => setProdSize(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-teal-500 outline-none"
                >
                  {SIZES.map((sz) => (
                    <option key={sz} value={sz}>Size {sz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Quantity (pcs)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 50"
                  value={prodQty}
                  onChange={(e) => setProdQty(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Sale Rate (Rs.)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={prodRate}
                  onChange={(e) => setProdRate(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Save Production</span>
            </button>
          </form>
        </div>

        {/* CARD 2: ADD SALE / DISPATCH */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Add Sale / Dispatch
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Dispatch uniforms to school or shop</p>
            </div>
          </div>

          <form onSubmit={handleSaveSale} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Select Uniform Stock
              </label>
              <select
                value={saleUniformId}
                onChange={(e) => {
                  setSaleUniformId(e.target.value);
                  setSaleError(null);
                }}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-none"
              >
                {uniforms.map((u) => {
                  const rem = u.produced - u.sold;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.school} - {u.product} (Size {u.size}) • Available: {rem} pcs
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Destination
                </label>
                <select
                  value={saleDestination}
                  onChange={(e) => setSaleDestination(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="Outlet">Factory Outlet</option>
                  <option value="School Direct">Direct to School</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Quantity (pcs)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 20"
                  value={saleQty}
                  onChange={(e) => {
                    setSaleQty(e.target.value);
                    setSaleError(null);
                  }}
                  className={`w-full text-sm bg-slate-50 border rounded-xl p-3 text-slate-900 font-semibold focus:bg-white outline-none transition-all ${
                    saleError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {saleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{saleError}</span>
              </div>
            )}

            {selectedSaleUniform && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-sm text-slate-600">
                <span>Sale Rate: Rs. {selectedSaleUniform.rate}/pc</span>
                <span className="font-mono font-bold text-slate-900 text-base">
                  Total: Rs. {((parseInt(saleQty, 10) || 0) * selectedSaleUniform.rate).toLocaleString()}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Record Sale / Dispatch</span>
            </button>
          </form>
        </div>
      </div>

      {/* UNIFORM STOCK OVERVIEW TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Finished Garments Inventory
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Produced = Dispatched + Remaining in Factory
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search garments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 outline-none w-36 sm:w-48 focus:bg-white focus:border-teal-500 font-medium"
              />
            </div>

            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
            >
              <option value="All">All Schools</option>
              {SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
            >
              <option value="All">All Products</option>
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table on Tablet & Desktop */}
        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-sm">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">School</th>
                <th className="py-3.5 px-3">Size</th>
                <th className="py-3.5 px-3 text-right">Produced</th>
                <th className="py-3.5 px-3 text-right text-emerald-700">Sold</th>
                <th className="py-3.5 px-3 text-right text-amber-700">Remaining</th>
                <th className="py-3.5 px-3 text-right">Rate</th>
                <th className="py-3.5 px-4 text-right">Total Sale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredUniforms.map((u) => {
                const remaining = u.produced - u.sold;
                const saleAmount = u.sold * u.rate;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.product}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {u.school}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {u.size}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                      {u.produced.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                      {u.sold.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-700">
                      {remaining.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      Rs. {u.rate.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      Rs. {saleAmount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-sm border-t-2 border-slate-800">
                <td className="py-4 px-4" colSpan={3}>TOTALS</td>
                <td className="py-4 px-3 text-right font-mono">
                  {filteredUniforms.reduce((s, u) => s + u.produced, 0).toLocaleString()}
                </td>
                <td className="py-4 px-3 text-right font-mono text-emerald-400">
                  {filteredUniforms.reduce((s, u) => s + u.sold, 0).toLocaleString()}
                </td>
                <td className="py-4 px-3 text-right font-mono text-amber-400">
                  {filteredUniforms.reduce((s, u) => s + (u.produced - u.sold), 0).toLocaleString()}
                </td>
                <td className="py-4 px-3"></td>
                <td className="py-4 px-4 text-right font-mono text-teal-300 font-black">
                  Rs. {filteredUniforms.reduce((s, u) => s + (u.sold * u.rate), 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="md:hidden divide-y divide-slate-100 mt-2">
          {filteredUniforms.map((u) => {
            const remaining = u.produced - u.sold;
            const saleAmount = u.sold * u.rate;

            return (
              <div key={u.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-tight">
                      {u.product} (Size {u.size})
                    </h4>
                    <span className="text-sm text-teal-700 font-medium">
                      {u.school}
                    </span>
                  </div>
                  <span className="font-bold font-mono text-sm px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                    Remaining: {remaining} pcs
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-slate-500 block">Produced</span>
                    <strong className="text-slate-800 font-mono text-base">{u.produced.toLocaleString()} pcs</strong>
                  </div>
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl text-emerald-800">
                    <span className="text-emerald-700 block">Sold</span>
                    <strong className="font-mono text-base">{u.sold.toLocaleString()} pcs</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-slate-500">Total Sale:</span>
                  <span className="font-bold text-slate-900 font-mono text-base">
                    Rs. {saleAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
