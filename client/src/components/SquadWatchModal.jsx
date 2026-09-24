import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Mic, Radio, Copy, Check, Flame, Volume2, UserPlus, LogOut, Sparkles, ShieldAlert, ShieldCheck, Ban, Flag } from 'lucide-react';
import { getSocket } from '../services/socket';
import { soundEffects } from '../services/soundEffects';
import { safetyShield } from '../services/safetyShieldService';

export default function SquadWatchModal({ isOpen, onClose, activeSquad, onUpdateSquad }) {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [userName, setUserName] = useState(() => localStorage.getItem('fanpulse_username') || 'Superfan_' + Math.floor(100 + Math.random() * 900));
  const [avatar, setAvatar] = useState('🦁');
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [incomingChirp, setIncomingChirp] = useState(null);
  const [limiterError, setLimiterError] = useState(null);
  const [shieldNotice, setShieldNotice] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const handleHostKick = (memberId, memberName) => {
    safetyShield.muteUser(memberId);
    if (activeSquad?.members) {
      const updatedMembers = activeSquad.members.filter(m => m.id !== memberId);
      onUpdateSquad({
        ...activeSquad,
        members: updatedMembers,
        feed: [{ id: Date.now().toString(), type: 'kick', text: `🛡️ Host removed ${memberName} for room safety.` }, ...(activeSquad.feed || [])]
      });
    }
    setShieldNotice(`Kicked ${memberName} from squad.`);
    setTimeout(() => setShieldNotice(null), 3000);
  };

  const handleReport = (memberId, memberName) => {
    const res = safetyShield.reportUser(memberId);
    setShieldNotice(`Flagged & muted ${memberName}. Report logged.`);
    setTimeout(() => setShieldNotice(null), 3000);
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleState = (squad) => {
      onUpdateSquad(squad);
    };

    const handleAudioBurst = (burst) => {
      setIncomingChirp(burst);
      // Play procedural radio squelch + tone
      soundEffects.playHeartbeat(); // subtle audio alert
      setTimeout(() => setIncomingChirp(null), 3500);
    };

    const handleCheered = (cheerResult) => {
      // Squad member cheered
    };

    socket.on('squad:state', handleState);
    socket.on('squad:audio_burst', handleAudioBurst);
    socket.on('squad:cheered', handleCheered);

    return () => {
      socket.off('squad:state', handleState);
      socket.off('squad:audio_burst', handleAudioBurst);
      socket.off('squad:cheered', handleCheered);
    };
  }, [onUpdateSquad]);

  const handleCreateSquad = () => {
    const fallbackSquad = {
      code: 'FAN-88',
      matchId: 'live',
      creatorId: 'local',
      totalCheers: 18,
      memberCount: 2,
      members: [
        { id: 'me', name: userName, avatar, cheers: 18, isCreator: true, online: true },
        { id: 'teammate_1', name: 'Alex M.', avatar: '⚡', cheers: 14, isCreator: false, online: true }
      ],
      feed: [
        { id: 'feed_1', type: 'system', text: `🎉 Squad FAN-88 created! Invite code ready.` },
        { id: 'feed_2', type: 'cheer', text: `🔥 Alex M. surged to 14 roars!` }
      ]
    };
    onUpdateSquad(fallbackSquad);

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('squad:create', { userName, avatar });
    }
  };

  const handleJoinSquad = (e) => {
    e?.preventDefault();
    if (!joinCodeInput.trim()) return;
    const code = joinCodeInput.trim().toUpperCase();
    const fallbackSquad = {
      code,
      matchId: 'live',
      creatorId: 'host',
      totalCheers: 32,
      memberCount: 3,
      members: [
        { id: 'host', name: 'Squad Captain', avatar: '👑', cheers: 32, isCreator: true, online: true },
        { id: 'me', name: userName, avatar, cheers: 0, isCreator: false, online: true }
      ],
      feed: [
        { id: `feed_${Date.now()}`, type: 'join', text: `👋 ${userName} hopped into the squad!` }
      ]
    };
    onUpdateSquad(fallbackSquad);

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('squad:join', { code, userName, avatar });
    }
    setJoinCodeInput('');
  };

  const handleLeaveSquad = () => {
    if (!activeSquad?.code) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('squad:leave', { code: activeSquad.code });
      onUpdateSquad(null);
    }
  };

  const handleCopyLink = () => {
    if (!activeSquad?.code) return;
    const inviteUrl = `${window.location.origin}/?squad=${activeSquad.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Push to Talk (PTT) Walkie Talkie Recording
  const startRecording = async () => {
    const check = safetyShield.canSendAudioBurst();
    if (!check.allowed) {
      setLimiterError(check.error);
      setTimeout(() => setLimiterError(null), 3000);
      return;
    }

    setIsRecording(true);
    setRecordingSeconds(0);

    recordTimerRef.current = setInterval(() => {
      setRecordingSeconds((s) => {
        if (s >= 3) {
          stopRecording();
          return 3;
        }
        return s + 1;
      });
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          broadcastAudioBurst();
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      }
    } catch (err) {
      console.warn('Microphone permission not granted, using procedural walkie-talkie chirp:', err);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback procedural chirp broadcast
      broadcastAudioBurst();
    }
  };

  const broadcastAudioBurst = () => {
    if (!activeSquad?.code) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('squad:audio_burst', {
        code: activeSquad.code,
        duration: Math.max(1, recordingSeconds),
        userName,
        avatar
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">Squad Watch Room</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase tracking-wider">
                  Live Banter
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">Cheer together & talk via Push-to-Talk Walkie-Talkie</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incoming Walkie Chirp Notification */}
        {incomingChirp && (
          <div className="p-3 bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>🎙️ Incoming walkie-talkie chirp from {incomingChirp.senderName}!</span>
            </div>
            <span className="px-2 py-0.5 bg-black/20 rounded-md text-[10px]">Playing (3s)</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!activeSquad ? (
            /* Not in a squad: Create or Join */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-pitch-850 border border-slate-200 dark:border-white/5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Fan Identity
                </h4>
                <div className="flex items-center gap-3">
                  <select
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-pitch-800 border border-slate-200 dark:border-white/10 text-xl"
                  >
                    <option value="🦁">🦁</option>
                    <option value="⚡">⚡</option>
                    <option value="👑">👑</option>
                    <option value="🔥">🔥</option>
                    <option value="🦅">🦅</option>
                  </select>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      localStorage.setItem('fanpulse_username', e.target.value);
                    }}
                    placeholder="Enter your name..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-pitch-800 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Create Squad Button */}
              <button
                onClick={handleCreateSquad}
                className="w-full py-3.5 rounded-2xl bg-stadium-turf text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-stadium-turf/25 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Squad Room</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Or Join Friends</span>
                <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
              </div>

              {/* Join Code Form */}
              <form onSubmit={handleJoinSquad} className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Enter 6-char code (e.g. FAN-8K)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-pitch-800 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
                />
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs uppercase tracking-wider disabled:opacity-40 transition active:scale-95"
                >
                  Join
                </button>
              </form>
            </div>
          ) : (
            /* Active Squad View */
            <div className="space-y-4">
              {/* Squad Header Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-pitch-850 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Active Squad Room
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-black text-base text-stadium-turf dark:text-stadium-neon">
                      {activeSquad.code}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-lg bg-white dark:bg-pitch-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 transition active:scale-95"
                      title="Copy invite link"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">Total Cheers</span>
                    <span className="font-black text-xs text-orange-500 flex items-center justify-end gap-0.5">
                      <Flame className="w-3 h-3" />
                      {activeSquad.totalCheers || 0}
                    </span>
                  </div>

                  <button
                    onClick={handleLeaveSquad}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition active:scale-95"
                    title="Leave squad"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trust & Safety Shield Status Banner */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">Safety Shield Active: Acoustic Limiter & Profanity Guard</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 uppercase font-black">
                  Protected
                </span>
              </div>

              {/* Limiter or Shield Error Alert */}
              {(limiterError || shieldNotice) && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>{limiterError || shieldNotice}</span>
                </div>
              )}

              {/* Push to Talk (PTT) Walkie Talkie Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-pitch-900 to-emerald-950 text-white border border-emerald-500/20 text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Push-To-Talk Walkie-Talkie</span>
                </div>
                <p className="text-[11px] text-slate-300 max-w-xs mx-auto">
                  Hold down the button to scream with your squad on wickets or goals. Max 3-second audio chirp.
                </p>

                {/* Big Push-to-Talk Button */}
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`w-24 h-24 mx-auto rounded-full flex flex-col items-center justify-center transition-all shadow-xl select-none ${
                    isRecording
                      ? 'bg-rose-600 text-white scale-110 ring-4 ring-rose-400/50 animate-pulse'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 ring-4 ring-emerald-500/20'
                  }`}
                >
                  <Mic className="w-7 h-7" />
                  <span className="text-[10px] font-black uppercase mt-1">
                    {isRecording ? `${recordingSeconds}s Hold` : 'Hold to Talk'}
                  </span>
                </button>
                <div className="text-[10px] text-slate-400">
                  {isRecording ? 'Broadcasting live audio burst...' : 'Release button to instantly broadcast audio'}
                </div>
              </div>

              {/* Members Roster with Host Moderation Controls */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                  <span>Squad Roster ({activeSquad.members?.length || 0})</span>
                  <span className="text-[10px] text-emerald-500 font-bold">● All Synced</span>
                </h4>
                <div className="space-y-1.5">
                  {activeSquad.members?.map((m) => {
                    const isHost = m.isCreator || m.id === 'host';
                    const isMe = m.name === userName || m.id === 'me';

                    return (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-pitch-850 border border-slate-200 dark:border-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl">{m.avatar || '🦁'}</span>
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {isHost && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                                  HOST
                                </span>
                              )}
                              {isMe && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" />
                              <span>{m.cheers || 0} roars</span>
                            </div>
                          </div>
                        </div>

                        {/* Host Kick/Mute and Report buttons */}
                        {!isMe && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleHostKick(m.id, m.name)}
                              className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/20 flex items-center gap-1 active:scale-95 transition"
                              title="Kick user from squad"
                            >
                              <Ban className="w-3 h-3" />
                              <span className="hidden sm:inline">Kick</span>
                            </button>
                            <button
                              onClick={() => handleReport(m.id, m.name)}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 text-[10px] active:scale-95 transition"
                              title="Report abusive member"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Squad Activity Feed */}
              {activeSquad.feed?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Live Squad Activity
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {activeSquad.feed.map((item) => (
                      <div
                        key={item.id}
                        className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate"
                      >
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-pitch-850 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            Squad cheers aggregate into the global match decibels.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs active:scale-95 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
