import React, { useState } from 'react';
import { MessageSquare, Trophy, Globe, Flame, Radio, MessagesSquare } from 'lucide-react';
import StadiumWall from './StadiumWall';

export default function LiveFeedSidebar({
  match,
  stats,
  chants,
  onCityClick,
  userName,
  onChatMessageSent
}) {
  const [activeTab, setActiveTab] = useState('chat');

  const citiesList = stats?.cities ? Object.values(stats.cities) : [];
  const topCities = [...citiesList].sort((a, b) => b.total - a.total).slice(0, 10);

  const countriesList = stats?.countries ? Object.values(stats.countries) : [];
  const topCountries = [...countriesList].sort((a, b) => b.total - a.total).slice(0, 6);

  return (
    <div className="bg-white dark:bg-pitch-800/95 border border-slate-200/80 dark:border-white/10 rounded-2xl md:rounded-3xl flex flex-col h-[480px] sm:h-[540px] md:h-[600px] shadow-bright-md dark:shadow-2xl overflow-hidden transition-colors duration-300">
      
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-pitch-900/80 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
            activeTab === 'chat'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-pitch-700 dark:text-white border border-slate-200/80 dark:border-white/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessagesSquare className="w-3.5 h-3.5 text-stadium-turf dark:text-stadium-neon" />
          <span>💬 Wall</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
            activeTab === 'feed'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-pitch-700 dark:text-white border border-slate-200/80 dark:border-white/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-stadium-turf dark:text-stadium-neon animate-pulse" />
          <span>Chants ({chants?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
            activeTab === 'leaderboard'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-pitch-700 dark:text-white border border-slate-200/80 dark:border-white/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-stadium-sun" />
          <span>Cities</span>
        </button>
      </div>

      {/* Stadium Wall Tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 overflow-hidden">
          <StadiumWall match={match} userName={userName} onMessageSent={onChatMessageSent} />
        </div>
      )}

      {/* Live Chants Feed */}
      {activeTab === 'feed' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {(!chants || chants.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
              <span>No chants yet. Shout or pick a chant below to send the first message!</span>
            </div>
          ) : (
            chants.map((c) => {
              const color = c.teamColor || '#10B981';
              return (
                <div
                  key={c.id}
                  onClick={() => onCityClick && onCityClick({ lat: c.lat, lng: c.lng, name: c.city })}
                  className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-pitch-700/50 dark:hover:bg-pitch-700/80 border border-slate-200/60 dark:border-white/5 transition flex flex-col gap-1 cursor-pointer active:scale-98 shadow-sm group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-extrabold text-slate-900 dark:text-white">{c.city}</span>
                      <span className="text-slate-400 text-[10px]">• {c.country}</span>
                    </div>
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {c.teamName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium pl-3 border-l-2 border-slate-300 dark:border-white/10 mt-0.5 break-words">
                    "{c.text}"
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>Top Cheering Metro Hubs</span>
              <Flame className="w-3.5 h-3.5 text-stadium-flame" />
            </h4>

            <div className="space-y-1.5">
              {topCities.map((city, idx) => {
                const total = city.total;
                const homeRatio = Math.round((city.homeCheers / total) * 100);
                const awayRatio = 100 - homeRatio;
                return (
                  <div
                    key={city.name}
                    onClick={() => onCityClick && onCityClick(city)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-pitch-700/40 dark:hover:bg-pitch-700/70 border border-slate-200/60 dark:border-white/5 cursor-pointer transition active:scale-98"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[10px] w-4 text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{city.name}</span>
                        <span className="text-[10px] text-slate-400">{city.country}</span>
                      </div>
                      <span className="font-mono font-extrabold text-stadium-turf dark:text-stadium-neon text-xs">
                        {total.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                      <div style={{ width: `${homeRatio}%`, backgroundColor: match.homeTeam.color }} />
                      <div style={{ width: `${awayRatio}%`, backgroundColor: match.awayTeam.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/10 pt-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-stadium-sky" />
              <span>Countries Leading Fan Volume</span>
            </h4>

            <div className="space-y-1.5">
              {topCountries.map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-pitch-900/60 border border-slate-200/40 dark:border-transparent">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{c.country}</span>
                  <span className="font-mono font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                    {c.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Footer */}
      <div className="p-2 bg-slate-50 dark:bg-pitch-900/90 border-t border-slate-100 dark:border-white/10 text-[10px] text-center text-slate-400">
        Live telemetry synced across sports channels
      </div>

    </div>
  );
}
