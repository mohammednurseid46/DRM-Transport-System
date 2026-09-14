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
import { api } from "@/lib/api";
import { resolveSosAction } from "@/actions/sos";

export default function AdminDashboardPage() {
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [sosEvents, setSosEvents] = useState<any[]>([]);
  const [dispatchEvents, setDispatchEvents] = useState<DispatchEvent[]>([]);
  
  // KPI States
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeSOSCount, setActiveSOSCount] = useState(0);
  const [onlineFleetCount, setOnlineFleetCount] = useState(0);
  const [todaysGross, setTodaysGross] = useState(0);

  // Poll API for live updates
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.get('/admin/dashboard');

        // 1. Update KPIs
        setActiveCount(data.stats.activeRidesCount);
        setPendingCount(data.stats.pendingRequestsCount);
        setOnlineFleetCount(data.stats.onlineFleetCount);
        setTodaysGross(data.stats.todaysGross);
        setActiveSOSCount(data.stats.activeSOSCount);

        // 2. Map Active Rides for Map (Needs specific structure)
        const mappedActive = (data.feed.activeRides || []).map((ride: any) => ({
          rideId: ride.ride_id,
          status: ride.status.toLowerCase(),
          passengerName: ride.passengers?.[0]?.passenger?.full_name || 'Unknown',
          pickupLandmark: ride.pickup_landmark,
          dropoffLandmark: ride.dropoff_landmark,
          driver: ride.driver ? { name: ride.driver.user.full_name } : null,
          timestamp: ride.created_at
        }));
        setActiveRides(mappedActive);

        // 3. Map SOS Events for Map
        const mappedSos = (data.feed.sosAlerts || []).map((sos: any) => ({
          id: sos.alert_id,
          rideId: sos.ride_id,
          status: sos.status.toLowerCase(),
          timestamp: sos.created_at,
          triggeredBy: sos.triggered_by,
          name: "User", // Can be extended to fetch user name
          latitude: sos.latitude,
          longitude: sos.longitude
        }));
        setSosEvents(mappedSos);

        // 4. Generate Dispatch Feed Events
        let newEvents: DispatchEvent[] = [];
        
        // Active rides
        mappedActive.forEach((ride: any) => {
          newEvents.push({
            id: `evt-act-${ride.rideId}-${ride.status}`,
            timestamp: ride.timestamp,
            type: ride.status === 'pending' ? 'BOOKING' : 'ACCEPTED',
            message: ride.status === 'pending' 
              ? `Passenger ${ride.passengerName?.split(' ')[0] || ''} requested a ride: ${ride.pickupLandmark || 'Location'} ➔ ${ride.dropoffLandmark || 'Location'}`
              : `Driver ${ride.driver?.name?.split(' ')[0] || ''} accepted Ride ${ride.rideId?.substring(0, 8)}`
          });
        });

        // Completed rides
        (data.feed.completedRides || []).slice(0, 5).forEach((ride: any) => {
          newEvents.push({
            id: `evt-hist-${ride.ride_id}`,
            timestamp: ride.created_at,
            type: 'COMPLETED',
            message: `Trip ${ride.ride_id?.substring(0, 8) || ''} completed. Fare: ${ride.final_fare || ride.base_fare || 0} ETB.`
          });
        });

        // SOS alerts
        mappedSos.forEach((sos: any) => {
          newEvents.push({
            id: `evt-sos-${sos.id}`,
            timestamp: sos.timestamp,
            type: 'SOS',
            message: `CRITICAL: SOS Triggered for Ride ${sos.rideId.substring(0,8)}`
          });
        });

        // Sort by timestamp descending
        newEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setDispatchEvents(newEvents);
        
      } catch (err) {
        console.error("Failed to sync admin dashboard data", err);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 3000);
    return () => clearInterval(interval);
  }, []);

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
          onDismiss={async () => {
            const activeSos = sosEvents.find(s => s.status === 'active');
            if (activeSos) {
              // Optimistic update to close modal instantly
              setSosEvents(prev => prev.map(s => s.id === activeSos.id ? { ...s, status: 'resolved' } : s));
              setActiveSOSCount(prev => Math.max(0, prev - 1));
              
              // Call backend
              await resolveSosAction(activeSos.id);
            }
          }}
          onDispatch={async () => {
            const activeSos = sosEvents.find(s => s.status === 'active');
            if (activeSos) {
              alert("Authorities dispatched to location: " + activeSos.latitude + ", " + activeSos.longitude);
              // Optimistic update to close modal instantly
              setSosEvents(prev => prev.map(s => s.id === activeSos.id ? { ...s, status: 'resolved' } : s));
              setActiveSOSCount(prev => Math.max(0, prev - 1));
              
              // Call backend
              await resolveSosAction(activeSos.id);
            }
          }}
        />
      )}

    </div>
  );
}
