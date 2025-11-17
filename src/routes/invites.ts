import express, { Router } from 'express';
import { createInvite, bulkInvite } from '../controllers/inviteController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import multer from 'multer';

const router: Router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

router.post('/', authenticate, authorize('ADMIN', 'HR'), createInvite);
router.post('/bulk', authenticate, authorize('ADMIN', 'HR'), upload.single('file'), bulkInvite);

export default router;