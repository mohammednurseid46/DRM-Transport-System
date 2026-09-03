"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, UserCircle, Zap, Menu, X, CheckCheck } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PassengerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const getMaskedPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/(\d{4})\d{4}(\d{2})/, "$1••••$2");
  };

  const navLinks = [
    { name: "Home", href: "/passenger" },
    { name: "Book Ride", href: "/passenger/book" },
    { name: "Ride History", href: "/passenger/history" },
    { name: "Notifications", href: "/passenger/notifications" },
  ];

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close notifications
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Stubbed notifications since backend doesn't have an endpoint yet
    const mockNotifications = [
      { id: 1, title: "Your ride with Driver Dawit was completed", message: "Receipt sent to email.", read: false, time: "2m ago" },
      { id: 2, title: "Special discount for BDU Campus route", message: "Save 20% on your next ride.", read: false, time: "1h ago" },
      { id: 3, title: "SOS Safety check verified", message: "Your emergency contacts have been updated.", read: true, time: "1d ago" }
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  return (
    <ProtectedRoute allowedRoles={["passenger"]}>
      <div className="flex h-screen w-full flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans overflow-hidden">
        {/* Top Navigation */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 md:px-8 flex-shrink-0 z-20 relative">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="bg-orange-500 dark:bg-orange-600 p-1 rounded-md flex items-center justify-center">
              <Zap size={16} className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white fill-current" />
            </div>
            <Link href="/passenger" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hidden sm:block">
              Dream More TMS
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className={
                    isActive 
                      ? "text-orange-600 dark:text-orange-500 border-b-2 border-dms-primary py-5" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors py-5"
                  }
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 relative">
            {/* Notifications Popover */}
            <div className="relative group" ref={notificationsRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors p-2 relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-800 flex items-center justify-center"></span>
                )}
              </button>
              
              <div className={`absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl transition-all duration-200 z-50 overflow-hidden origin-top-right ${isNotificationsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    Notifications {unreadCount > 0 && <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
                  </span>
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 font-medium flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-slate-100 dark:border-slate-700/50 transition-colors cursor-pointer ${!notif.read ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className={`text-xs font-bold ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {notif.title}
                          </div>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{notif.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center">
                  <Link href="/passenger/notifications" className="text-xs font-medium text-orange-600 dark:text-orange-500 hover:underline block w-full">
                    View all history
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative group hidden sm:block">
              <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors p-2">
                <UserCircle size={20} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{user?.name || "Passenger"}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{getMaskedPhone(user?.phone) || "No Phone"}</div>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <Link href="/passenger/profile" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                    My Profile
                  </Link>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={logout}
              className="bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white text-xs font-bold px-4 py-2 md:px-5 md:py-2 rounded-control transition-colors shadow-lg shadow-orange-500/20"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 shadow-2xl">
            <nav className="flex flex-col p-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={
                      `p-4 text-sm font-medium border-l-2 ${
                      isActive 
                        ? "text-orange-600 dark:text-orange-500 border-dms-primary bg-white/5" 
                        : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/5 transition-colors"
                      }`
                    }
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex min-h-0 relative">
          {children}
        </main>

        {/* Footer */}
        <footer className="flex h-10 items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 flex-shrink-0 text-xs text-slate-500 dark:text-slate-500 z-10 relative">
          <div>© 2026 Dream More TMS. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-500 dark:text-slate-400">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-500 dark:text-slate-400">Privacy Policy</Link>
            <Link href="/support" className="hover:text-slate-500 dark:text-slate-400">Contact Support</Link>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
