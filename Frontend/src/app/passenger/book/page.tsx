"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Search, 
  Clock, 
  Plus, 
  Minus, 
  Navigation,
  Circle,
  Loader2,
  Users,
  Car,
  Star,
  Map as MapIcon,
  Split,
  ChevronDown,
  X,
  Radar
} from "lucide-react";
import dynamic from "next/dynamic";
import { RIDE_PRODUCTS, calculateEstimatedFare } from "@/lib/constants/ride-products";
import { api } from "@/lib/api";

const MapClient = dynamic(() => import("@/components/admin/MapClient"), {
  ssr: false,
});

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

const MOCK_LANDMARKS = [
  "BDU Poly Campus (ባሕር ዳር ዩኒቨርሲቲ ፖሊ)",
  "Giyorgis Square / ቀበሌ 04",
  "Papyrus Hotel (ፓፒረስ ሆቴል)",
  "Abay Mado (አባይ ማዶ)",
  "Kuriftu Resort Lake Tana",
  "New Bus Station / ቀበሌ 14 መናኸሪያ"
];

const MOCK_DRIVERS = [
  { id: "drv_1", name: "Abebe K.", rating: 4.8, carModel: "Toyota Corolla (Silver)", plate: "AA 12345", eta: "3 min away" },
  { id: "drv_2", name: "Solomon T.", rating: 4.9, carModel: "Hyundai Elantra (White)", plate: "B 98765", eta: "5 min away" },
  { id: "drv_3", name: "Mekdes A.", rating: 5.0, carModel: "Toyota Yaris (Blue)", plate: "AA 55432", eta: "7 min away" },
];

export default function PassengerBookRidePage() {
  const router = useRouter();
  
  // Booking Form State
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isLandmarkMode, setIsLandmarkMode] = useState(false);
  const [rideType, setRideType] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [showLandmarkDropdown, setShowLandmarkDropdown] = useState<"pickup" | "dropoff" | null>(null);

  // Nominatim Search State
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Discovery State
  const [isBooking, setIsBooking] = useState(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [isWaitingForDriver, setIsWaitingForDriver] = useState(false);
  
  // Default to Standard Plus or the first available
  const [selectedProductId, setSelectedProductId] = useState<string>(
    RIDE_PRODUCTS.find(p => p.recommended)?.id || RIDE_PRODUCTS[0].id
  );

  const activeProducts = RIDE_PRODUCTS.filter(p => p.isActive);
  const selectedProduct = RIDE_PRODUCTS.find(p => p.id === selectedProductId);

  // Mock Fare calculation
  const mockDistance = 12.5; 
  const mockDuration = 25;
  const estimatedFare = selectedProduct ? calculateEstimatedFare(selectedProduct, mockDistance, mockDuration) : 0;
  const finalFare = rideType === "SHARED" ? Math.max(estimatedFare / 2, selectedProduct?.minimumFare || 0) : estimatedFare;

  const handleBookRide = () => {
    if (!selectedProduct || !pickup || !destination) return;
    
    setIsBooking(true);
    
    // Simulate finding drivers process
    setTimeout(() => {
      setIsBooking(false);
      setShowDiscoveryModal(true);
    }, 1500);
  };

  const handleConfirmRide = async (driverId: string) => {
    // In a real flow, we might assign driverId immediately or let the backend match.
    // We'll just pass it to the backend to simulate a request.
    
    try {
      const pCoords = getCoords(pickup);
      const dCoords = getCoords(destination);
      
      const res = await api.post('/rides', {
        pickup_lat: pCoords[0],
        pickup_lng: pCoords[1],
        pickup_landmark: pickup,
        dropoff_lat: dCoords[0],
        dropoff_lng: dCoords[1],
        dropoff_landmark: destination,
        ride_type: rideType,
        fare_type: "CASH", // Assuming default for now
        distance_km: mockDistance
      });
      
      const rideData = res.ride;
      
      // We store the ID to poll
      localStorage.setItem("currentActiveRideId", rideData.ride_id);
      
      setShowDiscoveryModal(false);
      setIsWaitingForDriver(true);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to request ride. Please try again.");
    }
  };

  useEffect(() => {
    if (!isWaitingForDriver) return;

    const rideId = localStorage.getItem("currentActiveRideId");
    if (!rideId) return;

    const checkRideStatus = async () => {
      try {
        const ride = await api.get(`/rides/${rideId}`);
        if (ride.status === "ACCEPTED" || ride.status === "EN_ROUTE") {
          // Driver accepted, copy to currentActiveRide for the active trip view (for UI fallback if needed)
          localStorage.setItem("currentActiveRide", JSON.stringify(ride));
          sessionStorage.setItem("showAcceptedToast", "true");
          router.push("/passenger/active-trip");
        } else if (ride.status === "CANCELLED" || ride.status === "DECLINED") {
          setIsWaitingForDriver(false);
          localStorage.removeItem("currentActiveRideId");
          alert("Ride was cancelled or declined. Please try again.");
        }
      } catch (error) {
        console.error("Error polling ride status", error);
      }
    };

    const interval = setInterval(checkRideStatus, 2000);
    
    return () => clearInterval(interval);
  }, [isWaitingForDriver, router]);

  const searchNominatim = (query: string, type: "pickup" | "dropoff") => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=37.30,11.65,37.45,11.53&bounded=1`)
      .then(res => res.json())
      .then(data => {
        setSearchResults(data);
        setIsSearching(false);
        setShowLandmarkDropdown(type);
      })
      .catch(err => {
        console.error("Geocoding failed", err);
        setIsSearching(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: "pickup" | "dropoff") => {
    const val = e.target.value;
    if (type === "pickup") setPickup(val);
    else setDestination(val);

    if (!isLandmarkMode) {
      if (searchTimeout) clearTimeout(searchTimeout);
      setSearchTimeout(setTimeout(() => searchNominatim(val, type), 500));
    }
  };

  const handleSelectLocation = (type: "pickup" | "dropoff", val: string) => {
    if (type === "pickup") setPickup(val);
    else setDestination(val);
    setShowLandmarkDropdown(null);
    setSearchResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col h-full overflow-y-auto">
      {/* Header section */}
      <div className="mb-6 md:mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">Book Your Ride</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Professional logistics at your fingertips.</p>
        </div>
      </div>

      {/* Main Grid: Form & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8 md:mb-10">
        
        {/* Booking Form (Left Column) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-card p-6 flex flex-col">
          
          <div className="space-y-6 flex-1">
            
            {/* Location Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => {
                  setIsLandmarkMode(false);
                  setShowLandmarkDropdown(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isLandmarkMode ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Custom Address
              </button>
              <button
                onClick={() => {
                  setIsLandmarkMode(true);
                  setShowLandmarkDropdown(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${isLandmarkMode ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <MapIcon size={14} /> Landmarks
              </button>
            </div>

            {/* Pickup Location */}
            <div className="relative">
              <label className="block text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Pickup Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="h-4 w-4 rounded-full border-2 border-slate-400 dark:border-slate-500 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-400"></div>
                  </div>
                </div>
                <input 
                  type="text" 
                  value={pickup}
                  onChange={(e) => handleInputChange(e, "pickup")}
                  onFocus={() => {
                    if (isLandmarkMode) setShowLandmarkDropdown("pickup");
                    else if (searchResults.length > 0) setShowLandmarkDropdown("pickup");
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white text-sm rounded-control pl-10 pr-10 py-3 focus:outline-none focus:border-orange-500/50 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder={isLandmarkMode ? "Select a landmark..." : "Enter pickup address"}
                />
                {isSearching && showLandmarkDropdown === "pickup" && (
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"><Loader2 size={14} className="animate-spin" /></div>
                )}
                {isLandmarkMode && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                )}
              </div>
              
              {showLandmarkDropdown === "pickup" && isLandmarkMode && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {MOCK_LANDMARKS.map(l => (
                    <div key={l} onClick={() => handleSelectLocation("pickup", l)} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                      {l}
                    </div>
                  ))}
                </div>
              )}

              {showLandmarkDropdown === "pickup" && !isLandmarkMode && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map(res => (
                    <div key={res.place_id} onClick={() => handleSelectLocation("pickup", res.display_name)} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 truncate">
                      {res.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <label className="block text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Destination</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={16} className="text-orange-600 dark:text-orange-500" />
                </div>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => handleInputChange(e, "dropoff")}
                  onFocus={() => {
                    if (isLandmarkMode) setShowLandmarkDropdown("dropoff");
                    else if (searchResults.length > 0) setShowLandmarkDropdown("dropoff");
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white text-sm rounded-control pl-10 pr-10 py-3 focus:outline-none focus:border-orange-500/50 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder={isLandmarkMode ? "Select a landmark..." : "Where to?"}
                />
                {isSearching && showLandmarkDropdown === "dropoff" && (
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"><Loader2 size={14} className="animate-spin" /></div>
                )}
                {isLandmarkMode && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                )}
              </div>
              
              {showLandmarkDropdown === "dropoff" && isLandmarkMode && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {MOCK_LANDMARKS.map(l => (
                    <div key={l} onClick={() => handleSelectLocation("dropoff", l)} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                      {l}
                    </div>
                  ))}
                </div>
              )}

              {showLandmarkDropdown === "dropoff" && !isLandmarkMode && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map(res => (
                    <div key={res.place_id} onClick={() => handleSelectLocation("dropoff", res.display_name)} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 truncate">
                      {res.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ride Type Selection (Private vs Shared) */}
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-2">Service Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setRideType("PRIVATE")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${rideType === "PRIVATE" ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-500' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}
                >
                  <Car size={24} className="mb-1" />
                  <span className="text-xs font-bold">Private Ride</span>
                </button>
                <button 
                  onClick={() => setRideType("SHARED")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${rideType === "SHARED" ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-500' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}
                >
                  <Split size={24} className="mb-1" />
                  <span className="text-xs font-bold">Shared Ride</span>
                  <span className="text-[9px] uppercase tracking-wider text-green-500 mt-1">Split Cost</span>
                </button>
              </div>
            </div>
            
            {/* Fare Breakdown Component */}
            {selectedProduct && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-wider">Fare Breakdown</h4>
                
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Base Fare (Upfront Locked)</span>
                    <span className="font-medium">{estimatedFare.toFixed(2)} ETB</span>
                  </div>
                  
                  {rideType === "SHARED" && (
                    <>
                      <div className="flex justify-between text-green-600 dark:text-green-500">
                        <span className="flex items-center gap-1"><Users size={14} /> Shared Ride Savings (50%)</span>
                        <span>- {(estimatedFare / 2).toFixed(2)} ETB</span>
                      </div>
                      <div className="my-2 border-t border-slate-200 dark:border-slate-700"></div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Co-passengers</span>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold">You: Pending</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">Searching...</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="my-2 border-t border-slate-200 dark:border-slate-700"></div>
                  <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
                    <span>Final Your Share</span>
                    <span>{finalFare.toFixed(2)} ETB</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500 text-center mt-2">Zero Surge Pricing Guarantee</div>
                </div>
              </div>
            )}
            
          </div>

          <button 
            onClick={handleBookRide}
            disabled={isBooking || !pickup || !destination}
            className={`w-full mt-6 font-bold py-3.5 rounded-control flex items-center justify-center gap-2 transition-colors shadow-lg ${
              isBooking || !pickup || !destination 
                ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-none' 
                : 'bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white shadow-orange-500/20'
            }`}
          >
            {isBooking ? (
              <>
                <Loader2 size={18} className="animate-spin text-orange-600 dark:text-orange-500" />
                SEARCHING NETWORK...
              </>
            ) : (
              <>
                <Search size={18} />
                DISCOVER DRIVERS
              </>
            )}
          </button>
        </div>

        {/* Map View (Right Column) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-card relative overflow-hidden min-h-[400px]">
          <MapClient 
            activeTrips={pickup && destination ? [{
              rideId: 'preview',
              pickupLandmark: pickup,
              dropoffLandmark: destination,
              status: 'pending'
            }] : []}
            sosEvents={[]}
            pendingRequests={[]}
            idleDrivers={[
              { id: "drv_1", driver: { name: "Abebe K." }, currentLocation: [11.5936, 37.3908], status: "available" },
              { id: "drv_2", driver: { name: "Solomon T." }, currentLocation: [11.5980, 37.3980], status: "available" }
            ]}
            filter="ACTIVE"
            onMarkerClick={() => {}}
            getCoords={getCoords}
          />

          {/* Active Drivers Pill */}
          <div className="absolute left-6 top-6 z-10 pointer-events-none">
            <div className="bg-white dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-badge px-4 py-2 flex items-center gap-2 shadow-lg">
              <Circle size={8} className="text-green-500" fill="currentColor" />
              <span className="text-xs font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">48 Drivers active nearby</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Options Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          {selectedProduct && <selectedProduct.icon size={18} className="text-orange-600 dark:text-orange-500" />}
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Available Vehicle Types</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {activeProducts.map((product) => {
            const Icon = product.icon;
            const isSelected = selectedProductId === product.id;

            return (
              <div 
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className={`cursor-pointer rounded-card p-4 flex flex-col transition-all relative ${
                  isSelected 
                    ? 'bg-orange-500/10 border-2 border-orange-500 shadow-[0_0_15px_rgba(229,112,54,0.1)]' 
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {product.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 dark:bg-orange-600 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white text-[9px] font-bold px-2 py-0.5 rounded-badge uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <div className="flex justify-between items-center mb-3">
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-orange-500 text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Users size={12} /> {product.seats}
                  </div>
                </div>
                <h3 className={`text-sm font-bold mb-1 ${isSelected ? 'text-orange-600 dark:text-orange-500' : 'text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white'}`}>{product.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{product.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Discovery Modal */}
      {showDiscoveryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Drivers Nearby</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a driver for your {selectedProduct?.name} ride</p>
              </div>
              <button 
                onClick={() => setShowDiscoveryModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Route preview snippet in modal */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              <div className="flex items-start gap-3 text-sm">
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600 my-1"></div>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                </div>
                <div className="flex-1 flex flex-col gap-3 font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">
                  <div>{pickup}</div>
                  <div>{destination}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-500">{finalFare.toFixed(2)} ETB</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{rideType === "SHARED" ? "Your Share" : "Fixed Fare"}</div>
                </div>
              </div>
            </div>

            <div className="p-2 max-h-[50vh] overflow-y-auto">
              {MOCK_DRIVERS.map((driver) => (
                <div key={driver.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    {driver.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{driver.name}</h4>
                      <span className="flex items-center text-xs font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Star size={10} className="text-yellow-500 mr-1 fill-current" /> {driver.rating}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{driver.carModel} • <span className="uppercase text-xs border border-slate-300 dark:border-slate-600 px-1 rounded bg-slate-100 dark:bg-slate-800 font-mono tracking-widest">{driver.plate}</span></p>
                  </div>
                  <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2">
                    <div className="text-xs font-bold text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0">
                      ETA: {driver.eta}
                    </div>
                    <button 
                      onClick={() => handleConfirmRide(driver.id)}
                      className="w-full sm:w-auto px-6 py-2 bg-slate-900 dark:bg-white text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white dark:text-slate-900 font-bold rounded-control hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
                    >
                      Request Ride
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Waiting for Driver Modal */}
      {isWaitingForDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/30 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 bg-orange-200 dark:bg-orange-800/40 rounded-full animate-ping opacity-75" style={{ animationDelay: '200ms' }}></div>
              <div className="relative w-full h-full bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center border-4 border-orange-500 z-10">
                <Radar size={40} className="text-orange-500 animate-[spin_3s_linear_infinite]" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white mb-2">Finding your driver...</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Dispatching your request to nearby drivers securely.</p>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex items-center justify-between mb-6 border border-slate-200 dark:border-slate-700">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Locked Fare</div>
                <div className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{finalFare.toFixed(2)} ETB</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ride Type</div>
                <div className="font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white capitalize">{rideType.toLowerCase()}</div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsWaitingForDriver(false);
                localStorage.removeItem("currentActiveRideId");
              }}
              className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
