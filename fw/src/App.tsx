import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { FloodAnalysisPage } from './pages/FloodAnalysisPage';
import { SatelliteObservationsPage } from './pages/SatelliteObservationsPage';
import { InfrastructureImpactPage } from './pages/InfrastructureImpactPage';
import { RoadConnectivityPage } from './pages/RoadConnectivityPage';
import { SituationReportPage } from './pages/SituationReportPage';
import { ValidationPage } from './pages/ValidationPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { SystemDiagnosticsPage } from './pages/SystemDiagnosticsPage';
import { Language } from './types';

export function App() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <Router>
      <div className="flex h-screen bg-dark-950 text-slate-100 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar language={language} setLanguage={setLanguage} />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar language={language} />

          <main className="flex-1 overflow-y-auto bg-dark-950">
            <Routes>
              <Route path="/" element={<DashboardPage language={language} />} />
              <Route path="/analysis" element={<FloodAnalysisPage language={language} />} />
              <Route path="/satellite" element={<SatelliteObservationsPage language={language} />} />
              <Route path="/infrastructure" element={<InfrastructureImpactPage language={language} />} />
              <Route path="/connectivity" element={<RoadConnectivityPage language={language} />} />
              <Route path="/report" element={<SituationReportPage language={language} />} />
              <Route path="/validation" element={<ValidationPage language={language} />} />
              <Route path="/sources" element={<DataSourcesPage language={language} />} />
              <Route path="/diagnostics" element={<SystemDiagnosticsPage language={language} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
