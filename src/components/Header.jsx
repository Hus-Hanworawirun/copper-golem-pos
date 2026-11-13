import React from 'react';

export default function Header({
  activeTab,
  setActiveTab,
  onLoadSeed,
  onClearData,
  productsCount = 0
}) {
  const navItems = [
    { id: 'pos', label: 'ขายหน้าร้าน (Cashier POS)', icon: 'point_of_sale' },
    { id: 'inventory', label: 'คลังสินค้า & ต้นทุน (Inventory)', icon: 'inventory_2' },
    { id: 'accounting', label: 'ภาพรวมกำไร-ขาดทุน (P&L Analytics)', icon: 'monitoring' },
    { id: 'receipts', label: 'ประวัติใบเสร็จ (Digital Receipts)', icon: 'receipt_long' },
    { id: 'tax', label: 'บัญชีภาษี ม.40(8) (Tax Compliance)', icon: 'account_balance' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high">
      <div className="h-20 w-full px-margin flex items-center justify-between gap-gutter">
        {/* Brand / Logo */}
        <div className="flex items-center gap-space-md shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(65,44,221,0.25)] overflow-hidden">
            <img
              src="/logo.png"
              alt="Copper Golem Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="material-symbols-outlined text-on-primary text-[22px]" style={{ display: 'none' }}>
              token
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-tight">
              COPPER GOLEM
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">
              Smart POS &amp; Thai Tax Compliance
            </span>
          </div>
        </div>

        {/* Center: Floating Navigation Capsule */}
        <div className="hidden xl:flex items-center bg-inverse-surface rounded-full px-space-xs py-space-xs shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <nav className="flex items-center gap-space-xs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-semibold shadow-[0_2px_8px_rgba(91,76,245,0.4)]'
                      : 'text-inverse-on-surface/70 hover:text-inverse-on-surface hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-space-md shrink-0">
          {/* SQLite & Barcode Indicators */}
          <div className="hidden md:flex items-center gap-space-xs">
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-high rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">SQLite WAL</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-high rounded-full">
              <span className="material-symbols-outlined text-[14px] text-primary">barcode_scanner</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">USB Ready</span>
            </div>
          </div>

          {/* Quick Database Seed & Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={onLoadSeed}
              title="โหลดข้อมูลตัวอย่าง 12 รายการ"
              type="button"
              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-full text-label-sm font-label-sm flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">download</span>
              <span className="hidden sm:inline">โหลดตัวอย่าง</span>
            </button>
            <button
              onClick={onClearData}
              title="ล้างข้อมูลทั้งหมดในระบบ"
              type="button"
              className="px-2.5 py-1 bg-surface-container hover:bg-error-container text-error rounded-full text-label-sm font-label-sm flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              <span className="hidden sm:inline">ล้างฐานข้อมูล</span>
            </button>
          </div>

          {/* Operator Profile */}
          <div className="flex items-center gap-space-sm pl-space-xs border-l border-outline-variant/30">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface leading-tight font-semibold">สมชาย แคชเชียร์</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">Operator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Compact Nav (when screen < xl) */}
      <div className="flex xl:hidden overflow-x-auto px-4 py-2 bg-inverse-surface gap-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-inverse-on-surface/70 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
              <span>{item.label.split(' (')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
