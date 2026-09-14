export type Role = "user" | "admin" | "driver" | "passenger";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  is_verified?: boolean;
  phone?: string;
  plateNumber?: string;
  vehicleModel?: string;
  tier?: string;
  isAvailable?: boolean;
  createdAt?: string;
}

import { 
  loginAction, 
  registerAction, 
  logoutAction, 
  getCurrentUserAction 
} from "@/actions/auth";

export const initializeMockData = () => {
  // No longer needed
};

export const registerUser = async (user: Omit<User, "id">) => {
  return await registerAction(user);
};

export const loginUser = async (email: string, password: string) => {
  return await loginAction(email, password);
};

export const logoutUser = async () => {
  return await logoutAction();
};

export const getCurrentUser = async (): Promise<User | null> => {
  return await getCurrentUserAction();
};

export const checkUserExists = async (identifier: string): Promise<{ exists: boolean }> => {
  return { exists: false };
};

export const resetPassword = async (identifier: string, newPassword: string) => {
  return { success: false, message: "Not implemented in DB yet" };
};
