import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * NOTE: Authentication is now handled by Supabase on the frontend.
 *
 * Supabase provides:
 * - Email/password authentication
 * - OAuth (Google, GitHub, etc.)
 * - Magic link authentication
 * - Email verification
 * - Password reset
 * - Session management
 * - JWT token generation and validation
 *
 * All auth routes are handled by Supabase Auth API from the frontend.
 * Backend only needs to verify the JWT tokens (handled in middleware/auth.ts)
 */

/**
 * GET /api/auth/me
 * Get current authenticated user
 * This is the only auth endpoint needed - token verification happens in middleware
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.json({
      user: req.user
    });
  })
);

export default router;
