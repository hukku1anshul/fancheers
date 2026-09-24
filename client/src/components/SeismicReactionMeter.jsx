import React from 'react';
import { Zap, Radio, Globe2, Gauge } from 'lucide-react';

export default function SeismicReactionMeter({ stats, userLocation }) {
  const cheersPerMin = stats?.cheersPerMinute || 820;
  // Simulated human reaction latency in ms based on cheer frequency
  const latencyMs = Math.max(280, Math.min(650, Math.round(900 - (cheersPerMin / 2500) * 500)));
  const leadingCity = stats?.turf?.cheerCapital?.name || userLocation?.name || 'London';

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold select-none">
      <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse flex-shrink-0" />
      <span className="hidden sm:inline">Shockwave Velocity:</span>
      <span className="font-mono text-amber-900 dark:text-amber-200 font-black">{latencyMs}ms</span>
      <span className="text-slate-400 hidden md:inline">•</span>
      <span className="hidden md:inline font-bold text-slate-600 dark:text-slate-300">
        {leadingCity} leading reaction
      </span>
    </div>
  );
}
