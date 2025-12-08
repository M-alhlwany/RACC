const express = require("express");
const planController = require("../controllers/planController");
const router = express.Router();
router.get("/", planController.getAllPlans);
router.get("/search", planController.searchPlans);
module.exports = router;