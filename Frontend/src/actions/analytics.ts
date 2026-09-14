"use server";

import prisma from "@/lib/db";
import { getCurrentUserAction } from "./auth";

export async function getAnalyticsAction() {
  const currentUser = await getCurrentUserAction();
  if (!currentUser || currentUser.role !== "admin") {
    return { success: false, message: "Unauthorized", status: 401 };
  }

  try {
    const rides = await prisma.ride.findMany({
      where: { status: "COMPLETED" },
    });
    
    const rev = rides.reduce((sum: number, r: any) => sum + (r.final_fare || r.base_fare || 0), 0);
    
    const driversCount = await prisma.user.count({
      where: {
        role: "DRIVER",
        driver: { is_verified: true, is_available: true }
      }
    });

    return { 
      success: true, 
      metrics: {
        totalRevenue: rev,
        platformCommission: rev * 0.1,
        totalRides: rides.length,
        activeDrivers: driversCount,
        cancellationRate: "0.0%"
      }
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
