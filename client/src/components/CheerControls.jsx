import { hapticEngine } from '../services/hapticEngine';
import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Zap, Send, MessageSquare } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';

const PREDEFINED_CHANTS = {
  soccer: [
    { text: 'GOOOAAALLL!! ⚽🔥', label: 'Goal!' },
    { text: 'DEFENSE! Hold the line! 🛡️', label: 'Defense' },
    { text: 'Come on boys, let’s win this! 🔴', label: 'Come On!' },
    { text: 'WHAT A SAVE!! 🧤🙌', label: 'Super Save' },
    { text: 'Referee is completely blind! 🟨👀', label: 'Ref Blind' },
    { text: 'PARK THE BUS!! 🚌🔒', label: 'Park Bus' },
    { text: 'WE BELIEVE!! 🏆✨', label: 'We Believe' },
    { text: 'Ole, Ole, Ole! 🎺🎉', label: 'Ole Ole' }
  ],
  basketball: [
    { text: 'FROM DOWNTOWN! BANG! 👌🎯', label: 'Downtown' },
    { text: 'DEFENSE! 👏👏 DEFENSE! 🛡️', label: 'Defense' },
    { text: 'AND ONE!! Count it!! 💪🏀', label: 'And-1' },
    { text: 'MONSTER SLAM!! 🔨🔥', label: 'Slam Dunk' },
    { text: 'CLUTCH GENE ACTIVATED! ⏰⚡', label: 'Clutch' },
    { text: 'MVP! MVP! MVP! 🌟', label: 'MVP' }
  ],
  football: [
    { text: 'TOUCHDOWN!! 🏈🎉', label: 'Touchdown' },
    { text: 'HUGE 1ST DOWN!! 🏃💨', label: '1st Down' },
    { text: 'SACK!! Get out of the pocket! 💥', label: 'Sack' },
    { text: 'PICK-SIX BABY!! 🚨🙌', label: 'Interception' },
    { text: 'LET’S GO D-FENCE!! 🛡️', label: 'D-Fence' }
  ],
  cricket: [
    { text: 'WHAT A MAXIMUM!! Out of the ground! 🏏🚀', label: 'Sixer' },
    { text: 'CLEAN BOWLED!! 🎯💥', label: 'Wicket' },
    { text: 'Super catch in the deep! 🧤', label: 'Catch' },
    { text: 'FOUR!! Cracking shot! ⚡', label: 'Boundary' },
    { text: 'Come on team, finish it!! 🏆', label: 'Finish It' },
    { text: 'Aussie Aussie Aussie! Oi Oi Oi! 🇦🇺', label: 'Aussie' }
  ],
  baseball: [
    { text: 'OUTTA HERE!! GRAND SLAM!! ⚾💥', label: 'Home Run' },
    { text: 'STRIKE THREE!! HE GONE! 🎯🔥', label: 'Strike 3' },
    { text: 'DOUBLE PLAY!! Beautiful fielding! ⚡🧤', label: 'Double Play' },
    { text: 'Let’s go!! Rally caps on! 🧢', label: 'Rally' },
    { text: 'Full count... deliver the heat! ⏱️', label: 'Full Count' },
    { text: 'Safe at home!! What a slide! 💨', label: 'Safe Slide' }
  ],
  hockey: [
    { text: 'WHAT A SLAPSHOT!! GOAL!! 🏒💥', label: 'Slapshot' },
    { text: 'TOP SHELF WHERE MAMA HIDES THE COOKIES! 🍪🎯', label: 'Top Shelf' },
    { text: 'HUGE GLOVE SAVE!! Brick wall! 🧱🧤', label: 'Big Save' },
    { text: 'POWER PLAY!! Light the lamp! ⚡💡', label: 'Power Play' },
    { text: 'Drop the gloves! Let’s get it! 🥊🔥', label: 'Enforcer' },
    { text: 'Empty netter to seal the win!! 🏆', label: 'Empty Net' }
  ],
  tennis: [
    { text: 'WHAT AN ACE DOWN THE TEE! 🎾⚡', label: 'Ace' },
    { text: 'UNBELIEVABLE PASSING SHOT! 🏃💨', label: 'Passing Shot' },
    { text: 'VAMOS!! Big break point saved! 🔥', label: 'Vamos!' },
    { text: 'CHAMPIONSHIP POINT!! 🏆✨', label: 'Championship Pt' },
    { text: 'Deuce! What an incredible rally! 👏', label: 'Deuce Rally' },
    { text: 'Drop shot beauty! Perfection! 🎯', label: 'Drop Shot' }
  ]
};

const EMOJI_BURSTS = ['🔥', '⚽', '🏀', '⚾', '🏏', '🏆', '👏', '📣', '⚡', '🎉'];

export default function CheerControls({
  match,
  selectedSide,
  onSelectSide,
  userLocation,
  onCheer
}) {
  const [comboStreak, setComboStreak] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [customChant, setCustomChant] = useState('');
  const comboTimerRef = useRef(null);

  const team = selectedSide === 'home' ? match.homeTeam : match.awayTeam;
  const teamColor = team.color || '#10B981';

  const resetComboTimer = () => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setComboStreak(0);
    }, 2500);
  };

  const handleShout = () => {
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(comboStreak >= 5 ? [30, 20, 30] : 20);
    }

    const nextStreak = comboStreak + 1;
    setComboStreak(nextStreak);
    resetComboTimer();

    hapticEngine.rumbleTap(nextStreak);
    soundEngine.playTap(nextStreak);
    soundEngine.swellCrowd(Math.min(nextStreak / 15, 1));
    if (nextStreak % 10 === 0) hapticEngine.rumbleGoal();
    if (nextStreak % 5 === 0) {
      soundEngine.playCrowdRoar();
    }
    if (nextStreak === 10 || nextStreak === 25) {
      soundEngine.playAirhorn();
      confetti({
        particleCount: 60,
        spread: 75,
        origin: { y: 0.85 },
        colors: [teamColor, '#ffffff', '#00ff88', '#00f2fe']
      });
    }

    onCheer({
      matchId: match.id,
      teamId: team.id,
      teamSide: selectedSide,
      teamName: team.name,
      teamColor,
      city: userLocation.name,
      country: userLocation.country,
      lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.02,
      cheerType: 'shout',
      count: nextStreak >= 5 ? 3 : 1
    });
  };

  const handleChantClick = (chantText) => {
    if (navigator.vibrate) navigator.vibrate(25);
    hapticEngine.rumbleComboBurst();
    soundEngine.playChantBeep();
    soundEngine.playCrowdRoar();

    onCheer({
      matchId: match.id,
      teamId: team.id,
      teamSide: selectedSide,
      teamName: team.name,
      teamColor,
      city: userLocation.name,
      country: userLocation.country,
      lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.02,
      cheerType: 'chant',
      message: chantText,
      count: 2
    });
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customChant.trim()) return;

    handleChantClick(customChant.trim());
    setCustomChant('');
  };

  const currentChants = PREDEFINED_CHANTS[match.sport] || PREDEFINED_CHANTS.soccer;

  return (
    <div className="bg-white dark:bg-pitch-800/95 border border-slate-200/80 dark:border-white/10 rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 shadow-bright-sm dark:shadow-2xl transition-colors duration-300 flex flex-col gap-3.5 sm:gap-4">
      
      {/* Team Switcher Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-white/10">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-stadium-turf dark:text-stadium-neon animate-bounce-subtle" />
            Cheer Command Deck
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Shouting for <strong style={{ color: teamColor }}>{team.name}</strong> from {userLocation.name}
          </p>
        </div>

        {/* Home / Away Toggle Bar */}
        <div className="flex items-center bg-slate-100 dark:bg-pitch-900 p-1 rounded-2xl border border-slate-200 dark:border-white/10 w-full sm:w-auto">
          <button
            onClick={() => onSelectSide('home')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95 ${
              selectedSide === 'home'
                ? 'bg-white text-slate-900 dark:bg-white dark:text-slate-900 shadow-bright-sm dark:shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <img src={match.homeTeam.logo} alt="" className="w-4 h-4 object-contain" />
            <span>{match.homeTeam.shortName}</span>
          </button>

          <button
            onClick={() => onSelectSide('away')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95 ${
              selectedSide === 'away'
                ? 'bg-white text-slate-900 dark:bg-white dark:text-slate-900 shadow-bright-sm dark:shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <img src={match.awayTeam.logo} alt="" className="w-4 h-4 object-contain" />
            <span>{match.awayTeam.shortName}</span>
          </button>
        </div>
      </div>

      {/* Cheering Arena Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-center">
        
        {/* Left: The Mega Tactile Shout Button */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 dark:bg-pitch-900/60 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-white/5 relative overflow-hidden">
          
          {/* Combo Multiplier Badge */}
          <div className="h-7 mb-2 flex items-center justify-center">
            {comboStreak > 1 ? (
              <span className="px-3.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-stadium-flame via-stadium-sun to-stadium-turf text-white uppercase tracking-wider animate-pulse shadow-md">
                🔥 {comboStreak}x Combo Streak!
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                Tap rapidly for crowd roar
              </span>
            )}
          </div>

          {/* The Big Button (Thumb target 140px - 160px) */}
          <button
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onTouchStart={() => setIsPressing(true)}
            onTouchEnd={() => setIsPressing(false)}
            onClick={handleShout}
            className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-100 select-none shadow-2xl relative group ${
              isPressing ? 'scale-90' : 'hover:scale-105 active:scale-90'
            }`}
            style={{
              backgroundColor: teamColor,
              boxShadow: `0 8px 30px ${teamColor}88, inset 0 -8px 12px rgba(0,0,0,0.3)`
            }}
          >
            <span 
              className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping opacity-30 pointer-events-none"
              style={{ animationDuration: `${Math.max(1.6 - comboStreak * 0.1, 0.5)}s` }}
            />

            <Volume2 className="w-10 h-10 text-white drop-shadow-md mb-1" />
            <span className="font-black text-2xl text-white tracking-widest uppercase drop-shadow-md">
              SHOUT!
            </span>
            <span className="text-[10px] text-white/95 font-extrabold uppercase tracking-wider">
              {team.shortName} Power
            </span>
          </button>

          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-3 text-center font-medium">
            Pulses animated energy rings across the world map
          </span>
        </div>

        {/* Right: Predefined Sports Chants */}
        <div className="md:col-span-7 flex flex-col gap-3">
          
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-bold">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200">
                <MessageSquare className="w-3.5 h-3.5 text-stadium-sky" />
                Predefined Sports Chants
              </span>
              <span className="text-[10px] text-slate-400">1-Tap to shout</span>
            </div>

            {/* Large 48px+ Mobile Chant Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {currentChants.map((chant, i) => (
                <button
                  key={i}
                  onClick={() => handleChantClick(chant.text)}
                  className="min-h-[46px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-pitch-700/80 dark:hover:bg-pitch-600 text-left text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/5 transition flex items-center justify-between active:scale-95 shadow-sm"
                >
                  <span className="truncate pr-1">{chant.label}</span>
                  <span className="text-base flex-shrink-0">
                    {chant.text.slice(-2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Emoji Reaction Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {EMOJI_BURSTS.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => handleChantClick(`${emoji} ${team.shortName}!! ${emoji}`)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-pitch-700/60 dark:hover:bg-pitch-600 border border-slate-200/60 dark:border-white/5 flex items-center justify-center text-lg active:scale-90 transition-transform shadow-sm flex-shrink-0"
                title={`Send ${emoji} cheer`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Custom Chant Input Box */}
          <form onSubmit={handleSendCustom} className="flex gap-2">
            <input
              type="text"
              value={customChant}
              onChange={(e) => setCustomChant(e.target.value)}
              placeholder={`Write a custom chant for ${team.shortName}...`}
              maxLength={60}
              className="flex-1 min-h-[44px] bg-slate-100 dark:bg-pitch-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-stadium-turf dark:focus:border-stadium-neon transition"
            />
            <button
              type="submit"
              disabled={!customChant.trim()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs disabled:opacity-40 hover:bg-stadium-turf dark:hover:bg-stadium-neon transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
