import React, { useState } from 'react';

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
    <div className="w-full">
      {/* Page Header & Action Bar */}
      <section className="w-full px-margin pt-space-lg pb-space-md">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-1">
              <span className="hover:text-primary cursor-pointer transition-colors">COPPER GOLEM POS</span>
              <span className="text-outline-variant">/</span>
              <span>ระบบคลังสินค้า &amp; ต้นทุน</span>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-semibold">Inventory Engine</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight flex items-center gap-space-sm">
              คลังสินค้า &amp; เครื่องคิดเลขต้นทุนอัจฉริยะ
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-primary font-label-sm text-label-sm font-semibold">
                FIFO Live v2.4
              </span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              จัดการสต็อกสินค้า คำนวณต้นทุนต่อหน่วยแบบเรียลไทม์ และพิมพ์สติกเกอร์บาร์โค้ด Code 128 สำหรับร้านกาแฟและเบเกอรี่
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-surface-container-high transition-all active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">file_download</span>
              <span>ส่งออก (.CSV)</span>
            </button>

            <button
              onClick={() => {
                if (products.length > 0) onOpenBarcode(products[0]);
                else alert('ไม่มีสินค้าในระบบ');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-surface-container-high transition-all active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">print</span>
              <span>พิมพ์บาร์โค้ด (Code 128)</span>
            </button>

            <button
              onClick={() => {
                if (products.length > 0) onOpenRestock(products[0]);
                else alert('ไม่มีสินค้าให้เติมสต็อก กรุณาเพิ่มสินค้าก่อน');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">archive</span>
              <span>รับเข้าสต็อกด่วน</span>
            </button>

            <button
              onClick={() => onOpenAddProduct()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-[0_6px_16px_rgba(91,76,245,0.35)] hover:bg-primary transition-all active:scale-95 font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ เพิ่มสินค้าใหม่ (F3)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Finnova Style Telemetry Bento Cards */}
      <section className="w-full px-margin pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* Card 1: Total Stock Value */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                มูลค่าสินค้าในคลังรวม (FIFO)
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-stat-display text-stat-display text-on-surface tracking-tight font-bold font-mono">
                ฿{totalStockValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>ฐานสินทรัพย์หมุนเวียน</span>
              <span className="text-primary font-semibold font-label-sm">Real-time valuation</span>
            </div>
          </div>

          {/* Card 2: SKU Count */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                จำนวนรายการสินค้า (SKU)
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-stat-display text-stat-display text-on-surface tracking-tight font-bold font-mono">
                {totalSkus} <span className="text-headline-sm font-normal text-on-surface-variant">รายการ</span>
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>ครอบคลุม {categories.length - 1} หมวดหมู่</span>
              <span className="text-secondary font-semibold font-label-sm">Active Catalog</span>
            </div>
          </div>

          {/* Card 3: Low Stock Alerts */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                สินค้าสต็อกต่ำกว่าเกณฑ์
              </span>
              <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-stat-display text-stat-display text-error tracking-tight font-bold font-mono">
                {lowStockCount} <span className="text-headline-sm font-normal text-error/70">รายการ</span>
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant">ต้องสั่งซื้อเพิ่ม (ROP)</span>
              {lowStockCount > 0 ? (
                <button
                  onClick={() => setSelectedCat('low_stock')}
                  className="text-error font-semibold font-label-sm hover:underline"
                >
                  คลิกเพื่อกรอง
                </button>
              ) : (
                <span className="text-primary font-semibold font-label-sm">สต็อกพร้อมขาย</span>
              )}
            </div>
          </div>

          {/* Card 4: Average GP Margin */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                อัตรากำไรเฉลี่ย (Average GP%)
              </span>
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">percent</span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-stat-display text-stat-display text-on-surface tracking-tight font-bold font-mono">
                {avgMargin}%
              </span>
              <span className="font-body-sm text-body-sm text-primary font-semibold">เป้าหมาย &gt; 50%</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, avgMargin))}%` }}
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                {avgMargin >= 50 ? 'เกณฑ์แข็งแกร่ง' : 'ควรปรับราคา'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Smart Cost & Pricing Calculator */}
      <section className="w-full px-margin pb-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_10px_30px_rgba(15,23,42,0.04)] border border-surface-container-high relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-space-md gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[22px]">calculate</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  เครื่องคำนวณต้นทุนต่อหน่วย &amp; กำไรสุทธิอัจฉริยะ (Smart Pricing Engine)
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  คำนวณราคาซื้อเหมาลัง/แพ็ค แปลงเป็นต้นทุนย่อยต่อชิ้น และตั้งเป้า GP% แนะนำราคาขายหน้าร้าน
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs self-start lg:self-auto">
              <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                อัลกอริทึม: FIFO + Overhead
              </span>
            </div>
          </div>

          {/* Interactive Calculator Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md mt-space-md items-center">
            {/* Input 1: Pack Price */}
            <div className="md:col-span-3 bg-surface-container-low rounded-xl p-3.5 border border-surface-container-high">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">
                1. ราคายกแพ็ค / ลัง (รวม VAT)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">฿</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={calcPackCost}
                  onChange={(e) => setCalcPackCost(parseFloat(e.target.value) || 0)}
                  className="w-full font-headline-sm text-headline-sm text-on-surface bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container-highest shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold font-mono"
                />
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1 block">
                ใบเสร็จซัพพลายเออร์ส่งตรง
              </span>
            </div>

            {/* Input 2: Units per Pack */}
            <div className="md:col-span-2 bg-surface-container-low rounded-xl p-3.5 border border-surface-container-high">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">
                2. จำนวนหน่วยต่อแพ็ค
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full font-headline-sm text-headline-sm text-on-surface bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container-highest shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold font-mono"
                />
                <span className="font-body-md text-body-md text-on-surface-variant shrink-0">ชิ้น</span>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1 block">
                บรรจุในกล่องนำส่ง
              </span>
            </div>

            {/* Calculated Cost per Unit */}
            <div className="md:col-span-2 bg-surface-container rounded-xl p-3.5 flex flex-col justify-center border border-surface-container-high">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                3. ต้นทุนต่อชิ้น (Unit Cost)
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-primary font-bold font-mono">
                  ฿{unitCost.toFixed(2)}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">/ ชิ้น</span>
              </div>
              <span className="font-label-sm text-[11px] text-secondary font-medium">คำนวณอัตโนมัติ</span>
            </div>

            {/* Target GP Margin */}
            <div className="md:col-span-2 bg-surface-container-low rounded-xl p-3.5 border border-surface-container-high">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">
                4. ตั้งเป้ากำไรขั้นต้น (GP%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={calcMargin}
                  onChange={(e) => setCalcMargin(parseFloat(e.target.value) || 0)}
                  className="w-full font-headline-sm text-headline-sm text-on-surface bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container-highest shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold font-mono"
                />
                <span className="font-headline-sm text-headline-sm text-on-surface">%</span>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1 block">
                มาตรฐานค้าปลีก &amp; คาเฟ่
              </span>
            </div>

            {/* Recommendation & Direct Action Card */}
            <div className="md:col-span-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl p-3.5 shadow-[0_6px_16px_rgba(91,76,245,0.25)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-primary/80 uppercase font-semibold">
                  ราคาขายปลีกแนะนำ (MSRP)
                </span>
                <span className="material-symbols-outlined text-[18px] text-on-primary/80">local_offer</span>
              </div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl font-bold text-on-primary font-mono">
                  ฿{recommendedPrice.toFixed(2)}
                </span>
                <span className="font-label-md text-label-md text-inverse-on-surface font-semibold font-mono">
                  +฿{netProfit.toFixed(2)} กำไร
                </span>
              </div>
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => onOpenAddProduct({
                    cost_price: unitCost.toString(),
                    sell_price: recommendedPrice.toString(),
                    profit_margin: netProfit.toString(),
                    pack_cost: calcPackCost.toString(),
                    pack_qty: calcUnits.toString()
                  })}
                  type="button"
                  className="px-3 py-1 rounded-full bg-white text-primary hover:bg-surface text-label-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>นำราคานี้ไปสร้างสินค้า</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Midnight Slate Stock & FIFO Lots Table */}
      <section className="w-full px-margin pb-space-xl">
        <div className="bg-[#181824] text-inverse-on-surface rounded-3xl p-space-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden border border-white/10">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-tertiary-container/10 blur-3xl pointer-events-none"></div>

          {/* Console Filter & Header Rail */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-lg relative z-10">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-inverse-on-surface/50">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-inverse-on-surface placeholder:text-inverse-on-surface/40 font-body-md text-body-md pl-10 pr-24 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-primary-container transition-all border border-white/5"
                placeholder="ค้นหาชื่อสินค้า, SKU, บาร์โค้ด Code 128 (F2)..."
                type="text"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-inverse-on-surface/60">
                  barcode_scanner
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    type="button"
                    className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-[0_4px_12px_rgba(91,76,245,0.4)]'
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
                  className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                    selectedCat === 'low_stock'
                      ? 'bg-error text-white shadow-md'
                      : 'bg-error/20 hover:bg-error/30 text-error-container'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                  สินค้าใกล้หมด ({lowStockCount})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto relative z-10">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-inverse-on-surface/50">
                <span className="material-symbols-outlined text-[36px] mb-2">inventory_2</span>
                <p>ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</p>
              </div>
            ) : (
              <table className="w-full text-left font-body-md text-body-md">
                <thead>
                  <tr className="text-inverse-on-surface/60 font-label-md text-label-md border-b border-white/10 pb-3">
                    <th className="py-3 px-4 font-semibold">รายการสินค้า / บาร์โค้ด</th>
                    <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                    <th className="py-3 px-4 font-semibold text-right">ต้นทุน FIFO</th>
                    <th className="py-3 px-4 font-semibold text-right">ราคาขายปลีก</th>
                    <th className="py-3 px-4 font-semibold text-center">กำไรต่อชิ้น (GP%)</th>
                    <th className="py-3 px-4 font-semibold text-center">คงเหลือในสต็อก</th>
                    <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
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
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3.5 px-4 rounded-l-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10 shadow-sm relative flex items-center justify-center">
                              {prod.image_url ? (
                                <img
                                  src={prod.image_url}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-inverse-on-surface/40 text-[20px]">
                                  package_2
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-headline-sm text-body-md text-white truncate group-hover:text-primary-fixed transition-colors font-medium">
                                {prod.name}
                              </span>
                              <span className="font-body-sm text-[11px] text-inverse-on-surface/60 flex items-center gap-1.5 font-mono">
                                <span>รหัส: #{prod.barcode || prod.id}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-primary-container/30 text-on-primary-container font-label-sm text-label-sm">
                            {prod.category || 'ทั่วไป'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-body-lg text-body-md text-white font-semibold font-mono">
                            ฿{cost.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-headline-sm text-headline-sm text-primary-fixed font-bold font-mono">
                            ฿{sell.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2 py-0.5 rounded-full bg-primary-container text-white font-label-sm text-[11px] font-bold shadow-sm font-mono">
                              +฿{profit.toFixed(2)} ({gp}%)
                            </span>
                            <span className="font-body-sm text-[10px] text-inverse-on-surface/50 mt-0.5">
                              {Number(gp) >= 50 ? 'High Margin' : 'Standard'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isOutOfStock
                                    ? 'bg-error'
                                    : isLowStock
                                    ? 'bg-amber-400 animate-ping'
                                    : 'bg-primary-fixed'
                                }`}
                              ></span>
                              <span className="font-headline-sm text-headline-sm text-white font-bold font-mono">
                                {prod.stock_qty}
                              </span>
                              <span className="font-body-sm text-body-sm text-inverse-on-surface/60">ชิ้น</span>
                            </div>
                            <span className="font-label-sm text-[10px] text-inverse-on-surface/50 mt-0.5">
                              {isOutOfStock ? 'หมดสต็อก' : isLowStock ? 'เตือนสต็อกต่ำ' : 'สถานะ: ปกติ'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right rounded-r-xl">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenRestock(prod)}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                              title="เติมสต็อกสินค้า (FIFO Batch)"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">add_circle</span>
                            </button>
                            <button
                              onClick={() => onOpenBarcode(prod)}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                              title="พิมพ์บาร์โค้ด Code 128"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                            </button>
                            <button
                              onClick={() => onOpenEditProduct(prod)}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                              title="แก้ไขรายการ"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={() => onDeleteProduct(prod.id, prod.name)}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-error/30 text-white hover:text-error-container flex items-center justify-center transition-colors active:scale-95"
                              title="ลบสินค้า"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
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
        </div>
      </section>
    </div>
  );
}
