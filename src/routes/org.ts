import express, { Router } from 'express';
import { createOrganization } from '../controllers/orgController';

const router: Router = express.Router();

router.post('/create', createOrganization);

export default router;