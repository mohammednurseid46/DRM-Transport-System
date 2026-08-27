"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  History, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ChevronRight,
  Car,
  Split,
  CalendarDays
} from "lucide-react";

export default function PassengerHistoryPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRides = localStorage.getItem("passengerRides");
    if (savedRides) {
      setRides(JSON.parse(savedRides));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">Ride History</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Review your past trips and receipts.</p>
      </div>

      {rides.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-card p-12 text-center flex flex-col items-center justify-center flex-1">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-6">
            <History size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-3">No rides yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            You haven't taken any rides with Dream More TMS yet. Your completed trips will appear here.
          </p>
          <Link 
            href="/passenger/book" 
            className="bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold py-3 px-8 rounded-control transition-colors shadow-lg shadow-orange-500/20"
          >
            Book a Ride
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div key={ride.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-orange-500/50 transition-colors group cursor-pointer">
              <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between">
                
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl shrink-0 mt-1 text-slate-500 dark:text-slate-400">
                    {ride.rideType === "SHARED" ? <Split size={24} /> : <Car size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{new Date(ride.completedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</h3>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs">
                        <CheckCircle2 size={12} /> {ride.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                        <span className="truncate">{ride.pickup}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                        <span className="truncate">{ride.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-200 dark:border-slate-700 pt-4 md:pt-0 mt-4 md:mt-0">
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{ride.fare.toFixed(2)} ETB</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                      {ride.paymentMethod} <span className="opacity-50">•</span> {ride.rideType}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-xs font-bold bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Star size={12} className="text-yellow-500 mr-1 fill-current" /> {ride.rating}
                    </div>
                    <div className="text-slate-400 group-hover:text-orange-500 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
