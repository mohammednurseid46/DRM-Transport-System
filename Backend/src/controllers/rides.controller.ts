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
      ride_type, fare_type, payment_method, distance_km, driver_id
    } = req.body;

    // Type casting and validation
    const p_lat = parseFloat(pickup_lat);
    const p_lng = parseFloat(pickup_lng);
    const d_lat = parseFloat(dropoff_lat);
    const d_lng = parseFloat(dropoff_lng);
    const dist = distance_km != null ? parseFloat(distance_km) : 0;

    if (isNaN(p_lat) || isNaN(p_lng) || isNaN(d_lat) || isNaN(d_lng)) {
      return res.status(400).json({ message: "Invalid coordinates provided" });
    }

    // Estimate fare
    const base_fare = calculateFare(dist, ride_type);

    const ride = await prisma.ride.create({
      data: {
        driver_id: driver_id || undefined,
        pickup_lat: p_lat,
        pickup_lng: p_lng,
        pickup_landmark,
        dropoff_lat: d_lat,
        dropoff_lng: d_lng,
        dropoff_landmark,
        ride_type: ride_type || 'PRIVATE',
        fare_type: fare_type || 'FIXED',
        base_fare: base_fare || 0,
        distance_km: dist,
        status: 'PENDING'
      }
    });

    // Automatically add the creator as the first passenger
    const ridePassenger = await prisma.ridePassenger.create({
      data: {
        ride_id: ride.ride_id,
        passenger_id: userId,
        fare_share: base_fare || 0, // Initially 100%
        pickup_lat: p_lat,
        pickup_lng: p_lng,
        pickup_landmark,
        dropoff_lat: d_lat,
        dropoff_lng: d_lng,
        dropoff_landmark,
      }
    });

    // Record payment preference
    await prisma.payment.create({
      data: {
        ride_passenger_id: ridePassenger.ride_passenger_id,
        amount: base_fare || 0,
        payment_method: payment_method || 'CASH',
        payment_status: 'PENDING'
      }
    });

    res.status(201).json({ ride, passengerRecord: ridePassenger });
  } catch (error: any) {
    console.error('Ride Booking Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
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
          include: { passenger: true }
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
          include: { passenger: true }
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
