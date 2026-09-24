import React, { useState, useEffect } from 'react';
import { Music, Flame, Sparkles, Volume2, Users } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';
import { hapticEngine } from '../services/hapticEngine';

const CHANT_BANKS = {
  cricket: [
    { id: 'sachin', label: 'Sachin... Sachin! 👏', lyrics: 'SA-CHIN! SA-CHIN! 👏 👏 👏', bpm: 90 },
    { id: 'india', label: 'India... India! 🇮🇳', lyrics: 'JEETEGA BHAI JEETEGA! 🇮🇳', bpm: 100 },
    { id: 'six', label: 'Hit It for Six! 💥', lyrics: 'SIXER! SIXER! OUT OF THE PARK!', bpm: 110 }
  ],
  soccer: [
    { id: 'allez', label: 'Allez, Allez, Allez! 🔴', lyrics: 'ALLEZ, ALLEZ, ALLEZ! 🔴', bpm: 112 },
    { id: 'ole', label: 'Olé, Olé, Olé! ⚽', lyrics: 'OLÉ, OLÉ, OLÉ! CAMPEONES!', bpm: 120 },
    { id: 'saints', label: 'When the Saints! 🎺', lyrics: 'OH WHEN THE SAINTS GO MARCHING IN!', bpm: 96 }
  ],
  general: [
    { id: 'defense', label: 'DEFENSE! 👏 👏', lyrics: 'DE-FENSE! 👏 👏 DE-FENSE!', bpm: 85 },
    { id: 'letsgo', label: "LET'S GO TEAM! ⚡", lyrics: "LET'S GO TEAM! ⚡ MAKE SOME NOISE!", bpm: 105 }
  ]
};

export default function ChantChoir({ match, onCheer }) {
  const sport = (match?.sport || 'cricket').toLowerCase();
  const chants = CHANT_BANKS[sport] || CHANT_BANKS.cricket;
  const [activeChantIndex, setActiveChantIndex] = useState(0);
  const [tapRhythmCount, setTapRhythmCount] = useState(0);
  const [crowdConsensus, setCrowdConsensus] = useState(38);
  const [isChoirSinging, setIsChoirSinging] = useState(false);

  const currentChant = chants[activeChantIndex] || chants[0];

  const handleTapBeat = () => {
    const nextCount = tapRhythmCount + 1;
    setTapRhythmCount(nextCount);

    hapticEngine.triggerClap();
    soundEngine.playClap();

    // Increase consensus with each tap
    const nextConsensus = Math.min(100, crowdConsensus + 12);
    setCrowdConsensus(nextConsensus);

    if (nextConsensus >= 75 && !isChoirSinging) {
      setIsChoirSinging(true);
      soundEngine.playChoirChant(currentChant.id);
      hapticEngine.triggerMilestoneCombo();

      if (onCheer) {
        onCheer({
          matchId: match?.id,
          cheerType: 'chant',
          message: currentChant.lyrics,
          count: 5
        });
      }

      setTimeout(() => {
        setIsChoirSinging(false);
        setCrowdConsensus(35);
        setTapRhythmCount(0);
      }, 3500);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/80 via-pitch-900 to-indigo-950/80 rounded-2xl p-3 sm:p-3.5 border border-purple-500/30 shadow-lg text-white relative overflow-hidden">
      {/* Dynamic Choir Singing Flare */}
      {isChoirSinging && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-xs animate-pulse pointer-events-none" />
      )}

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-black uppercase tracking-wider">
            <Music className="w-3 h-3 text-purple-400 animate-bounce" />
            <span>Chant Choir Engine</span>
          </div>
          <span className="text-[11px] font-bold text-slate-300 hidden sm:inline">
            Tap on beat to harmonize 40,000 voices
          </span>
        </div>

        {/* Chant Switchers */}
        <div className="flex items-center gap-1">
          {chants.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveChantIndex(i);
                setCrowdConsensus(35);
                setTapRhythmCount(0);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                activeChantIndex === i
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              {c.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conductor Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Big Beat Button */}
          <button
            onClick={handleTapBeat}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 select-none flex-1 sm:flex-initial ${
              isChoirSinging
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105 ring-4 ring-purple-400/40 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            <span className="text-base">{isChoirSinging ? '🎵' : '👏'}</span>
            <span>{isChoirSinging ? 'Choir In Unison!' : 'Tap on Beat'}</span>
          </button>

          <div className="min-w-0 flex-1 sm:flex-initial">
            <div className="font-extrabold text-xs text-purple-200 truncate">
              "{currentChant.lyrics}"
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3 text-purple-400" />
              <span>{Math.floor(crowdConsensus * 45)} fans chanting together</span>
            </div>
          </div>
        </div>

        {/* Consensus Meter Bar */}
        <div className="w-full sm:w-44 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
            <span className="text-slate-400">Crowd Consensus</span>
            <span className={crowdConsensus >= 75 ? 'text-pink-400 font-black' : 'text-purple-300'}>
              {crowdConsensus}%
            </span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                crowdConsensus >= 75
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-purple-500'
              }`}
              style={{ width: `${crowdConsensus}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
