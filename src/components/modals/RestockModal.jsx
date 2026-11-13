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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-3xl max-w-md w-full border border-surface-container-high shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-on-surface">
              รับเข้าสต็อกสินค้า (FIFO Batch)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-center gap-2.5 p-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-outline" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-on-surface truncate">{product.name}</h4>
              <p className="text-[11px] text-on-surface-variant">
                สต็อกปัจจุบัน: <span className="font-bold text-primary font-mono">{product.stock_qty}</span> ชิ้น • ทุนเดิม: ฿{(product.cost_price || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmitRestock} className="space-y-3">
            <div>
              <label className="font-semibold text-on-surface block mb-1">
                จำนวนที่รับเข้าเพิ่ม (ชิ้น) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="เช่น 24"
                value={restockForm.add_qty}
                onChange={(e) => setRestockForm({ ...restockForm, add_qty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-sm font-bold font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-semibold text-on-surface block mb-1">
                ต้นทุนต่อหน่วยล็อตนี้ (฿/ชิ้น)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder={`ค่าเริ่มต้น: ${(product.cost_price || 0).toFixed(2)}`}
                value={restockForm.batch_cost}
                onChange={(e) => setRestockForm({ ...restockForm, batch_cost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                หากเว้นว่าง ระบบจะใช้ราคาต้นทุนเดิม (฿{(product.cost_price || 0).toFixed(2)})
              </span>
            </div>

            <div>
              <label className="font-semibold text-on-surface block mb-1">
                หมายเหตุการรับเข้า / ซัพพลายเออร์
              </label>
              <input
                type="text"
                placeholder="เช่น สั่งเพิ่มจาก บจก. ซัพพลาย"
                value={restockForm.note}
                onChange={(e) => setRestockForm({ ...restockForm, note: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="updateCost"
                checked={restockForm.update_cost_price}
                onChange={(e) => setRestockForm({ ...restockForm, update_cost_price: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="updateCost" className="text-[11px] text-on-surface-variant cursor-pointer">
                อัปเดตราคาต้นทุนมาตรฐานของสินค้าตัวนี้ตามล็อตใหม่ด้วย
              </label>
            </div>

            <div className="pt-3 border-t border-surface-container-high flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-primary-container hover:bg-primary text-white text-xs font-bold shadow-md transition-all active:scale-95"
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
