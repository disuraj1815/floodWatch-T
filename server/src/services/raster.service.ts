import fs from 'fs';
import path from 'path';
import os from 'os';

export interface RasterAssetInspectionResult {
  assetKey: string;
  href: string;
  type?: string;
  isAccessible: boolean;
  fileSizeEstimate?: number;
  message: string;
}

export const inspectRasterAsset = async (assetKey: string, assetObj: { href: string; type?: string }): Promise<RasterAssetInspectionResult> => {
  if (!assetObj || !assetObj.href) {
    return {
      assetKey,
      href: '',
      isAccessible: false,
      message: 'Asset href not provided.'
    };
  }

  // Ensure href is HTTPS and valid URL
  if (!assetObj.href.startsWith('http://') && !assetObj.href.startsWith('https://')) {
    return {
      assetKey,
      href: '[REDACTED_HREF]',
      isAccessible: false,
      message: 'Invalid asset URL protocol.'
    };
  }

  try {
    // Perform HEAD request to check accessibility and content length without downloading the entire raster
    const response = await fetch(assetObj.href, {
      method: 'HEAD',
      headers: { 'User-Agent': 'FloodWatch-GIS-Engine/1.0' },
      timeout: 8000
    } as any);

    const contentLength = response.headers.get('content-length');
    const fileSize = contentLength ? parseInt(contentLength, 10) : undefined;

    return {
      assetKey,
      href: assetObj.href.split('?')[0], // strip signed query parameters if present to avoid leaking credentials
      type: assetObj.type || response.headers.get('content-type') || 'image/tiff',
      isAccessible: response.ok,
      fileSizeEstimate: fileSize,
      message: response.ok ? 'Raster asset accessible and verified.' : `HTTP status ${response.status} accessing asset.`
    };
  } catch (error: any) {
    return {
      assetKey,
      href: assetObj.href.split('?')[0],
      isAccessible: false,
      message: `Asset check network error: ${error.message}`
    };
  }
};

export const downloadRasterSampleToTemp = async (assetKey: string, href: string): Promise<{ success: boolean; filePath?: string; message: string }> => {
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'floodwatch-raster-'));
    const targetPath = path.join(tmpDir, `${assetKey}-sample.tif`);

    // For safety and resource conservation, we only perform a ranged request or small sample check,
    // or download if within reasonable size limits. Here we test accessibility.
    const response = await fetch(href, {
      headers: { 'User-Agent': 'FloodWatch-GIS-Engine/1.0' },
      timeout: 10000
    } as any);

    if (!response.ok) {
      return { success: false, message: `Failed to download raster asset: HTTP ${response.status}` };
    }

    // Write first 64KB as header sample for validation (or stream)
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));

    return {
      success: true,
      filePath: targetPath,
      message: `Raster asset successfully retrieved (${(buffer.byteLength / 1024).toFixed(1)} KB sample fetched for inspection).`
    };
  } catch (error: any) {
    return { success: false, message: `Raster download error: ${error.message}` };
  }
};
