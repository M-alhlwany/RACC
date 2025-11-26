import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAllPayments, getPayment, createPayment, updatePayment, deletePayment } from '../controllers/paymentController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAllPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPayment)
  .patch(updatePayment)
  .delete(deletePayment);

export default router;
