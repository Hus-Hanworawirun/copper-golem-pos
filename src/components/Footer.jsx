import React from 'react';
import { Landmark, CheckCircle2 } from 'lucide-react';

export default function Footer({ currentRevenue = 0 }) {
  const vatThreshold = 1800000;
  const pct = Math.min(100, Math.max(0, (currentRevenue / vatThreshold) * 100));

  return (
    <footer className="h-9 w-full shrink-0 bg-[#181824] text-inverse-on-surface px-4 lg:px-6 flex items-center justify-between text-xs border-t border-white/10 z-20 shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-primary-fixed" />
          <span className="text-inverse-on-surface/80">เพดานภาษีมูลค่าเพิ่ม ม.40(8):</span>
          <span className="font-bold text-white font-mono">
            ฿{currentRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ฿1,800,000.00
          </span>
          <span className="text-primary-fixed font-semibold font-mono">({pct.toFixed(1)}%)</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/15">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct > 80 ? 'bg-rose-500' : 'bg-primary-container'
              }`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-inverse-on-surface/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>SQLite WAL Local Cache Active</span>
        </div>
        <span className="text-white/20">|</span>
        <span className="text-inverse-on-surface/60 font-mono">
          POS v2.4.0 Thai Tax Ready
        </span>
      </div>
    </footer>
  );
}
