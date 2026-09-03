"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, Car, Edit2, Save, X, CheckCircle2, Wallet, Award, Activity, ArrowLeft } from "lucide-react";
import { getCurrentUser, User as AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";

export default function DriverProfilePage() {
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleModel: "",
    plateNumber: ""
  });

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.get('/auth/profile');
        
        const currentUserStr = localStorage.getItem('dms_current_user');
        const localData = currentUserStr ? JSON.parse(currentUserStr) : {};
        
        const mergedUser = {
          ...localData,
          id: data.user_id,
          name: data.full_name,
          email: data.email,
          phone: data.phone_number,
          is_verified: data.is_active, // Assuming is_active maps to verified for now
          // Fetch vehicle info if driver is included
          vehicleModel: data.driver?.vehicle?.model || localData.vehicleModel || "Toyota Corolla",
          plateNumber: data.driver?.vehicle?.plate_number || localData.plateNumber || "AA 12345"
        };
        
        setUser(mergedUser);
        setFormData({
          name: mergedUser.name || "",
          phone: mergedUser.phone || "",
          email: mergedUser.email || "",
          vehicleModel: mergedUser.vehicleModel || "",
          plateNumber: mergedUser.plateNumber || ""
        });
      } catch (err) {
        console.error("Failed to load profile", err);
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== "driver") {
          router.push("/login");
          return;
        }
        
        setUser(currentUser);
        setFormData({
          name: currentUser.name || "",
          phone: currentUser.phone || "",
          email: currentUser.email || "",
          vehicleModel: currentUser.vehicleModel || "Toyota Corolla",
          plateNumber: currentUser.plateNumber || "AA 12345"
        });
      }
    };
    
    loadProfile();
  }, [router]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = () => {
    if (!user) return;
    
    const updatedUser = { ...user, ...formData };
    
    // Update current user
    localStorage.setItem('dms_current_user', JSON.stringify(updatedUser));
    
    // Update in users array
    const usersStr = localStorage.getItem('dms_users');
    if (usersStr) {
      const users: AuthUser[] = JSON.parse(usersStr);
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('dms_users', JSON.stringify(users));
      }
    }
    
    setUser(updatedUser);
    setIsEditing(false);
    showToast("Profile updated successfully!");
  };

  if (!user) return <div className="flex h-full items-center justify-center p-8 text-slate-500 font-medium bg-slate-50 dark:bg-slate-950 transition-colors duration-200">Loading profile...</div>;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200 p-4 md:p-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        
        {/* Back to Dashboard Navigation */}
        <div className="mb-2">
          <Link href="/driver" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Driver Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-orange-500" /> Personal Information
                </h2>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                    <button onClick={handleSaveProfile} className="p-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors flex items-center gap-1 text-sm font-bold">
                      <Save size={16} /> Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <Edit2 size={16} /> Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><User size={16} className="text-slate-400 dark:text-slate-500"/> {user.name}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2 font-mono">
                      <Phone size={16} className="text-slate-400 dark:text-slate-500"/> {user.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><Mail size={16} className="text-slate-400 dark:text-slate-500"/> {user.email}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                    <Activity size={16} className="text-slate-400 dark:text-slate-500"/> 
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.is_verified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500'}`}>
                      {user.is_verified ? "Verified" : "Pending Verification"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Car size={20} className="text-blue-500" /> Vehicle Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Model</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.vehicleModel} 
                      onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg transition-colors">{user.vehicleModel || "Not specified"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Plate Number</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.plateNumber} 
                      onChange={e => setFormData({...formData, plateNumber: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 uppercase transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium font-mono bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg transition-colors">{user.plateNumber || "Not specified"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Payout Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={20} className="text-green-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payout Details</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Primary Method</p>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">CBE Account</p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    1000****4567
                  </div>
                </div>
                
                <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Alternative</p>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">Telebirr</p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    0911****44
                  </div>
                </div>
                
                <button className="w-full py-2 text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-medium transition-colors border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500/50 rounded-lg mt-2">
                  + Add Payout Method
                </button>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200">
               <div className="flex items-center gap-2 mb-4">
                 <Award size={20} className="text-yellow-500" />
                 <h2 className="text-lg font-bold text-slate-900 dark:text-white">Driver Stats</h2>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
                   <p className="text-2xl font-bold text-slate-900 dark:text-white">4.9<span className="text-sm text-slate-500">★</span></p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Rating</p>
                 </div>
                 <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center transition-colors">
                   <p className="text-2xl font-bold text-slate-900 dark:text-white">142</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Total Rides</p>
                 </div>
                 <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center col-span-2 transition-colors">
                   <p className="text-lg font-bold text-green-600 dark:text-green-400">Bronze Tier</p>
                   <p className="text-xs text-slate-500 mt-1">Top 20% in Bahir Dar</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
