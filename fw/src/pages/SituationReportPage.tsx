import React from 'react';
import { FileText, Download, Printer, Waves, Building2, Route, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface SituationReportPageProps {
  language: Language;
}

export const SituationReportPage: React.FC<SituationReportPageProps> = ({ language }) => {
  const t = translations[language];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between bg-dark-900 border border-slate-800 p-4 rounded-xl print:hidden">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            {t.situationReport}
          </h1>
          <p className="text-xs text-slate-400">Standardized operational brief for emergency response teams.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-semibold text-sm rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-8 space-y-8 shadow-2xl print:bg-white print:text-black print:border-none">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              FloodWatch Situation Report #01
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              Trishuli River Basin Flash Flood Impact Assessment
            </h2>
            <div className="text-xs text-slate-400 pt-1">
              Event Date: August 14, 2026 | Generated: {new Date().toISOString().split('T')[0]} UTC
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">
              PRELIMINARY ASSESSMENT
            </span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider font-mono">
            1. Executive Summary
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Following heavy monsoon precipitation on August 14, 2026, the Trishuli River basin experienced severe hydrological surge and localized flash flooding. This report synthesizes multi-temporal Sentinel-1 SAR radar backscatter and Sentinel-2 optical observations to evaluate flood extent, potential infrastructure exposure, and settlement connectivity.
          </p>
        </div>

        {/* Section 2: Satellite Observations Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider font-mono">
            2. Satellite Observations & Data Quality
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            <li><strong>Primary Sensor:</strong> Sentinel-1 SAR IW GRDH (Acquisition: 2026-08-14 10:23 UTC).</li>
            <li><strong>Optical Verification:</strong> Sentinel-2 MSI L2A (Acquisition: 2026-08-15 10:40 UTC, Cloud Cover: 12.4%).</li>
            <li><strong>Elevation Model:</strong> Copernicus WorldDEM-30 (30m spatial resolution).</li>
          </ul>
        </div>

        {/* Section 3: Potentially Affected Infrastructure */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider font-mono">
            3. Potentially Affected Infrastructure & Roads
          </h3>
          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Trishuli Highway Bridge Segment 4</span>
              <span className="text-amber-400 font-mono text-xs">POTENTIALLY AFFECTED</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Bidur Municipal Road Link B2</span>
              <span className="text-amber-400 font-mono text-xs">POTENTIALLY AFFECTED</span>
            </div>
            <div className="flex justify-between">
              <span>Galchhi-Trishuli Access Road</span>
              <span className="text-amber-400 font-mono text-xs">POTENTIALLY AFFECTED</span>
            </div>
          </div>
        </div>

        {/* Section 4: Settlement Connectivity */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider font-mono">
            4. Settlement Connectivity & Potentially Cut-Off Areas
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Network graph analysis indicates that <strong>Dhunche Upper Valley</strong> (~2,450 pop.) and <strong>Ramche Rural Ward 3</strong> (~1,200 pop.) are <strong>POTENTIALLY CUT-OFF</strong> due to bridge approach inundation and road embankment erosion.
          </p>
        </div>

        {/* Section 5: Limitations & Attributions */}
        <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 font-mono">
          <div>Contains modified Copernicus Sentinel data 2026.</div>
          <div>Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018.</div>
          <div>© OpenStreetMap contributors.</div>
        </div>
      </div>
    </div>
  );
};
