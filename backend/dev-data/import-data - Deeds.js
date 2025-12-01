const fs = require('fs');
const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({ path: '../config.env' });
const Deed = require('../models/deedModel');
const Owner = require('../models/ownerModel');


// 1) Connect to MongoDB
const DB = process.env.DB_URLCOMPASS;
mongoose
  .connect(DB)
  .then(() => console.log('Db connection successful'))
  .catch((err) => console.error(err));

// 2) Read JSON file
const deeds = JSON.parse(fs.readFileSync(`${__dirname}/sakks.json`, 'utf-8'));

const allDeeds = deeds.data.rows.map(deed => {
  
  if(typeof deed.ownerID === "string") {
    deed.ownerID = Number(deed.ownerID)
    console.log(deed)
  } else if(typeof deed.ownerMobile === "string") {
    deed.ownerMobile = Number(deed.ownerMobile)
    console.log(deed)
  }
  return deed
})


// console.log(allRows)
const importData = async () => {
  try {
    await Deed.create(allDeeds, { validateBeforeSave: false });
    console.log('Data successfully imported:', allDeeds.length);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

// Delete
const deleteData = async () => {
  try {
    await Deed.deleteMany();
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

console.log('عدد السجلات في الملف:', allDeeds.length);
