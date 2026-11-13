import React from 'react';

export default function Footer({ currentRevenue = 0 }) {
  const vatThreshold = 1800000;
  const pct = Math.min(100, Math.max(0, (currentRevenue / vatThreshold) * 100));

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-inverse-surface/95 backdrop-blur-md text-inverse-on-surface px-margin z-40 flex items-center justify-between shadow-[0_-2px_8px_rgba(0,0,0,0.08)] border-t border-white/10">
      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">account_balance</span>
          <span className="font-label-sm text-label-sm text-inverse-on-surface/80">เพดานภาษีมูลค่าเพิ่ม ม.40(8):</span>
          <span className="font-label-sm text-label-sm text-inverse-on-surface font-bold">
            ฿{currentRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ฿1,800,000.00
          </span>
          <span className="font-label-sm text-label-sm text-primary-fixed font-semibold">({pct.toFixed(1)}%)</span>
        </div>
        <div className="hidden md:flex items-center gap-space-xs">
          <div className="w-24 h-1.5 bg-[#12121b] rounded-full overflow-hidden border border-white/20">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct > 80 ? 'bg-error' : 'bg-primary-container'
              }`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[14px] text-primary-fixed">check_circle</span>
          <span className="font-label-sm text-label-sm text-inverse-on-surface/80">
            Engine: SQLite WAL Local Cache Active
          </span>
        </div>
        <span className="text-white/20 font-label-sm text-label-sm">|</span>
        <span className="font-label-sm text-label-sm text-inverse-on-surface/60">
          POS v2.4.0 Thai Tax Ready
        </span>
      </div>
    </footer>
  );
}
