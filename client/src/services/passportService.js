const STORAGE_KEY = 'fanpulse_superfan_passport';

const INITIAL_PASSPORT = {
  xp: 380,
  level: 2,
  tier: 'Ultra Roarer',
  totalCheers: 240,
  matchesAttended: ['cric_espn_1546441', 'espn_live_top'],
  unlockedBadges: ['pioneer', 'lightning'],
  predictionStreak: 3
};

const ALL_BADGES = [
  {
    id: 'pioneer',
    icon: '🎟️',
    title: 'Stadium Pioneer',
    desc: 'Joined and cheered in your first live match on FanPulse.',
    unlocked: true,
    progress: 100
  },
  {
    id: 'lightning',
    icon: '⚡',
    title: 'Lightning Reflexes',
    desc: 'Reacted within 400ms of a major match milestone.',
    unlocked: true,
    progress: 100
  },
  {
    id: 'roar_master',
    icon: '🦁',
    title: 'Roar Master',
    desc: 'Surpassed 500 lifetime cheers for your club.',
    unlocked: false,
    progress: 48
  },
  {
    id: 'turf_conqueror',
    icon: '👑',
    title: 'Turf Conqueror',
    desc: 'Helped your home city conquer majority dominance on the Fan Turf map.',
    unlocked: false,
    progress: 75
  },
  {
    id: 'oracle',
    icon: '🎯',
    title: 'Match Oracle',
    desc: 'Achieved a 3x consecutive prediction streak in Flash Predictions.',
    unlocked: true,
    progress: 100
  },
  {
    id: 'derby_veteran',
    icon: '🔥',
    title: 'Derby Veteran',
    desc: 'Participated in 5 or more global derby match days.',
    unlocked: false,
    progress: 40
  }
];

class PassportService {
  constructor() {
    this.data = this.load();
  }

  load() {
    if (typeof window === 'undefined') return INITIAL_PASSPORT;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...INITIAL_PASSPORT, ...JSON.parse(stored) };
    } catch (e) {}
    return INITIAL_PASSPORT;
  }

  save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {}
  }

  getPassport() {
    return {
      ...this.data,
      badges: ALL_BADGES.map(b => ({
        ...b,
        unlocked: this.data.unlockedBadges.includes(b.id)
      }))
    };
  }

  addCheers(count = 1) {
    this.data.totalCheers += count;
    this.data.xp += count * 2;
    if (this.data.totalCheers >= 500 && !this.data.unlockedBadges.includes('roar_master')) {
      this.data.unlockedBadges.push('roar_master');
    }
    this.checkLevel();
    this.save();
    return this.getPassport();
  }

  recordMatch(matchId) {
    if (!this.data.matchesAttended.includes(matchId)) {
      this.data.matchesAttended.push(matchId);
      this.data.xp += 100;
      if (this.data.matchesAttended.length >= 5 && !this.data.unlockedBadges.includes('derby_veteran')) {
        this.data.unlockedBadges.push('derby_veteran');
      }
      this.checkLevel();
      this.save();
    }
  }

  checkLevel() {
    const lvl = Math.floor(this.data.xp / 250) + 1;
    this.data.level = lvl;
    if (lvl >= 5) this.data.tier = 'Stadium Legend';
    else if (lvl >= 3) this.data.tier = 'Hardcore Ultras';
    else if (lvl >= 2) this.data.tier = 'Ultra Roarer';
    else this.data.tier = 'Bleacher Rookie';
  }
}

export const passportService = new PassportService();
