import React, { useState } from 'react';
import Dashboard from './Dashboard';
import DailySaleTracker from './DailySaleTracker';
import MonthlyOpExTracker from './MonthlyOpExTracker';
import InvoiceGenerator from './InvoiceGenerator';
import RefundTracker from './RefundTracker';
import InvoiceViewer from './InvoiceViewer'; // ဘောက်ချာရှာဖွေရန် ချိတ်ဆက်ခြင်း
import AnnualReport from './AnnualReport';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'ခြုံငုံသုံးသပ်ချက် (Dashboard)' },
    { id: 'dailySale', icon: '💰', label: 'နေ့စဉ် အရောင်းမှတ်တမ်း' },
    { id: 'monthlyOpEx', icon: '📉', label: 'လစဉ် ကုန်ကျစရိတ်' },
    { id: 'refund', icon: '↩️', label: 'ပြန်အမ်းစာရင်း' },
    { id: 'invoice', icon: '🧾', label: 'ဘောက်ချာ ထုတ်ရန်' },
    { id: 'invoiceViewer', icon: '🔍', label: 'ဘောက်ချာ ရှာဖွေရန်' }, // အသစ်ထပ်တိုးထားသော Menu
    { id: 'annualReport', icon: '📑', label: 'နှစ်ချုပ် အစီရင်ခံစာ' }
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden print:h-auto print:overflow-visible print:block">
      
      {/* ဘယ်ဘက် Sidebar (Print ထုတ်လျှင် ဖျောက်ထားမည်) */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl print:hidden flex-shrink-0 z-20">
        
        {/* Logo / Title Area */}
        <div className="p-6 border-b border-gray-800 text-center">
          <h1 className="text-xl font-black tracking-wider text-blue-400">NET AGE</h1>
          <p className="text-xs text-gray-400 font-medium tracking-widest mt-1 uppercase">Business Analysis</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                activeTab === menu.id 
                  ? 'bg-blue-600 text-white shadow-lg transform translate-x-1' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{menu.icon}</span>
              <span className="text-sm">{menu.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer info in Sidebar */}
        <div className="p-4 border-t border-gray-800 text-center text-xs text-gray-500 font-medium">
          <p>System Version 2.0</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Net Age.</p>
        </div>
      </aside>

      {/* ညာဘက် အဓိက Content ပြသမည့်နေရာ */}
      <main className="flex-1 h-screen overflow-x-hidden overflow-y-auto bg-gray-50 relative print:h-auto print:overflow-visible print:block">
        
        {/* Tab အလိုက် သက်ဆိုင်ရာ Component များကို ပြသခြင်း */}
        <div className="w-full min-h-full print:block">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'dailySale' && <DailySaleTracker />}
          {activeTab === 'monthlyOpEx' && <MonthlyOpExTracker />}
          {activeTab === 'refund' && <RefundTracker />}
          {activeTab === 'invoice' && <InvoiceGenerator />}
          {activeTab === 'invoiceViewer' && <InvoiceViewer />} {/* အသစ်ထပ်တိုးထားသော Component */}
          {activeTab === 'annualReport' && <AnnualReport />}
        </div>
        
      </main>

    </div>
  );
};

export default App;