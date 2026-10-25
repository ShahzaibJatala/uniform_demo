import React from 'react';
import { useStock } from '../../context/StockContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStock();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-[90vw] pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
          );

        const borderClass =
          toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
            : toast.type === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-950'
            : toast.type === 'warning'
            ? 'border-amber-200 bg-amber-50 text-amber-950'
            : 'border-teal-200 bg-teal-50 text-teal-950';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-black/5"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-700 mt-0.5 leading-snug">{toast.message}</p>
              {toast.urduSubtitle && (
                <p className="text-sm text-slate-600 mt-1 font-medium font-urdu leading-normal text-right dir-rtl">
                  {toast.urduSubtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
