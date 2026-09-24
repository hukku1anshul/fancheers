import React, { useState } from 'react';
import { X, Share2, Copy, Check, Trophy, Flame, Zap, Clock, BarChart3, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatchdayReport({ isOpen, onClose, match, sessionStats, userLocation }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !match) return null;

  const homeName = match?.homeTeam?.name || match?.homeTeam || 'Home';
  const awayName = match?.awayTeam?.name || match?.awayTeam || 'Away';
  const scoreText = match?.homeTeam?.score
    ? `${match.homeTeam.score} - ${match.awayTeam?.score || ''}`
    : (match?.score || 'Match Score');
  const userCity = userLocation?.name || 'London';

  // Session stats with defaults
  const cheers = sessionStats?.totalCheers || 0;
  const maxCombo = sessionStats?.maxCombo || 0;
  const xpEarned = sessionStats?.xpEarned || 0;
  const reactionsCount = sessionStats?.reactions || 0;
  const chatMessages = sessionStats?.chatMessages || 0;
  const minutesActive = sessionStats?.minutesActive || 0;
  const predictionsCorrect = sessionStats?.predictionsCorrect || 0;
  const ratingsGiven = sessionStats?.ratingsGiven || 0;

  // Calculate percentile (simulated — in production this would come from server)
  const getPercentile = () => {
    if (cheers >= 200) return 1;
    if (cheers >= 100) return 3;
    if (cheers >= 50) return 5;
    if (cheers >= 25) return 10;
    if (cheers >= 10) return 20;
    if (cheers >= 5) return 35;
    return 50;
  };
  const percentile = getPercentile();

  // Performance rating
  const getPerformanceRating = () => {
    const score = cheers * 2 + maxCombo * 5 + reactionsCount * 3 + chatMessages * 4;
    if (score >= 500) return { label: 'STADIUM LEGEND', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '👑' };
    if (score >= 200) return { label: 'ULTRAS TIER', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '🔥' };
    if (score >= 100) return { label: 'DIE-HARD', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '⚡' };
    if (score >= 30) return { label: 'DEDICATED FAN', color: 'text-sky-400', bg: 'bg-sky-500/20', icon: '💪' };
    return { label: 'CASUAL VIEWER', color: 'text-slate-400', bg: 'bg-slate-500/20', icon: '👀' };
  };
  const rating = getPerformanceRating();

  const shareText = `🏟️ MATCHDAY REPORT\n\n${homeName} vs ${awayName} (${scoreText})\n\n${rating.icon} ${rating.label}\n🔥 ${cheers} Cheers Sent\n⚡ ${maxCombo}x Max Combo\n📊 Top ${percentile}% Most Active Fan\n📍 ${userCity}\n\nJoin the virtual stadium 👉 fanpulse.app #FanPulse`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-lg animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 via-pitch-900 to-slate-900">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-stadium-neon" />
            <span className="font-black text-white text-sm tracking-tight">MATCHDAY REPORT</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Card */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Match Summary */}
          <div className="text-center py-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {match.league || 'Match Day'} • Full Time
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {homeName} <span className="text-slate-400 font-normal">vs</span> {awayName}
            </div>
            <div className="font-digital text-2xl font-black text-stadium-turf dark:text-stadium-neon mt-0.5">
              {scoreText}
            </div>
          </div>

          {/* Performance Rating Badge */}
          <div className={`flex items-center justify-center gap-2 py-3 rounded-2xl ${rating.bg} border border-white/10`}>
            <span className="text-2xl">{rating.icon}</span>
            <div className="text-center">
              <div className={`text-sm font-black ${rating.color} tracking-wider`}>{rating.label}</div>
              <div className="text-[10px] text-slate-400 font-medium">Top {percentile}% Most Active Fan</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 dark:bg-pitch-800 rounded-xl p-3 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400 mb-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Total Cheers</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{cheers}</div>
            </div>

            <div className="bg-slate-50 dark:bg-pitch-800 rounded-xl p-3 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400 mb-1">
                <Zap className="w-3 h-3 text-purple-500" />
                <span>Max Combo</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{maxCombo}x</div>
            </div>

            <div className="bg-slate-50 dark:bg-pitch-800 rounded-xl p-3 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400 mb-1">
                <Trophy className="w-3 h-3 text-stadium-turf" />
                <span>XP Earned</span>
              </div>
              <div className="text-xl font-black text-stadium-turf dark:text-stadium-neon">+{xpEarned}</div>
            </div>

            <div className="bg-slate-50 dark:bg-pitch-800 rounded-xl p-3 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400 mb-1">
                <Clock className="w-3 h-3 text-sky-500" />
                <span>Time Active</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{minutesActive}m</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-slate-50 dark:bg-pitch-800 rounded-xl p-3 border border-slate-200/80 dark:border-white/10 space-y-1.5">
            <div className="text-[9px] uppercase font-bold text-slate-400 mb-2">Activity Breakdown</div>
            {[
              { label: 'Stadium Wall Messages', value: chatMessages, icon: '💬' },
              { label: 'Silent Reactions', value: reactionsCount, icon: '🤫' },
              { label: 'Player Ratings Given', value: ratingsGiven, icon: '⭐' },
              { label: 'Predictions Correct', value: predictionsCorrect, icon: '🎯' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Location Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Target className="w-3 h-3" />
            <span>Cheered from <strong className="text-slate-900 dark:text-white">{userCity}</strong></span>
          </div>
        </div>

        {/* Share Actions */}
        <div className="p-4 bg-slate-50 dark:bg-pitch-800/80 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareTwitter}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to 𝕏</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
            >
              <span>WhatsApp</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-2 px-3 rounded-xl bg-slate-200/80 dark:bg-pitch-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-stadium-turf" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Report Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
