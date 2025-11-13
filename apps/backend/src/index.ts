import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import friendRequestRoutes from './routes/friend-request.route';
import friendsRoutes from './routes/friends.route';
import { prisma } from '@workspace/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // allows cookies from frontend
  })
);
app.use(express.json());
app.use(cookieParser());
// Enhanced morgan logging

app.use(morgan('dev'));

// 🛣️ Routes
app.use('/auth', authRoutes);
app.use('/friend-request', friendRequestRoutes);
app.use('/friends', friendsRoutes);

// 🩺 Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ❗ Global error handler (always last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 🚀 Server start + database connection
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Keep it connected while the server
startServer();
