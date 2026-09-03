"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, initializeMockData, User, logoutUser } from "@/lib/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize mock data when auth hook is first used on the client
    initializeMockData();
    
    // Check current user
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, [pathname]); // Re-check on route changes

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    isLoading,
    logout: handleLogout,
  };
};
