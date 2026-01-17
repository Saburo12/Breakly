import { Request, Response } from 'express';
import { createClaudeService } from '../services/claudeAgent';
import { ProjectModelSupabase } from '../models/ProjectSupabase';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Controller for code generation operations
 */
export class CodeGenController {
  private claudeService: any = null;
  private projectModel = new ProjectModelSupabase();

  /**
   * Lazy load Claude service to ensure env vars are loaded
   */
  private getClaudeService() {
    if (!this.claudeService) {
      this.claudeService = createClaudeService();
    }
    return this.claudeService;
  }

  /**
   * Stream code generation using SSE
   * POST /api/generate/stream
   */
  streamGeneration = asyncHandler(async (req: Request, res: Response) => {
    let { prompt, projectId } = req.body;
    let existingFiles = req.body.existingFiles;
    const uploadedFiles = (req as any).files || [];

    // Parse existingFiles if it's a JSON string (from FormData)
    if (typeof existingFiles === 'string') {
      try {
        existingFiles = JSON.parse(existingFiles);
      } catch (e) {
        console.warn('Failed to parse existingFiles:', e);
        existingFiles = undefined;
      }
    }

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Append file information to prompt
    if (uploadedFiles && uploadedFiles.length > 0) {
      const textFiles = [];
      const imageFiles = [];
      const otherFiles = [];

      for (const file of uploadedFiles) {
        const mimeType = file.mimetype || '';
        const fileName = file.originalname || '';

        if (mimeType.startsWith('image/')) {
          // Convert image to base64 for Claude to analyze
          const base64Data = file.buffer.toString('base64');
          imageFiles.push({
            name: fileName,
            base64: base64Data,
            mimeType: mimeType,
          });
        } else if (
          mimeType.startsWith('text/') ||
          mimeType.includes('json') ||
          mimeType.includes('javascript') ||
          mimeType.includes('xml') ||
          fileName.match(/\.(txt|json|js|ts|tsx|jsx|py|html|css|md|csv)$/i)
        ) {
          textFiles.push({ name: fileName, content: file.buffer.toString('utf-8') });
        } else {
          otherFiles.push(fileName);
        }
      }

      // Add text files to prompt
      if (textFiles.length > 0) {
        prompt += '\n\n--- Attached Text Files ---\n';
        for (const file of textFiles) {
          prompt += `\nFile: ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n`;
        }
      }

      // Add images with base64 data
      if (imageFiles.length > 0) {
        prompt += '\n\n--- IMPORTANT: User Has Attached Images ---\n';
        prompt += 'The following images have been uploaded and MUST be used in the generated code:\n\n';
        for (const file of imageFiles) {
          prompt += `📸 ${file.name} - This image will be available at /assets/${file.name}\n`;
        }
        prompt += '\n⚠️ CRITICAL: You MUST reference these images in your code using /assets/filename.jpg\n';
        prompt += 'Example: <img src="/assets/${imageFiles[0].name}" /> or style={{backgroundImage: "url(/assets/${imageFiles[0].name})"}}\n';
        prompt += 'DO NOT use placeholder images - USE THE UPLOADED FILES!\n';
        // Store images for later use in the message payload
        (req as any).imageFiles = imageFiles;
      }

      // Add reference to other files
      if (otherFiles.length > 0) {
        prompt += `\n\n--- Other Attached Files ---\n${otherFiles.map(name => `- ${name}`).join('\n')}`;
      }
    }

    // Verify project access if projectId provided (skip if DB not available)
    if (projectId) {
      try {
        const project = await this.projectModel.findById(projectId);

        if (!project) {
          res.status(404).json({ error: 'Project not found' });
          return;
        }

        if (req.user && project.user_id !== req.user.id) {
          res.status(403).json({ error: 'Access denied' });
          return;
        }

        // Record generation start
        try {
          await this.projectModel.createGeneration(projectId, prompt);
        } catch (dbError) {
          console.warn('⚠️  Database not available, skipping generation logging:', dbError);
          // Continue without logging
        }
      } catch (dbError: any) {
        // Database not available - allow code generation to continue
        console.warn('⚠️  Database not available, skipping project verification:', dbError.message);
        // Continue without project verification
      }
    }

    // Add existing files context for iterative editing
    if (existingFiles && Array.isArray(existingFiles) && existingFiles.length > 0) {
      prompt = `# EXISTING PROJECT CONTEXT\n\nThe user has an existing project with these files:\n\n${existingFiles.map((file: any) => `## ${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\``).join('\n\n')}\n\n# USER REQUEST\n\n${prompt}\n\n# INSTRUCTIONS\n\nUpdate the existing files or create new files as needed to fulfill the user's request. If modifying existing files, output the COMPLETE updated file content, not just the changes.`;
    }

    // Start streaming with images if available
    const processedImageFiles = (req as any).imageFiles || [];
    await this.getClaudeService().generateCodeStream(prompt, res, processedImageFiles);
  });

  /**
   * Generate code without streaming (for testing)
   * POST /api/generate
   */
  generate = asyncHandler(async (req: Request, res: Response) => {
    let { prompt, projectId } = req.body;
    const uploadedFiles = (req as any).files || [];

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Append file information to prompt
    if (uploadedFiles && uploadedFiles.length > 0) {
      const textFiles = [];
      const imageFiles = [];
      const otherFiles = [];

      for (const file of uploadedFiles) {
        const mimeType = file.mimetype || '';
        const fileName = file.originalname || '';

        if (mimeType.startsWith('image/')) {
          // Convert image to base64 for Claude to analyze
          const base64Data = file.buffer.toString('base64');
          imageFiles.push({
            name: fileName,
            base64: base64Data,
            mimeType: mimeType,
          });
        } else if (
          mimeType.startsWith('text/') ||
          mimeType.includes('json') ||
          mimeType.includes('javascript') ||
          mimeType.includes('xml') ||
          fileName.match(/\.(txt|json|js|ts|tsx|jsx|py|html|css|md|csv)$/i)
        ) {
          textFiles.push({ name: fileName, content: file.buffer.toString('utf-8') });
        } else {
          otherFiles.push(fileName);
        }
      }

      // Add text files to prompt
      if (textFiles.length > 0) {
        prompt += '\n\n--- Attached Text Files ---\n';
        for (const file of textFiles) {
          prompt += `\nFile: ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n`;
        }
      }

      // Add images with base64 data
      if (imageFiles.length > 0) {
        prompt += '\n\n--- IMPORTANT: User Has Attached Images ---\n';
        prompt += 'The following images have been uploaded and MUST be used in the generated code:\n\n';
        for (const file of imageFiles) {
          prompt += `📸 ${file.name} - This image will be available at /assets/${file.name}\n`;
        }
        prompt += '\n⚠️ CRITICAL: You MUST reference these images in your code using /assets/filename.jpg\n';
        prompt += 'Example: <img src="/assets/${imageFiles[0].name}" /> or style={{backgroundImage: "url(/assets/${imageFiles[0].name})"}}\n';
        prompt += 'DO NOT use placeholder images - USE THE UPLOADED FILES!\n';
        // Store images for later use in the message payload
        (req as any).imageFiles = imageFiles;
      }

      // Add reference to other files
      if (otherFiles.length > 0) {
        prompt += `\n\n--- Other Attached Files ---\n${otherFiles.map(name => `- ${name}`).join('\n')}`;
      }
    }

    // Verify project access if projectId provided (skip if DB not available)
    if (projectId) {
      try {
        const project = await this.projectModel.findById(projectId);

        if (!project) {
          res.status(404).json({ error: 'Project not found' });
          return;
        }

        if (req.user && project.user_id !== req.user.id) {
          res.status(403).json({ error: 'Access denied' });
          return;
        }
      } catch (dbError: any) {
        // Database not available - allow code generation to continue
        console.warn('⚠️  Database not available, skipping project verification:', dbError.message);
        // Continue without project verification
      }
    }

    // Generate code
    const processedImageFiles = (req as any).imageFiles || [];
    const files = await this.getClaudeService().generateCode(prompt, processedImageFiles);

    // Save files to project if projectId provided (skip if DB not available)
    if (projectId) {
      try {
        for (const file of files) {
          await this.projectModel.createFile({
            project_id: projectId,
            name: file.name,
            content: file.content,
            type: file.language,
            path: file.path,
            language: file.language,
          });
        }
      } catch (dbError) {
        console.warn('⚠️  Database not available, skipping file save:', dbError);
        // Continue without saving files
      }
    }

    res.json({
      success: true,
      filesGenerated: files.length,
      files,
    });
  });

  /**
   * Save generated files to project
   * POST /api/generate/save
   */
  saveFiles = asyncHandler(async (req: Request, res: Response) => {
    const { projectId, files } = req.body;

    if (!projectId || !files || !Array.isArray(files)) {
      res.status(400).json({ error: 'Project ID and files are required' });
      return;
    }

    try {
      // Verify project access
      const project = await this.projectModel.findById(projectId);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (req.user && project.user_id !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Save files
      const savedFiles = [];
      for (const file of files) {
        const savedFile = await this.projectModel.createFile({
          project_id: projectId,
          name: file.name,
          content: file.content,
          type: file.language,
          path: file.path || file.name,
          language: file.language,
        });
        savedFiles.push(savedFile);
      }

      res.json({
        success: true,
        filesSaved: savedFiles.length,
        files: savedFiles,
      });
    } catch (dbError: any) {
      console.error('Database error when saving files:', dbError);
      res.status(503).json({ 
        error: 'Database not available. Please ensure PostgreSQL is running.',
        details: dbError.message 
      });
    }
  });
}

// Create controller instance
export const codeGenController = new CodeGenController();
