import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) return true;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes('<username>')) {
    console.warn('⚠️ MONGODB_URI not configured or using placeholder. Running without active MongoDB connection.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

export const getDbStatus = (): { connected: boolean; host?: string } => {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    host: mongoose.connection.host || undefined
  };
};
