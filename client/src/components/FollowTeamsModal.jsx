import React, { useState, useMemo } from 'react';
import { X, Heart, Search } from 'lucide-react';
import { teamFollowService } from '../services/teamFollowService';

export default function FollowTeamsModal({ isOpen, onClose, matches }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const allTeams = teamFollowService.extractTeamsFromMatches(matches || []);
  const followCount = teamFollowService.getCount();

  const filteredTeams = searchQuery.trim()
    ? allTeams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sport.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTeams;

  // Group by sport
  const grouped = {};
  for (const team of filteredTeams) {
    const sport = team.sport || 'other';
    if (!grouped[sport]) grouped[sport] = [];
    grouped[sport].push(team);
  }

  const sportLabels = {
    cricket: '🏏 Cricket',
    soccer: '⚽ Football',
    basketball: '🏀 Basketball',
    baseball: '⚾ Baseball',
    football: '🏈 American Football',
    hockey: '🏒 Hockey',
    tennis: '🎾 Tennis',
    other: '🏆 Other'
  };

  const handleToggle = (team) => {
    teamFollowService.toggleFollow(team.id, team.name, team.sport, team.logo);
    setRefreshKey(k => k + 1); // force re-render
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-pitch-800">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-black text-slate-900 dark:text-white text-sm">Follow Teams</span>
            {followCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-[10px] font-bold">
                {followCount} following
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-pitch-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-stadium-turf dark:focus:border-stadium-neon transition"
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-800/30">
          <p className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">
            ❤️ Follow teams to get personalized match filters and targeted notifications
          </p>
        </div>

        {/* Team Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {allTeams.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8">
              No teams available. Matches will populate this list.
            </div>
          ) : (
            Object.entries(grouped).map(([sport, teams]) => (
              <div key={sport}>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {sportLabels[sport] || `🏆 ${sport}`}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {teams.map((team) => {
                    const isFollowed = teamFollowService.isFollowed(team.id);
                    return (
                      <button
                        key={team.id}
                        onClick={() => handleToggle(team)}
                        className={`relative flex items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                          isFollowed
                            ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500/50 shadow-sm'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-pitch-800 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {/* Team Logo or Color Dot */}
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="w-8 h-8 rounded-lg object-cover bg-slate-100 dark:bg-pitch-700"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
                            style={{ backgroundColor: team.color }}
                          >
                            {(team.shortName || team.name || '?').slice(0, 3).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 text-left min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {team.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{team.shortName}</div>
                        </div>

                        {/* Follow Heart Icon */}
                        <Heart
                          className={`w-4 h-4 shrink-0 transition ${
                            isFollowed
                              ? 'text-red-500 fill-red-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-pitch-800 border-t border-slate-200 dark:border-white/10 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs active:scale-95 transition"
          >
            Done ({followCount} team{followCount !== 1 ? 's' : ''} followed)
          </button>
        </div>
      </div>
    </div>
  );
}
