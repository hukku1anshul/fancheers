class TvSyncService {
  constructor() {
    this.delaySeconds = typeof window !== 'undefined' 
      ? parseInt(localStorage.getItem('fanpulse_tv_delay') || '0', 10) 
      : 0;
    this.queue = [];
    this.listeners = {
      pulse: new Set(),
      chant: new Set(),
      score: new Set()
    };
    this.timer = null;
    this.startWorker();
  }

  getDelay() {
    return this.delaySeconds;
  }

  setDelay(seconds) {
    this.delaySeconds = Math.max(0, Math.min(60, Math.round(seconds)));
    if (typeof window !== 'undefined') {
      localStorage.setItem('fanpulse_tv_delay', this.delaySeconds.toString());
    }
    // If delay reset to 0, flush queue immediately
    if (this.delaySeconds === 0) {
      this.flushQueue();
    }
    return this.delaySeconds;
  }

  formatDelayLabel() {
    if (this.delaySeconds === 0) return 'Live (0s)';
    return `+${this.delaySeconds}s (Synced)`;
  }

  subscribe(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type].add(callback);
      return () => this.listeners[type].delete(callback);
    }
    return () => {};
  }

  dispatch(type, payload) {
    if (this.delaySeconds === 0) {
      // Immediate delivery
      this.emit(type, payload);
    } else {
      // Queue for delayed delivery
      this.queue.push({
        type,
        payload,
        executeAt: Date.now() + this.delaySeconds * 1000
      });
    }
  }

  emit(type, payload) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(cb => {
        try { cb(payload); } catch (e) {}
      });
    }
  }

  flushQueue() {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      this.emit(item.type, item.payload);
    }
  }

  startWorker() {
    if (typeof window === 'undefined') return;
    setInterval(() => {
      if (this.queue.length === 0) return;
      const now = Date.now();
      while (this.queue.length > 0 && this.queue[0].executeAt <= now) {
        const item = this.queue.shift();
        this.emit(item.type, item.payload);
      }
    }, 100);
  }
}

export const tvSync = new TvSyncService();
