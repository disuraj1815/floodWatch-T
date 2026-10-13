import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, Satellite, Building2, Route, ShieldCheck, ArrowRight, Play, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface DashboardPageProps {
  language: Language;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const t = translations[language];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border border-slate-800 rounded-xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1 rounded-full font-mono">
            <Waves className="w-3.5 h-3.5" />
            {t.hackathonTrack}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            {t.appName}
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            AI-Assisted Satellite Flood Mapping and Infrastructure Impact Assessment Platform. Designed for rapid situational awareness, radar/optical satellite analysis, and critical infrastructure vulnerability mapping during extreme hydrological events.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/analysis')}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-semibold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Start New Analysis
            </button>
            <button
              onClick={() => navigate('/validation')}
              className="px-5 py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 font-medium text-sm flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              View EMSR927 Validation
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics / Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider font-mono">Satellite Feed</span>
            <Satellite className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-semibold text-slate-100">Sentinel-1 & 2</div>
          <p className="text-xs text-slate-500">SAR & Optical pipeline ready for connection</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider font-mono">Elevation Model</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-semibold text-slate-100">WorldDEM-30</div>
          <p className="text-xs text-slate-500">30m resolution global DEM integration</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider font-mono">Analysis Mode</span>
            <Waves className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-semibold text-amber-400">Frontend Phase 1</div>
          <p className="text-xs text-slate-500">Awaiting Node.js / MongoDB backend</p>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider font-mono">Case Study</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-semibold text-slate-100">Trishuli, Nepal</div>
          <p className="text-xs text-slate-500">August 2026 Flood Event Benchmark</p>
        </div>
      </div>

      {/* Workflow & Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/analysis')}
          className="bg-dark-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 cursor-pointer transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Waves className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center justify-between">
            Flood Analysis & Map
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Select Areas of Interest (AOI), draw bounding polygons, search global coordinates, and configure radar/optical parameters.
          </p>
        </div>

        <div
          onClick={() => navigate('/infrastructure')}
          className="bg-dark-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 cursor-pointer transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center justify-between">
            Infrastructure Impact
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Inspect potentially affected bridges, roads, and settlements with cautious terminology and evidence-backed metadata.
          </p>
        </div>

        <div
          onClick={() => navigate('/validation')}
          className="bg-dark-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 cursor-pointer transition-all group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center justify-between">
            EMSR927 Validation
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Compare generated flood maps against official Copernicus Emergency Management Service reference data for the Trishuli event.
          </p>
        </div>
      </div>
    </div>
  );
};
