import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseDB } from '../db/supabase';

export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  id: string; // Must match auth.users.id
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
}

export class ProfileModelSupabase {
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
   * Create a new profile
   * Note: This is usually done automatically via trigger when user signs up
   */
  async create(profileData: CreateProfileData): Promise<Profile> {
    const { data, error} = await this.supabase
      .from('profiles')
      .insert({
        id: profileData.id,
        email: profileData.email,
        name: profileData.name || null,
        avatar_url: profileData.avatar_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Find profile by email
   */
  async findByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error finding profile:', error);
      throw new Error(`Failed to find profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Find profile by ID
   */
  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error finding profile:', error);
      throw new Error(`Failed to find profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Update profile
   */
  async update(id: string, updates: UpdateProfileData): Promise<Profile | null> {
    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.avatar_url !== undefined) {
      updateData.avatar_url = updates.avatar_url;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete profile
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      throw new Error(`Failed to delete profile: ${error.message}`);
    }

    return true;
  }
}
