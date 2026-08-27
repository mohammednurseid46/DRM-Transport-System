"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Phone,
  MessageSquare,
  AlertTriangle,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Car,
  X
} from "lucide-react";

export default function DriverActiveRidePage() {
  const router = useRouter();
  const [ride, setRide] = useState<any>(null);
  const [showSOS, setShowSOS] = useState(false);

  useEffect(() => {
    const active = localStorage.getItem("driverActiveRide");
    if (active) {
      setRide(JSON.parse(active));
    } else {
      router.push("/driver/dashboard");
    }
  }, [router]);

  const updateRideStatus = (newStatus: string) => {
    const updated = { ...ride, status: newStatus };
    setRide(updated);
    // Update local storage so passenger side reacts
    localStorage.setItem("activeRides", JSON.stringify(updated));
    localStorage.setItem("driverActiveRide", JSON.stringify(updated));

    if (newStatus === "completed") {
      // Simulate finishing ride
      setTimeout(() => {
        localStorage.removeItem("activeRides");
        localStorage.removeItem("driverActiveRide");
        router.push("/driver/dashboard");
      }, 2000);
    }
  };

  const handleActionClick = () => {
    if (ride.status === "accepted" || ride.status === "en_route") {
      updateRideStatus("arrived");
    } else if (ride.status === "arrived") {
      updateRideStatus("in_progress");
    } else if (ride.status === "in_progress") {
      updateRideStatus("completed");
    }
  };

  if (!ride) return <div className="flex h-full items-center justify-center text-slate-500">Loading trip...</div>;

  const getActionText = () => {
    switch (ride.status) {
      case "accepted":
      case "en_route": return "ARRIVED AT PICKUP";
      case "arrived": return "START TRIP";
      case "in_progress": return "COMPLETE TRIP";
      case "completed": return "FINISHING...";
      default: return "ACTION";
    }
  };

  const getStatusText = () => {
    switch (ride.status) {
      case "accepted":
      case "en_route": return "Driving to pickup";
      case "arrived": return "Waiting for passenger";
      case "in_progress": return "On trip to destination";
      case "completed": return "Trip completed";
      default: return "Unknown state";
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans relative">
      
      {/* Map Background (Mock) */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230f172a\'/%3E%3Cpath d=\'M0 50h100M50 0v100\' stroke=\'%23334155\' stroke-width=\'1\'/%3E%3Cpath d=\'M20 0v100M80 0v100M0 20h100M0 80h100\' stroke=\'%231e293b\' stroke-width=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px'
      }}></div>
      
      {/* Dynamic Route SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full max-w-lg" viewBox="0 0 400 400">
          <path d="M 100 300 Q 200 200 300 100" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" opacity="0.6"/>
          
          {(ride.status === "in_progress") && (
            <path d="M 100 300 Q 200 200 300 100" fill="none" stroke="#E57036" strokeWidth="6" className="drop-shadow-[0_0_8px_rgba(229,112,54,0.8)]" />
          )}

          {/* Pickup */}
          <circle cx="100" cy="300" r="8" fill="#10b981" />
          {/* Destination */}
          <circle cx="300" cy="100" r="8" fill="#ef4444" />
          
          {/* Car Marker */}
          <g className={`transition-all duration-1000 ${
            (ride.status === "accepted" || ride.status === "en_route") ? "translate-x-[20px] translate-y-[350px]" : 
            ride.status === "arrived" ? "translate-x-[100px] translate-y-[300px]" : 
            ride.status === "in_progress" ? "translate-x-[200px] translate-y-[200px]" : 
            "translate-x-[300px] translate-y-[100px]"
          }`}>
            <circle cx="0" cy="0" r="10" fill="#3b82f6" className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          </g>
        </svg>
      </div>

      {/* Top Bar Navigation Info */}
      <div className="absolute top-6 left-0 w-full px-6 z-10">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/20 text-orange-500 p-3 rounded-full">
              <Navigation size={24} className="fill-current rotate-45" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-0.5">
                {(ride.status === "accepted" || ride.status === "en_route" || ride.status === "arrived") 
                  ? ride.pickupLandmark 
                  : ride.dropoffLandmark}
              </div>
              <div className="text-sm font-medium text-slate-400">{getStatusText()}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">4 min</div>
            <div className="text-sm text-slate-400 font-bold">1.2 km</div>
          </div>
        </div>
      </div>

      {/* SOS Button */}
      <div className="absolute top-32 right-6 z-10">
        <button 
          onClick={() => setShowSOS(true)}
          className="bg-red-500 hover:bg-red-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white p-4 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform hover:scale-105"
        >
          <AlertTriangle size={24} />
        </button>
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <div className="bg-slate-800 rounded-t-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-slate-700 max-w-4xl mx-auto flex flex-col gap-6">
          
          {/* Passenger Info & Privacy Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">
                {ride.passengerName ? ride.passengerName.charAt(0) : "P"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-1">{ride.passengerName}</h3>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-700 w-fit">
                  <ShieldCheck size={14} className="text-green-500" />
                  {ride.passengerPhoneMasked}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white p-3.5 rounded-full transition-colors">
                <MessageSquare size={20} />
              </button>
              {/* Masked Call Button */}
              <button className="bg-green-500 hover:bg-green-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white p-3.5 rounded-full shadow-lg shadow-green-500/20 transition-colors flex items-center justify-center relative group">
                <Phone size={20} />
                <span className="absolute -top-8 right-0 bg-slate-900 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Anonymous Call
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-700"></div>

          {/* Fare Info */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Expected Fare</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{ride.fare.toFixed(2)} ETB</div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleActionClick}
            disabled={ride.status === "completed"}
            className={`w-full py-4 rounded-xl font-bold tracking-wider flex items-center justify-center gap-2 transition-colors ${
              ride.status === "completed" ? 'bg-green-500 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-orange-500 hover:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-lg shadow-orange-500/20'
            }`}
          >
            {ride.status === "completed" ? <CheckCircle2 size={24} /> : null}
            {getActionText()}
          </button>
          
        </div>
      </div>

      {/* SOS Modal */}
      {showSOS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center border-2 border-red-500/50">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">Emergency SOS</h2>
            <p className="text-sm text-slate-400 mb-6">
              This will instantly alert authorities and our admin team with your live location.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { 
                  const currentUser = JSON.parse(localStorage.getItem("dms_current_user") || "{}");
                  const sosData = {
                    id: `SOS-${Math.floor(Math.random() * 100000)}`,
                    rideId: ride.rideId,
                    triggeredByUserId: currentUser.id || "unknown",
                    triggeredBy: `Driver: ${ride.driver?.name || "Unknown"}`,
                    role: "driver",
                    phone: currentUser.phone || "Unknown",
                    plateNumber: ride.driver?.plate || "Unknown",
                    location: ride.pickupLandmark || "Unknown Route",
                    landmark: ride.pickupLandmark,
                    userRole: "driver",
                    timestamp: new Date().toISOString(),
                    status: "active"
                  };
                  
                  const existing = JSON.parse(localStorage.getItem("emergencySOS") || "[]");
                  const updated = Array.isArray(existing) ? [sosData, ...existing] : [sosData];
                  
                  localStorage.setItem("emergencySOS", JSON.stringify(updated));
                  window.dispatchEvent(new Event("storage"));
                  window.dispatchEvent(new Event("sos-updated"));
                  alert("SOS Triggered"); 
                  setShowSOS(false); 
                }}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-xl transition-colors"
              >
                TRIGGER SOS
              </button>
              <button 
                onClick={() => setShowSOS(false)} 
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
