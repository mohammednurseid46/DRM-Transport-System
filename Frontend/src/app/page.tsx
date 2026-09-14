"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Clock, MapPin, Smartphone, ArrowRight, Menu, X, LogOut, LayoutDashboard, UserCircle, CheckCircle2, Star, Navigation, Car, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const dashboardLink = user?.role === "admin" ? "/admin" : user?.role === "driver" ? "/driver" : "/passenger";

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 font-sans text-slate-700 dark:text-slate-200 overflow-x-hidden selection:bg-orange-500 dark:bg-orange-600 selection:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white relative">
      
      {/* Dynamic Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-md px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 dark:bg-orange-600 shadow-lg shadow-orange-500/20">
            <Zap size={20} className="fill-current text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" />
          </div>
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hidden sm:block">
            Dream More <span className="font-light text-slate-500 dark:text-slate-400">TMS</span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button onClick={() => scrollTo("features")} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">How it Works</button>
          <button onClick={() => scrollTo("about")} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">About</button>
        </nav>

        {/* Auth Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link href="/driver-register" className="text-sm font-medium text-orange-600 dark:text-orange-500 hover:text-orange-600 dark:text-orange-500-hover transition-colors mr-2">
            Become a Driver
          </Link>
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">Welcome, <span className="font-semibold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{user.name.split(' ')[0]}</span></span>
                <Link href={dashboardLink} className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/20 transition-all">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button onClick={logout} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:text-orange-600 dark:text-orange-500 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:text-orange-600 dark:text-orange-500 transition-colors ml-4 mr-2">
                  Sign Up
                </Link>
                <Link href="/guest/book" className="rounded-xl bg-orange-500 dark:bg-orange-600 px-5 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover transition-all transform hover:-translate-y-0.5">
                  Quick Ride
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Menu Toggle & Theme */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button 
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-white dark:bg-slate-800 md:hidden p-6 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-6">
          <nav className="flex flex-col gap-4 text-lg font-medium">
            <button onClick={() => scrollTo("features")} className="text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors border-b border-slate-200 dark:border-slate-700 pb-4">Features</button>
            <button onClick={() => scrollTo("how-it-works")} className="text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors border-b border-slate-200 dark:border-slate-700 pb-4">How it Works</button>
            <button onClick={() => scrollTo("about")} className="text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors border-b border-slate-200 dark:border-slate-700 pb-4">About</button>
          </nav>

          {!isLoading && (
            user ? (
              <div className="mt-auto flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/5">
                  <UserCircle size={24} className="text-orange-600 dark:text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <Link href={dashboardLink} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/20 transition-all">
                  <LayoutDashboard size={18} />
                  Go to Dashboard
                </Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-5 py-3 text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/5 transition-all">
                  Sign In
                </Link>
                <Link href="/guest/book" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-xl bg-orange-500 dark:bg-orange-600 px-5 py-3 text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover transition-all">
                  Quick Ride
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-xl border border-dms-primary/50 text-orange-600 dark:text-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-500 dark:bg-orange-600/10 transition-all">
                  Create Account
                </Link>
                <Link href="/driver-register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-xl border border-dms-primary/50 text-orange-600 dark:text-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-500 dark:bg-orange-600/10 transition-all">
                  Become a Driver
                </Link>
              </div>
            )
          )}
        </div>
      )}

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-20 px-6 md:px-12 min-h-[90vh] overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-1/4 -left-1/4 h-96 w-96 rounded-full bg-orange-500 dark:bg-orange-600/10 blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]"></div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-dms-primary/20 bg-orange-500 dark:bg-orange-600/10 px-4 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-500 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 dark:bg-orange-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 dark:bg-orange-600"></span>
              </span>
              The Future of Transportation
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white leading-tight">
              Move Smarter, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dms-primary to-orange-400">Dream More.</span>
            </h1>
            
            <p className="max-w-2xl text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience seamless ride-hailing with our advanced transport management system. Fast, reliable, and designed for your ultimate comfort.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              {user ? (
                <Link href={dashboardLink} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-orange-500 dark:bg-orange-600 px-8 py-4 text-base font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-xl shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover hover:scale-105 transition-all">
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link href="/guest/book" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-orange-500 dark:bg-orange-600 px-8 py-4 text-base font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-xl shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover hover:scale-105 transition-all">
                    Quick Ride (No Sign-Up)
                    <Zap size={20} className="fill-current" />
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-dms-primary/50 bg-transparent text-orange-600 dark:text-orange-500 px-8 py-4 text-base font-bold hover:bg-orange-500 dark:bg-orange-600/10 transition-all">
                    Create Account
                  </Link>
                  <Link href="/driver-register" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 px-8 py-4 text-base font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    Drive with us
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 md:px-12 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-4">Why Choose Dream More?</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We provide a premium experience built on reliability, safety, and cutting-edge technology.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Book a ride in seconds with our highly optimized matchmaking algorithm." },
                { icon: ShieldCheck, title: "Secure & Safe", desc: "All drivers are vetted, and your data is protected with enterprise-grade security." },
                { icon: Clock, title: "24/7 Availability", desc: "Day or night, our fleet is ready to get you to your destination on time." },
              ].map((feature, i) => (
                <div key={i} className="group relative p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-dms-primary/50 transition-all hover:-translate-y-1 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-dms-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-slate-200 dark:border-slate-700 text-orange-600 dark:text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 dark:bg-orange-600 group-hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-all">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 md:px-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2 space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-4">Simple Workflow, Powerful Results.</h2>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Getting around has never been easier. Our intuitive platform guides you from booking to destination seamlessly.</p>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: Smartphone, title: "1. Request", desc: "Enter your destination and choose your preferred ride type." },
                    { icon: MapPin, title: "2. Track", desc: "Watch your driver approach in real-time on the map." },
                    { icon: ShieldCheck, title: "3. Arrive", desc: "Enjoy a safe journey and pay automatically through the app." },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 border border-dms-primary/30">
                          <step.icon size={18} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{step.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 shadow-2xl aspect-[4/3] flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-orange-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Passenger Live Tracking Preview Mockup */}
                  <div className="relative z-10 w-[85%] h-[90%] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
                     {/* Map Area */}
                     <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {/* Fake map background elements */}
                        <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(#CBD5E1 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                        <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-slate-300 dark:border-slate-600 rounded-lg skew-x-12 opacity-30"></div>
                        
                        {/* Route Line */}
                        <div className="absolute top-1/2 left-1/4 w-1/2 h-1 bg-orange-500 dark:bg-orange-600 -rotate-12 rounded-full"></div>
                        
                        {/* Pickup Pin */}
                        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-full text-slate-900 dark:text-white">
                           <MapPin size={24} className="fill-current text-orange-500 dark:text-orange-600" />
                        </div>
                        
                        {/* Driver Car Icon (Moving) */}
                        <div className="absolute top-[45%] left-[60%] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 animate-pulse group-hover:-translate-x-12 transition-transform duration-1000">
                           <Car size={20} className="text-orange-600 dark:text-orange-500" />
                        </div>

                        {/* Guaranteed Fare Badge */}
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-orange-200 dark:border-orange-500/30 px-3 py-1.5 rounded-full shadow-md">
                           <p className="text-[10px] font-bold text-orange-600 dark:text-orange-500 flex items-center gap-1">
                              <ShieldCheck size={12} />
                              350 ETB Guaranteed - Zero Detour Surge
                           </p>
                        </div>
                     </div>

                     {/* Tracking Info Area */}
                     <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        {/* Animated Progress Bar */}
                        <div className="flex items-center justify-between mb-4 relative">
                           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                           <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-orange-500 dark:bg-orange-600 -z-10"></div>
                           
                           <div className="flex flex-col items-center gap-1 bg-white dark:bg-slate-900 px-1">
                              <div className="w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-600 flex items-center justify-center text-[8px] text-white font-bold">1</div>
                              <span className="text-[9px] font-bold text-slate-900 dark:text-white">Request</span>
                           </div>
                           <div className="flex flex-col items-center gap-1 bg-white dark:bg-slate-900 px-1">
                              <div className="w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-600 flex items-center justify-center text-[8px] text-white font-bold">
                                 <span className="animate-ping absolute w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-600 opacity-50"></span>
                                 2
                              </div>
                              <span className="text-[9px] font-bold text-orange-600 dark:text-orange-500">En Route</span>
                           </div>
                           <div className="flex flex-col items-center gap-1 bg-white dark:bg-slate-900 px-1">
                              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] text-slate-500">3</div>
                              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Arrive</span>
                           </div>
                        </div>

                        {/* Driver Info Mini */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                 <UserCircle size={24} className="text-slate-400" />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-900 dark:text-white">Dawit M.</p>
                                 <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    4.9 <Star size={10} className="fill-orange-400 text-orange-400" /> • Toyota Vitz
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full inline-block mb-1">Arriving in 3 min</p>
                              <p className="text-[10px] text-slate-900 dark:text-white font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">B23445</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Drive with Us Section */}
      <section className="py-24 px-6 md:px-12 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-6">Drive with Dream More</h2>
             <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
               Join our fleet and take control of your earnings. We offer the most driver-friendly platform in the market.
             </p>
             <ul className="space-y-4 mb-8">
               <li className="flex items-center gap-3 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"><ShieldCheck className="text-orange-600 dark:text-orange-500" size={20}/> Fair commission rates</li>
               <li className="flex items-center gap-3 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"><MapPin className="text-orange-600 dark:text-orange-500" size={20}/> Route preview before acceptance</li>
               <li className="flex items-center gap-3 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"><Zap className="text-orange-600 dark:text-orange-500" size={20}/> Detour & fare protection</li>
               <li className="flex items-center gap-3 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"><Clock className="text-orange-600 dark:text-orange-500" size={20}/> Instant payouts</li>
             </ul>
             <Link href="/driver-register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 dark:bg-orange-600 px-8 py-4 text-base font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 dark:bg-orange-600-hover transition-all">
               Register as a Driver <ArrowRight size={20} />
             </Link>
          </div>
          <div className="w-full md:w-1/2">
             <div className="relative rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-2xl flex flex-col gap-4 max-w-sm mx-auto group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl"></div>
                
                {/* Driver Incoming Request Card */}
                <div className="relative z-10 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
                   
                   {/* Top Header */}
                   <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                         </span>
                         <span className="text-xs font-bold text-green-600 dark:text-green-400">New Request Nearby - Bahir Dar</span>
                      </div>
                      <p className="text-xl font-black text-slate-900 dark:text-white">250 ETB</p>
                   </div>
                   
                   {/* Route Snippet */}
                   <div className="relative pl-6 space-y-4 mb-6">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                      
                      <div className="relative">
                         <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 z-10"></div>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Pickup</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">BDU Poly Campus</p>
                      </div>
                      
                      <div className="relative">
                         <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-none bg-black dark:bg-white border-2 border-white dark:border-slate-900 z-10"></div>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Drop-off</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">Papyrus Hotel</p>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            <Navigation size={12} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">2.8 km</span>
                         </div>
                         <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            <Clock size={12} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">~7 mins</span>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-gray-800 bg-gray-900 text-gray-300 py-12 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-1 rounded-md">
                <Zap size={16} className="text-white fill-current" />
              </div>
              <span className="text-lg font-bold text-white">Dream More</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Transforming the way you move. Reliable, secure, and modern transportation at your fingertips.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/register" className="hover:text-orange-500 transition-colors">Passenger App</Link></li>
              <li><Link href="/admin" className="hover:text-orange-500 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Drivers</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/driver-register" className="hover:text-orange-500 transition-colors">Driver Registration</Link></li>
              <li><Link href="/login" className="hover:text-orange-500 transition-colors">Driver Portal Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Connect</h4>
            <div className="flex gap-4 text-sm font-medium">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-800 text-xs text-gray-500 gap-4">
          <p>© 2026 Dream More TMS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
