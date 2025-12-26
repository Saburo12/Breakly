/**
 * Type definitions for the Lovable Clone application
 */

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  framework?: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: number;
  project_id: number;
  name: string;
  content: string;
  type?: string;
  path?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedFile {
  name: string;
  content: string;
  language: string;
  path: string; // Full path including folders, e.g., "src/components/Button.tsx"
}

export interface StreamChunk {
  type: 'content' | 'file_start' | 'file_complete' | 'done' | 'error';
  content?: string;
  fileName?: string;
  language?: string;
  fileIndex?: number;
  filesGenerated?: number;
  error?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: GeneratedFile[];
}

export interface ApiError {
  error: string;
  message?: string;
}
