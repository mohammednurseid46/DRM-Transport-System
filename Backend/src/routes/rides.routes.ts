import { Router } from 'express';
import { createRide, searchDrivers, updateRideStatus, addPassengerToSharedRide, getRide, getUserRides, getPendingRides } from '../controllers/rides.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createRide);
router.get('/user', getUserRides);
router.get('/pending', getPendingRides);
router.get('/drivers/search', searchDrivers);
router.get('/:id', getRide);
router.patch('/:id/status', updateRideStatus);
router.post('/:id/join', addPassengerToSharedRide);

export default router;
