import React, { useState, useEffect } from 'react';
import { Smartphone, Flame, Volume2, Radio, CheckCircle, Wifi, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { getSocket } from '../services/socket';
import { hapticEngine } from '../services/hapticEngine';
import { soundEffects } from '../services/soundEffects';

export default function MobileRemoteView({ initialPairCode, onExitRemote }) {
  const [pairCode, setPairCode] = useState(initialPairCode || '');
  const [isPaired, setIsPaired] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (initialPairCode) {
      setIsPaired(true);
      if (socket && socket.connected) {
        socket.emit('remote:pair', { pairCode: initialPairCode });
      }
    }

    socket.on('remote:paired', (data) => {
      setIsPaired(true);
      setErrorMsg('');
      hapticEngine.triggerGoalRumble();
      soundEffects.playClap();
    });

    socket.on('remote:error', (err) => {
      setErrorMsg(err.message || 'Pairing failed. Check TV code.');
    });

    return () => {
      socket.off('remote:paired');
      socket.off('remote:error');
    };
  }, [initialPairCode]);

  const handlePairSubmit = (e) => {
    e?.preventDefault();
    if (!pairCode.trim()) return;
    setIsPaired(true);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('remote:pair', { pairCode: pairCode.trim().toUpperCase() });
    }
  };

  const sendRemoteAction = (actionType, extra = {}) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('remote:action', { type: actionType, ...extra });
    }
    setTapCount(c => c + 1);

    // Haptic and local audio feedback
    if (actionType === 'ROAR') {
      hapticEngine.triggerGoalRumble();
      soundEffects.playRoarSwell();
    } else if (actionType === 'CLAP') {
      hapticEngine.triggerClap();
      soundEffects.playClap();
    } else if (actionType === 'SUPER_BURST') {
      hapticEngine.triggerMilestoneCombo();
      soundEffects.playAirhorn();
    } else {
      hapticEngine.triggerTap();
    }
  };

  return (
    <div className="min-h-screen bg-pitch-950 text-white flex flex-col justify-between p-4 select-none">
      {/* Remote Header */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Tactile TV Controller
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              {isPaired ? (
                <>
                  <Wifi className="w-3 h-3 animate-pulse" />
                  <span>Linked to TV ({pairCode})</span>
                </>
              ) : (
                <span className="text-amber-400">Waiting for TV pairing...</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onExitRemote}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-extrabold transition active:scale-95 flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Exit</span>
        </button>
      </div>

      {/* Pairing Screen if not paired */}
      {!isPaired ? (
        <div className="my-auto max-w-sm mx-auto w-full p-6 rounded-3xl bg-pitch-900 border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl border border-emerald-500/30">
            📺
          </div>
          <div>
            <h3 className="text-base font-black text-white">Enter 4-Digit TV Code</h3>
            <p className="text-xs text-slate-400 mt-1">
              Look at your TV screen or monitor in Living Room Mode to find the pair code.
            </p>
          </div>

          <form onSubmit={handlePairSubmit} className="space-y-3">
            <input
              type="text"
              maxLength={6}
              value={pairCode}
              onChange={(e) => setPairCode(e.target.value.toUpperCase())}
              placeholder="e.g. 8402"
              className="w-full text-center text-2xl font-mono font-black py-3 rounded-2xl bg-pitch-800 border border-white/20 text-amber-300 tracking-widest uppercase focus:outline-none focus:border-emerald-400"
            />
            {errorMsg && (
              <div className="text-xs text-rose-400 font-bold">{errorMsg}</div>
            )}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-stadium-turf text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-stadium-turf/25 active:scale-95 transition"
            >
              Connect to TV
            </button>
          </form>
        </div>
      ) : (
        /* Controller Pad View */
        <div className="my-auto flex flex-col items-center justify-center space-y-6 w-full max-w-sm mx-auto">
          {/* Status Chip */}
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              Taps Sent to Big Screen
            </span>
            <span className="text-2xl font-mono font-black text-emerald-400">
              {tapCount}
            </span>
          </div>

          {/* Giant ROAR Button */}
          <button
            onClick={() => sendRemoteAction('ROAR')}
            className="w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-600 via-stadium-turf to-teal-400 text-slate-950 font-black text-xl uppercase tracking-wider shadow-2xl shadow-emerald-500/40 active:scale-90 transition-transform flex flex-col items-center justify-center ring-8 ring-emerald-500/20"
          >
            <Flame className="w-12 h-12 text-slate-950 mb-1" />
            <span>ROAR TV</span>
            <span className="text-[10px] font-extrabold text-slate-900/70 tracking-widest mt-0.5">
              HAPTIC STRIKE
            </span>
          </button>

          {/* Secondary Tactile Controller Actions */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => sendRemoteAction('CLAP')}
              className="py-4 rounded-2xl bg-pitch-800 hover:bg-pitch-750 border border-white/10 active:scale-95 transition text-center shadow-lg"
            >
              <span className="text-2xl block mb-1">👏</span>
              <span className="text-xs font-black uppercase text-white tracking-wider">
                Stadium Clap
              </span>
            </button>

            <button
              onClick={() => sendRemoteAction('SUPER_BURST')}
              className="py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 border border-amber-400/30 active:scale-95 transition text-center shadow-lg text-white"
            >
              <span className="text-2xl block mb-1">💥</span>
              <span className="text-xs font-black uppercase tracking-wider">
                Super Flare
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Controller Footer */}
      <div className="p-3 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        FanPulse Haptic Engine v2.0 • Ultra-Low Latency Direct Socket Link
      </div>
    </div>
  );
}
