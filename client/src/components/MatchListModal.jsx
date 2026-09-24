import React, { useState } from 'react';
import { X, Search, Radio, Trophy, Clock, PauseCircle } from 'lucide-react';

const SPORT_ICONS = {
  cricket: '🏏',
  baseball: '⚾',
  soccer: '⚽',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
  tennis: '🎾'
};

export default function MatchListModal({
  isOpen,
  onClose,
  matches,
  activeMatch,
  onSelectMatch,
  sports,
  activeSport,
  onSelectSport
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'stumps' | 'pre' | 'post'

  if (!isOpen) return null;

  const filteredMatches = matches.filter((m) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      m.homeTeam?.name?.toLowerCase().includes(query) ||
      m.awayTeam?.name?.toLowerCase().includes(query) ||
      m.league?.toLowerCase().includes(query) ||
      m.venue?.toLowerCase().includes(query) ||
      m.sport?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'live' && m.status === 'in') ||
      (statusFilter === 'stumps' && m.status === 'stumps') ||
      (statusFilter === 'pre' && m.status === 'pre') ||
      (statusFilter === 'post' && m.status === 'post');

    return matchesQuery && matchesStatus;
  });

  const handleSelect = (match) => {
    onSelectMatch(match);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      
      {/* Modal Container */}
      <div 
        className="w-full sm:max-w-2xl max-h-[88vh] bg-white dark:bg-pitch-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-pitch-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stadium-turf text-white flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Live Matches & Schedule Directory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose any live, upcoming, or completed match to view crowd telemetry and cheer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 flex flex-col gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by team (e.g. England, Giants, Arsenal), league, or venue..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-pitch-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-stadium-turf"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-pitch-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({matches.length})
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                statusFilter === 'live'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>🔴 Live Now ({matches.filter(m => m.status === 'in').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('stumps')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                statusFilter === 'stumps'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              <span>⏸️ Stumps ({matches.filter(m => m.status === 'stumps').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('pre')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                statusFilter === 'pre'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
              }`}
            >
              <span>⏰ Upcoming ({matches.filter(m => m.status === 'pre').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('post')}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                statusFilter === 'post'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-pitch-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Finals ({matches.filter(m => m.status === 'post').length})
            </button>
          </div>
        </div>

        {/* Scrollable Match List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <p className="font-bold text-sm">No matches found matching your filter.</p>
              <p className="text-xs mt-1">Try clearing the search query or selecting "All".</p>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const isSelected = activeMatch?.id === m.id;
              const isLive = m.status === 'in';
              const isStumps = m.status === 'stumps';
              const isPre = m.status === 'pre';
              const icon = SPORT_ICONS[m.sport?.toLowerCase()] || '🏆';

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition active:scale-[0.99] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-stadium-turf/10 dark:bg-stadium-neon/10 border-stadium-turf dark:border-stadium-neon shadow-sm ring-1 ring-stadium-turf/30'
                      : 'bg-slate-50/80 dark:bg-pitch-800/60 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {/* Left: Sport + Teams */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                          {m.homeTeam?.name} <span className="text-slate-400 font-normal">vs</span> {m.awayTeam?.name}
                        </span>
                        {isLive && (
                          <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            LIVE
                          </span>
                        )}
                        {isStumps && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex-shrink-0">
                            STUMPS
                          </span>
                        )}
                        {isPre && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 flex-shrink-0">
                            UPCOMING
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-stadium-turf text-white flex-shrink-0">
                            Joined
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {m.league} • {m.venue}
                      </span>
                      {m.situation && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 italic truncate mt-0.5">
                          {m.situation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Score + Clock */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10">
                    <div className="text-left sm:text-right">
                      <div className="font-digital text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        <span className="text-stadium-sky dark:text-stadium-cyan">{m.homeTeam?.score}</span>
                        <span className="text-slate-400 mx-1.5">-</span>
                        <span className="text-stadium-flame dark:text-stadium-orange">{m.awayTeam?.score}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {m.clock}
                      </span>
                    </div>

                    <button
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex-shrink-0 ${
                        isSelected
                          ? 'bg-stadium-turf text-white'
                          : 'bg-white dark:bg-pitch-700 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? 'Joined ✓' : isLive ? 'Cheer Live →' : isPre ? 'Rally Fans →' : 'View Map →'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-pitch-850 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredMatches.length} of {matches.length} matches</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-pitch-700 text-slate-800 dark:text-white font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
