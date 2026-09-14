"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Edit2, Save, X, CheckCircle2, Lock, Shield } from "lucide-react";
import { getCurrentUserAction } from "@/actions/auth";
import { updateProfileAction, changePasswordAction } from "@/actions/users";

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = await getCurrentUserAction();
      if (currentUser && currentUser.role === "admin") {
        setUser(currentUser);
        setFormData({
          name: currentUser.name || "",
          phone: currentUser.phone || "",
          email: currentUser.email || ""
        });
      }
    };
    loadProfile();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email) {
      showToast("Name and email are required", "error");
      return;
    }
    
    const res = await updateProfileAction(formData);
    if (res.success) {
      setUser({ ...user, name: formData.name, email: formData.email, phone: formData.phone });
      setIsEditing(false);
      showToast("Profile updated successfully!");
    } else {
      showToast(res.message, "error");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    
    const res = await changePasswordAction(passwordData.currentPassword, passwordData.newPassword);
    if (res.success) {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated successfully!");
    } else {
      showToast(res.message, "error");
    }
  };

  if (!user) return <div className="flex h-full items-center justify-center p-8 text-slate-500 font-medium">Loading profile...</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="text-orange-600 dark:text-orange-500" /> Admin Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Personal Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={20} className="text-orange-500" /> Personal Information
              </h2>
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="p-2 text-slate-500 hover:text-red-500 bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors">
                    <X size={16} />
                  </button>
                  <button onClick={handleSaveProfile} className="p-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors flex items-center gap-1 text-sm font-bold">
                    <Save size={16} /> Save
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><User size={16} className="text-slate-400"/> {user.name}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><Mail size={16} className="text-slate-400"/> {user.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2 font-mono">
                    <Phone size={16} className="text-slate-400"/> {user.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Lock size={20} className="text-slate-500" /> Security
            </h2>
            
            {!isChangingPassword ? (
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-lg transition-colors text-sm"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
