import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Strict rate limiter for sensitive authentication routes (Login, Set Password)
 * Limit: 5 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});

/**
 * General API rate limiter for standard endpoints
 * Limit: 50 requests per 1 minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Rate limit exceeded. Please slow down your requests.',
    });
  },
});

/**
 * Rate limiter for heavy media / document uploads
 * Limit: 10 uploads per 15 minutes per IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Upload rate limit exceeded. Please wait a few minutes before uploading more documents.',
    });
  },
});
