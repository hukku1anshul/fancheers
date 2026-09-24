import React from 'react';
import { Shield, Zap, MessageSquare, Trophy, User, Activity } from 'lucide-react';

export default function MobileBottomNav({
  activeTab = 'stadium',
  onSelectTab,
  onQuickShout,
  comboStreak = 0,
  activeMatch,
  selectedSide = 'home'
}) {
  const handleTabClick = (tabId) => {
    if (navigator.vibrate) navigator.vibrate(12);
    onSelectTab(tabId);
  };

  const navItems = [
    { id: 'stadium', label: 'Stadium', icon: '🏟️' },
    { id: 'matches', label: 'Matches', icon: '⚽' },
    { id: 'wall', label: 'Wall', icon: '💬' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'passport', label: 'Passport', icon: '👤' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-pitch-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors duration-300">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-stadium-turf dark:text-stadium-neon font-black'
                  : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-stadium-turf/15 dark:bg-stadium-neon/15 scale-110 shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
