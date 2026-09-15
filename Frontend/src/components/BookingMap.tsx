"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import { MapPin, Car } from 'lucide-react';
import { api } from '@/lib/api';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon
const createIcon = (iconElement: React.ReactElement, className: string) => {
  const html = renderToString(iconElement);
  return L.divIcon({
    html,
    className: `custom-leaflet-icon ${className}`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const PinIcon = createIcon(
  <div className="text-orange-500 drop-shadow-md">
    <MapPin size={30} fill="#f97316" className="text-slate-900 dark:text-white" />
  </div>,
  'booking-pin-icon'
);

const CarIcon = createIcon(
  <div className="bg-white rounded-full p-1 shadow-md border-2 border-orange-500 text-orange-500">
    <Car size={20} />
  </div>,
  'booking-car-icon'
);

interface BookingMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  onDriverSelect?: (driverId: string) => void;
  defaultLocation?: [number, number];
}

const DEFAULT_LOC: [number, number] = [11.5936, 37.3908];

export default function BookingMap({ onLocationSelect, onDriverSelect, defaultLocation = DEFAULT_LOC }: BookingMapProps) {
  const [position, setPosition] = useState<L.LatLngExpression>(defaultLocation);
  const [drivers, setDrivers] = useState<any[]>([]);
  const markerRef = useRef<L.Marker>(null);

  // Extract primitives for dependencies to avoid infinite loops on re-render
  const defLat = Array.isArray(defaultLocation) ? defaultLocation[0] : (defaultLocation as any)?.lat ?? 11.5936;
  const defLng = Array.isArray(defaultLocation) ? defaultLocation[1] : (defaultLocation as any)?.lng ?? 37.3908;

  useEffect(() => {
    let isMounted = true;
    const fetchDrivers = async () => {
      try {
        const res = await api.get(`/drivers/active?lat=${defLat}&lng=${defLng}`);
        if (isMounted && res && res.drivers) {
          setDrivers(res.drivers);
        }
      } catch (error) {
        console.error("Failed to fetch active drivers. This may be expected for guests or if offline.");
      }
    };
    fetchDrivers();
    return () => { isMounted = false; };
  }, [defLat, defLng]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          if (onLocationSelect) {
            onLocationSelect(newPos.lat, newPos.lng);
          }
        }
      },
    }),
    [onLocationSelect],
  );

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  }

  return (
    <div className="w-full h-full min-h-[400px] z-0 relative rounded-card overflow-hidden">
      <MapContainer 
        center={defaultLocation} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0, position: 'absolute', top: 0, left: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
          icon={PinIcon}
        >
        </Marker>
        {drivers.filter((d: any) => d.current_latitude != null && d.current_longitude != null).map(driver => (
          <Marker
            key={driver.driver_id}
            position={[driver.current_latitude, driver.current_longitude]}
            icon={CarIcon}
          >
            <Popup>
              <div className="flex flex-col items-center p-1 min-w-[120px]">
                <h3 className="font-bold text-slate-800 text-sm mb-1">{driver.user?.full_name}</h3>
                <p className="text-xs text-slate-500 mb-3">{driver.vehicle?.model} • ⭐ {driver.rating?.toFixed(1) || "5.0"}</p>
                <button 
                  onClick={() => onDriverSelect && onDriverSelect(driver.driver_id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 px-4 rounded w-full transition-colors"
                >
                  Request Ride
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
