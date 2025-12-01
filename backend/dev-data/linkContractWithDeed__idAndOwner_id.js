// importDeeds.js
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../config.env' });

const Deed = require('../models/deedModel');
const Owner = require('../models/ownerModel');
const Contract = require('../models/contractModel');

// ====================================
// 1) Connect to Database
// ====================================
const DB = process.env.DB_URLCOMPASS;

mongoose
  .connect(DB)
  .then(() => console.log('💚 MongoDB connected successfully'))
  .catch((err) => {
    console.log('❌ MongoDB Connection Error');
    console.log(err);
    process.exit();
  });

// ====================================
// 2) Utility functions
// ====================================

// Find doc with dynamic property
const findDoc = async (Model, prop, value) => {
  try {
    return await Model.findOne({ [prop]: value });
  } catch (err) {
    console.log('❌ findDoc error:', err);
    process.exit();
  }
};

// ====================================
// 3) Read JSON File
// ====================================
const rawFile = `${__dirname}/contracts.json`;

console.log('📄 Reading file:', rawFile);

const fileContent = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
const contractsData = fileContent.data.rows;

console.log('📦 records in file:', contractsData.length);

// ====================================
// 4) Process & Normalize Data
// ====================================
const allContracts = [];

const processContracts = async () => {
  console.log('🔧 Processing Deeds...');

  for (let contract of contractsData) {
    // ---- Clean numeric fields
   

    // ---- Find Deed by contract.deedNumber
    const existingDeed = await findDoc(Deed, 'deedNumber', Number(contract.deedNumber));

    if (existingDeed) {
      console.log(`✔ exit Deed: ${existingDeed.deedNumber}`);
      contract.deed = existingDeed._id;
      contract.deedNumber = undefined;
    } 

    allContracts.push(contract);
  }

  console.log('🔵all Data is ready now:', allContracts.length);
};

// ====================================
// 5) Import to Database
// ====================================
const importData = async () => {
  try {
    await processContracts();

    console.log('📝 Saving deeds to MongoDB...');
    await Contract.create(allContracts, { validateBeforeSave: false });

    console.log(`🎉 Success! Imported ${allContracts.length} contracts.`);
    process.exit();
  } catch (err) {
    console.log('❌ Error importing data:', err);
    process.exit();
  }
};

// ====================================
// 6) Delete Data
// ====================================
const deleteData = async () => {
  try {
    await Contract.deleteMany();

    console.log('🗑️ Data successfully deleted');
  } catch (err) {
    console.log('❌ Error deleting data:', err);
  }
  process.exit();
};

// ====================================
// 7) Command Line Options
// ====================================
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log(`
⚠️ use the following cli:
-----------------------------------
node importDeeds.js --import   (to import Data)
node importDeeds.js --delete   (to Delete Data)
  `);
  process.exit();
}
