import { z } from "zod";

export const passengerRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^(?:\+251|0)[97]\d{8}$/, "Invalid Ethiopian phone number (e.g. 09... or +2519...)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const driverRegisterSchema = passengerRegisterSchema.extend({
  licenceNumber: z.string().min(3, "Licence number is required"),
  licenceExpiry: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, {
    message: "Licence expiry must be a valid future date",
  }),
  plateNumber: z.string().min(2, "Plate number is required"),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
  year: z.string().regex(/^\d{4}$/, "Must be a valid 4-digit year"),
  color: z.string().min(2, "Color is required"),
  tier: z.string().min(2, "Tier is required"),
  seatCapacity: z.string().regex(/^\d+$/, "Must be a valid number"),
});

export type PassengerRegisterInput = z.infer<typeof passengerRegisterSchema>;
export type DriverRegisterInput = z.infer<typeof driverRegisterSchema>;
