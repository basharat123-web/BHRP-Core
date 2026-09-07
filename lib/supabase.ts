import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helper functions
export const signInWithGoogle = async () => {
  if (!supabase) return { error: new Error('Supabase not configured') };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
    },
  });
  return { data, error };
};

export const signOutUser = async () => {
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email || '',
      fullName: data.full_name || 'BHRP Member',
      avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ingameId: data.ingame_id || 'BH-NEW',
      rank: data.rank || 'Member',
      discordTag: data.discord_tag || 'User#0000',
      bio: data.bio || 'BHRP RolePlay Enthusiast',
      xp: data.xp || 100,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.ingameId !== undefined) dbUpdates.ingame_id = updates.ingameId;
    if (updates.discordTag !== undefined) dbUpdates.discord_tag = updates.discordTag;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    return !error;
  } catch (err) {
    console.error('Error updating profile:', err);
    return false;
  }
};

