import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation, Loader2, Check, Map as MapIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const StoreIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const STORE_COORDS: [number, number] = [-7.153569932013082, 112.65057337162405];

interface InlineMapProps {
  onConfirm: (data: { address: string; lat: number; lng: number; distance: number }) => void;
  initialCoords?: { lat: number; lng: number } | null;
  initialAddress?: string;
}

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

const ChangeMapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const InlineMap: React.FC<InlineMapProps> = ({ onConfirm, initialCoords, initialAddress }) => {
  const { t } = useAppStore();
  const [position, setPosition] = useState<[number, number]>(initialCoords ? [initialCoords.lat, initialCoords.lng] : STORE_COORDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [address, setAddress] = useState(initialAddress || "");
  const [detectedAddress, setDetectedAddress] = useState("");
  const [distance, setDistance] = useState(0);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  // Function to fetch road route from OSRM
  const fetchRoute = async (lat: number, lng: number) => {
    setIsRouting(true);
    try {
      // OSRM expects lon,lat format
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${STORE_COORDS[1]},${STORE_COORDS[0]};${lng},${lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convert distance from meters to km
        const routeDistance = parseFloat((route.distance / 1000).toFixed(1));
        setDistance(routeDistance);
        
        // Convert GeoJSON coordinates [lon, lat] back to Leaflet [lat, lon]
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        setRoutePoints(coordinates);
      } else {
        // Fallback to straight line if no route found
        setRoutePoints([[STORE_COORDS[0], STORE_COORDS[1]], [lat, lng]]);
        setDistance(0); 
      }
    } catch (error) {
      console.error("Routing error:", error);
      setRoutePoints([[STORE_COORDS[0], STORE_COORDS[1]], [lat, lng]]);
    } finally {
      setIsRouting(false);
    }
  };

  useEffect(() => {
    fetchRoute(position[0], position[1]);
  }, [position]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsGeocoding(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Gresik")}`);
      const data = await resp.json();
      if (data && data.length > 0) {
        const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setPosition(newPos);
        setAddress(data[0].display_name);
      }
    } catch (err) { console.error(err); } finally { setIsGeocoding(false); }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await resp.json();
      if (data && data.display_name) {
        setDetectedAddress(data.display_name);
        // We do NOT update the main 'address' state here to fulfill the user's request 
        // to not replace their manual text.
      }
    } catch (err) { console.error(err); } finally { setIsGeocoding(false); }
  };

  return (
    <div className="flex flex-col gap-4 p-0 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Search & Location Actions */}
      <div className="flex gap-3">
        <div className="flex-grow relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchLocationPlaceholder}
            className="w-full bg-brand-black/[0.03] dark:bg-white/5 border-b-2 border-brand-black/10 dark:border-white/10 px-0 py-3 text-xs font-black uppercase outline-none focus:border-brand-orange dark:text-white transition-all placeholder:opacity-20 uppercase tracking-widest"
          />
          <button onClick={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 p-2">
            {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin text-brand-orange" /> : <Search className="w-4 h-4 opacity-20 hover:opacity-100 dark:text-white transition-opacity" />}
          </button>
        </div>
        <button 
          onClick={() => {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
              (p) => {
                const newPos: [number, number] = [p.coords.latitude, p.coords.longitude];
                setPosition(newPos);
                reverseGeocode(newPos[0], newPos[1]);
                setIsLoading(false);
              },
              () => { alert(t.gpsError); setIsLoading(false); }
            );
          }}
          className="bg-brand-black dark:bg-brand-yellow p-4 rounded-2xl text-white dark:text-brand-black shadow-lg active:scale-90 transition-all flex items-center justify-center"
        >
          <Navigation className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Map Container (Flat, Borderless & Sharp) */}
      <div className="h-[250px] md:h-[350px] w-full overflow-hidden relative group">
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} />
          <Marker position={STORE_COORDS} icon={StoreIcon} />
          {routePoints.length > 0 && (
            <Polyline 
              positions={routePoints} 
              pathOptions={{ 
                color: distance > 10 ? '#ef4444' : distance > 5 ? '#f97316' : '#22c55e',
                weight: 6,
                opacity: 0.5,
                lineJoin: 'round'
              }} 
            />
          )}
          <MapEvents onMapClick={(lat, lng) => {
            setPosition([lat, lng]);
            reverseGeocode(lat, lng);
          }} />
          <ChangeMapView center={position} />
        </MapContainer>
        
        {/* Subtle Distance Indicator (Integrated Label) */}
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-brand-black/80 dark:bg-brand-yellow/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
             <div className={`w-1.5 h-1.5 rounded-full ${distance > 10 ? 'bg-red-500' : distance > 5 ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`} />
             <p className="text-[10px] font-black uppercase tracking-widest text-white dark:text-brand-black leading-none">
               {isRouting ? t.calculatingRoute : `${distance} KM`}
             </p>
          </div>
        </div>
      </div>

      {/* Detected Address Display (Borderless) */}
      <div className="px-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-50">
            <MapIcon className="w-3 h-3" />
            <p className="text-[9px] font-black uppercase tracking-widest">{address ? "Alamat Terdeteksi" : t.detectedAddressLabel}</p>
          </div>
          {detectedAddress && address && address !== detectedAddress && (
            <button 
              onClick={() => setAddress(detectedAddress)}
              className="text-[9px] font-black uppercase tracking-widest text-brand-orange hover:underline"
            >
              Gunakan Alamat Ini
            </button>
          )}
        </div>
        <p className="text-[11px] font-bold leading-relaxed dark:text-white line-clamp-2 italic">
          {address || detectedAddress || t.pickPointHint}
        </p>
        {address && detectedAddress && address !== detectedAddress && (
          <p className="text-[9px] font-medium opacity-30 leading-tight">
            Input: {address}
          </p>
        )}
      </div>

      <button
        onClick={() => onConfirm({ address: address || detectedAddress, lat: position[0], lng: position[1], distance })}
        disabled={isRouting}
        className="w-full bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-orange hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-2"
      >
        <Check className="w-4 h-4" />
        {isRouting ? t.calculatingRoute : t.confirmLocationButton}
      </button>
    </div>
  );
};
