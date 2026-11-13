import React, { useState } from 'react';
import {
  Receipt,
  FileDown,
  Printer,
  Database,
  QrCode,
  Banknote,
  Search,
  ChevronRight,
  Download,
  ShieldCheck
} from 'lucide-react';

export default function ReceiptsTab({
  orderHistory = [],
  onPrintThermal
}) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', '7days'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtered Orders
  const filteredOrders = orderHistory.filter((ord) => {
    const matchesSearch =
      !search ||
      ord.order_no.toLowerCase().includes(search.toLowerCase()) ||
      ord.payment_method.toLowerCase().includes(search.toLowerCase()) ||
      ord.items?.some((it) => it.product_name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (dateFilter === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      const ordDateStr = new Date(ord.created_at).toISOString().slice(0, 10);
      return todayStr === ordDateStr;
    }

    if (dateFilter === '7days') {
      const orderDate = new Date(ord.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }

    return true;
  });

  // Active Selected Order
  const activeOrder = selectedOrder || filteredOrders[0] || null;

  // KPI Metrics
  const totalBills = filteredOrders.length;
  const totalGross = filteredOrders.reduce((sum, ord) => sum + (ord.total_amount || 0), 0);
  const avgBill = totalBills > 0 ? (totalGross / totalBills).toFixed(2) : '0.00';
  const qrBillsCount = filteredOrders.filter(o => o.payment_method === 'TRANSFER_QR').length;
  const qrRatio = totalBills > 0 ? ((qrBillsCount / totalBills) * 100).toFixed(0) : '0';

  // Export CSV
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      alert('ไม่มีข้อมูลใบเสร็จเพื่อส่งออก');
      return;
    }
    const headers = ['เลขที่บิล', 'วันที่-เวลา', 'จำนวนรายการ', 'ยอดรวมสุทธิ (บาท)', 'ภาษีมูลค่าเพิ่ม 7% (บาท)', 'วิธีการชำระเงิน', 'เงินสดรับ', 'เงินทอน'];
    const rows = filteredOrders.map((ord) => {
      const vat = Number(((ord.total_amount || 0) * 7 / 107).toFixed(2));
      return [
        ord.order_no,
        `"${new Date(ord.created_at).toLocaleString('th-TH')}"`,
        ord.items?.length || 0,
        (ord.total_amount || 0).toFixed(2),
        vat.toFixed(2),
        ord.payment_method,
        (ord.cash_received || 0).toFixed(2),
        (ord.change_amount || 0).toFixed(2)
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานใบเสร็จรับเงิน_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header Bar */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wide">
              E-Archive v2.4
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-primary" />
              <span>Local Storage 100% Sync</span>
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight">
            ประวัติใบเสร็จดิจิทัล &amp; คลังบิลอิเล็กทรอนิกส์
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Digital Receipts Archive — บันทึกถาวรในเครื่องแบบ SQLite WAL ค้นหาย้อนหลัง พิมพ์ซ้ำ และออกใบกำกับภาษีอย่างย่อ (ABB)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-xs font-semibold shadow-xs hover:bg-surface-container border border-surface-container-high transition-all"
            type="button"
          >
            <FileDown className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>ดาวน์โหลด .CSV</span>
          </button>
          <button
            onClick={() => {
              if (activeOrder) onPrintThermal(activeOrder);
              else alert('กรุณาเลือกบิลเพื่อพิมพ์');
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-container text-white text-xs font-bold shadow-md hover:bg-primary transition-all active:scale-95"
            type="button"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์สลิปบิลที่เลือก</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-medium">
                ใบเสร็จ ({dateFilter === 'today' ? 'วันนี้' : dateFilter === '7days' ? '7 วัน' : 'ทั้งหมด'})
              </span>
              <div className="text-xl font-bold text-on-surface mt-1 font-mono">
                {totalBills} <span className="text-sm font-normal text-on-surface-variant">บิล</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-primary font-semibold">Local WAL Active</div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-medium">ยอดขายรวมบิลที่ค้นพบ</span>
              <div className="text-xl font-bold text-on-surface mt-1 font-mono">
                ฿{totalGross.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-on-surface-variant">เฉลี่ย ฿{avgBill}/บิล</div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-medium">สัดส่วน QR vs เงินสด</span>
              <div className="text-xl font-bold text-on-surface mt-1 font-mono">
                {qrRatio}% <span className="text-sm font-normal text-on-surface-variant">QR</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-on-surface-variant">
            QR: {qrBillsCount} | เงินสด: {totalBills - qrBillsCount}
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-medium">สถานะฐานข้อมูล</span>
              <div className="text-xl font-bold text-primary mt-1">100% Sync</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-on-surface-variant">Offline-First Engine</div>
        </div>
      </section>

      {/* Split Drawer: Left List (7 Cols) + Right Live Slip (5 Cols) */}
      <section className="bg-[#181824] text-inverse-on-surface rounded-2xl p-4 shadow-xl border border-white/10">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-inverse-on-surface/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขที่บิล, สินค้า, หรือวิธีชำระ..."
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-inverse-on-surface/40 text-xs pl-9 pr-3 py-1.5 rounded-full outline-none focus:ring-1 focus:ring-primary border border-white/5"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'today', label: 'วันนี้' },
              { id: '7days', label: '7 วันล่าสุด' }
            ].map((pill) => {
              const isActive = dateFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setDateFilter(pill.id)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/15 text-inverse-on-surface/80 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 items-start">
          {/* LEFT 7 COLS: Receipts List */}
          <div className="lg:col-span-7 space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-none">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-inverse-on-surface/40 text-xs">
                ไม่พบบันทึกใบเสร็จในระบบ
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                const vat = Number(((ord.total_amount || 0) * 7 / 107).toFixed(2));
                const itemCount = ord.items?.reduce((s, it) => s + (it.quantity || 1), 0) || ord.items?.length || 0;

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-primary-container text-white shadow-md border-transparent'
                        : 'bg-white/5 hover:bg-white/10 text-inverse-on-surface border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-inverse-on-surface/80'
                        }`}
                      >
                        <Receipt className="w-4 h-4" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs font-mono">{ord.order_no}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded-full bg-white text-primary text-[10px] font-bold">
                              กำลังดู
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            isSelected ? 'text-white/80' : 'text-inverse-on-surface/60'
                          }`}
                        >
                          {new Date(ord.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. • {itemCount} ชิ้น
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : ord.payment_method === 'CASH'
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-primary-container/30 text-primary-fixed'
                        }`}
                      >
                        {ord.payment_method === 'CASH' ? 'เงินสด' : 'PromptPay'}
                      </span>

                      <div className="text-right">
                        <div className="font-bold font-mono text-sm">
                          ฿{(ord.total_amount || 0).toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            isSelected ? 'text-white/80' : 'text-inverse-on-surface/50'
                          }`}
                        >
                          VAT ฿{vat.toFixed(2)}
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-white translate-x-0.5' : 'text-inverse-on-surface/40'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT 5 COLS: Thermal Slip Preview */}
          <div className="lg:col-span-5">
            {activeOrder ? (
              <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-4 shadow-xl border border-surface-container-high flex flex-col font-mono text-xs">
                {/* Header */}
                <div className="text-center pb-2 border-b border-dashed border-outline-variant">
                  <div className="w-8 h-8 rounded-xl bg-primary text-white mx-auto flex items-center justify-center font-bold mb-1 shadow-xs overflow-hidden">
                    <img
                      src="/logo.png"
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="font-bold text-sm text-on-surface font-sans">
                    COPPER GOLEM POS &amp; RETAIL
                  </div>
                  <div className="text-[10px] text-on-surface-variant font-sans">
                    สาขา 01 สยามพารากอน ชั้น G กทม.
                  </div>
                  <div className="text-[10px] text-on-surface-variant font-sans">
                    เลขประจำตัวผู้เสียภาษี: 0105566012345
                  </div>
                  <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-sans text-[11px] font-bold">
                    ใบกำกับภาษีอย่างย่อ (ABB)
                  </div>
                </div>

                {/* Slip Meta */}
                <div className="py-2 border-b border-dashed border-outline-variant flex flex-col gap-0.5 font-sans text-on-surface-variant text-[11px]">
                  <div className="flex justify-between">
                    <span>เลขที่บิล: <strong className="text-on-surface font-mono">{activeOrder.order_no}</strong></span>
                    <span>แคชเชียร์ 01</span>
                  </div>
                  <div className="flex justify-between">
                    <span>วันที่: {new Date(activeOrder.created_at).toLocaleDateString('th-TH')}</span>
                    <span>เวลา: {new Date(activeOrder.created_at).toLocaleTimeString('th-TH')} น.</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-outline-variant space-y-1 font-sans">
                  {activeOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-on-surface text-[11px]">
                      <div>
                        <span className="font-semibold">{idx + 1}. {it.product_name}</span>
                        <div className="text-[10px] text-on-surface-variant pl-2">
                          {it.quantity}x @ ฿{(it.unit_price || 0).toFixed(2)}
                        </div>
                      </div>
                      <span className="font-mono font-bold">
                        ฿{(it.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-2 border-b border-dashed border-outline-variant space-y-0.5 font-sans text-[11px]">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>ยอดรวมสินค้า</span>
                    <span className="font-mono">฿{(activeOrder.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>ภาษีมูลค่าเพิ่ม VAT 7%</span>
                    <span className="font-mono">฿{((activeOrder.total_amount || 0) * 7 / 107).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface font-bold text-sm pt-1 border-t border-surface-container">
                    <span>ยอดสุทธิ</span>
                    <span className="font-mono text-primary font-bold">
                      ฿{(activeOrder.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 font-sans">
                  <button
                    onClick={() => onPrintThermal(activeOrder)}
                    type="button"
                    className="py-2 px-3 rounded-full bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์สลิปซ้ำ</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    type="button"
                    className="py-2 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 border border-surface-container-high transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>บันทึก PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-inverse-on-surface/40 text-xs border border-white/10 rounded-2xl bg-white/5">
                เลือกใบเสร็จเพื่อดูตัวอย่าง
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
