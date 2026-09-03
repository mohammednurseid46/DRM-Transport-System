import { Router } from 'express';
import { toggleAvailability, updateLocation, getEarnings } from '../controllers/drivers.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All driver routes require authentication
router.use(authenticate);

router.post('/availability', toggleAvailability);
router.post('/location', updateLocation);
router.get('/earnings', getEarnings);

export default router;
