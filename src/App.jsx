import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import CashierTab from './components/CashierTab';
import InventoryTab from './components/InventoryTab';
import AnalyticsTab from './components/AnalyticsTab';
import ReceiptsTab from './components/ReceiptsTab';
import TaxTab from './components/TaxTab';
import ProductModal from './components/modals/ProductModal';
import RestockModal from './components/modals/RestockModal';
import BarcodeModal from './components/modals/BarcodeModal';
import ReceiptModal from './components/modals/ReceiptModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'inventory', 'accounting', 'receipts', 'tax'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // POS State
  const [cart, setCart] = useState([]);
  const [cashReceived, setCashReceived] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    category: 'ทั่วไป',
    pack_cost: '',
    pack_qty: '',
    cost_price: '',
    profit_margin: '',
    sell_price: '',
    stock_qty: '',
    min_stock: '5'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Quick Restock Modal
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockForm, setRestockForm] = useState({
    add_qty: '',
    batch_cost: '',
    update_cost_price: true,
    note: 'เติมสต็อกสินค้า'
  });

  // Barcode Modal
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState(null);
  const [printCopies, setPrintCopies] = useState(30);

  // Accounting & Orders State
  const [orderHistory, setOrderHistory] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [reportTimeframe, setReportTimeframe] = useState('today'); // 'today', 'week', 'month', 'all'
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Thai Tax State
  const [taxSummary, setTaxSummary] = useState(null);
  const [taxCashFlow, setTaxCashFlow] = useState(null);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxPeriod, setTaxPeriod] = useState('all'); // 'all', 'h1', 'h2'
  const [expenses, setExpenses] = useState([]);

  // Audio feedback for scanner
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // Ignore before user interaction
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Orders & Stock Logs
  const fetchAccountingData = async () => {
    try {
      const [ordersRes, logsRes] = await Promise.all([
        fetch('/api/orders?limit=500'),
        fetch('/api/reports/stock-logs')
      ]);
      const ordersData = await ordersRes.json();
      const logsData = await logsRes.json();

      setOrderHistory(ordersData);
      setStockLogs(logsData);
    } catch (err) {
      console.error('Fetch accounting error:', err);
    }
  };

  // Fetch Tax Compliance & Cash Flow
  const fetchTaxData = async () => {
    try {
      const [taxSumRes, taxFlowRes, expensesRes] = await Promise.all([
        fetch(`/api/tax/summary?year=${taxYear}`),
        fetch(`/api/tax/cash-flow?year=${taxYear}&period=${taxPeriod}`),
        fetch('/api/expenses')
      ]);
      const taxSumData = await taxSumRes.json();
      const taxFlowData = await taxFlowRes.json();
      const expData = await expensesRes.json();

      setTaxSummary(taxSumData);
      setTaxCashFlow(taxFlowData);
      setExpenses(expData);
    } catch (err) {
      console.error('Fetch tax error:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchAccountingData();
    fetchTaxData();
  }, []);

  // Reload tax when year or period changes
  useEffect(() => {
    fetchTaxData();
  }, [taxYear, taxPeriod]);

  // Seed sample demo data
  const handleLoadSeedData = async () => {
    try {
      const res = await fetch('/api/system/seed', { method: 'POST' });
      if (res.ok) {
        alert('โหลดข้อมูลตัวอย่างสำเร็จ!');
        fetchProducts();
        fetchAccountingData();
        fetchTaxData();
      } else {
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  // Clear all data
  const handleClearAllData = async () => {
    if (!window.confirm('คำเตือน: คุณต้องการล้างข้อมูลสินค้า ประวัติการขาย และบัญชีทั้งหมดในระบบหรือไม่?')) return;
    try {
      const res = await fetch('/api/system/clear', { method: 'POST' });
      if (res.ok) {
        alert('ล้างฐานข้อมูลเรียบร้อยแล้ว');
        setCart([]);
        fetchProducts();
        fetchAccountingData();
        fetchTaxData();
      }
    } catch (err) {
      alert('ไม่สามารถล้างข้อมูลได้');
    }
  };

  // Global Barcode Scanner Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const scannedCode = buffer.trim();
          handleScannedBarcode(scannedCode);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, cart]);

  const handleScannedBarcode = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      playBeep();
      addToCart(product);
    } else {
      alert(`ไม่พบสินค้าที่มีบาร์โค้ด: ${barcode}`);
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    if (product.stock_qty <= 0) {
      alert(`สินค้า "${product.name}" หมดสต็อก!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_qty) {
          alert(`สินค้ามีในสต็อกเพียง ${product.stock_qty} ชิ้น`);
          return prev;
        }
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: Number(((item.quantity + 1) * item.unit_price).toFixed(2)) }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          barcode: product.barcode,
          image_url: product.image_url,
          unit_price: product.sell_price,
          unit_cost: product.cost_price,
          stock_qty: product.stock_qty,
          quantity: 1,
          subtotal: product.sell_price
        }
      ];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock_qty) {
              alert(`สินค้ามีในสต็อกเพียง ${item.stock_qty} ชิ้น`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: Number((newQty * item.unit_price).toFixed(2))
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Checkout Handler (Price Calculation & Accounting Recording)
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;

    const received = cashReceived ? parseFloat(cashReceived) : cartTotalAmount;

    if (cashReceived && received < cartTotalAmount) {
      alert('จำนวนเงินที่รับมาไม่พอชำระ');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          payment_method: 'CASH',
          cash_received: received
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to checkout');
      }

      setCompletedOrder(data);
      clearCart();
      setCashReceived('');
      playBeep();
      fetchProducts();
      fetchAccountingData();
      fetchTaxData();
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  // Smart Cost & Pricing Calculation
  const handleCostCalculation = (field, value) => {
    const updated = { ...productForm, [field]: value };
    const packCost = parseFloat(field === 'pack_cost' ? value : updated.pack_cost) || 0;
    const packQty = Math.max(1, parseInt(field === 'pack_qty' ? value : updated.pack_qty, 10) || 1);
    let unitCost = parseFloat(field === 'cost_price' ? value : updated.cost_price) || 0;
    let profit = parseFloat(field === 'profit_margin' ? value : updated.profit_margin) || 0;
    let sellPrice = parseFloat(field === 'sell_price' ? value : updated.sell_price) || 0;

    if (field === 'pack_cost' || field === 'pack_qty') {
      if (packCost > 0) {
        unitCost = Number((packCost / packQty).toFixed(2));
        updated.cost_price = unitCost.toString();
        if (profit >= 0) {
          sellPrice = Number((unitCost + profit).toFixed(2));
          updated.sell_price = sellPrice.toString();
        }
      }
    } else if (field === 'cost_price') {
      if (profit >= 0) {
        sellPrice = Number((unitCost + profit).toFixed(2));
        updated.sell_price = sellPrice.toString();
      }
    } else if (field === 'profit_margin') {
      sellPrice = Number((unitCost + profit).toFixed(2));
      updated.sell_price = sellPrice.toString();
    } else if (field === 'sell_price') {
      profit = Number((sellPrice - unitCost).toFixed(2));
      updated.profit_margin = profit.toString();
    }

    setProductForm(updated);
  };

  // Auto Generate Barcode
  const handleAutoGenerateBarcode = () => {
    const randomCode = `885${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    setProductForm(prev => ({ ...prev, barcode: randomCode }));
  };

  // Open Modals
  const openAddProductModal = (prefill = {}) => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      barcode: `885${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
      category: 'ทั่วไป',
      pack_cost: prefill.pack_cost || '',
      pack_qty: prefill.pack_qty || '1',
      cost_price: prefill.cost_price || '',
      profit_margin: prefill.profit_margin || '',
      sell_price: prefill.sell_price || '',
      stock_qty: '10',
      min_stock: '5'
    });
    setImageFile(null);
    setImagePreview('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      barcode: prod.barcode || '',
      category: prod.category || 'ทั่วไป',
      pack_cost: '',
      pack_qty: '1',
      cost_price: prod.cost_price.toString(),
      profit_margin: (prod.sell_price - prod.cost_price).toFixed(2),
      sell_price: prod.sell_price.toString(),
      stock_qty: prod.stock_qty.toString(),
      min_stock: (prod.min_stock || 5).toString()
    });
    setImageFile(null);
    setImagePreview(prod.image_url || '');
    setIsProductModalOpen(true);
  };

  const openBarcodeModal = (product) => {
    setBarcodeModalProduct(product);
    setPrintCopies(product.stock_qty > 0 ? product.stock_qty : 30);
    setIsBarcodeModalOpen(true);
  };

  const openRestockModal = (product) => {
    setRestockProduct(product);
    setRestockForm({
      add_qty: '',
      batch_cost: product.cost_price.toString(),
      update_cost_price: true,
      note: 'เติมสต็อกสินค้า'
    });
    setIsRestockModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('barcode', productForm.barcode);
    formData.append('category', productForm.category);
    formData.append('cost_price', productForm.cost_price);
    formData.append('sell_price', productForm.sell_price);
    formData.append('stock_qty', productForm.stock_qty);
    formData.append('min_stock', productForm.min_stock);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save product');
      }

      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(`บันทึกสินค้าไม่สำเร็จ: ${err.message}`);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบสินค้า "${name}" หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      alert('ลบสินค้าไม่สำเร็จ');
    }
  };

  // Restock Submit
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProduct) return;

    try {
      const res = await fetch(`/api/products/${restockProduct.id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(restockForm.add_qty, 10),
          cost_price: restockForm.batch_cost ? parseFloat(restockForm.batch_cost) : undefined,
          update_cost_price: restockForm.update_cost_price,
          note: restockForm.note
        })
      });

      if (res.ok) {
        setIsRestockModalOpen(false);
        fetchProducts();
        fetchAccountingData();
        fetchTaxData();
      } else {
        const err = await res.json();
        alert(`เกิดข้อผิดพลาด: ${err.error}`);
      }
    } catch (err) {
      alert('ไม่สามารถเติมสต็อกได้');
    }
  };

  // Expense Handlers
  const handleSaveExpense = async (expenseData) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        fetchTaxData();
      }
    } catch (err) {
      alert('บันทึกค่าใช้จ่ายไม่สำเร็จ');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('ต้องการลบรายการค่าใช้จ่ายนี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTaxData();
      }
    } catch (err) {
      alert('ลบรายการไม่สำเร็จ');
    }
  };

  // Export Tax Por Sor 10 CSV
  const handleExportTaxCsv = () => {
    if (!taxCashFlow?.rows || taxCashFlow.rows.length === 0) {
      alert('ไม่มีข้อมูลเงินสดรับจ่ายเพื่อส่งออก');
      return;
    }
    const headers = ['ลำดับ', 'วัน/เดือน/ปี', 'รายการ / คำอธิบาย', 'เลขที่เอกสารอ้างอิง', 'เงินสดรับ (บาท)', 'เงินสดจ่าย (บาท)', 'คงเหลือ (บาท)', 'หมายเหตุ'];
    const rows = taxCashFlow.rows.map(r => [
      r.id,
      r.date,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${r.ref_no || ''}"`,
      (r.cash_in || 0).toFixed(2),
      (r.cash_out || 0).toFixed(2),
      (r.balance || 0).toFixed(2),
      `"${r.note || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานเงินสดรับจ่าย_สรรพากร_ปส10_${taxYear}_${taxPeriod}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Categories list
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'ทั่วไป')))];

  // Current year revenue for footer gauge
  const currentRevenue = taxSummary?.total_revenue || 0;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-on-surface antialiased font-['Plus_Jakarta_Sans','Prompt',sans-serif]">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadSeed={handleLoadSeedData}
        onClearData={handleClearAllData}
      />

      {/* 2. RIGHT MAIN CONTENT COLUMN */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* MAIN WORKSPACE (Flex-1 min-h-0 overflow-y-auto) */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-background flex flex-col">
        {activeTab === 'pos' && (
          <CashierTab
            products={products}
            cart={cart}
            addToCart={addToCart}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            onCheckout={handleCheckoutSubmit}
            onOpenAddProduct={() => openAddProductModal()}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            onOpenAddProduct={openAddProductModal}
            onOpenEditProduct={openEditProductModal}
            onDeleteProduct={handleDeleteProduct}
            onOpenRestock={openRestockModal}
            onOpenBarcode={openBarcodeModal}
          />
        )}

        {activeTab === 'accounting' && (
          <AnalyticsTab
            orderHistory={orderHistory}
            stockLogs={stockLogs}
            products={products}
            reportTimeframe={reportTimeframe}
            setReportTimeframe={setReportTimeframe}
            onViewReceipt={(ord) => setSelectedReceiptOrder(ord)}
          />
        )}

        {activeTab === 'receipts' && (
          <ReceiptsTab
            orderHistory={orderHistory}
            onPrintThermal={(ord) => setSelectedReceiptOrder(ord)}
          />
        )}

        {activeTab === 'tax' && (
          <TaxTab
            taxSummary={taxSummary}
            taxCashFlow={taxCashFlow}
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxPeriod={taxPeriod}
            setTaxPeriod={setTaxPeriod}
            expenses={expenses}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            onExportCsv={handleExportTaxCsv}
          />
        )}
      </main>

      {/* 4. BOTTOM TELEMETRY FOOTER (Fixed height, shrink-0) */}
      <Footer currentRevenue={currentRevenue} />
    </div>

      {/* 5. MODALS */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        onSaveProduct={handleSaveProduct}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        setImageFile={setImageFile}
        onAutoGenerateBarcode={handleAutoGenerateBarcode}
        onCostCalculation={handleCostCalculation}
        existingCategories={categories}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        product={restockProduct}
        restockForm={restockForm}
        setRestockForm={setRestockForm}
        onSubmitRestock={handleRestockSubmit}
      />

      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        product={barcodeModalProduct}
        printCopies={printCopies}
        setPrintCopies={setPrintCopies}
      />

      <ReceiptModal
        order={completedOrder || selectedReceiptOrder}
        onClose={() => {
          setCompletedOrder(null);
          setSelectedReceiptOrder(null);
        }}
      />
    </div>
  );
}
