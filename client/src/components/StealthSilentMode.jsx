import React, { useState } from 'react';
import { VolumeX, Zap, Sparkles, Send } from 'lucide-react';
import { hapticEngine } from '../services/hapticEngine';
import { nativeBridge } from '../services/nativeBridgeService';

export default function StealthSilentMode({ isSilent, onToggleSilent, onSendSilentReaction }) {
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const SILENT_REACTIONS = [
    { emoji: '🔥', label: 'LIT', color: '#f97316' },
    { emoji: '🤯', label: 'INSANE', color: '#8b5cf6' },
    { emoji: '🤬', label: 'REF BLIND', color: '#ef4444' },
    { emoji: '🎯', label: 'CLASS', color: '#10b981' },
    { emoji: '⚡', label: 'ELECTRIC', color: '#eab308' }
  ];

  const handleTrigger = (item) => {
    // 1. Silent tactile pulse
    hapticEngine.rumbleTap(2);
    nativeBridge.triggerScreenFlash('medium');

    // 2. Spawn kinetic floating visual shockwave emoji
    const id = Date.now() + Math.random();
    const xPos = Math.floor(20 + Math.random() * 60); // 20% to 80% screen width
    const newEmoji = { id, emoji: item.emoji, label: item.label, xPos };

    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2400);

    if (onSendSilentReaction) {
      onSendSilentReaction(item);
    }
  };

  return (
    <>
      {/* Floating Kinetic Screen Shockwave Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[99990] overflow-hidden">
        {floatingEmojis.map(item => (
          <div
            key={item.id}
            className="absolute bottom-16 animate-floatUp flex flex-col items-center pointer-events-none select-none transition-all"
            style={{ left: `${item.xPos}%` }}
          >
            <span className="text-4xl sm:text-5xl filter drop-shadow-xl animate-bounce">
              {item.emoji}
            </span>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-black/75 text-white font-mono font-black text-[10px] tracking-wider border border-white/20 shadow-md">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Persistent Stealth Quick-Reaction Bar (Visible when Silent Mode is Active) */}
      {isSilent && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9000] max-w-sm w-[92%] sm:w-auto bg-slate-900/90 border border-emerald-500/40 rounded-full py-1.5 px-3 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 pl-1 text-[10px] font-black uppercase text-emerald-400">
            <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Stealth Reaction:</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {SILENT_REACTIONS.map(item => (
              <button
                key={item.label}
                onClick={() => handleTrigger(item)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 active:scale-90 transition flex items-center gap-1"
                title={`Send ${item.label} reaction`}
              >
                <span className="text-base sm:text-lg">{item.emoji}</span>
                <span className="hidden sm:inline text-[9px] font-extrabold text-slate-200 uppercase">{item.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onToggleSilent}
            className="text-[10px] font-black text-slate-400 hover:text-white px-2 py-1 rounded-full hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
