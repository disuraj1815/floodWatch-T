import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisRequest extends Document {
  locationName: string;
  eventName: string;
  eventDate: Date;
  beforeDateStart: Date;
  beforeDateEnd: Date;
  afterDateStart: Date;
  afterDateEnd: Date;
  aoi: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    center: [number, number];
    name?: string;
  };
  sensor: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  discoveredScenes: Array<{
    provider: string;
    collection: string;
    sceneId: string;
    acquisitionDate: Date;
    cloudCover?: number;
    assetUrl?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisRequestSchema: Schema = new Schema({
  locationName: { type: String, required: true },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  beforeDateStart: { type: Date, required: true },
  beforeDateEnd: { type: Date, required: true },
  afterDateStart: { type: Date, required: true },
  afterDateEnd: { type: Date, required: true },
  aoi: {
    minLat: { type: Number, required: true },
    maxLat: { type: Number, required: true },
    minLng: { type: Number, required: true },
    maxLng: { type: Number, required: true },
    center: { type: [Number], required: true },
    name: { type: String }
  },
  sensor: { type: String, default: 'both' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  discoveredScenes: [{
    provider: String,
    collection: String,
    sceneId: String,
    acquisitionDate: Date,
    cloudCover: Number,
    assetUrl: String
  }]
}, { timestamps: true, suppressReservedKeysWarning: true });

export const AnalysisRequestModel = mongoose.models.AnalysisRequest || mongoose.model<IAnalysisRequest>('AnalysisRequest', AnalysisRequestSchema);
