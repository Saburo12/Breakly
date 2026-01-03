import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase admin client for server-side operations
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface GitHubIntegration {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  provider_username: string;
  access_token: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing user integrations (GitHub, etc.)
 */
export class IntegrationService {
  /**
   * Store or update GitHub integration for a user
   */
  static async storeGitHubIntegration(
    userId: string,
    accessToken: string,
    username: string,
    providerId: string
  ) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        provider: 'github',
        provider_user_id: providerId,
        provider_username: username,
        access_token: accessToken,
        scopes: ['repo', 'user'],
        is_active: true,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get active GitHub integration for a user
   */
  static async getGitHubIntegration(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'github')
      .eq('is_active', true)
      .single();

    return { data, error };
  }

  /**
   * Remove GitHub integration for a user (soft delete)
   */
  static async removeGitHubIntegration(userId: string) {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('user_integrations')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('provider', 'github');

    return { error };
  }

  /**
   * Check if user has active GitHub integration
   */
  static async hasGitHubIntegration(userId: string): Promise<boolean> {
    const { data, error } = await this.getGitHubIntegration(userId);
    return !error && !!data;
  }
}
