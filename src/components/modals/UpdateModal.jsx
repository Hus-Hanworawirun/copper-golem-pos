import React from 'react';
import {
  Download,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
  ArrowUpCircle
} from 'lucide-react';

export default function UpdateModal({
  isOpen,
  onClose,
  updateState,
  onRestart,
  onCheckAgain
}) {
  if (!isOpen) return null;

  const {
    status = 'idle', // 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'not-available' | 'error'
    version = '',
    currentVersion = '1.0.1',
    percent = 0,
    speed = 0,
    transferred = 0,
    total = 0,
    message = '',
    isPackaged = false
  } = updateState || {};

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 select-none font-['Prompt',sans-serif] animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">ระบบอัปเดตเวอร์ชัน</h3>
              <p className="text-[11px] text-slate-400">
                เวอร์ชันปัจจุบัน: <span className="font-mono text-emerald-400">v{currentVersion}</span>
                {!isPackaged && <span className="ml-1 text-amber-400/80">(Dev Mode)</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-center">
          {/* Status 1: Checking */}
          {status === 'checking' && (
            <div className="py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400 animate-spin">
                <RotateCw className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-white">กำลังตรวจหาเวอร์ชันใหม่...</h4>
              <p className="text-xs text-slate-400">กำลังเชื่อมต่อไปยัง GitHub Releases</p>
            </div>
          )}

          {/* Status 2: Available */}
          {status === 'available' && (
            <div className="py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-white">พบเวอร์ชันใหม่ {version}!</h4>
              <p className="text-xs text-slate-300">ระบบกำลังเริ่มดาวน์โหลดตัวติดตั้ง...</p>
            </div>
          )}

          {/* Status 3: Downloading */}
          {status === 'downloading' && (
            <div className="py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">กำลังดาวน์โหลดเวอร์ชัน {version}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ดาวน์โหลดแล้ว {formatBytes(transferred)} / {formatBytes(total)} ({formatBytes(speed)}/s)
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-medium text-slate-300">
                  <span>ความคืบหน้า</span>
                  <span className="text-emerald-400 font-bold">{percent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Status 4: Downloaded (Ready to Install) */}
          {status === 'downloaded' && (
            <div className="py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">ดาวน์โหลดเวอร์ชัน {version} สำเร็จแล้ว!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  พร้อมติดตั้งทันที คลิกปุ่มด้านล่างเพื่อรีสตาร์ตและใช้งานเวอร์ชันใหม่
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onRestart}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>รีสตาร์ตเพื่อติดตั้งทันที</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  ไว้ติดตั้งภายหลังเมื่อปิดโปรแกรม
                </button>
              </div>
            </div>
          )}

          {/* Status 5: Not Available (Up to date) */}
          {status === 'not-available' && (
            <div className="py-3 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">โปรแกรมเป็นเวอร์ชันล่าสุดแล้ว</h4>
                <p className="text-xs text-slate-400 mt-1">
                  ปัจจุบันใช้งานเวอร์ชัน <span className="font-mono text-emerald-400">v{currentVersion}</span> ไม่พบรายการอัปเดตใหม่
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onCheckAgain}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>ตรวจสอบอีกครั้ง</span>
                </button>
              </div>
            </div>
          )}

          {/* Status 6: Error */}
          {status === 'error' && (
            <div className="py-3 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">เกิดข้อผิดพลาดในการตรวจหาอัปเดต</h4>
                <p className="text-xs text-rose-300/80 mt-1 max-w-xs mx-auto truncate font-mono">
                  {message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ GitHub ได้'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onCheckAgain}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>ลองใหม่อีกครั้ง</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
