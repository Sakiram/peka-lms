import express, { Router } from 'express';
import { createInvite } from '../controllers/inviteController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router: Router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'HR'), createInvite);

export default router;