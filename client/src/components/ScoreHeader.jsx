import React from 'react';
import { Activity, Flame, Radio, Clock, Tv, Trophy, PauseCircle } from 'lucide-react';

import { Share2 } from 'lucide-react';
export default function ScoreHeader({ match, stats, selectedSide, onSelectSide, onOpenFanCard }) {
  if (!match) return null;

  const totalHome = stats?.totalHome || 1200;
  const totalAway = stats?.totalAway || 1100;
  const total = totalHome + totalAway;
  const homeRatio = Math.round((totalHome / total) * 100) || 50;
  const awayRatio = 100 - homeRatio;

  const isHomeLeadingCheers = homeRatio >= 50;
  const isLongScore = String(match.homeTeam?.score || '').length > 4 || String(match.awayTeam?.score || '').length > 4;

  const isLive = match.status === 'in';
  const isPre = match.status === 'pre';
  const isStumps = match.status === 'stumps';
  const isPost = match.status === 'post';

  const defaultHomeLogo = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%230070b8'/><text x='50%' y='55%' font-size='44' text-anchor='middle' dominant-baseline='middle'>🏏</text></svg>";
  const defaultAwayLogo = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%23e6a100'/><text x='50%' y='55%' font-size='44' text-anchor='middle' dominant-baseline='middle'>🏏</text></svg>";

  return (
    <section className="bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 rounded-2xl md:rounded-3xl p-3.5 sm:p-4 md:p-5 shadow-bright-sm dark:shadow-xl relative overflow-hidden transition-colors duration-300">
      
      {/* Subtle Team Color Aura in Background */}
      <div 
        className="absolute top-0 left-0 w-1/3 h-full opacity-10 dark:opacity-15 blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: match.homeTeam.color }}
      />
      <div 
        className="absolute top-0 right-0 w-1/3 h-full opacity-10 dark:opacity-15 blur-3xl pointer-events-none transition-all duration-700"
        style={{ backgroundColor: match.awayTeam.color }}
      />

      <div className="max-w-7xl mx-auto flex flex-col gap-2.5 sm:gap-3.5 relative z-10">
        
        {/* Status Intelligence Banner */}
        {isPre && (
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs text-sky-900 dark:text-sky-200 shadow-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 animate-pulse" />
              <span>
                <strong className="font-extrabold uppercase">Upcoming Match:</strong> Starts {match.countdown ? `${match.countdown} (${match.clock})` : match.clock}
              </span>
            </div>
            {match.broadcast && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300">
                <Tv className="w-3.5 h-3.5" />
                <span>Watch: {match.broadcast}</span>
              </div>
            )}
          </div>
        )}

        {isStumps && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200 shadow-sm flex-wrap">
            <div className="flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                <strong className="font-extrabold uppercase">Match Status:</strong> Stumps / Overnight Interval • Resumes Today at 11:00 AM BST
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Cheer now to rally crowd support ahead of the morning session!
            </span>
          </div>
        )}

        {isPost && (
          <div className="bg-slate-100 dark:bg-pitch-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs text-slate-800 dark:text-slate-200 shadow-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                <strong className="font-extrabold uppercase">Final Result:</strong> Match Completed • Final Telemetry
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {match.venue}
            </span>
          </div>
        )}

        {match.offSeasonNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 shadow-sm">
            <span className="text-base">📢</span>
            <div>
              <strong className="font-bold">Notice:</strong> {match.offSeasonNotice}
            </div>
          </div>
        )}

        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-600/20 dark:text-red-400 border border-red-200 dark:border-red-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>🔴 Live In-Play</span>
              </span>
            ) : isStumps ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 text-[10px] font-extrabold uppercase">
                <span>⏸️ Stumps</span>
              </span>
            ) : isPre ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 text-[10px] font-extrabold uppercase">
                <span>⏰ Upcoming</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-pitch-700 dark:text-slate-300 text-[10px] font-extrabold uppercase">
                <span>🏁 Final</span>
              </span>
            )}

            <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider">{match.league}</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate max-w-[150px] sm:max-w-none text-slate-500 dark:text-slate-400">{match.venue}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFanCard}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-pitch-700 dark:hover:bg-pitch-600 text-slate-700 dark:text-slate-200 text-[10px] font-extrabold border border-slate-200 dark:border-white/10 active:scale-95 transition"
              title="Generate shareable match receipt"
            >
              <span>📸</span>
              <span>Share Card</span>
            </button>
            <span className="flex items-center gap-1 text-stadium-turf dark:text-stadium-neon font-extrabold text-[11px] uppercase tracking-wide">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">{match.source || 'Live'}</span>
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-slate-600 dark:text-slate-300 font-medium text-xs">
              Total Cheers: <strong className="text-slate-900 dark:text-white">{total.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Score & Team Battle Board */}
        <div className="grid grid-cols-12 items-center gap-1.5 sm:gap-3 md:gap-6">
          
          {/* Home Team Card */}
          <div 
            onClick={() => onSelectSide('home')}
            className={`col-span-4 flex items-center justify-end gap-1.5 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-2xl cursor-pointer transition border active:scale-95 ${
              selectedSide === 'home'
                ? 'bg-slate-100 dark:bg-pitch-700/90 border-slate-300 dark:border-white/40 shadow-bright-md scale-[1.02]'
                : 'bg-slate-50/60 dark:bg-pitch-800/50 border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
            }`}
            style={{
              boxShadow: selectedSide === 'home' ? `0 0 20px ${match.homeTeam.color}33` : 'none'
            }}
          >
            <div className="text-right truncate">
              <div className="flex items-center justify-end gap-1">
                <span className="font-extrabold text-xs sm:text-base md:text-xl text-slate-900 dark:text-white tracking-tight truncate">
                  {match.homeTeam.name}
                </span>
                {match.homeTeam.isBatting && (
                  <span title="Currently Batting" className="text-xs">🏏</span>
                )}
                {selectedSide === 'home' && (
                  <span className="text-[8px] sm:text-[9px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0">
                    You
                  </span>
                )}
              </div>

              {match.homeTeam.record && (
                <div className="text-[10px] text-slate-400 font-mono">
                  Record: {match.homeTeam.record}
                </div>
              )}

              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-end gap-1">
                <span className="truncate">{totalHome.toLocaleString()}</span>
                <span className="text-stadium-turf dark:text-stadium-neon font-bold">({homeRatio}%)</span>
              </div>
            </div>

            <div className="relative flex-shrink-0">
              <img 
                src={match.homeTeam.logo || defaultHomeLogo} 
                alt={match.homeTeam.name} 
                className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-sm rounded-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultHomeLogo;
                }}
              />
              <span 
                className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-pitch-800"
                style={{ backgroundColor: match.homeTeam.color }}
              />
            </div>
          </div>

          {/* Central Live Score & Clock */}
          <div className="col-span-4 flex flex-col items-center justify-center text-center px-0.5">
            {isLongScore ? (
              /* Long Score Layout (Cricket In-Play & Overs) */
              <div className="flex flex-col items-center gap-1 w-full max-w-full">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="font-digital text-xs sm:text-base md:text-xl font-black text-stadium-sky dark:text-stadium-cyan truncate max-w-[90px] sm:max-w-[130px] md:max-w-none">
                    {match.homeTeam.score}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600 text-xs font-bold">-</span>
                  <span className="font-digital text-xs sm:text-base md:text-xl font-black text-stadium-flame dark:text-stadium-orange truncate max-w-[90px] sm:max-w-[130px] md:max-w-none">
                    {match.awayTeam.score}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-mono font-bold bg-slate-100 text-slate-800 dark:bg-pitch-700/80 dark:text-stadium-neon border border-slate-200 dark:border-white/10 truncate max-w-full">
                  {match.clock}
                </span>
              </div>
            ) : (
              /* Standard Short Score Layout (Soccer, Baseball, Basketball, NFL) */
              <>
                <div className="flex items-center gap-2 sm:gap-4 font-digital text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-wider">
                  <span className="text-stadium-sky dark:text-stadium-cyan">{match.homeTeam.score}</span>
                  <span className="text-slate-400 dark:text-slate-600 text-lg sm:text-3xl">-</span>
                  <span className="text-stadium-flame dark:text-stadium-orange">{match.awayTeam.score}</span>
                </div>

                <div className="mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-slate-100 text-slate-800 dark:bg-pitch-700/80 dark:text-stadium-neon border border-slate-200 dark:border-white/10 shadow-inner">
                    {match.clock}
                  </span>
                </div>
              </>
            )}

            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 hidden sm:block">
              Tap team card to cheer
            </span>
          </div>

          {/* Away Team Card */}
          <div 
            onClick={() => onSelectSide('away')}
            className={`col-span-4 flex items-center justify-start gap-1.5 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-2xl cursor-pointer transition border active:scale-95 ${
              selectedSide === 'away'
                ? 'bg-slate-100 dark:bg-pitch-700/90 border-slate-300 dark:border-white/40 shadow-bright-md scale-[1.02]'
                : 'bg-slate-50/60 dark:bg-pitch-800/50 border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
            }`}
            style={{
              boxShadow: selectedSide === 'away' ? `0 0 20px ${match.awayTeam.color}33` : 'none'
            }}
          >
            <div className="relative flex-shrink-0">
              <img 
                src={match.awayTeam.logo || defaultAwayLogo} 
                alt={match.awayTeam.name} 
                className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-sm rounded-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAwayLogo;
                }}
              />
              <span 
                className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-pitch-800"
                style={{ backgroundColor: match.awayTeam.color }}
              />
            </div>

            <div className="text-left truncate">
              <div className="flex items-center justify-start gap-1">
                <span className="font-extrabold text-xs sm:text-base md:text-xl text-slate-900 dark:text-white tracking-tight truncate">
                  {match.awayTeam.name}
                </span>
                {match.awayTeam.isBatting && (
                  <span title="Currently Batting" className="text-xs">🏏</span>
                )}
                {selectedSide === 'away' && (
                  <span className="text-[8px] sm:text-[9px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0">
                    You
                  </span>
                )}
              </div>

              {match.awayTeam.record && (
                <div className="text-[10px] text-slate-400 font-mono">
                  Record: {match.awayTeam.record}
                </div>
              )}

              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-start gap-1">
                <span className="text-stadium-flame dark:text-stadium-orange font-bold">({awayRatio}%)</span>
                <span className="truncate">{totalAway.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Real-Time Fan Momentum Barometer & Situation Ticker */}
        <div className="bg-slate-50 dark:bg-pitch-900/80 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-extrabold">
            <span className="flex items-center gap-1" style={{ color: match.homeTeam.color }}>
              <Flame className="w-3.5 h-3.5" />
              {match.homeTeam.shortName} Crowd: {homeRatio}%
            </span>

            <span className="text-slate-500 dark:text-slate-400 font-medium hidden md:inline text-[10px]">
              {isHomeLeadingCheers 
                ? `🔥 ${match.homeTeam.name} fans are roaring louder!` 
                : `⚡ ${match.awayTeam.name} fans are roaring back!`}
            </span>

            <span className="flex items-center gap-1" style={{ color: match.awayTeam.color }}>
              {match.awayTeam.shortName} Crowd: {awayRatio}%
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Tug-of-war Bar */}
          <div className="h-2.5 sm:h-3 w-full bg-slate-200 dark:bg-pitch-950 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/10 flex relative shadow-inner">
            <div 
              className="h-full rounded-l-full transition-all duration-500"
              style={{ 
                width: `${homeRatio}%`, 
                backgroundColor: match.homeTeam.color,
                boxShadow: `0 0 10px ${match.homeTeam.color}`
              }}
            />
            <div 
              className="h-full rounded-r-full transition-all duration-500"
              style={{ 
                width: `${awayRatio}%`, 
                backgroundColor: match.awayTeam.color,
                boxShadow: `0 0 10px ${match.awayTeam.color}`
              }}
            />
          </div>

          {/* Situation & Match Event Ticker */}
          <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-700 dark:text-slate-200">
            {isLive ? (
              <Activity className="w-3.5 h-3.5 text-stadium-turf dark:text-stadium-neon flex-shrink-0 animate-spin" />
            ) : isStumps ? (
              <PauseCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            ) : isPre ? (
              <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            ) : (
              <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            )}
            
            <span className="text-slate-500 dark:text-slate-400 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider">
              {isLive ? 'Live Action:' : isStumps ? 'Stumps Standing:' : isPre ? 'Match Preview:' : 'Match Recap:'}
            </span>
            <span className="italic truncate text-[11px] sm:text-xs text-slate-800 dark:text-slate-200">
              {match.situation || match.lastEvent}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
