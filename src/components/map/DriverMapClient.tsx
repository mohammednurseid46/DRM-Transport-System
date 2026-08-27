"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Car, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (iconElement: React.ReactElement, className: string, size = 30) => {
  const html = renderToString(iconElement);
  return L.divIcon({
    html,
    className: `custom-leaflet-icon ${className}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const DriverIconOnline = createIcon(
  <div className="relative">
    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
    <div className="relative bg-orange-500 text-white rounded-full p-2 shadow-lg border-2 border-white"><Car size={20} /></div>
  </div>, 'driver-icon-online', 40
);

const DriverIconOffline = createIcon(
  <div className="bg-slate-500 text-white rounded-full p-2 shadow-lg border-2 border-white"><Car size={20} /></div>, 
  'driver-icon-offline', 40
);

const PickupPinIcon = createIcon(
  <div className="text-blue-500 drop-shadow-md relative">
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 rounded-full blur-[1px]"></div>
    <MapPin size={32} fill="currentColor" className="text-white relative z-10" />
  </div>, 'pickup-pin', 32
);

const DropoffPinIcon = createIcon(
  <div className="text-red-500 drop-shadow-md relative">
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 rounded-full blur-[1px]"></div>
    <MapPin size={32} fill="currentColor" className="text-white relative z-10" />
  </div>, 'dropoff-pin', 32
);

// In-memory cache for OSRM routes
const routeCache: Record<string, [number, number][]> = {};

function RoutingPolyline({ start, end }: { start: [number, number], end: [number, number] }) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const cacheKey = `${start.join(',')}-${end.join(',')}`;
    if (routeCache[cacheKey]) {
      setPositions(routeCache[cacheKey]);
      return;
    }

    // OSRM expects lon,lat
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          routeCache[cacheKey] = coords;
          setPositions(coords);
        } else {
          setPositions([start, end]);
        }
      })
      .catch(() => {
        setPositions([start, end]);
      });
  }, [start, end]);

  if (positions.length === 0) return null;

  return (
    <>
      {/* Background shadow polyline */}
      <Polyline positions={positions} pathOptions={{ color: '#000000', weight: 6, opacity: 0.3 }} />
      {/* Foreground primary polyline */}
      <Polyline positions={positions} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }} />
    </>
  );
}

// Utility to re-center map if state changes significantly
function MapRecenter({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Utility to invalidate map size on mount (fixes broken tiles when dragging)
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

interface DriverMapClientProps {
  isOnline: boolean;
  rideState: "idle" | "requesting" | "accepted" | "arrived" | "in_progress" | "rating";
  driverCoords: [number, number];
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
}

export default function DriverMapClient({ isOnline, rideState, driverCoords, pickupCoords, dropoffCoords }: DriverMapClientProps) {
  const { resolvedTheme } = useTheme();
  
  // Calculate center and zoom based on state
  let center = driverCoords;
  let zoom = 14;

  if (rideState !== "idle" && rideState !== "rating" && pickupCoords) {
    if (rideState === "accepted" || rideState === "arrived") {
      // Average between driver and pickup
      center = [
        (driverCoords[0] + pickupCoords[0]) / 2,
        (driverCoords[1] + pickupCoords[1]) / 2
      ];
      zoom = 13;
    } else if (rideState === "in_progress" && dropoffCoords) {
      // Average between pickup and dropoff
      center = [
        (pickupCoords[0] + dropoffCoords[0]) / 2,
        (pickupCoords[1] + dropoffCoords[1]) / 2
      ];
      zoom = 13;
    }
  }

  // Dark mode tile filter
  const tileClassName = resolvedTheme === 'dark' ? 'dark-map-tiles' : '';

  return (
    <>
      <style>{`
        .dark-map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .leaflet-container {
          background-color: ${resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc'};
        }
      `}</style>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={true}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        keyboard={true}
      >
        <MapResizer />
        <TileLayer
          className={tileClassName}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapRecenter center={center} zoom={zoom} />

        {/* Driver Location Marker */}
        <Marker 
          position={driverCoords} 
          icon={isOnline ? DriverIconOnline : DriverIconOffline} 
          zIndexOffset={1000}
        />

        {/* Ride Routing & Markers */}
        {(rideState === "accepted" || rideState === "requesting" || rideState === "arrived" || rideState === "in_progress") && pickupCoords && dropoffCoords && (
          <>
            <Marker position={pickupCoords} icon={PickupPinIcon} />
            <Marker position={dropoffCoords} icon={DropoffPinIcon} />
            
            {rideState === "in_progress" ? (
              // En route to destination
              <RoutingPolyline start={pickupCoords} end={dropoffCoords} />
            ) : (
              // Driver heading to pickup
              <RoutingPolyline start={driverCoords} end={pickupCoords} />
            )}
          </>
        )}
      </MapContainer>
    </>
  );
}
