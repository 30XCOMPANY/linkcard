import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linkedinRoutes from './routes/linkedin';
import walletRoutes from './routes/wallet';
import shareRoutes from './routes/share';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/share', shareRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Only listen if this is the main module
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 LinkCard API running on http://localhost:${PORT}`);
  });
}

export default app;


