import React from 'react';
import { Home, Package, Wallet, Shield, FileText, Settings, Plus, LogOut } from 'lucide-react';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
  { key: 'kyc', label: 'KYC', icon: Shield },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'admin', label: 'Admin', icon: Settings },
];

export default function HeaderNav({ currentView, onNavigate, wallet, onNewBooking, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600" />
            <span className="font-semibold">Fast Parcel</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = currentView === t.key;
              return (
                <button key={t.key} onClick={() => onNavigate(t.key)} className={`flex items-center gap-2 h-10 px-3 rounded-lg text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-lg bg-slate-100">
            <span className="text-sm text-slate-600">Wallet</span>
            <span className="text-sm font-semibold">₹ {wallet.toFixed(2)}</span>
          </div>
          <button onClick={onNewBooking} className="flex items-center gap-2 h-10 px-3 rounded-lg bg-blue-600 text-white"><Plus size={16}/> New Booking</button>
          <button onClick={onLogout} className="h-10 w-10 grid place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"><LogOut size={16} /></button>
        </div>
      </div>
      <div className="md:hidden px-4 pb-3 flex gap-2 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = currentView === t.key;
          return (
            <button key={t.key} onClick={() => onNavigate(t.key)} className={`flex items-center gap-2 h-9 px-3 rounded-lg text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 bg-white border border-slate-200'}`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
