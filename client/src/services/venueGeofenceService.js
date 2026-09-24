/**
 * venueGeofenceService.js
 * 
 * Manages Stadium & Terrace Sports Pub Proximity Geofencing.
 * Detects whether the fan is in or near a live match venue / sports bar,
 * unlocks "Verified In-Stadium" / "Pub Terrace" badges, and awards a 2x XP Multiplier.
 */

const STORAGE_KEY = 'fanpulse_venue_checkin';

// Marquee Global Stadiums and Iconic Fan Pubs
export const VERIFIED_VENUES = [
  // Stadiums
  {
    id: 'stadium_wembley',
    name: 'Wembley Stadium',
    type: 'stadium',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5560,
    lng: -0.2795,
    capacity: '90,000',
    sport: 'soccer',
    cheers: 12450
  },
  {
    id: 'stadium_emirates',
    name: 'Emirates Stadium',
    type: 'stadium',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5549,
    lng: -0.1084,
    capacity: '60,704',
    sport: 'soccer',
    cheers: 8920
  },
  {
    id: 'stadium_old_trafford',
    name: 'Old Trafford Stadium',
    type: 'stadium',
    city: 'Manchester',
    country: 'United Kingdom',
    lat: 53.4631,
    lng: -2.2913,
    capacity: '74,310',
    sport: 'soccer',
    cheers: 15320
  },
  {
    id: 'stadium_lords',
    name: "Lord's Cricket Ground",
    type: 'stadium',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5299,
    lng: -0.1727,
    capacity: '31,100',
    sport: 'cricket',
    cheers: 9450
  },
  {
    id: 'stadium_wankhede',
    name: 'Wankhede Stadium',
    type: 'stadium',
    city: 'Mumbai',
    country: 'India',
    lat: 18.9389,
    lng: 72.8258,
    capacity: '33,108',
    sport: 'cricket',
    cheers: 24800
  },
  {
    id: 'stadium_intuit_dome',
    name: 'Intuit Dome',
    type: 'stadium',
    city: 'Los Angeles',
    country: 'United States',
    lat: 33.9442,
    lng: -118.3424,
    capacity: '18,000',
    sport: 'basketball',
    cheers: 7210
  },
  {
    id: 'stadium_khost',
    name: 'Rahmat Wali Masroor Cricket Stadium',
    type: 'stadium',
    city: 'Khost',
    country: 'Afghanistan',
    lat: 33.3333,
    lng: 69.9167,
    capacity: '20,000',
    sport: 'cricket',
    cheers: 6496
  },
  // Iconic Terrace Sports Bars & Pubs
  {
    id: 'pub_red_lion',
    name: 'The Red Lion Fan Terrace Pub',
    type: 'pub',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5033,
    lng: -0.1276,
    capacity: '350',
    sport: 'all',
    cheers: 4210
  },
  {
    id: 'pub_walkabout',
    name: 'Walkabout Sports Bar & Terrace',
    type: 'pub',
    city: 'Manchester',
    country: 'United Kingdom',
    lat: 53.4839,
    lng: -2.2446,
    capacity: '500',
    sport: 'all',
    cheers: 3890
  },
  {
    id: 'pub_mcsorleys',
    name: "McSorley's Sports Tavern",
    type: 'pub',
    city: 'New York',
    country: 'United States',
    lat: 40.7291,
    lng: -73.9897,
    capacity: '280',
    sport: 'all',
    cheers: 5120
  }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

class VenueGeofenceService {
  constructor() {
    this.checkedInVenue = this._loadCheckin();
  }

  _loadCheckin() {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Expire check-ins after 6 hours
        if (Date.now() - parsed.timestamp < 6 * 3600 * 1000) {
          return parsed.venue;
        }
      }
    } catch (e) {}
    return null;
  }

  _saveCheckin(venue) {
    if (typeof window === 'undefined') return;
    try {
      if (!venue) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ venue, timestamp: Date.now() }));
      }
    } catch (e) {}
  }

  getNearbyVenues(userLat = 51.5074, userLng = -0.1278) {
    return VERIFIED_VENUES.map(v => {
      const distance = calculateDistanceKm(userLat, userLng, v.lat, v.lng);
      return {
        ...v,
        distanceKm: distance,
        isWithinGeofence: distance <= 3.5 // Within 3.5 km
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }

  checkIn(venue) {
    this.checkedInVenue = venue;
    this._saveCheckin(venue);
    return this.checkedInVenue;
  }

  checkOut() {
    this.checkedInVenue = null;
    this._saveCheckin(null);
  }

  getCheckedInVenue() {
    return this.checkedInVenue;
  }

  isVerifiedInVenue() {
    return !!this.checkedInVenue;
  }

  getXpMultiplier() {
    return this.isVerifiedInVenue() ? 2 : 1;
  }
}

export const venueGeofence = new VenueGeofenceService();
