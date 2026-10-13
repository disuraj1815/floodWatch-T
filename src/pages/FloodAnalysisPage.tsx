import React, { useState } from 'react';
import { MapContainer, TileLayer, Rectangle, Marker, Popup, useMap } from 'react-leaflet';
import { Search, MapPin, RefreshCw, Play, Waves, Calendar, Satellite, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language, AOIBox, AnalysisRequest } from '../types';
import { translations } from '../translations';

// Helper component to recenter map on search
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface FloodAnalysisPageProps {
  language: Language;
}

export const FloodAnalysisPage: React.FC<FloodAnalysisPageProps> = ({ language }) => {
  const t = translations[language];

  // Default to Trishuli, Nepal (August 2026 flood event)
  const [searchQuery, setSearchQuery] = useState('Trishuli, Nepal');
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.9100, 85.1500]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // AOI Box (Default Trishuli Valley bounding box)
  const [aoi, setAoi] = useState<AOIBox>({
    minLat: 27.8500,
    maxLat: 27.9700,
    minLng: 85.0800,
    maxLng: 85.2200,
    center: [27.9100, 85.1500],
    zoom: 11,
    name: 'Trishuli Valley AOI-01'
  });

  // Form State
  const [analysisForm, setAnalysisForm] = useState<AnalysisRequest>({
    locationName: 'Trishuli, Nepal',
    eventName: 'Trishuli River Flash Flood',
    eventDate: '2026-08-14',
    beforeDateStart: '2026-08-01',
    beforeDateEnd: '2026-08-10',
    afterDateStart: '2026-08-15',
    afterDateEnd: '2026-08-20',
    aoi: aoi,
    sensor: 'both'
  });

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Handle Location Search (using Nominatim OpenStreetMap geocoder)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setMapZoom(12);

        // Update AOI around search result
        const newAoi: AOIBox = {
          minLat: lat - 0.06,
          maxLat: lat + 0.06,
          minLng: lon - 0.08,
          maxLng: lon + 0.08,
          center: [lat, lon],
          zoom: 12,
          name: `${data[0].display_name.split(',')[0]} AOI`
        };
        setAoi(newAoi);
        setAnalysisForm(prev => ({ ...prev, locationName: data[0].display_name, aoi: newAoi }));
      } else {
        setSearchError('Location not found. Please try another query.');
      }
    } catch (err) {
      setSearchError('Geocoding network request failed. Using offline coordinates.');
      // Fallback coordinate for Trishuli or Uttarakhand
      if (searchQuery.toLowerCase().includes('uttarakhand')) {
        setMapCenter([30.0668, 79.0193]);
        const uuttAoi: AOIBox = { minLat: 30.0, maxLat: 30.15, minLng: 78.9, maxLng: 79.15, center: [30.0668, 79.0193], zoom: 11, name: 'Uttarakhand AOI' };
        setAoi(uuttAoi);
        setAnalysisForm(prev => ({ ...prev, locationName: 'Uttarakhand, India', aoi: uuttAoi }));
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsAnalyzing(true);

    if (!analysisForm.eventDate) {
      setFormError('Please specify a valid event date.');
      setIsAnalyzing(false);
      return;
    }
    if (!analysisForm.aoi) {
      setFormError('Please select a valid Area of Interest (AOI).');
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisForm)
      });

      if (!response.ok) {
        throw new Error('Backend API request failed.');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setSubmitted(true);
    } catch (err: any) {
      // Fallback if backend server is not running
      setAnalysisResult({
        message: 'Backend API offline — using offline simulation mode.',
        data: {
          discoveredScenes: [
            { provider: 'Copernicus Sentinel Hub (Offline Mode)', sceneId: 'S1A_SIMULATED_SCENE_01', acquisitionDate: new Date().toISOString() }
          ]
        }
      });
      setSubmitted(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormError(null);
  };

  // Rectangle bounds for Leaflet: [[minLat, minLng], [maxLat, maxLng]]
  const rectangleBounds: [[number, number], [number, number]] = aoi
    ? [
        [aoi.minLat, aoi.minLng],
        [aoi.maxLat, aoi.maxLng]
      ]
    : [
        [27.8500, 85.0800],
        [27.9700, 85.2200]
      ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Waves className="w-6 h-6 text-cyan-400" />
            {t.floodAnalysis}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure radar/optical satellite parameters, select target Area of Interest (AOI), and submit analysis requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-lg font-mono">
            Trishuli Case Study (Aug 2026) Loaded
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Location Search Bar */}
          <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              1. Search Location & Region
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Trishuli Nepal, Uttarakhand..."
                  className="w-full bg-dark-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-semibold text-sm rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Search
              </button>
            </form>
            {searchError && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {searchError}
              </p>
            )}
          </div>

          {/* Flood Event Controls Form */}
          <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              2. Event & Satellite Parameters
            </h2>

            {submitted ? (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 space-y-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
                <h3 className="font-semibold text-slate-100 text-base">Analysis Request Prepared</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The analysis request for <strong className="text-cyan-400">{analysisForm.locationName}</strong> with AOI bounds has been successfully validated.
                </p>
                <div className="bg-dark-950 p-3 rounded text-left font-mono text-[11px] text-slate-400 space-y-1">
                  <div>Sensor: <span className="text-slate-200">{analysisForm.sensor}</span></div>
                  <div>Event Date: <span className="text-slate-200">{analysisForm.eventDate}</span></div>
                  <div>Center: <span className="text-slate-200">{aoi.center[0].toFixed(4)}, {aoi.center[1].toFixed(4)}</span></div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-xs">
                  <strong>Backend Status:</strong> Node.js / MongoDB backend not connected. Real-time satellite inference awaits Phase 2 integration.
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition-all"
                >
                  Reset Form & Modify Parameters
                </button>
              </div>
            ) : (
              <form onSubmit={handleStartAnalysis} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={analysisForm.eventName}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, eventName: e.target.value })}
                    className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={analysisForm.eventDate}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, eventDate: e.target.value })}
                      className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Satellite Sensor</label>
                    <select
                      value={analysisForm.sensor}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, sensor: e.target.value as any })}
                      className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="both">Sentinel-1 & Sentinel-2</option>
                      <option value="sentinel-1">Sentinel-1 SAR (All-Weather)</option>
                      <option value="sentinel-2">Sentinel-2 Optical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400">Before Range</label>
                    <input
                      type="date"
                      value={analysisForm.beforeDateStart}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, beforeDateStart: e.target.value })}
                      className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="date"
                      value={analysisForm.beforeDateEnd}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, beforeDateEnd: e.target.value })}
                      className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400">After Range</label>
                    <input
                      type="date"
                      value={analysisForm.afterDateStart}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, afterDateStart: e.target.value })}
                      className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="date"
                      value={analysisForm.afterDateEnd}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, afterDateEnd: e.target.value })}
                      className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* AOI info box */}
                <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
                  <div className="text-slate-400 font-medium flex items-center justify-between">
                    <span>Selected AOI Bounds:</span>
                    <span className="text-cyan-400 font-mono">{aoi.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 grid grid-cols-2 gap-1 pt-1">
                    <div>Min Lat: {aoi.minLat.toFixed(4)}</div>
                    <div>Max Lat: {aoi.maxLat.toFixed(4)}</div>
                    <div>Min Lng: {aoi.minLng.toFixed(4)}</div>
                    <div>Max Lng: {aoi.maxLng.toFixed(4)}</div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAoi({
                        minLat: 27.8500, maxLat: 27.9700, minLng: 85.0800, maxLng: 85.2200,
                        center: [27.9100, 85.1500], zoom: 11, name: 'Trishuli Valley AOI-01'
                      });
                      setMapCenter([27.9100, 85.1500]);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 border border-slate-700 text-sm font-medium transition-all"
                  >
                    Reset AOI
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Map Column (7 cols) */}
        <div className="lg:col-span-7 bg-dark-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[650px] shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-dark-950 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Interactive GIS Map & AOI Selection
            </span>
            <span className="font-mono text-cyan-400">
              Center: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
            </span>
          </div>

          <div className="flex-1 relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <MapRecenter center={mapCenter} zoom={mapZoom} />
              {/* CartoDB Dark Matter tile layer for premium dark GIS look */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />
              {/* AOI Bounding Rectangle */}
              <Rectangle
                bounds={rectangleBounds}
                pathOptions={{ color: '#38bdf8', weight: 2, fillColor: '#38bdf8', fillOpacity: 0.15 }}
              />
              <Marker position={aoi.center}>
                <Popup>
                  <div className="text-xs space-y-1">
                    <strong className="text-cyan-400">{aoi.name}</strong>
                    <div>Lat/Lng: {aoi.center[0].toFixed(4)}, {aoi.center[1].toFixed(4)}</div>
                    <div className="text-slate-400">Selected Area of Interest</div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="p-3 border-t border-slate-800 bg-dark-950 text-xs text-slate-400 flex items-center justify-between">
            <span>Selected Region: <strong className="text-slate-200">{analysisForm.locationName}</strong></span>
            <span className="text-cyan-400 font-mono">AOI Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
