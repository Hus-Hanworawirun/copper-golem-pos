import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Calculator,
  BookOpen,
  PlusCircle,
  Save,
  Trash2,
  ThumbsUp
} from 'lucide-react';

export default function TaxTab({
  taxSummary,
  taxCashFlow,
  taxYear,
  setTaxYear,
  taxPeriod,
  setTaxPeriod,
  expenses = [],
  onDeleteExpense,
  onSaveExpense,
  onExportCsv
}) {
  const [localExpense, setLocalExpense] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    category: 'ค่าเช่าสถานที่',
    title: '',
    amount: '',
    receipt_no: '',
    note: ''
  });

  const handleInlineExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!localExpense.title || !localExpense.amount) {
      alert('กรุณากรอกชื่อรายการและจำนวนเงิน');
      return;
    }
    await onSaveExpense(localExpense);
    setLocalExpense({
      expense_date: new Date().toISOString().slice(0, 10),
      category: 'ค่าเช่าสถานที่',
      title: '',
      amount: '',
      receipt_no: '',
      note: ''
    });
  };

  const revenue = taxSummary?.total_revenue || 0;
  const cogs = taxSummary?.total_cogs || 0;
  const opex = taxSummary?.total_expenses || 0;
  const totalDeductionsActual = cogs + opex;
  const personalAllowance = 60000;

  // Actual method PIT
  const netTaxableActual = Math.max(0, revenue - totalDeductionsActual - personalAllowance);
  const calcThaiPit = (netIncome) => {
    if (netIncome <= 150000) return 0;
    if (netIncome <= 300000) return (netIncome - 150000) * 0.05;
    if (netIncome <= 500000) return 7500 + (netIncome - 300000) * 0.10;
    if (netIncome <= 750000) return 27500 + (netIncome - 500000) * 0.15;
    if (netIncome <= 1000000) return 65000 + (netIncome - 750000) * 0.20;
    return 115000 + (netIncome - 1000000) * 0.25;
  };

  const estimatedTaxActual = calcThaiPit(netTaxableActual);

  // 60% standard lump sum method
  const standardDeduction = revenue * 0.60;
  const netTaxableStandard = Math.max(0, revenue - standardDeduction - personalAllowance);
  const estimatedTaxStandard = calcThaiPit(netTaxableStandard);

  // VAT 1.8M threshold calculation
  const vatThreshold = 1800000;
  const vatPct = Math.min(100, Math.max(0, (revenue / vatThreshold) * 100));
  const vatRemaining = Math.max(0, vatThreshold - revenue);

  return (
    <div className="w-full p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-white text-[11px] font-bold uppercase tracking-wider">
              Thai RD Standard
            </span>
            <span>•</span>
            <span className="font-medium">
              ปีภาษี {taxYear + 543} (Tax Year {taxYear})
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight">
            ภาษีเงินได้บุคคลธรรมดาพาณิชยกรรม ม.40(8)
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            ระบบตรวจวัดเพดาน VAT 1.8M และสมุดบัญชีเงินสดรับจ่าย ป.ส. 10 สอดคล้องตามประกาศกรมสรรพากร
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest text-on-surface text-xs font-semibold rounded-full shadow-xs hover:bg-surface-container border border-surface-container-high transition-all"
            type="button"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            <span>พิมพ์ ป.ส. 10</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-container text-white text-xs font-bold rounded-full shadow-md hover:bg-primary transition-all active:scale-95"
            type="button"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด Excel</span>
          </button>
        </div>
      </section>

      {/* VAT 1.8M Hero Telemetry Bar */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container-high p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-on-surface">
                  เพดานภาษีมูลค่าเพิ่ม 1.8 ล้านบาท (VAT Threshold)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-[10px] text-primary font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> Live
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant block">
                เกณฑ์ยื่นจดภาษีมูลค่าเพิ่ม (ภ.พ.01) เมื่อรายรับเกิน 1,800,000 บาท/ปี
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-surface-container-high text-xs shrink-0">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-semibold text-on-surface">
              {vatPct >= 100
                ? 'เกินเกณฑ์ 1.8M แล้ว (ต้องจด VAT)'
                : vatPct >= 80
                ? 'เฝ้าระวัง: ใกล้ถึงเกณฑ์ 80%'
                : 'ปลอดภัย: ยังไม่ถึงเกณฑ์จด VAT'}
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full">
          <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                vatPct >= 100 ? 'bg-rose-500' : vatPct >= 80 ? 'bg-amber-500' : 'bg-primary-container'
              }`}
              style={{ width: `${vatPct}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-1.5 font-mono">
            <span>฿0.00</span>
            <span className="text-primary font-bold">
              ปัจจุบัน {vatPct.toFixed(2)}% (฿{revenue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
            <span className="font-bold text-on-surface">฿1,800,000.00 (เพดาน)</span>
          </div>
        </div>
      </section>

      {/* PIT Estimator Dual Cards */}
      <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high">
        <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
          <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-on-surface">
            เปรียบเทียบการคำนวณภาษีบุคคลธรรมดา ม.40(8)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
          {/* Method 1: Actual Cost */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border border-surface-container-high relative overflow-hidden flex flex-col justify-between">
            {estimatedTaxActual <= estimatedTaxStandard && (
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-bl-lg flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> แนะนำ
              </div>
            )}
            <div>
              <span className="font-bold text-xs text-on-surface block mb-1">
                วิธีที่ 1: หักค่าใช้จ่ายตามจริง (FIFO + OPEX)
              </span>
              <p className="text-[11px] text-on-surface-variant mb-2">
                ใช้ต้นทุนสินค้าขายจริง (FIFO) รวมกับค่าใช้จ่ายดำเนินงานร้านที่บันทึก
              </p>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-sans">รายได้สะสม:</span>
                  <span>฿{revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span className="font-sans">หัก ต้นทุนขาย (FIFO):</span>
                  <span>-฿{cogs.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span className="font-sans">หัก ค่าใช้จ่ายร้าน (OPEX):</span>
                  <span>-฿{opex.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface font-semibold pt-1 border-t border-surface-container font-sans">
                  <span>เงินได้สุทธิ:</span>
                  <span className="font-mono font-bold">฿{netTaxableActual.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface">ภาษีที่ต้องชำระ:</span>
              <span className="text-sm font-bold text-primary font-mono">
                ฿{estimatedTaxActual.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Method 2: Standard 60% */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border border-surface-container-high flex flex-col justify-between">
            <div>
              <span className="font-bold text-xs text-on-surface block mb-1">
                วิธีที่ 2: หักค่าใช้จ่ายเหมา 60%
              </span>
              <p className="text-[11px] text-on-surface-variant mb-2">
                หักเหมาอัตโนมัติตามอัตรากลุ่มพาณิชย์ซื้อมาขายไป
              </p>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-sans">รายได้สะสม:</span>
                  <span>฿{revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-sans">หัก เหมา 60%:</span>
                  <span>-฿{standardDeduction.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-sans">หัก ลดหย่อนส่วนตัว:</span>
                  <span>-฿{personalAllowance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface font-semibold pt-1 border-t border-surface-container font-sans">
                  <span>เงินได้สุทธิ:</span>
                  <span className="font-mono font-bold">฿{netTaxableStandard.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface">ภาษีที่ต้องชำระ:</span>
              <span className="text-sm font-bold text-secondary font-mono">
                ฿{estimatedTaxStandard.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Midnight Slate: Por Sor 10 Ledger */}
      <section className="bg-[#181824] text-inverse-on-surface rounded-2xl p-4 shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-fixed" />
            <h2 className="text-sm font-bold text-white">
              สมุดบัญชีเงินสดรับ-จ่าย (แบบ ป.ส. 10 กรมสรรพากร)
            </h2>
          </div>

          <div className="inline-flex items-center bg-white/10 rounded-full p-0.5 border border-white/10">
            {[
              { id: 'all', label: `ทั้งปี ${taxYear + 543}` },
              { id: 'h1', label: 'ครึ่งปีแรก (ม.ค. - มิ.ย.)' },
              { id: 'h2', label: 'ครึ่งปีหลัง' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setTaxPeriod(period.id)}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  taxPeriod === period.id
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'text-inverse-on-surface/70 hover:text-white'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pt-3 items-start">
          {/* OPEX Form (4 Cols) */}
          <div className="xl:col-span-4 bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white pb-2 border-b border-white/10">
              <PlusCircle className="w-3.5 h-3.5 text-primary-fixed" />
              <span>บันทึกค่าใช้จ่ายร้าน (OPEX)</span>
            </div>

            <form onSubmit={handleInlineExpenseSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-inverse-on-surface/70 block mb-0.5">วันที่</label>
                  <input
                    type="date"
                    value={localExpense.expense_date}
                    onChange={(e) => setLocalExpense({ ...localExpense, expense_date: e.target.value })}
                    className="w-full bg-[#12121b] text-white px-2 py-1.5 rounded-lg border border-white/15 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-inverse-on-surface/70 block mb-0.5">หมวดหมู่</label>
                  <select
                    value={localExpense.category}
                    onChange={(e) => setLocalExpense({ ...localExpense, category: e.target.value })}
                    className="w-full bg-[#12121b] text-white px-2 py-1.5 rounded-lg border border-white/15 focus:outline-none"
                  >
                    <option value="ค่าเช่าสถานที่">ค่าเช่าสถานที่</option>
                    <option value="ค่าน้ำ-ค่าไฟ">ค่าน้ำ-ค่าไฟ</option>
                    <option value="ค่าแรงพนักงาน">ค่าแรงพนักงาน</option>
                    <option value="ค่าบรรจุภัณฑ์">ค่าบรรจุภัณฑ์</option>
                    <option value="ค่าการตลาด">ค่าการตลาด</option>
                    <option value="ค่าใช้จ่ายอื่นๆ">ค่าใช้จ่ายอื่นๆ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-inverse-on-surface/70 block mb-0.5">คำอธิบาย</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ค่าเช่าหน้าร้าน"
                  value={localExpense.title}
                  onChange={(e) => setLocalExpense({ ...localExpense, title: e.target.value })}
                  className="w-full bg-[#12121b] text-white px-2.5 py-1.5 rounded-lg border border-white/15 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-inverse-on-surface/70 block mb-0.5">จำนวนเงิน (฿)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={localExpense.amount}
                    onChange={(e) => setLocalExpense({ ...localExpense, amount: e.target.value })}
                    className="w-full bg-[#12121b] text-white px-2.5 py-1.5 rounded-lg font-mono font-bold border border-white/15 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-inverse-on-surface/70 block mb-0.5">เลขที่ใบเสร็จ</label>
                  <input
                    type="text"
                    placeholder="INV-001"
                    value={localExpense.receipt_no}
                    onChange={(e) => setLocalExpense({ ...localExpense, receipt_no: e.target.value })}
                    className="w-full bg-[#12121b] text-white px-2.5 py-1.5 rounded-lg font-mono border border-white/15 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-full bg-primary-container hover:bg-primary text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึกเข้า ป.ส. 10</span>
              </button>
            </form>

            {/* Expenses List */}
            <div className="pt-2 border-t border-white/10 space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-none">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-[11px]"
                >
                  <div className="truncate pr-1">
                    <span className="text-white block truncate">{exp.title}</span>
                    <span className="text-[10px] text-inverse-on-surface/50">{exp.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-rose-300 font-bold">-฿{Number(exp.amount).toFixed(2)}</span>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 hover:text-rose-400 text-inverse-on-surface/40 transition-colors"
                      type="button"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Por Sor 10 Table (8 Cols) */}
          <div className="xl:col-span-8 bg-white/5 rounded-xl p-3.5 border border-white/10 overflow-hidden">
            <div className="w-full overflow-x-auto max-h-[460px] overflow-y-auto scrollbar-none">
              {!taxCashFlow?.rows || taxCashFlow.rows.length === 0 ? (
                <div className="py-12 text-center text-inverse-on-surface/40 text-xs">
                  ยังไม่มีรายการเงินสดรับ-จ่ายในงวดนี้
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-inverse-on-surface/60 border-b border-white/10 pb-2">
                      <th className="py-2 px-2.5 font-semibold">วัน/เดือน/ปี</th>
                      <th className="py-2 px-2.5 font-semibold font-sans">รายการ</th>
                      <th className="py-2 px-2.5 font-semibold">เอกสารอ้างอิง</th>
                      <th className="py-2 px-2.5 font-semibold text-right text-emerald-400">เงินสดรับ</th>
                      <th className="py-2 px-2.5 font-semibold text-right text-rose-300">เงินสดจ่าย</th>
                      <th className="py-2 px-2.5 font-semibold text-right">คงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {taxCashFlow.rows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-2.5 text-inverse-on-surface/80 whitespace-nowrap">{r.date}</td>
                        <td className="py-2 px-2.5 text-white font-sans">{r.description}</td>
                        <td className="py-2 px-2.5 text-inverse-on-surface/70">{r.ref_no || '-'}</td>
                        <td className="py-2 px-2.5 text-right font-bold text-emerald-400">
                          {r.cash_in > 0 ? `+${r.cash_in.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-2.5 text-right font-bold text-rose-300">
                          {r.cash_out > 0 ? `-${r.cash_out.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-2.5 text-right font-bold text-white">฿{r.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
