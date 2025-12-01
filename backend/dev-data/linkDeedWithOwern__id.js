// importDeeds.js
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../config.env' });

const Deed = require('../models/deedModel');
const Owner = require('../models/ownerModel');

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
const rawFile = `${__dirname}/sakks.json`;

console.log('📄 Reading file:', rawFile);

const fileContent = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
const deedsData = fileContent.data.rows;

console.log('📦 records in file:', deedsData.length);

// ====================================
// 4) Process & Normalize Data
// ====================================
const allDeeds = [];

const processDeeds = async () => {
  console.log('🔧 Processing Deeds...');

  for (let deed of deedsData) {
    // ---- Clean numeric fields
    if (typeof deed.ownerID === 'string') deed.ownerID = Number(deed.ownerID);
    if (typeof deed.ownerMobile === 'string') deed.ownerMobile = Number(deed.ownerMobile);

    // ---- Find Owner by Name
    const existingOwner = await findDoc(Owner, 'ownerName', deed.ownerName);

    if (existingOwner) {
      console.log(`✔ exit owner: ${existingOwner.ownerName}`);
      deed.owner = existingOwner._id;
    } 

    allDeeds.push(deed);
  }

  console.log('🔵all Data is ready now:', allDeeds.length);
};

// ====================================
// 5) Import to Database
// ====================================
const importData = async () => {
  try {
    await processDeeds();

    console.log('📝 Saving deeds to MongoDB...');
    await Deed.create(allDeeds, { validateBeforeSave: false });

    console.log(`🎉 Success! Imported ${allDeeds.length} deeds.`);
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
    await Deed.deleteMany();
    await Owner.deleteMany(); // Optional — احذف الملاك لو تريد
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
