const express = require('express');
const contractController = require('../controllers/contractController');
const paymentController = require('../controllers/paymentController');
const recordController = require('../controllers/recordController');

const router = express.Router();

//------------------------------
// Nested routes under contract
//------------------------------

// جميع المدفوعات لعقد معين
router
  .route('/:contractId/payments')
  .get(paymentController.getPaymentsByContract)
  .post(paymentController.createPaymentForContract);

// جميع السجلات لعقد معين
router
  .route('/:contractId/records')
  .get(recordController.getRecordsByContract)
  .post(recordController.createRecordForContract);

//------------------------------
// Main Contract CRUD
//------------------------------
router
  .route('/')
  .get(contractController.getAllContracts)
  .post(contractController.createContract);

router
  .route('/:id')
  .get(contractController.getContractDeep) // populate المتقدم
  .patch(contractController.updateContract)
  .delete(contractController.deleteContract);

module.exports = router;
