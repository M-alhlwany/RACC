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
const sakks = JSON.parse(fs.readFileSync(`${__dirname}/sakks.json`, 'utf-8'));

// تنظيف قيمة المساحة → إذا غير صالح = 0
function cleanArea(val) {
  if (!val) return 0;
  if (val === 'بدون' || val === '-' || val === 'غير متوفر') return 0;

  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

// تنظيف التاريخ → تخزينه كنص كما هو، وإذا غير صالح → ""
function cleanDate(val) {
  if (!val || val === '-' || val === 'بدون') return '';

  // إذا نص ISO فقط نخزنه كما هو
  if (!isNaN(Date.parse(val))) return val;

  // إذا بصيغة يوم/شهر/سنة → نخزنه كما هو بدون تحويل
  const hijriMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (hijriMatch) return val;

  // أي شيء آخر → نص فارغ
  return '';
}

// 3) Transform function (Arabic keys → model keys)
function transformSakk(s) {
  const deedNumber = s['الصك']?.toString().trim() || '';
  const ownerName = s['المالك']?.toString().trim() || '';

  if (!deedNumber || !ownerName) return null;

  return {
    deedNumber,
    deedDate: cleanDate(s['تاريخه']), // ← الآن نص فقط

    source: s['المصدر'] || '',
    area: cleanArea(s['المساحة']),

    ownerName,
    pieceNumber: s['القطعة'] || '',
    planNumber: s['المخطط'] || '',
    district: s['الحي'] || '',
    municipality: s['البلدية'] || '',
    street: s['الشارع'] || '',

    propertyStatus: s['حالة_العقار'] || '',
    buildingType: s['نوع_البناء'] || '',
    buildingSystem: s['نظام_البناء'] || '',
    floorsCount: '',

    northBoundary: s['الحد الشمالي'] || '',
    eastBoundary: s['الحد الشرقي'] || '',
    southBoundary: s['الحد الجنوبي'] || '',
    westBoundary: s['الحد الغربي'] || '',

    districtCorrection: s['تصحيح الحي'] || '',
    contracts: [],
  };
}

// 4) Import into MongoDB
const importData = async () => {
  try {
    const transformed = sakks.map(transformSakk);

    // إزالة null فقط
    const cleanedData = transformed.filter((d) => d !== null);

    await Deed.insertMany(cleanedData);
    console.log('Data successfully imported:', cleanedData.length);
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

console.log('عدد السجلات في الملف:', sakks.length);
