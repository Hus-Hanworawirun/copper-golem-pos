const db = require('./db');
const { clearDatabase } = require('./clear');

function seedDatabase() {
  clearDatabase();

  const insertProduct = db.prepare(`
    INSERT INTO products (barcode, name, category, image_url, pack_cost, pack_qty, cost_price, profit_margin, sell_price, stock_qty, min_stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertStockLog = db.prepare(`
    INSERT INTO stock_logs (product_id, change_qty, type, total_cost, unit_cost, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleProducts = [
    {
      barcode: '885012345601',
      name: 'อาหารแมวกระป๋อง ทูน่ามูส (80g)',
      category: 'อาหารสัตว์',
      image_url: '',
      pack_cost: 1200,
      pack_qty: 30,
      cost_price: 40,
      profit_margin: 5,
      sell_price: 45,
      stock_qty: 30,
      min_stock: 5
    },
    {
      barcode: '885012345602',
      name: 'ขนมแมวเลีย รสแซลมอน (แพ็ค 4 ซอง)',
      category: 'ขนมสัตว์เลี้ยง',
      image_url: '',
      pack_cost: 400,
      pack_qty: 10,
      cost_price: 40,
      profit_margin: 10,
      sell_price: 50,
      stock_qty: 25,
      min_stock: 5
    },
    {
      barcode: '885012345603',
      name: 'ทรายแมวภูเขาไฟ ไร้ฝุ่น 10L',
      category: 'ของใช้สัตว์เลี้ยง',
      image_url: '',
      pack_cost: 650,
      pack_qty: 5,
      cost_price: 130,
      profit_margin: 40,
      sell_price: 170,
      stock_qty: 15,
      min_stock: 3
    },
    {
      barcode: '885012345604',
      name: 'ปลอกคอแมวนิรภัย กระดิ่งทอง',
      category: 'อุปกรณ์สัตว์เลี้ยง',
      image_url: '',
      pack_cost: 300,
      pack_qty: 12,
      cost_price: 25,
      profit_margin: 20,
      sell_price: 45,
      stock_qty: 20,
      min_stock: 4
    },
    {
      barcode: '885012345605',
      name: 'แชมพูอาบน้ำสูตรอ่อนโยน 250ml',
      category: 'ของใช้สัตว์เลี้ยง',
      image_url: '',
      pack_cost: 800,
      pack_qty: 10,
      cost_price: 80,
      profit_margin: 39,
      sell_price: 119,
      stock_qty: 12,
      min_stock: 3
    }
  ];

  const insertTransaction = db.transaction(() => {
    for (const p of sampleProducts) {
      const res = insertProduct.run(
        p.barcode,
        p.name,
        p.category,
        p.image_url,
        p.pack_cost,
        p.pack_qty,
        p.cost_price,
        p.profit_margin,
        p.sell_price,
        p.stock_qty,
        p.min_stock
      );
      insertStockLog.run(
        res.lastInsertRowid,
        p.stock_qty,
        'INITIAL_STOCK',
        p.cost_price * p.stock_qty,
        p.cost_price,
        'สต็อกเริ่มต้นตัวอย่าง'
      );
    }
  });

  insertTransaction();
  console.log(`Seeded ${sampleProducts.length} realistic mockup products successfully.`);
}

if (require.main === module) {
  seedDatabase();
  process.exit(0);
}

module.exports = { seedDatabase };
