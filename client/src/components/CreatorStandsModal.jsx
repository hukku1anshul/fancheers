import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Users, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { getSocket } from '../services/socket';

export default function CreatorStandsModal({ isOpen, onClose, selectedStandId, onSelectStand }) {
  const [stands, setStands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStands = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/creator-stands');
      if (res.ok) {
        const data = await res.json();
        setStands(data.stands || []);
      }
    } catch (e) {
      console.warn('Error fetching stands:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStands();
      const socket = getSocket();
      if (socket) {
        socket.on('stands:update', (data) => {
          if (data.leaderboard) setStands(data.leaderboard);
        });
      }
      return () => {
        if (socket) socket.off('stands:update');
      };
    }
  }, [isOpen]);

  const handleCheerStand = (standId) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('stands:cheer', { standId, count: 5 });
    }
    // Optimistic local update
    setStands(prev =>
      prev.map(s => (s.id === standId ? { ...s, cheers: s.cheers + 5 } : s))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🏟️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">Creator Stadium Stands</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase tracking-wider">
                  Live Battle
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">Join your favorite creator's army & power their section</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Every roar you tap contributes to your creator stand's leaderboard rank and projects custom section flares into the 3D stadium!</span>
        </div>

        {/* Stands List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {stands.map((stand) => {
            const isSelected = selectedStandId === stand.id;
            return (
              <div
                key={stand.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isSelected
                    ? 'bg-slate-50 dark:bg-pitch-800/90 border-stadium-turf dark:border-stadium-neon shadow-md ring-2 ring-stadium-turf/20'
                    : 'bg-white dark:bg-pitch-850/60 border-slate-200 dark:border-white/5 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{stand.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {stand.name}
                        </h4>
                        {stand.isLeader && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-0.5">
                            👑 Rank #1
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Hosted by {stand.hosts} • <span className="italic">{stand.motto}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-slate-900 dark:text-white flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{stand.cheers.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-0.5 mt-0.5">
                      <Users className="w-3 h-3" />
                      {stand.fansCount} fans
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ⚡ {stand.activeMultiplier} Roar Multiplier
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCheerStand(stand.id)}
                      className="px-3 py-1 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 font-extrabold text-[11px] active:scale-95 transition"
                    >
                      🔥 Boost +5
                    </button>

                    <button
                      onClick={() => {
                        onSelectStand(stand.id);
                      }}
                      className={`px-3 py-1 rounded-xl font-extrabold text-[11px] transition active:scale-95 flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Joined Stand</span>
                        </>
                      ) : (
                        <span>Sit Here</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-pitch-850 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            Sections update in real-time as millions cheer worldwide.
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
