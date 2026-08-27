"use client";

import React, { useState } from "react";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Phone, 
  MessageSquare,
  Check,
  X,
  CreditCard
} from "lucide-react";
import { RIDE_PRODUCTS } from "@/lib/constants/ride-products";

// Mock an incoming ride request
const MOCK_REQUEST = {
  id: "REQ-8892",
  passengerName: "Abebe Bekele",
  rating: 4.8,
  pickup: "Giyorgis Square, Bahir Dar",
  dropoff: "Hilton Hotel, Menelik II Ave",
  distanceKm: 6.2,
  durationMin: 18,
  estimatedFare: 420.50, // ETB
  productId: "prod_standard",
  requestedAt: new Date(Date.now() - 1000 * 45), // 45 seconds ago
};

export default function DriverRideRequestPage() {
  const [requestStatus, setRequestStatus] = useState<"pending" | "accepted" | "declined">("pending");
  
  const product = RIDE_PRODUCTS.find(p => p.id === MOCK_REQUEST.productId);
  const ProductIcon = product?.icon || User;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ride Requests</h1>
        <p className="text-slate-500 dark:text-slate-500">Manage incoming passenger ride requests.</p>
      </div>

      {requestStatus === "pending" ? (
        <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Radar animation background header */}
          <div className="h-2 relative bg-blue-600 overflow-hidden">
             <div className="absolute inset-0 bg-blue-400 opacity-50 animate-pulse"></div>
          </div>
          
          <div className="p-6">
            {/* Request Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                    <User size={30} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 shadow border text-[10px] font-bold flex items-center gap-1">
                     ⭐ {MOCK_REQUEST.rating}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{MOCK_REQUEST.passengerName}</h2>
                  
                  {/* Ride Product Badge */}
                  {product && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-orange-600 dark:text-orange-500 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 w-fit">
                      <ProductIcon size={12} />
                      {product.name}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-black text-gray-900">ETB {MOCK_REQUEST.estimatedFare.toFixed(2)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 font-medium">Est. Earnings</div>
              </div>
            </div>

            {/* Route Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
              <div className="relative pl-6 space-y-4">
                {/* Timeline Line */}
                <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-gray-300"></div>
                
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-blue-600 bg-white"></div>
                  <div className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-500 uppercase mb-0.5">Pickup • 3 min away</div>
                  <div className="text-sm font-medium text-gray-900">{MOCK_REQUEST.pickup}</div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-sm bg-black"></div>
                  <div className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-500 uppercase mb-0.5">Dropoff</div>
                  <div className="text-sm font-medium text-gray-900">{MOCK_REQUEST.dropoff}</div>
                </div>
              </div>
            </div>
            
            {/* Trip Details */}
            <div className="flex gap-4 mb-6">
               <div className="flex-1 bg-white border rounded-lg p-3 flex flex-col items-center justify-center text-center">
                 <Navigation size={18} className="text-blue-500 mb-1" />
                 <div className="text-sm font-bold text-gray-900">{MOCK_REQUEST.distanceKm} km</div>
                 <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-semibold">Distance</div>
               </div>
               <div className="flex-1 bg-white border rounded-lg p-3 flex flex-col items-center justify-center text-center">
                 <Clock size={18} className="text-blue-500 mb-1" />
                 <div className="text-sm font-bold text-gray-900">{MOCK_REQUEST.durationMin} min</div>
                 <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-semibold">Est. Time</div>
               </div>
               <div className="flex-1 bg-white border rounded-lg p-3 flex flex-col items-center justify-center text-center">
                 <CreditCard size={18} className="text-green-500 mb-1" />
                 <div className="text-sm font-bold text-gray-900">Card</div>
                 <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-semibold">Payment</div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button 
                onClick={() => setRequestStatus("declined")}
                className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                Decline
              </button>
              <button 
                onClick={() => setRequestStatus("accepted")}
                className="flex-[2] py-4 rounded-xl bg-blue-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Accept Ride
              </button>
            </div>
          </div>
        </div>
      ) : requestStatus === "accepted" ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ride Accepted!</h2>
          <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto">
            Navigating to pickup location. Please head to {MOCK_REQUEST.pickup} to pick up {MOCK_REQUEST.passengerName}.
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
              <Phone size={18} /> Call
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
              <MessageSquare size={18} /> Message
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white rounded-lg font-medium shadow-md transition-colors">
              <Navigation size={18} /> Navigate
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border p-12 text-center text-slate-500 dark:text-slate-500">
           <p>Request declined. Waiting for new requests...</p>
           <button 
             onClick={() => setRequestStatus("pending")}
             className="mt-4 text-sm font-medium text-blue-600 hover:underline"
           >
             Simulate another request
           </button>
        </div>
      )}
    </div>
  );
}
