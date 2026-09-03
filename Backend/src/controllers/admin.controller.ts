import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getPassengers = async (req: AuthRequest, res: Response) => {
  try {
    const passengers = await prisma.user.findMany({
      where: { role: 'PASSENGER' },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone_number: true,
        is_active: true,
        created_at: true,
        _count: {
          select: { passengers: true }
        }
      }
    });

    const formattedPassengers = passengers.map(p => ({
      id: p.user_id,
      name: p.full_name,
      email: p.email,
      phone: p.phone_number,
      status: p.is_active ? 'active' : 'suspended',
      registeredAt: p.created_at,
      totalRides: p._count.passengers,
      avgRating: 4.8, // Mocked for now
      totalSpent: p._count.passengers * 200 // Mocked for now
    }));

    res.status(200).json(formattedPassengers);
  } catch (error) {
    console.error('Error fetching passengers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: true,
        vehicle: true
      }
    });

    const formattedDrivers = drivers.map(d => ({
      id: d.driver_id,
      name: d.user.full_name,
      phone: d.user.phone_number,
      email: d.user.email,
      vehicleInfo: `${d.vehicle?.manufacturer || ''} ${d.vehicle?.model || ''} - ${d.vehicle?.plate_number || ''}`,
      status: d.is_verified ? (d.is_available ? 'online' : 'offline') : 'pending',
      rating: d.rating,
      totalRides: d.total_rides,
      earnings: d.total_rides * 150, // Mocked for now
      registeredAt: d.user.created_at
    }));

    res.status(200).json(formattedDrivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllRides = async (req: AuthRequest, res: Response) => {
  try {
    const rides = await prisma.ride.findMany({
      include: {
        driver: { include: { user: true } },
        passengers: { include: { passenger: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(rides);
  } catch (error) {
    console.error('Error fetching all rides:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSOSAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.sosAlert.findMany({
      include: {
        ride: { include: { driver: { include: { user: true } }, passengers: { include: { passenger: true } } } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const activeRidesCount = await prisma.ride.count({
      where: {
        status: {
          in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS']
        }
      }
    });

    const pendingRequestsCount = await prisma.ride.count({
      where: { status: 'PENDING' }
    });

    const onlineFleetCount = await prisma.driver.count({
      where: {
        is_verified: true,
        is_available: true
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedRidesToday = await prisma.ride.findMany({
      where: {
        status: 'COMPLETED',
        created_at: {
          gte: today
        }
      }
    });

    const todaysGross = completedRidesToday.reduce((sum, ride) => sum + (ride.final_fare || ride.base_fare || 0), 0);

    const activeSOSCount = await prisma.sosAlert.count({
      where: { status: 'ACTIVE' }
    });

    // We can also fetch the most recent active/completed rides for the feed
    const recentActiveRides = await prisma.ride.findMany({
      where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        driver: { include: { user: true } },
        passengers: { include: { passenger: true } }
      }
    });

    const recentCompletedRides = await prisma.ride.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    const recentSosAlerts = await prisma.sosAlert.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    res.status(200).json({
      stats: {
        activeRidesCount,
        pendingRequestsCount,
        onlineFleetCount,
        todaysGross,
        activeSOSCount
      },
      feed: {
        activeRides: recentActiveRides,
        completedRides: recentCompletedRides,
        sosAlerts: recentSosAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
