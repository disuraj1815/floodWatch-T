export interface StacSearchQuery {
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  datetime: string; // e.g. "2026-08-01T00:00:00Z/2026-08-20T23:59:59Z"
  collections?: string[];
  limit?: number;
}

export interface SatelliteSceneResult {
  provider: string;
  collection: string;
  sceneId: string;
  acquisitionDate: string;
  cloudCover?: number;
  bbox: number[];
  assets: Record<string, any>;
  orbitState?: string;
  polarization?: string;
}

// Official Copernicus Data Space STAC API
const COPERNICUS_STAC_URL = process.env.STAC_API_URL || 'https://stac.dataspace.copernicus.eu/v1';

export const searchStacScenes = async (query: StacSearchQuery): Promise<SatelliteSceneResult[]> => {
  try {
    // Copernicus Data Space collections for Sentinel-2 L2A and Sentinel-1 GRD
    const collections = query.collections || ['sentinel-2-l2a', 'sentinel-1-grd'];
    const isEarthSearchPrimary = COPERNICUS_STAC_URL.includes('earth-search.aws.element84.com');
    const providerCollections = isEarthSearchPrimary
      ? collections
      : collections.map(collection => collection.toLowerCase().includes('sentinel-1') ? 'SENTINEL-1' : 'SENTINEL-2');
    const payload = {
      bbox: query.bbox,
      datetime: query.datetime,
      collections: providerCollections,
      limit: query.limit || 10
    };

    console.log(`Querying primary STAC API: ${COPERNICUS_STAC_URL}/search`, { ...payload, collections: providerCollections });

    let responseProvider = COPERNICUS_STAC_URL.includes('earth-search') ? 'AWS Earth Search (STAC API)' : 'Copernicus Data Space Ecosystem (STAC API)';
    let response = await fetch(`${COPERNICUS_STAC_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'FloodWatch-GIS-Platform/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000)
    });

    // If Copernicus STAC is unreachable or rate-limited, fallback gracefully to AWS Earth Search STAC
    if (!response.ok && !COPERNICUS_STAC_URL.includes('earth-search.aws.element84.com')) {
      console.warn(`Primary STAC API status ${response.status}. Falling back to AWS Earth Search STAC...`);
      const fallbackUrl = 'https://earth-search.aws.element84.com/v1/search';
      responseProvider = 'AWS Earth Search (STAC API)';
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...payload, collections }),
        signal: AbortSignal.timeout(20000)
      });
    }

    if (!response.ok) {
      console.warn(`STAC search fallback also failed with status ${response.status}`);
      return [];
    }

    const data: any = await response.json();
    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    return data.features.map((feature: any) => {
      const collection = feature.collection || 'unknown';
      const isSentinel1 = collection.toLowerCase().includes('sentinel-1');
      return {
        provider: responseProvider,
        collection,
        sceneId: feature.id,
        acquisitionDate: feature.properties?.datetime || feature.properties?.['start_datetime'] || '',
        cloudCover: feature.properties?.['eo:cloud_cover'] ?? feature.properties?.cloud_cover,
        bbox: feature.bbox,
        assets: feature.assets || {},
        orbitState: feature.properties?.['sat:orbit_state'] || feature.properties?.orbit_state,
        polarization: isSentinel1 ? (feature.properties?.['sar:polarizations']?.[0] || 'VV+VH') : undefined
      };
    });
  } catch (error: any) {
    console.error(`STAC API search error: ${error.message}`);
    return [];
  }
};
