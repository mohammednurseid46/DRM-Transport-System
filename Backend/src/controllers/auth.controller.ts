import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

import { passengerRegisterSchema, driverRegisterSchema } from '../validations/auth.js';

export const register = async (req: Request, res: Response) => {
  try {
    const isDriver = req.body.role === 'driver' || req.body.role === 'DRIVER';
    const schema = isDriver ? driverRegisterSchema : passengerRegisterSchema;

    // 1. Zod Validation
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.issues.map((e: any) => e.message)
      });
    }

    const validatedData = parseResult.data;

    // 2. Check if user already exists
    const trimmedEmail = validatedData.email.trim().toLowerCase();
    const orConditions: any[] = [{ email: trimmedEmail }];

    if (validatedData.phone && validatedData.phone.trim() !== '') {
      orConditions.push({ phone_number: validatedData.phone.trim() });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email.toLowerCase() === trimmedEmail
          ? 'User with this email already exists'
          : 'User with this phone number already exists'
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(validatedData.password, salt);
    const mappedRole = isDriver ? 'DRIVER' : 'PASSENGER';

    // 4. Create user (and driver/vehicle if applicable)
    let newUser;
    if (isDriver) {
      const driverData = validatedData as any;
      newUser = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            full_name: driverData.name,
            email: trimmedEmail,
            phone_number: driverData.phone.trim(),
            password_hash,
            role: mappedRole
          },
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone_number: true,
            role: true,
            created_at: true
          }
        });

        const createdVehicle = await tx.vehicle.create({
          data: {
            plate_number: driverData.plateNumber,
            model: driverData.vehicleModel,
            manufacturer: 'Unknown',
            year: parseInt(driverData.year, 10),
            color: driverData.color,
            vehicle_tier: driverData.tier,
            seat_capacity: parseInt(driverData.seatCapacity, 10),
            is_active: false,
          }
        });

        await tx.driver.create({
          data: {
            user_id: createdUser.user_id,
            vehicle_id: createdVehicle.vehicle_id,
            licence_number: driverData.licenceNumber,
            licence_expiry: new Date(driverData.licenceExpiry),
            is_verified: false,
          }
        });

        return createdUser;
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          full_name: validatedData.name,
          email: trimmedEmail,
          phone_number: validatedData.phone ? validatedData.phone.trim() : null,
          password_hash,
          role: mappedRole
        },
        select: {
          user_id: true,
          full_name: true,
          email: true,
          phone_number: true,
          role: true,
          created_at: true
        }
      });
    }

    const token = jwt.sign(
      { user_id: newUser.user_id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // Assuming a middleware adds user object to req
    const userId = (req as any).user.user_id;

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone_number: true,
        role: true,
        profile_photo: true,
        is_active: true,
        created_at: true,
        driver: {
          include: {
            vehicle: true,
            payout_methods: true
          }
        } // Include driver details if applicable
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
