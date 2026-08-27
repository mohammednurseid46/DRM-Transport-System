export type Role = "user" | "admin" | "driver";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored in plain text for this mock
  role: Role;
  is_verified?: boolean; // Used for Driver KYC status
  phone?: string;
  plateNumber?: string;
  vehicleModel?: string;
  tier?: string;
  isAvailable?: boolean; // Used for Driver Online/Offline status
  createdAt?: string;
}

const USERS_KEY = "dms_users";
const CURRENT_USER_KEY = "dms_current_user";

// Helper to safely get from localStorage
const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

// Helper to safely set to localStorage
const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const initializeMockData = () => {
  if (typeof window === "undefined") return;

  const existingUsers = getLocalStorageItem(USERS_KEY);
  
  if (!existingUsers || existingUsers.length === 0) {
    const adminUser: User = {
      id: "admin-1",
      name: "System Admin",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    };
    
    // Seed some other mock users if needed, but the prompt only asked for admin
    setLocalStorageItem(USERS_KEY, [adminUser]);
    console.log("Mock data initialized with admin user.");
  }
};

export const getUsers = (): User[] => {
  return getLocalStorageItem(USERS_KEY) || [];
};

export const registerUser = (user: Omit<User, "id">): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  // Check for duplicate email
  if (users.some((u) => u.email === user.email)) {
    return { success: false, message: "Email is already registered." };
  }

  const newUser: User = {
    ...user,
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  };

  setLocalStorageItem(USERS_KEY, [...users, newUser]);
  return { success: true, message: "Registration successful.", user: newUser };
};

export const loginUser = (email: string, password: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  const user = users.find((u) => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, message: "Invalid email or password." };
  }

  // Don't store password in session
  const sessionUser = { ...user };
  delete sessionUser.password;

  setLocalStorageItem(CURRENT_USER_KEY, sessionUser);
  return { success: true, message: "Login successful.", user: sessionUser };
};

export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getCurrentUser = (): User | null => {
  return getLocalStorageItem(CURRENT_USER_KEY);
};

export const verifyDriver = (driverId: string): boolean => {
  const users = getUsers();
  const driverIndex = users.findIndex(u => u.id === driverId);
  if (driverIndex === -1) return false;
  
  users[driverIndex].is_verified = true;
  setLocalStorageItem(USERS_KEY, users);
  return true;
};

export const rejectDriver = (driverId: string): boolean => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== driverId);
  
  if (filteredUsers.length === users.length) return false;
  
  setLocalStorageItem(USERS_KEY, filteredUsers);
  return true;
};

export const checkUserExists = (identifier: string): { exists: boolean } => {
  const users = getUsers();
  const exists = users.some(u => u.email === identifier || u.phone === identifier);
  return { exists };
};

export const resetPassword = (identifier: string, newPassword: string): { success: boolean; message: string } => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === identifier || u.phone === identifier);
  
  if (userIndex === -1) {
    return { success: false, message: "No account found with this email/phone." };
  }
  
  users[userIndex].password = newPassword;
  setLocalStorageItem(USERS_KEY, users);
  
  return { success: true, message: "Password updated successfully! You can now log in." };
};

export const toggleDriverAvailability = (driverId: string, isAvailable: boolean): boolean => {
  const users = getUsers();
  const driverIndex = users.findIndex(u => u.id === driverId);
  if (driverIndex === -1) return false;
  
  users[driverIndex].isAvailable = isAvailable;
  setLocalStorageItem(USERS_KEY, users);

  // Also update CURRENT_USER_KEY if the current user is this driver
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === driverId) {
    currentUser.isAvailable = isAvailable;
    setLocalStorageItem(CURRENT_USER_KEY, currentUser);
  }
  
  return true;
};
