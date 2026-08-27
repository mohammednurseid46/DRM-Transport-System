"use client";

import React, { useState, useEffect } from "react";
import { User, resetPassword } from "@/lib/auth";
import { CheckCircle, XCircle, FileText, UserCheck, Car, Calendar, Search, ShieldAlert, Star, ToggleLeft, ToggleRight, Users } from "lucide-react";

export default function DriverManagementPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending");
  const [drivers, setDrivers] = useState<User[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [resetPasswordModalDriver, setResetPasswordModalDriver] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchDrivers = () => {
    const data = localStorage.getItem("drivers") || localStorage.getItem("dms_users");
    if (data) {
      const allUsers = JSON.parse(data);
      setDrivers(allUsers.filter((u: any) => u.role === "driver"));
    } else {
      setDrivers([]);
    }
  };

  useEffect(() => {
    fetchDrivers();
    window.addEventListener("storage", fetchDrivers);
    return () => window.removeEventListener("storage", fetchDrivers);
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = (driverId: string) => {
    const data = localStorage.getItem("drivers") || localStorage.getItem("dms_users") || "[]";
    const allUsers = JSON.parse(data);
    const updated = allUsers.map((u: any) => u.id === driverId ? { ...u, is_verified: true } : u);
    localStorage.setItem("drivers", JSON.stringify(updated));
    localStorage.setItem("dms_users", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    showNotification("Driver Approved Successfully!", "success");
    fetchDrivers();
  };

  const handleReject = (driverId: string) => {
    if (window.confirm("Are you sure you want to reject and remove this driver?")) {
      const data = localStorage.getItem("drivers") || localStorage.getItem("dms_users") || "[]";
      const allUsers = JSON.parse(data);
      const updated = allUsers.filter((u: any) => u.id !== driverId);
      localStorage.setItem("drivers", JSON.stringify(updated));
      localStorage.setItem("dms_users", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      showNotification("Driver Rejected and Removed.", "error");
      fetchDrivers();
    }
  };

  const toggleAvailability = (driverId: string) => {
    const data = localStorage.getItem("drivers") || localStorage.getItem("dms_users") || "[]";
    const allUsers = JSON.parse(data);
    const updated = allUsers.map((u: any) => u.id === driverId ? { ...u, isAvailable: !u.isAvailable } : u);
    localStorage.setItem("drivers", JSON.stringify(updated));
    localStorage.setItem("dms_users", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    showNotification("Driver availability updated.", "success");
    fetchDrivers();
  };

  const handleAdminResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordModalDriver) return;
    
    if (newPassword.length < 6) {
      showNotification("Password must be at least 6 characters.", "error");
      return;
    }

    const response = resetPassword(resetPasswordModalDriver.email, newPassword);
    if (response.success) {
      showNotification("Driver password reset successfully.", "success");
      setResetPasswordModalDriver(null);
      setNewPassword("");
    } else {
      showNotification(response.message, "error");
    }
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return "N/A";
    if (phone.startsWith("+251") || phone.startsWith("251")) {
      const p = phone.replace("+", "");
      return `+${p.slice(0, 3)} ${p.slice(3, 5)} •••• ${p.slice(-2)}`;
    }
    return `${phone.slice(0, 4)}••••${phone.slice(-2)}`;
  };

  const pendingDrivers = drivers.filter(d => !d.is_verified);
  const verifiedDrivers = drivers.filter(d => d.is_verified);
  const activeOnlineCount = verifiedDrivers.filter(d => d.isAvailable).length;
  
  const currentList = activeTab === "pending" ? pendingDrivers : verifiedDrivers;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 relative h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-slate-900 dark:text-slate-900 dark:text-white animate-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="text-orange-600 dark:text-orange-500" /> Driver Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verify and manage fleet drivers.</p>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search drivers..." 
            className="w-full sm:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Top Fleet Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Drivers</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{drivers.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{pendingDrivers.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
            <Car size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active / Online Fleet</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{activeOnlineCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors border-b-2 ${activeTab === 'pending' ? 'text-orange-600 dark:text-orange-500 border-orange-500 bg-orange-500/5' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Pending Verification ({pendingDrivers.length})
        </button>
        <button 
          onClick={() => setActiveTab("verified")}
          className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors border-b-2 ${activeTab === 'verified' ? 'text-green-500 border-green-500 bg-green-500/5' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Verified Drivers ({verifiedDrivers.length})
        </button>
      </div>

      {/* Driver List */}
      <div className="flex-1 space-y-4">
        {drivers.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
             <Car className="w-12 h-12 text-slate-400 mb-2" />
             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">No Drivers Registered Yet</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Drivers who sign up through the driver registration portal will appear here.</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
               {activeTab === 'pending' ? <ShieldAlert size={32} className="text-slate-400" /> : <UserCheck size={32} className="text-slate-400" />}
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">No {activeTab} drivers found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {currentList.map(driver => (
              <div key={driver.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group">
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {driver.is_verified ? (
                    <span className="px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle size={12} /> Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert size={12} /> Pending KYC
                    </span>
                  )}
                </div>

                {/* Driver Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center font-bold text-xl uppercase border border-orange-200 dark:border-orange-500/30">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{driver.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{driver.email} • {maskPhone(driver.phone)}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> Applied: {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Vehicle & Tier Info */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Vehicle</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Car size={14} className="text-orange-600 dark:text-orange-500" /> {driver.vehicleModel || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Plate Number</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{driver.plateNumber || "N/A"}</p>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 pt-2 border-t border-slate-200 dark:border-slate-700 mt-1 gap-2">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tier Category</p>
                      <p className="text-sm font-bold text-orange-600 dark:text-orange-500">{driver.tier || "Economy"}</p>
                    </div>
                    {driver.is_verified && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Rating</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {(Math.random() * 1.5 + 3.5).toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Previews (Pending Only) */}
                {!driver.is_verified && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Uploaded Documents</p>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors">
                        <FileText size={14} className="text-blue-500 dark:text-blue-400" /> License
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors">
                        <FileText size={14} className="text-green-500 dark:text-green-400" /> Bolo
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors">
                        <FileText size={14} className="text-yellow-500 dark:text-yellow-400" /> Insurance
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!driver.is_verified && (
                  <div className="flex gap-3 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => handleReject(driver.id)}
                      className="flex-1 py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 text-sm font-bold rounded-lg border border-red-200 dark:border-red-500/20 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(driver.id)}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-slate-900 dark:text-slate-900 dark:text-white text-sm font-bold rounded-lg shadow-lg shadow-green-500/20 transition-colors"
                    >
                      Approve & Verify
                    </button>
                  </div>
                )}
                
                {driver.is_verified && (
                  <div className="flex flex-col gap-3 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                     <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                       <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Live Status</span>
                       <button 
                         onClick={() => toggleAvailability(driver.id)}
                         className={`flex items-center gap-2 ${driver.isAvailable ? 'text-green-600 dark:text-green-500' : 'text-slate-400'} transition-colors`}
                       >
                         {driver.isAvailable ? <span className="text-xs font-bold uppercase tracking-wider">Online</span> : <span className="text-xs font-bold uppercase tracking-wider">Offline</span>}
                         {driver.isAvailable ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                       </button>
                     </div>
                     <div className="flex gap-3">
                       <button 
                        onClick={() => setResetPasswordModalDriver(driver)}
                        className="flex-1 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 text-orange-600 dark:text-orange-500 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                       >
                        Reset Password
                       </button>
                       <button 
                        className="flex-1 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 text-red-600 dark:text-red-500 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                       >
                        Suspend
                       </button>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetPasswordModalDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Reset Driver Password</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Set a new password for {resetPasswordModalDriver.name}</p>
                </div>
                <button onClick={() => setResetPasswordModalDriver(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            <form onSubmit={handleAdminResetPassword} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20 py-3 px-4 text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setResetPasswordModalDriver(null)} className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20">
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
