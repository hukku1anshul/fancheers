// Squad Watch Rooms Manager
// Handles private squad creation, member rosters, cheer aggregation, and walkie-talkie audio bursts.

class SquadManager {
  constructor() {
    this.squads = new Map(); // code -> squadObject
    this.socketToSquad = new Map(); // socketId -> Set of squad codes
  }

  generateCode(prefix = 'SQUAD') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const fullCode = `${prefix.substring(0, 3).toUpperCase()}-${code}`;
    return fullCode;
  }

  createSquad(socketId, { matchId = 'live', userName = 'Fan', avatar = '⚡' }) {
    const code = this.generateCode('FAN');
    const squad = {
      code,
      matchId,
      creatorId: socketId,
      createdAt: Date.now(),
      totalCheers: 0,
      members: new Map(),
      feed: [
        {
          id: `feed_${Date.now()}`,
          type: 'system',
          text: `🎉 Squad ${code} created by ${userName}! Share code to invite friends.`,
          time: Date.now()
        }
      ]
    };

    squad.members.set(socketId, {
      id: socketId,
      name: userName,
      avatar,
      cheers: 0,
      isCreator: true,
      online: true,
      joinedAt: Date.now()
    });

    this.squads.set(code, squad);
    this._mapSocket(socketId, code);

    return this.serializeSquad(squad);
  }

  joinSquad(socketId, { code, userName = 'Fan', avatar = '🦁' }) {
    const normalizedCode = code ? code.trim().toUpperCase() : '';
    let squad = this.squads.get(normalizedCode);

    // If squad doesn't exist, create it on-demand for smooth friend onboarding
    if (!squad) {
      squad = {
        code: normalizedCode || this.generateCode('CREW'),
        matchId: 'live',
        creatorId: socketId,
        createdAt: Date.now(),
        totalCheers: 0,
        members: new Map(),
        feed: []
      };
      this.squads.set(squad.code, squad);
    }

    squad.members.set(socketId, {
      id: socketId,
      name: userName,
      avatar,
      cheers: 0,
      isCreator: squad.creatorId === socketId,
      online: true,
      joinedAt: Date.now()
    });

    squad.feed.unshift({
      id: `feed_${Date.now()}`,
      type: 'join',
      text: `👋 ${userName} hopped into the squad!`,
      time: Date.now()
    });
    if (squad.feed.length > 20) squad.feed.pop();

    this._mapSocket(socketId, squad.code);

    return this.serializeSquad(squad);
  }

  leaveSquad(socketId, code) {
    const squad = this.squads.get(code);
    if (!squad) return null;

    const member = squad.members.get(socketId);
    squad.members.delete(socketId);

    if (member) {
      squad.feed.unshift({
        id: `feed_${Date.now()}`,
        type: 'leave',
        text: `🚪 ${member.name} left the squad.`,
        time: Date.now()
      });
    }

    if (squad.members.size === 0) {
      // Retain for 30 minutes in case friends reconnect
      setTimeout(() => {
        if (this.squads.get(code)?.members.size === 0) {
          this.squads.delete(code);
        }
      }, 1800000);
    }

    this._unmapSocket(socketId, code);
    return this.serializeSquad(squad);
  }

  addCheer(socketId, { code, count = 1, side = 'home' }) {
    const squad = this.squads.get(code);
    if (!squad) return null;

    squad.totalCheers += count;
    const member = squad.members.get(socketId);
    if (member) {
      member.cheers += count;
    }

    // Add activity notice every 10 cheers
    if (member && member.cheers % 10 === 0) {
      squad.feed.unshift({
        id: `feed_${Date.now()}`,
        type: 'cheer',
        text: `🔥 ${member.name} surged to ${member.cheers} roars!`,
        time: Date.now()
      });
      if (squad.feed.length > 20) squad.feed.pop();
    }

    return {
      code,
      totalCheers: squad.totalCheers,
      memberCheers: member?.cheers || count,
      memberName: member?.name || 'Friend',
      side
    };
  }

  recordAudioBurst(socketId, { code, duration = 2, audioData, userName, avatar }) {
    const squad = this.squads.get(code);
    if (!squad) return null;

    const member = squad.members.get(socketId);
    const senderName = userName || member?.name || 'Teammate';
    const senderAvatar = avatar || member?.avatar || '🎙️';

    squad.feed.unshift({
      id: `feed_${Date.now()}`,
      type: 'audio',
      text: `🎙️ ${senderName} broadcast a ${Math.round(duration)}s walkie-talkie roar!`,
      time: Date.now()
    });
    if (squad.feed.length > 20) squad.feed.pop();

    return {
      id: `burst_${Date.now()}`,
      code,
      senderId: socketId,
      senderName,
      senderAvatar,
      duration,
      audioData, // Base64 audio or procedural chirp payload
      timestamp: Date.now()
    };
  }

  getSquad(code) {
    const squad = this.squads.get(code);
    return squad ? this.serializeSquad(squad) : null;
  }

  handleDisconnect(socketId) {
    const squadCodes = this.socketToSquad.get(socketId);
    if (!squadCodes) return [];

    const updatedSquads = [];
    for (const code of squadCodes) {
      const updated = this.leaveSquad(socketId, code);
      if (updated) updatedSquads.push(updated);
    }
    this.socketToSquad.delete(socketId);
    return updatedSquads;
  }

  _mapSocket(socketId, code) {
    if (!this.socketToSquad.has(socketId)) {
      this.socketToSquad.set(socketId, new Set());
    }
    this.socketToSquad.get(socketId).add(code);
  }

  _unmapSocket(socketId, code) {
    if (this.socketToSquad.has(socketId)) {
      this.socketToSquad.get(socketId).delete(code);
    }
  }

  serializeSquad(squad) {
    return {
      code: squad.code,
      matchId: squad.matchId,
      creatorId: squad.creatorId,
      totalCheers: squad.totalCheers,
      memberCount: squad.members.size,
      members: Array.from(squad.members.values()),
      feed: squad.feed.slice(0, 15)
    };
  }
}

export const squadManager = new SquadManager();
