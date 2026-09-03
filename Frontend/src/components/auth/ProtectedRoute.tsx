"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized users based on their role
        let target = "/passenger";
        if (user.role === "admin") {
          target = "/admin";
        } else if (user.role === "driver") {
          target = "/driver";
        }
        
        if (!pathname.startsWith(target)) {
          router.push(target);
        }
      }
    }
  }, [user, isLoading, router, allowedRoles, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dms-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
