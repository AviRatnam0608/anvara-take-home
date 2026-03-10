import express, { type Application } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';

const app: Application = express();
const PORT = process.env.BACKEND_PORT || 4291;

// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(limiter);
// CORS configured with credentials to allow session cookies from the frontend
app.use(
  cors({
    origin: process.env.BETTER_AUTH_URL || ['http://localhost:3847', 'http://127.0.0.1:3847'],
    credentials: true,
  }),
);
app.use(express.json());

// Mount all API routes
app.use('/api', routes);

export default app;
