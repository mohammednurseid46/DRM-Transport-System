"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Navigation2, 
  Phone, 
  ShieldAlert, 
  Star, 
  TrendingUp, 
  Banknote, 
  CreditCard,
  Clock,
  CheckCircle2,
  Power,
  Activity,
  Car,
  FileCheck
} from "lucide-react";
import { getCurrentUser, User } from "@/lib/auth";
import { toggleDriverAvailabilityAction } from "@/actions/users";
import { ThemeToggle } from "@/components/ThemeToggle";

// Dynamically import Leaflet Map (SSR False)
const DriverMapClient = dynamic(() => import("@/components/map/DriverMapClient"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  )
});

type Tab = "home" | "earnings";
type RideState = "idle" | "requesting" | "accepted" | "arrived" | "in_progress" | "rating";

// Mock Coordinates for Bahir Dar
const DRIVER_LOCATION: [number, number] = [11.5936, 37.3908]; 
const MOCK_PICKUP: [number, number] = [11.5975, 37.3942]; // Giyorgis Square
const MOCK_DROPOFF: [number, number] = [11.5998, 37.3850]; // Piassa

export default function DriverDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isOnline, setIsOnline] = useState(false);
  const [rideState, setRideState] = useState<RideState>("idle");
  const [rating, setRating] = useState(0);
  const [driverInfo, setDriverInfo] = useState<User | null>(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.role === "driver") {
          setDriverInfo(user);
          setIsOnline(user.isAvailable || false);
        }
      } catch (error) {
        console.error("Failed to fetch driver info:", error);
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    // Listen for cross-tab storage events (e.g., from Passenger App)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dms_ride_requests' || e.key === 'passengerNotifications') {
        // Simple logic: if driver is online and idle, trigger request when new data arrives
        if (isOnline && rideState === 'idle') {
          setRideState('requesting');
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isOnline, rideState]);

  // Handlers
  const handleToggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (!newState) {
      setRideState("idle");
    }
    
    if (driverInfo) {
      toggleDriverAvailabilityAction(driverInfo.id, newState);
      setDriverInfo({ ...driverInfo, isAvailable: newState });
    }
  };

  const simulateIncomingRequest = () => {
    if (isOnline && rideState === "idle") {
      setRideState("requesting");
      // Optional: dispatch event to sync other tabs if needed
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleAcceptRide = () => setRideState("accepted");
  const handleDeclineRide = () => setRideState("idle");
  
  const handleArrive = () => setRideState("arrived");
  const handleStartTrip = () => setRideState("in_progress");
  const handleCompleteTrip = () => setRideState("rating");
  
  const handleSubmitRating = () => {
    setRating(0);
    setRideState("idle");
  };

  if (driverInfo === null) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!driverInfo.is_verified) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-6 text-center">
        <ShieldAlert className="w-20 h-20 text-orange-500 mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Verification in Progress</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
          Your account is currently under review by our admin team. Please ensure you have uploaded all required KYC documents. You will gain access to the driver dashboard once approved.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg transition-colors flex items-center gap-2"
        >
          <Clock size={18} />
          Check Status
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Top Status Bar (Only visible on Home Tab) */}
      {activeTab === "home" && (
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            {/* Driver Stats Badge / Status */}
            <div className="bg-white dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 p-2 rounded-xl flex items-center gap-4 shadow-lg">
              <div className="flex flex-col items-center border-r border-slate-200 dark:border-slate-700 pr-4 pl-2">
                 <div className="flex items-center gap-1 text-yellow-500 font-bold">
                   <span>4.9</span>
                   <Star size={14} fill="currentColor" />
                 </div>
                 <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</span>
              </div>
              <div className="flex flex-col items-center pr-2">
                 <div className="flex items-center gap-2">
                   {isOnline ? (
                     <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                     </span>
                   ) : (
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                   )}
                   <span className="text-slate-900 dark:text-white font-bold text-sm">{isOnline ? "Online" : "Offline"}</span>
                 </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <ThemeToggle />
              
              {/* Online Toggle */}
              <button 
                 onClick={handleToggleOnline}
                 className={`px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 transition-all ${
                   isOnline 
                     ? "bg-emerald-500 text-slate-900 shadow-emerald-500/20 hover:bg-emerald-600" 
                     : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                 }`}
              >
                <Power size={18} />
                {isOnline ? "GO OFFLINE" : "GO ONLINE"}
              </button>
            </div>
          </div>
          
          {/* Status Text Underneath */}
          <div className="text-xs font-semibold px-2">
            {isOnline ? (
              <span className="text-emerald-500 font-bold drop-shadow-md bg-white/50 dark:bg-slate-900/50 px-2 py-0.5 rounded backdrop-blur-sm">Online • Ready for rides</span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 drop-shadow-md bg-white/50 dark:bg-slate-900/50 px-2 py-0.5 rounded backdrop-blur-sm">Offline • Not accepting rides</span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        
        {/* HOME TAB (Map & Ride States) */}
        {activeTab === "home" && (
          <div className="absolute inset-0 flex flex-col">
            
            {/* Interactive GPS Map */}
            <div className="flex-1 relative z-0">
               <DriverMapClient 
                 isOnline={isOnline} 
                 rideState={rideState} 
                 driverCoords={DRIVER_LOCATION}
                 pickupCoords={MOCK_PICKUP}
                 dropoffCoords={MOCK_DROPOFF}
               />
               
               {/* OFFLINE DASHBOARD OVERLAY */}
               {!isOnline && (
                 <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/95 backdrop-blur-md overflow-y-auto custom-scrollbar pt-28 pb-8 px-4 sm:px-8 z-10">
                   <div className="max-w-3xl mx-auto space-y-6">
                     {/* Offline Banner */}
                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-start gap-4 shadow-lg">
                        <div className="bg-slate-700 p-3 rounded-full text-slate-300">
                          <Power size={24} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">You are currently offline.</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Switch to Online using the button above to start receiving ride requests in your area.</p>
                        </div>
                     </div>

                     {/* Maintenance / Readiness Checklist */}
                     <div>
                       <h3 className="text-sm font-bold tracking-widest text-slate-500 dark:text-slate-500 uppercase mb-3 px-1">Readiness Checklist</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4">
                           <div className="bg-orange-500 dark:bg-orange-600/10 text-orange-600 dark:text-orange-500 p-3 rounded-xl"><Car size={24} /></div>
                           <div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle Info</p>
                             <p className="text-slate-900 dark:text-white font-bold">{driverInfo?.vehicleModel || "Toyota Corolla"}</p>
                             <p className="text-sm text-orange-600 dark:text-orange-500 mt-0.5">{driverInfo?.plateNumber || "B 14322 AA"} • {driverInfo?.tier || "Economy"}</p>
                           </div>
                         </div>
                         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4">
                           <div className="bg-green-500/10 text-green-500 p-3 rounded-xl"><FileCheck size={24} /></div>
                           <div>
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Documents</p>
                             <p className="text-slate-900 dark:text-white font-bold">All Documents</p>
                             <div className="flex items-center gap-1.5 mt-1">
                               <CheckCircle2 size={14} className="text-green-500" />
                               <span className="text-sm text-green-500 font-medium">Verified & Approved</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Shift Summary & Analytics */}
                     <div>
                       <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-3 px-1">Shift Summary</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-20"><Banknote size={40} className="text-slate-500 dark:text-slate-400"/></div>
                           <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">Today's Total</p>
                           <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">1,450</p>
                           <p className="text-sm text-slate-500 dark:text-slate-400">ETB</p>
                         </div>
                         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-20"><Activity size={40} className="text-slate-500 dark:text-slate-400"/></div>
                           <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">Completed</p>
                           <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">12</p>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Rides Today</p>
                         </div>
                         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-20"><Clock size={40} className="text-slate-500 dark:text-slate-400"/></div>
                           <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">Online Hours</p>
                           <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">5.2</p>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Hours</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               {/* ONLINE LIVE RADAR STATUS PILL */}
               {isOnline && rideState === "idle" && (
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-full shadow-lg flex items-center gap-3 mb-4 pointer-events-auto transition-transform hover:scale-105">
                      <div className="relative flex items-center justify-center w-6 h-6">
                        <div className="absolute inset-0 bg-orange-500/50 rounded-full animate-ping"></div>
                        <Navigation2 size={16} className="text-orange-500 animate-pulse relative z-10" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Online • Scanning Bahir Dar...</span>
                    </div>

                    {/* Quick Hotspots */}
                    <div className="flex gap-2 pointer-events-auto overflow-x-auto max-w-[90vw] px-4 pb-2 hide-scrollbar">
                      <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 shadow-md whitespace-nowrap">BDU Poly</button>
                      <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 shadow-md whitespace-nowrap">Papyrus Hotel</button>
                      <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 shadow-md whitespace-nowrap">Abay Mado</button>
                    </div>

                    {/* Hidden Dev Button to trigger request */}
                    <button onClick={simulateIncomingRequest} className="mt-4 p-2 text-[10px] bg-black/50 text-white/50 rounded pointer-events-auto hover:text-white border border-slate-700">
                      Dev: Simulate Request
                    </button>
                 </div>
               )}
            </div>

            {/* Floating Action Cards based on State */}
            
            {/* 1. Requesting Overlay */}
            {rideState === "requesting" && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-4 z-40 animate-in fade-in">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95">
                  
                  {/* Countdown Timer Bar */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-orange-500 dark:bg-orange-600 animate-[shrink_15s_linear_forwards] origin-left"></div>
                  </div>

                  <div className="p-6 text-center border-b border-slate-200 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider border border-blue-200 dark:border-blue-900/50">
                      Private Ride Request
                    </span>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white">250 ETB</h2>
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium flex items-center justify-center gap-1"><CheckCircle2 size={14}/> Locked Upfront Fare</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-200 dark:border-slate-600">👤</div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">Dawit Mekonnen</p>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                          <span>4.8</span><Star size={14} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                      <div className="relative">
                        <div className="absolute left-[-28px] top-1 w-4 h-4 rounded-full bg-blue-500 border-[3px] border-white dark:border-slate-800 shadow-sm"></div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Pickup (2 min away)</p>
                        <p className="text-slate-900 dark:text-white font-bold">Giyorgis Square, Bahir Dar</p>
                      </div>
                      <div className="relative">
                        <div className="absolute left-[-28px] top-1 w-4 h-4 rounded-full bg-red-500 border-[3px] border-white dark:border-slate-800 shadow-sm"></div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Drop-off (12 min trip)</p>
                        <p className="text-slate-900 dark:text-white font-bold">Piassa, Arada Sub-City</p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button onClick={handleDeclineRide} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-600">
                        Decline
                      </button>
                      <button onClick={handleAcceptRide} className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/30">
                        Accept Ride
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Active Controller (Accepted, Arrived, In Progress) */}
            {(rideState === "accepted" || rideState === "arrived" || rideState === "in_progress") && (
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 px-4 sm:px-6 z-30 flex justify-center pointer-events-none">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-12">
                  
                  {/* Detour Protection Banner */}
                  <div className="bg-green-50 dark:bg-green-500/10 border-b border-green-200 dark:border-green-500/20 p-2 text-center flex items-center justify-center gap-2 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
                    <ShieldAlert size={14} /> Fare is locked against detours.
                  </div>

                  {/* Passenger Info & Actions */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center text-xl">👤</div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">Dawit M.</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                          Fixed Fare: <span className="text-green-600 dark:text-green-400 font-bold">250 ETB</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/20 shadow-sm" title="Masked Call">
                        <Phone size={20} />
                      </button>
                      <button className="w-12 h-12 rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20 shadow-sm" title="SOS Emergency">
                        <ShieldAlert size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Navigation Context */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center gap-2 border-b border-slate-200 dark:border-slate-700">
                     {rideState === "accepted" && <><Navigation2 size={16} className="text-blue-600 dark:text-blue-400"/><p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Navigating to Pickup</p></>}
                     {rideState === "arrived" && <><Clock size={16} className="text-yellow-600 dark:text-yellow-500 animate-pulse"/><p className="text-sm font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">Waiting for Passenger</p></>}
                     {rideState === "in_progress" && <><Navigation2 size={16} className="text-orange-600 dark:text-orange-500"/><p className="text-sm font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest">En Route to Destination</p></>}
                  </div>

                  {/* Action Slider/Button */}
                  <div className="p-4 bg-white dark:bg-slate-800">
                     {rideState === "accepted" && (
                       <button onClick={handleArrive} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black text-lg uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                         Arrived at Pickup
                       </button>
                     )}
                     {rideState === "arrived" && (
                       <button onClick={handleStartTrip} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                         Start Ride
                       </button>
                     )}
                     {rideState === "in_progress" && (
                       <button onClick={handleCompleteTrip} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-orange-500/30">
                         Complete Ride
                       </button>
                     )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Rating Modal */}
            {rideState === "rating" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-center animate-in zoom-in-95 shadow-2xl">
                  <div className="w-20 h-20 bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-[4px] border-green-100 dark:border-green-500/30">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Trip Completed</h2>
                  <p className="text-orange-600 dark:text-orange-500 font-bold text-3xl mb-6 drop-shadow-sm">Earned: 250 ETB</p>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 font-bold uppercase tracking-wider">Rate Dawit Mekonnen</p>
                    <div className="flex justify-center gap-2 mb-4">
                      {[1,2,3,4,5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setRating(star)}
                          className={`transition-colors hover:scale-110 active:scale-95 ${rating >= star ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400'}`}
                        >
                          <Star size={36} fill={rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Leave a comment (optional)..." 
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none resize-none h-20 transition-colors shadow-inner"
                    ></textarea>
                  </div>

                  <button 
                    onClick={handleSubmitRating}
                    disabled={rating === 0}
                    className="w-full py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* EARNINGS & STATS TAB */}
        {activeTab === "earnings" && (
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar p-4 lg:p-8">
             <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Earnings & Stats</h1>
             
             {/* Metrics Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                 <div className="absolute bottom-0 right-0 p-4 opacity-5 dark:opacity-10 text-slate-900 dark:text-white"><Banknote size={48}/></div>
                 <p className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Today's Revenue</p>
                 <p className="text-4xl font-black text-slate-900 dark:text-white">1,450 <span className="text-lg font-medium text-slate-500">ETB</span></p>
               </div>
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                 <div className="absolute bottom-0 right-0 p-4 opacity-5 dark:opacity-10 text-orange-500"><TrendingUp size={48}/></div>
                 <p className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Weekly Payout</p>
                 <p className="text-4xl font-black text-orange-600 dark:text-orange-500">8,200 <span className="text-lg font-medium text-orange-600/50 dark:text-orange-500/50">ETB</span></p>
               </div>
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                 <div className="absolute bottom-0 right-0 p-4 opacity-5 dark:opacity-10 text-slate-900 dark:text-white"><CheckCircle2 size={48}/></div>
                 <p className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Completed Trips</p>
                 <p className="text-4xl font-black text-slate-900 dark:text-white">34</p>
               </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Breakdown */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment Methods</h3>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 p-2 rounded-lg border border-blue-100 dark:border-blue-900/50"><CreditCard size={18}/></div>
                         <span className="font-medium text-slate-700 dark:text-slate-200">Telebirr / eBirr</span>
                       </div>
                       <span className="font-bold text-slate-900 dark:text-white">65%</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400 p-2 rounded-lg border border-green-100 dark:border-green-900/50"><Banknote size={18}/></div>
                         <span className="font-medium text-slate-700 dark:text-slate-200">Cash</span>
                       </div>
                       <span className="font-bold text-slate-900 dark:text-white">25%</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 p-2 rounded-lg border border-purple-100 dark:border-purple-900/50"><CreditCard size={18}/></div>
                         <span className="font-medium text-slate-700 dark:text-slate-200">Bank Cards</span>
                       </div>
                       <span className="font-bold text-slate-900 dark:text-white">10%</span>
                     </div>
                  </div>
                </div>

                {/* Trip History */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Trip History</h3>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-4">Date / Time</th>
                          <th className="px-6 py-4">Route</th>
                          <th className="px-6 py-4">Fare</th>
                          <th className="px-6 py-4">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">Today, 14:30</td>
                          <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-bold">Poly &rarr; Papyrus</td>
                          <td className="px-6 py-4 text-green-600 dark:text-green-400 font-black">250 ETB</td>
                          <td className="px-6 py-4"><div className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor"/> 5.0</div></td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">Today, 11:15</td>
                          <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-bold">Megenagna → CMC</td>
                          <td className="px-6 py-4 text-green-600 dark:text-green-400 font-black">180 ETB</td>
                          <td className="px-6 py-4"><div className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor"/> 5.0</div></td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">Yesterday, 18:45</td>
                          <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-bold">Kazanchis → Jemo</td>
                          <td className="px-6 py-4 text-green-600 dark:text-green-400 font-black">350 ETB</td>
                          <td className="px-6 py-4"><div className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor"/> 4.0</div></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Tabs */}
      <div className="h-16 md:h-20 shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around px-4 relative z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
         <button 
           onClick={() => setActiveTab("home")}
           className={`flex flex-col items-center gap-1 w-24 transition-colors ${activeTab === "home" ? "text-orange-600 dark:text-orange-500" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
         >
           <Navigation2 size={activeTab === "home" ? 28 : 24} className={activeTab === "home" ? "animate-bounce" : ""} />
           <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Home</span>
         </button>
         <button 
           onClick={() => setActiveTab("earnings")}
           className={`flex flex-col items-center gap-1 w-24 transition-colors ${activeTab === "earnings" ? "text-orange-600 dark:text-orange-500" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
         >
           <Banknote size={activeTab === "earnings" ? 28 : 24} />
           <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Earnings</span>
         </button>
      </div>

    </div>
  );
}
