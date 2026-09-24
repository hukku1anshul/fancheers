// Pairing Manager for Living Room TV Mode
// Connects TV big-screen displays with mobile haptic remote controllers.

class PairingManager {
  constructor() {
    this.sessions = new Map(); // pairCode -> session
    this.tvToPairCode = new Map(); // tvSocketId -> pairCode
    this.remoteToPairCode = new Map(); // remoteSocketId -> pairCode
  }

  generatePairCode() {
    const digits = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  createTvSession(tvSocketId, matchId = 'live') {
    // Check if TV already has an active code
    let code = this.tvToPairCode.get(tvSocketId);
    if (!code) {
      code = this.generatePairCode();
      this.tvToPairCode.set(tvSocketId, code);
    }

    const session = {
      code,
      tvSocketId,
      matchId,
      createdAt: Date.now(),
      remotes: new Set()
    };

    this.sessions.set(code, session);
    return {
      pairCode: code,
      matchId,
      connectedRemotes: 0
    };
  }

  pairRemote(remoteSocketId, pairCode) {
    const normalized = (pairCode || '').trim().toUpperCase();
    const session = this.sessions.get(normalized);

    if (!session) {
      return { success: false, error: 'Invalid pairing code. Check TV screen.' };
    }

    session.remotes.add(remoteSocketId);
    this.remoteToPairCode.set(remoteSocketId, normalized);

    return {
      success: true,
      pairCode: normalized,
      tvSocketId: session.tvSocketId,
      matchId: session.matchId,
      connectedRemotes: session.remotes.size
    };
  }

  getSessionByRemote(remoteSocketId) {
    const code = this.remoteToPairCode.get(remoteSocketId);
    return code ? this.sessions.get(code) : null;
  }

  getSession(pairCode) {
    return this.sessions.get((pairCode || '').trim().toUpperCase());
  }

  handleDisconnect(socketId) {
    // If TV disconnected
    const tvCode = this.tvToPairCode.get(socketId);
    if (tvCode) {
      this.sessions.delete(tvCode);
      this.tvToPairCode.delete(socketId);
      return { type: 'tv_closed', pairCode: tvCode };
    }

    // If Remote disconnected
    const remoteCode = this.remoteToPairCode.get(socketId);
    if (remoteCode) {
      const session = this.sessions.get(remoteCode);
      if (session) {
        session.remotes.delete(socketId);
        this.remoteToPairCode.delete(socketId);
        return {
          type: 'remote_left',
          pairCode: remoteCode,
          tvSocketId: session.tvSocketId,
          remainingRemotes: session.remotes.size
        };
      }
    }

    return null;
  }
}

export const pairingManager = new PairingManager();
