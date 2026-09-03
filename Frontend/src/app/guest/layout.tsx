"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 md:px-8 flex-shrink-0 z-20 relative">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:text-orange-500 transition-colors p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
             <ArrowLeft size={20} />
          </Link>
          <div className="bg-orange-500 dark:bg-orange-600 p-1 rounded-md flex items-center justify-center">
            <Zap size={16} className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white fill-current" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hidden sm:block">
            Dream More <span className="font-light text-slate-500 dark:text-slate-400">Guest</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link 
            href="/register"
            className="bg-orange-500/10 dark:bg-orange-600/10 hover:bg-orange-500/20 dark:hover:bg-orange-600/20 border border-orange-500/20 text-orange-600 dark:text-orange-500 text-xs font-bold px-4 py-2 md:px-5 md:py-2 rounded-control transition-colors"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex min-h-0 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex h-10 items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 flex-shrink-0 text-xs text-slate-500 dark:text-slate-500 z-10 relative">
        <div>© 2026 Dream More TMS. Quick Ride Mode.</div>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-slate-500 dark:text-slate-400">Terms</Link>
          <Link href="/privacy" className="hover:text-slate-500 dark:text-slate-400">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
