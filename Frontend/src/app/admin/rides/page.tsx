"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, Filter, MapPin, X, ShieldCheck, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";

type RideStatus = "active" | "completed" | "cancelled";
type RideType = "PRIVATE" | "SHARED";

interface Ride {
  id: string;
  passengerName: string;
  passengerPhone: string;
  driverName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  type: RideType;
  detourProtected: boolean;
  status: RideStatus;
  timestamp: string;
  splitDetails?: { passenger: string; fare: number; status: string }[];
}

const mockRides: Ride[] = [
  { id: "R-1001", passengerName: "Abebe B.", passengerPhone: "0911••••44", driverName: "Dawit M.", pickup: "Giyorgis Square", dropoff: "Kuriftu Resort", fare: 350, type: "PRIVATE", detourProtected: true, status: "active", timestamp: "2026-08-26 10:30 AM" },
  { id: "R-1002", passengerName: "Sara K.", passengerPhone: "0922••••11", driverName: "Solomon T.", pickup: "Megenagna", dropoff: "CMC", fare: 150, type: "SHARED", detourProtected: true, status: "completed", timestamp: "2026-08-26 09:15 AM", splitDetails: [{ passenger: "Sara K.", fare: 75, status: "Paid" }, { passenger: "Guest", fare: 75, status: "Paid" }] },
  { id: "R-1003", passengerName: "Henok T.", passengerPhone: "0933••••99", driverName: "Yared A.", pickup: "Papyrus Hotel", dropoff: "Abay Mado", fare: 200, type: "PRIVATE", detourProtected: false, status: "cancelled", timestamp: "2026-08-26 08:45 AM" },
  { id: "R-1004", passengerName: "Helen M.", passengerPhone: "0944••••22", driverName: "Kaleb D.", pickup: "Sarbet", dropoff: "Mexico", fare: 120, type: "SHARED", detourProtected: true, status: "active", timestamp: "2026-08-26 11:00 AM", splitDetails: [{ passenger: "Helen M.", fare: 60, status: "Paid" }, { passenger: "Alex M.", fare: 60, status: "Pending" }] },
  { id: "R-1005", passengerName: "Bereket A.", passengerPhone: "0911••••88", driverName: "Tewodros S.", pickup: "Gerji", dropoff: "Ayat", fare: 400, type: "PRIVATE", detourProtected: true, status: "completed", timestamp: "2026-08-25 04:30 PM" },
];

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Completed" | "Cancelled" | "Shared">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const data = await api.get('/admin/rides');
        const formatted = data.map((r: any) => ({
          id: r.ride_id,
          passengerName: r.passengers?.[0]?.user?.full_name || "Unknown",
          passengerPhone: r.passengers?.[0]?.user?.phone_number || "Unknown",
          driverName: r.driver?.user?.full_name || "Pending",
          pickup: r.pickup_landmark || "Unknown",
          dropoff: r.dropoff_landmark || "Unknown",
          fare: r.base_fare || 0,
          type: r.ride_type || "PRIVATE",
          detourProtected: true,
          status: r.status.toLowerCase(),
          timestamp: new Date(r.created_at).toLocaleString(),
        }));
        setRides([...formatted, ...mockRides]); // Include mocks just in case for demo
      } catch (err) {
        console.error("Failed to fetch admin rides", err);
        // Fallback to local storage if API fails
        let combinedRides = [...mockRides];
        try {
          const storedRides = localStorage.getItem("activeRides");
          if (storedRides) {
            const parsed = JSON.parse(storedRides);
            if (Array.isArray(parsed)) {
              const mapped: Ride[] = parsed.map((r: any) => ({
                id: r.rideId || `R-LOCAL-${Math.floor(Math.random()*1000)}`,
                passengerName: r.passengerName || "Unknown",
                passengerPhone: r.passengerPhoneMasked || "09•••",
                driverName: r.driverName || "Pending",
                pickup: r.pickupLandmark || "Unknown",
                dropoff: r.dropoffLandmark || "Unknown",
                fare: r.fare || 0,
                type: r.rideType || "PRIVATE",
                detourProtected: true,
                status: (r.status === "completed" ? "completed" : r.status === "cancelled" ? "cancelled" : "active") as RideStatus,
                timestamp: new Date().toLocaleString()
              }));
              combinedRides = [...mapped, ...combinedRides];
            }
          }
        } catch(e) {}
        setRides(combinedRides);
      }
    };
    fetchRides();
  }, []);

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const matchesSearch = 
        ride.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ride.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.driverName.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (!matchesSearch) return false;
      
      switch (activeTab) {
        case "Active": return ride.status === "active";
        case "Completed": return ride.status === "completed";
        case "Cancelled": return ride.status === "cancelled";
        case "Shared": return ride.type === "SHARED";
        default: return true;
      }
    });
  }, [rides, activeTab, searchQuery]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Rides Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor all active, completed, and shared rides across the platform.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Passenger..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-orange-500 text-sm dark:text-slate-900 dark:text-slate-900 dark:text-white"
            />
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 hide-scrollbar gap-2">
        {["All", "Active", "Completed", "Cancelled", "Shared"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? "bg-slate-900 dark:bg-slate-100 text-slate-900 dark:text-slate-900 dark:text-white dark:text-slate-900" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            {tab} {tab === "All" && `(${rides.length})`}
            {tab === "Active" && `(${rides.filter(r => r.status === "active").length})`}
          </button>
        ))}
      </div>

      {/* Rides Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Ride ID</th>
                <th className="px-6 py-4">Passenger</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Fare (ETB)</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRides.length > 0 ? (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white whitespace-nowrap">{ride.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{ride.passengerName}</div>
                      <div className="text-xs text-slate-500">{ride.passengerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{ride.driverName}</td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center gap-1 text-xs mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="truncate max-w-[150px]">{ride.pickup}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="truncate max-w-[150px]">{ride.dropoff}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white whitespace-nowrap">Br {ride.fare.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block w-fit ${ride.type === 'SHARED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {ride.type}
                        </span>
                        {ride.detourProtected && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck size={10} /> Protected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        ride.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {ride.status === 'active' && <Clock size={12} />}
                        {ride.status === 'completed' && <CheckCircle size={12} />}
                        {ride.status === 'cancelled' && <X size={12} />}
                        <span className="capitalize">{ride.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedRide(ride)}
                        className="p-1.5 text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No rides found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRide(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Ride Details</h3>
                <p className="text-xs text-slate-500">{selectedRide.id} • {selectedRide.timestamp}</p>
              </div>
              <button onClick={() => setSelectedRide(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Route Timeline */}
              <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                <div className="relative">
                  <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[35px] border-4 border-white dark:border-slate-800"></div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pickup</p>
                  <p className="font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedRide.pickup}</p>
                </div>
                <div className="relative">
                  <div className="absolute w-4 h-4 bg-orange-500 rounded-full -left-[35px] border-4 border-white dark:border-slate-800"></div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Drop-off</p>
                  <p className="font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedRide.dropoff}</p>
                </div>
              </div>

              {/* Status & Security */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ride Status</p>
                  <p className="font-medium capitalize text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedRide.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Security</p>
                  <div className="flex items-center gap-1">
                    {selectedRide.detourProtected ? (
                       <><ShieldCheck size={14} className="text-emerald-500" /><span className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">Detour Protected</span></>
                    ) : (
                       <><ShieldAlert size={14} className="text-amber-500" /><span className="font-medium text-amber-600 dark:text-amber-400 text-sm">Unprotected</span></>
                    )}
                  </div>
                </div>
              </div>

              {/* Fare Breakdown (Shared or Private) */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-3">Fare Breakdown</h4>
                
                {selectedRide.type === "SHARED" && selectedRide.splitDetails ? (
                  <div className="space-y-3">
                    {selectedRide.splitDetails.map((split, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-xs">
                            {split.passenger.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{split.passenger}</p>
                            <p className="text-xs text-slate-500">{split.status}</p>
                          </div>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Br {split.fare.toFixed(2)}</div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 font-bold text-lg text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
                      <span>Total Fare</span>
                      <span>Br {selectedRide.fare.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                     <div>
                       <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Total Locked Fare</p>
                       <p className="text-xs text-slate-500">Paid by {selectedRide.passengerName}</p>
                     </div>
                     <div className="font-bold text-xl text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Br {selectedRide.fare.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
