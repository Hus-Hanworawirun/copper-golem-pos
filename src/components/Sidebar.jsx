import React from 'react';
import {
  ShoppingBag,
  Boxes,
  BarChart3,
  Receipt,
  Landmark,
  Barcode,
  Database,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  ArrowUpCircle,
  RotateCw,
  Pencil
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLoadSeed,
  onClearData,
  cartCount = 0,
  orderHistoryCount = 0,
  taxSummary = null,
  appVersion = '1.0.1',
  onCheckUpdate = () => {},
  isCheckingUpdate = false,
  storeSettings = null,
  onOpenStoreSettings = () => {}
}) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div
        onClick={onOpenStoreSettings}
        className="p-4 border-b border-slate-800 flex items-center gap-3 hover:bg-slate-800/60 transition-colors cursor-pointer group"
        title="คลิกเพื่อตั้งค่าชื่อร้านและโลโก้"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-md border border-slate-700/60 bg-slate-800 p-0.5 group-hover:border-emerald-500/60 transition-colors">
          <img
            src={storeSettings?.logo_url || '/logo.png'}
            alt="Store Logo"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h1 className="font-bold text-lg text-white tracking-wide truncate group-hover:text-emerald-400 transition-colors">
              {storeSettings?.store_name || 'Pouch'}
            </h1>
            <span className="opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-emerald-400 transition-opacity p-0.5">
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-amber-400/80 truncate">
            {storeSettings?.store_subtitle || 'ระบบแคชเชียร์ & คลังสต็อก'}
          </p>
        </div>
      </div>

      {/* Barcode listener indicator */}
      <div className="mx-4 my-3 px-3 py-2 bg-slate-800/80 rounded-lg flex items-center gap-2 border border-slate-700/60">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs text-slate-300 font-medium">พร้อมยิงบาร์โค้ด USB</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto scrollbar-none">
        {/* 1. ขายหน้าร้าน (Cashier) */}
        <button
          onClick={() => setActiveTab('pos')}
          type="button"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'pos'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />
          <span className="truncate">ขายหน้าร้าน (Cashier)</span>
          {cartCount > 0 && (
            <span className="ml-auto bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-xs">
              {cartCount}
            </span>
          )}
        </button>

        {/* 2. คลังสินค้า & ต้นทุน (Inventory) */}
        <button
          onClick={() => setActiveTab('inventory')}
          type="button"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'inventory'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-5 h-5 shrink-0" />
          <span className="truncate">คลังสินค้า &amp; ต้นทุน</span>
        </button>

        {/* 3. ภาพรวมกำไร-ขาดทุน */}
        <button
          onClick={() => setActiveTab('accounting')}
          type="button"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'accounting'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 shrink-0" />
          <span className="truncate">ภาพรวมกำไร-ขาดทุน</span>
        </button>

        {/* 4. ประวัติใบเสร็จดิจิทัล */}
        <button
          onClick={() => setActiveTab('receipts')}
          type="button"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'receipts'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5 shrink-0" />
          <span className="truncate">ประวัติใบเสร็จดิจิทัล</span>
          {orderHistoryCount > 0 && (
            <span className="ml-auto bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full text-xs">
              {orderHistoryCount}
            </span>
          )}
        </button>

        {/* 5. บัญชีภาษีสรรพากร */}
        <button
          onClick={() => setActiveTab('tax')}
          type="button"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'tax'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="truncate">บัญชีภาษี สรรพากร</span>
          <span className="ml-auto bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
            ม.40(8)
          </span>
        </button>
      </nav>

      {/* VAT Progress Indicator in Sidebar Footer */}
      {taxSummary && (
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-xs space-y-2">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>เกณฑ์ VAT 1.8M</span>
            </span>
            <span className="font-bold text-amber-400">{taxSummary.vat?.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                taxSummary.vat?.is_required ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, taxSummary.vat?.progress_percentage || 0)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {taxSummary.vat?.is_required
              ? 'เกินเกณฑ์ 1.8M ต้องจด VAT'
              : `ยอดขายปีนี้ ฿${(taxSummary.total_revenue || 0).toLocaleString()}`}
          </p>
        </div>
      )}

      {/* DATA MANAGEMENT (DEMO / CLEAR) */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-1">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" />
            <span>ฐานข้อมูลระบบ</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onLoadSeed}
            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg flex items-center justify-center gap-1 font-medium text-[11px] transition-colors border border-slate-700/60"
            title="โหลดสินค้าตัวอย่าง 5 รายการ เพื่อทดสอบระบบ"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>ใส่ Demo</span>
          </button>
          <button
            type="button"
            onClick={onClearData}
            className="py-1.5 px-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-lg flex items-center justify-center gap-1 font-medium text-[11px] transition-colors border border-slate-700/60"
            title="ล้างข้อมูลสินค้า ประวัติบิล และบัญชีทั้งหมด คืนค่าเริ่มต้น"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ล้างระบบ</span>
          </button>
        </div>
      </div>

      {/* APP VERSION & AUTO-UPDATE FOOTER */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400" title="เวอร์ชันปัจจุบันของโปรแกรม">
          <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] text-slate-300">v{appVersion}</span>
        </div>
        <button
          type="button"
          onClick={onCheckUpdate}
          disabled={isCheckingUpdate}
          className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 text-[11px] font-medium transition-colors border border-slate-700/60 disabled:opacity-60 cursor-pointer"
          title="ตรวจหาเวอร์ชันใหม่จาก GitHub Releases"
        >
          <RotateCw className={`w-3 h-3 ${isCheckingUpdate ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          <span>{isCheckingUpdate ? 'กำลังเช็ค...' : 'ตรวจหาอัปเดต'}</span>
        </button>
      </div>
    </aside>
  );
}
