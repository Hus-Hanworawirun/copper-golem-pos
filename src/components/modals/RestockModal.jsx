import React from 'react';
import { Archive, X, Package } from 'lucide-react';

export default function RestockModal({
  isOpen,
  onClose,
  product,
  restockForm,
  setRestockForm,
  onSubmitRestock
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Prompt',sans-serif]">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              รับเข้าสต็อกสินค้า (FIFO Batch)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
              <p className="text-[11px] text-slate-500">
                สต็อกปัจจุบัน: <span className="font-bold text-emerald-600 font-mono">{product.stock_qty}</span> ชิ้น • ทุนเดิม: ฿{(product.cost_price || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmitRestock} className="space-y-3.5">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                จำนวนที่รับเข้าเพิ่ม (ชิ้น) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="เช่น 24"
                value={restockForm.add_qty}
                onChange={(e) => setRestockForm({ ...restockForm, add_qty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ต้นทุนต่อหน่วยล็อตนี้ (฿/ชิ้น)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder={`ค่าเริ่มต้น: ${(product.cost_price || 0).toFixed(2)}`}
                value={restockForm.batch_cost}
                onChange={(e) => setRestockForm({ ...restockForm, batch_cost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                หากเว้นว่าง ระบบจะใช้ราคาต้นทุนเดิม (฿{(product.cost_price || 0).toFixed(2)})
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                หมายเหตุการรับเข้า / ซัพพลายเออร์
              </label>
              <input
                type="text"
                placeholder="เช่น สั่งเพิ่มจาก บจก. ซัพพลาย"
                value={restockForm.note}
                onChange={(e) => setRestockForm({ ...restockForm, note: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="updateCost"
                checked={restockForm.update_cost_price}
                onChange={(e) => setRestockForm({ ...restockForm, update_cost_price: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="updateCost" className="text-xs text-slate-600 cursor-pointer">
                อัปเดตราคาต้นทุนมาตรฐานของสินค้าตัวนี้ตามล็อตใหม่ด้วย
              </label>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                ยืนยันการรับเข้า
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
