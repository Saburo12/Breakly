import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseDB: SupabaseClient | null = null;

/**
 * Get Supabase Database Client (lazy initialization)
 * This client uses the service role key for admin operations
 */
export function getSupabaseDB(): SupabaseClient {
  if (_supabaseDB) {
    return _supabaseDB;
  }

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('⚠️ Supabase credentials missing!');
    console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');
    throw new Error('Supabase URL and Service Role Key are required for database operations');
  }

  _supabaseDB = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('✅ Supabase Database client initialized');
  return _supabaseDB;
}

/**
 * Test Supabase database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseDB();

    // Try to query a table to test connection
    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (expected if not migrated yet)
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase database connected successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

/**
 * Database type definitions
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          framework: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          framework?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          framework?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          content: string;
          type: string | null;
          path: string | null;
          language: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          content: string;
          type?: string | null;
          path?: string | null;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          content?: string;
          type?: string | null;
          path?: string | null;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          project_id: string;
          prompt: string;
          status: string;
          files_generated: number;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          prompt: string;
          status?: string;
          files_generated?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          prompt?: string;
          status?: string;
          files_generated?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}
