import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import alertRoutes from './routes/alert.routes';
import deviceRoutes from './routes/device.routes';
import uploadRoutes from './routes/uploads.routes';
import { errorHandler } from './middleware/error.middleware';
import { initRealtime } from './services/realtime.service';
import { env, isProd, isDev, allowedOrigins } from './config/env';

const app = express();

// Behind Vercel/Render/Nginx proxies, correct client IPs for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: isDev ? false : undefined,
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow native WebViews / curl (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
if (isDev) app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Rate limiting (relaxed in dev/test)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev || process.env.NODE_ENV === 'test' ? 10000 : 300,
});
app.use('/api/', limiter);

// Root
app.get('/', (_req, res) => {
  res.json({ message: 'Samudra-Alert API is running', status: 'OK', version: '2.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/uploads', uploadRoutes);

// Error handling
app.use(errorHandler);

// Export app for supertest
const server = http.createServer(app);
initRealtime(server);

// Connect DB, then listen (skipped when imported by tests with existing connection)
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(env.MONGODB_URI)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('✅ Connected to MongoDB');
      server.listen(env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`🛡️ Samudra-Alert server (v2) on port ${env.PORT}`);
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

export { app, server };
export default app;
