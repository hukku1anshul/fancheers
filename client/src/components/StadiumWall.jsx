import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Shield } from 'lucide-react';
import { socket } from '../services/socket';

const QUICK_REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '⚡', label: 'Electric' },
  { emoji: '😱', label: 'Shocked' },
  { emoji: '🎯', label: 'Class' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '🤣', label: 'LOL' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '💔', label: 'Broken' }
];

// Simple profanity check (reuses same approach as safetyShieldService)
const BLOCKED_WORDS = ['fuck', 'shit', 'bitch', 'ass', 'dick', 'cunt', 'damn', 'bastard', 'idiot', 'stupid'];
function isProfane(text) {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some(w => lower.includes(w));
}

export default function StadiumWall({ match, userName }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [lastSentAt, setLastSentAt] = useState(0);
  const [cooldownError, setCooldownError] = useState('');
  const [danmakuMessages, setDanmakuMessages] = useState([]);
  const feedRef = useRef(null);
  const displayName = userName || localStorage.getItem('fanpulse_username') || `Fan_${Math.floor(100 + Math.random() * 900)}`;

  // Listen for chat messages from Socket.io
  useEffect(() => {
    if (!match?.id) return;

    // Request chat history on join
    socket.emit('chat:join', { matchId: match.id });

    const handleChatMessage = (msg) => {
      setMessages(prev => [...prev.slice(-99), msg]);

      // Add to danmaku (floating messages) — auto-expire after 4 seconds
      if (msg.type !== 'system') {
        const danmakuItem = { ...msg, id: msg.id || Date.now() + Math.random(), top: Math.random() * 70 + 5 };
        setDanmakuMessages(prev => [...prev, danmakuItem]);
        setTimeout(() => {
          setDanmakuMessages(prev => prev.filter(d => d.id !== danmakuItem.id));
        }, 4500);
      }
    };

    const handleChatHistory = (history) => {
      setMessages(history || []);
    };

    socket.on('chat:message', handleChatMessage);
    socket.on('chat:history', handleChatHistory);

    return () => {
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:history', handleChatHistory);
    };
  }, [match?.id]);

  // Auto-scroll feed to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text, type = 'text') => {
    if (!text.trim() || !match?.id) return;

    // Rate limit: 1 message per 3 seconds
    const now = Date.now();
    if (now - lastSentAt < 3000) {
      setCooldownError('Slow down! Wait 3 seconds between messages.');
      setTimeout(() => setCooldownError(''), 2000);
      return;
    }

    // Profanity check
    if (type === 'text' && isProfane(text)) {
      setCooldownError('🛡️ Message blocked by Safety Shield');
      setTimeout(() => setCooldownError(''), 2000);
      return;
    }

    const msg = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      matchId: match.id,
      userName: displayName,
      text: text.slice(0, 140),
      type,
      teamSide: 'home',
      timestamp: Date.now()
    };

    socket.emit('chat:send', msg);
    setLastSentAt(now);
    setInputText('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText, 'text');
  };

  const handleReaction = (emoji) => {
    sendMessage(emoji, 'reaction');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Danmaku / Floating Messages Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {danmakuMessages.map((d) => (
          <div
            key={d.id}
            className="absolute whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm animate-danmaku"
            style={{
              top: `${d.top}%`,
              right: '-200px',
              animation: 'danmakuSlide 4s linear forwards'
            }}
          >
            {d.type === 'reaction' ? (
              <span className="text-base">{d.text}</span>
            ) : (
              <span><span className="text-stadium-neon">{d.userName}</span>: {d.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* Chat Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto p-2 space-y-1.5 relative z-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
            <Smile className="w-7 h-7 mb-2 opacity-40" />
            <span>No messages yet. Be the first to shout!</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-1.5 group">
              {msg.type === 'system' ? (
                <div className="w-full text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium py-0.5 italic">
                  {msg.text}
                </div>
              ) : msg.type === 'reaction' ? (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{msg.userName}</span>
                  <span className="text-lg leading-none">{msg.text}</span>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-extrabold text-stadium-turf dark:text-stadium-neon shrink-0">
                      {msg.userName}
                    </span>
                    <span className="text-[9px] text-slate-400 shrink-0">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 break-words leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Reaction Bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-pitch-900/80 overflow-x-auto">
        {QUICK_REACTIONS.map((r) => (
          <button
            key={r.emoji}
            onClick={() => handleReaction(r.emoji)}
            className="text-base hover:scale-125 active:scale-90 transition-transform shrink-0"
            title={r.label}
          >
            {r.emoji}
          </button>
        ))}
      </div>

      {/* Cooldown Error */}
      {cooldownError && (
        <div className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>{cooldownError}</span>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 p-2 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-pitch-800">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Shout to the stadium..."
          maxLength={140}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-pitch-700 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-stadium-turf dark:focus:border-stadium-neon transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-stadium-turf dark:bg-stadium-neon text-white dark:text-pitch-900 disabled:opacity-30 active:scale-90 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Danmaku CSS Animation */}
      <style>{`
        @keyframes danmakuSlide {
          0% { transform: translateX(0); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(calc(-100vw - 200px)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
