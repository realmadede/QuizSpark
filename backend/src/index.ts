import { prisma } from './prisma';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { app, httpServer, io } from './socket/io';

// Route handlers
import authRoutes from './routes/auth';
import quizRoutes from './routes/quizzes';
import sessionRoutes from './routes/sessions';
import playerRoutes from './routes/players';

// Socket handlers
import { initializeSocket } from './socket/handlers';

dotenv.config();

// Middleware
app.use(express.json());
app.use(cookieParser());
// Security Headers
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false, // Only enable when domains are fully verified for HSTS preload
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline often needed for react frameworks
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  })
);

// Permissions-Policy
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()'
  );
  next();
});
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: 'deny' })); // Prevent embedding

// CORS Config
const isProd = process.env.NODE_ENV === 'production';
app.use(
  cors({
    origin: function (origin, callback) {
      if (!isProd) {
        // Local development allows common dev ports
        if (
          !origin ||
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1')
        ) {
          return callback(null, true);
        }
      } else {
        // Production strictly enforces FRONTEND_URL
        const allowedProdOrigin = process.env.FRONTEND_URL?.replace(/\/$/, '');
        if (origin === allowedProdOrigin) {
          return callback(null, true);
        }
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/players', playerRoutes);

// Socket.IO setup
initializeSocket(io);

// Error handling middleware
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
});
