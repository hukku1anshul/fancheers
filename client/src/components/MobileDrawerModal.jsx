import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  MapPin,
  Trophy,
  Flame,
  Radio,
  Tv,
  Compass,
  Sparkles,
  Ticket,
  Headphones,
  DoorOpen,
  EyeOff,
  Video,
  ExternalLink,
  Smartphone,
  Server
} from 'lucide-react';

export default function MobileDrawerModal({
  isOpen,
  onClose,
  onOpenServerSettings,
  serverStatus,
  onOpenFollowTeams,
  followedCount = 0,
  onOpenVenueGeofence,
  isVenueActive = false,
  onOpenStreamOverlay,
  onOpenPassport,
  onOpenSquad,
  activeSquadCode,
  onOpenStands,
  onOpenLockerRoom,
  onOpenCosmetics,
  onToggleTvMode,
  onToggleZenMode,
  isSilentMode,
  onToggleSilentMode,
  isMuted,
  onToggleMute,
  onOpenReplayRadar
}) {
  if (!isOpen) return null;

  const actions = [
    {
      label: 'Server Connection',
      desc: serverStatus === 'connected' ? 'Connected to live backend' : 'Configure server URL',
      icon: Server,
      color: serverStatus === 'connected' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10',
      badge: serverStatus === 'connected' ? '🟢 Online' : '🟡 Reconnecting',
      onClick: () => { onClose(); onOpenServerSettings(); }
    },
    {
      label: 'Follow Favorite Teams',
      desc: 'Instant goal & crunch-time notifications',
      icon: Trophy,
      color: 'text-rose-500 bg-rose-500/10',
      badge: followedCount > 0 ? `${followedCount} Followed` : null,
      onClick: () => { onClose(); onOpenFollowTeams(); }
    },
    {
      label: 'Terrace & Pub Check-In',
      desc: '2x Fan XP multiplier at verified venues',
      icon: MapPin,
      color: 'text-amber-500 bg-amber-500/10',
      badge: isVenueActive ? '2x Active' : null,
      onClick: () => { onClose(); onOpenVenueGeofence(); }
    },
    {
      label: 'Squad Watch Room',
      desc: 'Private cheer squad & walkie-talkie banter',
      icon: Headphones,
      color: 'text-emerald-500 bg-emerald-500/10',
      badge: activeSquadCode || null,
      onClick: () => { onClose(); onOpenSquad(); }
    },
    {
      label: 'Superfan Passport',
      desc: 'Matchday stamps, badges & fan rank',
      icon: Ticket,
      color: 'text-purple-500 bg-purple-500/10',
      onClick: () => { onClose(); onOpenPassport(); }
    },
    {
      label: 'The Locker Room',
      desc: 'Midweek training ground banter & roar',
      icon: DoorOpen,
      color: 'text-blue-500 bg-blue-500/10',
      onClick: () => { onClose(); onOpenLockerRoom(); }
    },
    {
      label: 'Fan XP & Cosmetics',
      desc: 'Unlock flares, crest borders & smoke bombs',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10',
      onClick: () => { onClose(); onOpenCosmetics(); }
    },
    {
      label: 'Creator Stream HUD',
      desc: 'Transparent OBS overlay for live streaming',
      icon: Tv,
      color: 'text-indigo-500 bg-indigo-500/10',
      onClick: () => { onClose(); onOpenStreamOverlay(); }
    },
    {
      label: 'Replay Radar',
      desc: 'Official broadcaster key highlights',
      icon: Video,
      color: 'text-red-500 bg-red-500/10',
      onClick: () => { onClose(); onOpenReplayRadar(); }
    },
    {
      label: isSilentMode ? 'Exit Stealth Mode' : 'Stealth Silent Mode',
      desc: 'Tactile kinetic shocks without stadium audio',
      icon: EyeOff,
      color: 'text-slate-500 bg-slate-500/10',
      badge: isSilentMode ? 'Active' : null,
      onClick: () => { onToggleSilentMode(); onClose(); }
    },
    {
      label: 'Zen Matchday Mode',
      desc: 'Minimalist one-thumb stadium controller',
      icon: Compass,
      color: 'text-teal-500 bg-teal-500/10',
      onClick: () => { onToggleZenMode(); onClose(); }
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-pitch-800 w-full rounded-t-3xl border-t border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Handle */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-pitch-600 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-stadium-turf dark:text-stadium-neon animate-pulse" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Stadium Fan Hub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-pitch-700 text-slate-600 dark:text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="p-4 overflow-y-auto space-y-2">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={act.onClick}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-pitch-700/30 hover:bg-slate-100 dark:hover:bg-pitch-700/60 active:scale-[0.98] transition flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {act.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {act.desc}
                    </span>
                  </div>
                </div>
                {act.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stadium-turf/15 text-stadium-turf dark:text-stadium-neon font-bold border border-stadium-turf/30">
                    {act.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Footer Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-pitch-900/60 flex items-center justify-between">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-pitch-700 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Stadium'}</span>
          </button>

          <a
            href="/download/apk"
            download="FanPulse.apk"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stadium-turf text-white text-xs font-extrabold shadow-md active:scale-95 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>Download APK</span>
          </a>
        </div>

      </div>
    </div>
  );
}
