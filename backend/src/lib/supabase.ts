import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Get Supabase Admin Client (lazy initialization)
 * This ensures environment variables are loaded before creating the client
 */
function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('⚠️ Supabase credentials missing!');
    console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');
    throw new Error('Supabase URL and Service Role Key are required. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('✅ Supabase Admin client initialized');
  return _supabaseAdmin;
}

/**
 * Verify Supabase JWT token
 * This validates the token sent from the frontend
 */
export async function verifySupabaseToken(token: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      throw error;
    }

    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error) {
      throw error;
    }

    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}
