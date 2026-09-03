"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Phone,
  MessageSquare,
  AlertOctagon,
  ShieldAlert,
  Navigation,
  Car,
  Star,
  CheckCircle2,
  X,
  CreditCard,
  Wallet,
  Banknote,
  Navigation2
} from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

// Helper to map landmarks to actual Bahir Dar coordinates
const getCoords = (landmark: string): [number, number] => {
  const map: Record<string, [number, number]> = {
    "BDU Poly Campus (ባሕር ዳር ዩኒቨርሲቲ ፖሊ)": [11.5980, 37.3980],
    "Giyorgis Square / ቀበሌ 04": [11.5936, 37.3908],
    "Papyrus Hotel (ፓፒረስ ሆቴል)": [11.5880, 37.3850],
    "Abay Mado (አባይ ማዶ)": [11.6020, 37.4100],
    "Kuriftu Resort Lake Tana": [11.6070, 37.3750],
    "New Bus Station / ቀበሌ 14 መናኸሪያ": [11.5750, 37.3880],
  };
  return map[landmark] || [11.5936, 37.3908]; // Default to Giyorgis Square
};

type TripStatus = "pending" | "accepted" | "en_route" | "arrived" | "in_progress" | "completed";

export default function ActiveTripPage() {
  const router = useRouter();
  const [rideData, setRideData] = useState<any>(null);
  const [status, setStatus] = useState<TripStatus>("accepted");
  const [showSOS, setShowSOS] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Telebirr");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Load ride data from localStorage
    const savedRide = localStorage.getItem("currentActiveRide");
    if (savedRide) {
      setRideData(JSON.parse(savedRide));
      setLoading(false);

      if (sessionStorage.getItem("showAcceptedToast")) {
        setShowToast(true);
        sessionStorage.removeItem("showAcceptedToast");
        setTimeout(() => setShowToast(false), 5000);
      }
    } else {
      router.push("/passenger/book");
    }
  }, [router]);

  // Sync state from backend via API
  useEffect(() => {
    if (!rideData || !rideData.ride_id) return;

    const syncState = async () => {
      try {
        const ride = await api.get(`/rides/${rideData.ride_id}`);
        if (ride.status && ride.status !== status) {
          setStatus(ride.status);
          if (ride.status === "COMPLETED") {
            setShowPaymentModal(true);
          }
        }
      } catch (err) {
        console.error("Error syncing ride state:", err);
      }
    };

    const interval = setInterval(syncState, 3000);
    return () => clearInterval(interval);
  }, [status, rideData]);

  const handleSOS = async () => {
    try {
      const pCoords = getCoords(rideData.pickupLandmark || "Unknown");
      await api.post('/sos/trigger', {
        ride_id: rideData.ride_id,
        latitude: pCoords[0],
        longitude: pCoords[1]
      });
      alert("SOS Triggered! Location and ride details sent to emergency contacts and admin.");
      setShowSOS(false);
    } catch (err) {
      console.error(err);
      alert("Failed to trigger SOS. Please call emergency services directly.");
    }
  };

  const handleCompleteRide = async () => {
    try {
      // Find the passenger id for the payment
      const passengerId = rideData.passengers?.[0]?.ride_passenger_id;
      
      if (passengerId) {
        await api.post('/payments/pay', {
          ride_passenger_id: passengerId,
          amount: rideData.base_fare,
          payment_method: paymentMethod.toUpperCase(),
          transaction_ref: `TXN-${Date.now()}`
        });
      }
      
      localStorage.removeItem("currentActiveRide");
      router.push("/passenger/history");
    } catch (err) {
      console.error(err);
      alert("Failed to process payment");
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center">Loading ride details...</div>;
  if (!rideData) return null;

  const driver = rideData.driver?.user || { name: "Unknown" };
  const vehicle = rideData.driver?.vehicle || { model: "Unknown", plate_number: "Unknown" };
  const pickup = rideData.pickup_landmark;
  const destination = rideData.dropoff_landmark;
  const fare = rideData.base_fare;
  const rideType = rideData.ride_type;

  const getStatusText = () => {
    switch(status) {
      case "accepted":
      case "en_route": return "Driver En Route";
      case "arrived": return "Driver Arrived";
      case "in_progress": return "Trip in Progress";
      case "completed": return "Trip Completed";
      default: return "Unknown";
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-slate-900 overflow-hidden z-0">
        <MapClient 
          activeTrips={[{
            ...rideData,
            status: status === "EN_ROUTE" || status === "ACCEPTED" || status === "ARRIVED" ? 'accepted' : status === "IN_PROGRESS" ? "in_progress" : "completed" // Just a mock status mapping
          }]}
          sosEvents={[]}
          pendingRequests={[]}
          idleDrivers={[]}
          filter="ACTIVE"
          onMarkerClick={() => {}}
          getCoords={getCoords}
        />
      </div>

      {/* Top Floating Status Indicator */}
      <div className="absolute top-6 left-0 w-full px-4 md:px-8 z-10 flex justify-center">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-full px-6 py-3 flex items-center gap-3 border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-10">
          <div className={`w-3 h-3 rounded-full ${status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
          <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white text-sm tracking-wide uppercase">{getStatusText()}</span>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && rideData && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="bg-emerald-500 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-3 border border-emerald-400">
            <CheckCircle2 size={20} className="shrink-0" />
            <span className="font-bold text-sm whitespace-nowrap">Driver {driver.name?.split(' ')[0] || "Dawit"} accepted your ride!</span>
          </div>
        </div>
      )}

      {/* Emergency SOS Button */}
      <div className="absolute top-6 right-4 md:right-8 z-10">
        <button 
          onClick={() => setShowSOS(true)}
          className="bg-red-500 hover:bg-red-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white p-3 rounded-full shadow-lg shadow-red-500/30 transition-transform hover:scale-105 flex items-center justify-center"
          title="Emergency SOS"
        >
          <AlertOctagon size={24} />
        </button>
      </div>

      {/* Bottom Information Panel */}
      <div className="absolute bottom-0 left-0 w-full z-10">
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
          
          {/* Detour Protection Notice */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-start gap-3">
            <ShieldAlert size={18} className="text-green-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white block mb-0.5">Fare Locked & Protected</strong>
              Your fare is fixed at {fare.toFixed(2)} ETB. Driver detours or traffic delays will not affect your price.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Driver Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-400">
                {(driver.name || driver.full_name || "?").charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
                  {driver.name || driver.full_name}
                  <span className="flex items-center text-xs font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Star size={10} className="text-yellow-500 mr-1 fill-current" /> {rideData.driver?.rating || "5.0"}
                  </span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{vehicle.model}</p>
                <div className="flex gap-2 items-center mt-1">
                  <div className="inline-block border border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 font-mono text-xs tracking-widest text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold">
                    {vehicle.plate_number || vehicle.plate}
                  </div>
                  <div className="inline-flex items-center gap-1 border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded font-mono text-xs font-bold text-green-700 dark:text-green-500">
                    <ShieldAlert size={12} />
                    +251 92 •••• 88
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex-1 md:flex-none bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                <span>Message</span>
              </button>
              <button className="flex-1 md:flex-none bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                <Phone size={18} />
                <span>Call (Masked)</span>
              </button>
            </div>
          </div>

          {/* Route Info */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600 my-1"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              </div>
              <div className="flex-1 flex flex-col gap-3 text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
                <div>{pickup}</div>
                <div>{destination}</div>
              </div>
              <div className="text-right flex flex-col justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{fare.toFixed(2)} ETB</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{rideType}</div>
                </div>
                {rideType === "SHARED" && (
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                    Co-passenger: Picked up
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* SOS Modal */}
      {showSOS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertOctagon size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">Emergency SOS</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you in danger? This will instantly share your live location and driver details with authorities and emergency contacts.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleSOS} className="w-full py-3 bg-red-500 hover:bg-red-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-xl transition-colors">
                TRIGGER SOS NOW
              </button>
              <button onClick={() => setShowSOS(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Trip Payment & Rating Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-green-500 p-6 text-center text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-1">You've Arrived!</h2>
              <p className="text-green-100 text-sm">Thank you for riding with Dream More.</p>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{fare.toFixed(2)} ETB</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Fare</div>
              </div>

              {/* Payment Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "Telebirr", icon: Wallet, color: "text-blue-500" },
                    { id: "eBirr", icon: Wallet, color: "text-orange-500" },
                    { id: "Card", icon: CreditCard, color: "text-purple-500" },
                    { id: "Cash", icon: Banknote, color: "text-green-500" }
                  ].map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors ${paymentMethod === method.id ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-300'}`}
                    >
                      <method.icon size={20} className={`mb-2 ${method.color}`} />
                      <span className={`text-xs font-bold ${paymentMethod === method.id ? 'text-orange-600 dark:text-orange-500' : 'text-slate-700 dark:text-slate-300'}`}>{method.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                <label className="block text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3 text-center">Rate your driver, {driver.name || driver.full_name}</label>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star size={32} className={`${rating >= star ? 'text-yellow-500 fill-current' : 'text-slate-300 dark:text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Leave a comment (optional)..."
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white text-sm rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-colors placeholder-slate-400 dark:placeholder-slate-500 resize-none h-20"
                ></textarea>
              </div>

              <button 
                onClick={handleCompleteRide}
                disabled={rating === 0}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg ${rating === 0 ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none' : 'bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-orange-500/20'}`}
              >
                SUBMIT & FINISH
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
