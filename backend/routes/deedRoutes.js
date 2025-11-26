import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAllDeeds, getDeed, createDeed, updateDeed, deleteDeed } from '../controllers/deedController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAllDeeds)
  .post(createDeed);

router.route('/:id')
  .get(getDeed)
  .patch(updateDeed)
  .delete(deleteDeed);

export default router;
