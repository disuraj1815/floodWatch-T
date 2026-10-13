import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, Cpu, Radio, Layers } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface TopBarProps {
  language: Language;
}

export const TopBar: React.FC<TopBarProps> = ({ language }) => {
  const location = useLocation();
  const t = translations[language];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t.dashboard;
      case '/analysis': return t.floodAnalysis;
      case '/satellite': return t.satelliteObservations;
      case '/infrastructure': return t.infrastructureImpact;
      case '/connectivity': return t.roadConnectivity;
      case '/report': return t.situationReport;
      case '/validation': return t.validation;
      case '/sources': return t.dataSources;
      case '/diagnostics': return t.systemDiagnostics;
      default: return t.appName;
    }
  };

  return (
    <header className="h-14 bg-dark-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {getPageTitle()}
        </h2>
        <span className="text-xs bg-dark-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
          Trishuli Case Study Ready
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status badges */}
        <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-dark-950 px-2.5 py-1 rounded border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sentinel-1/2: <strong className="text-slate-300">Standby</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-dark-950 px-2.5 py-1 rounded border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Model: <strong className="text-amber-400">Not Connected</strong></span>
          </div>
        </div>

        <div className="text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded">
          Hackathon Track B
        </div>
      </div>
    </header>
  );
};
