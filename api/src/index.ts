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

// Routes - Support both with and without /api prefix
const routes = (path: string, router: express.Router) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
};

routes('/linkedin', linkedinRoutes);
routes('/wallet', walletRoutes);
routes('/share', shareRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// JSON 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.path });
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


