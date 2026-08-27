"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  User, 
  AlertOctagon, 
  Circle,
  Activity,
  DollarSign
} from "lucide-react";
import AdminLiveMap from "@/components/admin/AdminLiveMap";
import AdminDispatchFeed, { DispatchEvent } from "@/components/admin/AdminDispatchFeed";
import AdminSOSModal from "@/components/admin/AdminSOSModal";

export default function AdminDashboardPage() {
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [passengerRides, setPassengerRides] = useState<any[]>([]);
  const [sosEvents, setSosEvents] = useState<any[]>([]);
  const [dispatchEvents, setDispatchEvents] = useState<DispatchEvent[]>([]);
  const [activeSOSCount, setActiveSOSCount] = useState(0);
  const [onlineFleetCount, setOnlineFleetCount] = useState(0);

  // Poll local storage for live updates
  useEffect(() => {
    const syncData = () => {
      // 1. Active Rides
      const active = localStorage.getItem("activeRides");
      if (active) {
        const parsed = JSON.parse(active);
        // We expect activeRides in localStorage to be either an array or a single object (since our mock currently uses a single object)
        const activeArray = Array.isArray(parsed) ? parsed : [parsed];
        setActiveRides(activeArray);
      } else {
        setActiveRides([]);
      }

      // 2. Passenger Rides (Completed History)
      const history = localStorage.getItem("passengerRides");
      if (history) {
        setPassengerRides(JSON.parse(history));
      }

      // 3. SOS
      const sos = localStorage.getItem("emergencySOS");
      let currentSosEvents: any[] = [];
      if (sos) {
        const parsedSos = JSON.parse(sos);
        currentSosEvents = Array.isArray(parsedSos) ? parsedSos : [parsedSos];
        setSosEvents(currentSosEvents);
        setActiveSOSCount(currentSosEvents.filter(s => s.status === 'active').length);
      } else {
        setSosEvents([]);
        setActiveSOSCount(0);
      }

      // 4. Online Fleet
      const users = localStorage.getItem("dms_users");
      if (users) {
        const parsedUsers = JSON.parse(users);
        const onlineDrivers = parsedUsers.filter((u: any) => u.role === 'driver' && u.is_verified && u.isAvailable);
        setOnlineFleetCount(onlineDrivers.length);
      } else {
        setOnlineFleetCount(0);
      }
    };

    // Initial sync
    syncData();

    // Set intervals and listeners
    const interval = setInterval(syncData, 1000);
    window.addEventListener("storage", syncData);
    window.addEventListener("sos-updated", syncData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncData);
      window.removeEventListener("sos-updated", syncData);
    };
  }, []);

  // Generate mock feed events dynamically based on active and completed rides
  useEffect(() => {
    let newEvents: DispatchEvent[] = [];
    
    // Add active rides
    activeRides.forEach(ride => {
      newEvents.push({
        id: `evt-act-${ride.rideId}-${ride.status}`,
        timestamp: ride.timestamp || new Date().toISOString(),
        type: ride.status === 'pending' ? 'BOOKING' : 'ACCEPTED',
        message: ride.status === 'pending' 
          ? `Passenger ${ride.passengerName?.split(' ')[0] || ''} requested a ride: ${ride.pickupLandmark || 'Location'} ➔ ${ride.dropoffLandmark || 'Location'}`
          : `Driver ${ride.driver?.name?.split(' ')[0] || ''} accepted Ride ${ride.rideId?.substring(0, 8)}`
      });
    });

    // Add completed rides
    passengerRides.slice(0, 5).forEach(ride => {
      newEvents.push({
        id: `evt-hist-${ride.rideId}`,
        timestamp: ride.completedAt || new Date().toISOString(),
        type: 'COMPLETED',
        message: `Trip ${ride.rideId?.substring(0, 8) || ''} completed. Fare: ${ride.fare} ETB.`
      });
    });

    // Add SOS events
    sosEvents.forEach(sos => {
      newEvents.push({
        id: `evt-sos-${sos.timestamp}`,
        timestamp: sos.timestamp,
        type: 'SOS',
        message: `CRITICAL: SOS Triggered by ${sos.triggeredBy} (${sos.name})`
      });
    });

    // Sort by timestamp descending
    newEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setDispatchEvents(newEvents);
  }, [activeRides, passengerRides, sosEvents]);

  // KPI Calculations
  const activeCount = activeRides.filter(r => ['accepted', 'en_route', 'arrived', 'in_progress'].includes(r.status)).length;
  const pendingCount = activeRides.filter(r => r.status === 'pending').length;
  
  // Calculate today's gross from passengerRides
  const today = new Date().toDateString();
  const todaysGross = passengerRides
    .filter(r => r.completedAt && new Date(r.completedAt).toDateString() === today)
    .reduce((sum, r) => sum + (r.fare || 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-orange-500" />
            Live Operations Center
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider">SYNCED</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 shrink-0">
        {/* Active Trips */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-5 opacity-20">
            <TrendingUp size={48} className="text-orange-500" />
          </div>
          <div className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Active Trips</div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white leading-none">{activeCount}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">{pendingCount} Pending Requests</span>
          </div>
        </div>

        {/* Online Fleet */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-5 opacity-20">
            <User size={48} className="text-green-500" />
          </div>
          <div className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Online Fleet</div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white leading-none">{onlineFleetCount}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">Verified Drivers Active</span>
          </div>
        </div>

        {/* Today's Gross */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-5 opacity-20">
            <DollarSign size={48} className="text-blue-500" />
          </div>
          <div className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Today's Gross</div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white leading-none">{todaysGross.toLocaleString()} <span className="text-sm">ETB</span></span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">100% Upfront Pricing</span>
          </div>
        </div>

        {/* Safety Monitor */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden shadow-sm transition-all ${activeSOSCount > 0 ? 'bg-red-50 dark:bg-red-950/30 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'}`}>
          <div className="absolute top-0 right-0 p-5 opacity-20">
            <AlertOctagon size={48} className={activeSOSCount > 0 ? "text-red-500 animate-pulse" : "text-green-500"} />
          </div>
          <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${activeSOSCount > 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>Safety Monitor</div>
          <div className="flex flex-col">
            <span className={`text-xl font-black leading-tight ${activeSOSCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white'}`}>
              {activeSOSCount > 0 ? `${activeSOSCount} ACTIVE SOS ${activeSOSCount === 1 ? 'ALERT' : 'ALERTS'}` : 'Normal'}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">0 Detour Deviations</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Feed */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Live Map Area */}
        <div className="flex-[2] min-h-0 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 flex flex-col relative">
          <AdminLiveMap activeRides={activeRides} sosEvents={sosEvents} />
        </div>

        {/* Live Dispatch Feed */}
        <div className="flex-[1] min-h-0 lg:w-96 flex flex-col">
          <AdminDispatchFeed events={dispatchEvents} />
        </div>
      </div>

      {/* SOS Flashing Modal */}
      {activeSOSCount > 0 && (
        <AdminSOSModal 
          sosData={sosEvents.find(s => s.status === 'active')} 
          onDismiss={() => {
            const updated = sosEvents.map(s => 
              s.status === 'active' ? { ...s, status: 'resolved' as const } : s
            );
            localStorage.setItem("emergencySOS", JSON.stringify(updated));
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("sos-updated"));
          }} 
        />
      )}

    </div>
  );
}
