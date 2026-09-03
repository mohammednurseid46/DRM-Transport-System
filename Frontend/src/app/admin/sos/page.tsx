"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, PhoneCall, ShieldAlert, ShieldCheck, CheckCircle, Navigation, Clock, User, Car } from "lucide-react";
import { api } from "@/lib/api";

interface SOSIncident {
  id: string;
  triggeredBy: string; // "Passenger: Name" or "Driver: Name"
  role: "passenger" | "driver";
  phone: string;
  plateNumber: string;
  timestamp: string;
  location: string;
  status: "active" | "resolved";
}

export default function AdminSOSPage() {
  const [incidents, setIncidents] = useState<SOSIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSOS();
    window.addEventListener("storage", loadSOS);
    window.addEventListener("sos-updated", loadSOS);
    return () => {
      window.removeEventListener("storage", loadSOS);
      window.removeEventListener("sos-updated", loadSOS);
    };
  }, []);

  const loadSOS = async () => {
    try {
      let combined: any[] = [];
      try {
        const apiData = await api.get('/admin/sos');
        if (Array.isArray(apiData)) combined = [...apiData];
      } catch (err) {
        console.error("Failed to fetch SOS from API", err);
      }
      
      const sosData = localStorage.getItem("emergencySOS");
      if (sosData) {
        const parsed = JSON.parse(sosData);
        if (Array.isArray(parsed)) {
          combined = [...combined, ...parsed];
        } else {
          combined = [...combined, parsed];
        }
      }
      setIncidents(combined);
    } catch (e) {
      setIncidents([]);
    }
    setLoading(false);
  };

  const handleResolve = (id: string) => {
    if (!window.confirm("Are you sure you want to mark this incident as resolved?")) return;

    const updated = incidents.map(inc => 
      inc.id === id ? { ...inc, status: "resolved" as const } : inc
    );
    setIncidents(updated);
    localStorage.setItem("emergencySOS", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("sos-updated"));
  };

  const handleDispatch = (id: string) => {
    alert(`Emergency Services dispatched for incident ${id}!`);
  };

  const activeIncidents = incidents.filter(i => i.status === "active");
  const resolvedIncidents = incidents.filter(i => i.status === "resolved");

  if (loading) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 flex items-center gap-3">
            <AlertOctagon size={32} /> SOS Emergency Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Monitor and respond to critical safety incidents instantly.</p>
        </div>
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg font-bold border border-red-200 dark:border-red-800">
          <ShieldAlert className="animate-pulse" size={20} />
          {activeIncidents.length} Active Incident{activeIncidents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          Active Emergencies
        </h2>

        {activeIncidents.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
             <ShieldCheck size={48} className="mb-4 text-emerald-500 opacity-50" />
             <p className="text-lg font-medium">All clear. No active SOS incidents.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-red-500 overflow-hidden shadow-xl shadow-red-500/10 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
                
                <div className="p-6 space-y-6">
                  {/* Incident Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold mb-3 border border-red-200 dark:border-red-800">
                        <AlertOctagon size={12} /> URGENT
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{incident.triggeredBy}</h3>
                      <p className="text-sm text-slate-500 font-mono mt-1">{incident.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                        <Clock size={14} className="text-red-500" />
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div className="grid grid-cols-2 gap-4 bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Car size={12}/> Vehicle</p>
                      <p className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{incident.plateNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Navigation size={12}/> Location</p>
                      <p className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white truncate" title={incident.location}>{incident.location}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={() => handleDispatch(incident.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-slate-900 dark:text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
                    >
                      <PhoneCall size={18} /> Dispatch Emergency
                    </button>
                    <button 
                      onClick={() => handleResolve(incident.id)}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-600"
                    >
                      <CheckCircle size={18} /> Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {resolvedIncidents.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Recently Resolved
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Incident ID</th>
                  <th className="px-6 py-3 font-medium">Reported By</th>
                  <th className="px-6 py-3 font-medium">Time Resolved</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {resolvedIncidents.map((incident) => (
                  <tr key={incident.id} className="opacity-75">
                    <td className="px-6 py-3 font-mono text-xs">{incident.id}</td>
                    <td className="px-6 py-3 font-medium">{incident.triggeredBy}</td>
                    <td className="px-6 py-3 text-slate-500">{new Date(incident.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                        <CheckCircle size={12} /> Resolved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
