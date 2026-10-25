import React, { useState } from 'react';
import { useStock } from '../../context/StockContext';
import { RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { resetDemoData } = useStock();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                UniStock
              </span>
              <span className="text-sm font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-xs">
                DEMO
              </span>
            </div>
          </Link>

          {/* Reset Demo Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm font-medium transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Reset demo data to initial realistic seed"
            >
              <RotateCcw className="w-4 h-4 text-teal-400" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">
              Reset Demo Records?
            </h3>
            <p className="text-sm text-slate-600 text-center mt-2 leading-relaxed">
              This will restore all 15 raw materials, 14 days of realistic transaction activity, and sample uniform production and sales.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowConfirm(false);
                }}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
