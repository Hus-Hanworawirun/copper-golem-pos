import React from 'react';
import {
  ShoppingBag,
  Boxes,
  BarChart3,
  Receipt,
  Landmark,
  Barcode,
  Download,
  Trash2,
  User,
  Database
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLoadSeed,
  onClearData
}) {
  const navItems = [
    { id: 'pos', label: 'ขายหน้าร้าน (Cashier)', icon: ShoppingBag, badge: null },
    { id: 'inventory', label: 'คลังสินค้า & ต้นทุน', icon: Boxes, badge: null },
    { id: 'accounting', label: 'ภาพรวมกำไร-ขาดทุน', icon: BarChart3, badge: null },
    { id: 'receipts', label: 'ประวัติใบเสร็จดิจิทัล', icon: Receipt, badge: null },
    { id: 'tax', label: 'บัญชีภาษี สรรพากร', icon: Landmark, badge: 'ม.40(8)' },
  ];

  return (
    <aside className="w-64 h-full shrink-0 bg-[#181824] text-inverse-on-surface border-r border-white/10 flex flex-col justify-between p-4 z-30 select-none">
      {/* Top Brand & Status */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 overflow-hidden shrink-0">
            <img
              src="/logo.png"
              alt="Copper Golem Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-sm tracking-wide text-white leading-tight font-sans truncate">
              Copper Golem POS
            </h1>
            <p className="text-[11px] text-inverse-on-surface/60 leading-tight font-sans truncate mt-0.5">
              ระบบแคชเชียร์ &amp; คลังสต็อก
            </p>
          </div>
        </div>

        {/* USB Barcode Scanner & SQLite Status Pill */}
        <div className="space-y-1.5">
          <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-medium text-[11px]">พร้อมยิงบาร์โค้ด USB</span>
            </div>
            <Barcode className="w-3.5 h-3.5 text-primary-fixed" />
          </div>

          <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between text-[11px] text-inverse-on-surface/70">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-primary-fixed" />
              <span>SQLite WAL ออฟไลน์</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Sync</span>
          </div>
        </div>

        {/* Navigation Items (Left Menu) */}
        <nav className="space-y-1 pt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-primary-container text-white shadow-md shadow-primary-container/40'
                    : 'text-inverse-on-surface/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-inverse-on-surface/60 group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Operator Profile */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        {/* Quick Database Seed & Clear */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onLoadSeed}
            type="button"
            title="โหลดตัวอย่าง 12 รายการ"
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-inverse-on-surface hover:text-white rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-white/5"
          >
            <Download className="w-3 h-3 text-primary-fixed" />
            <span>โหลดตัวอย่าง</span>
          </button>

          <button
            onClick={onClearData}
            type="button"
            title="ล้างข้อมูลทั้งหมดในระบบ"
            className="px-2.5 py-1.5 bg-white/5 hover:bg-rose-500/20 text-inverse-on-surface hover:text-rose-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-white/5"
          >
            <Trash2 className="w-3 h-3" />
            <span>ล้างข้อมูล</span>
          </button>
        </div>

        {/* Operator Profile */}
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">สมชาย แคชเชียร์</span>
            <span className="text-[10px] text-inverse-on-surface/60 truncate">สาขา 01 (พารากอน) • แคชเชียร์</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
