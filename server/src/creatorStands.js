// Creator & Influencer "Stadium Stands" Engine
// Manages virtual stands, creator host identities, cheers, and leaderboard rankings.

const CREATOR_STANDS = [
  {
    id: 'aftv',
    name: 'The AFTV Stand',
    hosts: 'Robbie & Ty',
    avatar: '🔴',
    color: '#E11D48',
    gradient: 'from-rose-600 to-red-800',
    motto: 'Pure Passion, Unfiltered Matchday Noise',
    cheers: 4230,
    fansCount: 312,
    activeMultiplier: '2.5x'
  },
  {
    id: 'united_stand',
    name: 'The United Stand',
    hosts: 'Mark Goldbridge',
    avatar: '👹',
    color: '#DC2626',
    gradient: 'from-red-600 to-amber-700',
    motto: 'Stand Together, Tactical Rants & Roars',
    cheers: 3890,
    fansCount: 284,
    activeMultiplier: '2.0x'
  },
  {
    id: 'criccast',
    name: 'CricCast Global Lounge',
    hosts: 'Harsha & Bumble',
    avatar: '🏏',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    motto: 'Majestic Strokeplay & High-Octane Cheering',
    cheers: 5120,
    fansCount: 418,
    activeMultiplier: '3.0x'
  },
  {
    id: 'barstool',
    name: 'Barstool Bleachers',
    hosts: 'Big Cat & Crew',
    avatar: '🍺',
    color: '#2563EB',
    gradient: 'from-blue-600 to-indigo-800',
    motto: 'Electric Factory Energy on Every Pitch',
    cheers: 3450,
    fansCount: 229,
    activeMultiplier: '1.8x'
  },
  {
    id: 'copa90',
    name: 'COPA90 Ultra Stand',
    hosts: 'Eli & Poet',
    avatar: '🌍',
    color: '#10B981',
    gradient: 'from-emerald-600 to-teal-800',
    motto: 'Authentic Fan Culture Across Continents',
    cheers: 2980,
    fansCount: 195,
    activeMultiplier: '1.5x'
  }
];

class CreatorStandsManager {
  constructor() {
    this.stands = new Map(CREATOR_STANDS.map(s => [s.id, { ...s }]));
  }

  addCheer(standId, count = 1) {
    const stand = this.stands.get(standId);
    if (!stand) return null;

    stand.cheers += count;
    return {
      standId: stand.id,
      name: stand.name,
      cheers: stand.cheers,
      color: stand.color
    };
  }

  joinStand(standId) {
    const stand = this.stands.get(standId);
    if (!stand) return null;
    stand.fansCount += 1;
    return stand;
  }

  getLeaderboard() {
    const list = Array.from(this.stands.values());
    list.sort((a, b) => b.cheers - a.cheers);
    return list.map((s, index) => ({
      ...s,
      rank: index + 1,
      isLeader: index === 0
    }));
  }

  getStand(standId) {
    return this.stands.get(standId) || null;
  }
}

export const creatorStandsManager = new CreatorStandsManager();
