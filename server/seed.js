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
      name: 'กาแฟอาราบิกาคั่วบด 250g',
      category: 'เครื่องดื่ม',
      image_url: '',
      pack_cost: 960,
      pack_qty: 6,
      cost_price: 160,
      profit_margin: 60,
      sell_price: 220,
      stock_qty: 18,
      min_stock: 5
    },
    {
      barcode: '885012345602',
      name: 'มันฝรั่งทอดกรอบ รสเกลือ (แพ็ค 6 ซอง)',
      category: 'ขนม/ของทานเล่น',
      image_url: '',
      pack_cost: 360,
      pack_qty: 12,
      cost_price: 30,
      profit_margin: 15,
      sell_price: 45,
      stock_qty: 24,
      min_stock: 6
    },
    {
      barcode: '885012345603',
      name: 'กระดาษถ่ายเอกสาร A4 80g (รีม)',
      category: 'เครื่องเขียน/สำนักงาน',
      image_url: '',
      pack_cost: 550,
      pack_qty: 5,
      cost_price: 110,
      profit_margin: 35,
      sell_price: 145,
      stock_qty: 15,
      min_stock: 4
    },
    {
      barcode: '885012345604',
      name: 'น้ำยาทำความสะอาดอเนกประสงค์ 500ml',
      category: 'ของใช้ในบ้าน',
      image_url: '',
      pack_cost: 480,
      pack_qty: 8,
      cost_price: 60,
      profit_margin: 29,
      sell_price: 89,
      stock_qty: 20,
      min_stock: 5
    },
    {
      barcode: '885012345605',
      name: 'อาหารแมวกระป๋อง ทูน่ามูส (80g)',
      category: 'สินค้าสัตว์เลี้ยง',
      image_url: '',
      pack_cost: 1200,
      pack_qty: 30,
      cost_price: 40,
      profit_margin: 5,
      sell_price: 45,
      stock_qty: 30,
      min_stock: 5
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
