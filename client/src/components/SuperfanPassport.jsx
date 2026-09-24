import React from 'react';
import { X, Award, Flame, Shield, Trophy, CheckCircle, Zap, Star } from 'lucide-react';

export default function SuperfanPassport({ isOpen, onClose, passportData }) {
  if (!isOpen) return null;

  const { xp, level, tier, totalCheers, matchesAttended, badges } = passportData;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Passport Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-stadium-turf to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🎟️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">Superfan Passport</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase tracking-wider">
                  Level {level}
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">Verified Fan Identity & Match Credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passport Stats Bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 bg-slate-50/80 dark:bg-pitch-800/80 p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 text-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Status</span>
            <div className="font-black text-xs sm:text-sm text-stadium-turf dark:text-stadium-neon truncate mt-0.5">{tier}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Roars</span>
            <div className="font-black text-xs sm:text-sm text-slate-800 dark:text-white mt-0.5">{totalCheers.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Fan XP</span>
            <div className="font-black text-xs sm:text-sm text-amber-500 mt-0.5 flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{xp}</span>
            </div>
          </div>
        </div>

        {/* Badges List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto max-h-[55vh] space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span>Unlocked Achievements</span>
            <span>{badges.filter(b => b.unlocked).length} / {badges.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border transition flex items-start gap-3 ${
                  b.unlocked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-pitch-800/40 border-slate-200 dark:border-white/5 opacity-60'
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{b.icon}</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {b.title}
                    </h5>
                    {b.unlocked ? (
                      <CheckCircle className="w-3.5 h-3.5 text-stadium-turf flex-shrink-0" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 font-mono">{b.progress}%</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-pitch-850 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Keep roaring to unlock exclusive stadium sound packs & flares!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs active:scale-95 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
