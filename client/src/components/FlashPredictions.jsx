import React, { useState, useEffect } from 'react';
import { Zap, HelpCircle, Trophy, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';
import { hapticEngine } from '../services/hapticEngine';
import confetti from 'canvas-confetti';

const SPORT_QUESTIONS = {
  cricket: {
    question: 'Next Over Outcome:',
    options: [
      { id: 'boundary', label: 'Boundary (4/6) 💥', initialPct: 42 },
      { id: 'wicket', label: 'Wicket Fallen 🎯', initialPct: 26 },
      { id: 'dot', label: 'Tight Dot Balls ⚪', initialPct: 18 },
      { id: 'runs', label: 'Singles / Doubles 🏃', initialPct: 14 }
    ]
  },
  soccer: {
    question: 'Next 5 Minutes Prediction:',
    options: [
      { id: 'shot', label: 'Shot on Target 🎯', initialPct: 45 },
      { id: 'defense', label: 'Defense Hold 🛡️', initialPct: 30 },
      { id: 'corner', label: 'Corner Kick 🚩', initialPct: 18 },
      { id: 'goal', label: 'GOAL!! ⚽🔥', initialPct: 7 }
    ]
  },
  basketball: {
    question: 'Next Possession Call:',
    options: [
      { id: 'three', label: '3-Pointer Bang! 👌', initialPct: 38 },
      { id: 'paint', label: 'Paint Basket / Dunk 🔨', initialPct: 35 },
      { id: 'stop', label: 'Defensive Stop 🔒', initialPct: 20 },
      { id: 'foul', label: 'Shooting Foul 🛑', initialPct: 7 }
    ]
  },
  baseball: {
    question: 'Next At-Bat Result:',
    options: [
      { id: 'hit', label: 'Base Hit ⚾', initialPct: 40 },
      { id: 'strikeout', label: 'Strikeout 🎯', initialPct: 34 },
      { id: 'walk', label: 'Walk / HBP 🚶', initialPct: 16 },
      { id: 'homerun', label: 'Home Run! 🚀', initialPct: 10 }
    ]
  }
};

export default function FlashPredictions({ match, userLocation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [streak, setStreak] = useState(3);
  const [secondsRemaining, setSecondsRemaining] = useState(25);
  const [votes, setVotes] = useState({});

  const sportKey = match?.sport?.toLowerCase() || 'soccer';
  const currentPoll = SPORT_QUESTIONS[sportKey] || SPORT_QUESTIONS.soccer;

  // Countdown timer simulation for rapid round cycles
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Reset round
          setSelectedOption(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVote = (option) => {
    if (selectedOption) return;
    setSelectedOption(option.id);
    
    soundEngine.playTap(streak + 2);
    hapticEngine.rumbleComboBurst();

    setStreak((prev) => prev + 1);
    setVotes((prev) => ({
      ...prev,
      [option.id]: (prev[option.id] || option.initialPct) + 1
    }));

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.85 }
    });
  };

  return (
    <section className="bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2.5 relative overflow-hidden transition">
      
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="uppercase tracking-wider text-[11px] sm:text-xs">Flash Prediction (Zero-Stake)</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-extrabold text-[10px] border border-amber-200 dark:border-amber-900">
            🔥 {streak}x Intuition Streak
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-pitch-700 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>{secondsRemaining}s</span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between">
        <span>{currentPoll.question}</span>
        {selectedOption && (
          <span className="text-[11px] font-bold text-stadium-turf dark:text-stadium-neon flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Vote locked!
          </span>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {currentPoll.options.map((opt) => {
          const isChosen = selectedOption === opt.id;
          const displayPct = opt.initialPct + (selectedOption === opt.id ? 2 : 0);

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt)}
              disabled={!!selectedOption}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 active:scale-95 ${
                isChosen
                  ? 'bg-stadium-turf text-white border-stadium-turf shadow-md ring-2 ring-stadium-turf/30 scale-[1.02]'
                  : selectedOption
                  ? 'bg-slate-50 dark:bg-pitch-850 border-slate-200 dark:border-white/5 opacity-75'
                  : 'bg-slate-50 hover:bg-white dark:bg-pitch-700/60 dark:hover:bg-pitch-700 border-slate-200/80 dark:border-white/10 hover:border-slate-300 shadow-sm'
              }`}
            >
              <span className={`text-xs font-black truncate ${isChosen ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                {opt.label}
              </span>

              {/* Live Consensus Bar */}
              <div className="w-full mt-2 flex flex-col gap-1">
                <div className="h-1.5 w-full bg-slate-200 dark:bg-pitch-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isChosen ? 'bg-white' : 'bg-stadium-turf'}`}
                    style={{ width: `${displayPct}%` }}
                  />
                </div>
                <div className={`flex items-center justify-between text-[10px] font-mono font-bold ${isChosen ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span>{displayPct}% fans</span>
                  <span>{isChosen ? '✓ Picked' : ''}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

    </section>
  );
}
