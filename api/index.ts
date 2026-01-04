import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linkedinRoutes from './src/routes/linkedin';
import walletRoutes from './src/routes/wallet';
import shareRoutes from './src/routes/share';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
});

// Routes - Support both with and without /api prefix
// In Vercel, when rewritten to /api/index.ts, the path might be /api/health or /health
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
        vercel: true
    });
});

// JSON 404 handler
app.use((req, res) => {
    console.log(`[404] No route found for: ${req.path}`);
    res.status(404).json({ error: 'API route not found', path: req.path });
});

export default app;
