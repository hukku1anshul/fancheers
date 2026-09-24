import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Globe, Map, Navigation, Layers } from 'lucide-react';

function isValidLatLng(coords) {
  if (!Array.isArray(coords) || coords.length < 2) return false;
  const lat = Number(coords[0]);
  const lng = Number(coords[1]);
  return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export default function FanMap({
  match,
  stats,
  userLocation,
  activePulses,
  onMapCityClick,
  theme = 'light'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const rippleLayerRef = useRef(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState('world');

  const safeFlyTo = (coords, zoom, options = { duration: 1 }) => {
    if (!mapInstanceRef.current || !isValidLatLng(coords)) return;
    try {
      const size = mapInstanceRef.current.getSize();
      if (size && size.x > 0 && size.y > 0) {
        mapInstanceRef.current.flyTo(coords, zoom, options);
      } else {
        mapInstanceRef.current.setView(coords, zoom);
      }
    } catch (err) {
      console.warn('safeFlyTo fallback to setView:', err.message);
      try {
        mapInstanceRef.current.setView(coords, zoom);
      } catch (e) {}
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [25, 10],
          zoom: 2,
          minZoom: 2,
          maxZoom: 16,
          zoomControl: false,
          worldCopyJump: true
        });

        // Add Zoom Control at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer
        const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        tileLayerRef.current = L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        rippleLayerRef.current = L.layerGroup().addTo(map);

        map.on('zoomend', () => {
          try {
            const z = map.getZoom();
            if (z <= 3) setCurrentZoomLevel('world');
            else if (z <= 7) setCurrentZoomLevel('country');
            else setCurrentZoomLevel('city');
          } catch (e) {}
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    }

    // ResizeObserver to automatically invalidateSize when container resizes or unhides
    let resizeObserver;
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (e) {}
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when Theme changes
  useEffect(() => {
    if (!tileLayerRef.current) return;
    try {
      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      // Theme is styled via CSS filter on .leaflet-tile-pane
    } catch (e) {}
  }, [theme]);

  // Center map on match venue when match changes
  useEffect(() => {
    if (!mapInstanceRef.current || !match) return;
    const coords = match.homeTeam?.coordinates;
    if (isValidLatLng(coords)) {
      safeFlyTo(coords, 5);
    }
  }, [match?.id]);

  // Update Data Markers when stats or match change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !stats || !match) return;

    try {
      markersLayerRef.current.clearLayers();

      const homeColor = match.homeTeam?.color || '#10B981';
      const awayColor = match.awayTeam?.color || '#2563EB';

      // 1. Render City Bubbles
      if (stats.cities) {
        Object.values(stats.cities).forEach((city) => {
          if (!isValidLatLng([city.lat, city.lng])) return;

          const total = city.total || 1;
          const homeRatio = Math.round(((city.homeCheers || 0) / total) * 100);
          const awayRatio = 100 - homeRatio;
          const dominantColor = homeRatio >= 50 ? homeColor : awayColor;
          const radius = Math.min(Math.max(Math.sqrt(total) * 1.5, 12), 36);

          const customIcon = L.divIcon({
            className: 'city-cheer-marker',
            html: `
              <div style="
                width: ${radius * 2}px;
                height: ${radius * 2}px;
                margin-left: -${radius}px;
                margin-top: -${radius}px;
                border-radius: 50%;
                background: radial-gradient(circle, ${dominantColor}e6 30%, ${dominantColor}44 75%, transparent 100%);
                border: 2.5px solid ${theme === 'dark' ? dominantColor : '#ffffff'};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px ${dominantColor}66, 0 1px 4px rgba(0,0,0,0.2);
                cursor: pointer;
                transition: transform 0.2s ease;
              ">
                <span style="font-size: 10px; font-weight: 800; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                  ${total.toLocaleString()}
                </span>
              </div>
            `,
            iconSize: [radius * 2, radius * 2]
          });

          const isCapital = stats.turf?.cheerCapital?.name === city.name;
          const crownBadge = isCapital ? '<div style="position:absolute; top:-12px; font-size:14px;">👑</div>' : '';
          const customIconWithCrown = L.divIcon({
            className: 'city-cheer-marker',
            html: `
              <div style="position:relative; display:flex; justify-content:center;">
                ${crownBadge}
                <div style="
                  width: ${radius * 2}px;
                  height: ${radius * 2}px;
                  border-radius: 50%;
                  background: radial-gradient(circle, ${dominantColor}e6 30%, ${dominantColor}44 75%, transparent 100%);
                  border: 2.5px solid ${isCapital ? '#F59E0B' : (theme === 'dark' ? dominantColor : '#ffffff')};
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 4px ${isCapital ? '20px #F59E0B' : '15px ' + dominantColor + '66'}, 0 1px 4px rgba(0,0,0,0.2);
                  cursor: pointer;
                  transition: transform 0.2s ease;
                ">
                  <span style="font-size: 10px; font-weight: 800; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            `,
            iconSize: [radius * 2, radius * 2]
          });
          const marker = L.marker([city.lat, city.lng], { icon: customIconWithCrown });

          const popupContent = document.createElement('div');
          popupContent.className = theme === 'dark'
            ? 'p-3 bg-pitch-900 text-white rounded-2xl min-w-[200px] border border-white/10 font-sans'
            : 'p-3 bg-white text-slate-800 rounded-2xl min-w-[200px] border border-slate-200 font-sans shadow-xl';

          popupContent.innerHTML = `
            <div class="flex items-center justify-between gap-2 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'} pb-1.5 mb-2">
              <h4 class="font-extrabold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}">${city.name || 'City'}</h4>
              <span class="text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}">${city.country || ''}</span>
            </div>
            <div class="text-xs space-y-1.5">
              <div class="flex justify-between items-center text-[11px]">
                <span style="color: ${homeColor}; font-weight: 800;">${match.homeTeam?.shortName || 'Home'}: ${(city.homeCheers || 0).toLocaleString()}</span>
                <span class="font-bold">${homeRatio}%</span>
              </div>
              <div class="w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} h-2 rounded-full overflow-hidden flex">
                <div style="width: ${homeRatio}%; background: ${homeColor};"></div>
                <div style="width: ${awayRatio}%; background: ${awayColor};"></div>
              </div>
              <div class="flex justify-between items-center text-[11px]">
                <span style="color: ${awayColor}; font-weight: 800;">${match.awayTeam?.shortName || 'Away'}: ${(city.awayCheers || 0).toLocaleString()}</span>
                <span class="font-bold">${awayRatio}%</span>
              </div>
            </div>
            <div class="mt-2.5 pt-2 border-t ${theme === 'dark' ? 'border-white/10 text-stadium-neon' : 'border-slate-100 text-stadium-turf'} text-[10px] text-center font-extrabold">
              City Fans: ${total.toLocaleString()}
            </div>
          `;

          marker.bindPopup(popupContent, {
            className: 'custom-fan-popup',
            closeButton: false
          });

          marker.on('click', () => {
            if (onMapCityClick) onMapCityClick(city);
          });

          markersLayerRef.current.addLayer(marker);
        });
      }

      // 2. Add Host Venue Stadium Landmark Marker
      if (match.homeTeam?.coordinates && isValidLatLng(match.homeTeam.coordinates)) {
        const stadiumIcon = L.divIcon({
          className: 'stadium-marker',
          html: `
            <div style="
              width: 36px;
              height: 36px;
              margin-left: -18px;
              margin-top: -18px;
              border-radius: 12px;
              background: #10B981;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
              font-size: 18px;
              border: 2px solid #fff;
            ">
              🏟️
            </div>
          `,
          iconSize: [36, 36]
        });

        const stadiumMarker = L.marker(match.homeTeam.coordinates, { icon: stadiumIcon });
        stadiumMarker.bindPopup(`
          <div style="padding: 6px; font-size: 11px; font-family: sans-serif;">
            <strong style="color: #10B981;">🏟️ Match Stadium</strong><br/>
            ${match.venue || 'Stadium'}
          </div>
        `, { closeButton: false });
        markersLayerRef.current.addLayer(stadiumMarker);
      }
    } catch (err) {
      console.warn('Error updating markers:', err);
    }
  }, [stats, match, theme]);

  // Handle Real-Time Cheer Ripples on the Map
  useEffect(() => {
    if (!mapInstanceRef.current || !rippleLayerRef.current || !activePulses || activePulses.length === 0) return;

    const latestPulse = activePulses[0];
    if (!latestPulse || !isValidLatLng([latestPulse.lat, latestPulse.lng])) return;

    try {
      const color = latestPulse.teamColor || '#10B981';

      const rippleIcon = L.divIcon({
        className: 'cheer-ripple-container',
        html: `
          <div class="cheer-ripple-core" style="background-color: ${color}; color: ${color};"></div>
          <div class="cheer-ripple-ring" style="color: ${color};"></div>
        `,
        iconSize: [60, 60]
      });

      const rippleMarker = L.marker([latestPulse.lat, latestPulse.lng], {
        icon: rippleIcon,
        interactive: false
      });

      rippleLayerRef.current.addLayer(rippleMarker);

      // Floating speech bubble if message
      let chantMarker = null;
      if (latestPulse.message) {
        const chantIcon = L.divIcon({
          className: 'floating-chant-marker',
          html: `
            <div style="
              background: ${theme === 'dark' ? 'rgba(13, 19, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
              backdrop-filter: blur(8px);
              border: 2px solid ${color};
              box-shadow: 0 6px 25px ${color}55;
              color: ${theme === 'dark' ? '#fff' : '#0f172a'};
              padding: 6px 12px;
              border-radius: 14px;
              font-size: 12px;
              font-weight: 800;
              white-space: nowrap;
              transform: translate(-50%, -45px);
              animation: floatUp 3.2s ease-out forwards;
              pointer-events: none;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; display: inline-block;"></span>
              <span>${latestPulse.message}</span>
            </div>
          `,
          iconSize: [0, 0]
        });

        chantMarker = L.marker([latestPulse.lat, latestPulse.lng], {
          icon: chantIcon,
          interactive: false
        });
        rippleLayerRef.current.addLayer(chantMarker);
      }

      const timer = setTimeout(() => {
        if (rippleLayerRef.current) {
          try {
            rippleLayerRef.current.removeLayer(rippleMarker);
            if (chantMarker) rippleLayerRef.current.removeLayer(chantMarker);
          } catch (e) {}
        }
      }, 3200);

      return () => clearTimeout(timer);
    } catch (err) {
      console.warn('Error handling ripple pulse:', err);
    }
  }, [activePulses, theme]);

  // Navigation functions
  const zoomToWorld = () => {
    safeFlyTo([25, 10], 2);
    setCurrentZoomLevel('world');
  };

  const zoomToCountry = () => {
    if (match) {
      const targetCoord = isValidLatLng(match.homeTeam?.coordinates)
        ? match.homeTeam.coordinates
        : [51.5074, -0.1278];
      safeFlyTo(targetCoord, 5);
      setCurrentZoomLevel('country');
    }
  };

  const zoomToCity = () => {
    if (match) {
      const targetCoord = isValidLatLng(match.homeTeam?.coordinates)
        ? match.homeTeam.coordinates
        : [51.5074, -0.1278];
      safeFlyTo(targetCoord, 11);
      setCurrentZoomLevel('city');
    }
  };

  const zoomToUserLocation = () => {
    if (userLocation && isValidLatLng([userLocation.lat, userLocation.lng])) {
      safeFlyTo([userLocation.lat, userLocation.lng], 11);
      setCurrentZoomLevel('city');
    }
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] md:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-bright-md dark:shadow-2xl bg-slate-100 dark:bg-pitch-900 transition-colors duration-300">
      
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating View Controls (Thumb-Friendly on Mobile) */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1 bg-white/90 dark:bg-pitch-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 dark:border-white/15 shadow-bright-sm dark:shadow-xl">
        <button
          onClick={zoomToWorld}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition active:scale-95 ${
            currentZoomLevel === 'world'
              ? 'bg-slate-900 text-white dark:bg-stadium-neon dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
          title="World View"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>World</span>
        </button>

        <button
          onClick={zoomToCountry}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition active:scale-95 ${
            currentZoomLevel === 'country'
              ? 'bg-slate-900 text-white dark:bg-stadium-neon dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
          title="Country View"
        >
          <Map className="w-3.5 h-3.5" />
          <span>Country</span>
        </button>

        <button
          onClick={zoomToCity}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition active:scale-95 ${
            currentZoomLevel === 'city'
              ? 'bg-slate-900 text-white dark:bg-stadium-neon dark:text-black shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
          title="City & Stadium View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>City</span>
        </button>

        <button
          onClick={zoomToUserLocation}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold text-stadium-sky dark:text-stadium-cyan bg-sky-50 dark:bg-pitch-800 border border-sky-200 dark:border-stadium-cyan/30 active:scale-95 transition shadow-sm"
          title={`Center on ${userLocation?.name || 'Your Location'}`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="truncate max-w-[70px] sm:max-w-none">{userLocation?.name || 'Me'}</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 dark:bg-pitch-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/15 text-[10px] sm:text-[11px] shadow-bright-sm dark:shadow-xl max-w-[240px]">
        <div className="font-extrabold text-slate-900 dark:text-slate-200 mb-1 flex items-center justify-between">
          <span>Crowd Heat Key</span>
          <span className="text-[9px] text-stadium-turf dark:text-stadium-neon font-mono animate-pulse">● Active</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: match?.homeTeam?.color || '#10B981' }} />
            <span className="truncate max-w-[65px]">{match?.homeTeam?.shortName || 'Home'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: match?.awayTeam?.color || '#2563EB' }} />
            <span className="truncate max-w-[65px]">{match?.awayTeam?.shortName || 'Away'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏟️</span>
            <span>Venue</span>
          </div>
        </div>
      </div>

    </div>
  );
}
