import { Router } from 'express';
import { getPassengers, getDrivers, getAllRides, getSOSAlerts, getDashboardStats } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Need admin-specific auth/role checks in a real app, but for now we'll just check if they're authenticated
router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/passengers', getPassengers);
router.get('/drivers', getDrivers);
router.get('/rides', getAllRides);
router.get('/sos', getSOSAlerts);

export default router;
