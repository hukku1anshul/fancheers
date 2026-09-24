import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ListFilter, RefreshCw, Radio, Heart } from 'lucide-react';
import { teamFollowService } from '../services/teamFollowService';

const SPORT_ICONS = {
  cricket: '🏏',
  baseball: '⚾',
  soccer: '⚽',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
  tennis: '🎾'
};

export default function LiveMatchCarousel({
  matches,
  activeMatch,
  onSelectMatch,
  onOpenMatchList,
  onRefresh,
  isRefreshing
}) {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!matches || matches.length === 0) return null;

  return (
    <section className="w-full flex flex-col gap-2 relative">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>LIVE MATCHES & SCHEDULE</span>
            <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-extrabold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800/40">
              {matches.length} Total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-white dark:bg-pitch-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm active:scale-95 transition"
            title="Refresh Live Scores Now"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-stadium-turf' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Browse All Drawer Button */}
          <button
            onClick={onOpenMatchList}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-slate-900 text-white dark:bg-stadium-neon dark:text-black shadow-sm active:scale-95 transition hover:opacity-90"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>All Matches ({matches.length})</span>
          </button>

          {/* Desktop Left/Right Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1 ml-1">
            <button
              onClick={scrollLeft}
              className="p-1.5 rounded-xl bg-white dark:bg-pitch-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm active:scale-90 transition"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-1.5 rounded-xl bg-white dark:bg-pitch-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm active:scale-90 transition"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Strip of Match Cards */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-0.5 px-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {matches.map((m) => {
          const isSelected = activeMatch?.id === m.id;
          const isFollowed = teamFollowService.isMatchFollowed(m);
          const sportIcon = SPORT_ICONS[m.sport?.toLowerCase()] || '🏆';
          const isLive = m.status === 'in';
          const isStumps = m.status === 'stumps';
          const isPre = m.status === 'pre';
          const isPost = m.status === 'post';

          return (
            <div
              key={m.id}
              onClick={() => onSelectMatch(m)}
              className={`snap-start flex-shrink-0 w-[245px] sm:w-[275px] p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between active:scale-[0.98] select-none ${
                isSelected
                  ? 'bg-white dark:bg-pitch-800 border-stadium-turf dark:border-stadium-neon shadow-md ring-2 ring-stadium-turf/30 dark:ring-stadium-neon/30'
                  : isFollowed
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800/40 hover:border-red-400'
                    : 'bg-white/85 dark:bg-pitch-850/80 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 hover:shadow-sm'
              }`}
            >
              {/* Card Top: League + Status */}
              <div className="flex items-center justify-between gap-1 text-[10px] pb-1.5 mb-1.5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300 truncate max-w-[130px] sm:max-w-[150px]">
                  <span>{sportIcon}</span>
                  <span className="truncate">{m.league || m.sport}</span>
                  {isFollowed && (
                    <span title="You follow a team in this match" className="inline-flex text-[10px] text-red-500 shrink-0">
                      ❤️
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isLive ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-extrabold text-[9px] uppercase border border-red-200 dark:border-red-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span>LIVE</span>
                    </span>
                  ) : isStumps ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-extrabold text-[9px] uppercase border border-amber-200 dark:border-amber-900">
                      ⏸️ STUMPS
                    </span>
                  ) : isPre ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 font-bold text-[9px] uppercase">
                      {m.countdown ? `⏰ ${m.countdown}` : 'UPCOMING'}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-pitch-700 dark:text-slate-300 font-bold text-[9px] uppercase">
                      FINAL
                    </span>
                  )}

                  {isSelected && (
                    <span className="px-1.5 py-0.5 rounded-md bg-stadium-turf text-white text-[9px] font-black uppercase">
                      ✓ JOINED
                    </span>
                  )}
                </div>
              </div>

              {/* Card Middle: Team 1 & Team 2 with scores */}
              <div className="flex flex-col gap-1.5">
                {/* Home Team */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {m.homeTeam.logo ? (
                      <img
                        src={m.homeTeam.logo}
                        alt={m.homeTeam.name}
                        className="w-5 h-5 object-contain flex-shrink-0 rounded-full bg-slate-50 dark:bg-pitch-700 p-0.5 border border-slate-200 dark:border-white/10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-pitch-700 flex items-center justify-center text-[9px] font-bold">
                        {m.homeTeam.shortName?.substring(0, 2)}
                      </div>
                    )}
                    <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {m.homeTeam.name}
                    </span>
                    {m.homeTeam.isBatting && <span className="text-[10px]">🏏</span>}
                  </div>
                  <span className="font-digital text-xs sm:text-sm font-black text-stadium-sky dark:text-stadium-cyan flex-shrink-0">
                    {m.homeTeam.score}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {m.awayTeam.logo ? (
                      <img
                        src={m.awayTeam.logo}
                        alt={m.awayTeam.name}
                        className="w-5 h-5 object-contain flex-shrink-0 rounded-full bg-slate-50 dark:bg-pitch-700 p-0.5 border border-slate-200 dark:border-white/10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-pitch-700 flex items-center justify-center text-[9px] font-bold">
                        {m.awayTeam.shortName?.substring(0, 2)}
                      </div>
                    )}
                    <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {m.awayTeam.name}
                    </span>
                    {m.awayTeam.isBatting && <span className="text-[10px]">🏏</span>}
                  </div>
                  <span className="font-digital text-xs sm:text-sm font-black text-stadium-flame dark:text-stadium-orange flex-shrink-0">
                    {m.awayTeam.score}
                  </span>
                </div>
              </div>

              {/* Card Bottom: Clock / Situation */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="font-mono font-bold truncate max-w-[170px] text-slate-600 dark:text-slate-300">
                  {m.clock}
                </span>
                <span className="text-[9px] font-semibold text-slate-400">
                  {isLive ? 'Cheer live →' : isPre ? 'Rally fans →' : 'View map →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
