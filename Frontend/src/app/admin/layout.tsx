"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  CreditCard,
  HelpCircle,
  Menu,
  X,
  UserCircle,
  AlertOctagon,
  MessageSquareWarning,
  BarChart3
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const [sosCount, setSosCount] = useState(0);

  useEffect(() => {
    // Initial load
    const loadSOS = () => {
      const sosData = localStorage.getItem("emergencySOS");
      if (sosData) {
        try {
          const parsed = JSON.parse(sosData);
          // If it's an array, count unresolved. If single object, just 1.
          if (Array.isArray(parsed)) {
            setSosCount(parsed.filter(s => s.status === 'active').length);
          } else {
            setSosCount(parsed.status === 'active' ? 1 : 0);
          }
        } catch(e) {
          setSosCount(1);
        }
      } else {
        setSosCount(0);
      }
    };
    
    loadSOS();

    // Listen for cross-tab or current-tab storage changes (if custom event is dispatched)
    window.addEventListener("storage", loadSOS);
    window.addEventListener("sos-updated", loadSOS); // Custom event for same-tab updates

    return () => {
      window.removeEventListener("storage", loadSOS);
      window.removeEventListener("sos-updated", loadSOS);
    };
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Rides", href: "/admin/rides", icon: Car },
    { name: "Drivers & Verification", href: "/admin/drivers", icon: Users },
    { name: "Passengers", href: "/admin/passengers", icon: UserCircle },
    { name: "Payments & Splits", href: "/admin/payments", icon: CreditCard },
    { name: "SOS Alerts", href: "/admin/sos", icon: AlertOctagon, badge: sosCount },
    { name: "Complaints & Disputes", href: "/admin/complaints", icon: MessageSquareWarning },
    { name: "Reports & Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-6 border-b md:border-none border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 dark:bg-orange-600 p-1.5 rounded-md">
            <LayoutDashboard size={18} className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" />
          </div>
          <Link href="/admin" className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white leading-tight">
            Dream More<br/><span className="text-[10px] font-normal text-slate-600 dark:text-slate-400">TRANSPORT MANAGEMENT<br/>SYSTEM</span>
          </Link>
        </div>
      </div>
      
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        <div className="px-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-control transition-colors ${
                  isActive 
                    ? "bg-orange-500 dark:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium shadow-sm" 
                    : "hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm">{link.name}</span>
                </div>
                {link.badge && link.badge > 0 ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-red-500/20">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 mb-4 space-y-1">
          <Link 
            href="/admin/profile" 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-control hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
          >
            <UserCircle size={18} />
            <span className="text-sm">Admin Profile</span>
          </Link>
          <Link 
            href="/admin/help" 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-control hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
          >
            <HelpCircle size={18} />
            <span className="text-sm">Help Center</span>
          </Link>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-control hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
      </div>
    </>
  );

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col bg-slate-50 dark:bg-slate-900 z-10">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <aside 
          className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-sm z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden border-r border-slate-200 dark:border-slate-700 shadow-2xl ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Mobile Header */}
          <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm shrink-0 sticky top-0 z-20 shadow-md">
            <Link href="/admin" className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
               <div className="bg-orange-500 dark:bg-orange-600 p-1 rounded flex items-center justify-center">
                  <LayoutDashboard size={14} className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" />
               </div>
               Dream More
            </Link>
            <button 
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
