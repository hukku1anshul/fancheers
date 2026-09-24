/**
 * notificationService.js
 * 
 * Browser Notification API wrapper for FanPulse push notifications.
 * Handles permission requests, goal alerts, crunch-time alerts,
 * squad invites, and daily streak reminders.
 */

const PERM_KEY = 'fanpulse_notif_permission_asked';
const PREFS_KEY = 'fanpulse_notif_prefs';

class NotificationService {
  constructor() {
    this.supported = typeof window !== 'undefined' && 'Notification' in window;
    this.permission = this.supported ? Notification.permission : 'denied';
    this.prefs = this._loadPrefs();
    this._cooldowns = new Map();
  }

  _loadPrefs() {
    if (typeof window === 'undefined') return { goals: true, crunch: true, squad: true, streak: true };
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      return stored ? JSON.parse(stored) : { goals: true, crunch: true, squad: true, streak: true };
    } catch (e) {
      return { goals: true, crunch: true, squad: true, streak: true };
    }
  }

  _savePrefs() {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs)); } catch (e) {}
  }

  isEnabled() {
    return this.supported && this.permission === 'granted';
  }

  async requestPermission() {
    if (!this.supported) return 'denied';
    if (this.permission === 'granted') return 'granted';
    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      if (typeof window !== 'undefined') localStorage.setItem(PERM_KEY, 'true');
      return result;
    } catch (e) {
      console.warn('Notification permission request failed:', e);
      return 'denied';
    }
  }

  shouldPrompt() {
    if (!this.supported) return false;
    if (this.permission === 'granted' || this.permission === 'denied') return false;
    if (typeof window !== 'undefined' && localStorage.getItem(PERM_KEY)) return false;
    return true;
  }

  _send(title, options = {}, cooldownMs = 5000) {
    if (!this.isEnabled()) return null;
    const tag = options.tag || title;
    const now = Date.now();
    const lastSent = this._cooldowns.get(tag) || 0;
    if (now - lastSent < cooldownMs) return null;
    this._cooldowns.set(tag, now);
    try {
      const notif = new Notification(title, {
        icon: options.icon || '/favicon.ico',
        badge: '/favicon.ico',
        body: options.body || '',
        tag, requireInteraction: false, silent: false, ...options
      });
      setTimeout(() => notif.close(), 6000);
      notif.onclick = () => { window.focus(); notif.close(); if (options.onClick) options.onClick(); };
      return notif;
    } catch (e) {
      console.warn('Failed to send notification:', e);
      return null;
    }
  }

  sendGoalAlert(matchName, scorer, minute) {
    if (!this.prefs.goals) return null;
    return this._send(`⚽ GOAL! ${scorer}`, { body: `${matchName} • ${minute}`, tag: `goal_${scorer}_${minute}` }, 3000);
  }

  sendWicketAlert(matchName, bowler, batsman, minute) {
    if (!this.prefs.goals) return null;
    return this._send(`🏏 WICKET! ${bowler} gets ${batsman}`, { body: `${matchName} • ${minute}`, tag: `wicket_${bowler}_${minute}` }, 3000);
  }

  sendCrunchTimeAlert(matchName, description) {
    if (!this.prefs.crunch) return null;
    return this._send(`🚨 NAIL-BITER: ${matchName}`, { body: description || 'Match entering crunch time!', tag: `crunch_${matchName}` }, 30000);
  }

  sendSquadInvite(squadCode, inviterName) {
    if (!this.prefs.squad) return null;
    return this._send(`🎙️ Squad Invite from ${inviterName}`, { body: `Join Squad ${squadCode} to cheer together!`, tag: `squad_${squadCode}` }, 10000);
  }

  sendStreakReminder(currentStreak) {
    if (!this.prefs.streak) return null;
    return this._send(`🔥 Don't break your ${currentStreak}-day streak!`, { body: 'Check in at The Locker Room to keep it alive.', tag: 'streak_reminder' }, 3600000);
  }

  sendMatchEndedAlert(matchName) {
    return this._send(`📊 Full Time! ${matchName}`, { body: 'Your Matchday Report is ready!', tag: `match_ended_${matchName}` }, 10000);
  }

  updatePrefs(newPrefs) { this.prefs = { ...this.prefs, ...newPrefs }; this._savePrefs(); }
  getPrefs() { return { ...this.prefs }; }
}

export const notificationService = new NotificationService();
