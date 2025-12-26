import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, Project, File, User } from '../types';

/**
 * API client configuration
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Axios instance with interceptors
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - attach token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear auth
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Authentication APIs
   */
  auth = {
    register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
      const response = await this.client.post<AuthResponse>('/api/auth/register', {
        email,
        password,
        name,
      });
      return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await this.client.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });
      return response.data;
    },

    me: async (): Promise<{ user: User }> => {
      const response = await this.client.get<{ user: User }>('/api/auth/me');
      return response.data;
    },
  };

  /**
   * Project APIs
   */
  projects = {
    list: async (): Promise<Project[]> => {
      const response = await this.client.get<{ projects: Project[] }>('/api/projects');
      return response.data.projects;
    },

    create: async (data: {
      name: string;
      description?: string;
      framework?: string;
    }): Promise<Project> => {
      const response = await this.client.post<{ project: Project }>('/api/projects', data);
      return response.data.project;
    },

    get: async (id: number): Promise<Project> => {
      const response = await this.client.get<{ project: Project }>(`/api/projects/${id}`);
      return response.data.project;
    },

    update: async (
      id: number,
      data: { name?: string; description?: string; framework?: string }
    ): Promise<Project> => {
      const response = await this.client.put<{ project: Project }>(`/api/projects/${id}`, data);
      return response.data.project;
    },

    delete: async (id: number): Promise<void> => {
      await this.client.delete(`/api/projects/${id}`);
    },

    getFiles: async (id: number): Promise<File[]> => {
      const response = await this.client.get<{ files: File[] }>(`/api/projects/${id}/files`);
      return response.data.files;
    },

    deleteFile: async (projectId: number, fileId: number): Promise<void> => {
      await this.client.delete(`/api/projects/${projectId}/files/${fileId}`);
    },
  };

  /**
   * Code generation APIs
   */
  generate = {
    /**
     * Get SSE stream URL for code generation
     */
    getStreamUrl: (prompt: string, projectId?: number): string => {
      new URLSearchParams({
        prompt,
        ...(projectId && { projectId: projectId.toString() }),
      });
      return `${API_URL}/api/generate/stream`;
    },

    /**
     * Save generated files to project
     */
    saveFiles: async (
      projectId: number,
      files: Array<{ name: string; content: string; language: string; path: string }>
    ): Promise<File[]> => {
      const response = await this.client.post<{ files: File[] }>('/api/generate/save', {
        projectId,
        files,
      });
      return response.data.files;
    },
  };

  /**
   * Get raw axios instance for custom requests
   */
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const api = new ApiClient();
