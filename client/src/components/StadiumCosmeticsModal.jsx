import React, { useState } from 'react';
import { Sparkles, Zap, Check, Lock, X, Flame, Radio, Award } from 'lucide-react';
import { fanEconomy, AVAILABLE_COSMETICS } from '../services/fanEconomyService';
import { hapticEngine } from '../services/hapticEngine';
import { soundEngine } from '../services/soundEffects';

export default function StadiumCosmeticsModal({ isOpen, onClose }) {
  const [tierInfo, setTierInfo] = useState(() => fanEconomy.getTier());
  const [equipped, setEquipped] = useState(() => fanEconomy.getEquippedCosmetics());
  const [activeTab, setActiveTab] = useState('flares'); // 'flares' | 'callsigns'
  const [toastMsg, setToastMsg] = useState(null);

  if (!isOpen) return null;

  const handleEquip = (type, item) => {
    if (item.minLevel > tierInfo.currentTier.level) {
      hapticEngine.rumbleTap(1);
      setToastMsg(`🔒 Requires ${item.minLevel > 5 ? 'Ultra' : 'Veteran'} Level ${item.minLevel}. Earn more XP by cheering!`);
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    fanEconomy.equipCosmetic(type, item.id);
    setEquipped(fanEconomy.getEquippedCosmetics());
    hapticEngine.triggerMilestoneCombo();
    soundEngine.playVictoryFanfare();

    setToastMsg(`✨ Equipped ${item.name}! Your stadium flares now burst in custom style.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Fan XP & Stadium Cosmetics</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Unlock custom flares & walkie radio call-signs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Fan Tier Progress Bar */}
        <div className="p-4 bg-purple-950/30 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tierInfo.currentTier.badge}</span>
              <div>
                <div className="text-xs text-purple-300 font-extrabold uppercase tracking-wider">
                  Level {tierInfo.currentTier.level} • {tierInfo.currentTier.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {fanEconomy.getXP().toLocaleString()} Fan XP Earned
                </div>
              </div>
            </div>
            {tierInfo.nextTier && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Next Tier</div>
                <div className="text-xs font-black text-white">{tierInfo.nextTier.name}</div>
              </div>
            )}
          </div>

          {/* XP Progress Bar */}
          <div className="mt-3 w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-stadium-turf transition-all duration-500 rounded-full"
              style={{ width: `${tierInfo.progressToNext}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>{tierInfo.progressToNext}% to Next Rank</span>
            <span>{tierInfo.nextTier ? `${tierInfo.nextTier.minXP} XP Target` : 'MAX RANK'}</span>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex border-b border-white/10 bg-black/30 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('flares')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'flares' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Custom Flares</span>
          </button>
          <button
            onClick={() => setActiveTab('callsigns')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'callsigns' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Walkie Call-Signs</span>
          </button>
        </div>

        {/* Cosmetics List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'flares' ? (
            AVAILABLE_COSMETICS.flares.map((flare) => {
              const isUnlocked = tierInfo.currentTier.level >= flare.minLevel;
              const isEquipped = equipped.flare.id === flare.id;

              return (
                <div
                  key={flare.id}
                  onClick={() => handleEquip('flare', flare)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
                    isEquipped
                      ? 'bg-purple-500/20 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                      : isUnlocked
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-black/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-black/40 border border-white/10">
                      {flare.icon}
                    </span>
                    <div>
                      <div className="font-extrabold text-xs text-white flex items-center gap-2">
                        <span>{flare.name}</span>
                        {isEquipped && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500 text-white font-black">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {isUnlocked ? 'Unlocked & Ready to burst' : `Unlocks at Level ${flare.minLevel}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <span className="p-1.5 rounded-full bg-purple-500/20 text-purple-300">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-full bg-white/5 text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            AVAILABLE_COSMETICS.callsigns.map((cs) => {
              const isUnlocked = tierInfo.currentTier.level >= cs.minLevel;
              const isEquipped = equipped.callsign.id === cs.id;

              return (
                <div
                  key={cs.id}
                  onClick={() => handleEquip('callsign', cs)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition active:scale-[0.99] ${
                    isEquipped
                      ? 'bg-purple-500/20 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                      : isUnlocked
                      ? 'bg-white/5 hover:bg-white/10 border-white/10'
                      : 'bg-black/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-black/40 border border-white/10">
                      {cs.icon}
                    </span>
                    <div>
                      <div className="font-extrabold text-xs text-white flex items-center gap-2">
                        <span>{cs.name}</span>
                        {isEquipped && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500 text-white font-black">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {isUnlocked ? 'Broadcasted in Squad Audio chirps' : `Unlocks at Level ${cs.minLevel}`}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <span className="p-1.5 rounded-full bg-purple-500/20 text-purple-300">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-full bg-white/5 text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40 text-center text-[11px] text-slate-400 font-medium">
          Cheer in live matches, sync with choirs & check in daily to earn Fan XP
        </div>
      </div>
    </div>
  );
}
