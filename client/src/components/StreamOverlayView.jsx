import React, { useEffect, useState } from 'react';
import { Flame, Radio, Zap, Volume2, Shield } from 'lucide-react';
import { socket } from '../services/socket';

export default function StreamOverlayView({ match, stats }) {
  const [livePulse, setLivePulse] = useState(null);
  const [recentChant, setRecentChant] = useState(null);

  useEffect(() => {
    // Set transparent background on document body for OBS Browser Source
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    const handlePulse = (pulse) => {
      setLivePulse(pulse);
      setTimeout(() => setLivePulse(null), 1800);
    };

    socket.on('cheer:pulse', handlePulse);

    return () => {
      socket.off('cheer:pulse', handlePulse);
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, []);

  if (!match) return null;

  const homeName = match.homeTeam?.name || match.homeTeam || 'Home';
  const awayName = match.awayTeam?.name || match.awayTeam || 'Away';
  const scoreText = match.homeTeam?.score
    ? `${match.homeTeam.score} - ${match.awayTeam?.score || ''}`
    : (match.score || 'LIVE');

  const homeCheers = stats?.home?.totalCheers || 3550;
  const awayCheers = stats?.away?.totalCheers || 2940;
  const totalCheers = homeCheers + awayCheers || 1;
  const homePercent = Math.round((homeCheers / totalCheers) * 100);
  const awayPercent = 100 - homePercent;
  const decibels = stats?.cheersPerMinute || 840;

  return (
    <div className="w-full h-screen p-4 sm:p-6 flex flex-col justify-end pointer-events-none select-none">
      {/* Dynamic Pulse Shockwave Indicator on Screen */}
      {livePulse && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping">
          <div className="px-6 py-2 rounded-full bg-red-600/90 text-white font-black text-lg shadow-2xl flex items-center gap-2 backdrop-blur-md border border-white/30">
            <Flame className="w-6 h-6 text-amber-300" />
            <span>STADIUM ROAR FROM {livePulse.city?.toUpperCase() || 'FANS'}!</span>
          </div>
        </div>
      )}

      {/* Broadcast Lower-Third HUD */}
      <div className="max-w-4xl mx-auto w-full bg-slate-950/90 backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-2xl flex flex-col gap-3 text-white pointer-events-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-black tracking-widest text-[10px] uppercase text-stadium-neon">
              FANPULSE LIVE CROWD TELEMETRY
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-slate-300">{match.league || 'Live Match'}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-amber-400 font-bold text-[11px]">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{decibels} Cheers/Min</span>
            </div>
            <div className="bg-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-300">
              Join: fanpulse.app
            </div>
          </div>
        </div>

        {/* Middle Score & Teams */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 flex items-center justify-end gap-3 text-right">
            <div>
              <div className="font-black text-lg sm:text-xl">{homeName}</div>
              <div className="text-[11px] font-bold text-emerald-400">{homePercent}% Crowd Roar</div>
            </div>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md"
              style={{ backgroundColor: match.homeTeam?.color || '#10B981' }}
            >
              {(match.homeTeam?.shortName || homeName).slice(0, 3).toUpperCase()}
            </div>
          </div>

          {/* Central Score */}
          <div className="px-5 py-2 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center shrink-0">
            <span className="font-digital text-2xl sm:text-3xl font-black text-stadium-neon tracking-widest">
              {scoreText}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              {match.clock || 'IN-PLAY'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center justify-start gap-3 text-left">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md"
              style={{ backgroundColor: match.awayTeam?.color || '#6366F1' }}
            >
              {(match.awayTeam?.shortName || awayName).slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-lg sm:text-xl">{awayName}</div>
              <div className="text-[11px] font-bold text-indigo-400">{awayPercent}% Crowd Roar</div>
            </div>
          </div>
        </div>

        {/* Bottom Split Roar Bar */}
        <div className="space-y-1">
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden flex border border-white/10">
            <div
              className="h-full transition-all duration-300 relative"
              style={{ width: `${homePercent}%`, backgroundColor: match.homeTeam?.color || '#10B981' }}
            />
            <div
              className="h-full transition-all duration-300 relative"
              style={{ width: `${awayPercent}%`, backgroundColor: match.awayTeam?.color || '#6366F1' }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>{homeCheers.toLocaleString()} Roars</span>
            <span>Total Stadium Volume: {totalCheers.toLocaleString()} Roars</span>
            <span>{awayCheers.toLocaleString()} Roars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
