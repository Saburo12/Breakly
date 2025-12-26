import { Router, Request, Response } from 'express';
import { ProjectModelSupabase } from '../models/ProjectSupabase';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const projectModel = new ProjectModelSupabase();

/**
 * GET /api/projects
 * List all projects for authenticated user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projects = await projectModel.findByUserId(req.user.id);
    res.json({ projects });
  })
);

/**
 * POST /api/projects
 * Create a new project
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, framework } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const project = await projectModel.create({
      user_id: req.user.id,
      name,
      description,
      framework,
    });

    res.status(201).json({ project });
  })
);

/**
 * GET /api/projects/:id
 * Get project details
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projectId = req.params.id;
    const project = await projectModel.findById(projectId);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ project });
  })
);

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projectId = req.params.id;
    const project = await projectModel.findById(projectId);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { name, description, framework } = req.body;
    const updated = await projectModel.update(projectId, {
      name,
      description,
      framework,
    });

    res.json({ project: updated });
  })
);

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projectId = req.params.id;
    const project = await projectModel.findById(projectId);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await projectModel.delete(projectId);
    res.json({ success: true });
  })
);

/**
 * GET /api/projects/:id/files
 * Get all files for a project
 */
router.get(
  '/:id/files',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projectId = req.params.id;
    const project = await projectModel.findById(projectId);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const files = await projectModel.getFiles(projectId);
    res.json({ files });
  })
);

/**
 * DELETE /api/projects/:projectId/files/:fileId
 * Delete a file
 */
router.delete(
  '/:projectId/files/:fileId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projectId = req.params.projectId;
    const project = await projectModel.findById(projectId);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const fileId = req.params.fileId;
    await projectModel.deleteFile(fileId);

    res.json({ success: true });
  })
);

export default router;
