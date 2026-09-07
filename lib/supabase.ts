import { createClient } from '@supabase/supabase-js';
import { UserProfile, FamilyApplication, Organization, AccountType, ApplicationStatus, OrganizationStatus, ChatMessage, Member } from './types';

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

export const fetchUserProfile = async (userId: string, email?: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    const userEmail = (data.email || email || '').toLowerCase();
    const isRoot = userEmail === 'basharat81253@gmail.com' || Boolean(data.is_root_admin);
    const accountType: AccountType = isRoot ? 'Root Admin' : (data.account_type || 'Unassigned');

    return {
      id: data.id,
      email: data.email || email || '',
      fullName: data.full_name || 'BHRP Member',
      avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      ingameId: data.ingame_id || 'BH-NEW',
      rank: data.rank || 'Member',
      accountType: accountType,
      isRootAdmin: isRoot,
      currentFamilyId: data.current_family_id,
      appliedFamilyId: data.applied_family_id,
      applicationStatus: data.application_status || 'None',
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
    if (updates.accountType !== undefined) dbUpdates.account_type = updates.accountType;
    if (updates.currentFamilyId !== undefined) dbUpdates.current_family_id = updates.currentFamilyId;
    if (updates.appliedFamilyId !== undefined) dbUpdates.applied_family_id = updates.appliedFamilyId;
    if (updates.applicationStatus !== undefined) dbUpdates.application_status = updates.applicationStatus;
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

// Members Roster
export const fetchMembers = async (orgId?: string): Promise<Member[]> => {
  if (!supabase) return [];
  try {
    let query = supabase.from('members').select('*');
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((m: any) => ({
      id: m.id,
      name: m.name,
      discordTag: m.discord_tag,
      ingameId: m.ingame_id,
      rank: m.rank || 'Member',
      status: m.status || 'Active',
      strikes: m.strikes || 0,
      xp: m.xp || 100,
      joinedDate: m.joined_date || new Date().toISOString().split('T')[0],
      orgId: m.org_id,
    }));
  } catch (err) {
    return [];
  }
};

// Organizations / Families
export const fetchOrganizations = async (): Promise<Organization[]> => {
  let localOrgs: Organization[] = [];
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('bhrp_pending_orgs');
    if (raw) {
      try {
        localOrgs = JSON.parse(raw);
      } catch (e) {}
    }
  }

  if (!supabase) return localOrgs;
  try {
    const { data, error } = await supabase.from('organizations').select('*');
    if (error || !data) return localOrgs;

    const dbOrgs: Organization[] = data.map((org: any) => ({
      id: org.id,
      name: org.name,
      tag: org.tag,
      logoUrl: org.logo_url,
      description: org.description,
      status: (org.status as OrganizationStatus) || 'Approved',
      createdAt: org.created_at,
    }));

    // Merge DB orgs with localOrgs (deduplicating by id)
    const combinedMap = new Map<string, Organization>();
    dbOrgs.forEach((o) => combinedMap.set(o.id, o));
    localOrgs.forEach((o) => {
      if (!combinedMap.has(o.id)) {
        combinedMap.set(o.id, o);
      }
    });

    return Array.from(combinedMap.values());
  } catch (err) {
    return localOrgs;
  }
};

export const createOrganization = async (name: string, tag: string, description?: string, logoUrl?: string): Promise<Organization | null> => {
  const fallbackOrg: Organization = {
    id: `org-${Date.now()}`,
    name,
    tag,
    description: description || 'Official RP Family Squad',
    logoUrl: logoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
    status: 'Pending Approval',
    createdAt: new Date().toISOString(),
  };

  // Always persist locally first so Root Admin sees pending request even on fallback
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('bhrp_pending_orgs');
    let existing: Organization[] = raw ? JSON.parse(raw) : [];
    existing = [fallbackOrg, ...existing];
    localStorage.setItem('bhrp_pending_orgs', JSON.stringify(existing));
  }

  if (!supabase) return fallbackOrg;

  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert([
        {
          name,
          tag,
          description,
          logo_url: logoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
          status: 'Pending Approval',
        },
      ])
      .select()
      .single();

    if (error || !data) return fallbackOrg;

    const created: Organization = {
      id: data.id,
      name: data.name,
      tag: data.tag,
      logoUrl: data.logo_url,
      description: data.description,
      status: 'Pending Approval',
      createdAt: data.created_at,
    };

    return created;
  } catch (err) {
    return fallbackOrg;
  }
};

export const respondToOrganization = async (orgId: string, status: 'Approved' | 'Rejected'): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('bhrp_pending_orgs');
    if (raw) {
      try {
        let existing: Organization[] = JSON.parse(raw);
        existing = existing.map((o) => (o.id === orgId ? { ...o, status } : o));
        localStorage.setItem('bhrp_pending_orgs', JSON.stringify(existing));
      } catch (e) {}
    }
  }

  if (!supabase) return true;
  try {
    const { error } = await supabase.from('organizations').update({ status }).eq('id', orgId);
    return !error;
  } catch (err) {
    return true;
  }
};

// Family Applications
export const submitFamilyApplication = async (
  userId: string,
  familyId: string,
  applicantName: string,
  applicantEmail: string,
  discordTag: string,
  ingameId: string,
  message?: string
): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error: appError } = await supabase.from('family_applications').insert([
      {
        user_id: userId,
        family_id: familyId,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        discord_tag: discordTag,
        ingame_id: ingameId,
        message: message || 'Requesting to join family',
        status: 'Pending',
      },
    ]);

    if (appError) return false;

    await supabase.from('profiles').update({
      applied_family_id: familyId,
      application_status: 'Pending',
    }).eq('id', userId);

    return true;
  } catch (err) {
    console.error('Error submitting application:', err);
    return false;
  }
};

export const fetchFamilyApplications = async (familyId?: string): Promise<FamilyApplication[]> => {
  if (!supabase) return [];
  try {
    let query = supabase.from('family_applications').select('*, organizations(name)');
    if (familyId) {
      query = query.eq('family_id', familyId);
    }
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((app: any) => ({
      id: app.id,
      userId: app.user_id,
      familyId: app.family_id,
      familyName: app.organizations?.name || 'Family Squad',
      applicantName: app.applicant_name,
      applicantEmail: app.applicant_email,
      discordTag: app.discord_tag,
      ingameId: app.ingame_id,
      message: app.message,
      status: app.status as ApplicationStatus,
      createdAt: app.created_at,
    }));
  } catch (err) {
    return [];
  }
};

export const respondToApplication = async (
  applicationId: string,
  userId: string,
  familyId: string,
  status: 'Approved' | 'Rejected',
  applicantName: string,
  discordTag: string,
  ingameId: string
): Promise<boolean> => {
  if (!supabase) return false;
  try {
    await supabase.from('family_applications').update({ status }).eq('id', applicationId);

    if (status === 'Approved') {
      await supabase.from('profiles').update({
        current_family_id: familyId,
        application_status: 'Approved',
        applied_family_id: null,
      }).eq('id', userId);

      await supabase.from('members').insert([
        {
          org_id: familyId,
          name: applicantName,
          discord_tag: discordTag,
          ingame_id: ingameId,
          rank: 'Member',
          status: 'Active',
          strikes: 0,
          xp: 100,
        },
      ]);
    } else {
      await supabase.from('profiles').update({
        application_status: 'Rejected',
      }).eq('id', userId);
    }

    return true;
  } catch (err) {
    console.error('Error responding to application:', err);
    return false;
  }
};

// Live Squad Chat & Voice
export const fetchChatMessages = async (): Promise<ChatMessage[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error || !data) return [];
    return data.map((msg: any) => ({
      id: msg.id,
      userId: msg.user_id,
      senderName: msg.sender_name,
      senderRank: msg.sender_rank,
      ingameId: msg.ingame_id,
      avatarUrl: msg.avatar_url,
      text: msg.text,
      createdAt: msg.created_at,
    }));
  } catch (err) {
    return [];
  }
};

export const sendChatMessage = async (
  userId: string,
  senderName: string,
  senderRank: string,
  ingameId: string,
  avatarUrl: string,
  text: string
): Promise<ChatMessage | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          user_id: userId,
          sender_name: senderName,
          sender_rank: senderRank,
          ingame_id: ingameId,
          avatar_url: avatarUrl,
          text,
        },
      ])
      .select()
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      senderName: data.sender_name,
      senderRank: data.sender_rank,
      ingameId: data.ingame_id,
      avatarUrl: data.avatar_url,
      text: data.text,
      createdAt: data.created_at,
    };
  } catch (err) {
    return null;
  }
};
