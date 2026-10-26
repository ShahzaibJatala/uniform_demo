import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { 
  ShoppingCart, 
  Scissors, 
  Warehouse, 
  Shirt, 
  Search, 
  AlertTriangle, 
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Link } from 'react-router-dom';
import { KPIDetailModal, type KPIType } from '../components/dashboard/KPIDetailModal';

export const DashboardPage: React.FC = () => {
  const { 
    items,
    uniforms,
    kpis, 
    categorySummaries, 
    itemsWithBalance, 
    transactions, 
    lowStockItems 
  } = useStock();

  const [activeKpiModal, setActiveKpiModal] = useState<KPIType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');

  // Filtered items for the dashboard item table
  const filteredItems = useMemo(() => {
    return itemsWithBalance.filter((record) => {
      if (selectedCat !== 'All' && record.item.category !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          record.item.name.toLowerCase().includes(q) ||
          record.item.quality.toLowerCase().includes(q) ||
          record.item.colour.toLowerCase().includes(q) ||
          record.item.school.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [itemsWithBalance, selectedCat, searchQuery]);

  // Chart 1: Bought vs Used by Category Data (in Rs.)
  const categoryChartData = useMemo(() => {
    return categorySummaries.map((cat) => ({
      name: cat.category,
      'Bought (Rs)': cat.boughtRs,
      'Used (Rs)': cat.usedRs,
    }));
  }, [categorySummaries]);

  // Chart 2: Last 14 Days Stock In vs Used Line Chart
  const trend14DaysData = useMemo(() => {
    const dates = [
      '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15',
      '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19',
      '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23',
      '2026-10-24', '2026-10-25'
    ];

    return dates.map((d) => {
      let inRs = 0;
      let usedRs = 0;

      transactions.forEach((tx) => {
        if (tx.date === d) {
          if (tx.type === 'IN') inRs += tx.amount;
          if (tx.type === 'USED') usedRs += tx.amount;
        }
      });

      return {
        date: d.slice(5), // e.g. "10-25"
        'Stock In': inRs,
        'Used': usedRs,
      };
    });
  }, [transactions]);

  // Limit to max 3 low-stock alerts
  const displayLowStock = useMemo(() => {
    return lowStockItems.slice(0, 3);
  }, [lowStockItems]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8 w-full">

      {/* Quick Work & Details Toggle Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
              Executive View
            </span>
            <span className="text-sm text-slate-500 font-medium">
              Detailed Accounts & History
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Details & Reports
          </h1>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all shadow-sm shrink-0"
        >
          <span>Switch to Quick Work</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 1. FOUR KPI CARDS (clickable for detailed breakdown) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Total Purchased */}
        <div 
          onClick={() => setActiveKpiModal('PURCHASED')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-teal-500/60 hover:shadow-md cursor-pointer transition-all group select-none flex flex-col justify-between"
          role="button"
          tabIndex={0}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-700">
                Total Purchased
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[30px] font-bold text-slate-900 mt-3 tracking-tight leading-tight">
              Rs. {kpis.totalPurchasedRs.toLocaleString()}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-teal-700 font-semibold group-hover:underline">
            <span>View batch detail</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Total Used */}
        <div 
          onClick={() => setActiveKpiModal('USED')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-amber-500/60 hover:shadow-md cursor-pointer transition-all group select-none flex flex-col justify-between"
          role="button"
          tabIndex={0}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-700">
                Total Used
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                <Scissors className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[30px] font-bold text-slate-900 mt-3 tracking-tight leading-tight">
              Rs. {kpis.totalUsedRs.toLocaleString()}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-amber-700 font-semibold group-hover:underline">
            <span>View usage detail</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Remaining Stock Value */}
        <div 
          onClick={() => setActiveKpiModal('IN_STOCK')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-emerald-500/60 hover:shadow-md cursor-pointer transition-all group select-none flex flex-col justify-between"
          role="button"
          tabIndex={0}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-700">
                Remaining Stock Value
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                <Warehouse className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[30px] font-bold text-slate-900 mt-3 tracking-tight leading-tight">
              Rs. {kpis.remainingStockValueRs.toLocaleString()}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-emerald-700 font-semibold group-hover:underline">
            <span>View stock balance</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Uniforms Sold */}
        <div 
          onClick={() => setActiveKpiModal('SOLD')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:border-blue-500/60 hover:shadow-md cursor-pointer transition-all group select-none flex flex-col justify-between"
          role="button"
          tabIndex={0}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-700">
                Uniforms Sold
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Shirt className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[30px] font-bold text-slate-900 mt-3 tracking-tight leading-tight">
              Rs. {kpis.uniformsSoldRs.toLocaleString()}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-blue-700 font-semibold group-hover:underline">
            <span>View dispatch detail</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* 2. FOUR CATEGORY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categorySummaries.map((cat) => (
          <div
            key={cat.category}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                {cat.category}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Bought:</span>
                  <span className="font-semibold text-slate-900">
                    {cat.boughtQty.toLocaleString()} {cat.unit} (Rs. {cat.boughtRs.toLocaleString()})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Used:</span>
                  <span className="font-semibold text-slate-900">
                    {cat.usedQty.toLocaleString()} {cat.unit} (Rs. {cat.usedRs.toLocaleString()})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-bold">Remaining:</span>
                  <span className="font-bold text-teal-700">
                    {cat.remainingQty.toLocaleString()} {cat.unit} (Rs. {cat.remainingRs.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>

            {/* Used / Remaining Progress Bar */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-1.5">
                <span>Usage Progress</span>
                <span className="font-bold text-slate-900">{cat.usedPercent}% Used</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${cat.usedPercent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. CHARTS: BOUGHT VS USED BAR CHART + 14-DAY LINE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Bought vs Used per Category */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Bought vs Used by Category
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 14 }} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 14 }}
                  tickLine={false}
                  tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: unknown) => {
                    const num = typeof value === 'number' ? value : Number(value) || 0;
                    return [`Rs. ${num.toLocaleString()}`, ''];
                  }}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid #E2E8F0', fontSize: '14px' }}
                />
                <Legend wrapperStyle={{ fontSize: 14, paddingTop: 10 }} />
                <Bar dataKey="Bought (Rs)" fill="#0D9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Used (Rs)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: 14-Day Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Stock In vs Used (Last 14 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend14DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 14 }} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 14 }}
                  tickLine={false}
                  tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: unknown) => {
                    const num = typeof value === 'number' ? value : Number(value) || 0;
                    return [`Rs. ${num.toLocaleString()}`, ''];
                  }}
                  contentStyle={{ borderRadius: '1rem', border: '1px solid #E2E8F0', fontSize: '14px' }}
                />
                <Legend wrapperStyle={{ fontSize: 14, paddingTop: 10 }} />
                <Line
                  type="monotone"
                  dataKey="Stock In"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Used"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. ITEM TABLE: item, bought, used, remaining, amount, with search and category filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Raw Material Stock Table
          </h3>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 w-full sm:w-60 font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['All', 'Fabric', 'Buttons', 'Sewing Thread', 'Other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCat === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table on Tablet & Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-sm">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4 text-right">Bought</th>
                <th className="py-3.5 px-4 text-right text-amber-700">Used</th>
                <th className="py-3.5 px-4 text-right text-teal-700 font-extrabold">Remaining</th>
                <th className="py-3.5 px-4 text-right">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredItems.map((rec) => (
                <tr key={rec.item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{rec.item.name}</div>
                    <div className="text-sm text-slate-500">
                      {rec.item.quality} • {rec.item.colour}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    {rec.totalIn.toLocaleString()} {rec.item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-600 font-semibold">
                    {rec.totalUsed.toLocaleString()} {rec.item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-800">
                    {rec.remaining.toLocaleString()} {rec.item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    Rs. {rec.stockValue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards (Phone: single-column cards, no horizontal scroll) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredItems.map((rec) => (
            <div key={rec.item.id} className="py-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-base text-slate-900">{rec.item.name}</div>
                  <div className="text-sm text-slate-500">{rec.item.quality} • {rec.item.colour}</div>
                </div>
                <span className="font-bold font-mono text-sm px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
                  {rec.remaining.toLocaleString()} {rec.item.unit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500 block">Bought:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {rec.totalIn.toLocaleString()} {rec.item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Used:</span>
                  <span className="font-semibold text-amber-600 font-mono">
                    {rec.totalUsed.toLocaleString()} {rec.item.unit}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-500">Stock Value:</span>
                <span className="font-bold text-slate-900 font-mono text-base">
                  Rs. {rec.stockValue.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MAX 3 LOW-STOCK ALERTS, WITH "VIEW ALL" LINK */}
      {displayLowStock.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-rose-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Low Stock Alerts ({lowStockItems.length} items below minimum)
              </h3>
            </div>

            <Link
              to="/items"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayLowStock.map((rec) => (
              <div
                key={rec.item.id}
                className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-base text-slate-900">{rec.item.name}</div>
                  <div className="text-sm text-slate-600 mt-0.5">
                    {rec.item.quality} • {rec.item.rackLocation}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-rose-200/80 flex items-center justify-between text-sm">
                  <span className="text-rose-700 font-medium">Available:</span>
                  <span className="font-bold font-mono text-rose-800 text-base">
                    {rec.remaining.toLocaleString()} {rec.item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Detail Breakdown Modal */}
      <KPIDetailModal
        isOpen={activeKpiModal !== null}
        type={activeKpiModal}
        onClose={() => setActiveKpiModal(null)}
        transactions={transactions}
        items={items}
        itemsWithBalance={itemsWithBalance}
        uniforms={uniforms}
      />

    </div>
  );
};
