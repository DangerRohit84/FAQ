require('dotenv').config();
const mongoose = require('mongoose');

console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected Successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection Failed:");
    console.error(err);
    process.exit(1);
  });