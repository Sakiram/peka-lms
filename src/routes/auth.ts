import express, { Router } from 'express';
import { login, setPassword } from '../controllers/authController';

const router: Router = express.Router();

router.post('/login', login);
router.post('/set-password', setPassword);

export default router;