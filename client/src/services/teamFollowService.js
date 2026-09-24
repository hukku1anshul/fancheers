/**
 * teamFollowService.js
 * 
 * Manages followed teams with localStorage persistence.
 * Provides filtering, follow/unfollow, and match highlighting.
 */

const STORAGE_KEY = 'fanpulse_followed_teams';

class TeamFollowService {
  constructor() {
    this.followedTeams = this._load();
  }

  _load() {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  _save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.followedTeams));
    } catch (e) {}
  }

  followTeam(teamId, teamName, sport = 'all', logo = '') {
    this.followedTeams[teamId] = {
      id: teamId,
      name: teamName,
      sport,
      logo,
      followedAt: Date.now()
    };
    this._save();
    return this.followedTeams;
  }

  unfollowTeam(teamId) {
    delete this.followedTeams[teamId];
    this._save();
    return this.followedTeams;
  }

  toggleFollow(teamId, teamName, sport = 'all', logo = '') {
    if (this.isFollowed(teamId)) {
      this.unfollowTeam(teamId);
      return false;
    } else {
      this.followTeam(teamId, teamName, sport, logo);
      return true;
    }
  }

  isFollowed(teamId) {
    return !!this.followedTeams[teamId];
  }

  getFollowedTeams() {
    return Object.values(this.followedTeams);
  }

  getCount() {
    return Object.keys(this.followedTeams).length;
  }

  isMatchFollowed(match) {
    if (!match) return false;
    const homeId = match.homeTeam?.id || match.homeTeam;
    const awayId = match.awayTeam?.id || match.awayTeam;
    return this.isFollowed(homeId) || this.isFollowed(awayId);
  }

  filterFollowedMatches(matches) {
    if (this.getCount() === 0) return matches;
    return matches.filter(m => this.isMatchFollowed(m));
  }

  extractTeamsFromMatches(matches) {
    const teamsMap = new Map();
    for (const match of matches) {
      const home = match.homeTeam;
      const away = match.awayTeam;
      if (home) {
        const id = home.id || home.name || home;
        if (!teamsMap.has(id)) {
          teamsMap.set(id, {
            id, name: home.name || home, shortName: home.shortName || '',
            sport: match.sport || 'all', logo: home.logo || '', color: home.color || '#10B981'
          });
        }
      }
      if (away) {
        const id = away.id || away.name || away;
        if (!teamsMap.has(id)) {
          teamsMap.set(id, {
            id, name: away.name || away, shortName: away.shortName || '',
            sport: match.sport || 'all', logo: away.logo || '', color: away.color || '#6366F1'
          });
        }
      }
    }
    return Array.from(teamsMap.values()).map(team => ({
      ...team, isFollowed: this.isFollowed(team.id)
    }));
  }
}

export const teamFollowService = new TeamFollowService();
