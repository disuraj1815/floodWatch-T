import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes('<username>')) {
    console.warn('⚠️ MONGODB_URI not configured or using placeholder. Running without active MongoDB connection.');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully`);
    return true;
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

export const getDbStatus = (): { status: string; connected: boolean; host?: string; readyState: number; message: string } => {
  const state = mongoose.connection.readyState;
  let statusStr = 'disconnected';
  if (state === 1) statusStr = 'connected';
  else if (state === 2) statusStr = 'connecting';
  else if (state === 3) statusStr = 'disconnecting';
  else if (state === 0) statusStr = 'disconnected';

  return {
    status: statusStr,
    connected: state === 1,
    readyState: state,
    host: mongoose.connection.host || undefined,
    message: state === 1 ? 'Database connected successfully' : (state === 2 ? 'Connecting to database...' : 'Database disconnected or connection error')
  };
};
