const express = require('express');
const ownerController = require('../controllers/ownerController');

const router = express.Router();

router
  .route('/')
  .get(ownerController.getAllOwners)
  .post(ownerController.createOwner);

router
  .route('/:id')
  .get(ownerController.getOwner)
  .patch(ownerController.updateOwner)
  .delete(ownerController.deleteOwner);

module.exports = router;
