import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, X, Bell, Zap, Radio } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';
import { getApiBaseUrl } from '../services/socket';

export default function CrunchTimeAlert({ onJumpIn, currentMatchId }) {
  const [alert, setAlert] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/crunch-alerts`);
        if (res.ok) {
          const data = await res.json();
          if (data.alerts && data.alerts.length > 0) {
            setAlert(data.alerts[0]);
          }
        }
      } catch (e) {
        console.warn('Crunch alert fetch error:', e);
      }
    };

    fetchAlert();
    const interval = setInterval(fetchAlert, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!alert || isDismissed) return null;
  // If already on the match, don't show intrusive banner
  if (alert.matchId === currentMatchId) return null;

  return (
    <aside aria-label="Live Match Alert" className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white px-3 sm:px-4 py-2 border-b border-rose-400/40 shadow-xl relative z-[1050] animate-fadeIn">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
            <span className="text-sm animate-bounce">🚨</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm tracking-tight truncate">
                {alert.title}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[9px] font-black uppercase tracking-wider hidden sm:inline">
                Nail-Biter
              </span>
            </div>
            <p className="text-[11px] text-white/90 truncate font-medium">
              {alert.headline} • <span className="font-bold text-amber-200">{alert.fansCheering.toLocaleString()} fans roaring</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              soundEngine.playCrowdRoar();
              onJumpIn(alert.matchId);
            }}
            className="px-3 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider transition active:scale-95 shadow-md flex items-center gap-1"
          >
            <span>Jump In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-white/70 hover:text-white transition active:scale-95"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
