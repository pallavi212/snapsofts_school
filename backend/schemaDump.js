const db = require('./db');
const fs = require('fs');
async function run() {
  try {
    const [students] = await db.query('DESCRIBE students');
    const [users] = await db.query('DESCRIBE users');
    fs.writeFileSync('schema.json', JSON.stringify({ students, users }, null, 2));
  } catch (err) {
    fs.writeFileSync('schema.json', err.toString());
  } finally {
    process.exit();
  }
}
run();
