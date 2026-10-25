import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Layers, 
  Shirt 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const tabs = [
    {
      to: '/',
      label: 'Dashboard',
      labelUrdu: 'ڈیش بورڈ',
      icon: LayoutDashboard,
    },
    {
      to: '/daily',
      label: 'Daily',
      labelUrdu: 'روزانہ',
      icon: CalendarCheck2,
    },
    {
      to: '/items',
      label: 'Items',
      labelUrdu: 'خام مال',
      icon: Layers,
    },
    {
      to: '/uniforms',
      label: 'Uniforms',
      labelUrdu: 'تیار مال',
      icon: Shirt,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white shadow-2xl select-none"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
                  isActive
                    ? 'text-teal-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold mt-0.5 leading-none">{tab.label}</span>
              <span className="text-sm font-urdu leading-none opacity-80 mt-0.5">{tab.labelUrdu}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
