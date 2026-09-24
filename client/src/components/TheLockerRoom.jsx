import React, { useState } from 'react';
import { Shield, Flame, Calendar, Trophy, Zap, CheckCircle2, Clock, X, ArrowRight, MessageSquare } from 'lucide-react';
import { fanEconomy } from '../services/fanEconomyService';
import { hapticEngine } from '../services/hapticEngine';
import { soundEngine } from '../services/soundEffects';

export default function TheLockerRoom({ isOpen, onClose }) {
  const [streakData, setStreakData] = useState(() => ({
    streak: fanEconomy.loadState().dailyStreak,
    checkedIn: false
  }));
  const [activeLeague, setActiveLeague] = useState('premier_league');
  const [toastMsg, setToastMsg] = useState(null);

  if (!isOpen) return null;

  const handleDailyCheckIn = () => {
    const res = fanEconomy.checkInDaily();
    hapticEngine.rumbleGoal();
    soundEngine.playVictoryFanfare();

    if (res.alreadyCheckedIn) {
      setToastMsg(`⚡ Already checked in today! Current Streak: ${res.streak} Days.`);
    } else {
      setToastMsg(`🎉 Training Ground Check-In Complete! +${res.xpAwarded} Fan XP (Streak: ${res.streak} Days 🔥)`);
      setStreakData({ streak: res.streak, checkedIn: true });
    }
    setTimeout(() => setToastMsg(null), 4000);
  };

  const UPCOMING_FIXTURES = [
    { id: 'f1', home: 'Arsenal', away: 'Chelsea', league: 'Premier League', date: 'Sunday, 16:30 BST', countdown: '1d 18h 24m', venue: 'Emirates Stadium' },
    { id: 'f2', home: 'India', away: 'Australia', league: 'ICC Champions Trophy', date: 'Tuesday, 09:30 GMT', countdown: '3d 11h 45m', venue: 'MCG' },
    { id: 'f3', home: 'Real Madrid', away: 'Barcelona', league: 'La Liga (El Clásico)', date: 'Next Saturday', countdown: '7d 04h 10m', venue: 'Santiago Bernabéu' }
  ];

  const LEAGUE_STANDINGS = [
    { rank: 1, team: 'Arsenal', played: 28, points: 64, form: ['W', 'W', 'W', 'D', 'W'], color: '#ef4444' },
    { rank: 2, team: 'Manchester City', played: 28, points: 63, form: ['W', 'W', 'D', 'W', 'W'], color: '#38bdf8' },
    { rank: 3, team: 'Liverpool', played: 28, points: 61, form: ['W', 'L', 'W', 'W', 'D'], color: '#dc2626' },
    { rank: 4, team: 'Aston Villa', played: 28, points: 55, form: ['W', 'W', 'L', 'W', 'L'], color: '#9333ea' }
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>The Locker Room</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Off-Matchday Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Daily training ground derbies, schedules & league standings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-5">
          
          {/* DAILY TRAINING GROUND DERBY HERO CARD */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-black border border-amber-500/30 relative overflow-hidden shadow-xl">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">Daily Training Ground Check-In</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-mono font-black border border-amber-500/30">
                {streakData.streak} DAY STREAK 🔥
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white mt-2">
              Keep the Fan Energy Boiling Between Matchdays
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Check in once a day to cheer at your club's training ground. Boost your weekly club rank and earn up to +250 Fan XP every single day.
            </p>

            <button
              onClick={handleDailyCheckIn}
              className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{streakData.checkedIn ? 'Training Ground Roared Today!' : 'Roar the Training Ground (+100 XP)'}</span>
            </button>
          </div>

          {/* UPCOMING MARQUEE FIXTURES & COUNTDOWN */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stadium-turf" />
                <span>Upcoming Marquee Battles</span>
              </h4>
              <span className="text-[10px] text-slate-500">Live Countdown</span>
            </div>

            <div className="space-y-2">
              {UPCOMING_FIXTURES.map((fix) => (
                <div key={fix.id} className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-stadium-turf uppercase">{fix.league}</div>
                    <div className="text-sm font-black text-white">{fix.home} vs {fix.away}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{fix.venue} • {fix.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{fix.countdown}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 uppercase">Kickoff timer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEAGUE TABLE STANDINGS & FORM GUIDE */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Premier League Table Standings</span>
              </h4>
              <span className="text-[10px] text-slate-500">Matchday 28</span>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
              <div className="grid grid-cols-12 p-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5 bg-black/40">
                <span className="col-span-1">#</span>
                <span className="col-span-6">Club</span>
                <span className="col-span-2 text-center">PL</span>
                <span className="col-span-3 text-right">Points</span>
              </div>
              {LEAGUE_STANDINGS.map((row) => (
                <div key={row.rank} className="grid grid-cols-12 p-2.5 text-xs font-extrabold items-center border-b border-white/5 last:border-0 hover:bg-white/5">
                  <span className="col-span-1 font-mono text-slate-400">{row.rank}</span>
                  <div className="col-span-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="text-white truncate">{row.team}</span>
                  </div>
                  <span className="col-span-2 text-center font-mono text-slate-400">{row.played}</span>
                  <span className="col-span-3 text-right font-mono text-emerald-400 font-black">{row.points} pts</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40 text-center text-[11px] text-slate-400 font-medium">
          Daily active fans get priority access to Matchday Squad audio rooms
        </div>
      </div>
    </div>
  );
}
