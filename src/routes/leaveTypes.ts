// src/routes/leaveTypes.ts
import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import {
  createLeaveType,
  getAllLeaveTypes,
  editLeaveType,
  deleteLeaveType,
} from '../controllers/leaveTypeContoller';

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'HR'), createLeaveType);
router.get('/', authenticate, getAllLeaveTypes);
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), editLeaveType);
router.delete('/:id', authenticate, authorize('ADMIN', 'HR'), deleteLeaveType);

export default router;