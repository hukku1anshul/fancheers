import React, { useState, useEffect } from 'react';
import { Brain, HelpCircle, ChevronRight, X, Sparkles, RefreshCw, Compass } from 'lucide-react';
import { getApiBaseUrl } from '../services/socket';

export default function TacticalAnalyst({ match }) {
  const [insightData, setInsightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState(null);
  const [activeAnswer, setActiveAnswer] = useState(null);

  const fetchInsight = async (query = null) => {
    try {
      setLoading(true);
      const baseUrl = getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
      const url = new URL(`${baseUrl}/api/tactical/insight`);
      if (match?.id) url.searchParams.set('matchId', match.id);
      if (query) url.searchParams.set('query', query);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setInsightData(data);
        if (query) {
          setActiveQuery(query);
          setActiveAnswer(data.answer);
        }
      }
    } catch (err) {
      console.warn('Tactical analyst error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
    const interval = setInterval(() => fetchInsight(), 45000);
    return () => clearInterval(interval);
  }, [match?.id]);

  if (!insightData) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-pitch-900 to-indigo-950 text-white rounded-2xl p-3.5 border border-indigo-500/20 shadow-lg relative overflow-hidden">
      {/* Background Cyber Accents */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
            <Brain className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>AI Tactical Pocket Analyst</span>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 font-extrabold text-[10px] tracking-wide uppercase border border-white/5">
            {insightData.tag}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {insightData.advantage && (
            <span className="text-[10px] font-bold text-amber-300 hidden sm:inline bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              ⚡ {insightData.advantage}
            </span>
          )}

          <button
            onClick={() => fetchInsight()}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition active:scale-95"
            title="Refresh tactical insight"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 15-Word Micro-Insight */}
      <p className="text-xs sm:text-[13px] font-medium text-slate-200 leading-relaxed">
        "{insightData.insight}"
      </p>

      {/* Interactive Micro-Questions Chips */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Instant Breakdown:
        </span>

        {insightData.quickQuestions?.map((q) => (
          <button
            key={q}
            onClick={() => fetchInsight(q)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border active:scale-95 ${
              activeQuery === q
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-indigo-400/40'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Answer Drawer */}
      {activeAnswer && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-400/30 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="text-xs text-indigo-100 leading-relaxed">
            <span className="font-extrabold text-indigo-300 uppercase text-[10px] block mb-0.5">
              Tactical Deep Dive ({activeQuery}):
            </span>
            {activeAnswer}
          </div>
          <button
            onClick={() => {
              setActiveAnswer(null);
              setActiveQuery(null);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
