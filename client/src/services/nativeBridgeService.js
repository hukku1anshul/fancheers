// Progressive Native Bridge
// Overcomes iOS Safari and mobile web browser constraints:
// 1. AudioContext auto-recovery on visibilitychange (when phone unlocks)
// 2. Offline cheer action queue & auto-reconnect flush
// 3. Fallback screen haptic flash for iOS devices without Web Vibration API

import { soundEngine } from './soundEffects';

class NativeBridgeService {
  constructor() {
    this.offlineQueue = [];
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.listeners = [];

    if (typeof window !== 'undefined') {
      this.initListeners();
    }
  }

  initListeners() {
    // 1. Visibility change listener (phone lock / wake)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleWakeUp();
      }
    });

    // 2. Online / Offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  handleWakeUp() {
    // Resume Web Audio Context if suspended
    if (soundEngine?.ctx && soundEngine.ctx.state === 'suspended') {
      soundEngine.ctx.resume().catch(() => {});
    }

    // Flush any pending cheers
    this.flushOfflineQueue();

    // Notify listeners
    this.listeners.forEach(cb => cb({ type: 'wake' }));
  }

  // Queue cheers if disconnected
  queueAction(action, flushCallback) {
    if (this.isOnline) {
      flushCallback(action);
    } else {
      this.offlineQueue.push({ action, callback: flushCallback });
    }
  }

  flushOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    const queued = [...this.offlineQueue];
    this.offlineQueue = [];
    queued.forEach(item => {
      try { item.callback(item.action); } catch (e) {}
    });
  }

  // Fallback Screen Haptic Flash (for iOS Safari where navigator.vibrate is disabled)
  triggerScreenFlash(intensity = 'medium') {
    if (typeof document === 'undefined') return;

    // Check if real vibration works
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(intensity === 'heavy' ? [50, 40, 50] : [25]);
      } catch (e) {}
    }

    // Always trigger visual screen edge pulse for sensory reinforcement
    const flashEl = document.createElement('div');
    flashEl.style.position = 'fixed';
    flashEl.style.inset = '0';
    flashEl.style.pointerEvents = 'none';
    flashEl.style.zIndex = '99999';
    flashEl.style.transition = 'opacity 0.2s ease-out';
    flashEl.style.opacity = intensity === 'heavy' ? '0.35' : '0.2';
    flashEl.style.boxShadow = 'inset 0 0 40px rgba(16, 185, 129, 0.8)';

    document.body.appendChild(flashEl);
    setTimeout(() => {
      flashEl.style.opacity = '0';
      setTimeout(() => flashEl.remove(), 250);
    }, 80);
  }

  onWake(callback) {
    this.listeners.push(callback);
  }
}

export const nativeBridge = new NativeBridgeService();
