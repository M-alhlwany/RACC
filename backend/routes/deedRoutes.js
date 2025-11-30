const express = require('express');
const deedController = require('../controllers/deedController');
const factory = require('../utils/apiFeatuers')

const router = express.Router();

router
  .route('/')
  .get(deedController.getAllDeeds)
  .post(deedController.createDeed);

router
  .route('/:id')
  .get(deedController.getDeed)
  .patch(deedController.updateDeed)
  .delete(deedController.deleteDeed);

router.route('/deedNumber/:deedNumber').get(deedController.getDeedByDeedNumber);
module.exports = router;
