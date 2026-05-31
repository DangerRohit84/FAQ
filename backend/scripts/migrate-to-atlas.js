const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = 'mongodb://localhost:27017/faq-app';
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI) {
  console.error('MONGO_URI env var not set — run this via backend dir with .env loaded');
  process.exit(1);
}

async function migrate() {
  /* 1. read from local */
  const local = await mongoose.createConnection(LOCAL_URI).asPromise();
  const collections = await local.db.listCollections().toArray();
  const data = {};
  for (const c of collections) {
    const docs = await local.db.collection(c.name).find({}).toArray();
    data[c.name] = docs;
    console.log(`  ✓ ${c.name}: ${docs.length} docs`);
  }
  await local.close();

  /* 2. write to atlas */
  const atlas = await mongoose.createConnection(ATLAS_URI).asPromise();
  for (const [name, docs] of Object.entries(data)) {
    if (docs.length === 0) continue;
    await atlas.db.collection(name).deleteMany({});
    await atlas.db.collection(name).insertMany(docs);
    console.log(`  ✓ wrote ${docs.length} docs to ${name}`);
  }
  await atlas.close();

  console.log('\nMigration complete.');
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
