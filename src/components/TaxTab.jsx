import React, { useState } from 'react';

export default function TaxTab({
  taxSummary,
  taxCashFlow,
  taxYear,
  setTaxYear,
  taxPeriod,
  setTaxPeriod,
  expenses = [],
  onOpenExpenseModal,
  onDeleteExpense,
  onSaveExpense,
  onExportCsv
}) {
  // Local state for inline expense form
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
  // Progressive tax calculation for Thailand PIT
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
    <div className="w-full">
      {/* Upper Porcelain Work Surface */}
      <section className="w-full px-margin pt-space-lg pb-space-lg">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Thai RD Standard Compliant
              </span>
              <span className="text-outline-variant font-label-sm text-label-sm">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                ปีประเมินภาษี {taxYear + 543} (Tax Year {taxYear})
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              ภาษีเงินได้บุคคลธรรมดาพาณิชยกรรม ม.40(8)
            </h1>
            <p className="font-body-lg text-body-md text-on-surface-variant max-w-3xl mt-0.5">
              ระบบตรวจวัดเพดาน VAT 1.8M และสมุดบัญชีเงินสดรับจ่าย ป.ส. 10 สอดคล้องตามประกาศกรมสรรพากร อัปเดตรายรับ-ต้นทุน FIFO แบบเรียลไทม์
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-space-xs px-space-md py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-sm hover:bg-surface-container border border-surface-container-high transition-all active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">print</span>
              <span className="font-label-md text-label-md">พิมพ์ ป.ส. 10</span>
            </button>

            <button
              onClick={onExportCsv}
              className="flex items-center gap-space-xs px-space-md py-2.5 bg-primary-container text-on-primary rounded-full shadow-[0px_6px_16px_rgba(91,76,245,0.35)] hover:bg-primary transition-all active:scale-95 font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span className="font-label-md text-label-md">ดาวน์โหลด Excel (UTF-8 BOM)</span>
            </button>
          </div>
        </div>

        {/* VAT 1.8M Real-Time Telemetry Bar */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(15,23,42,0.04)] border border-surface-container-high p-space-lg mb-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[28px]">speed</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    เพดานภาษีมูลค่าเพิ่ม 1.8 ล้านบาท (VAT Threshold Tracker)
                  </span>
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> Live Tracker
                  </span>
                </div>
                <span className="font-body-md text-body-sm text-on-surface-variant">
                  เกณฑ์บังคับยื่นขอจดทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.01) ภายใน 30 วันนับแต่วันที่มีรายรับเกิน 1,800,000 บาท
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low border border-surface-container-high shrink-0">
              <span
                className={`material-symbols-outlined text-[18px] ${
                  vatPct >= 100 ? 'text-error' : vatPct >= 80 ? 'text-amber-500' : 'text-primary'
                }`}
              >
                {vatPct >= 100 ? 'error' : vatPct >= 80 ? 'warning' : 'verified_user'}
              </span>
              <span className="font-label-md text-label-md text-on-surface font-medium">
                {vatPct >= 100
                  ? 'สถานะ: เกินเกณฑ์ 1.8M แล้ว ต้องจด VAT (ภ.พ.01)'
                  : vatPct >= 80
                  ? 'สถานะ: เฝ้าระวัง รายรับใกล้ถึงเกณฑ์ 80%'
                  : 'สถานะ: ปลอดภัย ยังไม่ถึงเกณฑ์จด VAT 1.8 ล้านบาท'}
              </span>
            </div>
          </div>

          {/* Telemetry Gauge Bar with Marks */}
          <div className="relative w-full mb-space-md pt-2">
            <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  vatPct >= 100 ? 'bg-error' : vatPct >= 80 ? 'bg-amber-500' : 'bg-primary-container'
                }`}
                style={{ width: `${vatPct}%` }}
              ></div>
              {/* Safe Zone line at 80% */}
              <div
                className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-outline/40"
                title="เกณฑ์เฝ้าระวัง 80% (1,440,000 บาท)"
              ></div>
            </div>

            {/* Markers */}
            <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant mt-2 font-mono">
              <span>฿0.00 (เริ่มต้นปี)</span>
              <span className="text-primary font-bold">
                ปัจจุบัน {vatPct.toFixed(2)}% (฿{revenue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </span>
              <span>เหลืออีก ฿{vatRemaining.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-on-surface font-bold">฿1,800,000.00 (เพดาน)</span>
            </div>
          </div>
        </div>

        {/* Dual Bento Cards: PIT Estimator */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.04)] border border-surface-container-high">
          <div className="flex items-center justify-between pb-space-md border-b border-surface-container">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[22px]">calculate</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  เครื่องคำนวณและเปรียบเทียบภาษีบุคคลธรรมดา ม.40(8)
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  เปรียบเทียบการหักค่าใช้จ่าย 2 วิธีตามประมวลรัษฎากร เพื่อเลือกวิธีที่ประหยัดภาษีสูงสุด
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mt-space-md">
            {/* Method 1: Actual Cost (FIFO COGS + OPEX) */}
            <div className="relative bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between overflow-hidden border border-surface-container-high">
              {estimatedTaxActual <= estimatedTaxStandard && (
                <div className="absolute top-0 right-0 px-space-md py-1 bg-primary text-on-primary font-label-sm text-label-sm rounded-bl-xl font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span> แนะนำสำหรับธุรกิจนี้
                </div>
              )}
              <div>
                <div className="flex items-center gap-space-xs mb-space-xs">
                  <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                    A
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    วิธีที่ 1: หักค่าใช้จ่ายตามจริงและสมควร
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  ใช้หลักฐานต้นทุนสินค้าขายจริง (FIFO COGS) รวมกับค่าใช้จ่ายดำเนินงานร้านค้า (OPEX) ที่บันทึกใน ป.ส. 10
                </p>

                <div className="space-y-space-xs text-body-md font-mono">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant font-sans text-sm">รายได้พึงประเมินสะสม:</span>
                    <span className="font-medium text-on-surface">฿{revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant font-sans text-sm">หัก ต้นทุนสินค้าขายจริง (FIFO COGS):</span>
                    <span className="font-medium text-error">-฿{cogs.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant font-sans text-sm">หัก ค่าใช้จ่ายดำเนินงานร้านค้า (OPEX):</span>
                    <span className="font-medium text-error">-฿{opex.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 bg-surface-container px-space-sm rounded-lg font-sans">
                    <span className="text-on-surface font-semibold text-sm">รวมค่าใช้จ่ายหักได้จริง:</span>
                    <span className="font-bold text-on-surface font-mono">฿{totalDeductionsActual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant font-sans text-sm">หัก ลดหย่อนส่วนตัวผู้มีเงินได้:</span>
                    <span className="font-medium text-on-surface">-฿{personalAllowance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-space-md pt-space-xs bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between border border-surface-container-high">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">เงินได้สุทธิคำนวณภาษี</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-mono font-bold">
                    ฿{netTaxableActual.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">ประมาณการภาษีชำระ</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold font-mono">
                    ฿{estimatedTaxActual.toFixed(2)}
                  </span>
                  <span className="font-label-sm text-[10px] text-primary block leading-none">
                    {netTaxableActual <= 150000 ? '(ได้รับยกเว้น ฿150,000 แรก)' : 'คำนวณแบบขั้นบันได'}
                  </span>
                </div>
              </div>
            </div>

            {/* Method 2: Standard Lump Sum 60% */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container-high">
              <div>
                <div className="flex items-center gap-space-xs mb-space-xs">
                  <span className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-sm text-label-sm font-bold">
                    B
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    วิธีที่ 2: หักค่าใช้จ่ายเหมา 60% ตาม พ.ร.ฎ.
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                  หักเหมาตามอัตรากำหนดกลุ่มพาณิชย์ซื้อมาขายไป โดยไม่ต้องมีใบเสร็จค่าใช้จ่ายครบถ้วน
                </p>

                <div className="space-y-space-xs text-body-md font-mono">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant font-sans text-sm">รายได้พึงประเมินสะสม:</span>
                    <span className="font-medium text-on-surface">฿{revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant font-sans text-sm">หัก ค่าใช้จ่ายเหมาตามกฎหมาย (60%):</span>
                    <span className="font-medium text-on-surface-variant">-฿{standardDeduction.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant font-sans text-sm">หัก ลดหย่อนส่วนตัวผู้มีเงินได้:</span>
                    <span className="font-medium text-on-surface-variant">-฿{personalAllowance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 bg-surface-container px-space-sm rounded-lg font-sans">
                    <span className="text-on-surface font-semibold text-sm">เงินได้สุทธิคำนวณภาษี:</span>
                    <span className="font-bold text-on-surface font-mono">฿{netTaxableStandard.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-space-md pt-space-xs bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between border border-surface-container-high">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">เงินได้สุทธิปีปัจจุบัน</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-mono font-bold">
                    ฿{netTaxableStandard.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">ประมาณการภาษีชำระ</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold font-mono">
                    ฿{estimatedTaxStandard.toFixed(2)}
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant block leading-none">
                    {estimatedTaxStandard > estimatedTaxActual ? '(สูงกว่าวิธีตามจริง)' : '(ต่ำกว่าวิธีตามจริง)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOWER SECTION: Signature Midnight Slate (Architectural Split Stage) */}
      <section className="w-full bg-inverse-surface text-inverse-on-surface px-margin py-space-xl border-t border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_2px_8px_rgba(91,76,245,0.4)]">
              <span className="material-symbols-outlined text-on-primary text-[22px]">menu_book</span>
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline-lg text-headline-lg text-inverse-on-surface font-bold">
                สมุดบัญชีเงินสดรับ-จ่าย (แบบ ป.ส. 10 กรมสรรพากร)
              </h2>
              <span className="font-label-md text-label-md text-inverse-on-surface/70">
                บันทึกรายรับและรายจ่ายประจำวัน ตามประมวลรัษฎากร มาตรา 17 และประกาศอธิบดีกรมสรรพากร
              </span>
            </div>
          </div>

          {/* Quick Filter Capsule Pill */}
          <div className="inline-flex items-center bg-white/10 rounded-full p-1 border border-white/10">
            {[
              { id: 'all', label: `ทั้งปีภาษี ${taxYear + 543}` },
              { id: 'h1', label: 'ครึ่งปีแรก (ม.ค. - มิ.ย. ภ.ง.ด. 94)' },
              { id: 'h2', label: 'ครึ่งปีหลัง (ก.ค. - ธ.ค.)' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setTaxPeriod(period.id)}
                type="button"
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all ${
                  taxPeriod === period.id
                    ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                    : 'text-inverse-on-surface/70 hover:text-white'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetrical Grid: Left Form (4 Cols) + Right Table (8 Cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: Form Record OPEX (4 Cols) */}
          <div className="xl:col-span-4 bg-white/5 rounded-2xl p-space-lg border border-white/10 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-space-sm pb-space-xs border-b border-white/10">
                <span className="font-headline-sm text-headline-sm text-inverse-on-surface flex items-center gap-space-xs font-bold">
                  <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">add_circle</span>
                  บันทึกค่าใช้จ่ายร้าน (OPEX)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-inverse-on-surface font-label-sm text-label-sm">
                  ม.40(8)
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-inverse-on-surface/70 mb-space-md">
                บันทึกเพื่อใช้เป็นหลักฐานหักภาษีตามจริง ต้องมีใบกำกับภาษีหรือใบเสร็จรับเงินสมบูรณ์
              </p>

              <form onSubmit={handleInlineExpenseSubmit} className="space-y-space-md">
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-inverse-on-surface/80">วันที่ทำรายการ</label>
                    <input
                      type="date"
                      value={localExpense.expense_date}
                      onChange={(e) => setLocalExpense({ ...localExpense, expense_date: e.target.value })}
                      className="w-full bg-[#12121b] text-white px-space-sm py-2 rounded-lg font-body-sm text-sm border border-white/15 focus:outline-none focus:ring-1 focus:ring-primary-container"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-inverse-on-surface/80">หมวดหมู่ค่าใช้จ่าย</label>
                    <select
                      value={localExpense.category}
                      onChange={(e) => setLocalExpense({ ...localExpense, category: e.target.value })}
                      className="w-full bg-[#12121b] text-white px-space-sm py-2 rounded-lg font-body-sm text-sm border border-white/15 focus:outline-none focus:ring-1 focus:ring-primary-container"
                    >
                      <option value="ค่าเช่าสถานที่">ค่าเช่าสถานที่</option>
                      <option value="ค่าน้ำ-ค่าไฟ">ค่าน้ำ-ค่าไฟ</option>
                      <option value="ค่าแรงพนักงาน">ค่าแรงพนักงาน</option>
                      <option value="ค่าบรรจุภัณฑ์">ค่าบรรจุภัณฑ์</option>
                      <option value="ค่าการตลาด">ค่าการตลาด</option>
                      <option value="ค่าซ่อมแซมบำรุงรักษา">ค่าซ่อมแซมบำรุงรักษา</option>
                      <option value="ค่าใช้จ่ายอื่นๆ">ค่าใช้จ่ายอื่นๆ</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-inverse-on-surface/80">รายการ / คำอธิบาย</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ค่าเช่าหน้าร้าน ประจำเดือน"
                    value={localExpense.title}
                    onChange={(e) => setLocalExpense({ ...localExpense, title: e.target.value })}
                    className="w-full bg-[#12121b] text-white px-space-sm py-2 rounded-lg font-body-sm text-sm border border-white/15 focus:outline-none focus:ring-1 focus:ring-primary-container"
                  />
                </div>

                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-inverse-on-surface/80">จำนวนเงิน (บาท)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={localExpense.amount}
                      onChange={(e) => setLocalExpense({ ...localExpense, amount: e.target.value })}
                      className="w-full bg-[#12121b] text-white px-space-sm py-2 rounded-lg font-body-sm text-sm font-mono font-bold border border-white/15 focus:outline-none focus:ring-1 focus:ring-primary-container"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-inverse-on-surface/80">เลขที่ใบเสร็จ/อ้างอิง</label>
                    <input
                      type="text"
                      placeholder="INV-00123"
                      value={localExpense.receipt_no}
                      onChange={(e) => setLocalExpense({ ...localExpense, receipt_no: e.target.value })}
                      className="w-full bg-[#12121b] text-white px-space-sm py-2 rounded-lg font-body-sm text-sm font-mono border border-white/15 focus:outline-none focus:ring-1 focus:ring-primary-container"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-primary-container hover:bg-primary text-white font-headline-sm text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>บันทึกเข้า ป.ส. 10</span>
                </button>
              </form>
            </div>

            {/* Recent Expenses List */}
            <div className="mt-space-md pt-space-sm border-t border-white/10">
              <span className="font-label-sm text-inverse-on-surface/70 font-semibold block mb-2">
                รายการค่าใช้จ่ายที่บันทึกแล้ว ({expenses.length})
              </span>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                {expenses.length === 0 ? (
                  <p className="text-xs text-inverse-on-surface/40 text-center py-2">ยังไม่มีบันทึกค่าใช้จ่าย</p>
                ) : (
                  expenses.slice(0, 5).map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="text-white font-medium truncate">{exp.title}</span>
                        <span className="text-[10px] text-inverse-on-surface/60 font-mono">
                          {exp.expense_date} • {exp.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-rose-300">
                          -฿{Number(exp.amount).toFixed(2)}
                        </span>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          type="button"
                          className="w-6 h-6 rounded-full hover:bg-rose-500/20 text-inverse-on-surface/40 hover:text-rose-300 flex items-center justify-center transition-colors"
                          title="ลบรายการ"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: ป.ส. 10 Ledger Table (8 Cols) */}
          <div className="xl:col-span-8 bg-white/5 rounded-2xl p-space-lg border border-white/10 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between pb-space-sm border-b border-white/10 mb-3">
              <span className="font-headline-sm text-headline-sm text-white font-bold">
                ตารางบันทึกเงินสดรับ-จ่ายประจำวัน
              </span>
              <span className="font-label-sm text-xs text-inverse-on-surface/60">
                รวมทั้งหมด {taxCashFlow?.rows?.length || 0} รายการ
              </span>
            </div>

            <div className="w-full overflow-x-auto max-h-[580px] overflow-y-auto scrollbar-none">
              {!taxCashFlow?.rows || taxCashFlow.rows.length === 0 ? (
                <div className="py-16 text-center text-inverse-on-surface/50">
                  <span className="material-symbols-outlined text-[36px] mb-2">account_balance_wallet</span>
                  <p>ยังไม่มีรายการเงินสดรับ-จ่ายในงวดนี้</p>
                </div>
              ) : (
                <table className="w-full text-left font-body-sm text-xs font-mono">
                  <thead>
                    <tr className="text-inverse-on-surface/60 font-label-md text-label-sm border-b border-white/10 pb-2">
                      <th className="py-2.5 px-3 font-semibold">วัน/เดือน/ปี</th>
                      <th className="py-2.5 px-3 font-semibold">รายการ / คำอธิบาย</th>
                      <th className="py-2.5 px-3 font-semibold">เอกสารอ้างอิง</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-emerald-400">เงินสดรับ</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-rose-300">เงินสดจ่าย</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-primary-fixed">คงเหลือสะสม</th>
                      <th className="py-2.5 px-3 font-semibold">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {taxCashFlow.rows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 text-inverse-on-surface/80 whitespace-nowrap">
                          {r.date}
                        </td>
                        <td className="py-2.5 px-3 text-white font-sans font-medium">
                          {r.description}
                        </td>
                        <td className="py-2.5 px-3 text-inverse-on-surface/70">
                          {r.ref_no || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {r.cash_in > 0 ? `+${r.cash_in.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-300">
                          {r.cash_out > 0 ? `-${r.cash_out.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          ฿{r.balance.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-inverse-on-surface/50 font-sans">
                          {r.note || '-'}
                        </td>
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
