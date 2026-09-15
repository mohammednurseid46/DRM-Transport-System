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

export const getActiveDrivers = async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : null;

    const activeDrivers = await prisma.driver.findMany({
      where: {
        is_verified: true
      },
      select: {
        driver_id: true,
        is_available: true,
        current_latitude: true,
        current_longitude: true,
        rating: true,
        user: {
          select: {
            full_name: true
          }
        },
        vehicle: {
          select: {
            model: true
          }
        }
      }
    });

    let driversWithDistance = activeDrivers.map(driver => {
      let distance = null;
      let eta_minutes = null;

      if (lat !== null && lng !== null && driver.current_latitude !== null && driver.current_longitude !== null) {
        const R = 6371; // Radius of the earth in km
        const dLat = (driver.current_latitude - lat) * Math.PI / 180;
        const dLon = (driver.current_longitude - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(driver.current_latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        distance = R * c; // Distance in km
        eta_minutes = Math.max(1, Math.round((distance / 30) * 60)); // Assuming 30km/h average speed, min 1 min
      }

      return {
        ...driver,
        distance,
        eta_minutes
      };
    });

    if (lat !== null && lng !== null) {
      driversWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    console.log("Fetched active drivers count:", driversWithDistance.length);

    res.status(200).json({ drivers: driversWithDistance });
  } catch (error) {
    console.error('Get active drivers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
