import { io } from 'socket.io-client';

export const SERVER_STORAGE_KEY = 'fanpulse_server_url';
export const DEFAULT_PRODUCTION_URL = 'https://fancheers.onrender.com';
export const DEFAULT_EMULATOR_URL = 'http://10.0.2.2:3001';
export const DEFAULT_LOCAL_URL = 'http://localhost:3001';

/**
 * Resolves the primary active backend URL
 */
export function getActiveServerUrl() {
  if (typeof window === 'undefined') return DEFAULT_LOCAL_URL;

  // 1. User customized override in localStorage
  const saved = localStorage.getItem(SERVER_STORAGE_KEY);
  if (saved && saved.trim()) {
    return saved.trim().replace(/\/+$/, '');
  }

  // 2. Native Android / iOS app
  if (window.Capacitor?.isNativePlatform?.()) {
    // Default to production cloud, fallback to emulator if explicitly set
    return DEFAULT_PRODUCTION_URL;
  }

  // 3. Browser environment
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Vite dev server proxy or direct port 3001
    return window.location.port === '5173' ? '' : window.location.origin;
  }

  // Production Render deployment (same-origin)
  return window.location.origin;
}

export function setActiveServerUrl(newUrl) {
  if (!newUrl || !newUrl.trim()) {
    localStorage.removeItem(SERVER_STORAGE_KEY);
  } else {
    localStorage.setItem(SERVER_STORAGE_KEY, newUrl.trim().replace(/\/+$/, ''));
  }
  reconnectSocket();
}

export function getApiBaseUrl() {
  const url = getActiveServerUrl();
  // If same origin in browser, use relative paths
  if (typeof window !== 'undefined' && !window.Capacitor?.isNativePlatform?.()) {
    if (url === window.location.origin || url === '') {
      return '';
    }
  }
  return url;
}

export function getSocketUrl() {
  const url = getActiveServerUrl();
  if (!url) {
    if (typeof window !== 'undefined') return window.location.origin;
    return DEFAULT_LOCAL_URL;
  }
  return url;
}

// Global socket instance
let socket = createSocketInstance(getSocketUrl());
const connectionListeners = new Set();

function createSocketInstance(targetUrl) {
  const isHttps = targetUrl.startsWith('https://');
  const instance = io(targetUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
    secure: isHttps,
    rejectUnauthorized: false
  });

  instance.on('connect', () => {
    notifyListeners({ status: 'connected', url: targetUrl });
  });

  instance.on('disconnect', (reason) => {
    notifyListeners({ status: 'disconnected', reason, url: targetUrl });
  });

  instance.on('connect_error', (err) => {
    notifyListeners({ status: 'error', error: err.message, url: targetUrl });
  });

  return instance;
}

function notifyListeners(payload) {
  for (const listener of connectionListeners) {
    try {
      listener(payload);
    } catch (e) {
      console.warn('Listener error:', e);
    }
  }
}

export function onConnectionStatusChange(listener) {
  connectionListeners.add(listener);
  // Emit current status immediately
  listener({
    status: socket.connected ? 'connected' : 'connecting',
    url: getSocketUrl()
  });
  return () => connectionListeners.delete(listener);
}

export function reconnectSocket(overrideUrl = null) {
  try {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
  } catch (e) {
    console.warn('Error disconnecting socket:', e);
  }

  const target = overrideUrl || getSocketUrl();
  socket = createSocketInstance(target);
  return socket;
}

export const getSocket = () => socket;
export { socket };

export function joinMatchRoom(matchId) {
  if (socket.connected) {
    socket.emit('join:match', { matchId });
  } else {
    socket.once('connect', () => {
      socket.emit('join:match', { matchId });
    });
  }
}

export function leaveMatchRoom(matchId) {
  if (socket.connected) {
    socket.emit('leave:match', { matchId });
  }
}

// Client-Side Batching: Accumulate rapid taps over 300ms window into a single batch
let pendingBatch = null;
let batchTimer = null;

function flushBatch() {
  if (pendingBatch && socket.connected) {
    socket.emit('cheer:send', pendingBatch);
    pendingBatch = null;
  }
  batchTimer = null;
}

export function sendCheer(cheerData) {
  if (cheerData.message || cheerData.cheerType === 'chant') {
    if (socket.connected) socket.emit('cheer:send', cheerData);
    return;
  }

  if (!pendingBatch) {
    pendingBatch = { ...cheerData, count: cheerData.count || 1 };
  } else if (pendingBatch.matchId === cheerData.matchId && pendingBatch.teamSide === cheerData.teamSide) {
    pendingBatch.count += (cheerData.count || 1);
    pendingBatch.timestamp = Date.now();
  } else {
    flushBatch();
    pendingBatch = { ...cheerData, count: cheerData.count || 1 };
  }

  if (!batchTimer) {
    batchTimer = setTimeout(flushBatch, 300);
  }
}

/**
 * Helper to ping server and check latency
 */
export async function testServerLatency(targetUrl) {
  const start = Date.now();
  const cleanUrl = (targetUrl || getApiBaseUrl()).replace(/\/+$/, '');
  const testEndpoint = `${cleanUrl}/api/health`;
  try {
    const res = await fetch(testEndpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, latencyMs: Date.now() - start, data };
  } catch (err) {
    return { ok: false, error: err.message, latencyMs: Date.now() - start };
  }
}
