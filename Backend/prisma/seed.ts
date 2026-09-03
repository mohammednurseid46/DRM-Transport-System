import { PrismaClient, Role, RideType, FareType, RideStatus, SosStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.payment.deleteMany({});
  await prisma.ridePassenger.deleteMany({});
  await prisma.sosAlert.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.driverDocument.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating Admin...");
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      full_name: 'System Admin',
      email: 'admin@test.com',
      phone_number: '0000000000',
      password_hash: adminPassword,
      role: Role.ADMIN,
      is_active: true
    }
  });

  console.log("Creating Vehicles...");
  const vehicle1 = await prisma.vehicle.create({
    data: { plate_number: 'AA 12345', model: 'Corolla', manufacturer: 'Toyota', year: 2018, color: 'Silver', vehicle_tier: 'Economy', seat_capacity: 4 }
  });
  const vehicle2 = await prisma.vehicle.create({
    data: { plate_number: 'B 98765', model: 'Elantra', manufacturer: 'Hyundai', year: 2020, color: 'White', vehicle_tier: 'Comfort', seat_capacity: 4 }
  });
  const vehicle3 = await prisma.vehicle.create({
    data: { plate_number: 'AA 55432', model: 'Yaris', manufacturer: 'Toyota', year: 2015, color: 'Blue', vehicle_tier: 'Economy', seat_capacity: 4 }
  });

  console.log("Creating Drivers...");
  const driverPass = await bcrypt.hash('driver123', 10);
  
  const dUser1 = await prisma.user.create({
    data: { full_name: 'Abebe K.', email: 'abebe@driver.com', phone_number: '0911000001', password_hash: driverPass, role: Role.DRIVER }
  });
  const driver1 = await prisma.driver.create({
    data: { user_id: dUser1.user_id, vehicle_id: vehicle1.vehicle_id, licence_number: 'LIC001', licence_expiry: new Date('2028-01-01'), is_verified: true, is_available: true, current_latitude: 11.5936, current_longitude: 37.3908, rating: 4.8, total_rides: 120 }
  });

  const dUser2 = await prisma.user.create({
    data: { full_name: 'Solomon T.', email: 'solomon@driver.com', phone_number: '0911000002', password_hash: driverPass, role: Role.DRIVER }
  });
  const driver2 = await prisma.driver.create({
    data: { user_id: dUser2.user_id, vehicle_id: vehicle2.vehicle_id, licence_number: 'LIC002', licence_expiry: new Date('2027-06-01'), is_verified: true, is_available: true, current_latitude: 11.5980, current_longitude: 37.3980, rating: 4.9, total_rides: 230 }
  });

  const dUser3 = await prisma.user.create({
    data: { full_name: 'Mekdes A.', email: 'mekdes@driver.com', phone_number: '0911000003', password_hash: driverPass, role: Role.DRIVER }
  });
  const driver3 = await prisma.driver.create({
    data: { user_id: dUser3.user_id, vehicle_id: vehicle3.vehicle_id, licence_number: 'LIC003', licence_expiry: new Date('2029-03-01'), is_verified: false, is_available: false, current_latitude: 11.6020, current_longitude: 37.4100, rating: 5.0, total_rides: 10 }
  });

  console.log("Creating Passengers...");
  const passPass = await bcrypt.hash('pass123', 10);
  const pUser1 = await prisma.user.create({ data: { full_name: 'Dawit S.', email: 'dawit@test.com', phone_number: '0922000001', password_hash: passPass, role: Role.PASSENGER } });
  const pUser2 = await prisma.user.create({ data: { full_name: 'Helen M.', email: 'helen@test.com', phone_number: '0922000002', password_hash: passPass, role: Role.PASSENGER } });
  const pUser3 = await prisma.user.create({ data: { full_name: 'Kibrom T.', email: 'kibrom@test.com', phone_number: '0922000003', password_hash: passPass, role: Role.PASSENGER } });

  console.log("Creating Rides...");
  // 1 Completed Ride
  const ride1 = await prisma.ride.create({
    data: {
      driver_id: driver1.driver_id, pickup_lat: 11.5980, pickup_lng: 37.3980, pickup_landmark: 'BDU Poly Campus',
      dropoff_lat: 11.5936, dropoff_lng: 37.3908, dropoff_landmark: 'Giyorgis Square',
      ride_type: RideType.PRIVATE, fare_type: FareType.FIXED, base_fare: 150, final_fare: 150,
      distance_km: 2.5, duration_minutes: 10, status: RideStatus.COMPLETED,
      passengers: {
        create: [{ passenger_id: pUser1.user_id, fare_share: 150, payment_status: PaymentStatus.COMPLETED }]
      }
    },
    include: { passengers: true }
  });

  // Payment for ride 1
  await prisma.payment.create({
    data: {
      ride_passenger_id: ride1.passengers[0].ride_passenger_id, amount: 150, payment_method: PaymentMethod.TELEBIRR, payment_status: PaymentStatus.COMPLETED, transaction_ref: 'TXN-001'
    }
  });

  // 1 Pending Ride
  await prisma.ride.create({
    data: {
      pickup_lat: 11.5880, pickup_lng: 37.3850, pickup_landmark: 'Papyrus Hotel',
      dropoff_lat: 11.6020, dropoff_lng: 37.4100, dropoff_landmark: 'Abay Mado',
      ride_type: RideType.SHARED, fare_type: FareType.FIXED, base_fare: 80, distance_km: 5.0, status: RideStatus.PENDING,
      passengers: {
        create: [{ passenger_id: pUser2.user_id, fare_share: 80 }]
      }
    }
  });

  // 2 In-Progress Rides (Active)
  const activeRide1 = await prisma.ride.create({
    data: {
      driver_id: driver2.driver_id, pickup_lat: 11.5750, pickup_lng: 37.3880, pickup_landmark: 'New Bus Station',
      dropoff_lat: 11.6070, dropoff_lng: 37.3750, dropoff_landmark: 'Kuriftu Resort',
      ride_type: RideType.PRIVATE, fare_type: FareType.FIXED, base_fare: 350, distance_km: 7.2, status: RideStatus.IN_PROGRESS,
      passengers: {
        create: [{ passenger_id: pUser3.user_id, fare_share: 350 }]
      }
    }
  });

  const activeRide2 = await prisma.ride.create({
    data: {
      driver_id: driver1.driver_id, pickup_lat: 11.5936, pickup_lng: 37.3908, pickup_landmark: 'Giyorgis Square',
      dropoff_lat: 11.5980, dropoff_lng: 37.3980, dropoff_landmark: 'BDU Poly Campus',
      ride_type: RideType.PRIVATE, fare_type: FareType.FIXED, base_fare: 200, distance_km: 3.1, status: RideStatus.ACCEPTED,
      passengers: {
        create: [{ passenger_id: pUser1.user_id, fare_share: 200 }]
      }
    }
  });

  console.log("Creating SOS Alert...");
  await prisma.sosAlert.create({
    data: {
      ride_id: activeRide1.ride_id,
      triggered_by: pUser3.user_id,
      latitude: 11.5850,
      longitude: 37.3820,
      status: SosStatus.ACTIVE
    }
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
