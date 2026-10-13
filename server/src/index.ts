import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
import apiRoutes from './routes/api.routes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection attempt
connectDB();

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'FloodWatch Backend API',
    version: '1.0.0',
    status: 'online',
    endpoints: [
      'GET /api/health',
      'POST /api/analysis',
      'GET /api/analysis/:id',
      'GET /api/analysis/:id/status',
      'GET /api/analysis/:id/report'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FloodWatch backend server running on port ${PORT}`);
});
