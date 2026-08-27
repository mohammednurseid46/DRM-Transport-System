"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Car, 
  Clock, 
  BarChart2, 
  CreditCard 
} from "lucide-react";

// Mock data for payouts
const MOCK_PAYOUTS = [
  { id: 1, date: "Mon July 7", rides: 8, amount: 1840, status: "PAID" },
  { id: 2, date: "Tue July 8", rides: 10, amount: 2310, status: "PAID" },
  { id: 3, date: "Wed July 9", rides: 6, amount: 1420, status: "PAID" },
  { id: 4, date: "Thu July 10", rides: 9, amount: 2080, status: "PAID" },
  { id: 5, date: "Fri July 11", rides: 5, amount: 980, status: "PENDING" },
];

export default function DriverEarningsPage() {
  const [activeTab, setActiveTab] = useState("This Week");

  return (
    <div className="flex h-full w-full bg-[#2B3542] text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-sans overflow-auto p-4 md:p-8">
       
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 border border-slate-200 dark:border-slate-700 border-dashed p-1 lg:p-6 rounded-xl">
        
        {/* Left Column - Earnings & Payouts (7 cols wide) */}
        <div className="lg:col-span-7 flex flex-col space-y-8 pr-0 lg:pr-8 border-r-0 lg:border-r border-slate-200 dark:border-slate-700">
          
          {/* Header Section */}
          <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white tracking-tight mb-2">My Earnings</h1>
             <p className="text-slate-500 dark:text-slate-400">Track your income and performance</p>
          </div>

          {/* Time Tabs */}
          <div className="flex items-center gap-2 bg-[#364251] p-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
            {["Today", "This Week", "This Month"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab 
                    ? "bg-[#E57036] text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-md" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-[#364251] rounded-lg p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-[100px]">
               <div className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wider">Total Earnings</div>
               <div className="flex items-center justify-between">
                 <div className="text-2xl font-bold text-[#E57036]">ETB 12,450</div>
                 <TrendingUp size={20} className="text-[#10b981]" />
               </div>
            </div>

            <div className="bg-[#364251] rounded-lg p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-[100px]">
               <div className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wider">Total Rides</div>
               <div className="flex items-center justify-between">
                 <div className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">48 rides</div>
                 <Car size={20} className="text-[#E57036]" />
               </div>
            </div>

            <div className="bg-[#364251] rounded-lg p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-[100px]">
               <div className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wider">Online Hours</div>
               <div className="flex items-center justify-between">
                 <div className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">32.5 hrs</div>
                 <Clock size={20} className="text-[#E57036]" />
               </div>
            </div>

            <div className="bg-[#364251] rounded-lg p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-[100px]">
               <div className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wider">Average per Ride</div>
               <div className="flex items-center justify-between">
                 <div className="text-2xl font-bold text-[#E57036]">ETB 259</div>
                 <BarChart2 size={20} className="text-[#E57036]" />
               </div>
            </div>

          </div>

          {/* Recent Payouts */}
          <div className="pt-2">
             <h2 className="text-[11px] font-bold tracking-widest text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white uppercase mb-4">RECENT PAYOUTS</h2>
             <div className="space-y-3">
               {MOCK_PAYOUTS.map(payout => (
                 <div key={payout.id} className="bg-[#364251] rounded-lg p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-[#3d4a5c] transition-colors">
                    <div>
                       <div className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-0.5">{payout.date}</div>
                       <div className="text-[11px] text-slate-500 dark:text-slate-400">{payout.rides} rides</div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                       <div className="text-[#E57036] font-bold">ETB {payout.amount.toLocaleString()}</div>
                       <div className={`text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wider w-[70px] text-center ${
                         payout.status === "PAID" 
                           ? "bg-[#10b981]/10 text-[#10b981]" 
                           : "bg-[#E57036]/10 text-[#E57036]"
                       }`}>
                         {payout.status}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column - Chart & Withdraw (5 cols wide) */}
        <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-0">
           
           <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white tracking-tight mb-6">Earnings This Week</h2>
           
           {/* Chart Placeholder Box */}
           <div className="bg-[#364251] rounded-lg border border-slate-200 dark:border-slate-700 w-full aspect-[4/3] flex flex-col justify-end p-6 mb-8 relative">
              {/* Fake bars (visual only) */}
              <div className="absolute bottom-16 left-0 right-0 top-6 px-10 flex items-end justify-between">
                 <div className="w-[10%] bg-gray-500/30 rounded-t-sm h-[40%]"></div>
                 <div className="w-[10%] bg-gray-500/30 rounded-t-sm h-[60%]"></div>
                 <div className="w-[10%] bg-[#E57036]/80 rounded-t-sm h-[35%]"></div>
                 <div className="w-[10%] bg-gray-500/30 rounded-t-sm h-[50%]"></div>
                 <div className="w-[10%] bg-gray-500/30 rounded-t-sm h-[20%]"></div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 dark:text-slate-400 w-full mt-auto px-4 z-10 border-t border-slate-200 dark:border-slate-700 pt-4">
                 <span>Mon</span>
                 <span>Tue</span>
                 <span>Wed</span>
                 <span>Thu</span>
                 <span>Fri</span>
              </div>
           </div>

           {/* Payout Details */}
           <div className="space-y-6 flex-1 text-sm border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
              
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Commission Rate</span>
                <span className="text-[#10b981] font-medium">8% — Lowest in Ethiopia</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Next Scheduled Payout</span>
                <span className="text-slate-500 dark:text-slate-400">Saturday July 12</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Payout Method</span>
                <div className="text-right">
                  <div className="text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium">Telebirr</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">09XX XXX XXX</div>
                </div>
              </div>

           </div>

           {/* Withdraw Button */}
           <button className="w-full bg-[#E57036] hover:bg-[#d96634] text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold text-lg py-5 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20">
             Withdraw Earnings
             <CreditCard size={20} />
           </button>

        </div>
      </div>
    </div>
  );
}
