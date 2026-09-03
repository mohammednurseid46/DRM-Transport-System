import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const triggerAlert = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.user_id;
    const { ride_id, latitude, longitude } = req.body;

    if (!ride_id || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Ride ID, latitude, and longitude are required' });
    }

    const alert = await prisma.sosAlert.create({
      data: {
        ride_id,
        triggered_by: userId,
        latitude,
        longitude,
        status: 'ACTIVE'
      }
    });

    // In a real application, this would trigger WebSockets, Push Notifications, 
    // or external API calls to emergency services / admin panels immediately.
    console.log(`EMERGENCY SOS TRIGGERED: Ride ${ride_id} by User ${userId} at [${latitude}, ${longitude}]`);

    res.status(201).json({ message: 'SOS Alert triggered successfully', alert });
  } catch (error) {
    console.error('SOS Alert error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
