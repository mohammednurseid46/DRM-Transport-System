import { Car, Star, Users, Briefcase } from "lucide-react";
import React from "react";

export type RideProductType = "ECONOMY" | "STANDARD_PLUS" | "PREMIUM" | "VAN" | "MOTO";

export interface RideProduct {
  id: string;
  type: RideProductType;
  name: string;
  description: string;
  seats: number;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  commissionPercentage: number;
  isActive: boolean;
  recommended?: boolean;
  icon: React.ElementType;
}

export const RIDE_PRODUCTS: RideProduct[] = [
  {
    id: "prod_economy",
    type: "ECONOMY",
    name: "Economy",
    description: "Affordable everyday transit for solo or small groups.",
    seats: 4,
    baseFare: 1.50,
    perKmRate: 0.80,
    perMinuteRate: 0.20,
    minimumFare: 3.00,
    commissionPercentage: 15,
    isActive: true,
    icon: Car,
  },
  {
    id: "prod_standard",
    type: "STANDARD_PLUS",
    name: "Standard Plus",
    description: "Spacious SUVs with extra legroom and climate control.",
    seats: 6,
    baseFare: 3.00,
    perKmRate: 1.20,
    perMinuteRate: 0.35,
    minimumFare: 5.00,
    commissionPercentage: 20,
    isActive: true,
    recommended: true,
    icon: Car, // Could be changed to a specific SUV icon if preferred
  },
  {
    id: "prod_premium",
    type: "PREMIUM",
    name: "Black Premium",
    description: "Executive luxury vehicles with top-rated professional drivers.",
    seats: 3,
    baseFare: 7.00,
    perKmRate: 2.50,
    perMinuteRate: 0.70,
    minimumFare: 12.00,
    commissionPercentage: 25,
    isActive: true,
    icon: Star,
  },
  {
    id: "prod_van",
    type: "VAN",
    name: "Group Van",
    description: "Large capacity vehicles for up to 8 passengers.",
    seats: 8,
    baseFare: 5.00,
    perKmRate: 1.80,
    perMinuteRate: 0.45,
    minimumFare: 10.00,
    commissionPercentage: 20,
    isActive: false, // Inactive by default
    icon: Users,
  }
];

export const calculateEstimatedFare = (product: RideProduct, distanceKm: number, durationMinutes: number): number => {
  const fare = product.baseFare + (product.perKmRate * distanceKm) + (product.perMinuteRate * durationMinutes);
  return Math.max(fare, product.minimumFare);
};
