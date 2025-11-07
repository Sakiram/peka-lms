import express, { Router } from 'express';
import { login, logout, setPassword } from '../controllers/authController';

const router: Router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/set-password/:token', setPassword);

export default router;