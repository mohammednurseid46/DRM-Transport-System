"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Car, ShieldAlert } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (iconElement: React.ReactElement, className: string) => {
  const html = renderToString(iconElement);
  return L.divIcon({
    html,
    className: `custom-leaflet-icon ${className}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const CarIcon = createIcon(<div className="bg-orange-100 text-orange-600 rounded-full p-1.5 shadow-md border border-orange-200"><Car size={18} /></div>, 'driver-icon');
const IdleCarIcon = createIcon(<div className="bg-green-100 text-green-600 rounded-full p-1.5 shadow-md border border-green-200"><Car size={18} /></div>, 'idle-driver-icon');
const SOSIcon = createIcon(<div className="bg-red-100 text-red-600 rounded-full p-1.5 shadow-md border border-red-200 animate-pulse"><ShieldAlert size={18} /></div>, 'sos-icon');
const PendingIcon = createIcon(<div className="bg-blue-100 text-blue-600 rounded-full p-1.5 shadow-md border border-blue-200 animate-pulse"><MapPin size={18} /></div>, 'pending-icon');
const PinIcon = createIcon(<div className="text-orange-500"><MapPin size={24} fill="#f97316" className="text-slate-900 dark:text-slate-900 dark:text-white drop-shadow-md" /></div>, 'pin-icon');

interface MapClientProps {
  activeTrips: any[];
  sosEvents: any[];
  pendingRequests: any[];
  idleDrivers: any[];
  filter: 'ALL' | 'ACTIVE' | 'IDLE' | 'SOS';
  onMarkerClick: (marker: any) => void;
  getCoords: (landmark: string) => [number, number];
}

// Simple in-memory cache to prevent spamming the public OSRM API
const routeCache: Record<string, { positions: [number, number][], distance: number, duration: number }> = {};

function RoutingPolyline({ start, end, tripId, onRouteFetched }: { start: [number, number], end: [number, number], tripId: string, onRouteFetched?: (dist: number, dur: number) => void }) {
  const [positions, setPositions] = React.useState<[number, number][]>([]);

  React.useEffect(() => {
    const cacheKey = `${tripId}-${start.join(',')}-${end.join(',')}`;
    if (routeCache[cacheKey]) {
      setPositions(routeCache[cacheKey].positions);
      if (onRouteFetched) onRouteFetched(routeCache[cacheKey].distance, routeCache[cacheKey].duration);
      return;
    }

    // OSRM expects lon,lat
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // GeoJSON coordinates are [lon, lat], Leaflet needs [lat, lon]
          const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          routeCache[cacheKey] = {
            positions: coords,
            distance: route.distance, // in meters
            duration: route.duration  // in seconds
          };
          setPositions(coords);
          if (onRouteFetched) onRouteFetched(route.distance, route.duration);
        } else {
          // Fallback to straight line on error
          setPositions([start, end]);
        }
      })
      .catch(err => {
        console.error("OSRM routing failed, falling back to straight line:", err);
        setPositions([start, end]);
      });
  }, [start, end, tripId, onRouteFetched]);

  if (positions.length === 0) return null;

  return <Polyline positions={positions} pathOptions={{ color: '#f97316', weight: 4, dashArray: '10, 10' }} />;
}

// Utility to invalidate map size on mount
function MapResizer() {
  const map = useMap();
  React.useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function MapClient({ activeTrips, sosEvents, pendingRequests, idleDrivers, filter, onMarkerClick, getCoords }: MapClientProps) {
  return (
    <MapContainer 
      center={[11.5936, 37.3908]} 
      zoom={14} 
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Active Trip Routes */}
      {(filter === 'ALL' || filter === 'ACTIVE') && activeTrips.map(trip => {
        const start = getCoords(trip.pickupLandmark);
        const end = getCoords(trip.dropoffLandmark);
        return (
          <React.Fragment key={`route-${trip.rideId}`}>
            <RoutingPolyline 
              start={start} 
              end={end} 
              tripId={trip.rideId} 
              onRouteFetched={(dist, dur) => {
                // Attach distance and duration to the trip object for the popup
                trip.osrmDistance = (dist / 1000).toFixed(1) + ' km';
                trip.osrmDuration = Math.round(dur / 60) + ' min';
              }} 
            />
            <Marker position={start} icon={PinIcon} eventHandlers={{ click: () => onMarkerClick({...trip, type: 'active'}) }} />
            <Marker position={end} icon={PinIcon} eventHandlers={{ click: () => onMarkerClick({...trip, type: 'active'}) }} />
          </React.Fragment>
        );
      })}

      {/* SOS Markers */}
      {(filter === 'ALL' || filter === 'SOS') && sosEvents.map((sos, i) => {
        const loc = getCoords(sos.pickup);
        return (
          <Marker 
            key={`sos-${i}`} 
            position={loc} 
            icon={SOSIcon} 
            eventHandlers={{ click: () => onMarkerClick({...sos, type: 'sos'}) }}
          />
        );
      })}

      {/* Pending Passenger Requests */}
      {(filter === 'ALL' || filter === 'SOS') && pendingRequests.map(req => {
        const loc = getCoords(req.pickupLandmark);
        return (
          <Marker 
            key={`req-${req.rideId}`} 
            position={loc} 
            icon={PendingIcon} 
            eventHandlers={{ click: () => onMarkerClick({...req, type: 'pending'}) }}
          />
        );
      })}

      {/* Active Trip Drivers */}
      {(filter === 'ALL' || filter === 'ACTIVE') && activeTrips.map(trip => {
        const loc = getCoords(trip.pickupLandmark); // Simplified, placing near pickup
        return (
          <Marker 
            key={`car-${trip.rideId}`} 
            position={[loc[0] + 0.001, loc[1] + 0.001]} 
            icon={CarIcon} 
            eventHandlers={{ click: () => onMarkerClick({...trip, type: 'active'}) }}
          />
        );
      })}

      {/* Idle Drivers */}
      {(filter === 'ALL' || filter === 'IDLE') && idleDrivers.map(d => {
        const position = d.coords || d.currentLocation;
        if (!position) return null;
        return (
          <Marker 
            key={`idle-${d.id}`} 
            position={position} 
            icon={IdleCarIcon} 
            eventHandlers={{ click: () => onMarkerClick({...d, type: 'idle'}) }}
          />
        );
      })}
    </MapContainer>
  );
}
