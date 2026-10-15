import type { OSMFeature } from './osm.service.ts';

export interface RoadGraphNode {
  id: string;
  lat: number;
  lng: number;
}

export interface RoadGraphEdge {
  id: string;
  from: string;
  to: string;
  highwayType: string;
  name: string;
  isPotentiallyAffected: boolean;
}

export interface ConnectivityAnalysisResult {
  totalNodes: number;
  totalEdges: number;
  floodMaskAvailable: boolean;
  potentiallyCutOffSettlements: Array<{
    name: string;
    reason: string;
  }>;
  status: 'completed' | 'unavailable_no_flood_mask';
  message: string;
}

export const analyzeRoadNetworkConnectivity = async (
  osmFeatures: OSMFeature[],
  floodMaskAvailable: boolean
): Promise<ConnectivityAnalysisResult> => {
  const roadFeatureCount = osmFeatures.filter(f => f.type === 'Road Segment' || f.type === 'Bridge').length;

  // OSM feature centroids alone do not contain road topology, so they cannot support a real graph.
  // Do not fabricate edges by connecting unrelated features in array order.
  return {
    totalNodes: 0,
    totalEdges: 0,
    floodMaskAvailable,
    potentiallyCutOffSettlements: [],
    status: 'unavailable_no_flood_mask',
    message: floodMaskAvailable
      ? `A flood mask is available, and ${roadFeatureCount} road/bridge features were retrieved, but road topology, mask intersection, and graph reachability are not implemented. No cut-off settlements are claimed.`
      : `Retrieved ${roadFeatureCount} road/bridge features, but no verified flood mask is available. Road graph connectivity and potentially cut-off settlements are unavailable.`
  };
};
