import React from 'react';

export default function SubHeader({ onRefreshTax, cashDrawerAmount = 5000 }) {
  return (
    <div className="fixed top-20 xl:top-20 left-0 right-0 z-40 h-11 w-full px-margin bg-surface-container-low border-b border-surface-container-high flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-space-md overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-space-xs shrink-0">
          <span className="material-symbols-outlined text-[16px] text-primary">storefront</span>
          <span className="font-label-md text-label-md text-on-surface font-semibold">สาขา 01 (สยามพารากอน)</span>
        </div>
        <span className="text-outline-variant font-label-sm text-label-sm shrink-0">•</span>
        <div className="flex items-center gap-space-xs shrink-0">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">schedule</span>
          <span className="font-label-md text-label-md text-on-surface-variant">กะปัจจุบัน: รอบเช้า 08:30 - 16:30</span>
        </div>
        <span className="text-outline-variant font-label-sm text-label-sm shrink-0">•</span>
        <div className="flex items-center gap-space-xs shrink-0">
          <span className="font-label-sm text-label-sm text-on-surface-variant">แคชลิ้นชัก:</span>
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            ฿{cashDrawerAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-space-sm shrink-0">
        <button
          onClick={onRefreshTax}
          className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-lowest hover:bg-surface-container-high rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors"
          type="button"
          title="ซิงค์ข้อมูลสรรพากรและบัญชี"
        >
          <span className="material-symbols-outlined text-[14px] text-primary">sync</span>
          <span className="font-label-sm text-label-sm text-on-surface">ดึงข้อมูลภาษี</span>
        </button>
        <button
          onClick={() => alert('สรุปยอดปิดกะรอบเช้าเรียบร้อย ระบบพร้อมพิมพ์รายงานสรุปกะ')}
          className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-lowest hover:bg-surface-container-high rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">lock_clock</span>
          <span className="font-label-sm text-label-sm text-on-surface">สรุปปิดกะ</span>
        </button>
      </div>
    </div>
  );
}
