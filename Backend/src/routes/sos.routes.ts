import { Router } from 'express';
import { triggerAlert } from '../controllers/sos.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/trigger', triggerAlert);

export default router;
