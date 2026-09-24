import React, { useState, useEffect } from 'react';
import { Users, Star, Award, ShieldAlert, Clock, ChevronRight, X, Sparkles, TrendingUp } from 'lucide-react';
import { hapticEngine } from '../services/hapticEngine';
import { fanEconomy } from '../services/fanEconomyService';

export default function MatchDossier({ match, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('lineups'); // 'lineups' | 'ratings' | 'timeline'
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [userRating, setUserRating] = useState(8.0);
  const [ratedPlayers, setRatedPlayers] = useState(new Set());
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (!isOpen || !match?.id) return;
    setLoading(true);

    const fetchIntel = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/match/${match.id}/intelligence`);
        if (res.ok) {
          const data = await res.json();
          setIntelligence(data);
        }
      } catch (err) {
        console.error('Failed to load match intelligence:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntel();
  }, [isOpen, match?.id]);

  if (!isOpen) return null;

  const homeName = typeof match?.homeTeam === 'object' ? match.homeTeam.name : (match?.homeTeam || 'Home');
  const awayName = typeof match?.awayTeam === 'object' ? match.awayTeam.name : (match?.awayTeam || 'Away');

  const handleRatePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      const res = await fetch(`http://localhost:3001/api/match/${match.id}/rate-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: selectedPlayer.id, rating: userRating })
      });

      if (res.ok) {
        const data = await res.json();
        setRatedPlayers(prev => new Set(prev).add(selectedPlayer.id));
        fanEconomy.addXP(40, `Rated ${selectedPlayer.name}`);
        hapticEngine.rumbleComboBurst();

        // Update local rating in state
        if (intelligence?.lineups) {
          const updateInList = (list) => list.map(p => p.id === selectedPlayer.id ? { ...p, rating: data.newAvg, ratingCount: data.totalRatings } : p);
          setIntelligence({
            ...intelligence,
            lineups: {
              home: updateInList(intelligence.lineups.home),
              away: updateInList(intelligence.lineups.away)
            }
          });
        }

        setToastMsg(`⭐ Rated ${selectedPlayer.name} ${userRating.toFixed(1)}/10 (+40 XP)`);
        setTimeout(() => setToastMsg(null), 3000);
        setSelectedPlayer(null);
      }
    } catch (e) {
      console.error('Rate failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Match Intelligence Dossier</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">LIVE</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">{homeName} vs {awayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/20 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('lineups')}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'lineups' ? 'bg-stadium-turf text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            📋 Starting Lineups
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'ratings' ? 'bg-stadium-turf text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            ⭐ Crowd Player Ratings
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'timeline' ? 'bg-stadium-turf text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            ⚡ Key Events Timeline
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              Loading verified match telemetry & lineups...
            </div>
          ) : (
            <>
              {/* TAB 1: LINEUPS */}
              {activeTab === 'lineups' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Home Team Squad */}
                  <div className="space-y-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="font-extrabold text-xs text-stadium-turf flex items-center justify-between pb-1 border-b border-white/10">
                      <span>{homeName}</span>
                      <span className="text-[10px] text-slate-400">Starting XI</span>
                    </div>
                    <div className="space-y-1.5">
                      {intelligence?.lineups?.home?.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono font-black text-[10px] text-slate-300">
                              {player.number}
                            </span>
                            <div>
                              <div className="font-bold text-slate-200">{player.name}</div>
                              <div className="text-[10px] text-slate-400">{player.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-xs">
                            <Star className="w-3 h-3 fill-emerald-400" />
                            <span>{player.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Away Team Squad */}
                  <div className="space-y-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="font-extrabold text-xs text-orange-400 flex items-center justify-between pb-1 border-b border-white/10">
                      <span>{awayName}</span>
                      <span className="text-[10px] text-slate-400">Starting XI</span>
                    </div>
                    <div className="space-y-1.5">
                      {intelligence?.lineups?.away?.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono font-black text-[10px] text-slate-300">
                              {player.number}
                            </span>
                            <div>
                              <div className="font-bold text-slate-200">{player.name}</div>
                              <div className="text-[10px] text-slate-400">{player.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-mono font-bold text-orange-400 text-xs">
                            <Star className="w-3 h-3 fill-orange-400" />
                            <span>{player.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CROWD PLAYER RATINGS (Interactive 1-10) */}
              {activeTab === 'ratings' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Tap any player to submit your crowd rating (1-10) & earn +40 Fan XP!</span>
                    </div>
                  </div>

                  {/* Player Rating Modal / Slider Form */}
                  {selectedPlayer && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rate Performance</div>
                          <div className="text-sm font-black text-white">{selectedPlayer.name} ({selectedPlayer.role})</div>
                        </div>
                        <div className="text-2xl font-black font-mono text-emerald-400">{userRating.toFixed(1)} <span className="text-xs text-slate-400">/ 10</span></div>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={userRating}
                        onChange={(e) => setUserRating(parseFloat(e.target.value))}
                        className="w-full accent-stadium-turf cursor-pointer"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={handleRatePlayer}
                          className="flex-1 py-2.5 rounded-xl bg-stadium-turf text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
                        >
                          Submit Rating
                        </button>
                        <button
                          onClick={() => setSelectedPlayer(null)}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Combined Player Rating Leaderboard */}
                  <div className="space-y-2">
                    {[...(intelligence?.lineups?.home || []), ...(intelligence?.lineups?.away || [])]
                      .sort((a, b) => b.rating - a.rating)
                      .map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setUserRating(p.rating);
                          }}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer active:scale-[0.99] transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 text-slate-300'}`}>
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {ratedPlayers.has(p.id) && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">VOTED</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">{p.role} • {p.ratingCount} fan votes</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="font-mono font-black text-sm text-emerald-400">{p.rating.toFixed(1)}</div>
                              <div className="text-[9px] text-slate-500 uppercase">Match Avg</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: KEY EVENTS TIMELINE (Goals, Wickets, VAR, Subs) */}
              {activeTab === 'timeline' && (
                <div className="space-y-2.5">
                  {intelligence?.keyEvents?.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-xl p-2 rounded-xl bg-black/40 border border-white/10 flex-shrink-0">
                        {ev.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-xs text-stadium-turf">{ev.minute}</span>
                          <span className="text-[10px] font-bold text-slate-400">{ev.team}</span>
                        </div>
                        <div className="font-extrabold text-xs text-white mt-0.5">{ev.player}</div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40 text-center text-[11px] text-slate-400 font-medium">
          Powered by FanPulse Verified Sports Intelligence Engine
        </div>
      </div>
    </div>
  );
}
