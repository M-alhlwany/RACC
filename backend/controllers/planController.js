const fs = require('fs');
const path = require('path');
// const Plan = require('../models/planModel');

// Load GeoJSON data
let PLANS = [];

try {
  const filePath  = path.join(__dirname, '../dev-data/plansJed_08_12_2025.geojson');
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  PLANS = data.features;
  console.log("Loaded plan features:", PLANS.length);
} catch (err) {
  console.error("Failed to load GeoJSON", err);
}

// Search plans by plan number
exports.searchPlans = (req, res) => {
  const { p } = req.query; // رقم المخطط المدخل
  if (!p) return res.status(400).json({ error: "يرجى إدخال رقم المخطط p" });

  const results = PLANS.filter((f) =>
    f.properties.PLANNUMBER?.toString().includes(p.toString())
  );

  // تجميع القيم الفريدة فقط
  const planNamesArray = [...new Set(results.map(f => f.properties.PLANNUMBER))];

  console.log(`Found ${results.length} plans matching "${p}"`);

  res.json({
    success: "success",
    count: results.length,
    uniqueCount: planNamesArray.length,
    planNamesArray,
    plans: results,
  });
};





// Function to get all plans
exports.getAllPlans = (req, res) => {
  try {
    res.status(200).json({
        success: "success",
        count: PLANS.length,
        plans: PLANS,
    }
    );
  } catch (error) {
    console.error('خطأ في جلب المخططات:', error);
    res.status(500).json({ error: 'فشل جلب المخططات' });
  }
};

    