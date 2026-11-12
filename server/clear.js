const db = require('./db');

function clearDatabase() {
  const tables = ['order_items', 'orders', 'stock_logs', 'expenses', 'products'];
  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
  try {
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('order_items', 'orders', 'stock_logs', 'expenses', 'products')").run();
  } catch (e) {
    // sqlite_sequence might not exist yet if fresh
  }
  console.log('Database cleared completely (100% clean state).');
}

if (require.main === module) {
  clearDatabase();
  process.exit(0);
}

module.exports = { clearDatabase };
