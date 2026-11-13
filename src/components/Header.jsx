import React from 'react';
import {
  ShoppingBag,
  Boxes,
  BarChart3,
  Receipt,
  Landmark,
  Barcode,
  Database,
  Download,
  Trash2,
  User,
  Store
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onLoadSeed,
  onClearData,
  productsCount = 0
}) {
  const navItems = [
    { id: 'pos', label: 'ขายหน้าร้าน', sub: 'POS', icon: ShoppingBag },
    { id: 'inventory', label: 'คลังสินค้า & ต้นทุน', sub: 'Stock', icon: Boxes },
    { id: 'accounting', label: 'กำไร-ขาดทุน', sub: 'P&L', icon: BarChart3 },
    { id: 'receipts', label: 'ประวัติใบเสร็จ', sub: 'Archive', icon: Receipt },
    { id: 'tax', label: 'ภาษี ม.40(8)', sub: 'RD Tax', icon: Landmark },
  ];

  return (
    <header className="h-16 w-full shrink-0 bg-surface/95 backdrop-blur-md border-b border-surface-container-high px-4 lg:px-6 flex items-center justify-between gap-3 z-30 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md overflow-hidden shrink-0">
          <img
            src="/logo.png"
            alt="Copper Golem Logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-on-surface leading-tight font-sans">
            COPPER GOLEM
          </span>
          <span className="text-[11px] text-on-surface-variant leading-none font-sans">
            Smart POS &amp; Thai Tax
          </span>
        </div>
      </div>

      {/* Center: Sleek Horizontal Floating Capsule Navigation */}
      <div className="hidden lg:flex items-center bg-inverse-surface rounded-full p-1 shadow-md">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-container text-white shadow-[0_2px_8px_rgba(91,76,245,0.4)]'
                    : 'text-inverse-on-surface/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Status Indicators & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Status Indicators */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full text-[11px] text-on-surface-variant font-medium border border-surface-container-high">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SQLite WAL</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full text-[11px] text-on-surface-variant font-medium border border-surface-container-high">
            <Barcode className="w-3.5 h-3.5 text-primary" />
            <span>พร้อมยิงบาร์โค้ด</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onLoadSeed}
            title="โหลดข้อมูลตัวอย่าง 12 รายการ"
            type="button"
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-full text-xs font-medium flex items-center gap-1 transition-colors border border-surface-container-high"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="hidden md:inline">โหลดตัวอย่าง</span>
          </button>
          <button
            onClick={onClearData}
            title="ล้างข้อมูลทั้งหมดในระบบ"
            type="button"
            className="px-2.5 py-1 bg-surface-container hover:bg-error-container text-error rounded-full text-xs font-medium flex items-center gap-1 transition-colors border border-surface-container-high"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ล้างข้อมูล</span>
          </button>
        </div>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-container-high">
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden 2xl:inline text-xs font-semibold text-on-surface">แคชเชียร์ 01</span>
        </div>
      </div>
    </header>
  );
}
