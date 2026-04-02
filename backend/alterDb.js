const db = require('./db');
async function run() {
  try {
    await db.query('ALTER TABLE students ADD COLUMN parent_name VARCHAR(100)');
    console.log("Success");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists");
    } else {
      console.error(err);
    }
  } finally {
    process.exit();
  }
}
run();
