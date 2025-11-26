import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAllContracts, getContract, createContract, updateContract, deleteContract } from '../controllers/contractController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAllContracts)
  .post(createContract);

router.route('/:id')
  .get(getContract)
  .patch(updateContract)
  .delete(deleteContract);

export default router;
