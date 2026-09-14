"use client";

import React, { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import { MapPin } from 'lucide-react';

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

interface BookingMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  defaultLocation?: [number, number];
}

export default function BookingMap({ onLocationSelect, defaultLocation = [11.5936, 37.3908] }: BookingMapProps) {
  const [position, setPosition] = useState<L.LatLngExpression>(defaultLocation);
  const markerRef = useRef<L.Marker>(null);

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
      </MapContainer>
    </div>
  );
}
