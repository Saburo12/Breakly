import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseDB } from '../db/supabase';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  framework?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  user_id: string;
  name: string;
  description?: string;
  framework?: string;
}

export interface File {
  id: string;
  project_id: string;
  name: string;
  content: string;
  type?: string;
  path?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFileData {
  project_id: string;
  name: string;
  content: string;
  type?: string;
  path?: string;
  language?: string;
}

export class ProjectModelSupabase {
  private _supabase: SupabaseClient | null = null;

  /**
   * Lazy load Supabase client to ensure env vars are loaded
   */
  private get supabase(): SupabaseClient {
    if (!this._supabase) {
      this._supabase = getSupabaseDB();
    }
    return this._supabase;
  }

  /**
   * Create a new project
   */
  async create(projectData: CreateProjectData): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        user_id: projectData.user_id,
        name: projectData.name,
        description: projectData.description || null,
        framework: projectData.framework || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  /**
   * Find project by ID
   */
  async findById(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error finding project:', error);
      throw new Error(`Failed to find project: ${error.message}`);
    }

    return data;
  }

  /**
   * Find all projects for a user
   */
  async findByUserId(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error finding projects by user:', error);
      throw new Error(`Failed to find projects: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update project
   */
  async update(id: string, updates: Partial<CreateProjectData>): Promise<Project | null> {
    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.framework !== undefined) {
      updateData.framework = updates.framework;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await this.supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    return true;
  }

  /**
   * Create a file for a project
   */
  async createFile(fileData: CreateFileData): Promise<File> {
    const { data, error } = await this.supabase
      .from('files')
      .upsert({
        project_id: fileData.project_id,
        name: fileData.name,
        content: fileData.content,
        type: fileData.type || null,
        path: fileData.path || fileData.name,
        language: fileData.language || null,
      }, {
        onConflict: 'project_id,path',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating file:', error);
      throw new Error(`Failed to create file: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all files for a project
   */
  async getFiles(projectId: string): Promise<File[]> {
    const { data, error } = await this.supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('path', { ascending: true });

    if (error) {
      console.error('Error getting files:', error);
      throw new Error(`Failed to get files: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return true;
  }

  /**
   * Record a generation
   */
  async createGeneration(projectId: string, prompt: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('generations')
      .insert({
        project_id: projectId,
        prompt,
        status: 'in_progress',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating generation:', error);
      throw new Error(`Failed to create generation: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Update generation status
   */
  async updateGeneration(
    generationId: string,
    status: string,
    filesGenerated?: number,
    errorMessage?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('generations')
      .update({
        status,
        files_generated: filesGenerated || 0,
        error_message: errorMessage || null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationId);

    if (error) {
      console.error('Error updating generation:', error);
      throw new Error(`Failed to update generation: ${error.message}`);
    }
  }
}
