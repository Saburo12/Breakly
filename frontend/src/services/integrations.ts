import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Service for managing user integrations (GitHub, etc.)
 */
export class IntegrationService {
  /**
   * Get the current user's authentication token
   */
  private static async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Store GitHub integration after OAuth flow
   */
  static async storeGitHubIntegration(
    accessToken: string,
    username: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/api/integrations/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          access_token: accessToken,
          username,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to store integration' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error storing GitHub integration:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if GitHub is connected
   */
  static async checkGitHubConnection(): Promise<{
    connected: boolean;
    integration?: any;
    error?: string;
  }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { connected: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/api/integrations/github`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { connected: false, error: data.error };
      }

      return data;
    } catch (error: any) {
      console.error('Error checking GitHub connection:', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Disconnect GitHub integration
   */
  static async disconnectGitHub(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/api/integrations/github`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to disconnect' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error disconnecting GitHub:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get GitHub access token for API calls
   */
  static async getGitHubToken(): Promise<string | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.warn('[Integration] No auth token found');
        return null;
      }

      // Try to get token from database first
      const response = await fetch(`${API_URL}/api/integrations/github/token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          console.log('[Integration] ✅ Got GitHub token from database');
          return data.access_token;
        }
      }

      // Fallback: Check session for provider_token (if user connected before deployment)
      console.warn('[Integration] Database token not found, checking session fallback...');
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.provider_token) {
        console.log('[Integration] ✅ Using GitHub token from session (fallback)');

        // Try to store it in database for next time
        if (session.user?.user_metadata?.user_name && session.user?.user_metadata?.provider_id) {
          console.log('[Integration] Storing session token in database for future use...');
          await this.storeGitHubIntegration(
            session.provider_token,
            session.user.user_metadata.user_name,
            session.user.user_metadata.provider_id
          );
        }

        return session.provider_token;
      }

      console.error('[Integration] ❌ No GitHub token found in database or session');
      return null;
    } catch (error) {
      console.error('[Integration] Error getting GitHub token:', error);

      // Final fallback: try session directly
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.provider_token) {
          console.log('[Integration] ✅ Emergency fallback to session token');
          return session.provider_token;
        }
      } catch (fallbackError) {
        console.error('[Integration] Fallback also failed:', fallbackError);
      }

      return null;
    }
  }
}
