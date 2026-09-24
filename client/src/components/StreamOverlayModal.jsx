import React, { useState } from 'react';
import { X, Copy, Check, Tv, ExternalLink, Monitor, Sparkles, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StreamOverlayModal({ isOpen, onClose, activeMatch }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const matchId = activeMatch?.id || 'live';
  const overlayUrl = `${window.location.origin}/?mode=overlay&match=${matchId}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenPreview = () => {
    window.open(overlayUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-300 animate-pulse" />
            <div>
              <span className="font-black text-sm tracking-tight">CREATOR STREAM OVERLAY</span>
              <p className="text-[10px] text-purple-200/90 font-medium">OBS & Streamlabs Browser Source Widget</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-purple-200 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Pitch Banner */}
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0" />
            <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
              Streaming a watchalong on <strong>Twitch, YouTube, or Kick</strong>? Add the live FanPulse decibel meter to your stream. Viewers can cheer from their phones to push your stream's decibel meter up live!
            </p>
          </div>

          {/* Browser Source URL Box */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              OBS Browser Source URL (100% Transparent Background)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={overlayUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-pitch-800 border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-800 dark:text-slate-200 select-all outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 space-y-2">
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🛠️ 3-Step Setup in OBS Studio</span>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed font-medium">
              <li>In OBS Studio, click <strong>+ Add Source ➜ Browser</strong>.</li>
              <li>Paste the URL copied above into the <strong>URL field</strong>.</li>
              <li>Set <strong>Width: 1920</strong> and <strong>Height: 1080</strong> (or 1280x720).</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPreview}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-pitch-800 hover:bg-slate-200 dark:hover:bg-pitch-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-200 dark:border-white/10"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Overlay in Tab</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy OBS Source Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
