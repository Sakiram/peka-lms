import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import {
  applyLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
} from '../controllers/leaveController';

const router = express.Router();

router.post('/', authenticate, applyLeave);
router.put('/:id/approve', authenticate, approveLeave);
router.put('/:id/reject', authenticate, rejectLeave);
router.put('/:id/cancel', authenticate, cancelLeave);

export default router;