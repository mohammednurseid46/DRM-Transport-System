import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { calculateFare, splitFare } from '../utils/fareCalculator.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const createRide = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.user_id;
    const { 
      pickup_lat, pickup_lng, pickup_landmark, 
      dropoff_lat, dropoff_lng, dropoff_landmark,
      ride_type, fare_type, distance_km 
    } = req.body;

    // Estimate fare
    const base_fare = calculateFare(distance_km, ride_type);

    const ride = await prisma.ride.create({
      data: {
        pickup_lat,
        pickup_lng,
        pickup_landmark,
        dropoff_lat,
        dropoff_lng,
        dropoff_landmark,
        ride_type,
        fare_type,
        base_fare,
        distance_km,
        status: 'PENDING'
      }
    });

    // Automatically add the creator as the first passenger
    const ridePassenger = await prisma.ridePassenger.create({
      data: {
        ride_id: ride.ride_id,
        passenger_id: userId,
        fare_share: base_fare, // Initially 100%
        pickup_lat,
        pickup_lng,
        pickup_landmark,
        dropoff_lat,
        dropoff_lng,
        dropoff_landmark,
      }
    });

    res.status(201).json({ ride, passengerRecord: ridePassenger });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radius_km = 5 } = req.query;

    // Simplified distance calculation for searching drivers 
    // In production, this would use PostGIS or Haversine formula on the DB level.
    const drivers = await prisma.driver.findMany({
      where: {
        is_available: true,
        current_latitude: { not: null },
        current_longitude: { not: null }
      },
      include: {
        user: { select: { full_name: true, profile_photo: true } },
        vehicle: true
      }
    });

    // In-memory filter for demo purposes
    const nearbyDrivers = drivers.filter(driver => {
      // Simplified check
      return true; 
    });

    res.status(200).json(nearbyDrivers);
  } catch (error) {
    console.error('Search drivers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRideStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, driver_id } = req.body; // Driver accepts ride

    const ride = await prisma.ride.findUnique({
      where: { ride_id: id }
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const updateData: any = { status };
    if (driver_id && status === 'ACCEPTED') {
      updateData.driver_id = driver_id;
    }

    const updatedRide = await prisma.ride.update({
      where: { ride_id: id },
      data: updateData
    });

    res.status(200).json(updatedRide);
  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addPassengerToSharedRide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { pickup_lat, pickup_lng, pickup_landmark, dropoff_lat, dropoff_lng, dropoff_landmark } = req.body;

    const ride = await prisma.ride.findUnique({
      where: { ride_id: id },
      include: { passengers: true }
    });

    if (!ride || ride.ride_type !== 'SHARED' || ride.status !== 'PENDING') {
      return res.status(400).json({ message: 'Ride is not available for joining' });
    }

    // Add passenger
    const newPassenger = await prisma.ridePassenger.create({
      data: {
        ride_id: ride.ride_id,
        passenger_id: userId,
        fare_share: 0, // Will be recalculated
        pickup_lat,
        pickup_lng,
        pickup_landmark,
        dropoff_lat,
        dropoff_lng,
        dropoff_landmark,
      }
    });

    // Recalculate split
    const newPassengerCount = ride.passengers.length + 1;
    const newShare = splitFare(ride.base_fare, newPassengerCount);

    // Update all passenger shares
    await prisma.ridePassenger.updateMany({
      where: { ride_id: ride.ride_id },
      data: { fare_share: newShare }
    });

    res.status(200).json({ message: 'Joined ride successfully', newFareShare: newShare });
  } catch (error) {
    console.error('Add passenger error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.findUnique({
      where: { ride_id: id },
      include: {
        driver: {
          include: { user: true, vehicle: true }
        },
        passengers: {
          include: { user: true }
        }
      }
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(ride);
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserRides = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.user_id;
    const rides = await prisma.ride.findMany({
      where: {
        passengers: {
          some: { passenger_id: userId }
        }
      },
      include: {
        driver: {
          include: { user: true, vehicle: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(rides);
  } catch (error) {
    console.error('Get user rides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPendingRides = async (req: AuthRequest, res: Response) => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        passengers: {
          include: { user: true }
        }
      },
      orderBy: { created_at: 'asc' },
      take: 5
    });

    res.status(200).json(rides);
  } catch (error) {
    console.error('Get pending rides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
