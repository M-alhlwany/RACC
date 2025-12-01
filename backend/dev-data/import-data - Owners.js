const fs = require('fs');
const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({ path: '../config.env' });
const Owner = require('../models/ownerModel');

// 1) Connect to MongoDB
const DB = process.env.DB_URLCOMPASS;
mongoose
  .connect(DB)
  .then(() => console.log('Db connection successful'))
  .catch((err) => console.error(err));

// 2) Read JSON file
const owners = JSON.parse(fs.readFileSync(`${__dirname}/owners.json`, 'utf-8'));
const allRows = owners.data.rows.map(owner => {
  
  if(typeof owner.ownerID === "string") {
    owner.ownerID = Number(owner.ownerID)
    console.log(owner)
  }
  if(typeof owner.ownerMobile === "string") {
    owner.ownerMobile = Number(owner.ownerMobile)
    console.log(owner)
  }
  if(typeof owner.agentID === "string") {
    owner.agentID = Number(owner.agentID)
    console.log(owner)
  }
  return owner
})
// console.log(allRows)
const importData = async () => {
  try {
    await Owner.create(allRows, { validateBeforeSave: false });
    console.log('Data successfully imported:', allRows.length);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

// Delete
const deleteData = async () => {
  try {
    await Owner.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log('عدد السجلات في الملف:', allRows.length);
