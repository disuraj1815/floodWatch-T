import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Waves,
  Satellite,
  Building2,
  Route,
  FileText,
  ShieldCheck,
  Database,
  Activity,
  Globe2,
  AlertTriangle
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ language, setLanguage }) => {
  const location = useLocation();
  const t = translations[language];
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<string>('disconnected');

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBackendConnected(data.status === 'ok');
            setDbStatus(data.database || 'disconnected');
          }
        } else {
          if (isMounted) {
            setBackendConnected(false);
            setDbStatus('disconnected');
          }
        }
      } catch {
        if (isMounted) {
          setBackendConnected(false);
          setDbStatus('connection_error');
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Poll every 10s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { path: '/', label: t.dashboard, icon: LayoutDashboard },
    { path: '/analysis', label: t.floodAnalysis, icon: Waves },
    { path: '/satellite', label: t.satelliteObservations, icon: Satellite },
    { path: '/infrastructure', label: t.infrastructureImpact, icon: Building2 },
    { path: '/connectivity', label: t.roadConnectivity, icon: Route },
    { path: '/report', label: t.situationReport, icon: FileText },
    { path: '/validation', label: t.validation, icon: ShieldCheck },
    { path: '/sources', label: t.dataSources, icon: Database },
    { path: '/diagnostics', label: t.systemDiagnostics, icon: Activity },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-100 flex items-center gap-2">
              {t.appName}
            </h1>
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
              Track B • Hackathon 2026
            </span>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="px-4 py-3 border-b border-slate-800 bg-dark-950/40 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> Language:
        </span>
        <div className="flex bg-dark-950 rounded border border-slate-800 p-0.5">
          {(['en', 'hi', 'ne'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 rounded text-[11px] font-medium uppercase transition-colors ${
                language === lang
                  ? 'bg-cyan-500 text-dark-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-dark-950/60 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            Backend API
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
            backendConnected
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }`}>
            {backendConnected ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : dbStatus === 'connecting' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`} />
            Database
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
            dbStatus === 'connected'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : dbStatus === 'connecting'
              ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }`}>
            {dbStatus === 'connected' ? 'Connected' : dbStatus === 'connecting' ? 'Connecting' : 'Disconnected'}
          </span>
        </div>
      </div>
    </aside>
  );
};
