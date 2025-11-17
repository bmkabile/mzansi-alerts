import React, { useEffect, useRef } from 'react';
import { Alert, Location, AlertType } from '../types';
import { ALERT_TYPE_DETAILS, SA_WARDS_GEOJSON, MOCK_COUNCILORS } from '../constants';
// FIX: Import FeatureGroup and Layer to make Leaflet types available for module augmentation, which resolves all three TypeScript errors.
import L, { FeatureGroup, Layer } from 'leaflet';
import 'leaflet.markercluster';
import { NavigationIcon, PlusIcon, MinusIcon } from './Icons';
import MapFilters from './MapFilters';
import { timeAgo } from '../utils';

// Correctly augment the 'leaflet' module to add types for the markercluster plugin.
// This ensures that TypeScript understands that L.markerClusterGroup and L.MarkerClusterGroup exist.
declare module 'leaflet' {
  namespace L {
    class MarkerClusterGroup extends FeatureGroup {
      addLayers(layers: Layer[]): this;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function markerClusterGroup(options?: any): MarkerClusterGroup;
  }
}

interface MapViewProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  userLocation: Location | null;
  activeFilters: AlertType[];
  onToggleFilter: (type: AlertType) => void;
  isOverlayActive: boolean;
  showAds: boolean;
}

// SVG paths for icons, adapted for inlining in Leaflet markers
const ICON_SVG_STRINGS: Record<AlertType, string> = {
  [AlertType.Crime]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  [AlertType.Pothole]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15.5A3.5 3.5 0 0 1 7.5 12H12m10 0a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/><path d="M12 12H7.5A3.5 3.5 0 0 0 4 15.5v0A3.5 3.5 0 0 0 7.5 19H12"/><path d="m5 16 7 7"/><path d="m8 13-1.5 6"/><path d="M19 12h.5A3.5 3.5 0 0 1 23 15.5v0A3.5 3.5 0 0 1 19.5 19H19"/></svg>`,
  [AlertType.Traffic]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22H6.11a2 2 0 0 1-1.9-1.44L2.5 12.55A2 2 0 0 1 4.48 10H6"/><path d="M14 17h4"/><path d="M18 10h-2.31a2 2 0 0 0-1.87.98L12.5 13.5"/><path d="m14 9-2.06 3.5"/><path d="M3 10h3"/><path d="M17 3h2.11a2 2 0 0 1 1.9 1.44l1.7 8.01A2 2 0 0 1 20.52 15H18"/></svg>`,
  [AlertType.Weather]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  [AlertType.PowerOutage]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  [AlertType.WaterIssue]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  [AlertType.Other]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
};

// The user provided an API key for Google Maps. While the standard Leaflet
// tile layer for Google Maps doesn't use a key directly in the URL,
// we are switching the tile provider to Google Maps as requested.
const GOOGLE_MAPS_API_KEY = 'AIzaSyBsBaw7mUARNeTnxVygfzX-IKoSpEGjHWc';


const MapView: React.FC<MapViewProps> = ({ alerts, onSelectAlert, userLocation, activeFilters, onToggleFilter, isOverlayActive, showAds }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const wardBoundariesRef = useRef<L.GeoJSON | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-26.2041, 28.0473], // Default to Johannesburg
        zoom: 11,
        zoomControl: false // Disable default zoom control
      });

      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
      }).addTo(map);

      mapRef.current = map;
      
      // Initialize MarkerClusterGroup for Alerts with custom icons
      markerClusterRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let size, pixelSize, textSize;
          if (count < 10) {
            size = 'w-10 h-10';
            pixelSize = 40;
            textSize = 'text-sm';
          } else if (count < 100) {
            size = 'w-12 h-12';
            pixelSize = 48;
            textSize = 'text-base';
          } else {
            size = 'w-14 h-14';
            pixelSize = 56;
            textSize = 'text-lg';
          }
  
          return L.divIcon({
            html: `<div class="bg-primary/80 backdrop-blur-sm text-white font-bold rounded-full flex justify-center items-center border-2 border-white/50 shadow-lg ${size} ${textSize}">${count}</div>`,
            className: 'bg-transparent border-0',
            iconSize: [pixelSize, pixelSize],
          });
        }
      });
      map.addLayer(markerClusterRef.current);
    }
     // Cleanup on unmount
    return () => {
        mapRef.current?.remove();
        mapRef.current = null;
    }
  }, []);
  
  // Add ward boundaries
  useEffect(() => {
    if (mapRef.current) {
      const wardStyle = {
        color: '#004D40', // primary theme color
        weight: 2,
        opacity: 0.65,
        fillOpacity: 0.1,
      };

      const highlightStyle = {
        weight: 4,
        color: '#FFC107', // secondary theme color
        fillOpacity: 0.25,
      };

      wardBoundariesRef.current = L.geoJSON(SA_WARDS_GEOJSON as any, {
        style: wardStyle,
        onEachFeature: (feature, layer) => {
          layer.on({
            click: (e) => {
              const wardId = feature.properties.WARD_NO;
              const councilor = MOCK_COUNCILORS.find(c => c.ward === wardId);

              let popupContent = `<div class="font-sans p-1 text-center text-text-primary">
                                      <p class="font-bold text-lg">Ward ${wardId}</p>`;

              if (councilor) {
                  popupContent += `<div class="border-t my-1.5 border-gray-200"></div>
                                   <p class="text-sm font-semibold">${councilor.name}</p>
                                   <p class="text-xs text-text-secondary">${councilor.party}</p>`;
              }
              
              popupContent += `</div>`;


              L.popup({ closeButton: false, minWidth: 150, className: 'ward-info-popup' })
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(mapRef.current!);
            },
            mouseover: (e) => {
              e.target.setStyle(highlightStyle);
            },
            mouseout: (e) => {
              wardBoundariesRef.current?.resetStyle(e.target);
            },
          });
        },
      }).addTo(mapRef.current);
    }
  }, []);

  // Update map view to user location
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 14);

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIconHtml = `
            <div class="relative flex h-5 w-5">
                <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                <div class="relative inline-flex rounded-full h-5 w-5 bg-blue-500 border-2 border-white shadow-md"></div>
            </div>`;

        const userIcon = L.divIcon({
          html: userIconHtml,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
      }
    }
  }, [userLocation]);

  // Update alert markers
  useEffect(() => {
    if (!markerClusterRef.current) return;

    markerClusterRef.current.clearLayers();
    
    const markers: L.Marker[] = [];
    alerts.forEach(alert => {
      const details = ALERT_TYPE_DETAILS[alert.type];
      const iconSvg = ICON_SVG_STRINGS[alert.type];
      const bgColor = alert.isResolved ? 'bg-gray-500' : `bg-${details.color}`;
      const animationDelay = `${(Math.random() * 2.5).toFixed(2)}s`;

      const iconHtml = `
        <div class="relative ${bgColor} rounded-full w-9 h-9 flex justify-center items-center border-2 border-white shadow-lg cursor-pointer transition-transform duration-200 marker-pulse ${alert.isResolved ? 'opacity-80' : ''}" style="animation-delay: ${animationDelay};">
          ${iconSvg}
          ${alert.isResolved ? `<div class="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent border-0',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([alert.location.lat, alert.location.lng], { icon: customIcon });
      
      marker.on('click', (e) => {
          const map = mapRef.current;
          if (!map) return;

          map.flyTo(e.latlng, 16);

          const popupContent = `
            <div class="font-sans p-1 max-w-[220px]">
                <div class="flex items-center mb-2">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center mr-2">
                        ${ICON_SVG_STRINGS[alert.type]}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-text-primary truncate" title="${details.label}">${details.label}</p>
                        <p class="text-xs text-text-secondary">${timeAgo(alert.timestamp, true)}</p>
                    </div>
                </div>
                <p class="text-base font-semibold text-text-primary mb-2 leading-tight">${alert.title}</p>
                <button id="view-details-${alert.id}" class="w-full text-center bg-primary text-white text-sm font-bold py-1.5 px-3 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                    View Details
                </button>
            </div>
          `;
          
          L.popup({
              closeButton: true,
              minWidth: 200,
              className: 'alert-popup'
          })
          .setLatLng(e.latlng)
          .setContent(popupContent)
          .openOn(map);
          
          const button = document.getElementById(`view-details-${alert.id}`);
          if (button) {
              button.onclick = () => {
                  map.closePopup();
                  onSelectAlert(alert);
              };
          }
      });
      
      // Add hover animation via JS events for reliability
      marker.on('mouseover', (e) => {
        const iconElement = e.target._icon?.children[0];
        if (iconElement) {
          iconElement.classList.add('scale-110');
        }
      });
      marker.on('mouseout', (e) => {
        const iconElement = e.target._icon?.children[0];
        if (iconElement) {
          iconElement.classList.remove('scale-110');
        }
      });
      
      // Add a tooltip that appears on hover
      marker.bindTooltip(
        `
          <div class="font-sans">
            <strong class="text-sm">${alert.title}</strong>
            <p class="text-xs text-text-secondary">${details.label}</p>
          </div>
        `,
        {
          offset: L.point(22, 0), // Position it nicely to the right
          direction: 'right',
          className: 'mzansi-tooltip' // Custom class for styling
        }
      );
      
      markers.push(marker);
    });

    markerClusterRef.current.addLayers(markers);

  }, [alerts, onSelectAlert]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (userLocation) {
      mapRef.current?.flyTo([userLocation.lat, userLocation.lng], 14);
    }
  };

  return (
    <div className="w-full h-full relative">
      <style>{`
        /* Marker pulse animation */
        @keyframes subtle-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
        .marker-pulse {
           animation-name: subtle-pulse;
           animation-duration: 2.5s;
           animation-timing-function: ease-in-out;
           animation-iteration-count: infinite;
        }
        .marker-pulse:hover {
          animation-play-state: paused; /* Stop pulsing on hover for easier interaction */
        }

        /* Ad ticker animation */
        @keyframes slide-ads {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-75%); } /* 3 unique ads, 4 total items */
        }
        .ad-content {
            animation: slide-ads 20s linear infinite;
        }
        .ad-content:hover {
            animation-play-state: paused;
        }

        /* Custom styles for the Leaflet tooltip */
        .mzansi-tooltip {
          background-color: rgba(255, 255, 255, 0.92); /* Slightly more opaque for readability */
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px); /* For Safari */
          border: 1px solid rgba(229, 231, 235, 0.8); /* Softer, Tailwind gray-200 like */
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Refined shadow */
          padding: 8px 12px !important; /* Use important to override Leaflet's defaults */
          text-shadow: 0 1px 1px rgba(255,255,255,0.6); /* Improves readability */
        }
        /* Hide the default pointy arrow of the tooltip */
        .leaflet-tooltip-left.mzansi-tooltip::before,
        .leaflet-tooltip-right.mzansi-tooltip::before,
        .leaflet-tooltip-top.mzansi-tooltip::before,
        .leaflet-tooltip-bottom.mzansi-tooltip::before {
          border: none !important;
        }

        /* Custom style for the ward info popup */
        .ward-info-popup .leaflet-popup-content-wrapper {
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            padding: 4px !important;
            border: 1px solid rgba(229, 231, 235, 0.9);
        }
        .ward-info-popup .leaflet-popup-content {
            margin: 8px 12px !important;
            font-size: 14px;
            line-height: 1.4;
        }
        .ward-info-popup .leaflet-popup-tip-container {
            display: none; /* Hide the pointy arrow for a cleaner look */
        }

        /* Custom style for the alert popover */
        .alert-popup .leaflet-popup-content-wrapper {
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            padding: 4px !important;
            border: 1px solid rgba(229, 231, 235, 0.9);
        }
        .alert-popup .leaflet-popup-content {
            margin: 8px !important;
            line-height: 1.4;
            font-size: 14px;
        }
        .alert-popup .leaflet-popup-tip-container {
            width: 30px;
            height: 15px;
        }
        .alert-popup .leaflet-popup-tip {
            border: none;
            background: transparent;
            box-shadow: none;
        }
        .alert-popup .leaflet-popup-close-button {
            top: 10px;
            right: 10px;
            padding: 4px 4px 0 0;
            color: #9ca3af;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Custom Map Controls */}
      <div className="absolute top-4 right-4 z-[401] flex flex-col space-y-2">
        <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50">
           <button onClick={handleZoomIn} className="p-2.5 text-text-primary hover:bg-gray-200/80 rounded-t-lg transition-colors" aria-label="Zoom in">
              <PlusIcon className="h-5 w-5" />
            </button>
            <div className="w-full h-px bg-gray-200/80"></div>
            <button onClick={handleZoomOut} className="p-2.5 text-text-primary hover:bg-gray-200/80 rounded-b-lg transition-colors" aria-label="Zoom out">
              <MinusIcon className="h-5 w-5" />
            </button>
        </div>
       
        {userLocation && (
           <button 
             onClick={handleRecenter} 
             className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200/50 text-text-primary hover:bg-gray-200/80 transition-colors" 
             aria-label="Recenter map to your location"
           >
              <NavigationIcon className="h-5 w-5" />
            </button>
        )}
      </div>

      {/* Map Filters */}
      <div className={`
        absolute z-[401] top-4 left-4
        transition-all duration-300 ease-in-out
        ${isOverlayActive
          ? 'opacity-0 scale-95 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
        }`
      }>
        <MapFilters activeFilters={activeFilters} onToggleFilter={onToggleFilter} />
      </div>

      {/* Mock Ad Placeholder */}
      {showAds && (
        <div className={`
          absolute z-[401] bottom-4 left-1/2 -translate-x-1/2
          transition-all duration-300 ease-in-out
          ${isOverlayActive
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'opacity-100 scale-100 pointer-events-auto'
          }`
        }>
          <div className="bg-gray-200 w-80 max-w-[calc(100vw-2rem)] h-14 rounded-lg shadow-lg border border-gray-300 flex items-center p-1.5 space-x-2">
            <div className="flex-1 h-full overflow-hidden relative cursor-pointer">
              <div className="ad-content flex absolute top-0 left-0 w-[400%] h-full items-center">
                  {/* 3 unique ads, with the first repeated at the end for a seamless loop */}
                  <span className="w-1/4 flex-shrink-0 text-center text-gray-600 text-sm font-semibold p-2">Vuyo's Tyres - Pothole-proof your ride!</span>
                  <span className="w-1/4 flex-shrink-0 text-center text-gray-600 text-sm font-semibold p-2">Langa's Security - 24/7 Peace of Mind.</span>
                  <span className="w-1/4 flex-shrink-0 text-center text-gray-600 text-sm font-semibold p-2">Sipho's Coffee - Your Morning Alert.</span>
                  <span className="w-1/4 flex-shrink-0 text-center text-gray-600 text-sm font-semibold p-2">Vuyo's Tyres - Pothole-proof your ride!</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MapView;