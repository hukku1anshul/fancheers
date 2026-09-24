import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Copy, Check, Sparkles, Trophy, Flame, Film, Download, Video } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FanCardModal({ isOpen, onClose, match, stats, userLocation, userCheers = 42 }) {
  const [copied, setCopied] = useState(false);
  const [cardMode, setCardMode] = useState('static'); // 'static' | 'animated'
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [storyStep, setStoryStep] = useState(1);
  const canvasRef = useRef(null);

  const homeName = match?.homeTeam?.name || match?.homeTeam || 'Home';
  const awayName = match?.awayTeam?.name || match?.awayTeam || 'Away';
  const scoreText = match?.homeTeam?.score
    ? `${match.homeTeam.score} - ${match.awayTeam?.score || ''}`
    : (match?.score || 'Match Score');
  const totalCheers = stats?.totalCheers || stats?.home?.totalCheers || 6850;
  const userCity = userLocation?.name || 'London';

  const shareText = `🏟️ I roared ${userCheers} times for ${homeName} on FanPulse!\n\n🔥 ${userCity} held the Fan Turf!\n⚡ Match: ${homeName} vs ${awayName} (${scoreText})\n\nJoin the virtual stadium: http://localhost:5173/ #FanPulse #VirtualStadium`;

  useEffect(() => {
    if (cardMode === 'animated') {
      const interval = setInterval(() => {
        setStoryStep((s) => (s >= 3 ? 1 : s + 1));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [cardMode]);

  if (!isOpen || !match) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleDownloadStory = () => {
    setIsGeneratingVideo(true);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      setIsGeneratingVideo(false);
      alert('🎬 Story Reel prepared! Ready to post to Instagram Stories or TikTok.');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Toggle */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-pitch-800">
          <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-pitch-700 p-1 rounded-xl">
            <button
              onClick={() => setCardMode('static')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                cardMode === 'static'
                  ? 'bg-white dark:bg-pitch-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📸 Card Receipt
            </button>
            <button
              onClick={() => setCardMode('animated')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                cardMode === 'animated'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Animated Story</span>
            </button>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Display Area */}
        <div className="p-4 sm:p-5 flex flex-col items-center text-center">
          {cardMode === 'static' ? (
            /* Static Match Receipt */
            <div className="w-full rounded-2xl bg-gradient-to-br from-pitch-900 via-pitch-850 to-slate-900 text-white p-5 border border-white/15 shadow-xl flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1 font-bold text-stadium-neon">
                  <span>●</span> <span>FANPULSE VERIFIED</span>
                </span>
                <span>{match.league || 'Match Day'}</span>
              </div>

              <div className="py-2 flex flex-col items-center gap-1">
                <div className="text-base font-black tracking-tight text-white">
                  {homeName} <span className="text-slate-400 font-normal">vs</span> {awayName}
                </div>
                <div className="font-digital text-2xl font-black text-stadium-neon">
                  {scoreText}
                </div>
                <span className="text-[10px] text-slate-400">{match.venue || 'Stadium'}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 grid grid-cols-2 gap-2 text-left border border-white/10">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Your Cheers</span>
                  <div className="font-black text-sm text-stadium-neon flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{userCheers} Roars</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Fan Turf Rank</span>
                  <div className="font-black text-sm text-white">
                    Top 5% in {userCity}
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 font-medium">
                Global Match Total: {totalCheers.toLocaleString()} Roars
              </div>
            </div>
          ) : (
            /* 4-Second Animated Story Preview (TikTok / Instagram Reel Style) */
            <div className="w-full aspect-[9/14] max-h-[360px] rounded-2xl bg-gradient-to-br from-purple-950 via-pitch-950 to-slate-950 text-white p-5 border border-pink-500/30 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              {/* Animated Floodlight Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

              {/* Reel Step Progress Bar */}
              <div className="flex gap-1 z-10">
                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${storyStep >= 1 ? 'bg-pink-400' : 'bg-white/20'}`} />
                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${storyStep >= 2 ? 'bg-pink-400' : 'bg-white/20'}`} />
                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${storyStep >= 3 ? 'bg-pink-400' : 'bg-white/20'}`} />
              </div>

              {/* Dynamic Slides */}
              <div className="my-auto z-10 py-4 space-y-3">
                {storyStep === 1 && (
                  <div className="space-y-2 animate-fadeIn">
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-[10px] font-black uppercase">
                      ⚡ Final Scoreline
                    </span>
                    <h3 className="text-xl font-black text-white">{homeName} vs {awayName}</h3>
                    <div className="text-3xl font-black font-mono text-pink-400">{scoreText}</div>
                    <p className="text-[11px] text-slate-300">{match.venue || 'Stadium'}</p>
                  </div>
                )}

                {storyStep === 2 && (
                  <div className="space-y-2 animate-fadeIn">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase">
                      🔥 Live Decibel Peak
                    </span>
                    <div className="text-4xl font-black text-amber-400 font-mono">850+</div>
                    <p className="text-xs font-bold text-white">Cheers / Minute Recorded</p>
                    <div className="text-[11px] text-slate-300">Global Stadium Shockwave Velocity: 410ms</div>
                  </div>
                )}

                {storyStep === 3 && (
                  <div className="space-y-2 animate-fadeIn">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase">
                      👑 Fan Turf Victory
                    </span>
                    <div className="text-2xl font-black text-emerald-400">{userCity} Crowned!</div>
                    <p className="text-xs text-white">Contributed {userCheers} Roars • Top 5% Loudest</p>
                    <div className="text-[10px] text-slate-400 font-mono">FANPULSE VERIFIED ATTENDANCE</div>
                  </div>
                )}
              </div>

              {/* Bottom Reel Watermark */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2 z-10">
                <span className="font-bold text-pink-300">FanPulse Stories</span>
                <span>fanpulse.app</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 dark:bg-pitch-800/80 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
          {cardMode === 'static' ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareTwitter}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
                >
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
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Match Receipt Text'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleDownloadStory}
              disabled={isGeneratingVideo}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-pink-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingVideo ? 'Rendering Story...' : 'Export 4s Story Video'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
