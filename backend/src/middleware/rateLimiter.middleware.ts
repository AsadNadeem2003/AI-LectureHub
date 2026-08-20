import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Industry-standard rate limiter for authentication routes (Login, Set Password)
 * Prevents automated brute-force attacks while accommodating legitimate human typos
 * Limit: 20 failed attempts per 5 minutes per IP (successful logins are not penalized).
 */
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 attempts
  skipSuccessfulRequests: true, // Only count failed attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many failed login attempts. Please wait 5 minutes before trying again.',
    });
  },
});

/**
 * General API rate limiter for standard endpoints
 * Limit: 120 requests per 1 minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
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
