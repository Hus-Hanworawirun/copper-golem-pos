import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import {
  ShoppingBag,
  Boxes,
  BarChart3,
  Search,
  Plus,
  Trash2,
  Edit,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  Layers,
  Camera,
  Barcode as BarcodeIcon,
  RefreshCw,
  Receipt,
  X,
  PlusCircle,
  MinusCircle,
  Eye,
  Printer,
  Download,
  Tag,
  Copy,
  Sparkles,
  Calendar,
  History,
  FileText,
  Landmark,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
  CreditCard,
  Building2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'inventory', 'receipts', 'tax', 'accounting'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // POS State
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH', 'TRANSFER_QR'
  const [cashReceived, setCashReceived] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Inventory / Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    category: 'อาหารสัตว์',
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

  // Barcode Download & Print Modal State
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState(null);
  const [printCopies, setPrintCopies] = useState(30);
  const barcodeSvgRef = useRef(null);

  // Receipts Archive Tab State
  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptDateRange, setReceiptDateRange] = useState('all'); // 'all', 'today', '7days'

  // Accounting State
  const [accountingSummary, setAccountingSummary] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [reportTimeframe, setReportTimeframe] = useState('today'); // 'today', 'allTime'
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Thai Tax State
  const [taxSummary, setTaxSummary] = useState(null);
  const [taxCashFlow, setTaxCashFlow] = useState(null);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxPeriod, setTaxPeriod] = useState('all'); // 'all', 'h1' (Jan-Jun PND94), 'h2'
  const [expenses, setExpenses] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    category: 'ค่าเช่าสถานที่',
    title: '',
    amount: '',
    receipt_no: '',
    note: ''
  });

  // Scanner Audio feedback
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
      // AudioContext not allowed before user interaction
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Accounting & Orders
  const fetchAccountingData = async () => {
    try {
      const [sumRes, ordRes, logRes] = await Promise.all([
        fetch('/api/reports/summary'),
        fetch('/api/orders?limit=500'),
        fetch('/api/reports/stock-logs')
      ]);
      const sumData = await sumRes.json();
      const ordData = await ordRes.json();
      const logData = await logRes.json();
      setAccountingSummary(sumData);
      setOrderHistory(ordData);
      setStockLogs(logData);
    } catch (err) {
      console.error('Failed to load accounting data', err);
    }
  };

  // Fetch Thai Tax Data
  const fetchTaxData = async () => {
    try {
      const [sumRes, flowRes, expRes] = await Promise.all([
        fetch(`/api/tax/summary?year=${taxYear}`),
        fetch(`/api/tax/cash-flow?year=${taxYear}&period=${taxPeriod}`),
        fetch('/api/expenses')
      ]);
      const sumData = await sumRes.json();
      const flowData = await flowRes.json();
      const expData = await expRes.json();
      setTaxSummary(sumData);
      setTaxCashFlow(flowData);
      setExpenses(expData);
    } catch (err) {
      console.error('Failed to load tax data', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAccountingData();
    fetchTaxData();
  }, []);

  useEffect(() => {
    if (activeTab === 'tax') {
      fetchTaxData();
    }
  }, [taxYear, taxPeriod, activeTab]);

  // Render Barcode SVG when Barcode Modal opens
  useEffect(() => {
    if (isBarcodeModalOpen && barcodeModalProduct && barcodeSvgRef.current) {
      try {
        const code = barcodeModalProduct.barcode || `${barcodeModalProduct.id}`;
        JsBarcode(barcodeSvgRef.current, code, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 2.2,
          height: 52,
          displayValue: true,
          fontSize: 14,
          font: 'monospace',
          textMargin: 4,
          margin: 8
        });
      } catch (e) {
        console.error('JsBarcode render error:', e);
      }
    }
  }, [isBarcodeModalOpen, barcodeModalProduct]);

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
      alert(`สินค้า "${product.name}" สินค้าหมดสต็อก!`);
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
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
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
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout Handler
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;

    const received = paymentMethod === 'CASH'
      ? parseFloat(cashReceived) || cartTotalAmount
      : cartTotalAmount;

    if (paymentMethod === 'CASH' && received < cartTotalAmount) {
      alert('จำนวนเงินที่รับมาไม่พอชำระ');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          payment_method: paymentMethod,
          cash_received: received
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to checkout');
      }

      setCompletedOrder(data);
      clearCart();
      setIsCheckoutOpen(false);
      setCashReceived('');
      playBeep();
      fetchProducts();
      fetchAccountingData();
      fetchTaxData();
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  // Smart Cost & Price Calculation logic
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

  // Open Modal for Add
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      barcode: `885${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
      category: 'อาหารสัตว์',
      pack_cost: '',
      pack_qty: '',
      cost_price: '',
      profit_margin: '',
      sell_price: '',
      stock_qty: '',
      min_stock: '5'
    });
    setImageFile(null);
    setImagePreview('');
    setIsProductModalOpen(true);
  };

  // Open Modal for Edit
  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      barcode: prod.barcode,
      category: prod.category,
      pack_cost: prod.pack_cost ? prod.pack_cost.toString() : '',
      pack_qty: prod.pack_qty ? prod.pack_qty.toString() : '1',
      cost_price: prod.cost_price.toString(),
      profit_margin: prod.profit_margin.toString(),
      sell_price: prod.sell_price.toString(),
      stock_qty: prod.stock_qty.toString(),
      min_stock: prod.min_stock.toString()
    });
    setImageFile(null);
    setImagePreview(prod.image_url || '');
    setIsProductModalOpen(true);
  };

  // Open Barcode Download & Print Modal
  const openBarcodeModal = (product) => {
    setBarcodeModalProduct(product);
    setPrintCopies(product.stock_qty > 0 ? product.stock_qty : 1);
    setIsBarcodeModalOpen(true);
  };

  // Download Barcode as PNG Image Sticker
  const handleDownloadBarcodePng = () => {
    if (!barcodeModalProduct || !barcodeSvgRef.current) return;
    const svg = barcodeSvgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 320;
      canvas.height = 160;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px Prompt, sans-serif';
      ctx.textAlign = 'center';
      const cleanName = barcodeModalProduct.name.length > 25
        ? barcodeModalProduct.name.slice(0, 25) + '...'
        : barcodeModalProduct.name;
      ctx.fillText(cleanName, canvas.width / 2, 24);

      ctx.drawImage(img, (canvas.width - img.width) / 2, 32);

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 15px Prompt, sans-serif';
      ctx.fillText(`฿${barcodeModalProduct.sell_price.toFixed(2)}`, canvas.width / 2, canvas.height - 12);

      const a = document.createElement('a');
      a.download = `barcode_${barcodeModalProduct.barcode || barcodeModalProduct.id}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Print Barcode Label Sheet (Multiple Copies)
  const handlePrintBarcodeLabels = () => {
    if (!barcodeModalProduct || !barcodeSvgRef.current) return;
    const svgHtml = barcodeSvgRef.current.outerHTML;
    const copies = Math.max(1, parseInt(printCopies, 10) || 1);

    const printWin = window.open('', '_blank', 'width=900,height=700');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>พิมพ์สติกเกอร์บาร์โค้ด - ${barcodeModalProduct.name}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 8mm; }
            body { font-family: 'Prompt', -apple-system, sans-serif; margin: 0; padding: 0; background: #fff; color: #0f172a; }
            .grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
            .sticker {
              width: 175px; height: 105px; border: 1px dashed #cbd5e1; border-radius: 8px;
              padding: 6px; box-sizing: border-box; text-align: center; display: flex;
              flex-direction: column; justify-content: space-between; page-break-inside: avoid;
            }
            .title { font-size: 10.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #0f172a; }
            .barcode-box svg { width: 100% !important; height: 48px !important; }
            .price { font-size: 12px; font-weight: 800; color: #000; }
            @media print {
              .no-print { display: none; }
              .sticker { border: 1px dashed #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="padding: 10px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: bold;">สติกเกอร์บาร์โค้ด (${copies} ดวง)</span>
            <button onclick="window.print()" style="padding: 6px 16px; background: #16a34a; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">พิมพ์ทันที (Print)</button>
          </div>
          <div class="grid">
            ${Array.from({ length: copies })
              .map(
                () => `
              <div class="sticker">
                <div class="title">${barcodeModalProduct.name}</div>
                <div class="barcode-box">${svgHtml}</div>
                <div class="price">฿${barcodeModalProduct.sell_price.toFixed(2)}</div>
              </div>
            `
              )
              .join('')}
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name) {
      alert('กรุณาระบุชื่อสินค้า');
      return;
    }

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('barcode', productForm.barcode);
    formData.append('category', productForm.category);
    formData.append('pack_cost', productForm.pack_cost);
    formData.append('pack_qty', productForm.pack_qty);
    formData.append('cost_price', productForm.cost_price);
    formData.append('profit_margin', productForm.profit_margin);
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsProductModalOpen(false);
      fetchProducts();
      fetchAccountingData();
      fetchTaxData();

      if (!editingProduct) {
        openBarcodeModal(data);
      }
    } catch (err) {
      alert(`บันทึกสินค้าไม่สำเร็จ: ${err.message}`);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบสินค้า "${name}" หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
        fetchAccountingData();
        fetchTaxData();
      }
    } catch (err) {
      alert('ลบสินค้าไม่สำเร็จ');
    }
  };

  // Open Quick Restock Modal
  const openRestockModal = (prod) => {
    setRestockProduct(prod);
    setRestockForm({
      add_qty: '',
      batch_cost: '',
      update_cost_price: true,
      note: 'รับเข้าสต็อกล็อตใหม่'
    });
    setIsRestockModalOpen(true);
  };

  // Submit Restock
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockForm.add_qty || parseInt(restockForm.add_qty, 10) <= 0) {
      alert('กรุณาระบุจำนวนสินค้าที่รับเข้า');
      return;
    }

    try {
      const res = await fetch(`/api/products/${restockProduct.id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restockForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setIsRestockModalOpen(false);
        fetchProducts();
        fetchAccountingData();
        fetchTaxData();
        if (window.confirm(`เติมสินค้า ${restockForm.add_qty} ชิ้นสำเร็จ! ต้องการพิมพ์สติกเกอร์บาร์โค้ดจำนวน ${restockForm.add_qty} ดวงไปแปะสินค้าหรือไม่?`)) {
          setBarcodeModalProduct(updated);
          setPrintCopies(parseInt(restockForm.add_qty, 10));
          setIsBarcodeModalOpen(true);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'เกิดข้อผิดพลาดในการเติมสต็อก');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  // Submit Operational Expense
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) {
      alert('กรุณากรอกรายการและจำนวนเงิน');
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm)
      });
      if (res.ok) {
        setIsExpenseModalOpen(false);
        setExpenseForm({
          expense_date: new Date().toISOString().slice(0, 10),
          category: 'ค่าเช่าสถานที่',
          title: '',
          amount: '',
          receipt_no: '',
          note: ''
        });
        fetchTaxData();
      } else {
        alert('บันทึกค่าใช้จ่ายไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  // Delete Operational Expense
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

  // Export Revenue Department Cash Flow to Excel/CSV with Thai UTF-8 BOM
  const exportTaxCashFlowCsv = () => {
    if (!taxCashFlow?.rows) return;
    const headers = ['ลำดับ', 'วัน/เดือน/ปี', 'รายการ / คำอธิบาย', 'เลขที่เอกสารอ้างอิง', 'เงินสดรับ (บาท)', 'เงินสดจ่าย (บาท)', 'คงเหลือ (บาท)', 'หมายเหตุ'];
    const rows = taxCashFlow.rows.map(r => [
      r.id,
      r.date,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${r.ref_no}"`,
      r.cash_in.toFixed(2),
      r.cash_out.toFixed(2),
      r.balance.toFixed(2),
      `"${r.note || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานเงินสดรับจ่าย_สรรพากร_${taxYear}_${taxPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Products for POS & Inventory
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'ทั่วไป')))];

  // Filtered Orders for Receipts Archive Tab
  const filteredOrders = orderHistory.filter(ord => {
    const matchesSearch =
      !receiptSearch ||
      ord.order_no.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      ord.payment_method.toLowerCase().includes(receiptSearch.toLowerCase()) ||
      ord.items?.some(it => it.product_name.toLowerCase().includes(receiptSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (receiptDateRange === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      const ordDateStr = new Date(ord.created_at).toISOString().slice(0, 10);
      return todayStr === ordDateStr;
    }

    if (receiptDateRange === '7days') {
      const orderDate = new Date(ord.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }

    return true;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
            🤖
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">Copper Golem POS</h1>
            <p className="text-xs text-amber-400/80">ระบบแคชเชียร์ & คลังสต็อก</p>
          </div>
        </div>

        {/* Barcode listener indicator */}
        <div className="mx-4 my-3 px-3 py-2 bg-slate-800/80 rounded-lg flex items-center gap-2 border border-slate-700/60">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-slate-300 font-medium">พร้อมยิงบาร์โค้ด USB</span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1.5">
          {/* Tab 1: POS */}
          <button
            onClick={() => setActiveTab('pos')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>ขายหน้าร้าน (Cashier)</span>
            {cart.length > 0 && (
              <span className="ml-auto bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-xs">
                {cartTotalItems}
              </span>
            )}
          </button>

          {/* Tab 2: Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span>คลังสินค้า & ต้นทุน</span>
          </button>

          {/* Tab 3: Digital Receipts */}
          <button
            onClick={() => {
              setActiveTab('receipts');
              fetchAccountingData();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'receipts'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span>ประวัติใบเสร็จดิจิทัล</span>
            {orderHistory.length > 0 && (
              <span className="ml-auto bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full text-xs">
                {orderHistory.length}
              </span>
            )}
          </button>

          {/* Tab 4: Thai Tax & Revenue */}
          <button
            onClick={() => {
              setActiveTab('tax');
              fetchTaxData();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'tax'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Landmark className="w-5 h-5 text-amber-400" />
            <span>บัญชีภาษีสรรพากร</span>
            <span className="ml-auto bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
              ม.40(8)
            </span>
          </button>

          {/* Tab 5: Accounting & Reports */}
          <button
            onClick={() => {
              setActiveTab('accounting');
              fetchAccountingData();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'accounting'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>ภาพรวมกำไร-ขาดทุน</span>
          </button>
        </nav>

        {/* VAT Progress Indicator in Sidebar Footer */}
        {taxSummary && (
          <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>เกณฑ์ VAT 1.8M</span>
              </span>
              <span className="font-bold text-amber-400">{taxSummary.vat.progress_percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  taxSummary.vat.is_required ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, taxSummary.vat.progress_percentage)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 truncate">
              {taxSummary.vat.is_required
                ? 'เกินเกณฑ์ 1.8M ต้องจด VAT'
                : `ยอดขายปีนี้ ฿${taxSummary.total_revenue.toLocaleString()}`}
            </p>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-hidden">
        {/* ================= TAB 1: POS / CASHIER ================= */}
        {activeTab === 'pos' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 border-r border-slate-200">
              <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อสินค้า หรือยิงบาร์โค้ด..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (orderHistory.length > 0) {
                        setSelectedReceiptOrder(orderHistory[0]);
                      } else {
                        alert('ยังไม่มีประวัติการขายในระบบ');
                      }
                    }}
                    title="เปิดดูใบเสร็จของบิลล่าสุดทันที"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>บิลล่าสุด</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('receipts');
                      fetchAccountingData();
                    }}
                    title="เปิดดูประวัติใบเสร็จและบิลย้อนหลังทั้งหมด"
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
                  >
                    <History className="w-4 h-4 text-blue-600" />
                    <span>ค้นหาบิลย้อนหลัง ({orderHistory.length})</span>
                  </button>
                </div>

                <div className="w-full flex items-center gap-1.5 overflow-x-auto pt-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'ทั้งหมด' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Package className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                    <p className="text-sm">ไม่พบสินค้าในระบบ</p>
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
                              : 'cursor-pointer hover:shadow-md hover:border-emerald-400 hover:-translate-y-0.5 border-slate-200'
                          }`}
                        >
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

                            <span
                              className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                                isOutOfStock
                                  ? 'bg-rose-500 text-white'
                                  : isLowStock
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-900/80 text-white backdrop-blur-sm'
                              }`}
                            >
                              {isOutOfStock ? 'หมด' : `เหลือ ${p.stock_qty}`}
                            </span>
                          </div>

                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[11px] font-mono text-slate-400 truncate">{p.barcode}</p>
                              <h3 className="font-semibold text-xs text-slate-800 line-clamp-2 mt-0.5">
                                {p.name}
                              </h3>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-xs text-slate-400 font-normal">ขาย</span>
                                <span className="text-sm font-bold text-emerald-600 ml-1">฿{p.sell_price.toFixed(2)}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal">
                                ทุน ฿{p.cost_price.toFixed(0)}
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

            {/* Cart Panel */}
            <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-800 text-sm">รายการสินค้าในตะกร้า</h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                  >
                    ล้างตะกร้า
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                    <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 text-slate-200" />
                    <p className="text-sm">ตะกร้าว่างเปล่า</p>
                    <p className="text-xs text-slate-400 mt-1">คลิกสินค้าหรือยิงบาร์โค้ดเพื่อเพิ่มรายการ</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3"
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
                          <span className="text-slate-500">฿{item.unit_price.toFixed(2)} / ชิ้น</span>
                          <span className="font-bold text-emerald-600">฿{item.subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                            <button
                              onClick={() => updateCartQty(item.product_id, -1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.product_id, 1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>จำนวนชิ้น:</span>
                    <span className="font-semibold text-slate-800">{cartTotalItems} ชิ้น</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                    <span>ยอดสุทธิ:</span>
                    <span className="text-emerald-600 text-lg">฿{cartTotalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() => {
                    setCashReceived(cartTotalAmount.toString());
                    setIsCheckoutOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    cart.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-600/20'
                      : 'bg-slate-300 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>ชำระเงิน (฿{cartTotalAmount.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INVENTORY & STOCK ================= */}
        {activeTab === 'inventory' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-slate-800">จัดการคลังสินค้า & สต็อก</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  {products.length} รายการ
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาสินค้า / บาร์โค้ด..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={openAddProductModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ เพิ่มสินค้าใหม่ (คำนวณต้นทุน/กำไร)</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">รูปภาพ</th>
                      <th className="py-3 px-4">บาร์โค้ด</th>
                      <th className="py-3 px-4">ชื่อสินค้า / หมวดหมู่</th>
                      <th className="py-3 px-4 text-right">ต้นทุน/หน่วย</th>
                      <th className="py-3 px-4 text-right">กำไร/หน่วย</th>
                      <th className="py-3 px-4 text-right">ราคาขายปลีก</th>
                      <th className="py-3 px-4 text-center">สต็อกคงเหลือ</th>
                      <th className="py-3 px-4 text-right">มูลค่าสต็อก (ทุน)</th>
                      <th className="py-3 px-4 text-center">บาร์โค้ด & จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const isOutOfStock = p.stock_qty <= 0;
                      const isLowStock = p.stock_qty <= p.min_stock;
                      const itemTotalCostValue = p.stock_qty * p.cost_price;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                              {p.image_url ? (
                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                            {p.barcode}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 font-medium">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium text-slate-700">
                            ฿{p.cost_price.toFixed(2)}
                            {p.pack_cost > 0 && (
                              <div className="text-[10px] text-slate-400">
                                (ลัง {p.pack_qty} ชิ้น / ฿{p.pack_cost})
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium text-emerald-600">
                            +฿{p.profit_margin.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900 text-sm">
                            ฿{p.sell_price.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                isOutOfStock
                                  ? 'bg-rose-100 text-rose-700'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {p.stock_qty} ชิ้น
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium text-slate-700">
                            ฿{itemTotalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openBarcodeModal(p)}
                                title="ดาวน์โหลด / พิมพ์บาร์โค้ดติดสินค้า"
                                className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <BarcodeIcon className="w-3.5 h-3.5" />
                                <span>บาร์โค้ด</span>
                              </button>

                              <button
                                onClick={() => openRestockModal(p)}
                                title="เติมสต็อกสินค้า"
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>เติมของ</span>
                              </button>
                              <button
                                onClick={() => openEditProductModal(p)}
                                title="แก้ไข"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                title="ลบ"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DIGITAL RECEIPTS ================= */}
        {activeTab === 'receipts' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <span>คลังใบเสร็จดิจิทัล & ประวัติการขายทั้งหมด</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  บันทึกทุกบิลในคอมพิวเตอร์อย่างถาวร ({filteredOrders.length} / {orderHistory.length} บิล) สามารถค้นหาและสั่งพิมพ์ซ้ำได้ทุกบิล
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาเลขที่บิล (INV-...) หรือชื่อสินค้า..."
                    value={receiptSearch}
                    onChange={(e) => setReceiptSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {receiptSearch && (
                    <button
                      onClick={() => setReceiptSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setReceiptDateRange('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      receiptDateRange === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setReceiptDateRange('today')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      receiptDateRange === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    วันนี้
                  </button>
                  <button
                    onClick={() => setReceiptDateRange('7days')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      receiptDateRange === '7days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    7 วันล่าสุด
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <Receipt className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">ไม่พบบิลการขายตามเงื่อนไข</p>
                  <p className="text-xs text-slate-400 mt-1">
                    เมื่อคุณทำการขายหน้าร้าน ระบบจะบันทึกใบเสร็จเข้าคลังนี้ทันที
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">เลขที่บิล (Order No.)</th>
                        <th className="py-3 px-4">วัน-เวลา</th>
                        <th className="py-3 px-4">ช่องทางชำระเงิน</th>
                        <th className="py-3 px-4">รายการสินค้าในบิล</th>
                        <th className="py-3 px-4 text-center">รวมจำนวนชิ้น</th>
                        <th className="py-3 px-4 text-right">ยอดเงินรวม</th>
                        <th className="py-3 px-4 text-right">กำไรสุทธิ</th>
                        <th className="py-3 px-4 text-center">เปิดใบเสร็จ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {ord.order_no}
                          </td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(ord.created_at).toLocaleString('th-TH')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                ord.payment_method === 'CASH'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {ord.payment_method === 'CASH' ? 'เงินสด (Cash)' : 'สแกน QR ร้าน'}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate">
                            <span className="text-slate-800 font-medium">
                              {ord.items?.map(it => `${it.product_name} (${it.quantity})`).join(', ') || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-800">
                            {ord.items_count} ชิ้น
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                            ฿{ord.total_amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600">
                            +฿{ord.total_profit.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-emerald-200"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>ดูใบเสร็จ / พิมพ์</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: THAI TAX & REVENUE DEPARTMENT (ม.40(8)) ================= */}
        {activeTab === 'tax' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    บัญชีภาษีสรรพากรสำหรับค้าปลีก (เงินได้ ม.40(8))
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  จัดทำรายงานเงินสดรับ-จ่ายตามแบบกรมสรรพากร และคำนวณภาษีบุคคลธรรมดา (ภ.ง.ด. 90/94)
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Year Selector */}
                <select
                  value={taxYear}
                  onChange={(e) => setTaxYear(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-sm focus:outline-none"
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>ปีภาษี {y + 543} ({y})</option>
                  ))}
                </select>

                {/* Add Expense Button */}
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+ บันทึกค่าใช้จ่ายร้านค้า</span>
                </button>
              </div>
            </div>

            {/* VAT 1.8M Tracker Card */}
            {taxSummary && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        เพดานภาษีมูลค่าเพิ่ม (VAT 7% Threshold - 1,800,000 บาท/ปี)
                      </h3>
                      <p className="text-xs text-slate-500">
                        {taxSummary.vat.is_required
                          ? '⚠️ รายรับเกิน 1.8 ล้านบาทแล้ว มีหน้าที่ต้องจดทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20) ภายใน 30 วัน'
                          : `ยังไม่ต้องจด VAT (เหลือยอดขายอีก ฿${taxSummary.vat.remaining_limit.toLocaleString()} ก่อนถึงเกณฑ์ 1.8M)`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">ยอดขายสะสมปีนี้</span>
                    <p className="text-xl font-extrabold text-slate-900">
                      ฿{taxSummary.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        taxSummary.vat.is_required ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, taxSummary.vat.progress_percentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>0 บาท</span>
                    <span className="font-bold text-slate-700">{taxSummary.vat.progress_percentage}% ของเพดาน</span>
                    <span>1,800,000 บาท</span>
                  </div>
                </div>
              </div>
            )}

            {/* Thai Tax Comparison (ภ.ง.ด. 90/94: Actual vs Flat 60%) */}
            {taxSummary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span>เปรียบเทียบการยื่นภาษีเงินได้บุคคลธรรมดา (ภ.ง.ด. 90 / ภ.ง.ด. 94)</span>
                  </h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                    แนะนำ: หักค่าใช้จ่ายตามจริง (ประหยัดกว่า)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Method 1: Actual Deduction (Recommended) */}
                  <div className="bg-emerald-50/60 p-5 rounded-2xl border-2 border-emerald-500/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                        <span className="font-bold text-sm text-emerald-900">
                          วิธีที่ 1: หักค่าใช้จ่ายตามจริง (บันทึกบัญชี)
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          แนะนำ
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span>รายได้จากการขายรวม:</span>
                          <span className="font-semibold">฿{taxSummary.total_revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>หัก ต้นทุนสินค้าที่ขาย (COGS):</span>
                          <span>-฿{taxSummary.cogs_sold.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>หัก ค่าใช้จ่ายร้านค้าอื่นๆ:</span>
                          <span>-฿{taxSummary.operational_expenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>หัก ค่าลดหย่อนส่วนตัวพื้นฐาน:</span>
                          <span>-฿60,000.00</span>
                        </div>
                        <div className="pt-2 border-t border-emerald-200 flex justify-between font-bold text-slate-900">
                          <span>เงินได้สุทธิที่นำไปคิดภาษี:</span>
                          <span className="text-emerald-700">฿{taxSummary.actual_method.taxable_income.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-emerald-900">ประมาณการภาษีที่ต้องจ่าย:</span>
                      <span className="text-2xl font-black text-emerald-600">
                        ฿{taxSummary.actual_method.tax_payable.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Method 2: Flat 60% Deduction */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="font-bold text-sm text-slate-800">
                          วิธีที่ 2: หักค่าใช้จ่ายแบบเหมา 60%
                        </span>
                        <span className="text-slate-400 text-[10px]">ไม่ต้องมีใบเสร็จรายจ่าย</span>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span>รายได้จากการขายรวม:</span>
                          <span className="font-semibold">฿{taxSummary.total_revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>หักเหมา 60% (ตาม ม.40(8)):</span>
                          <span>-฿{taxSummary.flat_method.flat_deduction.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>หัก ค่าลดหย่อนส่วนตัวพื้นฐาน:</span>
                          <span>-฿60,000.00</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                          <span>เงินได้สุทธิที่นำไปคิดภาษี:</span>
                          <span>฿{taxSummary.flat_method.taxable_income.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-700">ประมาณการภาษีที่ต้องจ่าย:</span>
                      <span className="text-2xl font-black text-slate-700">
                        ฿{taxSummary.flat_method.tax_payable.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Official Cash Receipts and Payments Report (รายงานเงินสดรับ-จ่าย ตามแบบสรรพากร) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>รายงานเงินสดรับ-จ่าย (แบบสรรพากร)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ตามประกาศอธิบดีกรมสรรพากร สำหรับผู้มีเงินได้ตามมาตรา 40(8)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Period Filter for PND 94 vs PND 90 */}
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setTaxPeriod('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        taxPeriod === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      ทั้งปี (ภ.ง.ด. 90)
                    </button>
                    <button
                      onClick={() => setTaxPeriod('h1')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        taxPeriod === 'h1' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      ครึ่งปีแรก (ภ.ง.ด. 94)
                    </button>
                  </div>

                  {/* Export CSV / Excel */}
                  <button
                    onClick={exportTaxCashFlowCsv}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ส่งออก Excel/CSV</span>
                  </button>

                  {/* Print Table */}
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์รายงาน</span>
                  </button>
                </div>
              </div>

              {/* Table conforming strictly to Revenue Dept standard */}
              <div className="overflow-x-auto p-4 pt-0">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">วัน/เดือน/ปี</th>
                      <th className="py-2.5 px-3">รายการ / คำอธิบาย</th>
                      <th className="py-2.5 px-3">เลขที่เอกสารอ้างอิง</th>
                      <th className="py-2.5 px-3 text-right">เงินสดรับ (บาท)</th>
                      <th className="py-2.5 px-3 text-right">เงินสดจ่าย (บาท)</th>
                      <th className="py-2.5 px-3 text-right">คงเหลือ (บาท)</th>
                      <th className="py-2.5 px-3">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taxCashFlow?.rows?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          ยังไม่มีรายการเคลื่อนไหวเงินสดรับ-จ่ายในปีนี้
                        </td>
                      </tr>
                    ) : (
                      taxCashFlow?.rows?.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-700">
                            {row.date}
                          </td>
                          <td className="py-2 px-3 text-slate-900 font-medium">
                            {row.description}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                            {row.ref_no}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-600">
                            {row.cash_in > 0 ? `+฿${row.cash_in.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-rose-600">
                            {row.cash_out > 0 ? `-฿${row.cash_out.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            ฿{row.balance.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-slate-400 text-[11px]">
                            {row.note}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {taxCashFlow && (
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-right">ยอดรวมทั้งสิ้น:</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600">
                          ฿{taxCashFlow.total_in.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-600">
                          ฿{taxCashFlow.total_out.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-900">
                          ฿{taxCashFlow.net_cash.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Operational Expenses List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    รายการค่าใช้จ่ายดำเนินงานของร้าน ({expenses.length} รายการ)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ค่าใช้จ่ายที่นำมาเป็นหลักฐานหักภาษีตามจริงได้ (เก็บใบเสร็จไว้เป็นหลักฐาน)
                  </p>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มค่าใช้จ่าย</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">วันที่</th>
                      <th className="py-2.5 px-4">หมวดหมู่</th>
                      <th className="py-2.5 px-4">รายการ</th>
                      <th className="py-2.5 px-4">เลขที่ใบเสร็จ</th>
                      <th className="py-2.5 px-4 text-right">จำนวนเงิน</th>
                      <th className="py-2.5 px-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          ยังไม่มีการบันทึกค่าใช้จ่ายร้านค้า (เช่น ค่าเช่า, ค่าไฟ, ค่าแพ็คเกจ)
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4">{exp.expense_date}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-700">{exp.category}</td>
                          <td className="py-2.5 px-4 font-medium text-slate-900">{exp.title}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-400">{exp.receipt_no || '-'}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-rose-600">
                            ฿{exp.amount.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ACCOUNTING & REPORTS ================= */}
        {activeTab === 'accounting' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">สรุปรายงานบัญชี & กำไร-ขาดทุน</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  วิเคราะห์ผลประกอบการ กำไรขั้นต้น และมูลค่าสต็อกในระบบ
                </p>
              </div>

              <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setReportTimeframe('today')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportTimeframe === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  ยอดวันนี้ (Today)
                </button>
                <button
                  onClick={() => setReportTimeframe('allTime')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportTimeframe === 'allTime' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  ยอดสะสมทั้งหมด (All Time)
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            {accountingSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>ยอดขายรวม (Revenue)</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl font-bold text-slate-900">
                      ฿
                      {(reportTimeframe === 'today'
                        ? accountingSummary.today.today_revenue
                        : accountingSummary.allTime.total_revenue
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {reportTimeframe === 'today'
                        ? `${accountingSummary.today.today_orders} บิล (${accountingSummary.today.today_items_sold} ชิ้น)`
                        : `${accountingSummary.allTime.total_orders} บิล (${accountingSummary.allTime.total_items_sold} ชิ้น)`}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>ต้นทุนสินค้ารวม (Cost)</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl font-bold text-slate-900">
                      ฿
                      {(reportTimeframe === 'today'
                        ? accountingSummary.today.today_cost
                        : accountingSummary.allTime.total_cost
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">คำนวณจากต้นทุนสินค้าที่ขายจริง</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>กำไรสุทธิ (Gross Profit)</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl font-bold text-emerald-600">
                      +฿
                      {(reportTimeframe === 'today'
                        ? accountingSummary.today.today_profit
                        : accountingSummary.allTime.total_profit
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-emerald-700/80 font-medium mt-1">
                      {(() => {
                        const rev =
                          reportTimeframe === 'today'
                            ? accountingSummary.today.today_revenue
                            : accountingSummary.allTime.total_revenue;
                        const prof =
                          reportTimeframe === 'today'
                            ? accountingSummary.today.today_profit
                            : accountingSummary.allTime.total_profit;
                        return rev > 0 ? `Margin ${( (prof / rev) * 100 ).toFixed(1)}%` : '0% margin';
                      })()}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>มูลค่าสต็อกในคลัง (ทุน)</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <Boxes className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl font-bold text-purple-700">
                      ฿
                      {accountingSummary.inventory.total_inventory_cost_value.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      คงเหลือ {accountingSummary.inventory.total_stock_units} ชิ้น
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Profitable Products */}
            {accountingSummary?.topProducts?.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-3">5 อันดับสินค้าสร้างกำไรสูงสุด</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {accountingSummary.topProducts.map((tp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                        <span>#{idx + 1}</span>
                        <span>ขายแล้ว {tp.total_sold_qty} ชิ้น</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 mt-1 truncate">{tp.product_name}</h4>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-baseline">
                        <span className="text-slate-500 text-[11px]">กำไรรวม</span>
                        <span className="font-bold text-emerald-600">฿{tp.total_profit.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD OPERATIONAL EXPENSE ================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">บันทึกค่าใช้จ่ายร้านค้า (หักภาษี)</h3>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">วันที่จ่ายเงิน *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">หมวดหมู่ค่าใช้จ่าย</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ค่าเช่าสถานที่">ค่าเช่าสถานที่ / หน้าร้าน</option>
                  <option value="ค่าไฟ/ค่าน้ำ">ค่าน้ำ - ค่าไฟ</option>
                  <option value="ค่าบรรจุภัณฑ์/อุปกรณ์">ค่าถุงพลาสติก / กล่อง / บรรจุภัณฑ์</option>
                  <option value="ค่าขนส่ง">ค่าขนส่ง / ค่าเดินทางไปรับสินค้า</option>
                  <option value="ค่าจ้าง">ค่าจ้างแรงงาน</option>
                  <option value="อื่นๆ">ค่าใช้จ่ายอื่นๆ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">รายการค่าใช้จ่าย *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ค่าเช่าแผงประจำเดือน, ซื้อถุงใส่ของ 5 กิโล"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">จำนวนเงิน (บาท) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-rose-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">เลขที่ใบเสร็จ/บิล</label>
                  <input
                    type="text"
                    placeholder="เช่น RC-1234"
                    value={expenseForm.receipt_no}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receipt_no: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">หมายเหตุ</label>
                <input
                  type="text"
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                >
                  บันทึกค่าใช้จ่าย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BARCODE DOWNLOAD & PRINT ================= */}
      {isBarcodeModalOpen && barcodeModalProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BarcodeIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">ดาวน์โหลด & พิมพ์สติกเกอร์บาร์โค้ด</h3>
              </div>
              <button
                onClick={() => setIsBarcodeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {barcodeModalProduct.image_url ? (
                    <img src={barcodeModalProduct.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{barcodeModalProduct.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">รหัส: {barcodeModalProduct.barcode}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-inner text-center">
                <span className="text-[11px] font-bold text-slate-800 line-clamp-1 mb-1">
                  {barcodeModalProduct.name}
                </span>

                <div className="my-1 bg-white p-2">
                  <svg ref={barcodeSvgRef} id="barcode-svg" className="max-w-full"></svg>
                </div>

                <span className="text-sm font-extrabold text-emerald-600">
                  ฿{barcodeModalProduct.sell_price.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">ตัวอย่างหน้าตาสติกเกอร์สำหรับติดสินค้า</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>จำนวนดวงสติกเกอร์ที่ต้องการพิมพ์:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={printCopies}
                      onChange={(e) => setPrintCopies(e.target.value)}
                      className="w-16 px-2.5 py-1 text-center font-bold bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-slate-500 text-xs">ดวง</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {[1, 10, 30, barcodeModalProduct.stock_qty].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPrintCopies(num)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                        printCopies === num
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num === barcodeModalProduct.stock_qty ? `ตามสต็อก (${num})` : `${num} ดวง`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBarcodePng}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-300/80"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>โหลดรูป PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintBarcodeLabels}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์แผ่นสติกเกอร์</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingProduct ? 'แก้ไขสินค้า & สต็อก' : 'เพิ่มสินค้าใหม่ & คำนวณต้นทุน-กำไร'}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    ชื่อสินค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น อาหารแมวกระป๋อง ทูน่ามูส (80g)"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">รหัสบาร์โค้ด</label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateBarcode}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>สุ่มรหัสใหม่อัตโนมัติ</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="เช่น 885012345601"
                      value={productForm.barcode}
                      onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <BarcodeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">หมวดหมู่</label>
                  <input
                    type="text"
                    placeholder="เช่น อาหารสัตว์, ขนม, ของใช้"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">รูปภาพสินค้า</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
                      <Camera className="w-4 h-4" />
                      <span>เลือกไฟล์รูปภาพ...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">รองรับไฟล์ JPG, PNG, WebP ขนาดไม่เกิน 5MB</p>
                  </div>
                </div>
              </div>

              {/* Smart Cost & Pricing Engine */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wide">
                    เครื่องคิดเลขต้นทุน & กำไรอัจฉริยะ (Smart Pricing Engine)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 bg-white p-3 rounded-xl border border-emerald-100">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      1. ซื้อมายกแพ็ค/ยกลัง (บาท)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="เช่น 1200"
                      value={productForm.pack_cost}
                      onChange={(e) => handleCostCalculation('pack_cost', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 bg-white p-3 rounded-xl border border-emerald-100">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      2. จำนวนชิ้นในแพ็ค (กระป๋อง/ชิ้น)
                    </label>
                    <input
                      type="number"
                      placeholder="เช่น 30"
                      value={productForm.pack_qty}
                      onChange={(e) => handleCostCalculation('pack_qty', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 bg-white p-3 rounded-xl border border-emerald-100">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      3. ต้นทุนเฉลี่ยต่อชิ้น (บาท)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="40.00"
                      value={productForm.cost_price}
                      onChange={(e) => handleCostCalculation('cost_price', e.target.value)}
                      className="w-full px-3 py-1.5 bg-amber-50/60 border border-amber-200 rounded-lg text-sm font-bold text-amber-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 bg-white p-3 rounded-xl border border-emerald-100">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      4. ต้องการกำไรต่อชิ้น (บาท)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="เช่น 5.00"
                      value={productForm.profit_margin}
                      onChange={(e) => handleCostCalculation('profit_margin', e.target.value)}
                      className="w-full px-3 py-1.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      5. ราคาขายหน้าร้าน (Retail Price)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ต้นทุน ฿{parseFloat(productForm.cost_price || 0).toFixed(2)} + กำไร ฿
                      {parseFloat(productForm.profit_margin || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-emerald-600">฿</span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="45.00"
                      value={productForm.sell_price}
                      onChange={(e) => handleCostCalculation('sell_price', e.target.value)}
                      className="w-28 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-base font-extrabold text-emerald-800 text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">จำนวนสต็อกตั้งต้น</label>
                  <input
                    type="number"
                    placeholder="เช่น 30"
                    value={productForm.stock_qty}
                    onChange={(e) => setProductForm({ ...productForm, stock_qty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">แจ้งเตือนเมื่อสต็อกต่ำกว่า</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={productForm.min_stock}
                    onChange={(e) => setProductForm({ ...productForm, min_stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK RESTOCK ================= */}
      {isRestockModalOpen && restockProduct && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">รับสินค้าเข้าสต็อก (Restock)</h3>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {restockProduct.image_url ? (
                    <img src={restockProduct.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{restockProduct.name}</h4>
                  <p className="text-slate-500 text-[11px]">
                    สต็อกปัจจุบัน: <span className="font-bold text-slate-800">{restockProduct.stock_qty} ชิ้น</span> |
                    ทุนเดิม: ฿{restockProduct.cost_price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">จำนวนที่รับเข้า (ชิ้น) *</label>
                <input
                  type="number"
                  required
                  placeholder="เช่น 30"
                  value={restockForm.add_qty}
                  onChange={(e) => setRestockForm({ ...restockForm, add_qty: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">ราคารวมของล็อตนี้ (บาท)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="เช่น 1200 (หากเว้นไว้จะใช้ต้นทุนเดิม)"
                  value={restockForm.batch_cost}
                  onChange={(e) => setRestockForm({ ...restockForm, batch_cost: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {restockForm.batch_cost && restockForm.add_qty && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    = ต้นทุนล็อตนี้ตกชิ้นละ ฿
                    {(parseFloat(restockForm.batch_cost) / parseInt(restockForm.add_qty, 10)).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">หมายเหตุ</label>
                <input
                  type="text"
                  value={restockForm.note}
                  onChange={(e) => setRestockForm({ ...restockForm, note: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                >
                  ยืนยันเติมสต็อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHECKOUT & PAYMENT ================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">ชำระเงินค่าสินค้า</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">ยอดรวมที่ต้องชำระ</span>
                  <span className="text-xs text-slate-300 font-light">{cartTotalItems} รายการ</span>
                </div>
                <span className="text-3xl font-extrabold text-emerald-400">
                  ฿{cartTotalAmount.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>เงินสด (Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER_QR')}
                  className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'TRANSFER_QR'
                      ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BarcodeIcon className="w-4 h-4" />
                  <span>สแกน QR ร้านค้า</span>
                </button>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">รับเงินมา (บาท)</label>
                    <input
                      type="number"
                      step="any"
                      autoFocus
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder={cartTotalAmount.toFixed(2)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[cartTotalAmount, 50, 100, 500, 1000].map((amt) => {
                      if (amt < cartTotalAmount && amt !== cartTotalAmount) return null;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashReceived(amt.toString())}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                        >
                          {amt === cartTotalAmount ? 'พอดี' : `+฿${amt}`}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-600">เงินทอน:</span>
                    <span
                      className={`text-lg font-extrabold ${
                        (parseFloat(cashReceived) || 0) < cartTotalAmount ? 'text-rose-500' : 'text-emerald-600'
                      }`}
                    >
                      {(() => {
                        const rec = parseFloat(cashReceived) || 0;
                        const change = rec - cartTotalAmount;
                        return change < 0 ? 'เงินไม่พอ' : `฿${change.toFixed(2)}`;
                      })()}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'TRANSFER_QR' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center space-y-2">
                  <div className="text-2xl">📱</div>
                  <h4 className="font-bold text-xs text-purple-900">ให้ลูกค้าสแกน QR Code ประจำร้าน</h4>
                  <p className="text-[11px] text-purple-700">
                    ยอดเงิน: <span className="font-bold text-sm">฿{cartTotalAmount.toFixed(2)}</span>
                  </p>
                  <p className="text-[10px] text-purple-600">
                    (ใช้ป้าย QR Code ที่ร้านค้าตั้งไว้ เมื่อลูกค้าโอนสำเร็จให้กดยืนยัน)
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckoutSubmit}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ยืนยันการขาย & บันทึกบิล</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DIGITAL RECEIPT / COMPLETED ORDER ================= */}
      {(completedOrder || selectedReceiptOrder) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                ใบเสร็จรับเงินดิจิทัล (Digital Receipt)
              </span>
              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setSelectedReceiptOrder(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            {(() => {
              const ord = completedOrder || selectedReceiptOrder;
              return (
                <div className="p-6 space-y-4 font-mono text-xs text-slate-700">
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 font-sans">ร้านค้าสัตว์เลี้ยง & ค้าปลีก</h3>
                    <p className="text-[10px] text-slate-400 font-mono">เลขที่บิล: {ord.order_no}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(ord.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>

                  <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
                    {ord.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div>
                          <div className="font-sans font-medium text-slate-800">{it.product_name}</div>
                          <div className="text-slate-400 text-[10px]">
                            {it.quantity} x ฿{it.unit_price.toFixed(2)}
                          </div>
                        </div>
                        <span className="font-semibold text-slate-900">฿{it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span>ยอดสุทธิ</span>
                      <span>฿{ord.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>การชำระเงิน</span>
                      <span>{ord.payment_method === 'CASH' ? 'เงินสด (Cash)' : 'สแกน QR ร้าน'}</span>
                    </div>
                    {ord.payment_method === 'CASH' && (
                      <>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>รับเงินมา</span>
                          <span>฿{ord.cash_received?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>เงินทอน</span>
                          <span>฿{ord.change_amount?.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-center pt-2 text-[10px] text-slate-400 font-sans">
                    บันทึกข้อมูลและตัดสต็อกลงในคอมพิวเตอร์เรียบร้อยแล้ว
                  </div>

                  <div className="pt-2 flex gap-2 font-sans">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์/บันทึก PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        setCompletedOrder(null);
                        setSelectedReceiptOrder(null);
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
