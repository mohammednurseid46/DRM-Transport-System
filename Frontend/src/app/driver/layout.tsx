"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Car, LogOut, Menu, UserCircle, LayoutDashboard } from "lucide-react";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <div className="flex h-screen w-full flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans overflow-hidden">

        {/* Driver Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 relative z-30 shadow-md">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/driver" className="flex items-center gap-2 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold text-lg">
              <div className="bg-orange-500 dark:bg-orange-600 p-1.5 rounded text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center justify-center">
                <Car size={18} />
              </div>
              <span className="hidden sm:inline">Dream More Driver</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative group hidden sm:block z-50">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-700 rounded-full text-left">
                <UserCircle size={16} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name || "Driver"}</span>
              </button>

              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden origin-top-right">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{user?.name || "Driver"}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.phone || "No Phone"}</div>
                </div>

                <div className="p-2 flex flex-col gap-1 border-b border-slate-200 dark:border-slate-700">
                  <Link href="/driver" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/driver/profile" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center justify-between">
                    My Profile
                  </Link>
                  <div className="px-3 py-2 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    Status
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user?.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {user?.isAvailable ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    Theme
                    <ThemeToggle />
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors font-medium"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <button
              className="sm:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xl z-50 animate-in slide-in-from-top-2">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg">
                <UserCircle size={24} className="text-slate-500 dark:text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || "Driver"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.phone || user?.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user?.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {user?.isAvailable ? "Online" : "Offline"}
                </span>
              </div>

              <Link
                href="/driver/profile"
                className="flex items-center gap-2 w-full p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors font-medium text-sm text-slate-700 dark:text-slate-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Profile
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
