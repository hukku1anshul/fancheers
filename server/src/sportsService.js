import axios from 'axios';

// ESPN Public Endpoints
const ESPN_ENDPOINTS = {
  baseball_mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  soccer_ucl: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
  soccer_mls: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
  soccer_epl: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  basketball_wnba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard',
  basketball_nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  football_nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  hockey_nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  tennis_atp: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard',
  cricket_scorepanel: 'https://site.web.api.espn.com/apis/site/v2/sports/cricket/scorepanel'
};

// Known stadium / city coordinates
const CITY_COORDINATES = {
  'New York': [40.7128, -74.0060],
  'Brooklyn': [40.6782, -73.9442],
  'Los Angeles': [34.0522, -118.2437],
  'San Francisco': [37.7749, -122.4194],
  'Chicago': [41.8781, -87.6298],
  'Boston': [42.3601, -71.0589],
  'Philadelphia': [39.9526, -75.1652],
  'Toronto': [43.6532, -79.3832],
  'Houston': [29.7604, -95.3698],
  'Miami': [25.7617, -80.1918],
  'Atlanta': [33.7490, -84.3880],
  'Seattle': [47.6062, -122.3321],
  'Denver': [39.7392, -104.9903],
  'Dallas': [32.7767, -96.7970],
  'Detroit': [42.3314, -83.0458],
  'Minneapolis': [44.9778, -93.2650],
  'St. Louis': [38.6270, -90.1994],
  'San Diego': [32.7157, -117.1611],
  'Baltimore': [39.2904, -76.6122],
  'Kansas City': [39.0997, -94.5786],
  'Milwaukee': [43.0389, -87.9065],
  'Oakland': [37.8044, -122.2712],
  'Cincinnati': [39.1031, -84.5120],
  'Tampa': [27.9506, -82.4572],
  'Phoenix': [33.4484, -112.0740],
  'London': [51.5074, -0.1278],
  'Manchester': [53.4808, -2.2426],
  'Liverpool': [53.4084, -2.9916],
  'Madrid': [40.4168, -3.7038],
  'Barcelona': [41.3879, 2.1699],
  'Munich': [48.1351, 11.5820],
  'Paris': [48.8566, 2.3522],
  'Derby': [53.1360, -1.5540],
  'Worcester': [52.2270, -2.2220],
  'Durham': [54.7761, -1.5733],
  'Preston': [53.8000, -2.7000],
  'Nottingham': [53.1000, -1.0000],
  'Southampton': [51.0577, -1.3080],
  'Leeds': [53.9590, -1.0815],
  'Chelmsford': [51.7340, 0.4690],
  'Hove': [50.9230, -0.1380],
  'London (Surrey)': [51.3148, -0.5600],
  'Taunton': [51.0150, -3.1040],
  'Leicester': [52.6369, -1.1398],
  'Chennai': [13.0827, 80.2707],
  'Mumbai': [19.0760, 72.8777],
  'Bengaluru': [12.9716, 77.5946],
  'Delhi': [28.6139, 77.2090],
  'Ahmedabad': [23.0225, 72.5714],
  'Kolkata': [22.5726, 88.3639],
  'Bridgetown': [13.1060, -59.6132]
};

function resolveCoordinates(cityName, fallbackLat = 40.7128, fallbackLng = -74.0060) {
  if (!cityName) return [fallbackLat, fallbackLng];
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (cityName.toLowerCase().includes(key.toLowerCase())) {
      return coords;
    }
  }
  return [fallbackLat, fallbackLng];
}

function formatCountdown(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs <= 0) return 'Starting shortly';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}

function formatStartTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

// Fallback Inline Cricket Logos
const defaultCricketLogoHome = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%230070b8'/><text x='50%' y='55%' font-size='44' text-anchor='middle' dominant-baseline='middle'>🏏</text></svg>";
const defaultCricketLogoAway = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%23e6a100'/><text x='50%' y='55%' font-size='44' text-anchor='middle' dominant-baseline='middle'>🏏</text></svg>";

export async function fetchLiveMatches(sport = 'all') {
  const realMatches = [];

  // 1. Fetch Real ESPN Sports (Soccer, Baseball, Basketball, Football, Hockey, Tennis)
  try {
    const endpointConfigs = [];
    if (sport === 'all' || sport === 'baseball') {
      endpointConfigs.push({ url: ESPN_ENDPOINTS.baseball_mlb, sport: 'baseball', defaultLeague: 'MLB' });
    }
    if (sport === 'all' || sport === 'soccer') {
      endpointConfigs.push({ url: ESPN_ENDPOINTS.soccer_ucl, sport: 'soccer', defaultLeague: 'UEFA Champions League' });
      endpointConfigs.push({ url: ESPN_ENDPOINTS.soccer_mls, sport: 'soccer', defaultLeague: 'Major League Soccer' });
      endpointConfigs.push({ url: ESPN_ENDPOINTS.soccer_epl, sport: 'soccer', defaultLeague: 'Premier League' });
    }
    if (sport === 'all' || sport === 'basketball') {
      endpointConfigs.push({ url: ESPN_ENDPOINTS.basketball_wnba, sport: 'basketball', defaultLeague: 'WNBA' });
      endpointConfigs.push({ url: ESPN_ENDPOINTS.basketball_nba, sport: 'basketball', defaultLeague: 'NBA' });
    }
    if (sport === 'all' || sport === 'football') {
      endpointConfigs.push({ url: ESPN_ENDPOINTS.football_nfl, sport: 'football', defaultLeague: 'NFL' });
    }
    if (sport === 'all' || sport === 'hockey') {
      endpointConfigs.push({ url: ESPN_ENDPOINTS.hockey_nhl, sport: 'hockey', defaultLeague: 'NHL' });
    }
    if (sport === 'all' || sport === 'tennis') {
      endpointConfigs.push({ url: ESPN_ENDPOINTS.tennis_atp, sport: 'tennis', defaultLeague: 'ATP / Grand Slam' });
    }

    const responses = await Promise.allSettled(
      endpointConfigs.map((cfg) =>
        axios.get(cfg.url, { timeout: 3500 }).then(res => ({ res, cfg })).catch(() => null)
      )
    );

    for (const item of responses) {
      if (item.status === 'fulfilled' && item.value?.res?.data?.events) {
        const events = item.value.res.data.events;
        const cfg = item.value.cfg;
        const leagueName = item.value.res.data.leagues?.[0]?.name || cfg.defaultLeague;

        for (const ev of events.slice(0, 15)) {
          const comp = ev.competitions?.[0];
          if (!comp) continue;
          const home = comp.competitors?.find((c) => c.homeAway === 'home') || comp.competitors?.[0];
          const away = comp.competitors?.find((c) => c.homeAway === 'away') || comp.competitors?.[1];
          if (!home || !away) continue;

          const homeCity = home.team?.location || home.team?.name || 'Home City';
          const awayCity = away.team?.location || away.team?.name || 'Away City';
          const venueCity = comp.venue?.address?.city || homeCity;
          const venueCoord = resolveCoordinates(venueCity, 40.7128, -74.0060);
          const awayCoord = resolveCoordinates(awayCity, 34.0522, -118.2437);

          // Discard historical matches older than 48 hours
          if (ev.date) {
            const matchTime = new Date(ev.date).getTime();
            const now = Date.now();
            const hoursAgo = (now - matchTime) / (1000 * 60 * 60);
            if (hoursAgo > 48) continue;
          }

          const state = ev.status?.type?.state; // 'in', 'pre', 'post'
          const isLiveNow = state === 'in';
          const isPost = state === 'post';
          const isPre = state === 'pre';

          let situation = '';
          if (comp.situation?.lastPlay?.text) {
            situation = comp.situation.lastPlay.text;
          } else if (comp.status?.type?.detail) {
            situation = comp.status.type.detail;
          }

          let clockText = comp.status?.displayClock || '0:00';
          let countdown = null;
          let kickoffTime = '';

          if (isLiveNow) {
            clockText = `${comp.status?.displayClock || 'LIVE'} ${comp.status?.period ? '• P' + comp.status.period : ''}`;
          } else if (isPre) {
            countdown = formatCountdown(ev.date);
            kickoffTime = formatStartTime(ev.date);
            clockText = countdown ? `Starts ${countdown}` : (comp.status?.type?.detail || 'Scheduled');
          } else if (isPost) {
            clockText = comp.status?.type?.detail || 'Final';
          }

          const broadcast = comp.broadcasts?.[0]?.names?.[0] || ev.broadcasts?.[0]?.market || null;

          realMatches.push({
            id: `espn_${ev.id}`,
            isReal: true,
            source: 'ESPN Real-Time Live',
            sport: cfg.sport,
            league: leagueName,
            venue: comp.venue?.fullName || `${homeCity} Stadium`,
            status: isLiveNow ? 'in' : (isPost ? 'post' : 'pre'),
            statusState: state,
            clock: clockText,
            countdown: countdown,
            kickoffTime: kickoffTime,
            broadcast: broadcast,
            situation: situation,
            homeTeam: {
              id: String(home.team?.id || 'h1'),
              name: home.team?.displayName || home.team?.name || 'Home Team',
              shortName: home.team?.abbreviation || home.team?.name?.substring(0, 3).toUpperCase() || 'HOM',
              logo: home.team?.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png',
              color: home.team?.color ? `#${home.team.color}` : '#e53e3e',
              score: home.score !== undefined ? home.score : 0,
              record: home.records?.[0]?.summary || null,
              city: homeCity,
              country: 'World',
              coordinates: venueCoord
            },
            awayTeam: {
              id: String(away.team?.id || 'a1'),
              name: away.team?.displayName || away.team?.name || 'Away Team',
              shortName: away.team?.abbreviation || away.team?.name?.substring(0, 3).toUpperCase() || 'AWY',
              logo: away.team?.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png',
              color: away.team?.color ? `#${away.team.color}` : '#00f2fe',
              score: away.score !== undefined ? away.score : 0,
              record: away.records?.[0]?.summary || null,
              city: awayCity,
              country: 'World',
              coordinates: awayCoord
            },
            lastEvent: situation
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching ESPN sports:', err.message);
  }

  // 2. Fetch Real Cricket from Official ESPN Cricket Scorepanel
  if (sport === 'all' || sport === 'cricket') {
    try {
      const cricRes = await axios.get(ESPN_ENDPOINTS.cricket_scorepanel, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      const scoreGroups = cricRes.data?.scores || [];

      for (const group of scoreGroups) {
        const leagueName = group.leagues?.[0]?.name || 'Cricket Tournament';
        const events = group.events || [];

        for (const ev of events) {
          const comp = ev.competitions?.[0];
          if (!comp) continue;

          const t1 = comp.competitors?.[0];
          const t2 = comp.competitors?.[1];
          if (!t1 || !t2) continue;

          const t1Name = t1.team?.name || t1.team?.displayName || 'Team 1';
          const t2Name = t2.team?.name || t2.team?.displayName || 'Team 2';

          const t1Score = t1.score || '-';
          const t2Score = t2.score || '-';

          const statusState = comp.status?.type?.state; // 'in', 'pre', 'post'
          const statusDesc = comp.status?.type?.description || ''; // 'Live', 'Stumps', 'Lunch', 'Tea', 'Result', 'Scheduled'
          const summary = comp.status?.summary || '';
          const session = comp.status?.session || '';

          // Determine exact cricket status
          let matchStatus = 'pre';
          let matchClock = 'Scheduled';
          let countdown = null;
          let kickoffTime = formatStartTime(ev.date);

          const isCompleted = statusState === 'post' || 
                              statusDesc === 'Result' || 
                              summary.toLowerCase().includes('won by') || 
                              summary.toLowerCase().includes('drawn') || 
                              summary.toLowerCase().includes('tied') ||
                              summary.toLowerCase().includes('match finished');

          const isStumps = statusDesc === 'Stumps' || summary.toLowerCase().includes('stumps');
          const isInterval = statusDesc === 'Lunch' || statusDesc === 'Tea' || summary.toLowerCase().includes('lunch') || summary.toLowerCase().includes('tea');
          const isScheduled = statusState === 'pre' || statusDesc === 'Scheduled';
          const isGenuinelyLive = statusState === 'in' && statusDesc === 'Live';

          if (isCompleted) {
            matchStatus = 'post';
            matchClock = 'FINAL RESULT';
          } else if (isStumps) {
            matchStatus = 'stumps';
            matchClock = `Stumps (${session || 'Play Resumes Tomorrow'})`;
          } else if (isInterval) {
            matchStatus = 'break';
            matchClock = `${statusDesc} Interval (${session || 'Break'})`;
          } else if (isGenuinelyLive) {
            matchStatus = 'in';
            matchClock = `🔴 LIVE (${session || 'In-Play'})`;
          } else if (isScheduled) {
            matchStatus = 'pre';
            countdown = formatCountdown(ev.date);
            matchClock = countdown ? `Starts ${countdown}` : (summary || 'Scheduled Today');
          } else {
            // Default fallback
            matchStatus = statusState === 'in' ? 'in' : 'pre';
            matchClock = summary || 'Scheduled';
          }

          const venueCity = comp.venue?.address?.city || comp.venue?.fullName || t1Name;
          const venueCoord = resolveCoordinates(venueCity, 13.0827, 80.2707);
          const awayCoord = resolveCoordinates(t2Name, 22.5726, 88.3639);

          realMatches.push({
            id: `cric_espn_${ev.id}`,
            isReal: true,
            source: 'ESPN Cricket Live',
            sport: 'cricket',
            league: leagueName,
            venue: comp.venue?.fullName || `${t1Name} Cricket Ground`,
            status: matchStatus,
            statusState: statusState,
            statusDesc: statusDesc,
            clock: matchClock,
            countdown: countdown,
            kickoffTime: kickoffTime,
            broadcast: comp.broadcast || 'Sky Sports / Willow / JioCinema',
            situation: summary || (isStumps ? 'Overnight Stumps' : (isGenuinelyLive ? 'Live In-Play' : 'Upcoming')),
            homeTeam: {
              id: `cric_${t1.team?.id || t1Name.toLowerCase().replace(/\s+/g, '_')}`,
              name: t1Name,
              shortName: t1.team?.abbreviation || t1Name.substring(0, 3).toUpperCase(),
              logo: t1.team?.logo || defaultCricketLogoHome,
              color: t1.team?.color ? `#${t1.team.color}` : '#0070B8',
              score: t1Score,
              isBatting: t1.linescores?.some(ls => ls.isCurrent === 1 && ls.isBatting) || false,
              city: venueCity,
              country: 'World Cricket',
              coordinates: venueCoord
            },
            awayTeam: {
              id: `cric_${t2.team?.id || t2Name.toLowerCase().replace(/\s+/g, '_')}`,
              name: t2Name,
              shortName: t2.team?.abbreviation || t2Name.substring(0, 3).toUpperCase(),
              logo: t2.team?.logo || defaultCricketLogoAway,
              color: t2.team?.color ? `#${t2.team.color}` : '#E6A100',
              score: t2Score,
              isBatting: t2.linescores?.some(ls => ls.isCurrent === 1 && ls.isBatting) || false,
              city: t2Name,
              country: 'World Cricket',
              coordinates: awayCoord
            },
            lastEvent: summary || matchClock
          });
        }
      }
    } catch (cricErr) {
      console.warn('Error fetching ESPN cricket scorepanel:', cricErr.message);
    }
  }

  // Filter by sport
  let filtered = realMatches;
  if (sport !== 'all') {
    filtered = realMatches.filter((m) => m.sport.toLowerCase() === sport.toLowerCase());
  }

  // Strict Status Priority:
  // 1. Actively In-Play (status === 'in')
  // 2. Scheduled / Upcoming (status === 'pre')
  // 3. Stumps / Break (status === 'stumps' | 'break')
  // 4. Completed / Final (status === 'post')
  const statusWeight = {
    'in': 1,
    'pre': 2,
    'break': 3,
    'stumps': 4,
    'post': 5
  };

  const sorted = filtered.sort((a, b) => {
    const wA = statusWeight[a.status] || 6;
    const wB = statusWeight[b.status] || 6;
    return wA - wB;
  });

  return sorted;
}

export function getMatchById(matchId) {
  return null;
}
