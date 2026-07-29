import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { notFound, errorHandler } from './middlewares/error.middleware';
import { env } from './config/env';

import authRoutes from './routes/auth.routes';
import teamRoutes from './routes/team.routes';
import agentRoutes from './routes/agent.routes';
import juryRoutes from './routes/jury.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/api/health', (req, res) => res.send('API is running...'));
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/jury', juryRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
