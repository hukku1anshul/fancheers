import React, { useState, useEffect } from 'react';
import { Tv, QrCode, Smartphone, Flame, Volume2, Shield, Radio, Sparkles } from 'lucide-react';
import MomentumWaveform from './MomentumWaveform';
import { getSocket } from '../services/socket';
import { soundEffects } from '../services/soundEffects';

export default function TvDisplayView({ match, stats, onExitTvMode }) {
  const [pairCode, setPairCode] = useState('SYNC');
  const [connectedRemotes, setConnectedRemotes] = useState(0);
  const [latestRemoteAction, setLatestRemoteAction] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('tv:init', { matchId: match?.id || 'live' });

    socket.on('tv:session', (session) => {
      setPairCode(session.pairCode);
    });

    socket.on('tv:remote_connected', (data) => {
      setConnectedRemotes(data.totalRemotes || 1);
      soundEffects.playClap();
    });

    socket.on('tv:remote_disconnected', (data) => {
      setConnectedRemotes(data.remainingRemotes || 0);
    });

    socket.on('tv:action_received', (action) => {
      setLatestRemoteAction(action);
      if (action.type === 'ROAR') {
        soundEffects.playRoarSwell();
      } else if (action.type === 'CLAP') {
        soundEffects.playClap();
      }
      setTimeout(() => setLatestRemoteAction(null), 2500);
    });

    return () => {
      socket.off('tv:session');
      socket.off('tv:remote_connected');
      socket.off('tv:remote_disconnected');
      socket.off('tv:action_received');
    };
  }, [match?.id]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none p-6 sm:p-8 relative">
      {/* Dynamic Stadium Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top TV Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏟️</span>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>FANPULSE</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                  TV CAST MODE
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">10-Foot Living Room Stadium Visualizer</p>
            </div>
          </div>
        </div>

        {/* Pairing Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 flex items-center gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <Smartphone className="w-5 h-5 animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider">Pair Phone:</span>
            </div>
            <span className="font-mono text-xl font-black text-amber-300 tracking-widest bg-black/40 px-3 py-1 rounded-xl border border-amber-400/30">
              {pairCode}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold border-l border-white/20 pl-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{connectedRemotes} Remote{connectedRemotes !== 1 ? 's' : ''} Linked</span>
            </div>
          </div>

          <button
            onClick={onExitTvMode}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-extrabold border border-white/10 transition active:scale-95"
          >
            Exit TV Mode
          </button>
        </div>
      </div>

      {/* Center Match Display */}
      <div className="my-auto z-10 max-w-5xl mx-auto w-full text-center space-y-6">
        {/* League & Venue */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold text-slate-300 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{match?.league || "LIVE CRICKET MATCH"}</span>
          <span>•</span>
          <span>{match?.venue || "Bayuemas Oval, Kuala Lumpur"}</span>
        </div>

        {/* Massive Scoreboard Display */}
        <div className="flex items-center justify-center gap-8 sm:gap-16">
          <div className="text-center space-y-2">
            <span className="text-6xl sm:text-7xl block filter drop-shadow">
              {match?.homeTeam?.logo ? (
                <img src={match.homeTeam.logo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto" />
              ) : (
                '🏆'
              )}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {typeof match?.homeTeam === 'object' ? match?.homeTeam?.name : match?.homeTeam || 'Home Team'}
            </h2>
            <div className="text-xs font-bold text-emerald-400">
              {(stats?.home?.totalCheers || stats?.homeCheers || 4699).toLocaleString()} Roars
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono bg-black/40 px-6 py-3 rounded-3xl border border-white/10 shadow-2xl">
              {match?.homeTeam?.score
                ? `${match.homeTeam.score} - ${match.awayTeam?.score || ''}`
                : (match?.score || '313/9 - 154/5')}
            </div>
            <div className="mt-2 text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/20">
              ● {match?.clock || match?.status || 'LIVE (In-Play)'}
            </div>
          </div>

          <div className="text-center space-y-2">
            <span className="text-6xl sm:text-7xl block filter drop-shadow">
              {match?.awayTeam?.logo ? (
                <img src={match.awayTeam.logo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto" />
              ) : (
                '⚽'
              )}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {typeof match?.awayTeam === 'object' ? match?.awayTeam?.name : match?.awayTeam || 'Away Team'}
            </h2>
            <div className="text-xs font-bold text-orange-400">
              {(stats?.away?.totalCheers || stats?.awayCheers || 3785).toLocaleString()} Roars
            </div>
          </div>
        </div>

        {/* Remote Action Burst Visualizer */}
        {latestRemoteAction && (
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl animate-bounce">
            <Sparkles className="w-5 h-5" />
            <span>🔥 Living Room Remote Triggered {latestRemoteAction.type}!</span>
          </div>
        )}

        {/* Widescreen Momentum Waveform */}
        <div className="w-full">
          <MomentumWaveform stats={stats} />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4 z-10">
        <div className="flex items-center gap-2">
          <span>Scan on mobile:</span>
          <code className="font-mono text-emerald-400 bg-black/40 px-2 py-0.5 rounded">
            {window.location.origin}/?mode=remote&pair={pairCode}
          </code>
        </div>
        <div>
          <span>Audio: Procedural Stadium Swell Active • 60 FPS Locked</span>
        </div>
      </div>
    </div>
  );
}
