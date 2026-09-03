"use client";

import React, { useState } from "react";
import { 
  Search, 
  Calendar, 
  MapPin, 
  Flag,
  ArrowRight,
  Clock,
  Navigation,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Mock data based on the screenshot
const MOCK_TRIPS = [
  {
    id: "TRP-1",
    passenger: "Selam Mekonen",
    initials: "SM",
    pickup: "Giyorgis Square",
    dropoff: "Meskel Square",
    distance: "12.4 km",
    duration: "22 min",
    date: "OCT 24, 14:20",
    fare: "210.00",
    status: "Completed",
    statusColor: "text-[#10b981] bg-[#10b981]/10"
  },
  {
    id: "TRP-2",
    passenger: "Abebe Girma",
    initials: "AG",
    pickup: "Piazza",
    dropoff: "Papyrus Hotel",
    distance: "8.2 km",
    duration: "15 min",
    date: "OCT 24, 11:45",
    fare: "180.00",
    status: "Completed",
    statusColor: "text-[#10b981] bg-[#10b981]/10"
  },
  {
    id: "TRP-3",
    passenger: "Biruk Teshome",
    initials: "BT",
    pickup: "CMC",
    dropoff: "Lideta Market",
    distance: "14.1 km",
    duration: "28 min",
    date: "OCT 23, 16:15",
    fare: "245.50",
    status: "Shared",
    statusColor: "text-[#3b82f6] bg-[#3b82f6]/10"
  },
  {
    id: "TRP-4",
    passenger: "Dawit Tesfaye",
    initials: "DT",
    pickup: "Sarbet",
    dropoff: "Kaliti",
    distance: "18.3 km",
    duration: "35 min",
    date: "OCT 23, 09:30",
    fare: "140.00",
    status: "Cancelled",
    statusColor: "text-[#ef4444] bg-[#ef4444]/10"
  },
];

export default function DriverHistoryPage() {
  const [activeTab, setActiveTab] = useState("All Trips");

  return (
    <div className="flex flex-col h-full w-full bg-[#2B3542] text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans relative overflow-hidden">
       
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white tracking-tight mb-2">My Trip History</h1>
            <p className="text-slate-500 dark:text-slate-400">All your completed and cancelled trips</p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
             
             {/* Tabs */}
             <div className="flex items-center gap-1 bg-[#364251] p-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700 overflow-x-auto">
               {["All Trips", "Completed", "Cancelled", "Shared"].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 md:px-6 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                     activeTab === tab 
                       ? "bg-[#E57036] text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-md" 
                       : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
                   }`}
                 >
                   {tab}
                 </button>
               ))}
             </div>

             {/* Search and Date */}
             <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E57036]" />
                  <input 
                    type="text" 
                    placeholder="Search trips..." 
                    className="bg-[#364251] border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-slate-500 focus:outline-none focus:border-[#E57036] w-[200px] md:w-[250px]"
                  />
                </div>
                <button className="flex items-center gap-2 bg-[#364251] border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-[#3d4a5c] transition-colors whitespace-nowrap">
                   <Calendar size={16} className="text-[#E57036]" />
                   Oct 01 - Oct 31, 2023
                </button>
             </div>
          </div>

          {/* Trip Cards List */}
          <div className="space-y-4">
            {MOCK_TRIPS.map((trip) => (
              <div key={trip.id} className="bg-[#364251] rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row gap-6 hover:border-slate-200 dark:border-slate-700 transition-colors group">
                 
                 {/* Left side info (Date + Avatar) */}
                 <div className="flex flex-col items-center md:items-start shrink-0 md:w-28 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-4 md:pb-0 md:pr-4">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-4 uppercase text-center md:text-left">
                       {trip.date}
                    </div>
                    <div className="w-14 h-14 rounded-xl border-2 border-[#E57036] flex items-center justify-center text-[#E57036] font-bold text-xl tracking-wider shadow-inner bg-[#2B3542]">
                       {trip.initials}
                    </div>
                 </div>

                 {/* Middle info (Passenger + Route) */}
                 <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-4">{trip.passenger}</h2>
                    
                    <div className="flex flex-col gap-3 relative pl-6">
                       {/* Connection Line */}
                       <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/10"></div>
                       
                       <div className="flex items-center gap-3 relative">
                          <div className="absolute -left-6 bg-[#364251] p-0.5">
                             <MapPin size={14} className="text-[#E57036]" />
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400">{trip.pickup}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 relative">
                          <div className="absolute -left-6 bg-[#364251] p-0.5">
                             <Flag size={14} className="text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400">{trip.dropoff}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                       <div className="flex items-center gap-1.5">
                          <Navigation size={12} className="text-[#E57036]" /> {trip.distance}
                       </div>
                       <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#E57036]" /> {trip.duration}
                       </div>
                    </div>
                 </div>

                 {/* Right info (Fare + Status) */}
                 <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto mt-2 md:mt-0 gap-4">
                    <div className="text-right">
                       <div className="text-2xl font-black text-[#E57036] mb-2 tracking-tight">
                         ETB {trip.fare}
                       </div>
                       <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${trip.statusColor}`}>
                         {trip.status}
                       </div>
                    </div>
                    
                    <button className="text-[#E57036] text-xs font-bold hover:underline flex items-center gap-1 mt-auto">
                      View Details <ArrowRight size={14} />
                    </button>
                 </div>

              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Sticky Bottom Summary Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#2B3542] border-t border-slate-200 dark:border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-20">
         <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-6 md:gap-12">
               <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Monthly Trips</div>
                  <div className="text-xl font-black text-[#E57036]">48 Trips</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Earnings</div>
                  <div className="text-xl font-black text-[#E57036]">ETB 12,450.00</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Cancellation Rate</div>
                  <div className="text-xl font-black text-[#10b981]">2.1%</div>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Page 1 of 8</span>
               <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded bg-[#364251] text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/5 transition-colors border border-slate-200 dark:border-slate-700">
                     <ChevronLeft size={16} />
                  </button>
                  <button className="p-1.5 rounded border border-[#E57036] text-[#E57036] hover:bg-[#E57036]/10 transition-colors">
                     <ChevronRight size={16} />
                  </button>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
}
