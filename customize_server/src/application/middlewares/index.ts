import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { env } from '../../shared/config/env';
import { errorHandler } from '../../shared/errors/errorHandler';

// CORS configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Check if allowedOrigins is defined and is an array
    if (!env.ALLOWED_ORIGINS || !Array.isArray(env.ALLOWED_ORIGINS)) {
      return callback(null, true); // Allow all origins if config is broken
    }

    if (env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});

// Security middleware
export const securityMiddleware = [
  helmet(),
  mongoSanitize(),
  hpp(),
];

// Compression
export const compressionMiddleware = compression();

// Rate limiting
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Request logging (basic)
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
};

// Error handler (must be last)
export { errorHandler };

