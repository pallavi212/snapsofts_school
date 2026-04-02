const db = require('./db');
const fs = require('fs');
async function run() {
  try {
    const [rows] = await db.query('SELECT id, email, role, password from users');
    fs.writeFileSync('out.json', JSON.stringify(rows, null, 2));
  } catch (err) {
    fs.writeFileSync('out.json', err.toString());
  } finally {
    process.exit();
  }
}
run();
