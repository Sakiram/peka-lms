import express, { Router } from 'express';
import { addUser } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router: Router = express.Router();

router.post('/', authenticate, authorize('ADMIN'), addUser);

export default router;