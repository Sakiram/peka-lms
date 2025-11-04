import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import {
  createHoliday,
  getAllHolidays,
  editHoliday,
  deleteHoliday,
} from '../controllers/holidayController';

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'HR'), createHoliday);
router.get('/', authenticate, getAllHolidays);
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), editHoliday);
router.delete('/:id', authenticate, authorize('ADMIN', 'HR'), deleteHoliday);

export default router;