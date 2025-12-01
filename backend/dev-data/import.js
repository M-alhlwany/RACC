const fs = require('fs');
const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config({ path: '../config.env' });
const Deed = require('../models/deedModel');

// 1) Connect to MongoDB
const DB = process.env.DB_URLCOMPASS;

mongoose
  .connect(DB)
  .then(() => console.log('✔️ Database connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Load source file
const sakks = JSON.parse(fs.readFileSync(`${__dirname}/sakks.json`, 'utf-8'));

// ------------------------------------------------------------
// CLEANERS
// ------------------------------------------------------------

// Clean area (مساحة)
function cleanArea(val) {
  if (!val) return 0;
  if (['بدون', '-', 'غير متوفر', ''].includes(val)) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

// Clean and convert date (يدعم هجري)
function cleanDate(val) {
  if (!val) return new Date('2000-01-01');

  // Valid ISO or Gregorian date
  if (!isNaN(Date.parse(val))) {
    return new Date(val);
  }

  // Hijri format DD/MM/YYYY
  const hijriMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (hijriMatch) {
    const [_, d, m, y] = hijriMatch;

    // Convert Hijri → Gregorian (accurate enough)
    const hijriToGregorian = (hy, hm, hd) => {
      const day = parseInt(hd);
      const month = parseInt(hm) - 1;
      const year = parseInt(hy);

      const jd =
        Math.floor((11 * year + 3) / 30) +
        354 * year +
        30 * month +
        Math.floor((month - 1) * 29.5) +
        day +
        1948440 -
        385;

      return new Date((jd - 2440588) * 86400000);
    };

    return hijriToGregorian(y, m, d);
  }

  // Anything else → default date
  return new Date('2000-01-01');
}

// ------------------------------------------------------------
// TRANSFORMER
// ------------------------------------------------------------
// No record is deleted; missing data is fixed safely.

function transformSakk(s) {
  return {
    deedNumber:
      s['الصك']?.toString().trim() ||
      `NO_ID_${Math.random().toString(36).slice(2)}`,
    deedDate: cleanDate(s['تاريخه']) || null,

    source: s['المصدر'] || '',
    area: cleanArea(s['المساحة']),

    ownerName: s['المالك']?.toString().trim() || 'غير معروف',

    pieceNumber: s['القطعة'] || '',
    planNumber: s['المخطط'] || '',
    district: s['الحي'] || '',
    municipality: s['البلدية'] || '',
    street: s['الشارع'] || '',

    propertyStatus: s['حالة_العقار'] || '',
    buildingType: s['نوع_البناء'] || '',
    buildingSystem: s['نظام_البناء'] || '',

    northBoundary: s['الحد الشمالي'] || '',
    eastBoundary: s['الحد الشرقي'] || '',
    southBoundary: s['الحد الجنوبي'] || '',
    westBoundary: s['الحد الغربي'] || '',

    districtCorrection: s['تصحيح الحي'] || '',
    contracts: [],
  };
}

// ------------------------------------------------------------
// IMPORT FUNCTION
// ------------------------------------------------------------

const importData = async () => {
  console.log(`📌 عدد السجلات الأصلية: ${sakks.length}`);

  const transformed = sakks.map((s, i) => transformSakk(s, i));

  try {
    await Deed.insertMany(transformed, { validateBeforeSave: false });
    console.log('✔️ تم إدخال جميع البيانات بدون استثناء');
  } catch (err) {
    console.error('❌ خطأ أثناء الإدخال:', err);
  }

  await mongoose.connection.close();
  process.exit();
};

// ------------------------------------------------------------
// DELETE FUNCTION
// ------------------------------------------------------------

const deleteData = async () => {
  try {
    await Deed.deleteMany();
    console.log('🗑️ تم حذف جميع السجلات');
  } catch (err) {
    console.log(err);
  }
  await mongoose.connection.close();
  process.exit();
};

// ------------------------------------------------------------
// RUN
// ------------------------------------------------------------

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
