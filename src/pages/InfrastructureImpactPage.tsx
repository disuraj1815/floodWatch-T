import React, { useState } from 'react';
import { Building2, AlertTriangle, ShieldAlert, MapPin, Search, Filter } from 'lucide-react';
import { Language, InfrastructureItem } from '../types';
import { translations } from '../translations';

interface InfrastructureImpactPageProps {
  language: Language;
}

export const InfrastructureImpactPage: React.FC<InfrastructureImpactPageProps> = ({ language }) => {
  const t = translations[language];

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sample structured infrastructure items respecting strict cautious rules
  const items: InfrastructureItem[] = [
    {
      id: 'INF-01',
      name: 'Trishuli Highway Bridge Segment 4',
      type: 'Bridge',
      status: 'POTENTIALLY AFFECTED',
      coordinates: [27.9120, 85.1480],
      distanceToFloodMeters: 18,
      evidence: 'High-backscatter water boundary intersecting road embankment in Sentinel-1 SAR IW GRDH.'
    },
    {
      id: 'INF-02',
      name: 'Bidur Municipal Road Link B2',
      type: 'Road Segment',
      status: 'POTENTIALLY AFFECTED',
      coordinates: [27.9050, 85.1620],
      distanceToFloodMeters: 45,
      evidence: 'Low radar return matching inundated floodplain adjacent to Trishuli River.'
    },
    {
      id: 'INF-03',
      name: 'Trishuli District Community Hospital',
      type: 'Hospital',
      status: 'UNVERIFIED',
      coordinates: [27.9180, 85.1550],
      distanceToFloodMeters: 320,
      evidence: 'Outside immediate flood inundation polygon; awaiting optical confirmation.'
    },
    {
      id: 'INF-04',
      name: 'Galchhi-Trishuli Primary Access Road',
      type: 'Road Segment',
      status: 'POTENTIALLY AFFECTED',
      coordinates: [27.8890, 85.1410],
      distanceToFloodMeters: 12,
      evidence: 'Intersected by debris flow channel identified in post-event optical band ratio.'
    }
  ];

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-dark-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            {t.infrastructureImpact}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Exposure assessment for roads, bridges, settlements, and vital facilities. Uses cautious terminology (<strong className="text-amber-400">POTENTIALLY AFFECTED</strong>) pending independent verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg font-mono">
            Awaiting Backend AI Analysis
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-dark-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search infrastructure..."
            className="w-full bg-dark-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Bridge', 'Road Segment', 'Hospital', 'School'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
                filterType === type
                  ? 'bg-cyan-500 text-dark-950 font-bold'
                  : 'bg-dark-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Infrastructure Items Table/Grid */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-dark-950/60 text-xs text-slate-400 font-mono uppercase tracking-wider">
                <th className="p-4">Feature Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Coordinates</th>
                <th className="p-4">Supporting Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No matching infrastructure items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-medium text-slate-200">
                      <div>{item.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.id}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs bg-dark-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full font-mono ${
                        item.status === 'POTENTIALLY AFFECTED'
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {item.coordinates[0].toFixed(4)}, {item.coordinates[1].toFixed(4)}
                    </td>
                    <td className="p-4 text-xs text-slate-300 max-w-md leading-relaxed">
                      {item.evidence}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
