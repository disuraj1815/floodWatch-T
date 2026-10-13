import React from 'react';
import { Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface DataSourcesPageProps {
  language: Language;
}

export const DataSourcesPage: React.FC<DataSourcesPageProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-dark-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            {t.dataSources}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mandatory attributions, dataset licenses, and processing limitations for FloodWatch.
          </p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1.5 rounded-lg font-mono">
          Compliant with ESA & Copernicus Terms
        </div>
      </div>

      {/* Mandatory Attributions Section */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
          Required Legal Attributions
        </h2>

        <div className="space-y-4">
          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-cyan-400">1. Sentinel Satellite Data</div>
            <p className="text-sm text-slate-200 font-serif italic">
              "Contains modified Copernicus Sentinel data 2026."
            </p>
          </div>

          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-cyan-400">2. Elevation Model (WorldDEM-30)</div>
            <p className="text-sm text-slate-200 font-serif italic">
              "Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved."
            </p>
          </div>

          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-cyan-400">3. Geographic Basemap & Infrastructure</div>
            <p className="text-sm text-slate-200 font-serif italic">
              "© OpenStreetMap contributors."
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Inventory */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
          Active Datasets & Availability Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-100 text-sm">Sentinel-1 SAR</div>
            <p className="text-xs text-slate-400">C-band synthetic aperture radar for all-weather flood boundary extraction.</p>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono inline-block">
              Ready for Integration
            </span>
          </div>
          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-100 text-sm">Sentinel-2 MSI</div>
            <p className="text-xs text-slate-400">Multi-spectral optical imagery for turbidity and vegetation damage assessment.</p>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono inline-block">
              Ready for Integration
            </span>
          </div>
          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-100 text-sm">Copernicus EMS</div>
            <p className="text-xs text-slate-400">EMSR927 reference vector data for validation benchmarking.</p>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono inline-block">
              Benchmark Loaded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
