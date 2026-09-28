import React, { useEffect, useRef, useState, useMemo } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { RentalProperty } from '../types/rental';
import { formatPrice } from '../utils/geo';
import {
  Compass,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  X,
  ExternalLink,
  MessageSquare,
  FileText,
  ZoomIn,
  ZoomOut,
  Radio,
} from 'lucide-react';

interface RentalMapProps {
  properties: RentalProperty[];
  selectedProperty: RentalProperty | null;
  hoveredPropertyId: string | null;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (propertyId: string | null) => void;
  center: { lat: number; lng: number };
  radiusMiles: number;
  onCenterChange?: (newCenter: { lat: number; lng: number }) => void;
  onOpenChatWithLandlord: (property: RentalProperty) => void;
  onViewPropertyDetails: (property: RentalProperty) => void;
  onApply?: (property: RentalProperty) => void;
}

const MAPS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY) ||
  'AIzaSyBGg6RHRU8a8YdIV1yaj60kscLAHyR6pIY';

export const RentalMap: React.FC<RentalMapProps> = ({
  properties,
  selectedProperty,
  hoveredPropertyId,
  onSelectProperty,
  onHoverProperty,
  center,
  radiusMiles,
  onCenterChange,
  onOpenChatWithLandlord,
  onViewPropertyDetails,
  onApply,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const circleRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showSearchHereBtn, setShowSearchHereBtn] = useState(false);
  const [currentMapCenter, setCurrentMapCenter] = useState(center);
  const [activePopupProperty, setActivePopupProperty] = useState<RentalProperty | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fallbackZoom, setFallbackZoom] = useState(1);

  // Initialize Google Map using modern functional loader
  useEffect(() => {
    let isMounted = true;

    async function initGoogleMaps() {
      try {
        setOptions({
          key: MAPS_API_KEY,
          v: 'weekly',
        });

        await Promise.all([
          importLibrary('maps'),
          importLibrary('core'),
        ]);

        if (!isMounted || !mapContainerRef.current) return;
        const g = (window as any).google;
        if (!g?.maps?.Map) {
          throw new Error('Google Maps Map class not found');
        }

        const map = new g.maps.Map(mapContainerRef.current, {
          center: center,
          zoom: 13,
          mapTypeId: g.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: {
            position: g.maps.ControlPosition.RIGHT_BOTTOM,
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: g.maps.ControlPosition.RIGHT_BOTTOM,
          },
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels.text',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'simplified' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#c9e8fd' }],
            },
          ],
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);

        map.addListener('dragend', () => {
          const newCenter = map.getCenter();
          if (newCenter) {
            const nextCenter = { lat: newCenter.lat(), lng: newCenter.lng() };
            setCurrentMapCenter(nextCenter);
            setShowSearchHereBtn(true);
          }
        });

        map.addListener('click', () => {
          setActivePopupProperty(null);
        });
      } catch (err: any) {
        console.warn('Google Maps could not load tiles, activating fallback vector map:', err);
        if (isMounted) {
          setLoadError('Interactive vector map active');
        }
      }
    }

    initGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update map center when props center changes
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      mapInstanceRef.current.panTo(center);
      setCurrentMapCenter(center);
      setShowSearchHereBtn(false);
    }
  }, [center, mapLoaded]);

  // Update Map Type
  useEffect(() => {
    const g = (window as any).google;
    if (mapInstanceRef.current && g?.maps) {
      mapInstanceRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  // Update Radius Circle and Search Center Marker
  useEffect(() => {
    const g = (window as any).google;
    if (!mapInstanceRef.current || !g?.maps || !mapLoaded) return;

    try {
      const radiusMeters = radiusMiles * 1609.34;

      if (!circleRef.current) {
        circleRef.current = new g.maps.Circle({
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#60A5FA',
          fillOpacity: 0.12,
          map: mapInstanceRef.current,
          center: center,
          radius: radiusMeters,
        });
      } else {
        circleRef.current.setCenter(center);
        circleRef.current.setRadius(radiusMeters);
      }

      if (!userMarkerRef.current) {
        userMarkerRef.current = new g.maps.Marker({
          position: center,
          map: mapInstanceRef.current,
          title: 'Search Center',
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
          zIndex: 50,
        });
      } else {
        userMarkerRef.current.setPosition(center);
      }
    } catch (e) {
      console.warn('Error updating map circle/marker', e);
    }
  }, [center, radiusMiles, mapLoaded]);

  // Render or Update Property Markers
  useEffect(() => {
    const g = (window as any).google;
    if (!mapInstanceRef.current || !g?.maps || !mapLoaded) return;

    try {
      const map = mapInstanceRef.current;
      const currentMarkers = markersRef.current;

      const activeIds = new Set(properties.map((p) => p.id));
      for (const [id, marker] of currentMarkers.entries()) {
        if (!activeIds.has(id)) {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
          currentMarkers.delete(id);
        }
      }

      properties.forEach((prop) => {
        const isSelected = selectedProperty?.id === prop.id;
        const isHovered = hoveredPropertyId === prop.id;

        let badgeBg = '#10B981';
        if (prop.availabilityStatus === 'pending_application') badgeBg = '#F59E0B';
        else if (prop.availabilityStatus === 'available_soon') badgeBg = '#3B82F6';
        else if (prop.availabilityStatus === 'rented') badgeBg = '#6B7280';

        if (isSelected || isHovered) {
          badgeBg = '#1E1B4B';
        }

        const labelText = `$${(prop.price / 1000).toFixed(prop.price % 1000 === 0 ? 0 : 1)}k`;
        const svgIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="38" viewBox="0 0 80 38">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="${isSelected || isHovered ? '0.35' : '0.2'}"/>
                </filter>
              </defs>
              <g filter="url(#shadow)">
                <rect x="4" y="3" width="72" height="26" rx="13" fill="${badgeBg}" stroke="#FFFFFF" stroke-width="${isSelected || isHovered ? '2.5' : '1.5'}"/>
                <circle cx="16" cy="16" r="4" fill="${prop.availabilityStatus === 'available_now' ? '#34D399' : '#FFFFFF'}"/>
                <text x="44" y="20" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">${labelText}</text>
                <polygon points="40,29 36,34 44,34" fill="${badgeBg}" />
              </g>
            </svg>
          `)}`,
          scaledSize: new g.maps.Size(isSelected || isHovered ? 90 : 75, isSelected || isHovered ? 44 : 36),
          anchor: new g.maps.Point(isSelected || isHovered ? 45 : 37, isSelected || isHovered ? 42 : 35),
        };

        const existingMarker = currentMarkers.get(prop.id);

        if (!existingMarker) {
          const marker = new g.maps.Marker({
            position: { lat: prop.lat, lng: prop.lng },
            map: map,
            title: prop.title,
            icon: svgIcon,
            zIndex: isSelected ? 100 : isHovered ? 90 : 10,
          });

          marker.addListener('click', () => {
            onSelectProperty(prop);
            setActivePopupProperty(prop);
          });

          marker.addListener('mouseover', () => {
            onHoverProperty(prop.id);
          });

          marker.addListener('mouseout', () => {
            onHoverProperty(null);
          });

          currentMarkers.set(prop.id, marker);
        } else {
          existingMarker.setIcon(svgIcon);
          existingMarker.setZIndex(isSelected ? 100 : isHovered ? 90 : 10);
        }
      });
    } catch (e) {
      console.warn('Error updating markers', e);
    }
  }, [properties, selectedProperty, hoveredPropertyId, mapLoaded]);

  // Recenter when a selected property arrives
  useEffect(() => {
    if (selectedProperty) {
      setActivePopupProperty(selectedProperty);
      if (mapInstanceRef.current && mapLoaded) {
        mapInstanceRef.current.panTo({
          lat: selectedProperty.lat,
          lng: selectedProperty.lng,
        });
      }
    }
  }, [selectedProperty, mapLoaded]);

  const handleApplySearchHere = () => {
    if (onCenterChange) {
      onCenterChange(currentMapCenter);
    }
    setShowSearchHereBtn(false);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          if (mapInstanceRef.current && mapLoaded) {
            mapInstanceRef.current.panTo(userCoords);
            mapInstanceRef.current.setZoom(14);
          }
          if (onCenterChange) {
            onCenterChange(userCoords);
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, maintaining current center', err);
        }
      );
    }
  };

  // Fallback Vector coordinates projection
  const projectedProperties = useMemo(() => {
    const scale = (radiusMiles || 5) * 1.4 * (1 / fallbackZoom);
    return properties.map((prop) => {
      const deltaLng = prop.lng - center.lng;
      const deltaLat = prop.lat - center.lat;
      // 1 deg lat is ~69 miles; 1 deg lng at lat 30 is ~59.6 miles
      const xOffset = (deltaLng * 59.6) / scale;
      const yOffset = (deltaLat * 69.0) / scale;

      const leftPercent = Math.max(5, Math.min(95, 50 + xOffset * 40));
      const topPercent = Math.max(5, Math.min(95, 50 - yOffset * 40));

      return {
        ...prop,
        leftPercent,
        topPercent,
      };
    });
  }, [properties, center, radiusMiles, fallbackZoom]);

  return (
    <div
      className={`relative w-full h-full min-h-[380px] bg-slate-100 overflow-hidden select-none transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-2xl border border-slate-200 shadow-sm'
      }`}
    >
      {/* 1. Real Google Map Viewport Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full min-h-[380px] bg-slate-200 transition-opacity duration-300 ${
          mapLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
        }`}
      />

      {/* 2. Interactive Vector Map Fallback (Visible when Google Map tiles are loading or offline) */}
      {!mapLoaded && (
        <div className="absolute inset-0 w-full h-full bg-[#f4f7f6] overflow-hidden flex items-center justify-center">
          {/* Stylized Map Grid & River Elements */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#f8fafc" />
            <rect width="100%" height="100%" fill="url(#streetGrid)" opacity="0.85" />

            {/* Stylized Colorado River / Lady Bird Lake */}
            <path
              d="M -100 280 C 150 260, 250 330, 450 310 C 650 290, 800 340, 1100 320"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="42"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M -100 280 C 150 260, 250 330, 450 310 C 650 290, 800 340, 1100 320"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="20"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Major Arteries / Highways */}
            <line x1="38%" y1="0%" x2="42%" y2="100%" stroke="#e2e8f0" strokeWidth="8" opacity="0.9" />
            <line x1="0%" y1="45%" x2="100%" y2="48%" stroke="#e2e8f0" strokeWidth="6" opacity="0.9" />

            {/* Search Radius Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={`${35 * fallbackZoom}%`}
              fill="#3b82f6"
              fillOpacity="0.06"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Central User / Search Origin Marker */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </span>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-xs whitespace-nowrap shadow-sm">
              Search Center
            </span>
          </div>

          {/* Interactive Property Markers in Fallback Mode */}
          {projectedProperties.map((prop) => {
            const isSelected = selectedProperty?.id === prop.id;
            const isHovered = hoveredPropertyId === prop.id;

            let badgeBg = 'bg-emerald-600 border-emerald-700';
            if (prop.availabilityStatus === 'pending_application') {
              badgeBg = 'bg-amber-600 border-amber-700';
            } else if (prop.availabilityStatus === 'available_soon') {
              badgeBg = 'bg-blue-600 border-blue-700';
            } else if (prop.availabilityStatus === 'rented') {
              badgeBg = 'bg-slate-600 border-slate-700';
            }

            if (isSelected || isHovered) {
              badgeBg = 'bg-slate-950 border-white ring-2 ring-blue-500 scale-110';
            }

            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => {
                  onSelectProperty(prop);
                  setActivePopupProperty(prop);
                }}
                onMouseEnter={() => onHoverProperty(prop.id)}
                onMouseLeave={() => onHoverProperty(null)}
                style={{
                  left: `${prop.leftPercent}%`,
                  top: `${prop.topPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-full z-25 group transition-all duration-200 cursor-pointer focus:outline-hidden ${
                  isSelected || isHovered ? 'z-40' : 'z-20'
                }`}
              >
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs font-bold shadow-lg border transition-transform group-hover:scale-105 ${badgeBg}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      prop.availabilityStatus === 'available_now' ? 'bg-emerald-300' : 'bg-white'
                    }`}
                  />
                  <span>${(prop.price / 1000).toFixed(prop.price % 1000 === 0 ? 0 : 1)}k</span>
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-800 mx-auto -mt-0.5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Header Badges / Map Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30 gap-2">
        {/* Left: Quick Location & Radius badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur shadow-md rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Search Area ({radiusMiles} mi radius)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur shadow-md rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <span className="font-bold text-slate-900">{properties.length}</span> rentals in bounds
          </div>

          {!mapLoaded && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-amber-50/95 backdrop-blur text-amber-800 border border-amber-200 rounded-xl text-[11px] font-semibold">
              <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
              <span>Interactive Vector Map</span>
            </div>
          )}
        </div>

        {/* Right: Map Style toggles & Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur p-1 rounded-xl shadow-md border border-slate-200">
          {!mapLoaded ? (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setFallbackZoom((z) => Math.min(1.6, z + 0.2))}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-slate-700" />
              </button>
              <button
                onClick={() => setFallbackZoom((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              title="Toggle Satellite view"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
            </button>
          )}

          <button
            onClick={handleLocateMe}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            title="Center on my location"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Map'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* "Search as map moved" floating button */}
      {showSearchHereBtn && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-3 duration-200">
          <button
            onClick={handleApplySearchHere}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Search This Area</span>
          </button>
        </div>
      )}

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-md text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Available Now</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Available Soon</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Pending</span>
        </div>
      </div>

      {/* Interactive Property Preview Popup Card (Bottom Right / Center) */}
      {activePopupProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-35 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="relative h-32 w-full bg-slate-100 overflow-hidden group">
            <img
              src={activePopupProperty.images[0]?.url}
              alt={activePopupProperty.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <button
              onClick={() => setActivePopupProperty(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-white text-[11px] font-semibold">
              {activePopupProperty.propertyType}
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-slate-900 text-xs font-bold shadow-sm">
              {formatPrice(activePopupProperty.price)}/mo
            </div>
          </div>

          <div className="p-3">
            <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
              {activePopupProperty.title}
            </h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{activePopupProperty.address}</span>
            </p>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <span>{activePopupProperty.bedrooms === 0 ? 'Studio' : `${activePopupProperty.bedrooms} bd`}</span>
              <span>•</span>
              <span>{activePopupProperty.bathrooms} ba</span>
              <span>•</span>
              <span>{activePopupProperty.sqft} sqft</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-3">
              <button
                onClick={() => onViewPropertyDetails(activePopupProperty)}
                className="w-full py-1.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              {onApply && (
                <button
                  onClick={() => onApply(activePopupProperty)}
                  className="w-full py-1.5 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 border border-emerald-200"
                >
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span>Apply</span>
                </button>
              )}

              <button
                onClick={() => onOpenChatWithLandlord(activePopupProperty)}
                className="w-full py-1.5 px-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
