export type Language = 'en' | 'hi' | 'ne';

export interface AOIBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  center: [number, number];
  zoom: number;
  name?: string;
}

export interface AnalysisRequest {
  locationName: string;
  eventName: string;
  eventDate: string;
  beforeDateStart: string;
  beforeDateEnd: string;
  afterDateStart: string;
  afterDateEnd: string;
  aoi: AOIBox | null;
  sensor: 'sentinel-1' | 'sentinel-2' | 'both';
}

export interface SatelliteObservation {
  id: string;
  sensor: 'Sentinel-1 SAR' | 'Sentinel-2 MSI Optical';
  acquisitionDate: string;
  orbitDirection: 'Ascending' | 'Descending';
  relativeOrbit: number;
  cloudCover?: number;
  status: 'Available' | 'Processing' | 'Not Connected';
  resolution: string;
  polarization?: string;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  type: 'Bridge' | 'Road Segment' | 'Hospital' | 'School' | 'Settlement';
  status: 'POTENTIALLY AFFECTED' | 'UNVERIFIED' | 'CLEAR';
  coordinates: [number, number];
  distanceToFloodMeters?: number;
  evidence: string;
}

export interface SettlementConnectivity {
  id: string;
  settlementName: string;
  populationEstimate: number;
  status: 'POTENTIALLY CUT-OFF' | 'ACCESSIBLE' | 'UNVERIFIED';
  nearestTown: string;
  primaryRoad: string;
  evidence: string;
}

export interface SystemDiagnosticItem {
  serviceName: string;
  status: 'Online' | 'Offline' | 'Not Connected' | 'Degraded';
  latencyMs?: number;
  lastChecked: string;
  details: string;
}
