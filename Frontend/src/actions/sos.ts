"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./auth";

export async function createSosAction(rideId: string, triggeredBy: string, lat: number, lng: number) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized", status: 401 };

  try {
    const sos = await prisma.sosAlert.create({
      data: {
        ride_id: rideId,
        triggered_by: triggeredBy,
        latitude: lat,
        longitude: lng,
        status: "ACTIVE",
      }
    });
    revalidatePath("/admin/sos");
    revalidatePath("/admin");
    return { success: true, sos };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function getActiveSosAction() {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized", status: 401 };

  try {
    const sosAlerts = await prisma.sosAlert.findMany({
      where: { status: "ACTIVE" },
      include: {
        ride: {
          include: {
            driver: { include: { user: true, vehicle: true } },
            passengers: { include: { passenger: true } }
          }
        }
      },
      orderBy: { created_at: "desc" }
    });
    return { success: true, sosAlerts };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function resolveSosAction(alertId: string) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized", status: 401 };

  try {
    const sos = await prisma.sosAlert.update({
      where: { alert_id: alertId },
      data: { status: "RESOLVED" }
    });
    revalidatePath("/admin/sos");
    revalidatePath("/admin");
    return { success: true, sos };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
