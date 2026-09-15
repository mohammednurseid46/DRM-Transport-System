"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Circle, 
  Car, 
  Zap, 
  ShieldCheck,
  Plus,
  Minus,
  Navigation,
  User,
  Loader2,
  CheckCircle2,
  Split
} from "lucide-react";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/admin/MapClient"), {
  ssr: false,
});

export default function PassengerDashboardPage() {
  const [rideType, setRideType] = useState<"PRIVATE" | "SHARED">("PRIVATE");

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full">
      {/* Left Booking Sidebar */}
      <aside className="md:col-span-5 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-y-auto custom-scrollbar z-10 max-h-[calc(100vh-100px)]">
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-6">Where are you going?</h2>
          
          {/* Location Inputs */}
          <div className="space-y-4 mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-orange-600 dark:text-orange-500" />
              </div>
              <input 
                type="text" 
                className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-control pl-10 pr-3 py-3 focus:outline-none focus:border-orange-500/50 transition-colors placeholder-slate-500"
                placeholder="Current Location / Landmark"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Circle size={14} className="text-slate-500 dark:text-slate-400" />
              </div>
              <input 
                type="text" 
                className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-control pl-10 pr-3 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-500"
                placeholder="Where to? / Drop-off Landmark"
              />
            </div>
          </div>

          {/* Service Mode */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">Service Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setRideType("PRIVATE")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${rideType === "PRIVATE" ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-500' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}
              >
                <Car size={24} className="mb-1" />
                <span className="text-xs font-bold">Private Ride</span>
              </button>
              <button 
                onClick={() => setRideType("SHARED")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${rideType === "SHARED" ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-500' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}
              >
                <Split size={24} className="mb-1" />
                <span className="text-xs font-bold">Shared Ride</span>
                <span className="text-[9px] uppercase tracking-wider text-green-500 mt-1">Split Cost</span>
              </button>
            </div>
          </div>

          {/* Ride Tiers */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">Select Ride Tier</h3>
            <div className="space-y-3">
              {/* Economy */}
              <div className="flex items-center justify-between p-3 rounded-card bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-200 dark:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-md">
                    <Car size={18} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Economy</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">4 min away</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">180.00 ETB</div>
              </div>

              {/* Comfort */}
              <div className="flex items-center justify-between p-3 rounded-card bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-200 dark:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-md">
                    <Car size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Comfort</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">6 min away</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">280.00 ETB</div>
              </div>

              {/* Premium (Selected) */}
              <div className="flex items-center justify-between p-3 rounded-card bg-slate-100 dark:bg-slate-900 border border-dms-primary shadow-[0_0_10px_rgba(229,112,54,0.15)] cursor-pointer relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 dark:bg-orange-600"></div>
                <div className="flex items-center gap-3 pl-1">
                  <div className="bg-orange-500 dark:bg-orange-600/20 p-2 rounded-md">
                    <Car size={18} className="text-orange-600 dark:text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-orange-600 dark:text-orange-500">Premium</div>
                    <div className="text-[10px] text-orange-400/80">2 min away • Executive</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-orange-600 dark:text-orange-500">400.00 ETB</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
            18 drivers available near you
          </div>

          <Link 
            href="/passenger/book"
            className="w-full font-bold py-3.5 rounded-control flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20 bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-white mt-4"
          >
            <Zap size={16} className="fill-current" />
            Book a Ride
          </Link>
        </div>

        {/* Safety Protocol Banner */}
        <div className="p-6 pt-0 mt-auto">
          <div className="flex items-center gap-3 p-4 rounded-card bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <ShieldCheck size={20} className="text-orange-600 dark:text-orange-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Locked Fare Protocol</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Zero Surge Pricing. Pay what you see.</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Map Area */}
      <div className="md:col-span-7 bg-slate-900 relative overflow-hidden hidden md:block">
        <MapClient 
          activeTrips={[]}
          sosEvents={[]}
          pendingRequests={[]}
          idleDrivers={[
            { id: "idle1", driver: { name: "Abebe" }, currentLocation: [11.5936, 37.3908], status: "available" },
            { id: "idle2", driver: { name: "Bekele" }, currentLocation: [11.5980, 37.3980], status: "available" },
            { id: "idle3", driver: { name: "Dawit" }, currentLocation: [11.6020, 37.4100], status: "available" }
          ]}
          filter="IDLE"
          onMarkerClick={() => {}}
          getCoords={() => [0,0]}
        />
        
        {/* Location Badge */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="bg-white dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-control px-4 py-2 flex items-center gap-2 shadow-lg pointer-events-auto">
            <MapPin size={14} className="text-orange-600 dark:text-orange-500" />
            <span className="text-xs font-bold tracking-widest text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white uppercase">BAHIR DAR, ET</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
