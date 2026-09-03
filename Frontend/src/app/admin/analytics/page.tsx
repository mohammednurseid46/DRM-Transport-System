"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, Car, CreditCard, Activity, Calendar, Download } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"Today" | "7 Days" | "30 Days">("7 Days");

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    platformCommission: 0,
    totalRides: 0,
    activeDrivers: 0,
    cancellationRate: "0.0%",
  });

  useEffect(() => {
    const computeAnalytics = () => {
      // Revenue & Rides
      const passengerRidesStr = localStorage.getItem("passengerRides");
      let rev = 0;
      let rides = 0;
      if (passengerRidesStr) {
        const parsedRides = JSON.parse(passengerRidesStr);
        rides = parsedRides.length;
        rev = parsedRides.reduce((sum: number, r: any) => sum + (r.fare || 0), 0);
      }

      // Active Drivers
      const usersStr = localStorage.getItem("dms_users");
      let drivers = 0;
      if (usersStr) {
        const parsedUsers = JSON.parse(usersStr);
        drivers = parsedUsers.filter((u: any) => u.role === "driver" && u.is_verified && u.isAvailable).length;
      }

      setMetrics({
        totalRevenue: rev,
        platformCommission: rev * 0.1,
        totalRides: rides,
        activeDrivers: drivers,
        cancellationRate: "0.0%", 
      });
    };

    computeAnalytics();
    const interval = setInterval(computeAnalytics, 5000);
    window.addEventListener("storage", computeAnalytics);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", computeAnalytics);
    };
  }, []);

  // Format currency
  const formatCur = (val: number) => `Br ${val.toLocaleString()}`;

  // Mock chart data (values 0-100 for height percentage)
  const revenueData = [
    { label: "Mon", value: 45, amount: "Br 45k" },
    { label: "Tue", value: 55, amount: "Br 55k" },
    { label: "Wed", value: 40, amount: "Br 40k" },
    { label: "Thu", value: 65, amount: "Br 65k" },
    { label: "Fri", value: 85, amount: "Br 85k" },
    { label: "Sat", value: 100, amount: "Br 100k" },
    { label: "Sun", value: 90, amount: "Br 90k" },
  ];

  const rideTypeData = [
    { label: "Economy", percentage: 55, color: "bg-orange-500" },
    { label: "Shared", percentage: 30, color: "bg-purple-500" },
    { label: "Comfort", percentage: 15, color: "bg-blue-500" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-orange-600 dark:text-orange-500" /> Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform performance, revenue metrics, and operational KPIs.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            {["Today", "7 Days", "30 Days"].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-900 dark:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-slate-900 dark:text-slate-900 dark:text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors text-sm font-bold shadow-md">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Revenue */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <CreditCard size={64} />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Gross Revenue</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-4">{formatCur(metrics.totalRevenue)}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400`}>
              <TrendingUp size={16} />
              +0.0%
            </span>
            <span className="text-slate-500 dark:text-slate-400">vs previous period</span>
          </div>
        </div>

        {/* Commission */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Activity size={64} />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Platform Commission (10%)</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-4">{formatCur(metrics.platformCommission)}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400`}>
              <TrendingUp size={16} />
              +0.0%
            </span>
            <span className="text-slate-500 dark:text-slate-400">vs previous period</span>
          </div>
        </div>

        {/* Rides */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Car size={64} />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Rides</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-4">{metrics.totalRides}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400`}>
              <TrendingUp size={16} />
              +0.0%
            </span>
            <span className="text-slate-500 dark:text-slate-400">vs previous period</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Revenue Trend</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily gross revenue across all payment methods</p>
            </div>
          </div>
          
          {/* Custom CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pt-4">
            {revenueData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <div className="w-full relative flex items-end justify-center h-48 bg-slate-50 dark:bg-slate-900/50 rounded-t-lg">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-white text-xs font-bold py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                    {data.amount}
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full md:w-4/5 bg-orange-500 hover:bg-orange-400 rounded-t-md transition-all duration-500 ease-out" 
                    style={{ height: `${data.value}%` }}
                  ></div>
                </div>
                <div className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{data.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown & Secondary KPIs */}
        <div className="space-y-6">
          
          {/* Ride Types Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-6">Ride Categories</h3>
            
            <div className="space-y-4">
              {rideTypeData.map((type, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{type.label}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{type.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div className={`${type.color} h-2 rounded-full`} style={{ width: `${type.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-6">Operational KPIs</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400"><Users size={14}/></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Drivers</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white block">{metrics.activeDrivers}</span>
                  <span className={`text-xs font-bold text-emerald-500`}>+0</span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400"><TrendingDown size={14}/></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cancellation Rate</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white block">{metrics.cancellationRate}</span>
                  <span className={`text-xs font-bold text-emerald-500`}>-0.0%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400"><Activity size={14}/></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Rating</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white block">5.0 / 5.0</span>
                  <span className={`text-xs font-bold text-emerald-500`}>+0.0</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
