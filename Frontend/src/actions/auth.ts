"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { Role } from "@/lib/auth"; // keep Role enum, but remove localStorage
import { passengerRegisterSchema, driverRegisterSchema } from "@/lib/validations/auth";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

export async function registerAction(user: any) {
  try {
    // 1. Zod Validation
    const isDriver = user.role === "driver";
    const schema = isDriver ? driverRegisterSchema : passengerRegisterSchema;
    
    const parseResult = schema.safeParse(user);
    if (!parseResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parseResult.error.issues.map((e: any) => e.message)
      };
    }
    
    const validatedData = parseResult.data;

    // 2. Check existing users
    const trimmedEmail = validatedData.email.trim().toLowerCase();
    const orConditions: any[] = [{ email: trimmedEmail }];
    
    if (validatedData.phone && validatedData.phone.trim() !== "") {
      orConditions.push({ phone_number: validatedData.phone.trim() });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: orConditions },
    });

    if (existingUser) {
      return { 
        success: false, 
        message: existingUser.email.toLowerCase() === trimmedEmail 
          ? "User with this email already exists" 
          : "User with this phone number already exists" 
      };
    }

    // 3. Hash password and prepare user creation
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(validatedData.password, salt);
    const mappedRole = isDriver ? "DRIVER" : "PASSENGER";

    // 4. Create User and (if driver) Vehicle + Driver records
    let newUser;
    if (isDriver) {
      // Driver registration requires a transaction to create User, Vehicle, and Driver
      const driverData = validatedData as any; // Cast to access driver fields
      
      // We will create the user first, then use its ID for the driver
      newUser = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            full_name: driverData.name,
            email: trimmedEmail,
            phone_number: driverData.phone.trim(),
            password_hash,
            role: mappedRole,
          },
        });

        const createdVehicle = await tx.vehicle.create({
          data: {
            plate_number: driverData.plateNumber,
            model: driverData.vehicleModel,
            manufacturer: "Unknown", // Add to form if needed, defaulting for now
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
          role: mappedRole,
        },
      });
    }

    // 5. JWT and Cookie
    const token = jwt.sign(
      { user_id: newUser.user_id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("dms_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { 
      success: true, 
      message: "Registration successful.", 
      user: {
        id: newUser.user_id,
        name: newUser.full_name,
        email: newUser.email,
        role: newUser.role.toLowerCase() as Role,
      } 
    };
  } catch (error: any) {
    console.error("Register Error:", error);
    return { success: false, message: "Server error. Please try again." };
  }
}

export async function loginAction(email: string, password: string) {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return { success: false, message: "Invalid email or password." };
    }

    if (!user.is_active) {
      return { success: false, message: "Account is deactivated" };
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("dms_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { 
      success: true, 
      message: "Login successful.", 
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role.toLowerCase() as Role,
      } 
    };
  } catch (error: any) {
    console.error("Login Error:", error);
    return { success: false, message: "Server error. Please try again." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("dms_token");
  return { success: true };
}

export async function getCurrentUserAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dms_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
      include: { driver: true }
    });

    if (!user) return null;

    return {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.phone_number || "",
      role: user.role.toLowerCase() as Role,
      is_verified: user.driver?.is_verified,
      isAvailable: user.driver?.is_available,
    };
  } catch (error) {
    return null;
  }
}
