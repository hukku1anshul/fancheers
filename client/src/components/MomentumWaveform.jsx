import SeismicReactionMeter from './SeismicReactionMeter';
import React, { useState } from 'react';
import { Activity, Flame, Clock, Sliders, Volume2, ShieldCheck, Zap, Mic, CheckCircle2 } from 'lucide-react';
import { tvSync } from '../services/tvSyncService';
import { soundEngine } from '../services/soundEffects';
import { hapticEngine } from '../services/hapticEngine';
import { acousticSyncService } from '../services/acousticSyncService';

export default function MomentumWaveform({ match, stats, tvDelay, onTvDelayChange = () => {} }) {
  const [showDelaySlider, setShowDelaySlider] = useState(false);
  const currentDelay = typeof tvDelay === 'number' ? tvDelay : (tvSync?.getDelay ? tvSync.getDelay() : 0);

  if (!match) return null;

  const momentumHistory = stats?.momentumHistory || [];
  const velocity = stats?.cheersPerMinute || 820;

  // Build SVG polygon points for smooth ECG chart
  const width = 600;
  const height = 65;
  const pointsCount = Math.max(momentumHistory.length, 10);
  const stepX = width / Math.max(pointsCount - 1, 1);

  // Home line & Away line
  let homePath = '';
  let awayPath = '';
  let homeArea = `M 0,${height}`;
  let awayArea = `M 0,${height}`;

  momentumHistory.forEach((pt, idx) => {
    const x = Math.round(idx * stepX);
    // Normalize velocity (0-100) to height (5-60)
    const yHome = Math.max(8, height - Math.min((pt.homeVelocity || 20) * 0.8, height - 10));
    const yAway = Math.max(8, height - Math.min((pt.awayVelocity || 20) * 0.8, height - 10));

    if (idx === 0) {
      homePath += `M ${x},${yHome}`;
      awayPath += `M ${x},${yAway}`;
      homeArea += ` L ${x},${yHome}`;
      awayArea += ` L ${x},${yAway}`;
    } else {
      homePath += ` L ${x},${yHome}`;
      awayPath += ` L ${x},${yAway}`;
      homeArea += ` L ${x},${yHome}`;
      awayArea += ` L ${x},${yAway}`;
    }
  });

  homeArea += ` L ${width},${height} Z`;
  awayArea += ` L ${width},${height} Z`;

  const [isListening, setIsListening] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    tvSync.setDelay(val);
    onTvDelayChange(val);
    hapticEngine.rumbleTap(3);
  };

  const handleStartAcousticSync = async () => {
    setIsListening(true);
    setSyncProgress({ progress: 10, decibels: 45 });
    setSyncResult(null);
    hapticEngine.rumbleTap(2);

    try {
      const result = await acousticSyncService.calibrateDelay((p) => {
        setSyncProgress(p);
      });
      tvSync.setDelay(result.delaySeconds);
      onTvDelayChange(result.delaySeconds);
      setSyncResult(result);
      hapticEngine.rumbleComboBurst();
      soundEngine.playSuccessTone ? soundEngine.playSuccessTone() : soundEngine.playTap(5);
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <section className="bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden transition">
      
      {/* Waveform Header & TV Sync Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
          <Activity className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="uppercase tracking-wider text-[11px] sm:text-xs">Live Match Momentum (ECG)</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-extrabold text-[10px] border border-red-200 dark:border-red-900">
            <Flame className="w-3 h-3 animate-bounce" />
            <span>{velocity.toLocaleString()} Cheers/Min</span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SeismicReactionMeter stats={stats} />
          {/* TV Sync Pill & Slider Toggle */}
          <button
            onClick={() => setShowDelaySlider(!showDelaySlider)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border active:scale-95 transition ${
              syncResult
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50'
                : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-pitch-700 dark:hover:bg-pitch-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
            }`}
            title="Configure broadcast delay to avoid spoilers"
          >
            <Sliders className="w-3 h-3 text-sky-500" />
            <span>TV Sync: {currentDelay === 0 ? 'Live (0s)' : `+${currentDelay}s`}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </button>

          {/* Quick Sound Clap Button */}
          <button
            onClick={() => {
              soundEngine.playStadiumClap();
              hapticEngine.rumbleComboBurst();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200/80 dark:bg-pitch-700 text-slate-700 dark:text-slate-300 active:scale-90 transition"
            title="Trigger Stadium Clap Rhythm"
          >
            <span>👏 Clap</span>
          </button>
        </div>
      </div>

      {/* Expandable TV Delay Slider & Acoustic Auto-Sync */}
      {showDelaySlider && (
        <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 flex flex-col gap-2.5 animate-fadeIn text-xs">
          <div className="flex items-center justify-between font-bold text-sky-900 dark:text-sky-200 text-[11px]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>Spoiler-Proof Broadcast Delay Sync</span>
            </span>
            <span className="font-mono font-black bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded-md text-sky-700 dark:text-sky-300">
              +{currentDelay}s Lag Calibration
            </span>
          </div>

          <p className="text-[10px] text-sky-700 dark:text-sky-300 leading-relaxed">
            Streaming via Apple TV, Sky Sports, JioCinema, Peacock, or Hotstar? Auto-calibrate or slide so crowds roar at the exact split-second you see the goal!
          </p>

          {/* Acoustic TV Auto-Sync Controller */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-pitch-800 border border-sky-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartAcousticSync}
                disabled={isListening}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition active:scale-95 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white'
                }`}
              >
                <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : ''}`} />
                <span>{isListening ? 'Listening to TV Audio...' : '🎙️ Acoustic Auto-Sync'}</span>
              </button>

              {isListening && syncProgress && (
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-100"
                      style={{ width: `${syncProgress.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {syncProgress.decibels} dB
                  </span>
                </div>
              )}
            </div>

            {syncResult && (
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Auto-Calibrated: +{syncResult.delaySeconds}s ({syncResult.streamType}) • {syncResult.confidence}% match</span>
              </div>
            )}
          </div>

          {/* Manual Range Slider */}
          <div className="flex items-center gap-3 pt-0.5">
            <span className="text-[10px] text-slate-500 font-bold">0s (Live OTA)</span>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={currentDelay}
              onChange={handleSliderChange}
              className="flex-1 accent-sky-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-bold">60s (Stream Lag)</span>
          </div>
        </div>
      )}

      {/* SVG Momentum Chart */}
      <div className="relative w-full h-[70px] bg-slate-50 dark:bg-pitch-900/90 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 flex items-center">
        {/* Legend */}
        <div className="absolute top-1.5 right-2 flex items-center gap-3 text-[9px] font-extrabold z-10 select-none">
          <span className="flex items-center gap-1" style={{ color: match.homeTeam.color }}>
            <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: match.homeTeam.color }} />
            {match.homeTeam.shortName} Momentum
          </span>
          <span className="flex items-center gap-1" style={{ color: match.awayTeam.color }}>
            <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: match.awayTeam.color }} />
            {match.awayTeam.shortName} Momentum
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <defs>
            <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={match.homeTeam.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={match.homeTeam.color} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="awayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={match.awayTeam.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={match.awayTeam.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fills */}
          <path d={homeArea} fill="url(#homeGrad)" />
          <path d={awayArea} fill="url(#awayGrad)" />

          {/* Lines */}
          <path d={homePath} fill="none" stroke={match.homeTeam.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={awayPath} fill="none" stroke={match.awayTeam.color} strokeWidth="2" strokeDasharray="3,2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Event Pin Markers */}
          {momentumHistory.map((pt, i) => {
            if (!pt.event) return null;
            const x = Math.round(i * stepX);
            const y = Math.max(8, height - Math.min(pt.homeVelocity * 0.8, height - 10));
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" />
                <text x={x} y={Math.max(12, y - 6)} fontSize="8" fontWeight="900" fill="#EF4444" textAnchor="middle">
                  {pt.event}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

    </section>
  );
}
