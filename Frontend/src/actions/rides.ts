"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./auth";

export async function createRideAction(data: any) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized", status: 401 };

  try {
    const ride = await prisma.ride.create({
      data: {
        pickup_lat: data.pickup_lat,
        pickup_lng: data.pickup_lng,
        pickup_landmark: data.pickup_landmark,
        dropoff_lat: data.dropoff_lat,
        dropoff_lng: data.dropoff_lng,
        dropoff_landmark: data.dropoff_landmark,
        ride_type: data.ride_type || "PRIVATE",
        fare_type: "FIXED",
        base_fare: data.fare || 0,
        distance_km: data.distance || 0,
        status: "PENDING",
      }
    });

    if (data.passenger_id) {
      await prisma.ridePassenger.create({
        data: {
          ride_id: ride.ride_id,
          passenger_id: data.passenger_id,
          fare_share: data.fare || 0,
        }
      });
    }

    revalidatePath("/admin/rides");
    return { success: true, ride };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function getActiveRidesAction() {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized", status: 401 };

  try {
    const rides = await prisma.ride.findMany({
      where: {
        status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] }
      },
      include: {
        passengers: { include: { passenger: true } },
        driver: { include: { user: true } }
      },
      orderBy: { created_at: "desc" }
    });
    return { success: true, rides };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function getRideAction(rideId: string) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized", status: 401 };

  try {
    const ride = await prisma.ride.findUnique({
      where: { ride_id: rideId },
      include: {
        passengers: { include: { passenger: true } },
        driver: { include: { user: true, vehicle: true } }
      }
    });
    return { success: true, ride };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function updateRideStatusAction(rideId: string, status: any, driverId?: string) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized", status: 401 };

  if (currentUser.role === "driver" && !currentUser.is_verified) {
    return { success: false, message: "Forbidden: Driver pending verification", status: 403 };
  }

  try {
    const updateData: any = { status };
    if (driverId) updateData.driver_id = driverId;
    
    const ride = await prisma.ride.update({
      where: { ride_id: rideId },
      data: updateData
    });
    
    revalidatePath("/admin/rides");
    return { success: true, ride };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
