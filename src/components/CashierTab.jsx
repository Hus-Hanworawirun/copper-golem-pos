import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  MinusCircle,
  PlusCircle,
  DollarSign,
  Receipt,
  History,
  Coins,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function CashierTab({
  products = [],
  cart = [],
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  cashReceived,
  setCashReceived,
  onCheckout,
  onOpenAddProduct,
  onViewLatestReceipt,
  onGoToReceipts,
  orderHistoryCount = 0
}) {
  const searchInputRef = useRef(null);

  // Compute Totals
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCogs = cart.reduce((sum, item) => sum + ((item.unit_cost || 0) * item.quantity), 0);
  const grossProfit = totalAmount - totalCogs;
  const gpPercent = totalAmount > 0 ? ((grossProfit / totalAmount) * 100).toFixed(1) : 0;

  // Thai VAT 7%
  const vatAmount = Number((totalAmount * 7 / 107).toFixed(2));
  const preVatAmount = Number((totalAmount - vatAmount).toFixed(2));

  // Change Calculation
  const receivedNum = parseFloat(cashReceived) || 0;
  const changeDue = receivedNum >= totalAmount ? Number((receivedNum - totalAmount).toFixed(2)) : 0;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
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

  const getQuickTenderOptions = () => {
    if (totalAmount <= 0) return [100, 500, 1000];
    const roundedExact = totalAmount;
    const next100 = Math.ceil(totalAmount / 100) * 100;
    const next500 = Math.ceil(totalAmount / 500) * 500;
    const next1000 = Math.ceil(totalAmount / 1000) * 1000;
    const set = new Set([roundedExact, next100, next500, next1000]);
    return Array.from(set).sort((a, b) => a - b).slice(0, 4);
  };

  return (
    <div className="flex-1 flex overflow-hidden font-['Prompt',sans-serif]">
      {/* LEFT: PRODUCTS BROWSER & SCANNER */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 border-r border-slate-200">
        {/* Top Search & Category Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="พิมพ์ชื่อสินค้า หรือยิงบาร์โค้ด... (กด F2)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 placeholder:text-slate-400 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewLatestReceipt}
              type="button"
              title="เปิดดูใบเสร็จของบิลล่าสุดทันที"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>บิลล่าสุด</span>
            </button>

            <button
              onClick={onGoToReceipts}
              type="button"
              title="เปิดดูประวัติใบเสร็จและบิลย้อนหลังทั้งหมด"
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>ค้นหาบิลย้อนหลัง ({orderHistoryCount})</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="w-full flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {cat === 'all' ? 'ทั้งหมด' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 py-12">
              <Package className="w-14 h-14 stroke-[1.5] mb-3 text-slate-300" />
              <p className="text-base font-bold text-slate-700">ไม่พบสินค้าในระบบ</p>
              <p className="text-xs text-slate-500 max-w-sm text-center mt-1 mb-4">
                เริ่มต้นเพิ่มสินค้าของคุณ หรือคลิกปุ่มด้านล่างเพื่อเพิ่มสินค้าใหม่
              </p>
              <button
                type="button"
                onClick={onOpenAddProduct}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มสินค้าใหม่</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock_qty <= 0;
                const isLowStock = p.stock_qty <= p.min_stock && !isOutOfStock;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`bg-white rounded-2xl border transition-all duration-150 flex flex-col overflow-hidden text-left relative group ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50'
                        : 'cursor-pointer hover:shadow-md hover:border-emerald-400 hover:-translate-y-0.5 border-slate-200 shadow-xs'
                    }`}
                  >
                    {/* Image / Icon container */}
                    <div className="h-32 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="text-slate-300 flex flex-col items-center gap-1">
                          <Package className="w-8 h-8" />
                          <span className="text-[10px]">ไม่มีรูป</span>
                        </div>
                      )}

                      {/* Stock Pill Badge (Top Right) */}
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                          isOutOfStock
                            ? 'bg-rose-500 text-white'
                            : isLowStock
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-900/80 text-white backdrop-blur-xs'
                        }`}
                      >
                        {isOutOfStock ? 'หมด' : `เหลือ ${p.stock_qty}`}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-mono text-slate-400 truncate">
                          {p.barcode || '#-'}
                        </p>
                        <h3 className="font-semibold text-xs text-slate-800 line-clamp-2 mt-0.5 leading-snug">
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-normal">ขาย</span>
                          <span className="text-sm font-bold text-emerald-600 ml-1 font-mono">
                            ฿{Number(p.sell_price).toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal font-mono">
                          ทุน ฿{(p.cost_price || 0).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: CART CONSOLE (Exact Old Clean White Style) */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 select-none">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-800 text-sm">รายการสินค้าในตะกร้า</h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              type="button"
              className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
            >
              ล้างตะกร้า
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 text-slate-200" />
              <p className="text-sm font-medium">ตะกร้าว่างเปล่า</p>
              <p className="text-xs text-slate-400 mt-1">คลิกสินค้าหรือยิงบาร์โค้ดเพื่อเพิ่มรายการ</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product_id}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3 transition-colors hover:border-slate-300"
              >
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-slate-800 truncate">{item.name}</h4>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-slate-500 font-mono">
                      ฿{item.unit_price.toFixed(2)} / ชิ้น
                    </span>
                    <span className="font-bold text-emerald-600 font-mono">
                      ฿{item.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                      <button
                        onClick={() => updateCartQty(item.product_id, -1)}
                        className="text-slate-500 hover:text-slate-800 p-0.5 transition-colors"
                        type="button"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.product_id, 1)}
                        className="text-slate-500 hover:text-slate-800 p-0.5 transition-colors"
                        type="button"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      type="button"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Checkout & Accounting Section */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3 shrink-0">
          {/* Price & Tax Breakdown */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>จำนวนชิ้น:</span>
              <span className="font-semibold text-slate-800 font-mono">{totalItems} ชิ้น</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>ก่อนภาษี (Pre-VAT):</span>
              <span className="font-mono">฿{preVatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>ภาษีขาย VAT 7% (ภ.พ.30):</span>
              <span className="font-mono">฿{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 font-medium pt-0.5 border-t border-slate-100">
              <span>กำไรขั้นต้น (Order GP):</span>
              <span className="font-mono">+฿{grossProfit.toFixed(2)} ({gpPercent}%)</span>
            </div>

            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
              <span className="font-bold text-slate-900 text-sm">ยอดสุทธิ:</span>
              <span className="text-emerald-600 text-2xl font-bold font-mono">
                ฿{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Cash Tender & Change Due Calculator */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium shrink-0">รับเงินมา:</span>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={totalAmount > 0 ? totalAmount.toFixed(2) : "0.00"}
                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {getQuickTenderOptions().map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCashReceived(opt.toString())}
                  className="py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-all font-mono border border-slate-200"
                >
                  {opt === totalAmount ? `พอดี` : `฿${opt.toLocaleString('th-TH')}`}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-600 font-medium">เงินทอน (Change Due):</span>
              <span className="font-bold text-emerald-600 font-mono text-base">
                ฿{changeDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Finalize Button (Exact Green Style with F10) */}
          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            type="button"
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              cart.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-600/20 active:scale-98'
                : 'bg-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>ชำระเงิน (฿{totalAmount.toFixed(2)})</span>
            <kbd className="px-1.5 py-0.5 bg-black/20 text-white rounded text-[10px] font-mono ml-1">
              F10
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
