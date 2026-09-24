import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import TacticalAnalyst from './components/TacticalAnalyst';
import CrunchTimeAlert from './components/CrunchTimeAlert';
import ChantChoir from './components/ChantChoir';
import StealthSilentMode from './components/StealthSilentMode';
import Navbar from './components/Navbar';
import LiveMatchCarousel from './components/LiveMatchCarousel';
import MomentumWaveform from './components/MomentumWaveform';
import FlashPredictions from './components/FlashPredictions';
import ScoreHeader from './components/ScoreHeader';
import FanMap from './components/FanMap';
import CheerControls from './components/CheerControls';
import LiveFeedSidebar from './components/LiveFeedSidebar';
import MobileBottomNav from './components/MobileBottomNav';
import { passportService } from './services/passportService';
import { fanEconomy } from './services/fanEconomyService';
import { nativeBridge } from './services/nativeBridgeService';
import { teamFollowService } from './services/teamFollowService';
import { notificationService } from './services/notificationService';
import { venueGeofence } from './services/venueGeofenceService';
import { tvSync } from './services/tvSyncService';
import { hapticEngine } from './services/hapticEngine';
import { getApiBaseUrl, socket, joinMatchRoom, leaveMatchRoom, sendCheer, onConnectionStatusChange } from './services/socket';
import { soundEngine } from './services/soundEffects';

// Route-Based Code-Splitting: Lazy-load heavy secondary modals to minimize initial JS bundle
const SuperfanPassport = lazy(() => import('./components/SuperfanPassport'));
const FanCardModal = lazy(() => import('./components/FanCardModal'));
const SquadWatchModal = lazy(() => import('./components/SquadWatchModal'));
const CreatorStandsModal = lazy(() => import('./components/CreatorStandsModal'));
const TvDisplayView = lazy(() => import('./components/TvDisplayView'));
const MobileRemoteView = lazy(() => import('./components/MobileRemoteView'));
const ZenMatchdayMode = lazy(() => import('./components/ZenMatchdayMode'));
const MatchDossier = lazy(() => import('./components/MatchDossier'));
const TheLockerRoom = lazy(() => import('./components/TheLockerRoom'));
const StadiumCosmeticsModal = lazy(() => import('./components/StadiumCosmeticsModal'));
const ReplayRadar = lazy(() => import('./components/ReplayRadar'));
const FollowTeamsModal = lazy(() => import('./components/FollowTeamsModal'));
const MatchdayReport = lazy(() => import('./components/MatchdayReport'));
const MatchListModal = lazy(() => import('./components/MatchListModal'));
const VenueGeofenceModal = lazy(() => import('./components/VenueGeofenceModal'));
const StreamOverlayModal = lazy(() => import('./components/StreamOverlayModal'));
const StreamOverlayView = lazy(() => import('./components/StreamOverlayView'));
const ServerConnectionModal = lazy(() => import('./components/ServerConnectionModal'));
const MobileDrawerModal = lazy(() => import('./components/MobileDrawerModal'));

const SPORTS = [
  { id: 'all', label: 'All Sports', icon: '🏆' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'soccer', label: 'Football / Soccer', icon: '⚽' },
  { id: 'baseball', label: 'Baseball (MLB)', icon: '⚾' },
  { id: 'basketball', label: 'Basketball (NBA)', icon: '🏀' },
  { id: 'football', label: 'American Football (NFL)', icon: '🏈' },
  { id: 'hockey', label: 'Hockey (NHL)', icon: '🏒' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' }
];

const DEFAULT_USER_LOCATION = {
  name: 'London',
  country: 'United Kingdom',
  lat: 51.5074,
  lng: -0.1278
};

export default function App() {
  const [sportsList] = useState(SPORTS);
  const [activeSport, setActiveSport] = useState('all');
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedSide, setSelectedSide] = useState('home'); // 'home' | 'away'
  const [userLocation, setUserLocation] = useState(DEFAULT_USER_LOCATION);
  const [activePulses, setActivePulses] = useState([]);
  const [chants, setChants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isFanCardOpen, setIsFanCardOpen] = useState(false);
  const [isSquadOpen, setIsSquadOpen] = useState(false);
  const [activeSquad, setActiveSquad] = useState(null);
  const [isStandsOpen, setIsStandsOpen] = useState(false);
  const [selectedStandId, setSelectedStandId] = useState('criccast');
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isLockerRoomOpen, setIsLockerRoomOpen] = useState(false);
  const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);
  const [isReplayRadarOpen, setIsReplayRadarOpen] = useState(false);
  const [isFollowTeamsOpen, setIsFollowTeamsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isVenueActive, setIsVenueActive] = useState(() => venueGeofence.isVerifiedInVenue());
  const [sessionStats, setSessionStats] = useState({
    totalCheers: 0,
    maxCombo: 0,
    xpEarned: 0,
    reactions: 0,
    chatMessages: 0,
    minutesActive: 1,
    predictionsCorrect: 1,
    ratingsGiven: 0
  });
  const [followedCount, setFollowedCount] = useState(() => teamFollowService.getCount());
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [zenMode, setZenMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('zen') === 'true';
  });
  const [viewMode, setViewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') || 'standard';
  });
  const [pairCodeParam] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('pair') || '';
  });
  const [passportData, setPassportData] = useState(() => passportService.getPassport());
  const [userCheers, setUserCheers] = useState(0);
  const [mobileTab, setMobileTab] = useState('stadium');
  const [mobileCombo, setMobileCombo] = useState(0);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState('connected');

  // Monitor connection status
  useEffect(() => {
    const unsub = onConnectionStatusChange((conn) => {
      setServerStatus(conn.status);
    });
    return () => unsub();
  }, []);

  const handleSelectMobileTab = (tabId) => {
    setMobileTab(tabId);
    if (tabId === 'stadium') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'matches') {
      setIsMatchModalOpen(true);
    } else if (tabId === 'wall') {
      setMobileTab('wall');
    } else if (tabId === 'stats') {
      setIsDossierOpen(true);
    } else if (tabId === 'passport') {
      setIsPassportOpen(true);
    }
  };

  // Zero-Friction Deep-Link Auto-Join (?squad=..., ?match=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const squadParam = params.get('squad');
    if (squadParam) {
      const guestName = localStorage.getItem('fanpulse_username') || `Fan_${Math.floor(100 + Math.random() * 900)}`;
      setActiveSquad({
        code: squadParam.toUpperCase(),
        matchId: 'live',
        creatorId: 'host',
        totalCheers: 24,
        memberCount: 2,
        members: [
          { id: 'host', name: 'Squad Host', avatar: '⚡', cheers: 24, isCreator: true, online: true },
          { id: 'me', name: guestName, avatar: '🦁', cheers: 0, isCreator: false, online: true }
        ],
        feed: [
          { id: '1', type: 'join', text: `🎉 Joined Squad ${squadParam.toUpperCase()} via invite link!` }
        ]
      });
      setIsSquadOpen(true);
      if (socket && socket.connected) {
        socket.emit('squad:join', { code: squadParam.toUpperCase(), userName: guestName, avatar: '🦁' });
      }
    }
  }, []);

  // Track session duration in minutes for Matchday Report
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionStats(prev => ({ ...prev, minutesActive: prev.minutesActive + 1 }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-trigger Matchday Report when live match ends
  const prevMatchStatusRef = useRef(activeMatch?.status);
  useEffect(() => {
    if (prevMatchStatusRef.current === 'in' && activeMatch?.status === 'post') {
      setIsReportOpen(true);
      const homeName = activeMatch.homeTeam?.name || activeMatch.homeTeam || 'Home';
      const awayName = activeMatch.awayTeam?.name || activeMatch.awayTeam || 'Away';
      notificationService.sendMatchEndedAlert(`${homeName} vs ${awayName}`);
    }
    prevMatchStatusRef.current = activeMatch?.status;
  }, [activeMatch?.status]);

  // Theme State (Default to 'light' for bright mobile experience)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fanpulse_theme') || 'light';
  });

  // Match status filter: 'all' | 'live' | 'stumps' | 'pre' | 'post'
  const [statusFilter, setStatusFilter] = useState('all');
  const [tvDelay, setTvDelay] = useState(() => tvSync.getDelay());

  // Sync theme with <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fanpulse_theme', theme);
  }, [theme]);

  // Web Audio unlock on user touch & TV Sync Subscription
  useEffect(() => {
    const unlockAudio = () => {
      soundEngine.init();
      soundEngine.startAmbientCrowd();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);

    const unsubPulse = tvSync.subscribe('pulse', (pulse) => {
      setActivePulses((prev) => [pulse, ...prev.slice(0, 19)]);
    });
    const unsubChant = tvSync.subscribe('chant', (chant) => {
      setChants((prev) => [chant, ...prev.slice(0, 24)]);
    });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      unsubPulse();
      unsubChant();
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch genuine matches from server and ensure activeMatch data updates in real-time
  const loadMatches = useCallback(async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/sports/matches?sport=${activeSport}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);

        // Update activeMatch with latest score & clock from real live data, or pick first live match
        setActiveMatch((current) => {
          if (!current) {
            const firstLive = data.matches.find((m) => m.status === 'in');
            return firstLive || data.matches[0];
          }
          const updated = data.matches.find((m) => m.id === current.id);
          return updated || data.matches[0];
        });
      }
    } catch (err) {
      console.warn('Network issue fetching genuine matches:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeSport]);

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 6000); // Check for score updates every 6 seconds
    return () => clearInterval(interval);
  }, [loadMatches]);

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    await loadMatches();
    setTimeout(() => setIsManualRefreshing(false), 700);
  };

  const handleSelectSport = (sportId) => {
    setActiveSport(sportId);
    const matchesForSport = matches.filter(
      (m) => sportId === 'all' || m.sport.toLowerCase() === sportId.toLowerCase()
    );
    const liveFirst = matchesForSport.find(m => m.status === 'in');
    const upcomingFirst = matchesForSport.find(m => m.status === 'pre');
    const firstMatch = liveFirst || upcomingFirst || matchesForSport[0];
    if (firstMatch) {
      setActiveMatch(firstMatch);
    }
  };

  // Connect to active match room on Socket.io
  useEffect(() => {
    if (!activeMatch) return;

    joinMatchRoom(activeMatch.id);

    const handleInitialState = (initialStats) => {
      setStats(initialStats);
      if (initialStats?.recentChants) {
        setChants(initialStats.recentChants);
      }
    };

    const handleStatsUpdate = (updatedStats) => {
      setStats(updatedStats);
      if (updatedStats?.recentChants) {
        setChants(updatedStats.recentChants);
      }
    };

    const handleCheerPulse = (pulse) => {
      if (tvDelay === 0) {
        setActivePulses((prev) => [pulse, ...prev.slice(0, 19)]);
      } else {
        tvSync.dispatch('pulse', pulse);
      }

      if (pulse.message) {
        const chantObj = {
          id: pulse.id,
          teamName: pulse.teamName,
          teamColor: pulse.teamColor,
          teamSide: pulse.teamSide,
          text: pulse.message,
          city: pulse.city,
          country: pulse.country,
          lat: pulse.lat,
          lng: pulse.lng,
          timestamp: pulse.timestamp
        };
        if (tvDelay === 0) {
          setChants((prev) => [chantObj, ...prev.slice(0, 24)]);
        } else {
          tvSync.dispatch('chant', chantObj);
        }
      }
    };

    socket.on('match:initial_state', handleInitialState);
    socket.on('stats:update', handleStatsUpdate);
    socket.on('cheer:pulse', handleCheerPulse);

    return () => {
      socket.off('match:initial_state', handleInitialState);
      socket.off('stats:update', handleStatsUpdate);
      socket.off('cheer:pulse', handleCheerPulse);
      leaveMatchRoom(activeMatch.id);
    };
  }, [activeMatch?.id]);

  // Dispatch cheer action
  const handleCheerAction = (cheerData) => {
    if (notificationService.shouldPrompt()) {
      notificationService.requestPermission();
    }
    const count = cheerData.count || 1;
    const multiplier = venueGeofence.getXpMultiplier();
    const xpGained = count * 10 * multiplier;

    nativeBridge.queueAction(cheerData, (action) => sendCheer(action));
    setUserCheers(c => c + count);
    const updated = passportService.addCheers(count);
    setPassportData(updated);
    fanEconomy.addXP(xpGained, multiplier > 1 ? '🏟️ Terrace In-Venue Roar (2X XP)' : 'Live Stadium Cheer');
    nativeBridge.triggerScreenFlash();

    // Track real-time session stats for Matchday Report
    setSessionStats(prev => ({
      ...prev,
      totalCheers: prev.totalCheers + count,
      xpEarned: prev.xpEarned + xpGained,
      reactions: cheerData.cheerType === 'silent_reaction' ? prev.reactions + 1 : prev.reactions
    }));
  };

  // Quick Shout from Mobile Bottom Nav
  const handleQuickShout = () => {
    if (!activeMatch) return;
    if (notificationService.shouldPrompt()) {
      notificationService.requestPermission();
    }
    const team = selectedSide === 'home' ? activeMatch.homeTeam : activeMatch.awayTeam;
    const nextStreak = mobileCombo + 1;
    const multiplier = venueGeofence.getXpMultiplier();
    const xpGained = 10 * multiplier;

    setMobileCombo(nextStreak);
    setUserCheers(c => c + 1);
    const updatedPassport = passportService.addCheers(1);
    setPassportData(updatedPassport);
    fanEconomy.addXP(xpGained, multiplier > 1 ? '🏟️ Terrace In-Venue Shout (2X XP)' : 'Live Shout');

    // Track session stats
    setSessionStats(prev => ({
      ...prev,
      totalCheers: prev.totalCheers + 1,
      maxCombo: Math.max(prev.maxCombo, nextStreak),
      xpEarned: prev.xpEarned + xpGained
    }));

    hapticEngine.rumbleTap(nextStreak);
    soundEngine.playTap(nextStreak);
    soundEngine.swellCrowd(Math.min(nextStreak / 15, 1));
    if (nextStreak % 5 === 0) soundEngine.playCrowdRoar();
    if (nextStreak % 10 === 0) hapticEngine.rumbleGoal();

    sendCheer({
      matchId: activeMatch.id,
      teamId: team.id,
      teamSide: selectedSide,
      teamName: team.name,
      teamColor: team.color || '#10B981',
      city: userLocation.name,
      country: userLocation.country,
      lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.02,
      cheerType: 'shout',
      count: nextStreak >= 5 ? 3 : 1
    });

    setTimeout(() => {
      setMobileCombo(0);
    }, 2500);
  };

  const handleMapCityClick = (city) => {
    if (city.lat && city.lng) {
      setUserLocation({
        name: city.name,
        country: city.country || 'Fan Hub',
        lat: city.lat,
        lng: city.lng
      });
    }
  };

  const liveCount = matches.filter((m) => m.status === 'in').length;
  const stumpsCount = matches.filter((m) => m.status === 'stumps' || m.status === 'break').length;
  const preCount = matches.filter((m) => m.status === 'pre').length;
  const postCount = matches.filter((m) => m.status === 'post').length;
  const followedCountMatches = matches.filter((m) => teamFollowService.isMatchFollowed(m)).length;

  const visibleMatches = matches.filter((m) => {
    if (statusFilter === 'my_teams') return teamFollowService.isMatchFollowed(m);
    if (statusFilter === 'live') return m.status === 'in';
    if (statusFilter === 'stumps') return m.status === 'stumps' || m.status === 'break';
    if (statusFilter === 'pre') return m.status === 'pre';
    if (statusFilter === 'post') return m.status === 'post';
    return true;
  });

  if (viewMode === 'overlay' || viewMode === 'stream') {
    return (
      <Suspense fallback={<div className="p-4 text-white font-bold">Loading Stream Overlay...</div>}>
        <StreamOverlayView match={activeMatch} stats={stats} />
      </Suspense>
    );
  }

  if (viewMode === 'tv') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-pitch-950 flex items-center justify-center text-white font-bold">Connecting to Stadium TV Cast...</div>}>
        <TvDisplayView
          match={activeMatch}
          stats={stats}
          onExitTvMode={() => setViewMode('standard')}
        />
      </Suspense>
    );
  }

  if (viewMode === 'remote') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-pitch-950 flex items-center justify-center text-white font-bold">Connecting Mobile Remote...</div>}>
        <MobileRemoteView
          initialPairCode={pairCodeParam}
          onExitRemote={() => setViewMode('standard')}
        />
      </Suspense>
    );
  }

  if (zenMode) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-pitch-950 flex items-center justify-center text-white font-bold">Launching Zen Mode...</div>}>
        <ZenMatchdayMode
          match={activeMatch}
          stats={stats}
          selectedSide={selectedSide}
          onSelectSide={setSelectedSide}
          onCheer={handleCheerAction}
          onOpenSquad={() => setIsSquadOpen(true)}
          onExitZen={() => setZenMode(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-pitch-900 dark:text-white flex flex-col transition-colors duration-300 selection:bg-stadium-turf selection:text-white">
      
      {/* Real-Time Nail-Biter Crunch Time Alert Banner */}
      <CrunchTimeAlert
        onJumpIn={(matchId) => {
          const m = matches.find((x) => x.id === matchId);
          if (m) setActiveMatch(m);
        }}
        currentMatchId={activeMatch?.id}
      />

      {/* Top Navigation */}
      <Navbar
        onOpenServerModal={() => setIsServerModalOpen(true)}
        serverStatus={serverStatus}
        onOpenMobileDrawer={() => setIsDrawerModalOpen(true)}
        onOpenPassport={() => setIsPassportOpen(true)}
        onOpenSquad={() => setIsSquadOpen(true)}
        onOpenStands={() => setIsStandsOpen(true)}
        onOpenLockerRoom={() => setIsLockerRoomOpen(true)}
        onOpenCosmetics={() => setIsCosmeticsOpen(true)}
        onOpenFollowTeams={() => {
          setIsFollowTeamsOpen(true);
          setFollowedCount(teamFollowService.getCount());
        }}
        followedCount={followedCount}
        onOpenVenueGeofence={() => setIsVenueModalOpen(true)}
        isVenueActive={isVenueActive}
        onOpenStreamOverlay={() => setIsStreamModalOpen(true)}
        isSilentMode={isSilentMode}
        onToggleSilentMode={() => {
          const s = !isSilentMode;
          setIsSilentMode(s);
          soundEngine.toggleMute(s);
        }}
        onToggleTvMode={() => setViewMode('tv')}
        onToggleZenMode={() => setZenMode((prev) => !prev)}
        activeSquadCode={activeSquad?.code}
        sports={sportsList}
        activeSport={activeSport}
        onSelectSport={handleSelectSport}
        matches={visibleMatches}
        activeMatch={activeMatch}
        onSelectMatch={setActiveMatch}
        userLocation={userLocation}
        onSelectLocation={setUserLocation}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Responsive Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-4 pb-24 md:pb-8">
        
        {/* Status Quick Filters */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <div className="flex items-center gap-1 bg-white dark:bg-pitch-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs shadow-bright-sm dark:shadow-md overflow-x-auto max-w-full">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition active:scale-95 ${
                statusFilter === 'all' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({matches.length})
            </button>

            {followedCountMatches > 0 && (
              <button
                onClick={() => {
                  setStatusFilter('my_teams');
                  const firstFollowed = matches.find((m) => teamFollowService.isMatchFollowed(m));
                  if (firstFollowed) setActiveMatch(firstFollowed);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition active:scale-95 ${
                  statusFilter === 'my_teams' 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <span>❤️ My Teams ({followedCountMatches})</span>
              </button>
            )}

            <button
              onClick={() => {
                setStatusFilter('live');
                const firstLive = matches.find((m) => m.status === 'in');
                if (firstLive) setActiveMatch(firstLive);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition active:scale-95 ${
                statusFilter === 'live' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
              <span>🔴 Live ({liveCount})</span>
            </button>

            {stumpsCount > 0 && (
              <button
                onClick={() => {
                  setStatusFilter('stumps');
                  const firstStump = matches.find((m) => m.status === 'stumps' || m.status === 'break');
                  if (firstStump) setActiveMatch(firstStump);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition active:scale-95 ${
                  statusFilter === 'stumps' 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <span>⏸️ Stumps ({stumpsCount})</span>
              </button>
            )}

            <button
              onClick={() => {
                setStatusFilter('pre');
                const firstUpcoming = matches.find((m) => m.status === 'pre');
                if (firstUpcoming) setActiveMatch(firstUpcoming);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition active:scale-95 ${
                statusFilter === 'pre' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
              }`}
            >
              <span>⏰ Upcoming ({preCount})</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('post');
                const firstFinal = matches.find((m) => m.status === 'post');
                if (firstFinal) setActiveMatch(firstFinal);
              }}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition active:scale-95 ${
                statusFilter === 'post' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-pitch-700'
              }`}
            >
              🏁 Finals ({postCount})
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${liveCount > 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
            <span>
              {liveCount > 0 ? (
                <span><strong>{liveCount}</strong> Live In Progress • Auto-Refreshing</span>
              ) : (
                <span><strong>0</strong> Live Now • Live Scores Auto-Refresh</span>
              )}
            </span>
          </div>
        </div>

        {/* Informative banner if selected sport has 0 live matches right now */}
        {activeSport !== 'all' && liveCount === 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-sm flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">ℹ️</span>
              <span>
                No <strong>{activeSport.toUpperCase()}</strong> matches are in-play at this moment. Showing upcoming scheduled games and recent results.
              </span>
            </div>
            <span className="font-semibold text-[11px] text-amber-700 dark:text-amber-400">
              Live updates activate automatically when kickoff begins.
            </span>
          </div>
        )}

        {/* Brand New: Interactive Scrollable Live Matches Carousel */}
        <LiveMatchCarousel
          matches={visibleMatches}
          activeMatch={activeMatch}
          onSelectMatch={setActiveMatch}
          onOpenMatchList={() => setIsMatchModalOpen(true)}
          onRefresh={handleManualRefresh}
          isRefreshing={isManualRefreshing}
        />

        {isLoading || !activeMatch ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] text-center">
            <div className="w-12 h-12 border-4 border-stadium-turf dark:border-stadium-neon border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Connecting to global live fan network...</p>
          </div>
        ) : (
          <>
            {/* Live Score Header */}
            <ScoreHeader
              match={activeMatch}
              stats={stats}
              selectedSide={selectedSide}
              onSelectSide={setSelectedSide}
              onOpenFanCard={() => setIsFanCardOpen(true)}
            />

            {/* Quick Strategic Feature Action Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <button
                onClick={() => setIsDossierOpen(true)}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 hover:border-stadium-turf text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>📋</span>
                <span className="truncate">Match Dossier</span>
              </button>

              <button
                onClick={() => setIsReplayRadarOpen(true)}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 hover:border-sky-500 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>🎬</span>
                <span className="truncate">Replay Radar</span>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>📊</span>
                <span className="truncate">Match Report</span>
              </button>

              <button
                onClick={() => {
                  setIsFollowTeamsOpen(true);
                  setFollowedCount(teamFollowService.getCount());
                }}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 hover:border-rose-500 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>❤️</span>
                <span className="truncate">Follow Teams</span>
              </button>

              <button
                onClick={() => setIsCosmeticsOpen(true)}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 hover:border-purple-500 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>✨</span>
                <span className="truncate">Fan XP & Gear</span>
              </button>

              <button
                onClick={() => setIsLockerRoomOpen(true)}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-pitch-800 border border-slate-200/80 dark:border-white/10 hover:border-amber-500 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>🚪</span>
                <span className="truncate">The Locker Room</span>
              </button>
            </div>

            {/* Live Momentum ECG Waveform & TV Sync Controller */}
            <MomentumWaveform
              match={activeMatch}
              stats={stats}
              tvDelay={tvDelay}
              onTvDelayChange={setTvDelay}
            />

            {/* AI Tactical Pocket Analyst */}
            <TacticalAnalyst match={activeMatch} />

            {/* Flash Predictions (Zero-Stake Micro-Poll) */}
            <FlashPredictions
              match={activeMatch}
              userLocation={userLocation}
            />

            {/* Dynamic Club Anthems & Crowd Sing-Along Chant Choir */}
            <ChantChoir
              match={activeMatch}
              onCheer={handleCheerAction}
            />

            {/* Unified Responsive Interactive Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 md:gap-5">
              
              {/* Primary Column: Map + Cheer Deck (Stadium View) */}
              <div className={`md:col-span-8 flex flex-col gap-4 ${mobileTab === 'wall' ? 'hidden md:flex' : 'flex'}`}>
                <FanMap
                  match={activeMatch}
                  stats={stats}
                  userLocation={userLocation}
                  activePulses={activePulses}
                  onMapCityClick={handleMapCityClick}
                  theme={theme}
                />
                
                {/* Cheer Deck (Under map) */}
                <div className="block">
                  <CheerControls
                    match={activeMatch}
                    selectedSide={selectedSide}
                    onSelectSide={setSelectedSide}
                    userLocation={userLocation}
                    onCheer={handleCheerAction}
                  />
                </div>
              </div>

              {/* Live Feed & Stadium Wall (Right column on desktop, mobile 'wall' tab) */}
              <div className={`md:col-span-4 ${mobileTab === 'wall' ? 'block animate-fadeIn' : 'hidden md:block'}`}>
                <LiveFeedSidebar
                  match={activeMatch}
                  stats={stats}
                  chants={chants}
                  onCityClick={handleMapCityClick}
                  userName={localStorage.getItem('fanpulse_username') || undefined}
                  onChatMessageSent={() => setSessionStats(prev => ({ ...prev, chatMessages: prev.chatMessages + 1 }))}
                />
              </div>

            </div>
          </>
        )}

      </main>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        onQuickShout={handleQuickShout}
        comboStreak={mobileCombo}
        activeMatch={activeMatch}
        selectedSide={selectedSide}
      />

      {/* Footer */}
      <footer className="hidden md:block bg-white dark:bg-pitch-950 border-t border-slate-200 dark:border-white/5 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-500 transition-colors">
        <p>FanPulse • Global Sports Fan Cheer Map • Live Feeds & Telemetry</p>
      </footer>

      {/* Code-Split Secondary Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {/* Full Searchable Match Directory Modal / Drawer */}
        <MatchListModal
          isOpen={isMatchModalOpen}
          onClose={() => {
            setIsMatchModalOpen(false);
            setMobileTab('stadium');
          }}
          matches={visibleMatches}
          activeMatch={activeMatch}
          onSelectMatch={setActiveMatch}
          sports={sportsList}
          activeSport={activeSport}
          onSelectSport={handleSelectSport}
        />

        {/* Superfan Passport Modal */}
        <SuperfanPassport
          isOpen={isPassportOpen}
          onClose={() => {
            setIsPassportOpen(false);
            setMobileTab('stadium');
          }}
          passportData={passportData}
        />

        {/* Viral Fan Card Modal */}
        <FanCardModal
          isOpen={isFanCardOpen}
          onClose={() => setIsFanCardOpen(false)}
          match={activeMatch}
          stats={stats}
          userLocation={userLocation}
          userCheers={userCheers}
        />

        {/* Squad Watch Rooms & Walkie-Talkie Banter Modal */}
        <SquadWatchModal
          isOpen={isSquadOpen}
          onClose={() => setIsSquadOpen(false)}
          activeSquad={activeSquad}
          onUpdateSquad={setActiveSquad}
        />

        {/* Creator Stadium Stands & Leaderboard Modal */}
        <CreatorStandsModal
          isOpen={isStandsOpen}
          onClose={() => setIsStandsOpen(false)}
          selectedStandId={selectedStandId}
          onSelectStand={setSelectedStandId}
        />

        {/* Match Intelligence Dossier Modal */}
        <MatchDossier
          isOpen={isDossierOpen}
          onClose={() => {
            setIsDossierOpen(false);
            setMobileTab('stadium');
          }}
          match={activeMatch || matches[0]}
        />

        {/* The Locker Room Off-Matchday Hub */}
        <TheLockerRoom
          isOpen={isLockerRoomOpen}
          onClose={() => setIsLockerRoomOpen(false)}
        />

        {/* Fan XP & Stadium Cosmetics Modal */}
        <StadiumCosmeticsModal
          isOpen={isCosmeticsOpen}
          onClose={() => setIsCosmeticsOpen(false)}
        />

        {/* Live Replay Radar Modal */}
        <ReplayRadar
          isOpen={isReplayRadarOpen}
          onClose={() => setIsReplayRadarOpen(false)}
          match={activeMatch}
        />

        {/* Follow Teams Modal */}
        <FollowTeamsModal
          isOpen={isFollowTeamsOpen}
          onClose={() => {
            setIsFollowTeamsOpen(false);
            setFollowedCount(teamFollowService.getCount());
          }}
          matches={matches}
        />

        {/* Matchday Report Modal */}
        <MatchdayReport
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          match={activeMatch}
          sessionStats={sessionStats}
          userLocation={userLocation}
        />

        {/* Stadium & Terrace Proximity Geofencing Modal */}
        <VenueGeofenceModal
          isOpen={isVenueModalOpen}
          onClose={() => setIsVenueModalOpen(false)}
          userLocation={userLocation}
          onVenueUpdated={(v) => setIsVenueActive(!!v)}
        />

        {/* Creator OBS Stream Overlay Modal */}
        <StreamOverlayModal
          isOpen={isStreamModalOpen}
          onClose={() => setIsStreamModalOpen(false)}
          activeMatch={activeMatch}
        />

        {/* Server Connection Status & Settings Modal */}
        <ServerConnectionModal
          isOpen={isServerModalOpen}
          onClose={() => setIsServerModalOpen(false)}
          onServerChanged={() => {
            loadMatches();
          }}
        />

        {/* Mobile Stadium Hub Bottom Sheet Drawer */}
        <MobileDrawerModal
          isOpen={isDrawerModalOpen}
          onClose={() => setIsDrawerModalOpen(false)}
          onOpenServerSettings={() => setIsServerModalOpen(true)}
          serverStatus={serverStatus}
          onOpenFollowTeams={() => {
            setIsFollowTeamsOpen(true);
            setFollowedCount(teamFollowService.getCount());
          }}
          followedCount={followedCount}
          onOpenVenueGeofence={() => setIsVenueModalOpen(true)}
          isVenueActive={isVenueActive}
          onOpenStreamOverlay={() => setIsStreamModalOpen(true)}
          onOpenPassport={() => setIsPassportOpen(true)}
          onOpenSquad={() => setIsSquadOpen(true)}
          activeSquadCode={activeSquad?.code}
          onOpenStands={() => setIsStandsOpen(true)}
          onOpenLockerRoom={() => setIsLockerRoomOpen(true)}
          onOpenCosmetics={() => setIsCosmeticsOpen(true)}
          onToggleTvMode={() => setViewMode('tv')}
          onToggleZenMode={() => setZenMode((prev) => !prev)}
          isSilentMode={isSilentMode}
          onToggleSilentMode={() => {
            const s = !isSilentMode;
            setIsSilentMode(s);
            soundEngine.toggleMute(s);
          }}
          isMuted={soundEngine.isMuted}
          onToggleMute={() => {
            const m = soundEngine.toggleMute();
            if (!m) soundEngine.playAirhorn();
          }}
          onOpenReplayRadar={() => setIsReplayRadarOpen(true)}
        />
      </Suspense>

      {/* Stealth Silent Mode Overlay */}
      <StealthSilentMode
        isSilent={isSilentMode}
        onToggleSilent={() => {
          setIsSilentMode(false);
          soundEngine.toggleMute(false);
        }}
        onSendSilentReaction={(item) => {
          handleCheerAction({
            matchId: activeMatch?.id,
            teamSide: selectedSide,
            teamName: selectedSide === 'home' ? (activeMatch?.homeTeam?.name || activeMatch?.homeTeam) : (activeMatch?.awayTeam?.name || activeMatch?.awayTeam),
            cheerType: 'silent_reaction',
            count: 3
          });
        }}
      />
    </div>
  );
}
