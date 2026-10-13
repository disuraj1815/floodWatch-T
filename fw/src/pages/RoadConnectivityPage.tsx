import React from 'react';
import { Route, AlertTriangle, ShieldAlert, MapPin, Building, Activity } from 'lucide-react';
import { Language, SettlementConnectivity } from '../types';
import { translations } from '../translations';

interface RoadConnectivityPageProps {
  language: Language;
}

export const RoadConnectivityPage: React.FC<RoadConnectivityPageProps> = ({ language }) => {
  const t = translations[language];

  // Sample structured connectivity data respecting strict cautious rules
  const settlements: SettlementConnectivity[] = [
    {
      id: 'SET-01',
      settlementName: 'Dhunche Upper Valley',
      populationEstimate: 2450,
      status: 'POTENTIALLY CUT-OFF',
      nearestTown: 'Bidur',
      primaryRoad: 'Trishuli-Dhunche Highway Route 5',
      evidence: 'Primary bridge approach embankment intersected by flood inundation polygon at km 34.'
    },
    {
      id: 'SET-02',
      settlementName: 'Ramche Rural Ward 3',
      populationEstimate: 1200,
      status: 'POTENTIALLY CUT-OFF',
      nearestTown: 'Trishuli Bazaar',
      primaryRoad: 'Ramche Access Link',
      evidence: 'Road segment submerged under 1.2m estimated flood depth based on SAR backscatter drop.'
    },
    {
      id: 'SET-03',
      settlementName: 'Betrawati Riverside Community',
      populationEstimate: 3100,
      status: 'ACCESSIBLE',
      nearestTown: 'Bidur',
      primaryRoad: 'Prithvi Highway Link',
      evidence: 'Access roads remain above flood level; bridge crossing verified intact.'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-dark-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Route className="w-6 h-6 text-cyan-400" />
            {t.roadConnectivity}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Network graph routing and accessibility analysis. Identifies settlements <strong className="text-amber-400">POTENTIALLY CUT-OFF</strong> due to flooded bridge crossings or damaged access roads.
          </p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs px-3 py-1.5 rounded-lg font-mono">
          Graph Analysis Engine Ready
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Assessed Settlements</div>
          <div className="text-2xl font-bold text-slate-100">14 Locations</div>
          <p className="text-xs text-slate-500">Trishuli River basin network graph</p>
        </div>
        <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Potentially Cut-Off</div>
          <div className="text-2xl font-bold text-amber-400">2 Settlements</div>
          <p className="text-xs text-slate-500">Requires emergency helicopter verification</p>
        </div>
        <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Routing Status</div>
          <div className="text-2xl font-bold text-cyan-400">Graph Active</div>
          <p className="text-xs text-slate-500">OpenStreetMap pre-event snapshot</p>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-dark-950 font-medium text-sm text-slate-200">
          Settlement Accessibility Status
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-dark-950/60 text-xs text-slate-400 font-mono uppercase tracking-wider">
                <th className="p-4">Settlement Name</th>
                <th className="p-4">Est. Population</th>
                <th className="p-4">Connectivity Status</th>
                <th className="p-4">Primary Access Route</th>
                <th className="p-4">Evidence / Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {settlements.map((set) => (
                <tr key={set.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div>{set.settlementName}</div>
                    <div className="text-xs text-slate-500 font-mono">Nearest: {set.nearestTown}</div>
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    ~{set.populationEstimate.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full font-mono ${
                      set.status === 'POTENTIALLY CUT-OFF'
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {set.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-300 font-mono">
                    {set.primaryRoad}
                  </td>
                  <td className="p-4 text-xs text-slate-300 max-w-md leading-relaxed">
                    {set.evidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
