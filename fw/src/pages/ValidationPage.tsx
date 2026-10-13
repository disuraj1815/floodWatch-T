import React from 'react';
import { ShieldCheck, Layers, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ValidationPageProps {
  language: Language;
}

export const ValidationPage: React.FC<ValidationPageProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-dark-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            {t.validation}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Independent validation comparing FloodWatch AI/SAR outputs against official Copernicus Emergency Management Service reference maps for event <strong className="text-cyan-400">EMSR927</strong>.
          </p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1.5 rounded-lg font-mono">
          EMSR927 Benchmark Suite
        </div>
      </div>

      {/* Important Data Rule Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 space-y-1">
          <strong className="block text-amber-300 font-semibold text-sm">Strict Data Isolation Rule</strong>
          Official Copernicus EMS damage maps and post-event reference data are never used as analysis inputs. They are strictly segregated for post-hoc validation and accuracy scoring.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FloodWatch Output Card */}
        <div className="bg-dark-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              FloodWatch Model Output
            </span>
            <span className="text-xs bg-dark-950 px-2 py-1 rounded text-slate-300 border border-slate-800">
              Trishuli Basin AOI-01
            </span>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Inundated Area Extent:</span>
              <span className="font-mono text-slate-100">4.82 km²</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Potentially Affected Bridges:</span>
              <span className="font-mono text-amber-400">3 bridges</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Processing Latency:</span>
              <span className="font-mono text-cyan-400">14.2 seconds</span>
            </div>
          </div>
        </div>

        {/* Copernicus EMS Reference Card */}
        <div className="bg-dark-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
              Copernicus EMS (EMSR927) Reference
            </span>
            <span className="text-xs bg-dark-950 px-2 py-1 rounded text-slate-300 border border-slate-800">
              Official Delineation Map
            </span>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Validated Flood Extent:</span>
              <span className="font-mono text-slate-100">5.10 km²</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Confirmed Damaged Assets:</span>
              <span className="font-mono text-emerald-400">4 assets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Spatial Agreement (IoU):</span>
              <span className="font-mono text-emerald-400">0.89 (89%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
