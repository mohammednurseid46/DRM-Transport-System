"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Ban, 
  CheckCircle, 
  Car,
  Search,
  MoreVertical,
  X,
  MapPin,
  Clock,
  History,
  AlertTriangle,
  Star
} from "lucide-react";
import { api } from "@/lib/api";


const MOCK_RIDE_HISTORY = [
  { id: "ride_1", date: "2026-08-25T14:30:00Z", pickup: "BDU Poly Campus", dropoff: "Giyorgis Square", fare: 450, method: "Telebirr", status: "Completed" },
  { id: "ride_2", date: "2026-08-20T09:15:00Z", pickup: "Edna Mall", dropoff: "Piassa", fare: 320, method: "Cash", status: "Completed" },
  { id: "ride_3", date: "2026-08-15T18:45:00Z", pickup: "Kuriftu Resort", dropoff: "Papyrus Hotel", fare: 150, method: "eBirr", status: "Completed" },
];

export default function AdminPassengersPage() {
  const [passengers, setPassengers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unmaskData, setUnmaskData] = useState(false);
  const [showUnmaskWarning, setShowUnmaskWarning] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<any | null>(null);

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const data = await api.get('/admin/passengers');
        setPassengers(data);
      } catch (err) {
        console.error("Failed to fetch passengers", err);
        // Fallback
        const savedUsers = localStorage.getItem("users") || localStorage.getItem("dms_users");
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          const filtered = parsedUsers.filter((u: any) => u.role === "user" || u.role === "passenger");
          
          const enhancedFiltered = filtered.map((u: any) => ({
            ...u,
            status: u.status || "active",
            registeredAt: u.registeredAt || u.createdAt || new Date().toISOString(),
            totalRides: u.totalRides || 0,
            avgRating: u.avgRating || "N/A",
            totalSpent: u.totalSpent || 0
          }));
          setPassengers(enhancedFiltered);
        } else {
          setPassengers([]);
        }
      }
    };
    fetchPassengers();
  }, []);

  const handleToggleMasking = () => {
    if (!unmaskData) {
      // Trigger warning before unmasking
      setShowUnmaskWarning(true);
    } else {
      setUnmaskData(false);
    }
  };

  const confirmUnmask = () => {
    setUnmaskData(true);
    setShowUnmaskWarning(false);
    // In a real app, log this action to the audit trail
    console.log("AUDIT LOG: Admin unmasked passenger PII data at " + new Date().toISOString());
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "N/A";
    if (unmaskData) return phone;
    // Format: +251 91 •••• 44 or 0911••••44
    if (phone.startsWith("+251") || phone.startsWith("251")) {
      const p = phone.replace("+", "");
      return `+${p.slice(0, 3)} ${p.slice(3, 5)} •••• ${p.slice(-2)}`;
    }
    return `${phone.slice(0, 4)}••••${phone.slice(-2)}`;
  };

  const maskEmail = (email: string) => {
    if (!email) return "N/A";
    if (unmaskData) return email;
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, 2)}***@${domain}`;
  };

  const filteredPassengers = passengers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePassengers = passengers.filter(p => p.status === "active").length;
  const totalTrips = passengers.reduce((sum, p) => sum + (p.totalRides || 0), 0);
  const totalRevenue = passengers.reduce((sum, p) => sum + (p.totalSpent || 0), 0);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col h-full overflow-y-auto">
      
      {/* Header & Masking Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">Passenger Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">View and manage registered passengers, ride history, and account status.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button 
              onClick={handleToggleMasking}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                unmaskData 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
              }`}
            >
              {unmaskData ? <EyeOff size={16} /> : <Eye size={16} />}
              {unmaskData ? 'Mask PII Data' : 'Reveal Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Warning Modal */}
      {showUnmaskWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4 text-red-500">
              <ShieldCheck size={32} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Data Privacy Audit Notice</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              You are about to unmask Personally Identifiable Information (PII) including full phone numbers and email addresses. 
              <br/><br/>
              <strong>This action will be logged in the system audit trail.</strong> Do you have a legitimate business reason to view this data?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowUnmaskWarning(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmUnmask}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Reveal Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Passengers</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{passengers.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Accounts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{activePassengers}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
            <Car size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Completed Trips</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{totalTrips}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-bold text-lg">
            Br
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Lifetime Revenue</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Br {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table Section or Empty State */}
      {passengers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-1">
          <Users className="w-12 h-12 text-slate-400 mb-2" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-1">No Registered Passengers Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">Passengers who sign up through the passenger registration portal will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col flex-1">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <th className="p-4">Passenger</th>
                  <th className="p-4">Contact (Protected)</th>
                  <th className="p-4">Ride Stats</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPassengers.map((passenger) => (
                  <tr key={passenger.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Passenger Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0">
                          {passenger.name ? passenger.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{passenger.name || "Unknown User"}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Joined {new Date(passenger.registeredAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4">
                      <div className="text-sm font-mono text-slate-700 dark:text-slate-300">{maskPhone(passenger.phone)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{maskEmail(passenger.email)}</div>
                    </td>

                    {/* Ride Stats */}
                    <td className="p-4">
                      <div className="text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium">{passenger.totalRides} trips</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <Star size={10} className="text-yellow-500 fill-current" /> {passenger.avgRating} Avg Rating
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Br {passenger.totalSpent?.toLocaleString() || 0} Spent
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        passenger.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {passenger.status === 'active' ? <CheckCircle size={12} /> : <Ban size={12} />}
                        {passenger.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedPassenger(passenger)}
                        className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-500 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPassengers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No passengers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Passenger Details Drawer/Modal */}
      {selectedPassenger && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-700">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-2xl font-bold flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700 shadow-md">
                  {selectedPassenger.name ? selectedPassenger.name.charAt(0) : "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedPassenger.name || "Unknown"}</h2>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedPassenger.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {selectedPassenger.status} Account
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPassenger(null)}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              {/* Contact Info */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Information</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Phone</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium">{maskPhone(selectedPassenger.phone)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
                    <span className="text-sm text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-medium">{maskEmail(selectedPassenger.email)}</span>
                  </div>
                  {!unmaskData && (
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/10 p-2 rounded text-blue-600 dark:text-blue-400">
                      <ShieldCheck size={12} /> Data is masked for privacy. Toggle 'Reveal Details' to view.
                    </div>
                  )}
                </div>
              </section>

              {/* Ride History */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Rides</h3>
                  <span className="text-xs text-orange-600 dark:text-orange-500 font-bold hover:underline cursor-pointer">View All</span>
                </div>
                
                <div className="space-y-3">
                  {MOCK_RIDE_HISTORY.map((ride) => (
                    <div key={ride.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {new Date(ride.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{ride.fare} ETB</div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                          <span className="truncate text-xs">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                          <span className="truncate text-xs">{ride.dropoff}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Paid via {ride.method}</span>
                        <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10} /> {ride.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Logs & Complaints */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Incidents & Logs</h3>
                {selectedPassenger.id === "usr_3" ? (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex gap-3">
                    <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Account Suspended</h4>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80">Multiple reports of unpaid cash rides. Pending manual review.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-400 text-sm">
                    No complaints or incidents recorded.
                  </div>
                )}
              </section>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button 
                className={`w-full py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 ${
                  selectedPassenger.status === 'active'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-900/50'
                }`}
              >
                {selectedPassenger.status === 'active' ? (
                  <><Ban size={18} /> Suspend Passenger</>
                ) : (
                  <><CheckCircle size={18} /> Reactivate Passenger</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
