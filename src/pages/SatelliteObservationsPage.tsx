import React, { useState } from 'react';
import { Satellite, Calendar, Layers, Download, AlertCircle, Eye, CheckCircle2, Waves } from 'lucide-react';
import { Language, SatelliteObservation } from '../types';
import { translations } from '../translations';

interface SatelliteObservationsPageProps {
  language: Language;
}

export const SatelliteObservationsPage: React.FC<SatelliteObservationsPageProps> = ({ language }) => {
  const t = translations[language];

  // Sample structured metadata awaiting backend connection
  const observations: SatelliteObservation[] = [
    {
      id: 'S1A_IW_GRDH_1SDV_20260814T102315',
      sensor: 'Sentinel-1 SAR',
      acquisitionDate: '2026-08-14 10:23 UTC',
      orbitDirection: 'Descending',
      relativeOrbit: 142,
      status: 'Available',
      resolution: '10m (IW GRDH)',
      polarization: 'VV + VH'
    },
    {
      id: 'S2B_MSIL2A_20260815T104031',
      sensor: 'Sentinel-2 MSI Optical',
      acquisitionDate: '2026-08-15 10:40 UTC',
      orbitDirection: 'Descending',
      relativeOrbit: 56,
      cloudCover: 12.4,
      status: 'Available',
      resolution: '10m / 20m (Bands 2,3,4,8,11,12)'
    }
  ];

  const [selectedObs, setSelectedObs] = useState<SatelliteObservation>(observations[0]);
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'slider'>('side-by-side');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-dark-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Satellite className="w-6 h-6 text-cyan-400" />
            {t.satelliteObservations}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sentinel-1 SAR (all-weather radar backscatter) and Sentinel-2 MSI optical imagery metadata for pre-event and post-event comparison.
          </p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1.5 rounded-lg font-mono">
          Copernicus Open Access Hub Ready
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Observations List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Available Observations (Trishuli AOI)
          </h2>
          <div className="space-y-3">
            {observations.map((obs) => (
              <div
                key={obs.id}
                onClick={() => setSelectedObs(obs)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedObs.id === obs.id
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md'
                    : 'bg-dark-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 font-mono">
                    {obs.sensor}
                  </span>
                  <span className="text-[11px] bg-dark-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    {obs.status}
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-200 truncate">{obs.id}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                  <div>Date: <span className="text-slate-300">{obs.acquisitionDate}</span></div>
                  <div>Resolution: <span className="text-slate-300">{obs.resolution}</span></div>
                  {obs.cloudCover !== undefined && (
                    <div>Cloud Cover: <span className="text-slate-300">{obs.cloudCover}%</span></div>
                  )}
                  <div>Orbit: <span className="text-slate-300">{obs.orbitDirection}</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-dark-900 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
            <div className="font-medium text-slate-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              API Connection Status
            </div>
            <p>
              When connected to the Node.js backend, this view retrieves real raster previews, metadata descriptors, and download links via OData API.
            </p>
          </div>
        </div>

        {/* Before/After Comparison Preview (7 cols) */}
        <div className="lg:col-span-7 bg-dark-900 border border-slate-800 rounded-xl p-6 space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Before / After Imagery Preview
            </h2>
            <div className="flex bg-dark-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setCompareMode('side-by-side')}
                className={`px-3 py-1 rounded transition-all ${compareMode === 'side-by-side' ? 'bg-cyan-500 text-dark-950 font-bold' : 'text-slate-400'}`}
              >
                Side by Side
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Before Image Panel */}
            <div className="bg-dark-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-400">Pre-Event Baseline</span>
                <span className="text-slate-500 font-mono">2026-08-01</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center space-y-2 min-h-[220px]">
                <Satellite className="w-10 h-10 text-slate-600 animate-pulse" />
                <p className="text-xs text-slate-400">
                  Pre-event Sentinel-2 optical mosaic / Sentinel-1 baseline ready for raster render.
                </p>
                <span className="text-[10px] text-slate-500 font-mono">ID: S2_PRE_TRISHULI_20260801</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Source: Copernicus Open Access Hub (Sentinel-2 L2A)
              </div>
            </div>

            {/* After Image Panel */}
            <div className="bg-dark-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-400">Post-Event Flood State</span>
                <span className="text-slate-500 font-mono">2026-08-15</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center space-y-2 min-h-[220px]">
                <Waves className="w-10 h-10 text-cyan-500 animate-pulse" />
                <p className="text-xs text-slate-400">
                  Post-event Sentinel-1 SAR flood extent backscatter detection overlay.
                </p>
                <span className="text-[10px] text-slate-500 font-mono">ID: S1_POST_TRISHULI_20260814</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Source: Copernicus Sentinel-1 IW GRDH (VV polarization)
              </div>
            </div>
          </div>

          <div className="p-4 bg-dark-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Selected Product: <strong className="text-slate-200">{selectedObs.id}</strong></span>
            <button
              onClick={() => alert('Backend raster streaming not connected in Phase 1 frontend.')}
              className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Download GeoTIFF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
