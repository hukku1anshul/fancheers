import { io } from 'socket.io-client';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return 'http://10.0.2.2:3001';
  }
  return '';
};

export const getSocketUrl = () => {
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return 'http://10.0.2.2:3001';
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export const getSocket = () => socket;

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
  // If it's a chant with custom message, send immediately
  if (cheerData.message || cheerData.cheerType === 'chant') {
    if (socket.connected) socket.emit('cheer:send', cheerData);
    return;
  }

  // Aggregate standard taps
  if (!pendingBatch) {
    pendingBatch = { ...cheerData, count: cheerData.count || 1 };
  } else if (pendingBatch.matchId === cheerData.matchId && pendingBatch.teamSide === cheerData.teamSide) {
    pendingBatch.count += (cheerData.count || 1);
    pendingBatch.timestamp = Date.now();
  } else {
    // Different team or match, flush current and start new
    flushBatch();
    pendingBatch = { ...cheerData, count: cheerData.count || 1 };
  }

  if (!batchTimer) {
    batchTimer = setTimeout(flushBatch, 300);
  }
}
