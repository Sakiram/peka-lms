import express, { Router } from 'express';
import { createUser, updateUserProfile, getAllUsers , deleteUser, uploadUserProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { uploadImage } from '../services/storageService';

const router: Router = express.Router();

router.post('/', authenticate, authorize('ADMIN'), createUser);
router.get('/', authenticate, authorize('ADMIN', 'HR'), getAllUsers);
router.post('/upload-pic', authenticate, uploadImage.single('profile_pic'), uploadUserProfile);
router.put('/profile/:id', authenticate, updateUserProfile);
router.delete('/:id', authenticate, authorize('ADMIN', 'HR'), deleteUser);

export default router;