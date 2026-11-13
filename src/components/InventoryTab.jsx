import React, { useState } from 'react';
import {
  FileDown,
  Printer,
  Archive,
  Plus,
  Wallet,
  Boxes,
  AlertTriangle,
  Percent,
  Calculator,
  Search,
  Barcode,
  PlusCircle,
  Edit,
  Trash2,
  Package,
  Tag
} from 'lucide-react';

export default function InventoryTab({
  products,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onOpenRestock,
  onOpenBarcode
}) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Smart Pricing Engine State
  const [calcPackCost, setCalcPackCost] = useState(1200);
  const [calcUnits, setCalcUnits] = useState(30);
  const [calcMargin, setCalcMargin] = useState(55);

  // Unit Cost & Recommended Price calculation
  const unitCost = calcUnits > 0 ? Number((calcPackCost / calcUnits).toFixed(2)) : 0;
  const recommendedPrice = calcMargin < 100
    ? Number((unitCost / (1 - (calcMargin / 100))).toFixed(2))
    : Number((unitCost * 2).toFixed(2));
  const netProfit = Number((recommendedPrice - unitCost).toFixed(2));

  // Bento Metrics
  const totalStockValue = products.reduce((sum, p) => sum + ((p.cost_price || 0) * (p.stock_qty || 0)), 0);
  const totalSkus = products.length;
  const lowStockCount = products.filter(p => p.stock_qty <= (p.min_stock || 5)).length;
  const avgMargin = products.length > 0
    ? (products.reduce((sum, p) => {
        const cost = p.cost_price || 0;
        const sell = p.sell_price || 0;
        const gp = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
        return sum + gp;
      }, 0) / products.length).toFixed(1)
    : 0;

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'ทั่วไป')))];

  // Filtered Products
  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    if (selectedCat === 'low_stock') {
      return matchesSearch && p.stock_qty <= (p.min_stock || 5);
    }
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  // Export CSV with UTF-8 BOM
  const handleExportCsv = () => {
    if (products.length === 0) {
      alert('ไม่มีข้อมูลสินค้าเพื่อส่งออก');
      return;
    }
    const headers = ['รหัสสินค้า', 'ชื่อสินค้า', 'หมวดหมู่', 'บาร์โค้ด', 'ต้นทุนต่อชิ้น', 'ราคาขาย', 'กำไรต่อชิ้น', 'สต็อกคงเหลือ', 'จุดสั่งซื้อซ้ำ'];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category || 'ทั่วไป'}"`,
      `"${p.barcode || ''}"`,
      (p.cost_price || 0).toFixed(2),
      (p.sell_price || 0).toFixed(2),
      ((p.sell_price || 0) - (p.cost_price || 0)).toFixed(2),
      p.stock_qty,
      p.min_stock || 5
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `คลังสินค้า_CopperGolem_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Page Header & Action Bar */}
      <section className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-1">
            <span className="hover:text-primary cursor-pointer transition-colors font-medium">COPPER GOLEM POS</span>
            <span className="text-outline-variant">/</span>
            <span>ระบบคลังสินค้า &amp; ต้นทุน</span>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-semibold">Inventory Engine</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span>คลังสินค้า &amp; เครื่องคิดเลขต้นทุนอัจฉริยะ</span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-primary text-xs font-semibold">
              FIFO Live v2.4
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            จัดการสต็อกสินค้า คำนวณต้นทุนต่อหน่วยแบบเรียลไทม์ และพิมพ์สติกเกอร์บาร์โค้ด Code 128
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold shadow-xs border border-surface-container-high transition-all"
            type="button"
          >
            <FileDown className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>ส่งออก (.CSV)</span>
          </button>

          <button
            onClick={() => {
              if (products.length > 0) onOpenBarcode(products[0]);
              else alert('ไม่มีสินค้าในระบบ');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold shadow-xs border border-surface-container-high transition-all"
            type="button"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            <span>พิมพ์บาร์โค้ด</span>
          </button>

          <button
            onClick={() => {
              if (products.length > 0) onOpenRestock(products[0]);
              else alert('ไม่มีสินค้าให้เติมสต็อก');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all"
            type="button"
          >
            <Archive className="w-3.5 h-3.5 text-primary" />
            <span>รับเข้าสต็อกด่วน</span>
          </button>

          <button
            onClick={() => onOpenAddProduct()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-container text-white text-xs font-bold shadow-md hover:bg-primary transition-all active:scale-95"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่ (F3)</span>
          </button>
        </div>
      </section>

      {/* 4 Bento Telemetry Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Stock Value */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">มูลค่าสินค้าในคลัง (FIFO)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-on-surface tracking-tight font-mono">
              ฿{totalStockValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>ฐานสินทรัพย์หมุนเวียน</span>
            <span className="text-primary font-semibold">Real-time</span>
          </div>
        </div>

        {/* Card 2: SKUs */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">จำนวนรายการสินค้า (SKU)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-on-surface tracking-tight font-mono">
              {totalSkus} <span className="text-sm font-normal text-on-surface-variant">รายการ</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>{categories.length - 1} หมวดหมู่</span>
            <span className="text-secondary font-semibold">Active Catalog</span>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">สินค้าสต็อกต่ำ</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-rose-600 tracking-tight font-mono">
              {lowStockCount} <span className="text-sm font-normal text-rose-400">รายการ</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-on-surface-variant">ต้องสั่งซื้อเพิ่ม (ROP)</span>
            {lowStockCount > 0 ? (
              <button
                onClick={() => setSelectedCat('low_stock')}
                className="text-rose-600 font-bold hover:underline"
              >
                กรองรายการ
              </button>
            ) : (
              <span className="text-primary font-semibold">ปกติ</span>
            )}
          </div>
        </div>

        {/* Card 4: Margin */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">อัตรากำไรเฉลี่ย (GP%)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-on-surface tracking-tight font-mono">
              {avgMargin}%
            </span>
            <span className="text-[11px] text-primary font-semibold">เป้า &gt; 50%</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, avgMargin))}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
              {avgMargin >= 50 ? 'แข็งแกร่ง' : 'ควรปรับ'}
            </span>
          </div>
        </div>
      </section>

      {/* Smart Cost & Pricing Calculator */}
      <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-container-high">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                เครื่องคำนวณต้นทุนต่อหน่วย &amp; กำไรสุทธิอัจฉริยะ (Smart Pricing Engine)
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                คำนวณราคาซื้อยกแพ็ค แปลงเป็นต้นทุนย่อย และตั้งเป้า GP% แนะนำราคาขาย
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold self-start sm:self-auto">
            FIFO + Overhead
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-3 items-center">
          <div className="lg:col-span-3 bg-surface-container-low rounded-xl p-3 border border-surface-container-high">
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
              1. ราคายกแพ็ค / ลัง (รวม VAT)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-on-surface">฿</span>
              <input
                type="number"
                min="0"
                step="any"
                value={calcPackCost}
                onChange={(e) => setCalcPackCost(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-bold font-mono text-on-surface bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-3 border border-surface-container-high">
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
              2. จำนวนหน่วยต่อแพ็ค
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                value={calcUnits}
                onChange={(e) => setCalcUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full text-sm font-bold font-mono text-on-surface bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-on-surface-variant shrink-0">ชิ้น</span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface-container rounded-xl p-3 border border-surface-container-high">
            <span className="text-[11px] font-semibold text-on-surface-variant block">
              3. ต้นทุนต่อชิ้น (Unit Cost)
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary font-mono">
                ฿{unitCost.toFixed(2)}
              </span>
              <span className="text-[10px] text-on-surface-variant">/ ชิ้น</span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-3 border border-surface-container-high">
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
              4. ตั้งเป้ากำไร (GP%)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="99"
                value={calcMargin}
                onChange={(e) => setCalcMargin(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-bold font-mono text-on-surface bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs font-bold text-on-surface">%</span>
            </div>
          </div>

          <div className="lg:col-span-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl p-3 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-white/80 font-semibold">
              <span>ราคาขายปลีกแนะนำ</span>
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div className="my-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono">
                ฿{recommendedPrice.toFixed(2)}
              </span>
              <span className="text-[11px] text-white/90 font-mono">
                +฿{netProfit.toFixed(2)} กำไร
              </span>
            </div>
            <button
              onClick={() => onOpenAddProduct({
                cost_price: unitCost.toString(),
                sell_price: recommendedPrice.toString(),
                profit_margin: netProfit.toString(),
                pack_cost: calcPackCost.toString(),
                pack_qty: calcUnits.toString()
              })}
              type="button"
              className="mt-1 px-3 py-1 rounded-full bg-white text-primary hover:bg-surface text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>นำราคานี้ไปสร้างสินค้า</span>
            </button>
          </div>
        </div>
      </section>

      {/* Midnight Slate Stock Table */}
      <section className="bg-[#181824] text-inverse-on-surface rounded-2xl p-4 shadow-xl border border-white/10">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-inverse-on-surface/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า, SKU, บาร์โค้ด..."
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-inverse-on-surface/40 text-xs pl-9 pr-3 py-2 rounded-full outline-none focus:ring-1 focus:ring-primary border border-white/5"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/15 text-inverse-on-surface/80 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat}
                </button>
              );
            })}

            {lowStockCount > 0 && (
              <button
                onClick={() => setSelectedCat('low_stock')}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedCat === 'low_stock'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                สต็อกต่ำ ({lowStockCount})
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto pt-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-inverse-on-surface/40">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-inverse-on-surface/60 border-b border-white/10 pb-2">
                  <th className="py-2.5 px-3 font-semibold">สินค้า / บาร์โค้ด</th>
                  <th className="py-2.5 px-3 font-semibold">หมวดหมู่</th>
                  <th className="py-2.5 px-3 font-semibold text-right">ต้นทุน FIFO</th>
                  <th className="py-2.5 px-3 font-semibold text-right">ราคาขาย</th>
                  <th className="py-2.5 px-3 font-semibold text-center">กำไร (GP%)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">สต็อก</th>
                  <th className="py-2.5 px-3 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((prod) => {
                  const cost = prod.cost_price || 0;
                  const sell = prod.sell_price || 0;
                  const profit = sell - cost;
                  const gp = sell > 0 ? ((profit / sell) * 100).toFixed(1) : '0';
                  const isLowStock = prod.stock_qty <= (prod.min_stock || 5);
                  const isOutOfStock = prod.stock_qty <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-inverse-on-surface/40" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white truncate text-xs">{prod.name}</span>
                            <span className="text-[10px] text-inverse-on-surface/60 font-mono">
                              #{prod.barcode || prod.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-inverse-on-surface text-[11px]">
                          {prod.category || 'ทั่วไป'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-white font-semibold">
                        ฿{cost.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-primary-fixed font-bold">
                        ฿{sell.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-white text-[10px] font-bold font-mono">
                          +฿{profit.toFixed(2)} ({gp}%)
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : isLowStock
                                ? 'bg-amber-400 animate-ping'
                                : 'bg-emerald-400'
                            }`}
                          ></span>
                          <span className="font-bold text-white font-mono">{prod.stock_qty}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenRestock(prod)}
                            className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors"
                            title="เติมสต็อก"
                            type="button"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenBarcode(prod)}
                            className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors"
                            title="พิมพ์บาร์โค้ด"
                            type="button"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditProduct(prod)}
                            className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors"
                            title="แก้ไข"
                            type="button"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-full hover:bg-rose-500/20 text-inverse-on-surface/50 hover:text-rose-400 transition-colors"
                            title="ลบ"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
