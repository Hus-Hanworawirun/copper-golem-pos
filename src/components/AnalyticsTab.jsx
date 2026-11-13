import React, { useState } from 'react';
import {
  TrendingUp,
  FileDown,
  DollarSign,
  Boxes,
  LineChart,
  Receipt,
  ShieldCheck,
  Award,
  Search,
  History,
  Eye
} from 'lucide-react';

export default function AnalyticsTab({
  orderHistory = [],
  stockLogs = [],
  products = [],
  reportTimeframe,
  setReportTimeframe,
  onViewReceipt
}) {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' or 'stock_logs'
  const [search, setSearch] = useState('');

  // Filter orders by timeframe
  const filteredOrders = orderHistory.filter((ord) => {
    if (!ord.created_at) return true;
    const orderDate = new Date(ord.created_at);
    const now = new Date();

    if (reportTimeframe === 'today') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (reportTimeframe === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }
    if (reportTimeframe === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true; // 'all'
  });

  // KPI Calculations
  const grossSales = filteredOrders.reduce((sum, ord) => sum + (ord.total_amount || 0), 0);
  const totalCogs = filteredOrders.reduce((sum, ord) => {
    const orderCogs = ord.items?.reduce(
      (itemSum, it) => itemSum + ((it.unit_cost || 0) * (it.quantity || 1)),
      0
    ) || 0;
    return sum + orderCogs;
  }, 0);
  const grossProfit = grossSales - totalCogs;
  const avgMargin = grossSales > 0 ? ((grossProfit / grossSales) * 100).toFixed(1) : 0;
  const orderCount = filteredOrders.length;
  const avgTicket = orderCount > 0 ? (grossSales / orderCount).toFixed(2) : '0.00';

  // Calculate Top 5 Profit Champions
  const itemProfitMap = {};
  filteredOrders.forEach((ord) => {
    ord.items?.forEach((it) => {
      const key = it.product_name;
      if (!itemProfitMap[key]) {
        itemProfitMap[key] = {
          name: it.product_name,
          qty: 0,
          revenue: 0,
          cogs: 0,
          profit: 0
        };
      }
      itemProfitMap[key].qty += it.quantity || 1;
      itemProfitMap[key].revenue += it.subtotal || 0;
      const cogs = (it.unit_cost || 0) * (it.quantity || 1);
      itemProfitMap[key].cogs += cogs;
      itemProfitMap[key].profit += (it.subtotal || 0) - cogs;
    });
  });

  const topContributors = Object.values(itemProfitMap)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Search in Orders
  const searchedOrders = filteredOrders.filter((ord) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ord.order_no.toLowerCase().includes(q) ||
      ord.payment_method.toLowerCase().includes(q) ||
      ord.items?.some((it) => it.product_name.toLowerCase().includes(q))
    );
  });

  // Search in Stock Logs
  const searchedStockLogs = stockLogs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (log.product_name && log.product_name.toLowerCase().includes(q)) ||
      (log.action_type && log.action_type.toLowerCase().includes(q)) ||
      (log.note && log.note.toLowerCase().includes(q))
    );
  });

  // Export CSV with UTF-8 BOM
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      alert('ไม่มีข้อมูลออเดอร์เพื่อส่งออก');
      return;
    }
    const headers = ['เลขที่บิล', 'วันที่-เวลา', 'จำนวนรายการ', 'ยอดขายรวม (บาท)', 'ต้นทุน FIFO (บาท)', 'กำไรขั้นต้น (บาท)', 'อัตรากำไร GP%', 'วิธีชำระเงิน'];
    const rows = filteredOrders.map((ord) => {
      const cogs = ord.items?.reduce((s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)), 0) || 0;
      const profit = (ord.total_amount || 0) - cogs;
      const gp = ord.total_amount > 0 ? ((profit / ord.total_amount) * 100).toFixed(1) : 0;
      return [
        ord.order_no,
        `"${new Date(ord.created_at).toLocaleString('th-TH')}"`,
        ord.items?.length || 0,
        (ord.total_amount || 0).toFixed(2),
        cogs.toFixed(2),
        profit.toFixed(2),
        `${gp}%`,
        ord.payment_method
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานกำไรขาดทุน_FIFO_${reportTimeframe}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <section className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-1">
            <span className="hover:text-primary cursor-pointer transition-colors font-medium">COPPER GOLEM POS</span>
            <span className="text-outline-variant">/</span>
            <span>วิเคราะห์ผลประกอบการ</span>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-semibold">P&amp;L FIFO Analytics</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight">
            ภาพรวมกำไร-ขาดทุน &amp; บันทึกคลังสินค้า
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            วิเคราะห์ต้นทุนการขายตามลำดับก่อน-หลัง (FIFO) แบบเรียลไทม์ เชื่อมโยงบัญชี ม.40(8)
          </p>
        </div>

        {/* Date Pills & Export Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-surface-container rounded-full border border-surface-container-high">
            {[
              { id: 'today', label: 'รายวัน' },
              { id: 'week', label: 'สัปดาห์นี้' },
              { id: 'month', label: 'รายเดือน' },
              { id: 'all', label: 'ตลอดเวลา' }
            ].map((pill) => {
              const isActive = reportTimeframe === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setReportTimeframe(pill.id)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest text-on-surface text-xs font-semibold rounded-full border border-surface-container-high shadow-xs hover:bg-surface-container transition-all"
            type="button"
          >
            <FileDown className="w-3.5 h-3.5 text-primary" />
            <span>ส่งออก .CSV</span>
          </button>
        </div>
      </section>

      {/* Top 4 Bento Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Gross Sales */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">ยอดขายรวม (Gross Sales)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-on-surface tracking-tight font-mono">
              ฿{grossSales.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-primary font-semibold font-mono">Active Period</span>
            <span className="text-on-surface-variant font-mono">{orderCount} ออเดอร์</span>
          </div>
        </div>

        {/* Card 2: COGS FIFO */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">ต้นทุนขายไป (COGS FIFO)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-on-surface tracking-tight font-mono">
              ฿{totalCogs.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>ต้นทุน {grossSales > 0 ? ((totalCogs / grossSales) * 100).toFixed(1) : 0}%</span>
            <span>เฉลี่ย ฿{avgTicket}/บิล</span>
          </div>
        </div>

        {/* Card 3: Gross Profit */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">กำไรขั้นต้นสุทธิ (Gross Profit)</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-primary tracking-tight font-mono">
              ฿{grossProfit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="text-primary font-semibold">GP Margin: {avgMargin}%</span>
            <span>หักต้นทุนจริงแล้ว</span>
          </div>
        </div>

        {/* Card 4: Avg Ticket */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">ยอดเฉลี่ยต่อบิล (Avg Ticket)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-on-surface tracking-tight font-mono">
              ฿{avgTicket}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>จาก {orderCount} ธุรกรรม</span>
            <span className="text-primary font-bold font-mono">฿{grossSales.toFixed(0)} รวม</span>
          </div>
        </div>
      </section>

      {/* Middle Section: Chart & Top 5 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8 Cols: Graphic Wave */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-bold text-on-surface">
                กราฟเปรียบเทียบยอดขาย vs ต้นทุน FIFO
              </span>
              <span className="text-[11px] text-on-surface-variant block">
                บันทึกแบบ Real-time ตามลำดับการขายจริง
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="text-on-surface-variant">ยอดขาย</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
                <span className="text-on-surface-variant">ต้นทุน</span>
              </div>
            </div>
          </div>

          <div className="w-full relative pt-2">
            <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 220">
              <defs>
                <linearGradient id="salesGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#412cdd" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#412cdd" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="cogsGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#dce2f3" stopOpacity="0.4"></stop>
                  <stop offset="100%" stopColor="#dce2f3" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              <line opacity="0.6" stroke="#dce2f3" strokeDasharray="3 3" x1="0" x2="740" y1="40" y2="40"></line>
              <line opacity="0.6" stroke="#dce2f3" strokeDasharray="3 3" x1="0" x2="740" y1="95" y2="95"></line>
              <line opacity="0.6" stroke="#dce2f3" strokeDasharray="3 3" x1="0" x2="740" y1="150" y2="150"></line>
              <path d="M 0 185 Q 70 170, 140 160 T 280 145 T 420 100 T 560 120 T 700 135 L 740 140 L 740 210 L 0 210 Z" fill="url(#cogsGrad)"></path>
              <path d="M 0 185 Q 70 170, 140 160 T 280 145 T 420 100 T 560 120 T 700 135 L 740 140" fill="none" opacity="0.4" stroke="#777587" strokeWidth="2"></path>
              <path d="M 0 165 Q 70 140, 140 120 T 280 95 T 420 28 T 560 65 T 700 85 L 740 95 L 740 210 L 0 210 Z" fill="url(#salesGrad)"></path>
              <path d="M 0 165 Q 70 140, 140 120 T 280 95 T 420 28 T 560 65 T 700 85 L 740 95" fill="none" stroke="#412cdd" strokeWidth="3"></path>
              <circle className="fill-primary" cx="420" cy="28" r="4"></circle>
            </svg>

            <div className="flex justify-between items-center text-on-surface-variant text-[11px] pt-1 px-1">
              <span>08:00</span>
              <span>10:00</span>
              <span>12:00</span>
              <span className="text-primary font-bold">14:00 (Peak)</span>
              <span>16:00</span>
              <span>18:00</span>
              <span>20:00</span>
            </div>
          </div>

          <div className="mt-2 pt-2 flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container">
            <span>คำนวณ FIFO ตัดตามรอบอัตโนมัติ</span>
            <span className="text-primary font-bold">อัตรากำไรเฉลี่ย {avgMargin}%</span>
          </div>
        </div>

        {/* Right 4 Cols: Top 5 */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-bold text-on-surface">5 อันดับสินค้าทำกำไรสูงสุด</span>
              <span className="text-[11px] text-on-surface-variant block">Top GP Contribution</span>
            </div>
            <Award className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-2 my-auto">
            {topContributors.length === 0 ? (
              <div className="py-6 text-center text-on-surface-variant text-xs">
                ยังไม่มีข้อมูลการขายในรอบนี้
              </div>
            ) : (
              topContributors.map((item, idx) => {
                const gp = item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(0) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-primary-container/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-on-surface truncate">{item.name}</span>
                        <span className="text-[10px] text-on-surface-variant">ขายได้ {item.qty} ชิ้น</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="font-bold text-primary font-mono">
                        +฿{item.profit.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-secondary font-semibold">GP {gp}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-surface-container text-right text-[11px] text-on-surface-variant font-medium">
            รวมกำไร 5 อันดับ: ฿{topContributors.reduce((s, it) => s + it.profit, 0).toFixed(2)}
          </div>
        </div>
      </section>

      {/* Lower Midnight Slate Section */}
      <section className="bg-[#181824] text-inverse-on-surface rounded-2xl p-4 shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('orders')}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'orders'
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-inverse-on-surface/80 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>บันทึกออเดอร์ขายจริง ({filteredOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('stock_logs')}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'stock_logs'
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-inverse-on-surface/80 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>ประวัติเคลื่อนไหวสต็อก ({stockLogs.length})</span>
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-inverse-on-surface/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขบิล, สินค้า..."
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-inverse-on-surface/40 text-xs pl-8 pr-3 py-1.5 rounded-full outline-none focus:ring-1 focus:ring-primary border border-white/5"
            />
          </div>
        </div>

        {/* Orders Table */}
        {activeSubTab === 'orders' && (
          <div className="w-full overflow-x-auto pt-2">
            {searchedOrders.length === 0 ? (
              <div className="py-12 text-center text-inverse-on-surface/40 text-xs">
                ไม่พบรายการออเดอร์ในช่วงเวลานี้
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-inverse-on-surface/60 border-b border-white/10 pb-2">
                    <th className="py-2.5 px-3 font-semibold">รหัสบิล</th>
                    <th className="py-2.5 px-3 font-semibold">วัน-เวลา</th>
                    <th className="py-2.5 px-3 font-semibold">รายการสินค้า</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ยอดขาย</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ต้นทุน FIFO</th>
                    <th className="py-2.5 px-3 font-semibold text-right">กำไรขั้นต้น</th>
                    <th className="py-2.5 px-3 font-semibold text-center">วิธีชำระ</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ใบเสร็จ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {searchedOrders.map((ord) => {
                    const cogs = ord.items?.reduce(
                      (s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)),
                      0
                    ) || 0;
                    const profit = (ord.total_amount || 0) - cogs;
                    const gp = ord.total_amount > 0 ? ((profit / ord.total_amount) * 100).toFixed(1) : 0;

                    return (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-white">
                          {ord.order_no}
                        </td>
                        <td className="py-2.5 px-3 text-inverse-on-surface/70 whitespace-nowrap">
                          {new Date(ord.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-white truncate block max-w-[180px]">
                            {ord.items?.map((it) => it.product_name).join(', ') || 'สินค้าทั่วไป'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          ฿{(ord.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-inverse-on-surface/70">
                          ฿{cogs.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary-fixed">
                          +฿{profit.toFixed(2)} <span className="text-[10px] text-inverse-on-surface/50 font-normal">({gp}%)</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              ord.payment_method === 'CASH'
                                ? 'bg-amber-400/20 text-amber-300'
                                : 'bg-primary-container/30 text-primary-fixed'
                            }`}
                          >
                            {ord.payment_method === 'CASH' ? 'เงินสด' : 'PromptPay'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onViewReceipt(ord)}
                            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors flex items-center gap-1 ml-auto"
                            type="button"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ดูบิล</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Stock Logs Table */}
        {activeSubTab === 'stock_logs' && (
          <div className="w-full overflow-x-auto pt-2">
            {searchedStockLogs.length === 0 ? (
              <div className="py-12 text-center text-inverse-on-surface/40 text-xs">
                ยังไม่มีบันทึกประวัติการเคลื่อนไหวสต็อก
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-inverse-on-surface/60 border-b border-white/10 pb-2">
                    <th className="py-2.5 px-3 font-semibold">วัน-เวลา</th>
                    <th className="py-2.5 px-3 font-semibold">สินค้า</th>
                    <th className="py-2.5 px-3 font-semibold">ประเภท</th>
                    <th className="py-2.5 px-3 font-semibold text-right">จำนวน</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ต้นทุน/ชิ้น</th>
                    <th className="py-2.5 px-3 font-semibold text-right">คงเหลือ</th>
                    <th className="py-2.5 px-3 font-semibold">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {searchedStockLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-inverse-on-surface/70 whitespace-nowrap">
                        {new Date(log.created_at || Date.now()).toLocaleString('th-TH')}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{log.product_name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.action_type === 'RESTOCK'
                              ? 'bg-primary-container/30 text-primary-fixed'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {log.action_type === 'RESTOCK' ? 'รับเข้า' : 'ขายออก'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        {log.action_type === 'RESTOCK' ? `+${log.quantity}` : `-${log.quantity}`}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-inverse-on-surface/70">
                        ฿{(log.cost_per_unit || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-primary-fixed">
                        {log.balance_qty} ชิ้น
                      </td>
                      <td className="py-2.5 px-3 text-inverse-on-surface/60">{log.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
