import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  FileDown,
  DollarSign,
  Boxes,
  Receipt,
  Search,
  History,
  Eye,
  Award,
  Calendar,
  Layers,
  CheckCircle2,
  PieChart,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';

export default function AnalyticsTab({
  orderHistory = [],
  stockLogs = [],
  products = [],
  expenses = [],
  reportTimeframe = 'today',
  setReportTimeframe,
  onViewReceipt
}) {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' or 'stock_logs'
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Filter Orders by Timeframe
  const filteredOrders = useMemo(() => {
    return orderHistory.filter((ord) => {
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
  }, [orderHistory, reportTimeframe]);

  // Filter Expenses by Timeframe
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = exp.expense_date ? new Date(exp.expense_date) : new Date(exp.created_at || Date.now());
      const now = new Date();

      if (reportTimeframe === 'today') {
        return expDate.toDateString() === now.toDateString();
      }
      if (reportTimeframe === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return expDate >= sevenDaysAgo;
      }
      if (reportTimeframe === 'month') {
        return (
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        );
      }
      return true; // 'all'
    });
  }, [expenses, reportTimeframe]);

  // Core P&L Financial Calculations
  const grossSales = filteredOrders.reduce((sum, ord) => sum + (ord.total_amount || 0), 0);
  const totalCogs = filteredOrders.reduce((sum, ord) => {
    const orderCogs = ord.items?.reduce(
      (itemSum, it) => itemSum + ((it.unit_cost || 0) * (it.quantity || 1)),
      0
    ) || ord.total_cost || 0;
    return sum + orderCogs;
  }, 0);
  const grossProfit = grossSales - totalCogs;
  const gpMargin = grossSales > 0 ? Number(((grossProfit / grossSales) * 100).toFixed(1)) : 0;

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const netProfit = grossProfit - totalExpenses;
  const netMargin = grossSales > 0 ? Number(((netProfit / grossSales) * 100).toFixed(1)) : 0;

  const orderCount = filteredOrders.length;
  const avgTicket = orderCount > 0 ? (grossSales / orderCount).toFixed(2) : '0.00';

  // Real Dynamic Time Buckets for Chart
  const chartData = useMemo(() => {
    if (reportTimeframe === 'today') {
      const slots = [
        { label: '08:00 - 10:00', shortLabel: '08:00', startHour: 8, endHour: 10, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: '10:00 - 12:00', shortLabel: '10:00', startHour: 10, endHour: 12, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: '12:00 - 14:00', shortLabel: '12:00', startHour: 12, endHour: 14, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: '14:00 - 16:00', shortLabel: '14:00', startHour: 14, endHour: 16, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: '16:00 - 18:00', shortLabel: '16:00', startHour: 16, endHour: 18, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: '18:00 - 20:00', shortLabel: '18:00', startHour: 18, endHour: 20, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: '20:00 - 22:00', shortLabel: '20:00', startHour: 20, endHour: 22, sales: 0, cogs: 0, profit: 0, orders: 0 },
      ];

      filteredOrders.forEach((ord) => {
        const d = new Date(ord.created_at);
        const h = d.getHours();
        const slot = slots.find((s) => h >= s.startHour && h < s.endHour) || slots[slots.length - 1];
        if (slot) {
          const cogs = ord.items?.reduce((s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)), 0) || ord.total_cost || 0;
          slot.sales += ord.total_amount || 0;
          slot.cogs += cogs;
          slot.profit += (ord.total_amount || 0) - cogs;
          slot.orders += 1;
        }
      });
      return slots;
    }

    if (reportTimeframe === 'week') {
      const slots = [];
      const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - i);
        const dateStr = targetDate.toISOString().slice(0, 10);
        const displayLabel = `${dayNames[targetDate.getDay()]} ${targetDate.getDate()}/${targetDate.getMonth() + 1}`;
        slots.push({
          dateStr,
          label: displayLabel,
          shortLabel: dayNames[targetDate.getDay()],
          sales: 0,
          cogs: 0,
          profit: 0,
          orders: 0
        });
      }

      filteredOrders.forEach((ord) => {
        const orderDateStr = new Date(ord.created_at).toISOString().slice(0, 10);
        const slot = slots.find((s) => s.dateStr === orderDateStr);
        if (slot) {
          const cogs = ord.items?.reduce((s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)), 0) || ord.total_cost || 0;
          slot.sales += ord.total_amount || 0;
          slot.cogs += cogs;
          slot.profit += (ord.total_amount || 0) - cogs;
          slot.orders += 1;
        }
      });
      return slots;
    }

    if (reportTimeframe === 'month') {
      const slots = [
        { label: 'สัปดาห์ 1 (1-7)', shortLabel: 'สัปดาห์ 1', startDay: 1, endDay: 7, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: 'สัปดาห์ 2 (8-14)', shortLabel: 'สัปดาห์ 2', startDay: 8, endDay: 14, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: 'สัปดาห์ 3 (15-21)', shortLabel: 'สัปดาห์ 3', startDay: 15, endDay: 21, sales: 0, cogs: 0, profit: 0, orders: 0 },
        { label: 'สัปดาห์ 4 (22-31)', shortLabel: 'สัปดาห์ 4', startDay: 22, endDay: 31, sales: 0, cogs: 0, profit: 0, orders: 0 },
      ];

      filteredOrders.forEach((ord) => {
        const d = new Date(ord.created_at);
        const day = d.getDate();
        const slot = slots.find((s) => day >= s.startDay && day <= s.endDay) || slots[3];
        if (slot) {
          const cogs = ord.items?.reduce((s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)), 0) || ord.total_cost || 0;
          slot.sales += ord.total_amount || 0;
          slot.cogs += cogs;
          slot.profit += (ord.total_amount || 0) - cogs;
          slot.orders += 1;
        }
      });
      return slots;
    }

    // 'all' timeframe: Past 6 months
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const slots = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      slots.push({
        year,
        month,
        label: `${monthNames[month]} ${year + 543}`,
        shortLabel: monthNames[month],
        sales: 0,
        cogs: 0,
        profit: 0,
        orders: 0
      });
    }

    filteredOrders.forEach((ord) => {
      const d = new Date(ord.created_at);
      const slot = slots.find((s) => s.year === d.getFullYear() && s.month === d.getMonth());
      if (slot) {
        const cogs = ord.items?.reduce((s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)), 0) || ord.total_cost || 0;
        slot.sales += ord.total_amount || 0;
        slot.cogs += cogs;
        slot.profit += (ord.total_amount || 0) - cogs;
        slot.orders += 1;
      }
    });
    return slots;
  }, [filteredOrders, reportTimeframe]);

  // Real Peak Slot
  const peakSlot = useMemo(() => {
    let max = null;
    chartData.forEach((s) => {
      if (!max || s.sales > max.sales) {
        max = s;
      }
    });
    return max && max.sales > 0 ? max : null;
  }, [chartData]);

  // Max value for Chart scaling
  const maxChartVal = useMemo(() => {
    const maxSales = Math.max(...chartData.map((s) => s.sales), 0);
    return maxSales > 0 ? maxSales * 1.15 : 1000;
  }, [chartData]);

  // Top 5 Profit Champions
  const topContributors = useMemo(() => {
    const map = {};
    filteredOrders.forEach((ord) => {
      ord.items?.forEach((it) => {
        const key = it.product_name;
        if (!map[key]) {
          map[key] = {
            name: it.product_name,
            qty: 0,
            revenue: 0,
            cogs: 0,
            profit: 0
          };
        }
        const cogs = (it.unit_cost || 0) * (it.quantity || 1);
        map[key].qty += it.quantity || 1;
        map[key].revenue += it.subtotal || 0;
        map[key].cogs += cogs;
        map[key].profit += (it.subtotal || 0) - cogs;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [filteredOrders]);

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map = {};
    filteredOrders.forEach((ord) => {
      ord.items?.forEach((it) => {
        const prod = products.find((p) => p.id === it.product_id || p.name === it.product_name);
        const cat = prod?.category || 'ทั่วไป';
        if (!map[cat]) {
          map[cat] = { category: cat, revenue: 0, cogs: 0, profit: 0, qty: 0 };
        }
        const cogs = (it.unit_cost || 0) * (it.quantity || 1);
        map[cat].revenue += it.subtotal || 0;
        map[cat].cogs += cogs;
        map[cat].profit += (it.subtotal || 0) - cogs;
        map[cat].qty += it.quantity || 1;
      });
    });

    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    return list;
  }, [filteredOrders, products]);

  // Search in Orders
  const searchedOrders = useMemo(() => {
    return filteredOrders.filter((ord) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        ord.order_no?.toLowerCase().includes(q) ||
        ord.items?.some((it) => it.product_name?.toLowerCase().includes(q))
      );
    });
  }, [filteredOrders, search]);

  // Search in Stock Logs
  const searchedStockLogs = useMemo(() => {
    return stockLogs.filter((log) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (log.product_name && log.product_name.toLowerCase().includes(q)) ||
        (log.type && log.type.toLowerCase().includes(q)) ||
        (log.note && log.note.toLowerCase().includes(q)) ||
        (log.barcode && log.barcode.includes(q))
      );
    });
  }, [stockLogs, search]);

  // Export CSV with UTF-8 BOM
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      alert('ไม่มีข้อมูลออเดอร์เพื่อส่งออก');
      return;
    }
    const headers = [
      'เลขที่บิล',
      'วันที่-เวลา',
      'จำนวนรายการ',
      'ยอดขายรวม (บาท)',
      'ต้นทุน FIFO (บาท)',
      'กำไรขั้นต้น (บาท)',
      'อัตรากำไร GP%',
      'สถานะบัญชี'
    ];
    const rows = filteredOrders.map((ord) => {
      const cogs = ord.items?.reduce((s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)), 0) || ord.total_cost || 0;
      const profit = (ord.total_amount || 0) - cogs;
      const gp = ord.total_amount > 0 ? ((profit / ord.total_amount) * 100).toFixed(1) : 0;
      return [
        ord.order_no,
        `"${new Date(ord.created_at).toLocaleString('th-TH')}"`,
        ord.items?.length || ord.items_count || 1,
        (ord.total_amount || 0).toFixed(2),
        cogs.toFixed(2),
        profit.toFixed(2),
        `${gp}%`,
        'ลงบัญชีแล้ว'
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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
            <span className="text-primary font-semibold">P&amp;L FIFO Real-time</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight">
            ภาพรวมกำไร-ขาดทุน &amp; บัญชีต้นทุน FIFO
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            ข้อมูลตามธุรกรรมจริงจากฐานข้อมูล SQLite ตัดต้นทุน FIFO แม่นยำทุกบิล
          </p>
        </div>

        {/* Date Filter Pills & Export Trigger */}
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
            title="ส่งออกไฟล์รายงานเป็น Excel/CSV"
          >
            <FileDown className="w-3.5 h-3.5 text-primary" />
            <span>ส่งออก .CSV</span>
          </button>
        </div>
      </section>

      {/* Top 4 Real Bento KPI Cards */}
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
            <span className="text-primary font-semibold font-mono">
              {reportTimeframe === 'today' ? 'วันนี้' : reportTimeframe === 'week' ? '7 วันที่ผ่านมา' : reportTimeframe === 'month' ? 'เดือนนี้' : 'ยอดสะสมทั้งหมด'}
            </span>
            <span className="text-on-surface-variant font-mono">{orderCount} บิลขาย</span>
          </div>
        </div>

        {/* Card 2: COGS FIFO */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">ต้นทุนขาย FIFO (COGS)</span>
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
            <span>สัดส่วนต้นทุน {grossSales > 0 ? ((totalCogs / grossSales) * 100).toFixed(1) : 0}%</span>
            <span>เฉลี่ย ฿{avgTicket}/บิล</span>
          </div>
        </div>

        {/* Card 3: Gross Profit */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">กำไรขั้นต้น (Gross Profit)</span>
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
            <span className="text-primary font-bold">อัตรากำไร GP {gpMargin}%</span>
            <span>หักต้นทุนสินค้าจริง</span>
          </div>
        </div>

        {/* Card 4: Net Operating Profit */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">กำไรสุทธิการดำเนินงาน (Net Profit)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className={`text-xl font-bold tracking-tight font-mono ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ฿{netProfit.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>หักค่าใช้จ่าย ฿{totalExpenses.toFixed(2)}</span>
            <span className="font-bold text-emerald-600 font-mono">Net {netMargin}%</span>
          </div>
        </div>
      </section>

      {/* Middle Section: Real Dynamic Interactive Chart & Top 5 Champions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8 Cols: Real Dynamic Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-on-surface">
                  กราฟยอดขายและต้นทุนจริง (Dynamic P&amp;L)
                </span>
                {peakSlot && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                    พีคสุด: {peakSlot.shortLabel} (฿{peakSlot.sales.toLocaleString('th-TH')})
                  </span>
                )}
              </div>
              <span className="text-[11px] text-on-surface-variant block mt-0.5">
                คำนวณแบบ Real-time ตามช่วงเวลา {reportTimeframe === 'today' ? 'รายชั่วโมงวันนี้' : reportTimeframe === 'week' ? '7 วันย้อนหลัง' : reportTimeframe === 'month' ? 'สัปดาห์ในเดือนนี้' : 'รายเดือน'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
                <span className="text-on-surface-variant text-[11px]">ยอดขาย</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span>
                <span className="text-on-surface-variant text-[11px]">ต้นทุน FIFO</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span className="text-on-surface-variant text-[11px]">กำไรขั้นต้น</span>
              </div>
            </div>
          </div>

          {/* Real Bar Visualization */}
          <div className="w-full pt-2">
            {grossSales === 0 ? (
              <div className="h-44 w-full flex flex-col items-center justify-center text-center border border-dashed border-surface-container-high rounded-xl p-4">
                <BarChart3 className="w-8 h-8 text-on-surface-variant/40 mb-1.5" />
                <span className="text-xs font-semibold text-on-surface-variant">
                  ยังไม่มีข้อมูลการขายจริงในช่วงเวลานี้
                </span>
                <span className="text-[11px] text-on-surface-variant/60 mt-0.5">
                  เมื่อคิดเงินและบันทึกออเดอร์ กราฟจะพล็อตยอดขายและต้นทุนตามช่วงเวลาจริงอัตโนมัติ
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Visual Chart Bars */}
                <div className="h-44 w-full flex items-end justify-between gap-2 px-1 pt-6 pb-1 border-b border-surface-container">
                  {chartData.map((slot, idx) => {
                    const salesHeightPct = maxChartVal > 0 ? Math.min(100, Math.max(4, (slot.sales / maxChartVal) * 100)) : 4;
                    const cogsHeightPct = maxChartVal > 0 ? Math.min(100, Math.max(2, (slot.cogs / maxChartVal) * 100)) : 2;
                    const isPeak = peakSlot && peakSlot.shortLabel === slot.shortLabel && slot.sales > 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                        title={`${slot.label}\nยอดขาย: ฿${slot.sales.toFixed(2)}\nต้นทุน: ฿${slot.cogs.toFixed(2)}\nกำไร: ฿${slot.profit.toFixed(2)} (${slot.orders} บิล)`}
                      >
                        {/* Peak indicator */}
                        {isPeak && (
                          <div className="absolute -top-5 text-[9px] font-bold text-primary bg-primary-fixed px-1 rounded shadow-xs whitespace-nowrap animate-bounce">
                            Peak
                          </div>
                        )}

                        {/* Dual Column Bars */}
                        <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-full">
                          {/* Sales Bar */}
                          <div
                            style={{ height: `${salesHeightPct}%` }}
                            className={`w-1/2 rounded-t-md transition-all duration-300 ${
                              isPeak ? 'bg-primary' : 'bg-primary/80 group-hover:bg-primary'
                            }`}
                          />
                          {/* COGS Bar */}
                          <div
                            style={{ height: `${cogsHeightPct}%` }}
                            className="w-1/2 rounded-t-md bg-slate-400/80 group-hover:bg-slate-400 transition-all duration-300"
                          />
                        </div>

                        {/* Hover Tooltip Card */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col p-2 bg-slate-900 text-white rounded-lg shadow-xl text-[10px] z-30 pointer-events-none min-w-[120px] whitespace-nowrap">
                          <span className="font-bold text-white border-b border-white/10 pb-0.5 mb-1">{slot.label}</span>
                          <span className="text-primary-fixed font-mono">ขาย: ฿{slot.sales.toFixed(2)}</span>
                          <span className="text-slate-300 font-mono">ทุน: ฿{slot.cogs.toFixed(2)}</span>
                          <span className="text-emerald-400 font-mono font-bold">กำไร: +฿{slot.profit.toFixed(2)}</span>
                          <span className="text-white/60 text-[9px] mt-0.5">{slot.orders} รายการ</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Timeline Labels */}
                <div className="flex justify-between items-center text-on-surface-variant text-[11px] px-1 font-sans">
                  {chartData.map((slot, idx) => (
                    <span
                      key={idx}
                      className={`text-center truncate flex-1 ${
                        peakSlot && peakSlot.shortLabel === slot.shortLabel ? 'text-primary font-bold' : ''
                      }`}
                    >
                      {slot.shortLabel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>คำนวณจากยอดออเดอร์ในระบบจริง</span>
            </span>
            <span className="text-primary font-bold font-mono">
              อัตรากำไรขั้นต้นรวม {gpMargin}% GP
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Top 5 Profit Champions */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-bold text-on-surface">5 อันดับสินค้าทำกำไรสูงสุด</span>
              <span className="text-[11px] text-on-surface-variant block">Top Gross Profit Contributors</span>
            </div>
            <Award className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-2 my-auto">
            {topContributors.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-xs">
                ยังไม่มีข้อมูลการขายในรอบนี้
              </div>
            ) : (
              topContributors.map((item, idx) => {
                const gp = item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(0) : 0;
                const profitShare = grossProfit > 0 ? Math.min(100, (item.profit / grossProfit) * 100).toFixed(0) : 0;

                return (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-primary-container text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </div>
                        <span className="font-bold text-on-surface truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-primary font-mono shrink-0 pl-2">
                        +฿{item.profit.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-sans">
                      <span>ขายได้ {item.qty} ชิ้น • ยอด ฿{item.revenue.toFixed(0)}</span>
                      <span className="font-semibold text-emerald-600">GP {gp}% (สัดส่วน {profitShare}%)</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                      <div
                        style={{ width: `${profitShare}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-surface-container text-right text-[11px] text-on-surface-variant font-medium">
            รวมกำไร 5 อันดับ: <span className="font-bold font-mono text-on-surface">฿{topContributors.reduce((s, it) => s + it.profit, 0).toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Condensed Real P&L Statement (งบกำไรขาดทุนย่อ) */}
      <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-on-surface">งบกำไรขาดทุนย่อ (Condensed P&amp;L Statement)</h3>
              <p className="text-[10px] text-on-surface-variant">สรุปรายได้ หักต้นทุน FIFO และค่าใช้จ่ายดำเนินงานจริง</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-mono font-semibold">
            {reportTimeframe === 'today' ? 'รายวัน' : reportTimeframe === 'week' ? 'สัปดาห์นี้' : reportTimeframe === 'month' ? 'รายเดือน' : 'สะสมทั้งหมด'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-3">
          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high">
            <span className="text-[11px] text-on-surface-variant block mb-1">1. รายได้จากการขาย (Revenue)</span>
            <span className="text-base font-bold font-mono text-on-surface">฿{grossSales.toFixed(2)}</span>
            <span className="text-[10px] text-on-surface-variant block mt-1">100.0% ของยอดขาย</span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high">
            <span className="text-[11px] text-on-surface-variant block mb-1">2. ต้นทุนสินค้า FIFO (COGS)</span>
            <span className="text-base font-bold font-mono text-slate-700">฿{totalCogs.toFixed(2)}</span>
            <span className="text-[10px] text-on-surface-variant block mt-1">
              {grossSales > 0 ? ((totalCogs / grossSales) * 100).toFixed(1) : 0}% ของยอดขาย
            </span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high">
            <span className="text-[11px] text-primary font-semibold block mb-1">3. กำไรขั้นต้น (Gross Profit)</span>
            <span className="text-base font-bold font-mono text-primary">฿{grossProfit.toFixed(2)}</span>
            <span className="text-[10px] text-primary font-semibold block mt-1">GP Margin {gpMargin}%</span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high">
            <span className="text-[11px] text-on-surface-variant block mb-1">4. ค่าใช้จ่ายดำเนินงาน (Expenses)</span>
            <span className="text-base font-bold font-mono text-rose-600">฿{totalExpenses.toFixed(2)}</span>
            <span className="text-[10px] text-on-surface-variant block mt-1">{filteredExpenses.length} รายการค่าใช้จ่าย</span>
          </div>

          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
            <span className="text-[11px] text-emerald-700 font-bold block mb-1">5. กำไรสุทธิ (Net Operating Profit)</span>
            <span className={`text-base font-bold font-mono ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ฿{netProfit.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">Net Margin {netMargin}%</span>
          </div>
        </div>
      </section>

      {/* Lower Midnight Slate Section (Audit Tables) */}
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
              <span>ประวัติเคลื่อนไหวสต็อกจริง ({stockLogs.length})</span>
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
                    <th className="py-2.5 px-3 font-semibold text-right">ยอดขาย (฿)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ต้นทุน FIFO (฿)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">กำไรขั้นต้น (฿)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">สถานะบัญชี</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ใบเสร็จ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {searchedOrders.map((ord) => {
                    const cogs = ord.items?.reduce(
                      (s, it) => s + ((it.unit_cost || 0) * (it.quantity || 1)),
                      0
                    ) || ord.total_cost || 0;
                    const profit = (ord.total_amount || 0) - cogs;
                    const gp = ord.total_amount > 0 ? ((profit / ord.total_amount) * 100).toFixed(1) : 0;

                    return (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-white">
                          {ord.order_no}
                        </td>
                        <td className="py-2.5 px-3 text-inverse-on-surface/70 whitespace-nowrap">
                          {new Date(ord.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-white truncate block max-w-[200px]" title={ord.items?.map((it) => `${it.product_name} (${it.quantity})`).join(', ')}>
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                            ลงบัญชีแล้ว
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

        {/* Stock Logs Table (Fixed Real Database Mapping) */}
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
                    <th className="py-2.5 px-3 font-semibold">ประเภทรายการ</th>
                    <th className="py-2.5 px-3 font-semibold text-right">จำนวนที่เปลี่ยน</th>
                    <th className="py-2.5 px-3 font-semibold text-right">ต้นทุน/ชิ้น</th>
                    <th className="py-2.5 px-3 font-semibold text-right">มูลค่ารวม (฿)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">สต็อกปัจจุบัน</th>
                    <th className="py-2.5 px-3 font-semibold">หมายเหตุ / เลขที่บิล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {searchedStockLogs.map((log) => {
                    const isPositive = log.change_qty > 0;
                    const isPurchase = log.type === 'PURCHASE_IN' || log.type === 'INITIAL_STOCK';

                    return (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-inverse-on-surface/70 whitespace-nowrap">
                          {new Date(log.created_at || Date.now()).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white">
                          <div className="truncate max-w-[180px]">{log.product_name || 'สินค้า'}</div>
                          {log.barcode && <span className="text-[10px] text-inverse-on-surface/50 font-mono">{log.barcode}</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isPurchase
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {log.type === 'PURCHASE_IN' ? 'รับเข้าสต็อก' : log.type === 'INITIAL_STOCK' ? 'สต็อกเริ่มต้น' : 'ตัดสต็อกขาย'}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? `+${log.change_qty}` : `${log.change_qty}`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-inverse-on-surface/70">
                          ฿{(log.unit_cost || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          ฿{(log.total_cost || Math.abs(log.change_qty * (log.unit_cost || 0))).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary-fixed">
                          {log.current_stock !== undefined && log.current_stock !== null ? `${log.current_stock} ชิ้น` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-inverse-on-surface/60">{log.note || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
