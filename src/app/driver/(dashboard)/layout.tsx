"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, User } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      <div className="flex h-screen w-full flex-col font-sans bg-gray-50 overflow-hidden">
        {/* Top Navigation Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between bg-[#363f4e] px-4 md:px-8 shadow-md z-10 relative">
        <div className="flex items-center h-full gap-8">
           <Link href="/driver/dashboard" className="text-[#E57036] font-bold text-lg tracking-wider hidden md:block">
             DREAM MORE TMS
           </Link>
           <nav className="flex items-center gap-2 md:gap-6 h-full">
             <Link 
               href="/driver/dashboard" 
               className={`flex items-center h-full px-2 text-sm font-medium transition-colors border-b-2 ${
                 pathname === "/driver/dashboard" || pathname === "/driver"
                   ? "border-[#E57036] text-[#E57036]" 
                   : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
               }`}
             >
               Home
             </Link>
             <Link 
               href="/driver/earnings" 
               className={`flex items-center h-full px-2 text-sm font-medium transition-colors border-b-2 ${
                 pathname === "/driver/earnings"
                   ? "border-[#E57036] text-[#E57036]" 
                   : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
               }`}
             >
               Earnings
             </Link>
             <Link 
               href="/driver/history" 
               className={`flex items-center h-full px-2 text-sm font-medium transition-colors border-b-2 ${
                 pathname === "/driver/history"
                   ? "border-[#E57036] text-[#E57036]" 
                   : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
               }`}
             >
               History
             </Link>
             <Link 
               href="/driver/support" 
               className={`flex items-center h-full px-2 text-sm font-medium transition-colors border-b-2 ${
                 pathname === "/driver/support"
                   ? "border-[#E57036] text-[#E57036]" 
                   : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
               }`}
             >
               Support
             </Link>
           </nav>
        </div>
        
        <div className="flex items-center gap-5">
           <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors relative">
             <Bell size={18} />
             <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-[#E57036] rounded-full border border-[#363f4e]"></span>
           </button>
           <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">
             <Settings size={18} />
           </button>
           <button className="h-8 w-8 rounded-full bg-gray-600 border border-gray-500 overflow-hidden flex items-center justify-center relative">
              {/* Mock avatar */}
              <div className="absolute inset-0 bg-[#2B3542]"></div>
              <User size={18} className="text-slate-500 dark:text-slate-400 relative z-10" />
           </button>
        </div>
      </header>

      {/* Main Content Area (No padding here so pages can be full-bleed) */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation (Visible only on very small screens if needed, but for now we rely on the top nav as it matches the design) */}
      </div>
    </ProtectedRoute>
  );
}
