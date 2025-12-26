import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { DaytonaService, SandboxResult } from '../services/daytonaIntegration';

const router = Router();

// Initialize Daytona service
let daytonaService: DaytonaService | null = null;

// Lazy initialization
function getDaytonaService(): DaytonaService | null {
  if (!daytonaService && process.env.DAYTONA_API_KEY) {
    daytonaService = new DaytonaService(process.env.DAYTONA_API_KEY);
  }
  return daytonaService;
}

/**
 * POST /api/sandbox/create
 * Create a new isolated Daytona sandbox with generated code
 */
router.post(
  '/create',
  asyncHandler(async (req: Request, res: Response) => {
    const daytona = getDaytonaService();

    if (!daytona || !daytona.isAvailable()) {
      res.status(503).json({
        error: 'Sandbox service not available',
        message: 'Daytona SDK is not configured. Set DAYTONA_API_KEY environment variable.',
      });
      return;
    }

    const { generatedCode, projectName, description } = req.body;

    if (!generatedCode || typeof generatedCode !== 'object') {
      res.status(400).json({
        error: 'Invalid request',
        message: 'generatedCode must be an object with filename -> content mapping',
      });
      return;
    }

    try {
      console.log(`📦 Creating sandbox for project: ${projectName || 'untitled'}`);

      // Convert generated code object to Map
      const codeMap = new Map<string, string>();
      for (const [filename, content] of Object.entries(generatedCode)) {
        codeMap.set(filename, content as string);
      }

      // Create sandbox
      const sandboxResult = await daytona.createSandbox(codeMap, {
        projectName: projectName || `app-${Date.now()}`,
        description: description || 'AI-generated application',
        autoStop: 1, // Auto-stop after 1 hour
      });

      console.log(`✅ Sandbox created successfully`);

      res.status(201).json({
        success: true,
        sandbox: sandboxResult,
        previewUrl: sandboxResult.previewUrl,
        message: 'Sandbox created and application is starting. Visit the preview URL to access your app.',
      });
    } catch (error: any) {
      console.error('❌ Sandbox creation error:', error);
      res.status(500).json({
        error: 'Failed to create sandbox',
        message: error.message || 'An unexpected error occurred',
      });
    }
  })
);

/**
 * GET /api/sandbox/:sandboxId
 * Get sandbox status and details
 */
router.get(
  '/:sandboxId',
  asyncHandler(async (req: Request, res: Response) => {
    const daytona = getDaytonaService();

    if (!daytona || !daytona.isAvailable()) {
      res.status(503).json({ error: 'Sandbox service not available' });
      return;
    }

    const { sandboxId } = req.params;

    try {
      const sandboxStatus = await daytona.getSandboxStatus(sandboxId);

      if (!sandboxStatus) {
        res.status(404).json({ error: 'Sandbox not found' });
        return;
      }

      res.json({
        success: true,
        sandbox: sandboxStatus,
      });
    } catch (error: any) {
      console.error('❌ Error getting sandbox status:', error);
      res.status(500).json({
        error: 'Failed to get sandbox status',
        message: error.message,
      });
    }
  })
);

/**
 * DELETE /api/sandbox/:sandboxId
 * Stop and delete a sandbox
 */
router.delete(
  '/:sandboxId',
  asyncHandler(async (req: Request, res: Response) => {
    const daytona = getDaytonaService();

    if (!daytona || !daytona.isAvailable()) {
      res.status(503).json({ error: 'Sandbox service not available' });
      return;
    }

    const { sandboxId } = req.params;

    try {
      const success = await daytona.deleteSandbox(sandboxId);

      if (!success) {
        res.status(500).json({ error: 'Failed to delete sandbox' });
        return;
      }

      res.json({
        success: true,
        message: 'Sandbox deleted successfully',
      });
    } catch (error: any) {
      console.error('❌ Error deleting sandbox:', error);
      res.status(500).json({
        error: 'Failed to delete sandbox',
        message: error.message,
      });
    }
  })
);

/**
 * GET /api/sandbox/list
 * List all user's sandboxes
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const daytona = getDaytonaService();

    if (!daytona || !daytona.isAvailable()) {
      res.status(503).json({ error: 'Sandbox service not available' });
      return;
    }

    try {
      const sandboxes = await daytona.listSandboxes();

      res.json({
        success: true,
        sandboxes,
        count: sandboxes.length,
      });
    } catch (error: any) {
      console.error('❌ Error listing sandboxes:', error);
      res.status(500).json({
        error: 'Failed to list sandboxes',
        message: error.message,
      });
    }
  })
);

export default router;
