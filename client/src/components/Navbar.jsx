import React, { useState } from 'react';
import { Volume2, VolumeX, MapPin, Trophy, Flame, ChevronDown, Sun, Moon, Menu, Server, Wifi } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';

const POPULAR_LOCATIONS = [
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester', country: 'United Kingdom', lat: 53.4808, lng: -2.2426 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060 },
  { name: 'Boston', country: 'United States', lat: 42.3601, lng: -71.0589 },
  { name: 'Detroit', country: 'United States', lat: 42.3314, lng: -83.0458 },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { name: 'Liverpool', country: 'United Kingdom', lat: 53.4084, lng: -2.9916 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 }
];

export default function Navbar({
  onOpenServerModal,
  serverStatus = 'connected',
  onOpenMobileDrawer,
  onOpenPassport,
  onOpenSquad,
  onOpenStands,
  onToggleTvMode,
  onToggleZenMode,
  onOpenLockerRoom,
  onOpenCosmetics,
  onOpenFollowTeams,
  followedCount = 0,
  onOpenVenueGeofence,
  isVenueActive = false,
  onOpenStreamOverlay,
  isSilentMode,
  onToggleSilentMode,
  activeSquadCode,
  sports,
  activeSport,
  onSelectSport,
  matches,
  activeMatch,
  onSelectMatch,
  userLocation,
  onSelectLocation,
  theme,
  onToggleTheme
}) {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showMatchMenu, setShowMatchMenu] = useState(false);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playAirhorn();
    }
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSelectLocation({
            name: 'My GPS Location',
            country: 'Local',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setShowLocationMenu(false);
        },
        () => {
          alert('Could not retrieve GPS position. Please pick a city from the list.');
        }
      );
    }
  };

  return (
    <header className="bg-white/95 dark:bg-pitch-800/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-4 py-2.5 sticky top-0 z-[1000] shadow-sm dark:shadow-2xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Brand & Mobile Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-stadium-flame via-stadium-turf to-stadium-sky p-0.5 shadow-md">
              <div className="w-full h-full bg-white dark:bg-pitch-900 rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-stadium-turf dark:text-stadium-neon animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  FANPULSE
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stadium-turf opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-stadium-turf"></span>
                </span>
                <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-stadium-turf/15 text-stadium-turf dark:text-stadium-neon dark:bg-stadium-neon/15 border border-stadium-turf/30">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">Global Sports Fan Cheer Map</p>
            </div>
          </div>

          {/* Mobile Right Controls (Clean, native 3-item bar for Android & iPhone) */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Live Connection Status Pill */}
            <button
              onClick={onOpenServerModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold shadow-sm active:scale-95 transition ${
                serverStatus === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              }`}
              title="Server Connection Status (Tap to configure)"
            >
              <span className={`w-2 h-2 rounded-full ${serverStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{serverStatus === 'connected' ? 'Live' : 'Connect'}</span>
            </button>

            {/* Bright / Night Theme Switcher */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-pitch-700 text-slate-700 dark:text-slate-200 active:scale-95 transition shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Native Mobile Menu / Hub Button */}
            <button
              onClick={onOpenMobileDrawer}
              className="p-2 rounded-xl border border-stadium-turf/40 bg-stadium-turf/10 text-stadium-turf dark:text-stadium-neon active:scale-95 transition shadow-sm flex items-center justify-center"
              title="Open Stadium Hub"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Right Controls (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-1.5">
            
            {/* Server Connection Button */}
            <button
              onClick={onOpenServerModal}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-extrabold text-xs active:scale-95 transition shadow-sm ${
                serverStatus === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              }`}
              title="Server Connection Settings"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{serverStatus === 'connected' ? 'Cloud Live' : 'Server'}</span>
            </button>

            {/* Bright / Night Theme Switcher */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1 p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-pitch-700 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition shadow-sm"
              title={theme === 'dark' ? 'Switch to Bright Stadium Day Theme' : 'Switch to Midnight Arena Night Theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Follow Teams Button */}
            <button
              onClick={onOpenFollowTeams}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-700/50 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="Follow Your Favorite Teams & Get Alerts"
            >
              <span className="text-rose-500">❤️</span>
              <span className="hidden sm:inline">Follow</span>
              {followedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {followedCount}
                </span>
              )}
            </button>

            {/* Stadium & Terrace Pub Check-In (2x XP) Button */}
            <button
              onClick={onOpenVenueGeofence}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-extrabold text-xs active:scale-95 transition shadow-sm ${
                isVenueActive
                  ? 'bg-amber-400 text-amber-950 border-amber-300 font-black ring-2 ring-amber-400/30'
                  : 'border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
              }`}
              title="Check in at a Stadium or Pub Terrace for a 2x Fan XP Multiplier"
            >
              <span>🍻</span>
              <span className="hidden sm:inline">{isVenueActive ? '2X Active' : 'Terrace'}</span>
            </button>

            {/* Direct Android APK Download Button */}
            <a
              href="/download/apk"
              download="FanPulse.apk"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs active:scale-95 transition shadow-sm hover:bg-emerald-500/20"
              title="Download FanPulse Android App (APK)"
            >
              <span>📱</span>
              <span className="hidden sm:inline">APK</span>
            </a>

            {/* Creator OBS Stream HUD Button */}
            <button
              onClick={onOpenStreamOverlay}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700/50 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="Creator OBS Stream Overlay (Browser Source)"
            >
              <span>📺</span>
              <span className="hidden lg:inline">Stream HUD</span>
            </button>

            {/* Superfan Passport Button */}
            <button
              onClick={onOpenPassport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="View Superfan Passport & Badges"
            >
              <span>🎟️</span>
              <span className="hidden sm:inline">Passport</span>
            </button>

            {/* Squad Watch Button */}
            <button
              onClick={onOpenSquad}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="Private Squad Watch Rooms & Walkie-Talkie Banter"
            >
              <span>🎙️</span>
              <span className="hidden sm:inline">{activeSquadCode || 'Squad'}</span>
            </button>

            {/* Creator Stands Button */}
            <button
              onClick={onOpenStands}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-700/50 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="Creator Stadium Stands & Leaderboard"
            >
              <span>🏟️</span>
              <span className="hidden sm:inline">Stands</span>
            </button>

            {/* Locker Room (Off-Matchday Hub) Button */}
            <button
              onClick={onOpenLockerRoom}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-600/50 bg-amber-500/15 text-amber-900 dark:text-amber-200 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="The Locker Room: Countdown, Fixtures, Table & Daily Check-in"
            >
              <span>🚪</span>
              <span className="hidden md:inline">Locker</span>
            </button>

            {/* Stadium Cosmetics & Fan XP Button */}
            <button
              onClick={onOpenCosmetics}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-purple-300 dark:border-purple-600/50 bg-purple-500/15 text-purple-900 dark:text-purple-200 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="Fan XP, Badges & Custom Stadium Flares"
            >
              <span>✨</span>
              <span className="hidden md:inline">Gear</span>
            </button>

            {/* Stealth Silent Mode Button */}
            <button
              onClick={onToggleSilentMode}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-extrabold text-xs active:scale-95 transition shadow-sm ${
                isSilentMode
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-pitch-700 text-slate-700 dark:text-slate-300'
              }`}
              title="Toggle Stealth Silent Mode (Kinetic reactions & visual shockwaves)"
            >
              <span>🤫</span>
              <span className="hidden md:inline">{isSilentMode ? 'Stealth ON' : 'Stealth'}</span>
            </button>

            {/* Living Room TV Mode Button */}
            <button
              onClick={onToggleTvMode}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-700/50 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="Switch to 10-Foot Living Room TV Big Screen"
            >
              <span>📺</span>
              <span className="hidden sm:inline">TV Cast</span>
            </button>

            {/* Zen Matchday Mode Button */}
            <button
              onClick={onToggleZenMode}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-700/50 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-extrabold text-xs active:scale-95 transition shadow-sm"
              title="One-Tap Zen Controller Mode (Distraction-Free Roar Pad)"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Zen</span>
            </button>

            {/* Mute Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border text-xs transition active:scale-95 ${
                isMuted
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/10'
                  : 'bg-stadium-turf/15 text-stadium-turf dark:bg-stadium-neon/15 dark:text-stadium-neon border-stadium-turf/40'
              }`}
              title={isMuted ? 'Unmute Stadium Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Sport Selection Tabs (Swipeable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar w-full md:w-auto scroll-smooth">
          {sports.map((s) => {
            const isActive = activeSport === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSport(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 shadow-sm ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-pitch-700/80 dark:text-slate-300 dark:hover:bg-pitch-600 border border-slate-200/60 dark:border-white/5'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Match Picker & User Location */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          
          {/* Match Selector Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <button
              onClick={() => setShowMatchMenu(!showMatchMenu)}
              className="w-full md:w-auto flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-pitch-700/90 border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/30 transition shadow-sm"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Trophy className="w-3.5 h-3.5 text-stadium-sun" />
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Real Live Broadcast"></span>
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {activeMatch ? `${activeMatch.homeTeam.shortName || activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.shortName || activeMatch.awayTeam.name}` : 'Select Match'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showMatchMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-pitch-800 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 py-2 backdrop-blur-lg">
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <span>Matches Available ({matches.length})</span>
                  <span className="text-[9px] text-stadium-turf dark:text-stadium-neon font-black">100% Genuine Real Data</span>
                </div>

                <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-white/5">
                  {/* Real Live In-Progress Games */}
                  {matches.some(m => m.isReal && m.status === 'in') && (
                    <div>
                      <div className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/40 text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        <span>🔴 Real Broadcasts (Live Now)</span>
                      </div>
                      {matches.filter(m => m.isReal && m.status === 'in').map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectMatch(m);
                            setShowMatchMenu(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-pitch-700/60 transition ${
                            activeMatch?.id === m.id ? 'bg-slate-100 dark:bg-pitch-700 text-stadium-turf dark:text-stadium-neon font-bold' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <img src={m.homeTeam.logo} alt="" className="w-4 h-4 object-contain" />
                            <span className="font-bold">{m.homeTeam.shortName}</span>
                            <span className="font-mono text-stadium-sky font-extrabold text-[11px]">{m.homeTeam.score}-{m.awayTeam.score}</span>
                            <span className="font-bold">{m.awayTeam.shortName}</span>
                            <img src={m.awayTeam.logo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border border-red-200 dark:border-red-500/30 font-mono font-bold">
                            {m.clock}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Real Scheduled / Final Games */}
                  {matches.some(m => m.isReal && m.status !== 'in') && (
                    <div>
                      <div className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-[10px] font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        📅 Real Fixtures & Results
                      </div>
                      {matches.filter(m => m.isReal && m.status !== 'in').slice(0, 15).map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectMatch(m);
                            setShowMatchMenu(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-pitch-700/60 transition ${
                            activeMatch?.id === m.id ? 'bg-slate-100 dark:bg-pitch-700 text-stadium-turf dark:text-stadium-neon font-bold' : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <img src={m.homeTeam.logo} alt="" className="w-4 h-4 object-contain" />
                            <span>{m.homeTeam.shortName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{m.homeTeam.score}-{m.awayTeam.score}</span>
                            <span>{m.awayTeam.shortName}</span>
                            <img src={m.awayTeam.logo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-pitch-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-mono truncate max-w-[90px]">
                            {m.clock}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Simulated Practice Matches */}
                  {matches.some(m => !m.isReal) && (
                    <div>
                      <div className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        🎮 24/7 Practice Simulator
                      </div>
                      {matches.filter(m => !m.isReal).map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectMatch(m);
                            setShowMatchMenu(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-pitch-700/60 transition ${
                            activeMatch?.id === m.id ? 'bg-slate-100 dark:bg-pitch-700 text-stadium-turf dark:text-stadium-neon font-bold' : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <img src={m.homeTeam.logo} alt="" className="w-4 h-4 object-contain" />
                            <span>{m.homeTeam.shortName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{m.homeTeam.score}-{m.awayTeam.score}</span>
                            <span>{m.awayTeam.shortName}</span>
                            <img src={m.awayTeam.logo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 font-mono">
                            {m.clock}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-pitch-700/90 border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/30 transition shadow-sm"
              title="Change your cheer location on map"
            >
              <MapPin className="w-3.5 h-3.5 text-stadium-sky" />
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{userLocation.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showLocationMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-pitch-800 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 py-2 backdrop-blur-lg">
                <div className="px-3.5 py-1 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Your Cheering City
                  </span>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={handleDetectGPS}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs text-stadium-sky hover:bg-slate-100 dark:hover:bg-pitch-700/60 font-bold flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Detect Current GPS Location
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-white/5 max-h-48 overflow-y-auto p-1.5">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        onSelectLocation(loc);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-pitch-700/60 flex justify-between items-center ${
                        userLocation.name === loc.name ? 'text-stadium-turf dark:text-stadium-neon font-bold bg-slate-100 dark:bg-pitch-700/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{loc.name}</span>
                      <span className="text-[10px] text-slate-400">{loc.country}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
