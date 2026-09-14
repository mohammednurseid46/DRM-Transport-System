"use server";

import prisma from "@/lib/db";
import { getCurrentUserAction } from "./auth";

export async function getUsersAction() {
  const currentUser = await getCurrentUserAction();
  if (currentUser?.role !== "admin") {
    return { success: false, message: "Unauthorized", users: [] };
  }

  try {
    const users = await prisma.user.findMany({
      include: { driver: { include: { vehicle: true } } },
    });
    
    return {
      success: true,
      users: users.map((u: any) => ({
        id: u.user_id,
        name: u.full_name,
        email: u.email,
        phone: u.phone_number || "",
        role: u.role.toLowerCase(),
        is_verified: u.driver?.is_verified,
        isAvailable: u.driver?.is_available,
        createdAt: u.created_at.toISOString(),
        vehicleInfo: u.driver?.vehicle ? `${u.driver.vehicle.manufacturer} ${u.driver.vehicle.model}` : undefined,
        vehicleModel: u.driver?.vehicle?.model,
        plateNumber: u.driver?.vehicle?.plate_number,
        tier: u.driver?.vehicle?.vehicle_tier,
      }))
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, message: "Server error", users: [] };
  }
}

export async function verifyDriverAction(driverId: string) {
  const currentUser = await getCurrentUserAction();
  if (currentUser?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: driverId },
      include: { driver: true }
    });

    if (user?.driver) {
      await prisma.driver.update({
        where: { driver_id: user.driver.driver_id },
        data: { is_verified: true }
      });
      return { success: true, message: "Driver verified successfully" };
    }
    return { success: false, message: "Driver not found" };
  } catch (error) {
    console.error("Error verifying driver:", error);
    return { success: false, message: "Server error" };
  }
}

export async function getDriverDocumentsAction(driverId: string) {
  const currentUser = await getCurrentUserAction();
  if (currentUser?.role !== "admin") {
    return { success: false, message: "Unauthorized", documents: [] };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: driverId },
      include: { driver: { include: { documents: true } } }
    });

    if (user?.driver?.documents) {
      return { success: true, documents: user.driver.documents };
    }
    
    return { success: true, documents: [] };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { success: false, message: "Server error", documents: [] };
  }
}

export async function toggleDriverAvailabilityAction(driverId: string, isAvailable: boolean) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser || (currentUser.role !== "admin" && currentUser.id !== driverId)) {
    return { success: false, message: "Unauthorized" };
  }

  if (currentUser.role === "driver" && !currentUser.is_verified) {
    return { success: false, message: "Forbidden: Driver pending verification" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: driverId },
      include: { driver: true }
    });

    if (user?.driver) {
      await prisma.driver.update({
        where: { driver_id: user.driver.driver_id },
        data: { is_available: isAvailable }
      });
      return { success: true, message: "Availability updated" };
    }
    return { success: false, message: "Driver not found" };
  } catch (error) {
    console.error("Error toggling availability:", error);
    return { success: false, message: "Server error" };
  }
}

export async function updateProfileAction(data: { name: string; email: string; phone: string }) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized" };

  try {
    const user = await prisma.user.update({
      where: { user_id: currentUser.id },
      data: {
        full_name: data.name,
        email: data.email,
        phone_number: data.phone,
      }
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, message: "Failed to update profile. Email or phone might already be in use." };
  }
}

import bcrypt from "bcryptjs";

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) return { success: false, message: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { user_id: currentUser.id } });
    if (!user) return { success: false, message: "User not found" };

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return { success: false, message: "Incorrect current password" };

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password_hash }
    });

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, message: "Server error" };
  }
}
