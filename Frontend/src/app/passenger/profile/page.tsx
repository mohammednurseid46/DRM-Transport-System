"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, MapPin, CreditCard, ShieldAlert, Heart, Edit2, Save, X, Plus, AlertTriangle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { getCurrentUser, User as AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";

// Extended interface for Passenger to include specific fields
interface PassengerUser extends AuthUser {
  emergencyContacts?: Array<{ id: number; name: string; phone: string; relationship: string }>;
  favoriteLandmarks?: Array<{ id: number; label: string; location: string }>;
  paymentMethod?: string;
}

export default function PassengerProfilePage() {
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<PassengerUser | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    paymentMethod: "Telebirr"
  });

  // Modal states
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });
  
  const [showLandmarkModal, setShowLandmarkModal] = useState(false);
  const [newLandmark, setNewLandmark] = useState({ label: "Home", location: "Kebele 04, Bahir Dar" });

  const [toast, setToast] = useState<string | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.get('/auth/profile');
        // Merge backend profile with local mock data for landmarks/contacts
        const currentUserStr = localStorage.getItem('dms_current_user');
        const localData = currentUserStr ? JSON.parse(currentUserStr) : {};
        
        const mergedUser = {
          ...localData,
          id: data.user_id,
          name: data.full_name,
          email: data.email,
          phone: data.phone_number,
        };
        
        setUser(mergedUser);
        setFormData({
          name: mergedUser.name || "",
          phone: mergedUser.phone || "",
          email: mergedUser.email || "",
          paymentMethod: mergedUser.paymentMethod || "Telebirr"
        });
      } catch (err) {
        console.error("Failed to load profile", err);
        // Fallback to local storage if API fails or token is missing
        const currentUser = getCurrentUser() as PassengerUser;
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);
        setFormData({
          name: currentUser.name || "",
          phone: currentUser.phone || "",
          email: currentUser.email || "",
          paymentMethod: currentUser.paymentMethod || "Telebirr"
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadProfile();
  }, [router]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const updateLocalStorageUser = (updatedUser: PassengerUser) => {
    // We only update current user locally since there's no backend PUT /profile yet
    localStorage.setItem('dms_current_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const updatedUser = { ...user, ...formData };
    
    // In a full implementation, we'd PUT to /api/auth/profile here.
    // Since backend lacks this, we just update local storage.
    updateLocalStorageUser(updatedUser);
    setIsEditing(false);
    showToast("Profile updated successfully!");
  };

  const handleAddContact = () => {
    if (!user || !newContact.name || !newContact.phone) return;
    const contact = { ...newContact, id: Date.now() };
    const updatedUser = {
      ...user,
      emergencyContacts: [...(user.emergencyContacts || []), contact]
    };
    updateLocalStorageUser(updatedUser);
    setShowContactModal(false);
    setNewContact({ name: "", phone: "", relationship: "" });
    showToast("Emergency contact added!");
  };

  const handleRemoveContact = (id: number) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      emergencyContacts: (user.emergencyContacts || []).filter(c => c.id !== id)
    };
    updateLocalStorageUser(updatedUser);
  };

  const handleAddLandmark = () => {
    if (!user) return;
    const landmark = { ...newLandmark, id: Date.now() };
    const updatedUser = {
      ...user,
      favoriteLandmarks: [...(user.favoriteLandmarks || []), landmark]
    };
    updateLocalStorageUser(updatedUser);
    setShowLandmarkModal(false);
    showToast("Favorite landmark added!");
  };

  const handleRemoveLandmark = (id: number) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      favoriteLandmarks: (user.favoriteLandmarks || []).filter(l => l.id !== id)
    };
    updateLocalStorageUser(updatedUser);
  };

  const getMaskedPhone = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/(\d{4})\d{4}(\d{2})/, "$1••••$2");
  };

  const paymentMethods = ["Telebirr", "eBirr", "CBE Birr", "Cash"];
  const bahirDarLocations = ["Kebele 04, Bahir Dar", "BDU Poly Campus", "Abay Mado", "Papyrus Hotel"];

  if (!user) return <div className="flex h-full items-center justify-center p-8 text-slate-500 font-medium">Loading profile...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 overflow-y-auto pb-24 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Profile Card & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><User size={16} className="text-slate-400"/> {user.name}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <div className="flex items-center justify-between group">
                    <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2 font-mono">
                      <Phone size={16} className="text-slate-400"/> 
                      {showPhone ? user.phone : getMaskedPhone(user.phone || "")}
                    </p>
                    <button 
                      onClick={() => setShowPhone(!showPhone)} 
                      className="text-slate-400 hover:text-orange-500 transition-colors p-1"
                      title={showPhone ? "Hide phone" : "Show phone"}
                    >
                      {showPhone ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><Mail size={16} className="text-slate-400"/> {user.email || "Not provided"}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Default City</label>
                <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2"><MapPin size={16} className="text-slate-400"/> Bahir Dar <span className="bg-slate-100 dark:bg-slate-700 text-[10px] px-2 py-0.5 rounded text-slate-500 font-bold ml-1">Locked</span></p>
              </div>
            </div>
            
            <hr className="my-6 border-slate-200 dark:border-slate-700" />
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <CreditCard size={14} /> Preferred Payment Method
              </label>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map(method => (
                  <button 
                    key={method}
                    disabled={!isEditing}
                    onClick={() => setFormData({...formData, paymentMethod: method})}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      formData.paymentMethod === method 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600 dark:text-orange-500' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-300 disabled:opacity-50 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Landmarks */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart size={20} className="text-pink-500" /> Favorite Landmarks
                </h2>
                <button 
                  onClick={() => setShowLandmarkModal(true)}
                  className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1.5 rounded-lg transition-colors"
                >
                   <Plus size={20} />
                </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {user.favoriteLandmarks && user.favoriteLandmarks.length > 0 ? (
                 user.favoriteLandmarks.map((landmark) => (
                    <div key={landmark.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between group">
                       <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{landmark.label}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {landmark.location}</p>
                       </div>
                       <button onClick={() => handleRemoveLandmark(landmark.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={16} />
                       </button>
                    </div>
                 ))
               ) : (
                 <div className="col-span-1 sm:col-span-2 text-center py-6 text-sm text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    No favorite landmarks saved.
                 </div>
               )}
             </div>

             {/* Add Landmark Modal */}
             {showLandmarkModal && (
                <div className="absolute inset-0 bg-white dark:bg-slate-800 z-10 rounded-2xl p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Landmark</h3>
                      <button onClick={() => setShowLandmarkModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                   </div>
                   <div className="space-y-4 flex-1">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Label (e.g., Home, Gym)</label>
                         <input type="text" value={newLandmark.label} onChange={e => setNewLandmark({...newLandmark, label: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500" placeholder="Home" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Select Location</label>
                         <select value={newLandmark.location} onChange={e => setNewLandmark({...newLandmark, location: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-orange-500">
                            {bahirDarLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                         </select>
                      </div>
                   </div>
                   <button onClick={handleAddLandmark} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                      Save Landmark
                   </button>
                </div>
             )}
          </div>
        </div>

        {/* Right Sidebar - Emergency Contacts */}
        <div className="space-y-6 relative">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500">
                <ShieldAlert size={100} />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                   <ShieldAlert size={24} />
                   <h2 className="text-lg font-bold">Emergency Contacts</h2>
                </div>
                <p className="text-sm text-red-800/70 dark:text-red-300/70 mb-6">
                   These contacts will receive an auto-alert SMS if you trigger the SOS safety feature during a ride.
                </p>

                <div className="space-y-3 mb-6">
                   {user.emergencyContacts && user.emergencyContacts.length > 0 ? (
                     user.emergencyContacts.map(contact => (
                        <div key={contact.id} className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/50 p-3 rounded-xl flex justify-between items-center shadow-sm">
                           <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">
                                {contact.name} <span className="text-xs font-normal text-slate-500">({contact.relationship})</span>
                              </p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{contact.phone}</p>
                           </div>
                           <button onClick={() => handleRemoveContact(contact.id)} className="text-slate-400 hover:text-red-500 p-1">
                              <X size={16} />
                           </button>
                        </div>
                     ))
                   ) : (
                     <div className="text-center py-4 text-sm text-red-400 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-dashed border-red-200 dark:border-red-900/30">
                        No trusted contacts added.
                     </div>
                   )}
                </div>

                <button 
                  onClick={() => setShowContactModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                   <Plus size={16} /> Add Trusted Contact
                </button>
             </div>
             
             {/* Add Contact Modal */}
             {showContactModal && (
                <div className="absolute inset-0 bg-white dark:bg-slate-800 z-20 rounded-2xl p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-red-200 dark:border-red-900/30">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Contact</h3>
                      <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                   </div>
                   <div className="space-y-4 flex-1">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Contact Name</label>
                         <input type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-red-500" placeholder="Full Name" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Relationship</label>
                         <input type="text" value={newContact.relationship} onChange={e => setNewContact({...newContact, relationship: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-red-500" placeholder="Brother, Friend" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                         <input type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:border-red-500" placeholder="0911..." />
                      </div>
                   </div>
                   <button 
                     onClick={handleAddContact} 
                     disabled={!newContact.name || !newContact.phone}
                     className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                   >
                      Save Contact
                   </button>
                </div>
             )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl flex gap-3">
             <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
             <p className="text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed">
                <span className="font-bold">Safety Tip:</span> Always confirm the driver's license plate and car model before entering the vehicle. Your safety is our priority.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
