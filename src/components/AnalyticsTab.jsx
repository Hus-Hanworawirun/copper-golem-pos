import React, { useState } from 'react';

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
    <div className="w-full">
      {/* Upper Section & Controls */}
      <section className="w-full px-margin pt-space-lg pb-space-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-1">
              <span className="hover:text-primary cursor-pointer transition-colors">COPPER GOLEM POS</span>
              <span className="text-outline-variant">/</span>
              <span>วิเคราะห์ผลประกอบการ</span>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-semibold">P&amp;L FIFO Analytics</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              ภาพรวมกำไร-ขาดทุน &amp; บันทึกคลังสินค้า
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              วิเคราะห์ต้นทุนการขายตามลำดับก่อน-หลัง (FIFO) แบบเรียลไทม์ เชื่อมโยงบัญชี ม.40(8)
            </p>
          </div>

          {/* Date Pills & Export Trigger */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="inline-flex p-1 bg-surface-container rounded-full shadow-sm border border-surface-container-high">
              {[
                { id: 'today', label: 'รายวัน (วันนี้)' },
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
                    className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm font-semibold'
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
              className="flex items-center gap-space-xs px-space-md py-2 bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:bg-surface-container border border-surface-container-high transition-all active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px] text-primary">download</span>
              <span>ส่งออก .CSV (UTF-8)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Top 4 Metric Bento Cards */}
      <section className="w-full px-margin pb-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter-lg">
          {/* Card 1: Gross Sales */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.03)] border border-surface-container-high flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                ยอดขายรวม (Gross Sales)
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div className="mt-space-md mb-space-sm">
              <div className="font-stat-display text-stat-display text-on-surface tracking-tight font-bold font-mono">
                ฿{grossSales.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px]">trending_up</span>
                <span>Active Period</span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-mono">
                {orderCount} ออเดอร์
              </span>
            </div>
          </div>

          {/* Card 2: COGS FIFO */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.03)] border border-surface-container-high flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                ต้นทุนสินค้าขายไป (COGS FIFO)
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
            </div>
            <div className="mt-space-md mb-space-sm flex items-baseline justify-between">
              <div className="font-stat-display text-stat-display text-on-surface tracking-tight font-bold font-mono">
                ฿{totalCogs.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="w-16 h-6 flex items-end justify-end gap-1">
                <div className="w-1.5 h-3 bg-surface-variant rounded-full"></div>
                <div className="w-1.5 h-4 bg-surface-variant rounded-full"></div>
                <div className="w-1.5 h-5 bg-surface-variant rounded-full"></div>
                <div className="w-1.5 h-6 bg-primary-container rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
              <span className="font-label-sm text-label-sm">
                สัดส่วนต้นทุน {grossSales > 0 ? ((totalCogs / grossSales) * 100).toFixed(1) : 0}%
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                เฉลี่ย ฿{avgTicket}/บิล
              </span>
            </div>
          </div>

          {/* Card 3: Net Gross Profit */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.03)] border border-surface-container-high flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                กำไรขั้นต้นสุทธิ (Gross Profit)
              </span>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">query_stats</span>
              </div>
            </div>
            <div className="mt-space-md mb-space-sm flex items-center justify-between">
              <div className="font-stat-display text-stat-display text-primary tracking-tight font-bold font-mono">
                ฿{grossProfit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                GP Margin: {avgMargin}%
              </span>
              <span className="font-label-sm text-label-sm text-secondary">หักต้นทุนจริงแล้ว</span>
            </div>
          </div>

          {/* Card 4: Ticket Average */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.03)] border border-surface-container-high flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                ยอดซื้อเฉลี่ยต่อบิล (Avg Ticket)
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">receipt</span>
              </div>
            </div>
            <div className="mt-space-md mb-space-sm">
              <div className="font-stat-display text-stat-display text-on-surface tracking-tight font-bold font-mono">
                ฿{avgTicket}
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs text-on-surface-variant">
              <span className="font-label-sm text-label-sm">คำนวณจาก {orderCount} ธุรกรรม</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold font-mono">
                ฿{grossSales.toFixed(0)} ยอดรวม
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section: Wave Graphic & Top 5 Contributors */}
      <section className="w-full px-margin pb-space-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-stretch">
          {/* Left 8 Cols: Graphic Wave */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.03)] border border-surface-container-high flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  กราฟเปรียบเทียบยอดขาย vs ต้นทุน FIFO
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  บันทึกแบบ Real-time ตามลำดับการขายจริง
                </span>
              </div>
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">ยอดขาย (Sales)</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">ต้นทุน (COGS)</span>
                </div>
              </div>
            </div>

            {/* SVG Dual Wave Chart */}
            <div className="w-full relative pt-2">
              <svg className="w-full h-56 overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 220">
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
                {/* COGS Wave */}
                <path d="M 0 185 Q 70 170, 140 160 T 280 145 T 420 100 T 560 120 T 700 135 L 740 140 L 740 210 L 0 210 Z" fill="url(#cogsGrad)"></path>
                <path d="M 0 185 Q 70 170, 140 160 T 280 145 T 420 100 T 560 120 T 700 135 L 740 140" fill="none" opacity="0.4" stroke="#777587" strokeWidth="2"></path>
                {/* Sales Wave */}
                <path d="M 0 165 Q 70 140, 140 120 T 280 95 T 420 28 T 560 65 T 700 85 L 740 95 L 740 210 L 0 210 Z" fill="url(#salesGrad)"></path>
                <path d="M 0 165 Q 70 140, 140 120 T 280 95 T 420 28 T 560 65 T 700 85 L 740 95" fill="none" stroke="#412cdd" strokeWidth="3"></path>
                <circle className="fill-primary ring-4 ring-primary-fixed" cx="420" cy="28" r="5"></circle>
              </svg>

              <div className="flex justify-between items-center text-secondary font-label-sm text-label-sm pt-2 px-1">
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span className="text-primary font-bold">14:00 (Peak Hours)</span>
                <span>16:00</span>
                <span>18:00</span>
                <span>20:00</span>
              </div>
            </div>

            <div className="mt-space-md pt-space-sm flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-lg border border-surface-container-high">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>การคำนวณ FIFO ตัดตามลำดับการรับเข้าแบบอัตโนมัติ</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                อัตรากำไรเฉลี่ย {avgMargin}%
              </span>
            </div>
          </div>

          {/* Right 4 Cols: Top 5 Profit Contributors */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.03)] border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  5 อันดับสินค้าทำกำไรสูงสุด
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Top GP Contribution</span>
              </div>
              <span className="material-symbols-outlined text-primary text-[22px]">military_tech</span>
            </div>

            <div className="flex flex-col gap-space-sm my-auto">
              {topContributors.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-sm">
                  ยังไม่มีข้อมูลการขายในรอบนี้
                </div>
              ) : (
                topContributors.map((item, idx) => {
                  const gp = item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(0) : 0;
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors border border-surface-container-high"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                            {item.name}
                          </span>
                          <span className="font-label-sm text-[11px] text-on-surface-variant">
                            ขายได้ {item.qty} ชิ้น
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <span className="font-label-md text-label-md text-primary font-bold font-mono">
                          +฿{item.profit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="font-label-sm text-[11px] text-secondary font-semibold">
                          GP {gp}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-space-sm border-t border-surface-container text-right">
              <span className="text-label-sm text-on-surface-variant font-medium">
                ยอดกำไร 5 อันดับรวม: ฿{topContributors.reduce((s, it) => s + it.profit, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Midnight Slate Section: Sales Orders FIFO Ledger & Stock Logs */}
      <section className="w-full px-margin pb-space-xl">
        <div className="bg-[#181824] text-inverse-on-surface rounded-3xl p-space-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/10">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none"></div>

          {/* Header Controls & Tab Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-lg relative z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('orders')}
                type="button"
                className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-2 ${
                  activeSubTab === 'orders'
                    ? 'bg-primary-container text-white font-semibold shadow-md'
                    : 'bg-white/10 hover:bg-white/15 text-inverse-on-surface/80 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>บันทึกออเดอร์ขายจริง ({filteredOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('stock_logs')}
                type="button"
                className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-2 ${
                  activeSubTab === 'stock_logs'
                    ? 'bg-primary-container text-white font-semibold shadow-md'
                    : 'bg-white/10 hover:bg-white/15 text-inverse-on-surface/80 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">history</span>
                <span>ประวัติเคลื่อนไหวสต็อก ({stockLogs.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-inverse-on-surface/50">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาเลขบิล, ชื่อสินค้า..."
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-inverse-on-surface placeholder:text-inverse-on-surface/40 font-body-sm text-sm pl-9 pr-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-primary-container transition-all border border-white/5"
              />
            </div>
          </div>

          {/* Orders Table */}
          {activeSubTab === 'orders' && (
            <div className="w-full overflow-x-auto relative z-10">
              {searchedOrders.length === 0 ? (
                <div className="py-12 text-center text-inverse-on-surface/50">
                  <span className="material-symbols-outlined text-[36px] mb-2">receipt</span>
                  <p>ไม่พบรายการออเดอร์ในช่วงเวลานี้</p>
                </div>
              ) : (
                <table className="w-full text-left font-body-md text-body-md">
                  <thead>
                    <tr className="text-inverse-on-surface/60 font-label-md text-label-md border-b border-white/10 pb-3">
                      <th className="py-3 px-4 font-semibold">รหัสบิล</th>
                      <th className="py-3 px-4 font-semibold">วัน-เวลา</th>
                      <th className="py-3 px-4 font-semibold">รายการสินค้า</th>
                      <th className="py-3 px-4 font-semibold text-right">ยอดขาย</th>
                      <th className="py-3 px-4 font-semibold text-right">ต้นทุน FIFO</th>
                      <th className="py-3 px-4 font-semibold text-right">กำไรขั้นต้น</th>
                      <th className="py-3 px-4 font-semibold text-center">วิธีชำระ</th>
                      <th className="py-3 px-4 font-semibold text-right">ใบเสร็จ</th>
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
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {ord.order_no}
                          </td>
                          <td className="py-3 px-4 text-inverse-on-surface/70 text-body-sm whitespace-nowrap">
                            {new Date(ord.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col max-w-[200px] truncate">
                              <span className="text-white truncate font-medium">
                                {ord.items?.map((it) => it.product_name).join(', ') || 'สินค้าทั่วไป'}
                              </span>
                              <span className="text-[11px] text-inverse-on-surface/50">
                                {ord.items?.length || 0} รายการ
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            ฿{(ord.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-inverse-on-surface/70">
                            ฿{cogs.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-mono font-bold text-primary-fixed">
                              +฿{profit.toFixed(2)}
                            </span>
                            <span className="block text-[11px] text-inverse-on-surface/50">
                              ({gp}%)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-label-sm font-semibold ${
                                ord.payment_method === 'CASH'
                                  ? 'bg-amber-400/20 text-amber-300'
                                  : 'bg-primary-container/30 text-primary-fixed'
                              }`}
                            >
                              {ord.payment_method === 'CASH' ? 'เงินสด' : 'PromptPay'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onViewReceipt(ord)}
                              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-label-sm text-xs transition-colors flex items-center gap-1 ml-auto"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
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
            <div className="w-full overflow-x-auto relative z-10">
              {searchedStockLogs.length === 0 ? (
                <div className="py-12 text-center text-inverse-on-surface/50">
                  <span className="material-symbols-outlined text-[36px] mb-2">history</span>
                  <p>ยังไม่มีบันทึกประวัติการเคลื่อนไหวสต็อก</p>
                </div>
              ) : (
                <table className="w-full text-left font-body-md text-body-md">
                  <thead>
                    <tr className="text-inverse-on-surface/60 font-label-md text-label-md border-b border-white/10 pb-3">
                      <th className="py-3 px-4 font-semibold">วัน-เวลา</th>
                      <th className="py-3 px-4 font-semibold">สินค้า</th>
                      <th className="py-3 px-4 font-semibold">ประเภทรายการ</th>
                      <th className="py-3 px-4 font-semibold text-right">จำนวน</th>
                      <th className="py-3 px-4 font-semibold text-right">ต้นทุนต่อชิ้น</th>
                      <th className="py-3 px-4 font-semibold text-right">สต็อกคงเหลือ</th>
                      <th className="py-3 px-4 font-semibold">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {searchedStockLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-inverse-on-surface/70 whitespace-nowrap">
                          {new Date(log.created_at || Date.now()).toLocaleString('th-TH')}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {log.product_name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${
                              log.action_type === 'RESTOCK'
                                ? 'bg-primary-container/30 text-primary-fixed'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {log.action_type === 'RESTOCK' ? 'รับเข้าสต็อก' : 'ขายออก (POS)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {log.action_type === 'RESTOCK' ? `+${log.quantity}` : `-${log.quantity}`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-inverse-on-surface/70">
                          ฿{(log.cost_per_unit || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-primary-fixed">
                          {log.balance_qty} ชิ้น
                        </td>
                        <td className="py-3 px-4 text-inverse-on-surface/60 text-sm">
                          {log.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
