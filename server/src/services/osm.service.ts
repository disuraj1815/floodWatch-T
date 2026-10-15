export interface OSMFeature {
  id: string;
  name: string;
  type: 'Bridge' | 'Road Segment' | 'Hospital' | 'School' | 'Settlement' | 'Building';
  lat: number;
  lng: number;
  tags: Record<string, string>;
}

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

export const fetchOSMInfrastructure = async (aoi: { minLat: number; maxLat: number; minLng: number; maxLng: number }): Promise<OSMFeature[]> => {
  try {
    // Overpass QL query for nodes/ways/relations with highway, amenity, or building tags within AOI bbox (minLat, minLng, maxLat, maxLng)
    const query = `
      [out:json][timeout:15];
      (
        node["highway"](${aoi.minLat},${aoi.minLng},${aoi.maxLat},${aoi.maxLng});
        way["highway"](${aoi.minLat},${aoi.minLng},${aoi.maxLat},${aoi.maxLng});
        node["amenity"~"hospital|school"](${aoi.minLat},${aoi.minLng},${aoi.maxLat},${aoi.maxLng});
        way["amenity"~"hospital|school"](${aoi.minLat},${aoi.minLng},${aoi.maxLat},${aoi.maxLng});
        node["bridge"](${aoi.minLat},${aoi.minLng},${aoi.maxLat},${aoi.maxLng});
        way["bridge"](${aoi.minLat},${aoi.minLng},${aoi.maxLat},${aoi.maxLng});
      );
      out center tags;
    `;

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'User-Agent': 'FloodWatch-GIS-Platform/1.0' },
      body: query,
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      console.warn(`Overpass API returned status ${response.status}: ${response.statusText}`);
      return [];
    }

    const data: any = await response.json();
    if (!data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    const features: OSMFeature[] = [];
    for (const el of data.elements) {
      if (!el.tags) continue;
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (lat === undefined || lat === null || lng === undefined || lng === null) continue;

      let type: OSMFeature['type'] = 'Road Segment';
      if (el.tags.bridge === 'yes' || el.tags.man_made === 'bridge') {
        type = 'Bridge';
      } else if (el.tags.amenity === 'hospital') {
        type = 'Hospital';
      } else if (el.tags.amenity === 'school') {
        type = 'School';
      } else if (el.tags.building) {
        type = 'Building';
      }

      const name = el.tags.name || `${type} (${el.id})`;

      features.push({
        id: `osm_${el.type}_${el.id}`,
        name,
        type,
        lat,
        lng,
        tags: el.tags
      });

      if (features.length >= 50) break; // limit to 50 items for performant UI rendering
    }

    return features;
  } catch (error: any) {
    console.warn(`OSM Overpass API fetch warning: ${error.message}`);
    return [];
  }
};
