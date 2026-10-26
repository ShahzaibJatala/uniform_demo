import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StockProvider } from './context/StockContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/common/Toast';

import { QuickTaskPage } from './pages/QuickTaskPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailyCheckPage } from './pages/DailyCheckPage';
import { ItemsPage } from './pages/ItemsPage';
import { UniformsPage } from './pages/UniformsPage';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-900 text-base antialiased selection:bg-teal-500 selection:text-white w-full">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Header with DEMO badge & Reset Demo button */}
      <Header />

      {/* Main Layout: Fixed 256px sidebar on desktop + fluid content area with max-w-7xl and p-6 */}
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Quick Work / Daily Entry - simplified for factory workers */}
            <Route path="/" element={<QuickTaskPage />} />

            {/* Complete Executive Details & Reports Section */}
            <Route path="/details" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/details" replace />} />
            <Route path="/reports" element={<Navigate to="/details" replace />} />

            {/* Daily Check & Balance Sheet */}
            <Route path="/daily" element={<DailyCheckPage />} />

            {/* Raw Material Items List & History */}
            <Route path="/items" element={<ItemsPage />} />

            {/* Uniforms Finished Goods & Sales */}
            <Route path="/uniforms" element={<UniformsPage />} />

            {/* Backwards compatibility redirects */}
            <Route path="/daily-report" element={<Navigate to="/daily" replace />} />
            <Route path="/raw-material" element={<Navigate to="/items" replace />} />
            <Route path="/finished-goods" element={<Navigate to="/uniforms" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <StockProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StockProvider>
  );
}

export default App;
