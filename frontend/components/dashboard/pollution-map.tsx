'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PollutionData, RiskLevel } from '@/lib/types';

interface PollutionMapProps {
  data: PollutionData[] | undefined;
  isLoading: boolean;
  onCitySelect?: (city: PollutionData) => void;
}

const riskColors: Record<RiskLevel, string> = {
  safe: '#10b981',
  moderate: '#f59e0b',
  danger: '#ef4444',
};

export function PollutionMap({ data, isLoading, onCitySelect }: PollutionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [selectedCity, setSelectedCity] = useState<PollutionData | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (mapRef.current) return;

      // Create map with dark theme
      const map = L.map(mapContainerRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !data || !isMapReady) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current!;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      data.forEach(city => {
        const radius = Math.max(8, Math.min(25, city.aqi / 8));
        const color = riskColors[city.riskLevel];
        
        const marker = L.circleMarker([city.lat, city.lng], {
          radius,
          fillColor: color,
          fillOpacity: 0.7,
          color: color,
          weight: 2,
          opacity: 1,
        }).addTo(map);

        // Add pulse effect for danger zones
        if (city.riskLevel === 'danger') {
          const pulseMarker = L.circleMarker([city.lat, city.lng], {
            radius: radius + 5,
            fillColor: color,
            fillOpacity: 0,
            color: color,
            weight: 2,
            opacity: 0.5,
            className: 'pulse-marker',
          }).addTo(map);
          markersRef.current.push(pulseMarker);
        }

        // Tooltip
        marker.bindTooltip(
          `<div class="p-2">
            <div class="font-bold text-sm">${city.city}</div>
            <div class="text-xs mt-1">CO: ${city.co} ppm</div>
            <div class="text-xs">NO2: ${city.no2} ppb</div>
            <div class="text-xs">AQI: ${city.aqi}</div>
          </div>`,
          { 
            permanent: false, 
            direction: 'top',
            className: 'custom-tooltip',
          }
        );

        // Click handler
        marker.on('click', () => {
          setSelectedCity(city);
          onCitySelect?.(city);
        });

        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [data, isMapReady, onCitySelect]);

  // Auto-select city if search filters down to exactly one result
  useEffect(() => {
    if (data?.length === 1) {
      setSelectedCity(data[0]);
    } else if (!data || data.length === 0) {
      setSelectedCity(null);
    }
  }, [data]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (!mapRef.current) return;
    if (direction === 'in') {
      mapRef.current.zoomIn();
    } else {
      mapRef.current.zoomOut();
    }
  };

  if (isLoading) {
    return <MapSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-border/30 overflow-hidden relative"
    >
      {/* Map Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Global Pollution Map</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
              'transition-colors duration-200',
              showHeatmap 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Heatmap
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px]">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />
        
        {/* Zoom Controls */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleZoom('in')}
            className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleZoom('out')}
            className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Legend */}
        <div className="absolute left-4 bottom-4 z-10 glass rounded-lg p-3 border border-border/30">
          <p className="text-xs font-medium text-foreground mb-2">Risk Level</p>
          <div className="flex flex-col gap-1.5">
            {(['safe', 'moderate', 'danger'] as RiskLevel[]).map(level => (
              <div key={level} className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: riskColors[level] }}
                />
                <span className="text-xs text-muted-foreground capitalize">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City Detail Panel */}
      <AnimatePresence>
        {selectedCity && (
          <CityDetailPanel 
            city={selectedCity} 
            onClose={() => setSelectedCity(null)} 
          />
        )}
      </AnimatePresence>

      {/* Custom styles for Leaflet */}
      <style jsx global>{`
        .custom-tooltip {
          background: rgba(15, 15, 25, 0.95) !important;
          border: 1px solid rgba(100, 100, 120, 0.3) !important;
          border-radius: 8px !important;
          color: #fff !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        }
        .custom-tooltip::before {
          border-top-color: rgba(15, 15, 25, 0.95) !important;
        }
        .leaflet-container {
          background: #0a0a14 !important;
          font-family: inherit !important;
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .pulse-marker {
          animation: pulse-ring 2s ease-out infinite;
        }
      `}</style>
    </motion.div>
  );
}

interface CityDetailPanelProps {
  city: PollutionData;
  onClose: () => void;
}

function CityDetailPanel({ city, onClose }: CityDetailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-16 z-20 w-64 glass rounded-xl border border-border/30 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <h4 className="font-semibold text-foreground">{city.city}</h4>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-secondary/50 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Country</span>
          <span className="text-sm font-medium text-foreground">{city.country}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">CO Level</span>
          <span className="text-sm font-medium text-foreground">{city.co} ppm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">NO2 Level</span>
          <span className="text-sm font-medium text-foreground">{city.no2} ppb</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">AQI</span>
          <span className="text-sm font-medium text-foreground">{city.aqi}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Risk Level</span>
          <span 
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
              city.riskLevel === 'safe' && 'bg-emerald-500/20 text-emerald-400',
              city.riskLevel === 'moderate' && 'bg-amber-500/20 text-amber-400',
              city.riskLevel === 'danger' && 'bg-red-500/20 text-red-400'
            )}
          >
            {city.riskLevel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MapSkeleton() {
  return (
    <div className="glass rounded-xl border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-secondary/50 animate-pulse" />
          <div className="w-32 h-5 rounded bg-secondary/50 animate-pulse" />
        </div>
      </div>
      <div className="h-[400px] bg-secondary/20 animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    </div>
  );
}
