"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  Car, 
  CheckCircle2, 
  Banknote, 
  Clock, 
  MapPin, 
  Navigation,
  Plus,
  Minus,
  AlertCircle,
  X,
  Target,
  ShieldCheck,
  Star,
  BellRing,
  XCircle,
  CheckCircle
} from "lucide-react";
import { api } from "@/lib/api";

export default function DriverDashboardHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio API not supported or blocked", e);
    }
  };

  useEffect(() => {
    if (!isOnline) {
      setIncomingRide(null);
      return;
    }

    const checkIncomingRides = async () => {
      try {
        const rides = await api.get('/rides/pending');
        if (rides && rides.length > 0) {
          const firstRide = rides[0];
          setIncomingRide((prev: any) => {
            if (!prev || prev.ride_id !== firstRide.ride_id) {
              return firstRide;
            }
            return prev;
          });
        } else {
          setIncomingRide(null);
        }
      } catch (err) {
        console.error("Error checking for rides:", err);
      }
    };

    const interval = setInterval(checkIncomingRides, 3000);
    
    return () => clearInterval(interval);
  }, [isOnline]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (incomingRide) {
      setTimeLeft(30);
      playBeep();
      
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleDeclineRide(incomingRide);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [incomingRide?.ride_id]);

  const handleAcceptRide = async () => {
    if (!incomingRide) return;
    try {
      await api.patch(`/rides/${incomingRide.ride_id}/status`, {
        status: 'ACCEPTED',
        driver_id: user?.driver?.driver_id || 'dummy_driver_id'
      });
      // Set to local storage so the active-ride page can pick it up
      localStorage.setItem("driverActiveRideId", incomingRide.ride_id);
      setIncomingRide(null);
      router.push("/driver/active-ride");
    } catch (err) {
      console.error("Failed to accept ride", err);
    }
  };

  const handleDeclineRide = (rideObj?: any) => {
    // In a real app we would mark it declined by this driver so it routes to another
    setIncomingRide(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans">
      
      {/* Left Sidebar Panel */}
      <aside className="w-full md:w-[320px] lg:w-[380px] shrink-0 bg-[#2B3542] flex flex-col border-r border-slate-200 dark:border-slate-700 relative z-10 shadow-xl overflow-y-auto custom-scrollbar">
        
        {/* Driver Profile Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-transparent border border-[#E57036] flex items-center justify-center text-[#E57036] font-bold text-xl tracking-wider">
              BT
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white leading-none mb-1">Bekele Tadesse</h2>
              <div className="flex items-center gap-1 text-sm text-[#E57036] font-medium">
                <span>★</span> 4.9 Rating
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Car size={14} className="text-slate-500 dark:text-slate-500" />
            Toyota Corolla — Silver, AA-12345
          </div>
        </div>

        {/* Online Status Toggle Section */}
        <div className="p-6 flex flex-col items-center text-center border-b border-slate-200 dark:border-slate-700 bg-[#262F3C]/50">
          <button 
            onClick={() => {
              if (user && !user.is_verified) {
                alert("You cannot go online because your account is pending verification.");
                return;
              }
              const newStatus = !isOnline;
              setIsOnline(newStatus);
              
              if (user) {
                const users = JSON.parse(localStorage.getItem("dms_users") || "[]");
                const updatedUsers = users.map((u: any) => 
                  u.id === user.id ? { ...u, isAvailable: newStatus } : u
                );
                localStorage.setItem("dms_users", JSON.stringify(updatedUsers));
                window.dispatchEvent(new Event("storage"));
              }
            }}
            className={`relative w-[60px] h-8 rounded-full transition-colors duration-300 mb-4 flex items-center px-1 ${
              isOnline ? "bg-[#E57036]" : "bg-gray-600"
            } ${user && !user.is_verified ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div 
              className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                isOnline ? "translate-x-[26px]" : "translate-x-0"
              }`}
            />
          </button>
          <h3 className={`text-xl font-bold mb-1 ${isOnline ? "text-[#10b981]" : "text-slate-500 dark:text-slate-400"}`}>
            {isOnline ? "You are Online" : "You are Offline"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user && !user.is_verified 
              ? "Account pending KYC verification."
              : (isOnline ? "You are now visible to passengers" : "Go online to start receiving requests")}
          </p>
        </div>

        {/* Performance Section */}
        <div className="p-6 flex-1 flex flex-col">
          <h4 className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-4">
            Today's Performance
          </h4>
          
          <div className="space-y-3">
            {/* Completed Rides */}
            <div className="bg-[#364251] rounded-lg p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">Completed Rides</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">8</div>
              </div>
              <div className="p-2 border border-[#E57036]/50 rounded-full text-[#E57036]">
                <CheckCircle2 size={20} />
              </div>
            </div>

            {/* Today's Earnings */}
            <div className="bg-[#364251] rounded-lg p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">Today's Earnings</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">ETB 1,840</div>
              </div>
              <div className="p-2 border border-[#E57036]/50 rounded-full text-[#E57036]">
                <Banknote size={20} />
              </div>
            </div>

            {/* Online Hours */}
            <div className="bg-[#364251] rounded-lg p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">Online Hours</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">6.5 hrs</div>
              </div>
              <div className="p-2 border border-[#E57036]/50 rounded-full text-[#E57036]">
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <Link href="/driver/earnings" className="w-full py-3.5 rounded-lg border border-[#E57036] text-[#E57036] font-bold text-sm hover:bg-[#E57036]/10 transition-colors flex items-center justify-center">
              View Earnings
            </Link>
          </div>
        </div>
      </aside>

      {/* Right Map Area */}
      <div className="flex-1 relative bg-[#EBEBEB] overflow-hidden">
         {/* Fake Map Background using repeating SVG */}
         <div className="absolute inset-0 opacity-[0.8]" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M0 50h100M50 0v100\' stroke=\'%23e5e7eb\' stroke-width=\'2\'/%3E%3Cpath d=\'M20 0v100M80 0v100M0 20h100M0 80h100\' stroke=\'%23e5e7eb\' stroke-width=\'1\'/%3E%3Cpath d=\'M-10 110 Q 40 60 110 40\' fill=\'none\' stroke=\'%23d1d5db\' stroke-width=\'4\'/%3E%3Cpath d=\'M 30 -10 Q 50 50 30 110\' fill=\'none\' stroke=\'%23d1d5db\' stroke-width=\'6\'/%3E%3C/svg%3E")',
            backgroundSize: '200px 200px'
         }}>
         </div>
         
         {/* Fake map labels overlay */}
         <div className="absolute inset-0 pointer-events-none opacity-50 flex items-center justify-center">
            <div className="text-slate-500 dark:text-slate-400 font-bold text-3xl tracking-widest transform -rotate-12">ADDIS ABABA</div>
         </div>

         {/* Alert Pill (Surge Pricing) */}
         <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[400px]">
           <div className="bg-[#F07B42] rounded-xl p-3 flex items-center justify-between shadow-lg shadow-orange-500/20 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
             <div className="flex items-center gap-3">
               <div className="bg-white rounded-lg p-2 text-[#F07B42]">
                 <AlertCircle size={20} fill="currentColor" className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white" />
               </div>
               <div>
                 <div className="text-sm font-bold leading-tight">High demand near Giyorgis Square!</div>
                 <div className="text-xs font-medium opacity-90">1.2x Multiplier active</div>
               </div>
             </div>
             <button className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors">
               <X size={16} />
             </button>
           </div>
         </div>

         {/* Driver Marker */}
         <div className="absolute top-[55%] left-[55%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="bg-[#E57036] border-2 border-white text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white p-1.5 rounded-lg shadow-md rotate-45 transform origin-center flex items-center justify-center">
               <Navigation size={18} className="fill-current -rotate-45" />
            </div>
            <div className="bg-[#2B3542] text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-full mt-2 shadow-lg whitespace-nowrap">
               You are here
            </div>
         </div>

         {/* Map Controls */}
         <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
            <div className="bg-[#2B3542] rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden flex flex-col">
               <button className="p-3 text-slate-500 dark:text-slate-400 hover:bg-[#364251] hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors border-b border-slate-200 dark:border-slate-700 flex justify-center">
                 <Plus size={18} />
               </button>
               <button className="p-3 text-slate-500 dark:text-slate-400 hover:bg-[#364251] hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors flex justify-center">
                 <Minus size={18} />
               </button>
            </div>
            <button className="bg-[#2B3542] rounded-lg border border-[#E57036] p-3 shadow-lg text-[#E57036] hover:bg-[#364251] transition-colors mt-2 flex justify-center">
               <Target size={18} />
            </button>
         </div>

         {/* Current Zone Info */}
         <div className="absolute bottom-6 left-6 z-20">
            <div className="bg-[#2B3542] border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg p-3 flex items-center gap-3 pr-6">
               <div className="text-[#E57036]">
                  <MapPin size={20} />
               </div>
               <div>
                 <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-0.5">Current Zone</div>
                 <div className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Addis Ababa, Ethiopia</div>
               </div>
            </div>
         </div>
      </div>

      {/* Incoming Request Overlay */}
      {incomingRide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 border border-slate-700">
            
            {/* Header / Radar Effect */}
            <div className="bg-slate-900 dark:bg-slate-950 p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 animate-[pulse_2s_ease-in-out_infinite]"></div>
              <div className="flex items-center justify-center gap-2 mb-2 text-emerald-500 animate-pulse">
                <BellRing size={20} />
                <span className="font-bold tracking-widest uppercase text-xs">New Ride Request Received!</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white relative z-10 drop-shadow-md">
                {incomingRide.ride_type === "SHARED" ? "Shared Ride" : "Private Ride"}
              </h2>
              <div className="text-slate-400 text-xs font-bold mt-1 relative z-10">Auto-declines in {timeLeft}s</div>
              
              {/* Progress Bar for Auto Decline */}
              <div className="absolute bottom-0 left-0 h-1.5 bg-emerald-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
            </div>

            <div className="p-6">
              {/* Passenger Info (Privacy Preserved) */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-400 shrink-0">
                  {incomingRide.passengers?.[0]?.user?.full_name ? incomingRide.passengers[0].user.full_name.charAt(0) : "P"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2 truncate">
                    {incomingRide.passengers?.[0]?.user?.full_name || "Passenger"}
                    <span className="flex items-center text-[10px] font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 shrink-0">
                      <Star size={10} className="text-yellow-500 mr-1 fill-current" /> 4.9
                    </span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm font-mono text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-900/50 w-fit px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    {incomingRide.passengers?.[0]?.user?.phone_number || "+251911..."}
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-1 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,213,153,0.6)]"></div>
                    <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600 my-1"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-5 font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white truncate">
                    <div className="truncate">{incomingRide.pickup_landmark}</div>
                    <div className="truncate">{incomingRide.dropoff_landmark}</div>
                  </div>
                </div>
              </div>

              {/* Fare */}
              <div className="text-center mb-8">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Guaranteed Fare</div>
                <div className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{incomingRide.base_fare.toFixed(2)} ETB</div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDeclineRide(incomingRide)}
                  className="w-1/3 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-red-500 dark:text-red-400 font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <XCircle size={18} /> Decline
                </button>
                <button 
                  onClick={handleAcceptRide}
                  className="w-2/3 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2"
                >
                  <CheckCircle size={20} /> ACCEPT RIDE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
