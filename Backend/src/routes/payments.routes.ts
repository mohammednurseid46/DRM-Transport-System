import { Router } from 'express';
import { confirmPayment } from '../controllers/payments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/confirm', confirmPayment);

export default router;
