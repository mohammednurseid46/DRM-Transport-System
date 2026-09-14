import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUserAction } from '@/actions/auth';

export async function POST(
  request: Request,
  context: { params: Promise<{ driverId: string }> }
) {
  try {
    const params = await context.params;
    const currentUser = await getCurrentUserAction();
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = params.driverId; // The ID passed from the frontend is the user_id

    let action = 'APPROVE';
    try {
      const body = await request.json();
      if (body.action) {
        action = body.action;
      }
    } catch (e) {
      // Ignore if no JSON body
    }

    // Find the associated driver record
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: { driver: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    let actualDriverId = user.driver?.driver_id;

    if (!actualDriverId) {
      if (action === 'APPROVE') {
        // Auto-create missing driver record to fix 404 errors for incomplete registrations
        let vehicle = await prisma.vehicle.findFirst();
        
        if (!vehicle) {
          vehicle = await prisma.vehicle.create({
            data: {
              plate_number: `TEST-${Math.floor(Math.random() * 10000)}`,
              model: 'Test Model',
              manufacturer: 'Test Manufacturer',
              year: 2024,
              color: 'White',
              vehicle_tier: 'Economy',
              seat_capacity: 4
            }
          });
        }
        
        const newDriver = await prisma.driver.create({
          data: {
            user_id: userId,
            vehicle_id: vehicle.vehicle_id,
            licence_number: `LIC-${userId.substring(0, 8)}`,
            licence_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            is_verified: false
          }
        });
        actualDriverId = newDriver.driver_id;
      } else {
        // If rejecting and no driver record exists, it's already "rejected"
        return NextResponse.json({ success: true, message: "User rejected successfully" });
      }
    }

    if (action === 'APPROVE') {
      // Execute Prisma transaction to update both documents and the driver record
      await prisma.$transaction([
        prisma.driverDocument.updateMany({
          where: { driver_id: actualDriverId },
          data: { verified: true }
        }),
        prisma.driver.update({
          where: { driver_id: actualDriverId },
          data: { is_verified: true }
        })
      ]);
      return NextResponse.json({ success: true, message: "Driver and documents verified successfully" });
    } else if (action === 'REJECT') {
      // Execute Prisma transaction to delete documents and ensure is_verified remains false
      await prisma.$transaction([
        prisma.driverDocument.deleteMany({
          where: { driver_id: actualDriverId }
        }),
        prisma.driver.update({
          where: { driver_id: actualDriverId },
          data: { is_verified: false }
        })
      ]);
      return NextResponse.json({ success: true, message: "Driver rejected and documents deleted" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error verifying driver API:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
