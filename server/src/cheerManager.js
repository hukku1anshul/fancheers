// Seed cities with realistic global coordinates for cheer aggregation
const GLOBAL_CITIES = [
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, homeWeight: 0.65, awayWeight: 0.35 },
  { name: 'Manchester', country: 'United Kingdom', lat: 53.4808, lng: -2.2426, homeWeight: 0.40, awayWeight: 0.60 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, homeWeight: 0.52, awayWeight: 0.48 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, homeWeight: 0.35, awayWeight: 0.65 },
  { name: 'Boston', country: 'United States', lat: 42.3601, lng: -71.0589, homeWeight: 0.75, awayWeight: 0.25 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, homeWeight: 0.80, awayWeight: 0.20 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, homeWeight: 0.20, awayWeight: 0.80 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, homeWeight: 0.55, awayWeight: 0.45 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, homeWeight: 0.30, awayWeight: 0.70 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, homeWeight: 0.58, awayWeight: 0.42 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, homeWeight: 0.48, awayWeight: 0.52 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, homeWeight: 0.30, awayWeight: 0.70 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, homeWeight: 0.60, awayWeight: 0.40 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, homeWeight: 0.50, awayWeight: 0.50 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, homeWeight: 0.70, awayWeight: 0.30 },
  { name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, homeWeight: 0.65, awayWeight: 0.35 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, homeWeight: 0.60, awayWeight: 0.40 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639, homeWeight: 0.68, awayWeight: 0.32 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, homeWeight: 0.68, awayWeight: 0.32 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, homeWeight: 0.58, awayWeight: 0.42 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, homeWeight: 0.54, awayWeight: 0.46 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, homeWeight: 0.55, awayWeight: 0.45 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, homeWeight: 0.62, awayWeight: 0.38 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, homeWeight: 0.57, awayWeight: 0.43 }
];

class CheerManager {
  constructor() {
    this.matchStats = new Map(); // matchId -> stats
  }

  computeTurf(cities) {
    let homeCount = 0;
    let awayCount = 0;
    let contestedCount = 0;
    let cheerCapital = null;
    let maxTotal = 0;

    Object.values(cities).forEach((c) => {
      if (c.total > maxTotal) {
        maxTotal = c.total;
        cheerCapital = {
          name: c.name,
          country: c.country,
          total: c.total,
          dominantSide: c.homeCheers > c.awayCheers ? 'home' : 'away',
          ratio: Math.round((Math.max(c.homeCheers, c.awayCheers) / (c.total || 1)) * 100)
        };
      }

      const ratio = c.homeCheers / (c.total || 1);
      if (ratio > 0.55) {
        c.turf = 'home';
        homeCount++;
      } else if (ratio < 0.45) {
        c.turf = 'away';
        awayCount++;
      } else {
        c.turf = 'contested';
        contestedCount++;
      }
    });

    return {
      homeCount,
      awayCount,
      contestedCount,
      cheerCapital
    };
  }

  generateInitialMomentum() {
    const points = [];
    const now = Date.now();
    for (let i = 40; i >= 0; i--) {
      const baseHome = 40 + Math.sin(i * 0.4) * 20 + Math.random() * 15;
      const baseAway = 35 + Math.cos(i * 0.3) * 18 + Math.random() * 15;
      points.push({
        time: now - i * 60000,
        minute: 40 - i,
        homeVelocity: Math.round(baseHome),
        awayVelocity: Math.round(baseAway),
        event: i === 25 ? 'Boundary' : (i === 10 ? 'Wicket' : null)
      });
    }
    return points;
  }

  getOrCreateMatchStats(matchId) {
    if (!this.matchStats.has(matchId)) {
      const cities = {};
      const countries = {};
      let totalHome = 0;
      let totalAway = 0;

      GLOBAL_CITIES.forEach((city) => {
        const baseCheers = Math.floor(Math.random() * 400) + 120;
        const homeCheers = Math.floor(baseCheers * city.homeWeight);
        const awayCheers = Math.floor(baseCheers * city.awayWeight);

        cities[city.name] = {
          name: city.name,
          country: city.country,
          lat: city.lat,
          lng: city.lng,
          homeCheers,
          awayCheers,
          total: homeCheers + awayCheers,
          turf: homeCheers > awayCheers ? 'home' : 'away'
        };

        if (!countries[city.country]) {
          countries[city.country] = {
            country: city.country,
            lat: city.lat,
            lng: city.lng,
            homeCheers: 0,
            awayCheers: 0,
            total: 0
          };
        }
        countries[city.country].homeCheers += homeCheers;
        countries[city.country].awayCheers += awayCheers;
        countries[city.country].total += (homeCheers + awayCheers);

        totalHome += homeCheers;
        totalAway += awayCheers;
      });

      const turf = this.computeTurf(cities);
      const momentumHistory = this.generateInitialMomentum();

      this.matchStats.set(matchId, {
        matchId,
        totalHome,
        totalAway,
        totalCheers: totalHome + totalAway,
        cheersPerMinute: 840,
        turf,
        momentumHistory,
        cities,
        countries,
        recentPulses: [],
        recentChants: [
          {
            id: 'c_init_1',
            teamName: 'Home',
            text: 'COME ON!! ROAR FOR THE TEAM! 🔴🔥',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.5074,
            lng: -0.1278,
            timestamp: Date.now() - 30000
          },
          {
            id: 'c_init_2',
            teamName: 'Away',
            text: 'Defense! We are turning this around! 🛡️⚡',
            city: 'Mumbai',
            country: 'India',
            lat: 19.0760,
            lng: 72.8777,
            timestamp: Date.now() - 15000
          }
        ]
      });
    }
    return this.matchStats.get(matchId);
  }

  addCheer(matchId, cheer) {
    const stats = this.getOrCreateMatchStats(matchId);
    const count = cheer.count || 1;
    const isHome = cheer.teamSide === 'home';

    if (isHome) {
      stats.totalHome += count;
    } else {
      stats.totalAway += count;
    }
    stats.totalCheers += count;

    // Resolve city
    const cityName = cheer.city || 'London';
    const countryName = cheer.country || 'United Kingdom';
    const lat = cheer.lat || 51.5074;
    const lng = cheer.lng || -0.1278;

    if (!stats.cities[cityName]) {
      stats.cities[cityName] = {
        name: cityName,
        country: countryName,
        lat,
        lng,
        homeCheers: 0,
        awayCheers: 0,
        total: 0,
        turf: 'contested'
      };
    }
    if (isHome) {
      stats.cities[cityName].homeCheers += count;
    } else {
      stats.cities[cityName].awayCheers += count;
    }
    stats.cities[cityName].total += count;

    // Recompute turf summary
    stats.turf = this.computeTurf(stats.cities);

    // Update rolling velocity & momentum
    stats.cheersPerMinute = Math.min(2500, stats.cheersPerMinute + count * 2);

    // Update latest point in momentumHistory
    const lastPoint = stats.momentumHistory[stats.momentumHistory.length - 1];
    if (lastPoint && Date.now() - lastPoint.time < 30000) {
      if (isHome) lastPoint.homeVelocity += count;
      else lastPoint.awayVelocity += count;
    } else {
      stats.momentumHistory.push({
        time: Date.now(),
        minute: (lastPoint?.minute || 0) + 1,
        homeVelocity: isHome ? count * 10 : 20,
        awayVelocity: !isHome ? count * 10 : 20,
        event: null
      });
      if (stats.momentumHistory.length > 50) {
        stats.momentumHistory.shift();
      }
    }

    const pulse = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      matchId,
      teamId: cheer.teamId,
      teamSide: cheer.teamSide,
      teamColor: cheer.teamColor || (isHome ? '#EF0107' : '#034694'),
      teamName: cheer.teamName || (isHome ? 'Home' : 'Away'),
      city: cityName,
      country: countryName,
      lat,
      lng,
      message: cheer.message || null,
      cheerType: cheer.cheerType || 'shout',
      count,
      timestamp: Date.now()
    };

    stats.recentPulses.unshift(pulse);
    if (stats.recentPulses.length > 60) stats.recentPulses.pop();

    if (cheer.message) {
      stats.recentChants.unshift({
        id: pulse.id,
        teamName: pulse.teamName,
        teamColor: pulse.teamColor,
        teamSide: pulse.teamSide,
        text: cheer.message,
        city: cityName,
        country: countryName,
        lat,
        lng,
        timestamp: Date.now()
      });
      if (stats.recentChants.length > 25) stats.recentChants.pop();
    }

    return { stats, pulse };
  }

  getStats(matchId) {
    return this.getOrCreateMatchStats(matchId);
  }

  getRandomCity() {
    return GLOBAL_CITIES[Math.floor(Math.random() * GLOBAL_CITIES.length)];
  }
}

export const cheerManager = new CheerManager();
