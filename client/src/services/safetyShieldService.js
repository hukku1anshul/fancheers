// Automated Trust & Safety Shield
// Safeguards squads and live rooms from toxicity, audio spam, and abuse.

const BLOCKED_WORDS = [
  'cheat', 'corrupt', 'scam', 'hate', 'trash', 'idiot', 'moron', 'clown', 'rigged',
  'abuse', 'kill', 'die', 'threat', 'bastard', 'fuck', 'shit', 'bitch', 'asshole'
];

class SafetyShieldService {
  constructor() {
    this.lastBurstTime = 0;
    this.burstCooldownMs = 3500; // 3.5s cooldown between chirps
    this.mutedUsers = new Set();
    this.reportedUsers = new Set();
  }

  // Filter text to censor profanities and slurs
  sanitizeText(input = '') {
    if (!input || typeof input !== 'string') return '';
    let result = input;
    for (const word of BLOCKED_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, '***');
    }
    return result;
  }

  // Check if an audio burst is permitted under acoustic limiter rate-limits
  canSendAudioBurst() {
    const now = Date.now();
    const elapsed = now - this.lastBurstTime;
    if (elapsed < this.burstCooldownMs) {
      const waitSeconds = Math.ceil((this.burstCooldownMs - elapsed) / 1000);
      return { allowed: false, error: `Acoustic limiter active. Please wait ${waitSeconds}s before chirping.` };
    }
    this.lastBurstTime = now;
    return { allowed: true };
  }

  // Host Controls: Mute & Kick
  muteUser(userId) {
    this.mutedUsers.add(userId);
  }

  unmuteUser(userId) {
    this.mutedUsers.delete(userId);
  }

  isUserMuted(userId) {
    return this.mutedUsers.has(userId);
  }

  reportUser(userId, reason = 'abusive behavior') {
    this.reportedUsers.add(userId);
    this.muteUser(userId);
    return { success: true, message: `Report submitted. User ${userId} has been locally muted.` };
  }
}

export const safetyShield = new SafetyShieldService();
