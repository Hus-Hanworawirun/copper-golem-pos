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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Prompt',sans-serif]">
      <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>ใบเสร็จรับเงินดิจิทัล (Digital Receipt)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Slip Body */}
        <div className="p-5 space-y-3 font-mono text-xs text-slate-800">
          {/* Header */}
          <div className="text-center space-y-0.5">
            <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-1 overflow-hidden shadow-xs border border-slate-200 bg-white p-0.5">
              <img
                src="/logo.png"
                alt="Pouch Logo"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <h3 className="font-bold text-sm text-slate-900 font-sans tracking-wide">POUCH</h3>
            <p className="text-[10px] text-slate-500 font-sans">ระบบขายปลีกและบันทึกบัญชีสินค้า</p>
            <p className="text-[10px] text-slate-500 font-sans">เลขประจำตัวผู้เสียภาษี: 0105566012345</p>
            <p className="text-[10px] text-emerald-700 font-sans font-bold pt-0.5">ใบกำกับภาษีอย่างย่อ (ABB)</p>
            <p className="text-[10px] text-slate-400 font-mono">เลขที่: {order.order_no}</p>
            <p className="text-[10px] text-slate-400">
              {new Date(order.created_at).toLocaleString('th-TH')}
            </p>
          </div>

          {/* Items List */}
          <div className="border-t border-b border-dashed border-slate-300 py-2.5 space-y-1.5">
            {order.items?.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div>
                  <div className="font-sans font-semibold text-slate-900">{it.product_name}</div>
                  <div className="text-slate-500 text-[10px]">
                    {it.quantity} x ฿{(it.unit_price || 0).toFixed(2)}
                  </div>
                </div>
                <span className="font-bold text-slate-900 font-mono">฿{(it.subtotal || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Tax & Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500 text-xs">
              <span>ยอดรวมก่อนภาษี (Pre-VAT)</span>
              <span className="font-mono">฿{preVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-xs">
              <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
              <span className="font-mono">฿{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
              <span>ยอดรวมสุทธิ</span>
              <span className="text-emerald-600 font-bold font-mono">฿{(order.total_amount || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-500 text-xs pt-0.5">
              <span>สถานะรายการ</span>
              <span className="font-semibold text-emerald-600">
                บันทึกบัญชีสำเร็จ
              </span>
            </div>

            {order.change_amount > 0 && (
              <>
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>รับเงินมา</span>
                  <span className="font-mono">฿{(order.cash_received || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 text-xs">
                  <span>เงินทอน</span>
                  <span className="font-mono">฿{(order.change_amount || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center pt-1 text-[10px] text-slate-400 font-sans">
            บันทึกข้อมูลและตัดสต็อก FIFO เรียบร้อยแล้ว
          </div>

          {/* Actions */}
          <div className="pt-2.5 flex gap-2 font-sans">
            <button
              onClick={handlePrint}
              type="button"
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>พิมพ์ใบเสร็จ</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
