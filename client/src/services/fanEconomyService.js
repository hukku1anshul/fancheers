// Fan Economy & Progression Service
// Transforms repetitive tapping into an addictive, rewarding progression loop.

export const XP_TIERS = [
  { level: 1, name: 'Stadium Rookie', minXP: 0, badge: '🌱' },
  { level: 2, name: 'Curva Regular', minXP: 250, badge: '🎟️' },
  { level: 3, name: 'Terrace Veteran', minXP: 750, badge: '🧣' },
  { level: 4, name: 'Club Die-Hard', minXP: 1800, badge: '🔥' },
  { level: 5, name: 'Choir Leader', minXP: 3500, badge: '📣' },
  { level: 10, name: 'Stadium Ultra', minXP: 8000, badge: '⚡' },
  { level: 15, name: 'Curva Capo', minXP: 18000, badge: '👑' },
  { level: 25, name: 'Stadium Immortal', minXP: 50000, badge: '🏆' }
];

export const AVAILABLE_COSMETICS = {
  flares: [
    { id: 'flare_standard', name: 'Classic Pyro', color: '#f97316', icon: '💥', minLevel: 1 },
    { id: 'flare_emerald', name: 'Neon Emerald', color: '#10b981', icon: '🟢', minLevel: 3 },
    { id: 'flare_violet', name: 'Ultra Violet Laser', color: '#8b5cf6', icon: '🔮', minLevel: 5 },
    { id: 'flare_gold', name: 'Gold Pyrotechnics', color: '#eab308', icon: '✨', minLevel: 10 }
  ],
  callsigns: [
    { id: 'cs_rookie', name: 'Stadium Fan', icon: '🎙️', minLevel: 1 },
    { id: 'cs_striker', name: 'Thunder Striker', icon: '⚡', minLevel: 2 },
    { id: 'cs_ultras', name: 'Gate 12 Ultra', icon: '🏴‍☠️', minLevel: 5 },
    { id: 'cs_legend', name: 'Pitch Infiltrator', icon: '🦅', minLevel: 10 }
  ]
};

const STORAGE_KEY = 'fanpulse_economy';

class FanEconomyService {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return {
      xp: 380,
      dailyStreak: 3,
      lastCheckIn: Date.now() - 86400000, // yesterday
      equippedFlare: 'flare_standard',
      equippedCallsign: 'cs_rookie',
      history: []
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {}
  }

  getXP() {
    return this.state.xp;
  }

  getTier() {
    const xp = this.state.xp;
    let currentTier = XP_TIERS[0];
    let nextTier = XP_TIERS[1];

    for (let i = 0; i < XP_TIERS.length; i++) {
      if (xp >= XP_TIERS[i].minXP) {
        currentTier = XP_TIERS[i];
        nextTier = XP_TIERS[i + 1] || null;
      } else {
        break;
      }
    }

    const progressToNext = nextTier 
      ? Math.min(100, Math.round(((xp - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100))
      : 100;

    return {
      currentTier,
      nextTier,
      progressToNext
    };
  }

  addXP(amount, reason = 'Cheer action') {
    this.state.xp += amount;
    this.state.history.unshift({
      id: Date.now().toString(),
      amount,
      reason,
      timestamp: Date.now()
    });
    if (this.state.history.length > 30) this.state.history.pop();
    this.saveState();
    return this.getTier();
  }

  checkInDaily() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeSince = now - (this.state.lastCheckIn || 0);

    if (timeSince > oneDayMs * 2) {
      // Streak broken
      this.state.dailyStreak = 1;
    } else if (timeSince >= oneDayMs * 0.8) {
      // Valid consecutive day
      this.state.dailyStreak = (this.state.dailyStreak || 0) + 1;
    } else {
      // Already checked in today
      return { alreadyCheckedIn: true, streak: this.state.dailyStreak };
    }

    this.state.lastCheckIn = now;
    const bonus = 100 + (this.state.dailyStreak * 25);
    this.addXP(bonus, `Day ${this.state.dailyStreak} Training Ground Check-In`);
    this.saveState();

    return {
      alreadyCheckedIn: false,
      streak: this.state.dailyStreak,
      xpAwarded: bonus
    };
  }

  getEquippedCosmetics() {
    const flare = AVAILABLE_COSMETICS.flares.find(f => f.id === this.state.equippedFlare) || AVAILABLE_COSMETICS.flares[0];
    const callsign = AVAILABLE_COSMETICS.callsigns.find(c => c.id === this.state.equippedCallsign) || AVAILABLE_COSMETICS.callsigns[0];
    return { flare, callsign };
  }

  equipCosmetic(type, id) {
    if (type === 'flare') {
      this.state.equippedFlare = id;
    } else if (type === 'callsign') {
      this.state.equippedCallsign = id;
    }
    this.saveState();
  }
}

export const fanEconomy = new FanEconomyService();
