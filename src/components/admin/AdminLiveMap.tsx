import React, { useState } from 'react';
import { X, MapPin, Car, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the Leaflet map so it doesn't break SSR
const MapClient = dynamic(() => import('./MapClient'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
    </div>
  )
});

interface AdminLiveMapProps {
  activeRides: any[];
  sosEvents: any[];
}

export default function AdminLiveMap({ activeRides, sosEvents }: AdminLiveMapProps) {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'IDLE' | 'SOS'>('ALL');
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  // Mock static idle drivers for visual population in Bahir Dar
  const idleDrivers = [
    { id: 'd1', name: 'Abebe K.', plate: 'AA 12345', coords: [11.58, 37.38], status: 'idle', phone: '0911••••12', rating: 4.8 },
    { id: 'd2', name: 'Solomon T.', plate: 'B 98765', coords: [11.60, 37.37], status: 'idle', phone: '0922••••45', rating: 4.9 },
    { id: 'd3', name: 'Mekdes A.', plate: 'AA 55432', coords: [11.595, 37.39], status: 'idle', phone: '0933••••88', rating: 5.0 },
    { id: 'd4', name: 'Yared M.', plate: 'AA 98765', coords: [11.575, 37.388], status: 'idle', phone: '0944••••22', rating: 4.7 },
  ];

  // Helper to map landmarks to actual Bahir Dar coordinates
  const getCoords = (landmark: string): [number, number] => {
    const map: Record<string, [number, number]> = {
      "BDU Poly Campus (ባሕር ዳር ዩኒቨርሲቲ ፖሊ)": [11.5980, 37.3980],
      "Giyorgis Square / ቀበሌ 04": [11.5936, 37.3908],
      "Papyrus Hotel (ፓፒረስ ሆቴል)": [11.5880, 37.3850],
      "Abay Mado (አባይ ማዶ)": [11.6020, 37.4100],
      "Kuriftu Resort Lake Tana": [11.6070, 37.3750],
      "New Bus Station / ቀበሌ 14 መናኸሪያ": [11.5750, 37.3880],
    };
    return map[landmark] || [11.5936, 37.3908]; // Default to Giyorgis Square
  };

  const pendingRequests = activeRides.filter(r => r.status === 'pending' || r.status === 'declined');
  const activeTrips = activeRides.filter(r => ['accepted', 'en_route', 'arrived', 'in_progress'].includes(r.status));

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
      
      <MapClient 
        activeTrips={activeTrips}
        sosEvents={sosEvents}
        pendingRequests={pendingRequests}
        idleDrivers={idleDrivers}
        filter={filter}
        onMarkerClick={setSelectedMarker}
        getCoords={getCoords}
      />

      {/* Filter Controls */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2 pointer-events-none">
        <button 
          onClick={() => setFilter('ALL')}
          className={`pointer-events-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm ${filter === 'ALL' ? 'bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('ACTIVE')}
          className={`pointer-events-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ${filter === 'ACTIVE' ? 'bg-orange-500 text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
        >
          <div className={`w-2 h-2 rounded-full ${filter === 'ACTIVE' ? 'bg-white' : 'bg-orange-500'}`}></div>
          Active Trips
        </button>
        <button 
          onClick={() => setFilter('IDLE')}
          className={`pointer-events-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ${filter === 'IDLE' ? 'bg-green-500 text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
        >
          <div className={`w-2 h-2 rounded-full ${filter === 'IDLE' ? 'bg-white' : 'bg-green-500'}`}></div>
          Idle Drivers
        </button>
        <button 
          onClick={() => setFilter('SOS')}
          className={`pointer-events-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ${filter === 'SOS' ? 'bg-red-500 text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
        >
          <div className={`w-2 h-2 rounded-full ${filter === 'SOS' ? 'bg-white' : 'bg-red-500'}`}></div>
          Emergency / Pending
        </button>
      </div>

      {/* Selected Marker Drawer */}
      {selectedMarker && (
        <div className="absolute right-4 top-16 bottom-4 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col z-[500] animate-in slide-in-from-right-10 duration-300 pointer-events-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Entity Details</h3>
            <button onClick={() => setSelectedMarker(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            
            {/* Entity Header */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                selectedMarker.type === 'idle' ? 'bg-green-100 text-green-600' : 
                selectedMarker.type === 'active' ? 'bg-orange-100 text-orange-600' :
                selectedMarker.type === 'pending' ? 'bg-blue-100 text-blue-600' :
                'bg-red-100 text-red-600'
              }`}>
                {selectedMarker.type === 'idle' || selectedMarker.type === 'active' ? <Car size={20} /> : 
                 selectedMarker.type === 'sos' ? <ShieldAlert size={20} /> : <MapPin size={20} />}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
                  {selectedMarker.driverName || selectedMarker.name || selectedMarker.passengerName}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedMarker.type === 'sos' ? 'EMERGENCY' : selectedMarker.type}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Phone</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedMarker.phone || selectedMarker.passengerPhoneMasked || "+251 91 •••• XX"}</span>
              </div>
              
              {(selectedMarker.plate || selectedMarker.driver?.plate) && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Plate</span>
                  <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
                    {selectedMarker.plate || selectedMarker.driver?.plate}
                  </span>
                </div>
              )}

              {selectedMarker.fare && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Fare</span>
                  <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedMarker.fare} ETB</span>
                </div>
              )}

              {selectedMarker.osrmDistance && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Est. Distance</span>
                  <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedMarker.osrmDistance}</span>
                </div>
              )}

              {selectedMarker.osrmDuration && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Est. Duration</span>
                  <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedMarker.osrmDuration}</span>
                </div>
              )}

              {selectedMarker.pickup && (
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Location</span>
                  <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{selectedMarker.pickup || selectedMarker.pickupLandmark}</span>
                </div>
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <button className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-sm">
              View Full Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
