import { Router } from 'express';
import { toggleAvailability, updateLocation, getEarnings, getActiveDrivers, addPayoutMethod } from '../controllers/drivers.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/active', getActiveDrivers);

// All other driver routes require authentication
router.use(authenticate);

router.post('/availability', toggleAvailability);
router.post('/location', updateLocation);
router.get('/earnings', getEarnings);
router.post('/payout-methods', addPayoutMethod);

export default router;
