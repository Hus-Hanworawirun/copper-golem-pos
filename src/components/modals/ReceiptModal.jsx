import React from 'react';
import { Receipt, X, Printer, Check } from 'lucide-react';

export default function ReceiptModal({
  order,
  onClose
}) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const vat = Number(((order.total_amount || 0) * 7 / 107).toFixed(2));
  const preVat = Number(((order.total_amount || 0) - vat).toFixed(2));

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-3xl max-w-sm w-full border border-surface-container-high shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
            <Receipt className="w-4 h-4 text-primary" />
            <span>ใบเสร็จรับเงินดิจิทัล (Digital Receipt)</span>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Slip Body */}
        <div className="p-5 space-y-3 font-mono text-xs text-on-surface">
          {/* Header */}
          <div className="text-center space-y-0.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white mx-auto flex items-center justify-center font-bold mb-1 shadow-xs overflow-hidden">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <h3 className="font-bold text-xs text-on-surface font-sans">COPPER GOLEM POS &amp; RETAIL</h3>
            <p className="text-[10px] text-on-surface-variant font-sans">ระบบขายปลีกและบันทึกบัญชีสินค้า</p>
            <p className="text-[10px] text-on-surface-variant font-sans">เลขประจำตัวผู้เสียภาษี: 0105566012345</p>
            <p className="text-[10px] text-primary font-sans font-bold pt-0.5">ใบกำกับภาษีอย่างย่อ (ABB)</p>
            <p className="text-[10px] text-outline font-mono">เลขที่: {order.order_no}</p>
            <p className="text-[10px] text-outline">
              {new Date(order.created_at).toLocaleString('th-TH')}
            </p>
          </div>

          {/* Items List */}
          <div className="border-t border-b border-dashed border-outline-variant py-2.5 space-y-1.5">
            {order.items?.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <div>
                  <div className="font-sans font-semibold text-on-surface">{it.product_name}</div>
                  <div className="text-on-surface-variant text-[10px]">
                    {it.quantity} x ฿{(it.unit_price || 0).toFixed(2)}
                  </div>
                </div>
                <span className="font-bold text-on-surface font-mono">฿{(it.subtotal || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Tax & Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-on-surface-variant text-[11px]">
              <span>ยอดรวมก่อนภาษี (Pre-VAT)</span>
              <span className="font-mono">฿{preVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-[11px]">
              <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
              <span className="font-mono">฿{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-on-surface text-sm pt-1 border-t border-surface-container">
              <span>ยอดรวมสุทธิ</span>
              <span className="text-primary font-bold font-mono">฿{(order.total_amount || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-on-surface-variant text-[11px] pt-0.5">
              <span>สถานะรายการ</span>
              <span className="font-semibold text-primary">
                บันทึกบัญชีสำเร็จ
              </span>
            </div>

            {order.change_amount > 0 && (
              <>
                <div className="flex justify-between text-on-surface-variant text-[11px]">
                  <span>รับเงินมา</span>
                  <span className="font-mono">฿{(order.cash_received || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-primary text-[11px]">
                  <span>เงินทอน</span>
                  <span className="font-mono">฿{(order.change_amount || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center pt-1 text-[10px] text-on-surface-variant font-sans">
            บันทึกข้อมูลและตัดสต็อก FIFO เรียบร้อยแล้ว
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2 font-sans">
            <button
              onClick={handlePrint}
              type="button"
              className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors border border-surface-container-high"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบเสร็จ</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2 bg-primary-container hover:bg-primary text-white font-bold rounded-full text-xs transition-all shadow-sm active:scale-95"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
