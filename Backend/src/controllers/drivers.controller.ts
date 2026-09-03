import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.user_id;
    const { is_available } = req.body;

    const driver = await prisma.driver.findUnique({
      where: { user_id: userId }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found for this user' });
    }

    const updatedDriver = await prisma.driver.update({
      where: { driver_id: driver.driver_id },
      data: { is_available }
    });

    res.status(200).json({ 
      message: `Availability updated to ${is_available}`,
      is_available: updatedDriver.is_available 
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLocation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.user_id;
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const driver = await prisma.driver.findUnique({
      where: { user_id: userId }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    const updatedDriver = await prisma.driver.update({
      where: { driver_id: driver.driver_id },
      data: { 
        current_latitude: latitude,
        current_longitude: longitude 
      }
    });

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.user_id;

    const driver = await prisma.driver.findUnique({
      where: { user_id: userId }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    // In a real app, you'd aggregate completed rides or payments for this driver
    const earnings = await prisma.ride.aggregate({
      where: {
        driver_id: driver.driver_id,
        status: 'COMPLETED'
      },
      _sum: {
        final_fare: true
      },
      _count: {
        ride_id: true
      }
    });

    res.status(200).json({
      total_earnings: earnings._sum.final_fare || 0,
      total_completed_rides: earnings._count.ride_id || 0,
      total_rides_all_time: driver.total_rides
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
