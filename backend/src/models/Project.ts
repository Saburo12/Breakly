import { Pool } from 'pg';

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  framework?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectData {
  user_id: number;
  name: string;
  description?: string;
  framework?: string;
}

export interface File {
  id: number;
  project_id: number;
  name: string;
  content: string;
  type?: string;
  path?: string;
  language?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFileData {
  project_id: number;
  name: string;
  content: string;
  type?: string;
  path?: string;
  language?: string;
}

export class ProjectModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new project
   */
  async create(projectData: CreateProjectData): Promise<Project> {
    const query = `
      INSERT INTO projects (user_id, name, description, framework)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      projectData.user_id,
      projectData.name,
      projectData.description || null,
      projectData.framework || null
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find project by ID
   */
  async findById(id: number): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all projects for a user
   */
  async findByUserId(userId: number): Promise<Project[]> {
    const query = `
      SELECT * FROM projects
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Update project
   */
  async update(id: number, updates: Partial<CreateProjectData>): Promise<Project | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.framework !== undefined) {
      fields.push(`framework = $${paramCount++}`);
      values.push(updates.framework);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete project
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM projects WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Create a file for a project
   */
  async createFile(fileData: CreateFileData): Promise<File> {
    const query = `
      INSERT INTO files (project_id, name, content, type, path, language)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (project_id, path)
      DO UPDATE SET content = $3, type = $4, language = $6, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      fileData.project_id,
      fileData.name,
      fileData.content,
      fileData.type || null,
      fileData.path || fileData.name,
      fileData.language || null
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all files for a project
   */
  async getFiles(projectId: number): Promise<File[]> {
    const query = `
      SELECT * FROM files
      WHERE project_id = $1
      ORDER BY path ASC
    `;
    const result = await this.pool.query(query, [projectId]);
    return result.rows;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: number): Promise<boolean> {
    const query = 'DELETE FROM files WHERE id = $1';
    const result = await this.pool.query(query, [fileId]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Record a generation
   */
  async createGeneration(projectId: number, prompt: string): Promise<number> {
    const query = `
      INSERT INTO generations (project_id, prompt, status)
      VALUES ($1, $2, 'in_progress')
      RETURNING id
    `;
    const result = await this.pool.query(query, [projectId, prompt]);
    return result.rows[0].id;
  }

  /**
   * Update generation status
   */
  async updateGeneration(
    generationId: number,
    status: string,
    filesGenerated?: number,
    errorMessage?: string
  ): Promise<void> {
    const query = `
      UPDATE generations
      SET status = $1, files_generated = $2, error_message = $3, completed_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;
    await this.pool.query(query, [status, filesGenerated || 0, errorMessage || null, generationId]);
  }
}
