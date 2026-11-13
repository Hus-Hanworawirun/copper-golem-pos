import React, { useRef, useEffect } from 'react';

export default function CashierTab({
  products,
  cart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  onCheckout,
  onOpenAddProduct
}) {
  const searchInputRef = useRef(null);

  // Compute Totals
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCogs = cart.reduce((sum, item) => sum + ((item.unit_cost || 0) * item.quantity), 0);
  const grossProfit = totalAmount - totalCogs;
  const gpPercent = totalAmount > 0 ? ((grossProfit / totalAmount) * 100).toFixed(1) : 0;

  // Thai VAT 7% calculation (VAT-inclusive standard)
  const vatAmount = Number((totalAmount * 7 / 107).toFixed(2));
  const preVatAmount = Number((totalAmount - vatAmount).toFixed(2));

  // Change Calculation
  const receivedNum = paymentMethod === 'CASH'
    ? (parseFloat(cashReceived) || (cashReceived === '' ? 0 : 0))
    : totalAmount;
  const changeDue = receivedNum >= totalAmount ? Number((receivedNum - totalAmount).toFixed(2)) : 0;

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // F2 and F10 Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (cart.length > 0) {
          onCheckout();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, onCheckout]);

  // Quick tender suggestions
  const getQuickTenderOptions = () => {
    if (totalAmount <= 0) return [100, 500, 1000];
    const opts = [totalAmount];
    const hundreds = Math.ceil(totalAmount / 100) * 100;
    if (hundreds > totalAmount && !opts.includes(hundreds)) opts.push(hundreds);
    const fiveHundreds = Math.ceil(totalAmount / 500) * 500;
    if (fiveHundreds > totalAmount && !opts.includes(fiveHundreds)) opts.push(fiveHundreds);
    const thousands = Math.ceil(totalAmount / 1000) * 1000;
    if (thousands > totalAmount && !opts.includes(thousands)) opts.push(thousands);
    return opts.slice(0, 4);
  };

  return (
    <div className="w-full px-margin py-space-md flex flex-col xl:flex-row gap-space-lg items-start">
      {/* LEFT CATALOG SECTION */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-space-md">
        {/* Screen Header & Fast Barcode Action Hub */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface p-space-md rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-surface-container-high">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                Fast-Scan Register Engine
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="font-label-sm text-label-sm text-secondary">
                USB Barcode HID Direct
              </span>
            </div>
            <div className="flex items-baseline gap-space-sm mt-0.5">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                ขายหน้าร้าน (Register POS)
              </h1>
              <span className="font-body-md text-body-md text-on-surface-variant hidden md:inline">
                ระบบยิงบาร์โค้ด USB Focus-Free และคิดเงินอัตโนมัติ
              </span>
            </div>
          </div>

          {/* Quick Action Controls & Scanner Input */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative flex items-center min-w-[280px] lg:min-w-[340px]">
              <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-primary">
                barcode_scanner
              </span>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-14 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md font-body-md rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                placeholder="ยิงบาร์โค้ด / ค้นหาชื่อสินค้า (กด F2)..."
                type="text"
              />
              <kbd className="absolute right-3 px-2 py-0.5 bg-surface-container text-on-surface-variant text-label-sm font-label-sm rounded-full border border-surface-container-highest">
                F2
              </kbd>
            </div>

            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-space-xs px-space-md py-2.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-surface-container-high transition-all active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
              <span>+ เพิ่มสินค้าด่วน</span>
            </button>
          </div>
        </div>

        {/* Category Filter Segmented Rails */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface px-space-md py-space-sm rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-surface-container-high">
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = cat === 'all'
                ? products.length
                : products.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  type="button"
                  className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-[0_2px_8px_rgba(91,76,245,0.4)] font-semibold'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high'
                  }`}
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-space-xs self-end shrink-0">
            <span className="font-label-sm text-label-sm text-outline">
              แสดง {filteredProducts.length} รายการ
            </span>
          </div>
        </div>

        {/* Product Fast Pick Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-surface-container-high">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h3 className="font-headline-sm text-on-surface mb-1">ไม่พบสินค้าในระบบ</h3>
            <p className="font-body-md text-on-surface-variant mb-4">
              ลองค้นหาด้วยคำอื่น หรือกดปุ่มด้านล่างเพื่อเพิ่มสินค้าใหม่
            </p>
            <button
              onClick={onOpenAddProduct}
              type="button"
              className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>เพิ่มสินค้าใหม่เข้าระบบ</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-space-md">
            {filteredProducts.map((prod) => {
              const isLowStock = prod.stock_qty <= (prod.min_stock || 5);
              const isOutOfStock = prod.stock_qty <= 0;

              return (
                <div
                  key={prod.id}
                  className={`group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_24px_rgba(65,44,221,0.08)] border border-surface-container-high transition-all flex flex-col justify-between ${
                    isOutOfStock ? 'opacity-60 grayscale' : ''
                  }`}
                >
                  {/* Image / Header Bar */}
                  <div className="relative h-32 w-full overflow-hidden bg-surface-container flex items-center justify-center">
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[36px]">inventory_2</span>
                        <span className="font-label-sm text-[10px] mt-1">{prod.category || 'สินค้า'}</span>
                      </div>
                    )}

                    {/* Barcode Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-inverse-surface/85 backdrop-blur-md rounded-full text-inverse-on-surface font-label-sm text-[11px] font-mono shadow-sm">
                      #{prod.barcode || prod.id}
                    </div>

                    {/* Stock Badge */}
                    <div
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shadow-sm ${
                        isOutOfStock
                          ? 'bg-error text-on-error'
                          : isLowStock
                          ? 'bg-error-container text-on-error-container animate-pulse'
                          : 'bg-primary-fixed text-on-primary-fixed'
                      }`}
                    >
                      {isOutOfStock ? 'หมดสต็อก' : `คงเหลือ ${prod.stock_qty}`}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex flex-col gap-2">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {prod.name}
                      </h3>
                      <p className="font-label-sm text-label-sm text-outline mt-0.5 line-clamp-1">
                        {prod.category || 'หมวดหมู่ทั่วไป'} • ทุน ฿{(prod.cost_price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-surface-container">
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">
                        ฿{Number(prod.sell_price).toFixed(2)}
                      </span>

                      <button
                        onClick={() => addToCart(prod)}
                        disabled={isOutOfStock}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all ${
                          isOutOfStock
                            ? 'bg-surface-container text-outline cursor-not-allowed'
                            : 'bg-primary hover:bg-primary-container text-on-primary shadow-[0_2px_8px_rgba(65,44,221,0.3)]'
                        }`}
                        type="button"
                        title={isOutOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT PERSISTENT CART & PAYMENT CONSOLE SIDEBAR */}
      <div className="w-full xl:w-[460px] shrink-0 xl:sticky xl:top-32">
        <div className="w-full bg-[#181824] text-inverse-on-surface rounded-2xl p-space-md shadow-[0_20px_50px_rgba(0,0,0,0.35)] relative overflow-hidden flex flex-col gap-space-md border border-white/10">
          {/* Ambient Backlight Accent */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-container/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Active Drawer Header */}
          <div className="flex items-center justify-between pb-space-xs border-b border-white/10 relative z-10">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-fixed">
                <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              </div>
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-white font-bold">
                    บิลปัจจุบัน ({totalItems} ชิ้น)
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-primary-container text-white font-label-sm text-[11px] font-semibold">
                    Active Cart
                  </span>
                </div>
                <span className="font-label-sm text-[11px] text-inverse-on-surface/60">
                  โต๊ะ: Takeaway • บันทึกอัตโนมัติ SQLite WAL
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-40 text-inverse-on-surface/80 hover:text-white font-label-sm text-[11px] transition-colors flex items-center gap-1"
                type="button"
                title="ล้างตะกร้าสินค้า"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                <span>ล้าง</span>
              </button>
            </div>
          </div>

          {/* Cart Item List (Scrollable) */}
          <div className="flex flex-col gap-space-xs max-h-[220px] overflow-y-auto pr-1 scrollbar-none relative z-10">
            {cart.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center text-inverse-on-surface/40">
                <span className="material-symbols-outlined text-[36px] mb-1">shopping_basket</span>
                <span className="font-body-sm text-[13px]">ตะกร้ายังว่างอยู่</span>
                <span className="font-label-sm text-[11px]">ยิงบาร์โค้ด หรือคลิกเลือกสินค้าเพื่อเริ่มคิดเงิน</span>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-surface-container/10 flex items-center justify-center font-headline-sm text-[11px] text-primary-fixed shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-headline-sm text-body-md text-white truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-label-sm text-[11px] text-inverse-on-surface/60">
                        ฿{item.unit_price.toFixed(2)} x {item.quantity} (FIFO ฿{(item.unit_cost || 0).toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-[#101018] rounded-full p-0.5 gap-1 border border-white/10">
                      <button
                        onClick={() => updateCartQty(item.product_id, -1)}
                        className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-label-sm font-label-sm transition-colors active:scale-95"
                        type="button"
                      >
                        -
                      </button>
                      <span className="font-label-md text-label-sm text-white px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.product_id, 1)}
                        className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-label-sm font-label-sm transition-colors active:scale-95"
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-headline-sm text-headline-sm text-white min-w-[55px] text-right font-mono">
                      ฿{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Console Inner Block */}
          <div className="bg-[#202030] rounded-xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex flex-col gap-space-sm relative z-10 border border-white/10">
            {/* Payment Mode Pill Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#12121b] rounded-full gap-1 border border-white/10">
              <button
                onClick={() => setPaymentMethod('CASH')}
                type="button"
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-primary-container text-white shadow-[0_2px_8px_rgba(91,76,245,0.4)] font-semibold'
                    : 'text-inverse-on-surface/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>เงินสด Cash</span>
              </button>

              <button
                onClick={() => setPaymentMethod('TRANSFER_QR')}
                type="button"
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                  paymentMethod === 'TRANSFER_QR'
                    ? 'bg-primary-container text-white shadow-[0_2px_8px_rgba(91,76,245,0.4)] font-semibold'
                    : 'text-inverse-on-surface/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>สแกน QR PromptPay</span>
              </button>
            </div>

            {/* Thai Tax Breakdown */}
            <div className="flex flex-col gap-1 p-2.5 bg-white/5 rounded-xl text-body-sm font-body-sm border border-white/5">
              <div className="flex items-center justify-between text-inverse-on-surface/75 text-[12px]">
                <span>ยอดรวมก่อนภาษี (Subtotal excl. VAT):</span>
                <span className="font-label-md text-inverse-on-surface font-mono">฿{preVatAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-inverse-on-surface/75 text-[12px]">
                <span className="flex items-center gap-1">
                  <span>ภาษีมูลค่าเพิ่ม VAT 7%:</span>
                  <span className="text-[10px] px-1 rounded bg-white/10 text-primary-fixed">ภ.พ.30</span>
                </span>
                <span className="font-label-md text-inverse-on-surface font-mono">฿{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-inverse-on-surface/50 text-[11px] pt-0.5">
                <span>ต้นทุนรวมสินค้า COGS (FIFO):</span>
                <span className="font-mono">฿{totalCogs.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-primary-fixed text-[11px]">
                <span>กำไรขั้นต้นออเดอร์นี้ (Order GP):</span>
                <span className="font-bold font-mono">
                  +฿{grossProfit.toFixed(2)} ({gpPercent}%)
                </span>
              </div>
            </div>

            {/* Net Payable Banner */}
            <div className="flex items-center justify-between px-1">
              <span className="font-headline-sm text-body-md text-inverse-on-surface font-semibold">
                รวมสุทธิ (Net Payable)
              </span>
              <span className="font-headline-xl text-[28px] text-white tracking-tight font-mono font-bold">
                ฿{totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Cash Input & Quick Tender Buttons (When Payment Method is CASH) */}
            {paymentMethod === 'CASH' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-[11px] text-inverse-on-surface/70 shrink-0">
                    รับเงินสดมา:
                  </span>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder={totalAmount.toFixed(2)}
                    className="w-full px-3 py-1.5 bg-[#12121b] border border-white/20 rounded-lg text-white font-mono text-sm font-bold focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-[11px] text-inverse-on-surface/60">
                    รับเงินด่วน (Quick Tender):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {getQuickTenderOptions().map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCashReceived(opt.toString())}
                        className="py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-label-md text-label-sm transition-all active:scale-95 border border-white/5"
                      >
                        {opt === totalAmount ? `พอดี ฿${opt.toFixed(0)}` : `฿${opt.toLocaleString('th-TH')}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Change Due Display */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#12121b] rounded-lg border border-white/10">
                  <span className="font-body-sm text-[12px] text-inverse-on-surface/70">
                    เงินทอน (Change Due):
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-fixed font-bold font-mono">
                    ฿{changeDue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Main Settlement Call-to-Action */}
            <button
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-full bg-primary-container hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-headline-sm text-headline-sm shadow-[0_6px_20px_rgba(91,76,245,0.45)] hover:shadow-[0_8px_24px_rgba(91,76,245,0.6)] active:scale-[0.99] transition-all flex items-center justify-center gap-space-sm mt-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
              <span>ชำระเงิน &amp; พิมพ์ใบเสร็จ</span>
              <kbd className="px-2 py-0.5 bg-white/20 text-white rounded text-label-sm font-label-sm">
                F10
              </kbd>
            </button>

            <div className="flex items-center justify-between text-label-sm text-[11px] text-inverse-on-surface/50 pt-0.5">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary-fixed">verified</span>
                <span>ABB อัตโนมัติ</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                <span>ตัดสต็อก FIFO ทันที</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
