const ParentModel = require('./models/ParentModel');

async function run() {
  try {
    const parents = await ParentModel.getAll();
    console.log("All Parents:", parents);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();
