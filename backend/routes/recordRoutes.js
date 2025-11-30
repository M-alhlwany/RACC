const express = require('express');
const recordController = require('../controllers/recordController');

const router = express.Router();

router
  .route('/')
  .get(recordController.getAllRecords)
  .post(recordController.createRecord);

router
  .route('/:id')
  .get(recordController.getRecord)
  .patch(recordController.updateRecord)
  .delete(recordController.deleteRecord);

module.exports = router;
