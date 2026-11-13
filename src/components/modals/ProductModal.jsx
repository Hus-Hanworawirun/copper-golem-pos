import React, { useState } from 'react';

export default function ProductModal({
  isOpen,
  onClose,
  editingProduct,
  productForm,
  setProductForm,
  onSaveProduct,
  imagePreview,
  setImagePreview,
  setImageFile,
  onAutoGenerateBarcode,
  onCostCalculation,
  existingCategories = []
}) {
  if (!isOpen) return null;

  const defaultCategories = ['กาแฟ Specialty', 'เครื่องดื่มคราฟต์', 'ขนม & เบเกอรี่', 'เมล็ดกาแฟถุง', 'อาหารและทานเล่น', 'ทั่วไป'];
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories.filter(c => c !== 'all')]));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-3xl max-w-2xl w-full border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">package_2</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {editingProduct ? 'แก้ไขสินค้า & สต็อก' : 'เพิ่มสินค้าใหม่ & กำหนดต้นทุน-กำไร'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-on-surface">
                ชื่อสินค้า <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ดริปคอปเปอร์ สเปเชียลตี้ (Ethiopia Yirgacheffe)"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">หมวดหมู่สินค้า</label>
              <input
                type="text"
                list="category-suggestions"
                placeholder="เลือกหรือพิมพ์หมวดหมู่ใหม่"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
              <datalist id="category-suggestions">
                {allCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Barcode */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface">บาร์โค้ด (Code 128 / EAN-13)</label>
                <button
                  type="button"
                  onClick={onAutoGenerateBarcode}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">autorenew</span>
                  <span>สร้างอัตโนมัติ</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="เช่น 885901234567"
                value={productForm.barcode}
                onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Smart Pricing Box */}
            <div className="md:col-span-2 p-4 bg-surface-container-low rounded-2xl border border-surface-container-high space-y-3">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calculate</span>
                <span>ระบบคำนวณต้นทุนต่อหน่วย &amp; ราคาขายเป้าหมาย (Smart Pricing)</span>
              </span>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                    ราคายกแพ็ค/ลัง (฿)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={productForm.pack_cost}
                    onChange={(e) => onCostCalculation('pack_cost', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                    จำนวนต่อแพ็ค
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={productForm.pack_qty}
                    onChange={(e) => onCostCalculation('pack_qty', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                    ต้นทุน/หน่วย (฿) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={productForm.cost_price}
                    onChange={(e) => onCostCalculation('cost_price', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-sm font-mono font-bold text-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                    กำไรที่ต้องการ/ชิ้น (฿)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={productForm.profit_margin}
                    onChange={(e) => onCostCalculation('profit_margin', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-sm font-mono font-bold"
                  />
                </div>
              </div>

              {/* Recommended Selling Price Field */}
              <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-on-surface block">
                    ราคาขายหน้าร้าน (Sell Price) <span className="text-error">*</span>
                  </label>
                  <span className="text-[11px] text-on-surface-variant">ราคานี้รวมภาษีเพื่อยิงขายหน้าร้าน</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-headline-sm font-bold text-primary">฿</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={productForm.sell_price}
                    onChange={(e) => onCostCalculation('sell_price', e.target.value)}
                    className="w-32 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-primary text-base font-bold font-mono text-primary text-right focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>
            </div>

            {/* Initial Stock & Reorder Point */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">
                จำนวนสต็อกเริ่มต้น (ชิ้น) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="0"
                value={productForm.stock_qty}
                onChange={(e) => setProductForm({ ...productForm, stock_qty: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">จุดเตือนสต็อกต่ำ (ROP)</label>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={productForm.min_stock}
                onChange={(e) => setProductForm({ ...productForm, min_stock: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Product Image */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-on-surface">รูปภาพสินค้า</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container border border-surface-container-high overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-outline">photo_camera</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-xs text-on-surface-variant file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-on-surface hover:file:bg-surface-container-high cursor-pointer"
                  />
                  <span className="text-[11px] text-on-surface-variant block mt-1">
                    รองรับไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5MB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-surface-container-high flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-primary-container hover:bg-primary text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {editingProduct ? 'บันทึกการแก้ไข' : 'บันทึกสินค้าเข้าระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
