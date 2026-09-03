"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BellOff, Car, CreditCard, ShieldAlert, Users, Trash2, CheckCheck, MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

type NotificationCategory = "Trips" | "Payments & Splits" | "Safety & System";

interface Notification {
  id: string | number;
  title: string;
  message: string;
  read: boolean;
  time: string;
  category: NotificationCategory;
  actionText?: string;
  actionLink?: string;
}

export default function PassengerNotificationsPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"All" | NotificationCategory>("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Removed localStorage fetching since backend will provide this later.

    // Auto-generate contextual initial records if empty
    const initialNotifications: Notification[] = [
      { 
        id: Date.now() + 1, 
        title: "Trip Update", 
        message: "Driver Dawit Tadesse has arrived at BDU Poly Campus pickup point.", 
        read: false, 
        time: "Just now", 
        category: "Trips",
        actionText: "View Trip Details",
        actionLink: "/passenger/history"
      },
      { 
        id: 2, 
        title: "Payment Receipt", 
        message: "Payment of 180.00 ETB confirmed via Telebirr. Locked Fare applied.", 
        read: false, 
        time: "2 hours ago", 
        category: "Payments & Splits",
        actionText: "View Receipt"
      },
      { 
        id: 3, 
        title: "Safety Alert", 
        message: "Your ride from Kebele 04 to Papyrus Hotel is protected under zero-detour monitoring.", 
        read: true, 
        time: "Yesterday", 
        category: "Safety & System"
      },
      { 
        id: 4, 
        title: "Shared Ride Split", 
        message: "Co-passenger joined your route. Your fare reduced to 90.00 ETB.", 
        read: true, 
        time: "2 days ago", 
        category: "Payments & Splits"
      }
    ];

    setNotifications(initialNotifications);
    setIsLoading(false);
  }, [router]);

  const saveNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const clearAll = () => {
    const updated = notifications.filter(n => activeTab !== "All" ? n.category !== activeTab : false);
    saveNotifications(updated);
  };

  const deleteNotification = (id: string | number) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const markAsRead = (id: string | number) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const filteredNotifications = notifications.filter(n => activeTab === "All" || n.category === activeTab);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Trips": return <Car size={20} className="text-blue-500" />;
      case "Payments & Splits": return <CreditCard size={20} className="text-green-500" />;
      case "Safety & System": return <ShieldAlert size={20} className="text-red-500" />;
      default: return <BellOff size={20} className="text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Trips": return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "Payments & Splits": return "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "Safety & System": return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default: return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center text-slate-500">Loading notifications...</div>;

  const tabs: ("All" | NotificationCategory)[] = ["All", "Trips", "Payments & Splits", "Safety & System"];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto pb-24 h-full">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            Notifications & Updates
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-sm font-bold px-3 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated on your rides, payments, and safety alerts.</p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <CheckCheck size={16} /> Mark All Read
            </button>
            <button 
              onClick={clearAll}
              className="px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Clear {activeTab !== "All" ? activeTab : "All"}
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors border ${
              activeTab === tab
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
            }`}
          >
            {tab}
            {tab === "All" && unreadCount > 0 && <span className="ml-2 text-xs opacity-70">({unreadCount})</span>}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`group relative p-4 md:p-6 bg-white dark:bg-slate-800 border rounded-2xl shadow-sm transition-all duration-200 ${
                !notification.read 
                  ? 'border-orange-200 dark:border-orange-500/30 bg-orange-50/30 dark:bg-orange-900/10' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onMouseEnter={() => !notification.read && markAsRead(notification.id)}
            >
              {!notification.read && (
                <div className="absolute top-6 left-3 md:left-4 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              )}
              
              <div className="flex gap-4 md:gap-6 pl-4 md:pl-6">
                <div className="shrink-0 pt-1">
                  <div className={`p-3 rounded-full border ${getCategoryBadgeClass(notification.category)}`}>
                    {getCategoryIcon(notification.category)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className={`text-base font-bold ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    {notification.actionText ? (
                      <button 
                        onClick={() => notification.actionLink && router.push(notification.actionLink)}
                        className="text-sm font-bold text-orange-600 dark:text-orange-500 hover:underline flex items-center gap-1"
                      >
                        {notification.actionText} &rarr;
                      </button>
                    ) : (
                      <div /> // Spacer
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-3xl">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full mb-4">
              <BellOff className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Notifications Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              You will receive updates here regarding your ride requests, payments, and safety alerts. {activeTab !== "All" && `Check back later for ${activeTab} updates.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
