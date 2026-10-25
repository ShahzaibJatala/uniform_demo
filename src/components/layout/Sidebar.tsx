import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Layers, 
  Shirt 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      labelUrdu: 'ہوم ڈیش بورڈ',
      icon: LayoutDashboard,
    },
    {
      to: '/daily',
      label: 'Daily Check & Balance',
      labelUrdu: 'روزانہ کھاتہ',
      icon: CalendarCheck2,
    },
    {
      to: '/items',
      label: 'Items',
      labelUrdu: 'خام مال سٹاک',
      icon: Layers,
    },
    {
      to: '/uniforms',
      label: 'Uniforms',
      labelUrdu: 'تیار شدہ یونیفارم',
      icon: Shirt,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 min-h-[calc(100vh-4rem)] p-4 select-none">
      <div className="space-y-2">
        <div className="px-3 pb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-all group ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                <div className="min-w-0">
                  <div className="truncate leading-tight text-base font-semibold">{item.label}</div>
                  <div className="text-sm opacity-80 font-urdu leading-tight mt-0.5">
                    {item.labelUrdu}
                  </div>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
