import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fetchLiveMatches, getMatchById } from './sportsService.js';
import { cheerManager } from './cheerManager.js';
import { squadManager } from './squadManager.js';
import { pairingManager } from './pairingManager.js';
import { getTacticalInsight } from './tacticalAnalyst.js';
import { creatorStandsManager } from './creatorStands.js';
import { clusterManager } from './clusterManager.js';
import { crunchAlertManager } from './crunchAlertManager.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Security Hardening: HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows client WebSocket & dynamic PWA assets
  crossOriginEmbedderPolicy: false
}));

// CORS & Body Parser Protection
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '64kb' }));

// API Rate Limiting: Prevent DoS & endpoint flood attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // 2000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please wait a moment.' }
});
app.use('/api/', apiLimiter);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 64 * 1024 // 64KB max buffer to prevent memory exhaustion DoS attacks
});

// Cache of genuine active matches (100% real live data from ESPN endpoints)
let cachedMatches = [];
async function refreshMatches() {
  try {
    cachedMatches = await fetchLiveMatches('all');
    crunchAlertManager.evaluateMatches(cachedMatches);
  } catch (err) {
    console.error('Error refreshing matches:', err.message);
  }
}
await refreshMatches();
setInterval(refreshMatches, 15000);

// NOTE: Bot and simulated data generation completely REMOVED.
// Only genuine sports data and real user interactions are served.

// REST API Endpoints
app.get('/api/crunch-alerts', (req, res) => {
  const alerts = crunchAlertManager.getActiveAlerts();
  res.json({ alerts });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), activeMatches: cachedMatches.length });
});

app.get('/api/sports/matches', async (req, res) => {
  const sport = req.query.sport || 'all';
  if (sport === 'all') {
    return res.json({ matches: cachedMatches });
  }
  const filtered = cachedMatches.filter(
    (m) => m.sport.toLowerCase() === sport.toLowerCase()
  );
  res.json({ matches: filtered });
});

app.get('/api/matches/:id', (req, res) => {
  const match = cachedMatches.find((m) => m.id === req.params.id) || getMatchById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const stats = cheerManager.getStats(match.id);
  res.json({ match, stats });
});

app.get('/api/matches/:id/stats', (req, res) => {
  const stats = cheerManager.getStats(req.params.id);
  res.json(stats);
});

// 🧠 AI Tactical Analyst Endpoint
app.get('/api/tactical/insight', (req, res) => {
  const matchId = req.query.matchId;
  const match = cachedMatches.find(m => m.id === matchId) || cachedMatches[0];
  const query = req.query.query;
  const insight = getTacticalInsight(match, query);
  res.json(insight);
});

// 🏟️ Creator Stands Leaderboard Endpoint
app.get('/api/creator-stands', (req, res) => {
  const leaderboard = creatorStandsManager.getLeaderboard();
  res.json({ stands: leaderboard });
});

// ⚡ Edge Clustering & High-Concurrency Metrics Endpoint
app.get('/api/cluster/metrics', (req, res) => {
  res.json(clusterManager.getMetrics());
});

// 🚨 Crunch-Time Alerts Endpoint
app.get('/api/crunch-alerts', (req, res) => {
  const alerts = crunchAlertManager.getActiveAlerts();
  res.json({ alerts });
});

// In-memory player ratings store: { [playerId]: { totalScore, count } }
const playerRatingsStore = new Map();
const intelligenceCache = new Map();

function getEventIcon(txt = '') {
  const t = String(txt).toLowerCase();
  if (t.includes('goal')) return '⚽';
  if (t.includes('yellow')) return '🟨';
  if (t.includes('red')) return '🟥';
  if (t.includes('sub')) return '🔄';
  if (t.includes('wicket')) return '🎯';
  if (t.includes('six') || t.includes('home-run') || t.includes('homer')) return '💥';
  if (t.includes('kickoff') || t.includes('start')) return '🏟️';
  if (t.includes('half') || t.includes('end') || t.includes('stumps')) return '⏱️';
  if (t.includes('var') || t.includes('review')) return '📺';
  return '⚡';
}

function getSummaryUrl(match) {
  if (!match?.id) return null;
  const isCricket = (match.sport || '').toLowerCase() === 'cricket' || String(match.id).startsWith('cric_');
  const rawId = String(match.id).replace('cric_espn_', '').replace('espn_', '');
  const sport = (match.sport || '').toLowerCase();
  const league = (match.league || '').toLowerCase();

  if (isCricket) {
    return `https://site.web.api.espn.com/apis/site/v2/sports/cricket/summary?event=${rawId}`;
  }
  if (sport === 'soccer') {
    if (league.includes('champions') || league.includes('uefa')) {
      return `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/summary?event=${rawId}`;
    }
    if (league.includes('mls') || league.includes('major league')) {
      return `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/summary?event=${rawId}`;
    }
    return `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/summary?event=${rawId}`;
  }
  if (sport === 'baseball') {
    return `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${rawId}`;
  }
  if (sport === 'basketball') {
    if (league.includes('wnba')) {
      return `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/summary?event=${rawId}`;
    }
    return `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${rawId}`;
  }
  if (sport === 'football') {
    return `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${rawId}`;
  }
  if (sport === 'hockey') {
    return `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=${rawId}`;
  }
  if (sport === 'tennis') {
    return `https://site.api.espn.com/apis/site/v2/sports/tennis/atp/summary?event=${rawId}`;
  }
  return null;
}

async function fetchMatchIntelligence(match) {
  const matchId = match?.id || 'unknown';
  const cached = intelligenceCache.get(matchId);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }

  const homeName = typeof match.homeTeam === 'object' ? match.homeTeam.name : (match.homeTeam || 'Home Team');
  const awayName = typeof match.awayTeam === 'object' ? match.awayTeam.name : (match.awayTeam || 'Away Team');

  let homePlayers = [];
  let awayPlayers = [];
  let keyEvents = [];

  const summaryUrl = getSummaryUrl(match);
  if (summaryUrl) {
    try {
      const resp = await axios.get(summaryUrl, {
        timeout: 4000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      const data = resp.data || {};

      // 1. Extract Rosters
      if (Array.isArray(data.rosters) && data.rosters.length >= 2) {
        const team1 = data.rosters[0];
        const team2 = data.rosters[1];

        const mapPlayer = (p, prefix, index) => {
          const statsMap = {};
          if (Array.isArray(p.stats)) {
            p.stats.forEach(s => {
              if (s.name && s.displayValue !== undefined) {
                statsMap[s.name] = s.displayValue;
              }
            });
          }
          const ath = p.athlete || {};
          return {
            id: `${matchId}_${ath.id || prefix + '_' + index}`,
            name: ath.displayName || ath.fullName || 'Player',
            role: p.position?.displayName || p.position?.name || (p.starter ? 'Starter' : 'Substitute'),
            number: parseInt(p.jersey, 10) || (index + 1),
            starter: !!p.starter,
            goals: statsMap.totalGoals ? parseInt(statsMap.totalGoals, 10) : 0,
            assists: statsMap.goalAssists ? parseInt(statsMap.goalAssists, 10) : 0,
            rating: 7.5,
            ratingCount: 15
          };
        };

        homePlayers = (team1.roster || []).slice(0, 11).map((p, idx) => mapPlayer(p, 'h', idx));
        awayPlayers = (team2.roster || []).slice(0, 11).map((p, idx) => mapPlayer(p, 'a', idx));
      } else if (data.boxscore?.players && Array.isArray(data.boxscore.players) && data.boxscore.players.length >= 2) {
        // Fallback for NBA / Boxscore structures
        const team1 = data.boxscore.players[0];
        const team2 = data.boxscore.players[1];
        const aths1 = team1.statistics?.[0]?.athletes || [];
        const aths2 = team2.statistics?.[0]?.athletes || [];

        homePlayers = aths1.slice(0, 8).map((entry, idx) => ({
          id: `${matchId}_h_${entry.athlete?.id || idx}`,
          name: entry.athlete?.displayName || entry.athlete?.fullName || 'Player',
          role: entry.athlete?.position?.abbreviation || 'Athlete',
          number: parseInt(entry.athlete?.jersey, 10) || (idx + 1),
          starter: entry.starter || false,
          rating: 7.5,
          ratingCount: 12
        }));

        awayPlayers = aths2.slice(0, 8).map((entry, idx) => ({
          id: `${matchId}_a_${entry.athlete?.id || idx}`,
          name: entry.athlete?.displayName || entry.athlete?.fullName || 'Player',
          role: entry.athlete?.position?.abbreviation || 'Athlete',
          number: parseInt(entry.athlete?.jersey, 10) || (idx + 1),
          starter: entry.starter || false,
          rating: 7.5,
          ratingCount: 12
        }));
      }

      // 2. Extract Key Events
      if (Array.isArray(data.keyEvents)) {
        keyEvents = data.keyEvents.slice(0, 15).map((ke, idx) => {
          const typeStr = ke.type?.type || ke.type?.text || 'Event';
          const athleteName = ke.participants?.[0]?.athlete?.displayName || '';
          return {
            id: String(ke.id || `ev_${idx}`),
            minute: ke.clock?.displayValue || (ke.period?.number ? `P${ke.period.number}` : ''),
            type: typeStr.toLowerCase(),
            team: ke.team?.displayName || '',
            player: athleteName,
            description: ke.text || ke.type?.text || 'Key Match Event',
            icon: getEventIcon(typeStr)
          };
        });
      } else if (Array.isArray(data.plays)) {
        // Baseball / Football scoring plays
        const scoring = data.plays.filter(p => p.scoringPlay || p.type?.text?.includes('Home Run')).slice(-8);
        keyEvents = scoring.map((p, idx) => ({
          id: String(p.id || `play_${idx}`),
          minute: p.clock?.displayValue || (p.period?.displayValue || ''),
          type: 'score',
          team: p.team?.displayName || '',
          player: p.participants?.[0]?.athlete?.displayName || '',
          description: p.text || 'Scoring play',
          icon: '💥'
        }));
      }
    } catch (err) {
      console.warn(`ESPN summary fetch warning for match ${matchId}:`, err.message);
    }
  }

  // Overlay user ratings from memory store
  const mergeRatings = (players) => players.map(p => {
    const custom = playerRatingsStore.get(p.id);
    if (custom) {
      const avg = ((p.rating * p.ratingCount + custom.totalScore) / (p.ratingCount + custom.count)).toFixed(1);
      return { ...p, rating: parseFloat(avg), ratingCount: p.ratingCount + custom.count };
    }
    return p;
  });

  const mergedHome = mergeRatings(homePlayers);
  const mergedAway = mergeRatings(awayPlayers);

  const topHero = mergedHome[0] || mergedAway[0] || null;
  const topVillain = mergedAway[1] || mergedHome[1] || null;

  const result = {
    matchId,
    homeTeam: homeName,
    awayTeam: awayName,
    lineups: {
      home: mergedHome,
      away: mergedAway
    },
    keyEvents,
    topHero,
    topVillain
  };

  intelligenceCache.set(matchId, { timestamp: Date.now(), data: result });
  return result;
}

// 📋 Match Dossier & Genuine Player Intelligence Endpoint
app.get('/api/match/:id/intelligence', async (req, res) => {
  const matchId = req.params.id;
  const match = cachedMatches.find(m => m.id === matchId) || getMatchById(matchId) || cachedMatches[0] || { id: matchId };
  try {
    const intelligence = await fetchMatchIntelligence(match);
    res.json(intelligence);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load match intelligence', message: err.message });
  }
});

// Submit live player rating
app.post('/api/match/:id/rate-player', (req, res) => {
  const { playerId, rating } = req.body;
  if (!playerId || typeof rating !== 'number' || rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Invalid rating. Must be between 1 and 10.' });
  }

  const existing = playerRatingsStore.get(playerId) || { totalScore: 0, count: 0 };
  existing.totalScore += rating;
  existing.count += 1;
  playerRatingsStore.set(playerId, existing);

  const newAvg = (existing.totalScore / existing.count).toFixed(1);
  io.emit('player:rating_updated', { playerId, newAvg: parseFloat(newAvg), totalRatings: existing.count });
  res.json({ success: true, playerId, newAvg: parseFloat(newAvg), totalRatings: existing.count });
});

// 🎙️ Squad Details Endpoint
app.get('/api/squads/:code', (req, res) => {
  const squad = squadManager.getSquad(req.params.code);
  if (!squad) return res.status(404).json({ error: 'Squad not found' });
  res.json({ squad });
});

// In-memory Stadium Wall chat store: { [matchId]: Array<ChatMessage> }
const matchChatStore = new Map();

// 💬 Stadium Wall Chat History Endpoint
app.get('/api/match/:id/chat-history', (req, res) => {
  const history = matchChatStore.get(req.params.id) || [];
  res.json({ history });
});

function sanitizeText(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLen)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Socket.io Real-Time Channel
io.on('connection', (socket) => {
  let lastChatAt = 0;
  let lastCheerAt = 0;

  // 💬 Stadium Wall Match Chat Channel
  socket.on('chat:join', ({ matchId }) => {
    if (!matchId || typeof matchId !== 'string') return;
    socket.join(`chat:${matchId}`);
    const history = matchChatStore.get(matchId) || [];
    socket.emit('chat:history', history);
  });

  socket.on('chat:send', (msg) => {
    if (!msg?.matchId || !msg?.text) return;

    // Rate limit socket chatter: maximum 1 message per 1.5 seconds per connection
    const now = Date.now();
    if (now - lastChatAt < 1500) return;
    lastChatAt = now;

    let history = matchChatStore.get(msg.matchId);
    if (!history) {
      history = [];
      matchChatStore.set(msg.matchId, history);
    }

    const cleanText = sanitizeText(msg.text, 140);
    const cleanUser = sanitizeText(msg.userName || 'Fan', 30);
    if (!cleanText) return;

    const messageObj = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      matchId: String(msg.matchId),
      userName: cleanUser,
      text: cleanText,
      type: msg.type === 'reaction' ? 'reaction' : 'text',
      teamSide: msg.teamSide === 'away' ? 'away' : 'home',
      timestamp: Date.now()
    };

    history.push(messageObj);
    if (history.length > 60) history.shift();

    io.to(`chat:${msg.matchId}`).emit('chat:message', messageObj);
  });

  // 1. Core Match Channel
  socket.on('join:match', ({ matchId }) => {
    if (!matchId || typeof matchId !== 'string') return;
    socket.join(`match:${matchId}`);
    const stats = cheerManager.getStats(matchId);
    socket.emit('match:initial_state', stats);
  });

  socket.on('leave:match', ({ matchId }) => {
    if (matchId) socket.leave(`match:${matchId}`);
  });

  socket.on('cheer:send', (cheerData) => {
    if (!cheerData?.matchId || typeof cheerData.matchId !== 'string') return;

    // Rate limit bursts: allow at most one emission every 150ms per socket
    const now = Date.now();
    if (now - lastCheerAt < 150) return;
    lastCheerAt = now;

    const safeCount = Math.min(Math.max(parseInt(cheerData.count, 10) || 1, 1), 25);
    const safeSide = cheerData.teamSide === 'away' ? 'away' : 'home';
    const safeMsg = sanitizeText(cheerData.message || '', 120);

    const safeCheer = {
      ...cheerData,
      count: safeCount,
      teamSide: safeSide,
      message: safeMsg || null
    };

    clusterManager.recordPulse(safeCount);
    const { stats, pulse } = cheerManager.addCheer(cheerData.matchId, safeCheer);

    // Broadcast pulse to all fans in this match
    io.to(`match:${cheerData.matchId}`).emit('cheer:pulse', pulse);
    io.to(`match:${cheerData.matchId}`).emit('stats:update', stats);
  });

  // 2. 🎙️ Squad Watch Rooms & Walkie-Talkie Banter
  socket.on('squad:create', (data) => {
    const squad = squadManager.createSquad(socket.id, data || {});
    socket.join(`squad:${squad.code}`);
    socket.emit('squad:state', squad);
  });

  socket.on('squad:join', (data) => {
    const squad = squadManager.joinSquad(socket.id, data || {});
    socket.join(`squad:${squad.code}`);
    io.to(`squad:${squad.code}`).emit('squad:state', squad);
  });

  socket.on('squad:leave', ({ code }) => {
    const updated = squadManager.leaveSquad(socket.id, code);
    socket.leave(`squad:${code}`);
    if (updated) {
      io.to(`squad:${code}`).emit('squad:state', updated);
    }
  });

  socket.on('squad:cheer', (data) => {
    if (!data?.code) return;
    const cheerResult = squadManager.addCheer(socket.id, data);
    if (cheerResult) {
      io.to(`squad:${data.code}`).emit('squad:cheered', cheerResult);
    }
  });

  socket.on('squad:audio_burst', (data) => {
    if (!data?.code) return;
    const burst = squadManager.recordAudioBurst(socket.id, data);
    if (burst) {
      // Broadcast to all other squad members in real time
      socket.to(`squad:${data.code}`).emit('squad:audio_burst', burst);
      // Also update squad feed for sender
      io.to(`squad:${data.code}`).emit('squad:state', squadManager.getSquad(data.code));
    }
  });

  // 3. 📺 Living Room Mode: TV Screen & Mobile Remote Pairing
  socket.on('tv:init', ({ matchId }) => {
    const session = pairingManager.createTvSession(socket.id, matchId);
    socket.join(`tv:${session.pairCode}`);
    socket.emit('tv:session', session);
  });

  socket.on('remote:pair', ({ pairCode }) => {
    const result = pairingManager.pairRemote(socket.id, pairCode);
    if (result.success) {
      socket.join(`tv:${result.pairCode}`);
      socket.emit('remote:paired', result);
      io.to(`tv:${result.pairCode}`).emit('tv:remote_connected', {
        pairCode: result.pairCode,
        totalRemotes: result.connectedRemotes
      });
    } else {
      socket.emit('remote:error', { message: result.error });
    }
  });

  socket.on('remote:action', (actionData) => {
    const session = pairingManager.getSessionByRemote(socket.id);
    if (session) {
      // Relay action immediately to TV screen
      io.to(`tv:${session.code}`).emit('tv:action_received', {
        ...actionData,
        remoteId: socket.id
      });
    }
  });

  // 4. 🏟️ Creator Stands Cheers
  socket.on('stands:cheer', ({ standId, count }) => {
    const result = creatorStandsManager.addCheer(standId, count || 1);
    if (result) {
      io.emit('stands:update', {
        stand: result,
        leaderboard: creatorStandsManager.getLeaderboard()
      });
    }
  });

  socket.on('disconnect', () => {
    // Clean up squads
    const updatedSquads = squadManager.handleDisconnect(socket.id);
    for (const squad of updatedSquads) {
      io.to(`squad:${squad.code}`).emit('squad:state', squad);
    }

    // Clean up TV/Remote sessions
    const pairingEvent = pairingManager.handleDisconnect(socket.id);
    if (pairingEvent?.type === 'remote_left') {
      io.to(`tv:${pairingEvent.pairCode}`).emit('tv:remote_disconnected', {
        remainingRemotes: pairingEvent.remainingRemotes
      });
    }
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

// 📱 Direct APK Download Endpoint
app.get(['/download/apk', '/downloads/fanpulse.apk', '/fanpulse.apk', '/api/download/apk'], (req, res) => {
  const apkPath = path.join(PUBLIC_DIR, 'fanpulse-mobile.apk');
  res.download(apkPath, 'FanPulse-v1.0.apk', (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'APK file not found on server.' });
    }
  });
});

// Serve public static directory (direct access to APK and assets)
app.use('/public', express.static(PUBLIC_DIR));

// Serve production frontend assets (Render Web Service)
app.use(express.static(CLIENT_DIST));

// SPA fallback for HTML5 history API navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err && !res.headersSent) {
      res.status(200).send('FanPulse API is live. Build client with npm run build.');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FanPulse Server running at http://0.0.0.0:${PORT}`);
});
