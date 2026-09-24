class HapticEngine {
  constructor() {
    this.isEnabled = true;
    this.hasVibrate = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  toggle(enabled) {
    this.isEnabled = enabled !== undefined ? enabled : !this.isEnabled;
    return this.isEnabled;
  }

  // Micro-tick on cheer tap, scaling gently with streak
  rumbleTap(streak = 1) {
    if (!this.isEnabled || !this.hasVibrate) return;
    try {
      if (streak >= 15) {
        navigator.vibrate([25, 20, 35]);
      } else if (streak >= 8) {
        navigator.vibrate(25);
      } else {
        navigator.vibrate(12);
      }
    } catch (e) {}
  }

  // Heavy celebratory vibration sequence for goals, sixes, grand slams, touchdowns
  rumbleGoal() {
    if (!this.isEnabled || !this.hasVibrate) return;
    try {
      navigator.vibrate([100, 50, 180, 60, 350, 80, 500]);
    } catch (e) {}
  }

  // Crisp double-thump for tense moments or heartbeat
  rumbleHeartbeat() {
    if (!this.isEnabled || !this.hasVibrate) return;
    try {
      navigator.vibrate([45, 100, 65]);
    } catch (e) {}
  }

  // Referee whistle or alert rumble
  rumbleWhistle() {
    if (!this.isEnabled || !this.hasVibrate) return;
    try {
      navigator.vibrate([150, 50, 200]);
    } catch (e) {}
  }

  // Rapid flutter for combo streaks or chant launch
  rumbleComboBurst() {
    if (!this.isEnabled || !this.hasVibrate) return;
    try {
      navigator.vibrate([20, 30, 20, 30, 40, 30, 80]);
    } catch (e) {}
  }
}

export const hapticEngine = new HapticEngine();
