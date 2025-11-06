import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { uploadDoc } from '../services/storageService';
import {
  applyLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getMyLeaves,
  getRequestedLeaves,
  getLeaveBalance,
  getLeaveLogs,
  uploadLeaveProof,
} from '../controllers/leaveController';

const router = express.Router();

router.post('/', authenticate, applyLeave);
router.post('/upload-proof', authenticate, uploadDoc.single('attachment'), uploadLeaveProof);
router.get('/', authenticate, getMyLeaves);
router.get('/balance', authenticate, getLeaveBalance);
router.get('/logs/:id', authenticate, getLeaveLogs);
router.get('/requests', authenticate, getRequestedLeaves);
router.put('/:id/approve', authenticate, approveLeave);
router.put('/:id/reject', authenticate, rejectLeave);
router.put('/:id/cancel', authenticate, cancelLeave);

export default router;