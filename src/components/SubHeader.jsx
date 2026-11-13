import React from 'react';
import { Store, Clock, Coins, RefreshCw, Lock } from 'lucide-react';

export default function SubHeader({ onRefreshTax, cashDrawerAmount = 5000 }) {
  return (
    <div className="h-10 w-full shrink-0 bg-surface-container-low border-b border-surface-container-high px-4 lg:px-6 flex items-center justify-between text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-20">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <Store className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-on-surface">สาขา 01 (สยามพารากอน)</span>
        </div>
        <span className="text-outline-variant shrink-0">•</span>
        <div className="flex items-center gap-1.5 shrink-0 text-on-surface-variant">
          <Clock className="w-3.5 h-3.5" />
          <span>กะเช้า 08:30 - 16:30</span>
        </div>
        <span className="text-outline-variant shrink-0">•</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-on-surface-variant">แคชลิ้นชัก:</span>
          <span className="font-bold text-on-surface font-mono">
            ฿{cashDrawerAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefreshTax}
          className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest hover:bg-surface-container rounded-full border border-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
          type="button"
          title="ซิงค์ข้อมูลภาษี"
        >
          <RefreshCw className="w-3 h-3 text-primary" />
          <span>ดึงข้อมูลภาษี</span>
        </button>
        <button
          onClick={() => alert('สรุปยอดปิดกะรอบเช้าเรียบร้อย ระบบพร้อมพิมพ์รายงาน')}
          className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest hover:bg-surface-container rounded-full border border-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
          type="button"
        >
          <Lock className="w-3 h-3 text-on-surface-variant" />
          <span>สรุปปิดกะ</span>
        </button>
      </div>
    </div>
  );
}
