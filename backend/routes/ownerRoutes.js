import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAllOwners, getOwner, createOwner, updateOwner, deleteOwner } from '../controllers/ownerController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAllOwners)
  .post(createOwner);

router.route('/:id')
  .get(getOwner)
  .patch(updateOwner)
  .delete(deleteOwner);

export default router;
