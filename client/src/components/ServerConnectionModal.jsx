import React, { useState, useEffect } from 'react';
import { X, Server, Wifi, WifiOff, RefreshCw, Check, Cloud, Smartphone, Laptop, AlertCircle } from 'lucide-react';
import {
  getActiveServerUrl,
  setActiveServerUrl,
  DEFAULT_PRODUCTION_URL,
  DEFAULT_EMULATOR_URL,
  DEFAULT_LOCAL_URL,
  testServerLatency,
  onConnectionStatusChange
} from '../services/socket';

export default function ServerConnectionModal({ isOpen, onClose, onServerChanged }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [connectionState, setConnectionState] = useState({ status: 'checking', latencyMs: null });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveServerUrl();
      setCurrentUrl(active);
      setCustomInput(active);
      handleTest(active);
    }

    const unsubscribe = onConnectionStatusChange((status) => {
      setConnectionState((prev) => ({ ...prev, ...status }));
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleTest = async (urlToTest) => {
    setTesting(true);
    setTestResult(null);
    const result = await testServerLatency(urlToTest || customInput);
    setTesting(false);
    setTestResult(result);
    if (result.ok) {
      setConnectionState({ status: 'connected', latencyMs: result.latencyMs });
    } else {
      setConnectionState({ status: 'error', error: result.error });
    }
  };

  const handleApply = (newUrl) => {
    const target = (newUrl || customInput).trim().replace(/\/+$/, '');
    setActiveServerUrl(target);
    setCurrentUrl(target);
    setCustomInput(target);
    if (onServerChanged) onServerChanged(target);
    handleTest(target);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-pitch-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              connectionState.status === 'connected' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Server Connection
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure backend endpoint & live sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-pitch-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-pitch-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">

          {/* Current Live Status Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            testResult?.ok
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : testing
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {testResult?.ok ? (
                <Wifi className="w-5 h-5 text-emerald-500 animate-pulse" />
              ) : testing ? (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <WifiOff className="w-5 h-5 text-rose-500" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {testing
                    ? 'Pinging server...'
                    : testResult?.ok
                    ? `Live & Connected (${testResult.latencyMs}ms)`
                    : 'Disconnected or Unreachable'}
                </p>
                <p className="text-[11px] font-mono opacity-80 truncate max-w-[220px] sm:max-w-xs">
                  {currentUrl || 'Relative Host'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTest(currentUrl)}
              disabled={testing}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-pitch-700 border border-slate-200 dark:border-white/10 text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition"
            >
              Test Ping
            </button>
          </div>

          {/* Presets */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Quick Connect Presets
            </label>
            <div className="grid grid-cols-1 gap-2">
              
              {/* Cloud Render */}
              <button
                onClick={() => handleApply(DEFAULT_PRODUCTION_URL)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                  currentUrl === DEFAULT_PRODUCTION_URL
                    ? 'border-stadium-turf bg-stadium-turf/10 dark:bg-stadium-neon/10'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-pitch-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Render Cloud (Production)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-bold">Recommended</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block truncate">{DEFAULT_PRODUCTION_URL}</span>
                  </div>
                </div>
                {currentUrl === DEFAULT_PRODUCTION_URL && (
                  <Check className="w-4 h-4 text-stadium-turf dark:text-stadium-neon" />
                )}
              </button>

              {/* Android Emulator */}
              <button
                onClick={() => handleApply(DEFAULT_EMULATOR_URL)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                  currentUrl === DEFAULT_EMULATOR_URL
                    ? 'border-stadium-turf bg-stadium-turf/10 dark:bg-stadium-neon/10'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-pitch-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Android Studio Emulator</span>
                    <span className="text-[11px] font-mono text-slate-400 block truncate">{DEFAULT_EMULATOR_URL}</span>
                  </div>
                </div>
                {currentUrl === DEFAULT_EMULATOR_URL && (
                  <Check className="w-4 h-4 text-stadium-turf dark:text-stadium-neon" />
                )}
              </button>

              {/* Localhost */}
              <button
                onClick={() => handleApply(DEFAULT_LOCAL_URL)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                  currentUrl === DEFAULT_LOCAL_URL
                    ? 'border-stadium-turf bg-stadium-turf/10 dark:bg-stadium-neon/10'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-pitch-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-500/20 text-slate-500 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Local PC Dev Server</span>
                    <span className="text-[11px] font-mono text-slate-400 block truncate">{DEFAULT_LOCAL_URL}</span>
                  </div>
                </div>
                {currentUrl === DEFAULT_LOCAL_URL && (
                  <Check className="w-4 h-4 text-stadium-turf dark:text-stadium-neon" />
                )}
              </button>

            </div>
          </div>

          {/* Custom Server Endpoint Input */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Custom Server URL (LAN IP or Custom Render URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="https://your-custom-render.onrender.com"
                className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-pitch-900 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-stadium-turf"
              />
              <button
                onClick={() => handleApply(customInput)}
                className="px-4 py-2.5 rounded-2xl bg-stadium-turf text-white font-bold text-xs shadow-md active:scale-95 transition"
              >
                Connect
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Tip: If testing on a physical phone on the same Wi-Fi, enter <code>http://192.168.x.x:3001</code>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-pitch-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 dark:bg-pitch-700 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
