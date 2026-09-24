import React, { useState } from 'react';
import { X, MapPin, Beer, Trophy, CheckCircle, Navigation, Flame, Sparkles } from 'lucide-react';
import { venueGeofence } from '../services/venueGeofenceService';
import confetti from 'canvas-confetti';

export default function VenueGeofenceModal({ isOpen, onClose, userLocation, onVenueUpdated = () => {} }) {
  const [currentVenue, setCurrentVenue] = useState(() => venueGeofence.getCheckedInVenue());
  const [activeTab, setActiveTab] = useState('nearby'); // 'nearby' | 'all'

  if (!isOpen) return null;

  const userLat = userLocation?.lat || 51.5074;
  const userLng = userLocation?.lng || -0.1278;
  const venues = venueGeofence.getNearbyVenues(userLat, userLng);

  const handleCheckIn = (v) => {
    venueGeofence.checkIn(v);
    setCurrentVenue(v);
    onVenueUpdated(v);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const handleCheckOut = () => {
    venueGeofence.checkOut();
    setCurrentVenue(null);
    onVenueUpdated(null);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-pitch-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white">
          <div className="flex items-center gap-2">
            <Beer className="w-5 h-5 text-amber-200 animate-bounce" />
            <div>
              <span className="font-black text-sm tracking-tight">STADIUM & PUB CHECK-IN</span>
              <p className="text-[10px] text-amber-200/90 font-medium">Terrace Proximity Geofencing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-200 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2X XP Status Banner */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40">
          {currentVenue ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                  2X
                </div>
                <div>
                  <div className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Checked In: {currentVenue.name}</span>
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    🔥 2x Fan XP Multiplier Active on all roars!
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckOut}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-200 dark:bg-pitch-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition"
              >
                Check Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 font-bold">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Check in at any stadium or sports pub terrace to unlock a <strong>2x XP Multiplier</strong>!</span>
            </div>
          )}
        </div>

        {/* Venues List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center justify-between">
            <span>Verified Fan Hotspots Near {userLocation?.name || 'You'}</span>
            <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> GPS Geofenced</span>
          </div>

          {venues.map((v) => {
            const isCheckedIn = currentVenue?.id === v.id;
            return (
              <div
                key={v.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                  isCheckedIn
                    ? 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/30 shadow-md ring-2 ring-amber-400/30'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-pitch-800 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-slate-100 dark:bg-pitch-700">
                    {v.type === 'stadium' ? '🏟️' : '🍻'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {v.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{v.city}, {v.country}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{v.distanceKm} km away</span>
                    </div>
                    <div className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Flame className="w-2.5 h-2.5 text-stadium-flame" />
                      <span>{v.cheers.toLocaleString()} Stadium Roars Recorded</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCheckIn(v)}
                  disabled={isCheckedIn}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shrink-0 transition active:scale-95 ${
                    isCheckedIn
                      ? 'bg-amber-500 text-white cursor-default'
                      : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {isCheckedIn ? '✓ Active' : 'Check In'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-pitch-800 border-t border-slate-200 dark:border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs active:scale-95 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
