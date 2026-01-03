import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { IntegrationService } from '../services/integrationService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * Store GitHub integration after OAuth
 * POST /api/integrations/github
 */
router.post(
  '/github',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { access_token, username, user_id } = req.body;

    if (!access_token || !username || !user_id) {
      res.status(400).json({ error: 'Missing required fields: access_token, username, user_id' });
      return;
    }

    const { data, error } = await IntegrationService.storeGitHubIntegration(
      userId,
      access_token,
      username,
      user_id
    );

    if (error) {
      console.error('Error storing GitHub integration:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ success: true, integration: data });
  })
);

/**
 * Get GitHub connection status
 * GET /api/integrations/github
 */
router.get(
  '/github',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const { data, error } = await IntegrationService.getGitHubIntegration(userId);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's expected when no integration exists
      console.error('Error getting GitHub integration:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    if (!data) {
      res.json({ connected: false, integration: null });
      return;
    }

    // Don't send access_token to frontend
    const { access_token, ...safeData } = data;
    res.json({ connected: true, integration: safeData });
  })
);

/**
 * Disconnect GitHub integration
 * DELETE /api/integrations/github
 */
router.delete(
  '/github',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const { error } = await IntegrationService.removeGitHubIntegration(userId);

    if (error) {
      console.error('Error disconnecting GitHub:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ success: true });
  })
);

/**
 * Get GitHub access token for API calls
 * GET /api/integrations/github/token
 */
router.get(
  '/github/token',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const { data, error } = await IntegrationService.getGitHubIntegration(userId);

    if (error || !data) {
      res.status(404).json({ error: 'GitHub not connected' });
      return;
    }

    res.json({ access_token: data.access_token });
  })
);

export default router;
