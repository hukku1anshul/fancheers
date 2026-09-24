import React, { useState } from 'react';
import { Flame, ArrowLeft, Volume2, Radio, Sparkles, Zap, Shield, Trophy } from 'lucide-react';
import MomentumWaveform from './MomentumWaveform';
import { hapticEngine } from '../services/hapticEngine';
import { soundEngine } from '../services/soundEffects';

export default function ZenMatchdayMode({
  match,
  stats,
  selectedSide,
  onSelectSide,
  onCheer,
  onOpenSquad,
  onExitZen
}) {
  const [combo, setCombo] = useState(0);
  const [lastCheerSide, setLastCheerSide] = useState(selectedSide);

  const homeTeamName = typeof match?.homeTeam === 'object' ? match.homeTeam.name : (match?.homeTeam || 'Home');
  const awayTeamName = typeof match?.awayTeam === 'object' ? match.awayTeam.name : (match?.awayTeam || 'Away');
  const activeTeamName = selectedSide === 'home' ? homeTeamName : awayTeamName;

  const handleRoar = () => {
    const nextCombo = combo + 1;
    setCombo(nextCombo);

    // Sensory feedback
    hapticEngine.rumbleTap(nextCombo);
    soundEngine.playTap(nextCombo);
    soundEngine.swellCrowd(Math.min(nextCombo / 12, 1));
    if (nextCombo % 5 === 0) soundEngine.playCrowdRoar();
    if (nextCombo % 10 === 0) hapticEngine.rumbleGoal();

    onCheer({
      matchId: match?.id,
      teamSide: selectedSide,
      teamName: activeTeamName,
      cheerType: 'roar',
      count: nextCombo >= 5 ? 3 : 1
    });

    setTimeout(() => {
      setCombo(0);
    }, 2800);
  };

  const handleClap = () => {
    hapticEngine.triggerClap();
    soundEngine.playClap();
    onCheer({
      matchId: match?.id,
      teamSide: selectedSide,
      teamName: activeTeamName,
      cheerType: 'clap',
      count: 2
    });
  };

  const handleFlare = () => {
    hapticEngine.triggerMilestoneCombo();
    soundEngine.playAirhorn();
    onCheer({
      matchId: match?.id,
      teamSide: selectedSide,
      teamName: activeTeamName,
      cheerType: 'flare',
      count: 5
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-pitch-950 text-white flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden animate-fadeIn">
      {/* Dynamic Background Stadium Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onExitZen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition active:scale-95 flex items-center gap-1.5 text-xs font-black uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Zen</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
            <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Zen Matchday Mode</span>
          </div>
        </div>

        {/* Team Selector Pills */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => onSelectSide('home')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition active:scale-95 truncate max-w-[110px] ${
              selectedSide === 'home'
                ? 'bg-stadium-turf text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {homeTeamName}
          </button>
          <button
            onClick={() => onSelectSide('away')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition active:scale-95 truncate max-w-[110px] ${
              selectedSide === 'away'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {awayTeamName}
          </button>
        </div>
      </div>

      {/* Live Compact Scoreboard */}
      <div className="text-center z-10 space-y-2 max-w-lg mx-auto w-full pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{match?.league || 'LIVE SPORTS'}</span>
          <span>•</span>
          <span>{match?.clock || match?.status || 'LIVE'}</span>
        </div>

        <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white bg-black/40 py-2.5 px-5 rounded-2xl border border-white/10 shadow-xl inline-block">
          {match?.homeTeam?.score
            ? `${match.homeTeam.score} - ${match.awayTeam?.score || ''}`
            : (match?.score || 'Live Score')}
        </div>
      </div>

      {/* Center Momentum ECG Waveform */}
      <div className="z-10 w-full max-w-2xl mx-auto my-auto">
        <MomentumWaveform match={match} stats={stats} />
      </div>

      {/* Bottom One-Thumb Tactile Roar Console */}
      <div className="z-10 max-w-md mx-auto w-full space-y-4 pb-2">
        {/* Streak Indicator */}
        <div className="text-center h-6">
          {combo > 0 ? (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider animate-bounce shadow-lg">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>{combo}x ROAR STREAK!</span>
            </span>
          ) : (
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              TAP TO ROAR FOR {activeTeamName.toUpperCase()}
            </span>
          )}
        </div>

        {/* Primary Giant Roar Touchpad */}
        <button
          onClick={handleRoar}
          className="w-full py-7 sm:py-9 rounded-3xl bg-gradient-to-tr from-stadium-turf via-emerald-500 to-teal-400 text-slate-950 font-black text-2xl sm:text-3xl uppercase tracking-wider shadow-2xl shadow-emerald-500/30 active:scale-95 transition-transform flex items-center justify-center gap-3 ring-4 ring-emerald-500/20"
        >
          <Flame className="w-8 h-8 fill-slate-950" />
          <span>ROAR NOW</span>
        </button>

        {/* Flanking Tactile Quick-Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleClap}
            className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 active:scale-95 transition flex flex-col items-center justify-center text-center"
          >
            <span className="text-xl">👏</span>
            <span className="text-[10px] font-black uppercase text-slate-200 mt-0.5">Clap</span>
          </button>

          <button
            onClick={onOpenSquad}
            className="py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 active:scale-95 transition flex flex-col items-center justify-center text-center"
          >
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase mt-0.5">Walkie</span>
          </button>

          <button
            onClick={handleFlare}
            className="py-3 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-300 active:scale-95 transition flex flex-col items-center justify-center text-center"
          >
            <span className="text-xl">💥</span>
            <span className="text-[10px] font-black uppercase mt-0.5">Flare</span>
          </button>
        </div>
      </div>
    </div>
  );
}
