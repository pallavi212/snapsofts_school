const db = require('./db');
const fs = require('fs');
async function run() {
  try {
    const [parents] = await db.query('DESCRIBE parents');
    fs.writeFileSync('parents_schema.json', JSON.stringify(parents, null, 2));
  } catch (err) {
    fs.writeFileSync('parents_schema.json', err.toString());
  } finally {
    process.exit();
  }
}
run();
