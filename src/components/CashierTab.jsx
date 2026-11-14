import React, { useRef, useEffect } from 'react';
import {
  ScanLine,
  PlusCircle,
  Package,
  Plus,
  Minus,
  Trash2,
  Printer,
  Receipt,
  Calculator,
  CheckCircle2,
  Lock,
  Search,
  ShoppingBag,
  Coins
} from 'lucide-react';

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

  // Thai VAT 7% calculation
  const vatAmount = Number((totalAmount * 7 / 107).toFixed(2));
  const preVatAmount = Number((totalAmount - vatAmount).toFixed(2));

  // Change Calculation
  const receivedNum = parseFloat(cashReceived) || 0;
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
    <div className="h-full w-full flex flex-col xl:flex-row gap-4 p-4 min-h-0 overflow-hidden">
      {/* LEFT: CATALOG SECTION */}
      <div className="flex-1 min-w-0 h-full flex flex-col gap-3 min-h-0">
        {/* Header & Search Bar */}
        <div className="shrink-0 bg-surface p-3.5 rounded-2xl border border-surface-container-high shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                FAST-SCAN REGISTER ENGINE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="text-[11px] text-on-surface-variant">USB Barcode HID Direct</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h1 className="text-lg font-bold text-on-surface">ขายหน้าร้าน (Register POS)</h1>
              <span className="text-xs text-on-surface-variant hidden md:inline">
                ระบบยิงบาร์โค้ด USB Focus-Free และคิดเงินอัตโนมัติ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input with F2 */}
            <div className="relative flex items-center min-w-[260px] sm:min-w-[300px]">
              <ScanLine className="w-4 h-4 text-primary absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ยิงบาร์โค้ด / ค้นหาชื่อสินค้า (กด F2)..."
                type="text"
                className="w-full pl-9 pr-12 py-2 bg-surface-container-lowest text-on-surface text-xs rounded-full border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary shadow-xs font-sans"
              />
              <kbd className="absolute right-2.5 px-1.5 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-mono font-bold rounded-md border border-surface-container-high">
                F2
              </kbd>
            </div>

            <button
              onClick={onOpenAddProduct}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold rounded-full border border-surface-container-high shadow-xs transition-colors shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>เพิ่มสินค้าด่วน</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="shrink-0 bg-surface px-3 py-2 rounded-2xl border border-surface-container-high shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container-high'
                  }`}
                >
                  {cat === 'all' ? 'ทั้งหมด' : cat} ({count})
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-outline shrink-0">
            แสดง {filteredProducts.length} รายการ
          </span>
        </div>

        {/* Product Cards Grid (Scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 bg-surface-container-lowest rounded-2xl border border-surface-container-high flex flex-col items-center justify-center p-6 text-center">
              <Package className="w-10 h-10 text-outline mb-2" />
              <h3 className="font-bold text-sm text-on-surface mb-1">ไม่พบสินค้าในระบบ</h3>
              <p className="text-xs text-on-surface-variant mb-3">
                ค้นหาด้วยคำอื่น หรือกดปุ่มด้านล่างเพื่อเพิ่มสินค้า
              </p>
              <button
                onClick={onOpenAddProduct}
                type="button"
                className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มสินค้าใหม่</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map((prod) => {
                const isLowStock = prod.stock_qty <= (prod.min_stock || 5);
                const isOutOfStock = prod.stock_qty <= 0;

                return (
                  <div
                    key={prod.id}
                    className={`group bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container-high shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                      isOutOfStock ? 'opacity-60 grayscale' : ''
                    }`}
                  >
                    {/* Image Area */}
                    <div className="relative h-28 w-full bg-surface-container flex items-center justify-center overflow-hidden">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-outline">
                          <Package className="w-8 h-8 text-outline/60" />
                          <span className="text-[10px] mt-1 font-sans">{prod.category || 'สินค้า'}</span>
                        </div>
                      )}

                      {/* Barcode Badge */}
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-inverse-surface/85 backdrop-blur-xs rounded-full text-white text-[10px] font-mono shadow-xs">
                        #{prod.barcode || prod.id}
                      </div>

                      {/* Stock Badge */}
                      <div
                        className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          isOutOfStock
                            ? 'bg-rose-500 text-white'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        {isOutOfStock ? 'หมด' : `คงเหลือ ${prod.stock_qty}`}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                      <div>
                        <h3 className="font-bold text-xs text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-1 font-sans">
                          {prod.category || 'ทั่วไป'} • ทุน ฿{(prod.cost_price || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                        <span className="font-bold text-sm text-primary font-mono">
                          ฿{Number(prod.sell_price).toFixed(2)}
                        </span>

                        <button
                          onClick={() => addToCart(prod)}
                          disabled={isOutOfStock}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs active:scale-95 transition-all ${
                            isOutOfStock
                              ? 'bg-surface-container text-outline cursor-not-allowed'
                              : 'bg-primary hover:bg-primary-container text-white shadow-primary/20'
                          }`}
                          type="button"
                          title={isOutOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: MIDNIGHT SLATE CART CONSOLE (Fixed Height, No Overflow Cutoff) */}
      <div className="w-full xl:w-[420px] 2xl:w-[460px] shrink-0 h-full flex flex-col bg-[#181824] rounded-2xl p-3.5 text-inverse-on-surface shadow-2xl border border-white/10 overflow-hidden relative">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary-container/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Drawer Header */}
        <div className="shrink-0 flex items-center justify-between pb-2.5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary-fixed flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white">
                  บิลปัจจุบัน ({totalItems} ชิ้น)
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-white text-[10px] font-bold">
                  Active Cart
                </span>
              </div>
              <span className="text-[10px] text-inverse-on-surface/60 block">
                Takeaway • บันทึกอัตโนมัติ SQLite WAL
              </span>
            </div>
          </div>

          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="px-2 py-1 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-30 text-inverse-on-surface/80 hover:text-white text-[11px] transition-colors flex items-center gap-1 border border-white/5"
            type="button"
          >
            <Trash2 className="w-3 h-3" />
            <span>ล้าง</span>
          </button>
        </div>

        {/* Cart Item List (Flex-1 scrollable) */}
        <div className="flex-1 min-h-[90px] overflow-y-auto py-2 pr-1 space-y-1.5 scrollbar-none relative z-10">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-inverse-on-surface/40 py-6">
              <ShoppingBag className="w-8 h-8 mb-1.5 opacity-50" />
              <span className="text-xs font-medium">ตะกร้ายังว่างอยู่</span>
              <span className="text-[10px]">ยิงบาร์โค้ด หรือคลิกเลือกสินค้าเพื่อเริ่มคิดเงิน</span>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <div className="w-6 h-6 rounded-md bg-white/10 text-primary-fixed flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-white truncate text-[11px]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-inverse-on-surface/60 font-mono">
                      ฿{item.unit_price.toFixed(2)} x {item.quantity} (FIFO ฿{(item.unit_cost || 0).toFixed(2)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-[#101018] rounded-full p-0.5 border border-white/10">
                    <button
                      onClick={() => updateCartQty(item.product_id, -1)}
                      className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-[10px] transition-colors"
                      type="button"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-bold text-white px-1.5 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.product_id, 1)}
                      className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-[10px] transition-colors"
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-white font-mono min-w-[50px] text-right text-[11px]">
                    ฿{item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Price Calculation & Accounting Summary Box (Anchored at Bottom) */}
        <div className="shrink-0 bg-[#202030] rounded-xl p-3 shadow-lg border border-white/10 flex flex-col gap-2.5 relative z-10">
          {/* Header & Accounting Info */}
          <div className="flex items-center justify-between text-xs pb-1 border-b border-white/10">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-primary-fixed" />
              <span>คำนวณราคาสินค้า &amp; บัญชีต้นทุน</span>
            </span>
            <span className="text-[10px] text-inverse-on-surface/60 font-mono">
              {totalItems} ชิ้นในตะกร้า
            </span>
          </div>

          {/* Cost & Tax Breakdown */}
          <div className="flex flex-col gap-1 p-2 bg-white/5 rounded-lg text-[11px] border border-white/5 font-sans">
            <div className="flex justify-between text-inverse-on-surface/70">
              <span>ยอดรวมก่อนภาษี (Pre-VAT):</span>
              <span className="font-mono text-white">฿{preVatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-inverse-on-surface/70">
              <span>ภาษีขาย VAT 7% (ภ.พ.30):</span>
              <span className="font-mono text-white">฿{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-inverse-on-surface/70">
              <span>ต้นทุนสินค้ารวม (FIFO Cost):</span>
              <span className="font-mono text-white/90">฿{totalCogs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-primary-fixed font-bold pt-1 border-t border-white/10">
              <span>กำไรขั้นต้นบัญชี (Order GP):</span>
              <span className="font-mono">+฿{grossProfit.toFixed(2)} ({gpPercent}%)</span>
            </div>
          </div>

          {/* Net Total Banner */}
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className="text-xs font-bold text-inverse-on-surface">
              ยอดรวมสุทธิ (Net Total)
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
              ฿{totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Change Due Calculator */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-inverse-on-surface/70 shrink-0">รับเงินมา:</span>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={totalAmount > 0 ? totalAmount.toFixed(2) : "0.00"}
                className="w-full px-2.5 py-1 bg-[#12121b] border border-white/20 rounded-md text-white font-mono text-xs font-bold focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {getQuickTenderOptions().map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCashReceived(opt.toString())}
                  className="py-1 rounded bg-white/5 hover:bg-white/15 text-white text-[10px] font-semibold transition-all active:scale-95 border border-white/5 font-mono"
                >
                  {opt === totalAmount ? `พอดี ฿${opt.toFixed(0)}` : `฿${opt.toLocaleString('th-TH')}`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-2.5 py-1 bg-[#12121b] rounded-md border border-white/10 text-xs">
              <span className="text-[11px] text-inverse-on-surface/70">เงินทอน (Change Due):</span>
              <span className="font-bold text-primary-fixed font-mono text-sm">
                ฿{changeDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* F10 Finalize Button */}
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            type="button"
            className="w-full py-2.5 rounded-full bg-primary-container hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-0.5"
          >
            <Receipt className="w-4 h-4" />
            <span>คิดเงิน &amp; บันทึกบัญชี</span>
            <kbd className="px-1.5 py-0.5 bg-white/20 text-white rounded text-[10px] font-mono">
              F10
            </kbd>
          </button>

          {/* Security & Ledger Badges */}
          <div className="flex items-center justify-between text-[10px] text-inverse-on-surface/50 pt-0.5 px-1">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-primary-fixed" />
              <span>ลงบัญชีรายได้ทันที</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>ตัดสต็อก FIFO อัตโนมัติ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
