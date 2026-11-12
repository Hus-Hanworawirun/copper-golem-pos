const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function getStorageDir() {
  if (process.env.APPDATA) {
    const appDataPath = path.join(process.env.APPDATA, 'CopperGolemPOS', 'data');
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }
    return appDataPath;
  }
  const localDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  return localDir;
}

const dataDir = getStorageDir();
const dbPath = path.join(dataDir, 'pos.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance & concurrent reads
db.pragma('journal_mode = WAL');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'ทั่วไป',
    image_url TEXT,
    pack_cost REAL DEFAULT 0,
    pack_qty INTEGER DEFAULT 1,
    cost_price REAL NOT NULL DEFAULT 0,
    profit_margin REAL NOT NULL DEFAULT 0,
    sell_price REAL NOT NULL DEFAULT 0,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stock_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    change_qty INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'PURCHASE_IN', 'SALE_OUT', 'ADJUSTMENT'
    total_cost REAL DEFAULT 0,
    unit_cost REAL DEFAULT 0,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE NOT NULL,
    total_amount REAL NOT NULL,
    total_cost REAL NOT NULL,
    total_profit REAL NOT NULL,
    payment_method TEXT NOT NULL, -- 'CASH', 'TRANSFER_QR'
    cash_received REAL DEFAULT 0,
    change_amount REAL DEFAULT 0,
    items_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    unit_cost REAL NOT NULL,
    unit_price REAL NOT NULL,
    unit_profit REAL NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    subtotal_cost REAL NOT NULL,
    subtotal_profit REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_date DATE DEFAULT (DATE('now', 'localtime')),
    category TEXT NOT NULL, -- 'ค่าเช่าสถานที่', 'ค่าไฟ/ค่าน้ำ', 'ค่าบรรจุภัณฑ์/อุปกรณ์', 'ค่าขนส่ง', 'ค่าจ้าง', 'อื่นๆ'
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    receipt_no TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
