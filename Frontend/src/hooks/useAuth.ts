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
    // Check current user
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [pathname]); // Re-check on route changes

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    isLoading,
    logout: handleLogout,
  };
};
