const express = require("express");
const router = express.Router();
const gisController = require("../controllers/gisController");

// البحث بالمخططات فقط (Auto Suggest)
// router.get("/plans", gisController.searchPlans);

// البحث برقم القطعة + المخطط معاً
router.get("/parcel-plan", gisController.getParcelPlan);

// جلب GeoJSON حسب OBJECTID
// router.get("/geometry", gisController.getGeometry);

module.exports = router;
