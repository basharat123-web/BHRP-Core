'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MemberRoster } from '@/components/MemberRoster';
import { EventScheduler } from '@/components/EventScheduler';
import { DiscordWebhookModal } from '@/components/DiscordWebhookModal';
import { MemberModal } from '@/components/MemberModal';
import { PublicLanding } from '@/components/PublicLanding';
import { UserProfileView } from '@/components/UserProfile';
import { RootAdminPanel } from '@/components/RootAdminPanel';
import { RoleOnboardingModal } from '@/components/RoleOnboardingModal';
import { FamilyJoinModal } from '@/components/FamilyJoinModal';
import { FamilyApplicationsView } from '@/components/FamilyApplicationsView';
import { GoogleSignInModal } from '@/components/GoogleSignInModal';
import { LiveSquadChat } from '@/components/LiveSquadChat';
import { Member, ConvoyEvent, UserProfile, Organization, FamilyApplication, AccountType } from '@/lib/types';
import {
  supabase,
  signInWithGoogle,
  signOutUser,
  fetchUserProfile,
  updateUserProfile,
  fetchOrganizations,
  createOrganization,
  respondToOrganization,
  submitFamilyApplication,
  fetchFamilyApplications,
  respondToApplication,
  fetchMembers,
} from '@/lib/supabase';
import { Shield, Users, Calendar, Award, Zap, AlertTriangle, User, Crown, UserCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'roster' | 'events' | 'profile' | 'admin' | 'applications' | 'chat'>('roster');
  
  // Auth & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [selectedDiscordEvent, setSelectedDiscordEvent] = useState<ConvoyEvent | null>(null);

  // Live Viewers Count
  const [viewerCount, setViewerCount] = useState<number>(14);

  // Organizations & Applications State
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'org-1',
      name: 'Black Hawk RolePlay',
      tag: 'BHRP',
      logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
      description: 'Official Elite RolePlay & Convoy Patrol Squad',
      status: 'Approved',
    },
  ]);

  const [applications, setApplications] = useState<FamilyApplication[]>([]);

  // Members & Events Data
  const [members, setMembers] = useState<Member[]>([
    {
      id: 'm-1',
      name: 'Rafay King',
      discordTag: 'rafay#0001',
      ingameId: 'BH-101',
      rank: 'Leader',
      status: 'Active',
      strikes: 0,
      xp: 1450,
      joinedDate: '2024-01-15',
    },
    {
      id: 'm-2',
      name: 'Imran Khan',
      discordTag: 'imran#1234',
      ingameId: 'BH-102',
      rank: 'High Command',
      status: 'Active',
      strikes: 0,
      xp: 1200,
      joinedDate: '2024-02-01',
    },
    {
      id: 'm-3',
      name: 'Daniyal Shah',
      discordTag: 'daniyal#9999',
      ingameId: 'BH-105',
      rank: 'Officer',
      status: 'Active',
      strikes: 1,
      xp: 850,
      joinedDate: '2024-03-10',
    },
  ]);

  const [events, setEvents] = useState<ConvoyEvent[]>([
    {
      id: 'e-1',
      title: 'Mega City Patrol & Cargo Convoy',
      game: 'GTA V RP',
      eventDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      routeDetails: 'Paleto Bay to Los Santos Port via Route 68',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      status: 'Upcoming',
      slots: [
        { id: 's-1', roleName: 'Lead Pilot / Lead Vehicle', claimedByName: 'Rafay King' },
        { id: 's-2', roleName: 'Heavy Cargo Driver', claimedByName: 'Imran Khan' },
        { id: 's-3', roleName: 'Escort Guard 1', claimedByName: 'Daniyal Shah' },
        { id: 's-4', roleName: 'Rear Sweeper' },
        { id: 's-5', roleName: 'General Member Slot' },
      ],
    },
    {
      id: 'e-2',
      title: 'Euro Truck Simulator 2 Highway Rally',
      game: 'ETS2 Convoy',
      eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      routeDetails: 'Berlin to Paris via Luxembourg (Sim 1)',
      imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
      status: 'Upcoming',
      slots: [
        { id: 's-21', roleName: 'Lead Convoy Captain', claimedByName: 'Imran Khan' },
        { id: 's-22', roleName: 'Heavy Cargo 100T' },
        { id: 's-23', roleName: 'Pilot Escort Vehicle' },
        { id: 's-24', roleName: 'Convoy Tail Guard' },
      ],
    },
  ]);

  // 1. Supabase Auth & Local Storage Session Listener
  useEffect(() => {
    const cachedProfile = typeof window !== 'undefined' ? localStorage.getItem('bhrp_active_profile') : null;
    if (cachedProfile) {
      try {
        const parsed: UserProfile = JSON.parse(cachedProfile);
        setUserProfile(parsed);
        if (parsed.email.toLowerCase() === 'basharat81253@gmail.com' || parsed.isRootAdmin) {
          setActiveTab('admin');
        }
      } catch (e) {
        console.warn('Failed to parse cached profile');
      }
    }

    const client = supabase;
    if (!client) {
      setAuthLoading(false);
      return;
    }

    const processUserSession = async (user: any) => {
      if (!user) return;
      const userEmail = (user.email || '').toLowerCase();
      const isRoot = userEmail === 'basharat81253@gmail.com';

      // Read cached local profile to preserve chosen role if DB is async/unpopulated
      let cachedLocal: UserProfile | null = null;
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('bhrp_active_profile');
        if (raw) {
          try {
            cachedLocal = JSON.parse(raw);
          } catch (e) {
            console.warn('Could not parse local profile');
          }
        }
      }

      let profile = await fetchUserProfile(user.id, userEmail);

      if (!profile) {
        const savedAccountType: AccountType = isRoot
          ? 'Root Admin'
          : (cachedLocal && cachedLocal.accountType && cachedLocal.accountType !== 'Unassigned'
              ? cachedLocal.accountType
              : 'Unassigned');

        profile = {
          id: user.id,
          email: user.email || userEmail,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || cachedLocal?.fullName || userEmail.split('@')[0] || 'BHRP Member',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || cachedLocal?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          ingameId: isRoot ? 'ROOT-01' : (cachedLocal?.ingameId || 'BH-NEW'),
          rank: isRoot ? 'Leader' : (cachedLocal?.rank || 'Member'),
          accountType: savedAccountType,
          isRootAdmin: isRoot,
          currentFamilyId: cachedLocal?.currentFamilyId,
          appliedFamilyId: cachedLocal?.appliedFamilyId,
          applicationStatus: cachedLocal?.applicationStatus || 'None',
          discordTag: cachedLocal?.discordTag || `${userEmail.split('@')[0]}#0000`,
          bio: cachedLocal?.bio || (isRoot ? 'Supreme Master Administrator & Black Hawk RP Founder.' : 'BHRP Squad Member'),
          xp: cachedLocal?.xp || (isRoot ? 2000 : 100),
        };
      } else {
        // If DB profile exists but accountType is Unassigned, see if local storage saved a role selection
        if (!isRoot && (profile.accountType === 'Unassigned' || !profile.accountType) && cachedLocal && cachedLocal.accountType && cachedLocal.accountType !== 'Unassigned') {
          profile.accountType = cachedLocal.accountType;
        }
      }

      if (isRoot) {
        profile.isRootAdmin = true;
        profile.accountType = 'Root Admin';
        setActiveTab('admin');
      }

      setUserProfile(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bhrp_active_profile', JSON.stringify(profile));
      }
    };

    const checkSession = async () => {
      try {
        const { data } = await client.auth.getSession();
        if (data?.session?.user) {
          await processUserSession(data.session.user);
        }
      } catch (err) {
        console.error('Auth session check error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await processUserSession(session.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch Organizations, Applications & Members Roster
  useEffect(() => {
    const loadOrgData = async () => {
      const orgs = await fetchOrganizations();
      if (orgs.length > 0) {
        setOrganizations(orgs);
      }
      const apps = await fetchFamilyApplications();
      if (apps.length > 0) {
        setApplications(apps);
      }
      const dbMembers = await fetchMembers();
      if (dbMembers.length > 0) {
        setMembers(dbMembers);
      }
    };
    loadOrgData();

    if (!supabase) return;

    const orgChannel = supabase
      .channel('bhrp-orgs-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organizations' },
        async () => {
          const freshOrgs = await fetchOrganizations();
          if (freshOrgs.length > 0) {
            setOrganizations(freshOrgs);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(orgChannel);
    };
  }, []);

  // 3. Real-Time Presence Counter
  useEffect(() => {
    let presenceChannel: any = null;

    if (supabase) {
      presenceChannel = supabase.channel('bhrp-online-viewers', {
        config: {
          presence: { key: userProfile?.id || `anon-${Math.random()}` },
        },
      });

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const count = Object.keys(state).length;
          if (count > 0) {
            setViewerCount(Math.max(count, 1));
          }
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
              onlineAt: new Date().toISOString(),
              name: userProfile?.fullName || 'Anonymous Visitor',
            });
          }
        });
    }

    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(10, prev + delta);
      });
    }, 6000);

    return () => {
      clearInterval(interval);
      if (presenceChannel && supabase) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [userProfile]);

  // Auth Handlers
  const handleDirectEmailSignIn = (email: string, name?: string) => {
    const isRoot = email.toLowerCase() === 'basharat81253@gmail.com';

    let cachedAccountType: AccountType = isRoot ? 'Root Admin' : 'Unassigned';
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('bhrp_active_profile');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.email?.toLowerCase() === email.toLowerCase() && parsed.accountType && parsed.accountType !== 'Unassigned') {
            cachedAccountType = parsed.accountType;
          }
        } catch (e) {}
      }
    }

    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      fullName: name || email.split('@')[0],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      ingameId: isRoot ? 'ROOT-01' : 'BH-NEW',
      rank: isRoot ? 'Leader' : 'Member',
      accountType: cachedAccountType,
      isRootAdmin: isRoot,
      discordTag: `${email.split('@')[0]}#0000`,
      bio: isRoot ? 'Supreme Master Administrator & Black Hawk RP Founder.' : 'BHRP Member',
      xp: isRoot ? 2000 : 100,
    };

    setUserProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bhrp_active_profile', JSON.stringify(profile));
    }
    setShowGoogleModal(false);

    if (isRoot) {
      setActiveTab('admin');
    } else {
      setActiveTab('roster');
    }
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bhrp_active_profile');
    }
    if (supabase) {
      await signOutUser();
    }
    setUserProfile(null);
    setActiveTab('roster');
  };

  const handleSelectRole = async (role: AccountType, familyName?: string, familyTag?: string) => {
    if (!userProfile) return;

    let createdOrgId: string | undefined = undefined;

    if (role === 'Family Leader' && familyName && familyTag) {
      const newOrg = await createOrganization(familyName, familyTag);
      if (newOrg) {
        createdOrgId = newOrg.id;
        setOrganizations((prev) => [...prev, newOrg]);
      } else {
        const fallbackOrg: Organization = {
          id: `org-${Date.now()}`,
          name: familyName,
          tag: familyTag,
          status: 'Pending Approval',
        };
        createdOrgId = fallbackOrg.id;
        setOrganizations((prev) => [...prev, fallbackOrg]);
      }
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      accountType: role,
      currentFamilyId: createdOrgId,
    };

    setUserProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bhrp_active_profile', JSON.stringify(updatedProfile));
    }

    if (supabase && userProfile.id) {
      await updateUserProfile(userProfile.id, {
        accountType: role,
        currentFamilyId: createdOrgId,
      });
    }
  };

  const handleRespondOrganization = async (orgId: string, status: 'Approved' | 'Rejected') => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, status } : o))
    );
    if (supabase) {
      await respondToOrganization(orgId, status);
    }
  };

  const handleSubmitApplication = async (familyId: string, message: string) => {
    if (!userProfile) return;

    const newApp: FamilyApplication = {
      id: `app-${Date.now()}`,
      userId: userProfile.id,
      familyId,
      familyName: organizations.find((o) => o.id === familyId)?.name || 'RP Family',
      applicantName: userProfile.fullName,
      applicantEmail: userProfile.email,
      discordTag: userProfile.discordTag,
      ingameId: userProfile.ingameId,
      message,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);

    const updatedProfile: UserProfile = {
      ...userProfile,
      appliedFamilyId: familyId,
      applicationStatus: 'Pending',
    };

    setUserProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bhrp_active_profile', JSON.stringify(updatedProfile));
    }

    if (supabase && userProfile.id) {
      await submitFamilyApplication(
        userProfile.id,
        familyId,
        userProfile.fullName,
        userProfile.email,
        userProfile.discordTag,
        userProfile.ingameId,
        message
      );
    }
  };

  const handleRespondApplication = async (
    applicationId: string,
    userId: string,
    familyId: string,
    status: 'Approved' | 'Rejected',
    applicantName: string,
    discordTag: string,
    ingameId: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );

    if (status === 'Approved') {
      const newMem: Member = {
        id: `m-${Date.now()}`,
        name: applicantName,
        discordTag,
        ingameId,
        rank: 'Member',
        status: 'Active',
        strikes: 0,
        xp: 100,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setMembers((prev) => [...prev, newMem]);
    }

    if (supabase) {
      await respondToApplication(
        applicationId,
        userId,
        familyId,
        status,
        applicantName,
        discordTag,
        ingameId
      );
    }
  };

  const handleCreateOrganization = async (name: string, tag: string, description?: string) => {
    const newOrg = await createOrganization(name, tag, description);
    if (newOrg) {
      setOrganizations((prev) => [...prev, newOrg]);
    } else {
      const fallbackOrg: Organization = {
        id: `org-${Date.now()}`,
        name,
        tag,
        description,
        status: 'Approved',
      };
      setOrganizations((prev) => [...prev, fallbackOrg]);
    }
  };

  // Handlers for Members & Convoys
  const handleAddMember = async (newMemData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...newMemData,
      id: `m-${Date.now()}`,
    };

    setMembers((prev) => [newMember, ...prev]);

    if (supabase) {
      await supabase.from('members').insert([
        {
          name: newMember.name,
          discord_tag: newMember.discordTag,
          ingame_id: newMember.ingameId,
          rank: newMember.rank,
          status: newMember.status,
          strikes: newMember.strikes,
          xp: newMember.xp,
        },
      ]);
    }
  };

  const handleUpdateMember = async (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    if (supabase) {
      await supabase.from('members').update(updates).eq('id', id);
    }
  };

  const handleDeleteMember = async (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));

    if (supabase) {
      await supabase.from('members').delete().eq('id', id);
    }
  };

  const handleClaimSlot = (eventId: string, slotId: string, username: string) => {
    const claimerName = username || userProfile?.fullName || 'Anonymous Member';
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          return {
            ...ev,
            slots: ev.slots.map((s) =>
              s.id === slotId ? { ...s, claimedByName: claimerName } : s
            ),
          };
        }
        return ev;
      })
    );
  };

  const handleUnclaimSlot = (eventId: string, slotId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          return {
            ...ev,
            slots: ev.slots.map((s) =>
              s.id === slotId ? { ...s, claimedByName: undefined } : s
            ),
          };
        }
        return ev;
      })
    );
  };

  const handleCreateEvent = (
    newEventData: Omit<ConvoyEvent, 'id' | 'slots'>,
    slotRoles: string[]
  ) => {
    const newEvent: ConvoyEvent = {
      ...newEventData,
      id: `e-${Date.now()}`,
      slots: slotRoles.map((role, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        roleName: role,
      })),
    };

    setEvents((prev) => [newEvent, ...prev]);
  };

  // If user is NOT logged in, show the Public Landing Page by default!
  if (!userProfile && !authLoading) {
    return (
      <>
        <PublicLanding
          viewerCount={viewerCount}
          onGoogleSignIn={() => setShowGoogleModal(true)}
          members={members}
          events={events}
        />
        {showGoogleModal && (
          <GoogleSignInModal
            onClose={() => setShowGoogleModal(false)}
            onDirectEmailSignIn={handleDirectEmailSignIn}
          />
        )}
      </>
    );
  }

  const isRootAdmin = userProfile?.email?.toLowerCase() === 'basharat81253@gmail.com' || userProfile?.isRootAdmin;
  const needsRoleOnboarding = userProfile && !isRootAdmin && (userProfile.accountType === 'Unassigned' || !userProfile.accountType);

  return (
    <div className="min-h-screen flex flex-col bg-[#07080c] font-sans selection:bg-yellow-500 selection:text-slate-950">
      
      {/* Role Selection Onboarding Modal (Only for non-Root Admin users who have Unassigned accountType) */}
      {needsRoleOnboarding && (
        <RoleOnboardingModal onSelectRole={handleSelectRole} />
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberCount={members.length}
        upcomingEventCount={events.length}
        viewerCount={viewerCount}
        pendingAppsCount={applications.filter((a) => a.status === 'Pending').length}
        userProfile={userProfile}
        onOpenJoinModal={() => setShowJoinModal(true)}
        onGoogleSignIn={() => setShowGoogleModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-[#0b0c10] p-5 rounded-3xl border border-yellow-500/30 flex items-center space-x-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Roster</p>
              <h4 className="text-2xl font-black text-white">{members.length} Members</h4>
            </div>
          </div>

          <div className="bg-[#0b0c10] p-5 rounded-3xl border border-yellow-500/30 flex items-center space-x-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Convoys</p>
              <h4 className="text-2xl font-black text-white">{events.length} Events</h4>
            </div>
          </div>

          <div className="bg-[#0b0c10] p-5 rounded-3xl border border-yellow-500/30 flex items-center space-x-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Leaders</p>
              <h4 className="text-2xl font-black text-yellow-400">
                {members.filter((m) => m.rank === 'Leader' || m.rank === 'High Command').length} HC
              </h4>
            </div>
          </div>

          <div className="bg-[#0b0c10] p-5 rounded-3xl border border-yellow-500/30 flex items-center space-x-4 shadow-xl">
            <div className="p-3 rounded-2xl bg-rose-950/50 text-rose-400 border border-rose-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Strikes Issued</p>
              <h4 className="text-2xl font-black text-rose-400">
                {members.reduce((acc, m) => acc + m.strikes, 0)} Total
              </h4>
            </div>
          </div>
        </div>

        {/* Tab View Switcher */}
        {activeTab === 'roster' && (
          <MemberRoster
            members={members}
            onAddMember={() => setShowMemberModal(true)}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeTab === 'events' && (
          <EventScheduler
            events={events}
            onClaimSlot={handleClaimSlot}
            onUnclaimSlot={handleUnclaimSlot}
            onOpenDiscordModal={(event) => setSelectedDiscordEvent(event)}
            onCreateEvent={handleCreateEvent}
          />
        )}

        {activeTab === 'chat' && userProfile && (
          <LiveSquadChat userProfile={userProfile} />
        )}

        {activeTab === 'applications' && (
          <FamilyApplicationsView
            applications={applications}
            onRespond={handleRespondApplication}
          />
        )}

        {activeTab === 'admin' && userProfile && isRootAdmin && (
          <RootAdminPanel
            rootProfile={userProfile}
            members={members}
            events={events}
            organizations={organizations}
            applications={applications}
            onCreateOrganization={handleCreateOrganization}
            onRespondOrganization={handleRespondOrganization}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeTab === 'profile' && userProfile && (
          <UserProfileView
            profile={userProfile}
            onUpdateProfile={async (updates) => {
              const updated = { ...userProfile, ...updates };
              setUserProfile(updated);
              if (typeof window !== 'undefined') {
                localStorage.setItem('bhrp_active_profile', JSON.stringify(updated));
              }
              if (supabase && userProfile.id) {
                await updateUserProfile(userProfile.id, updates);
              }
            }}
            onSignOut={handleSignOut}
            onOpenJoinModal={() => setShowJoinModal(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#06070a] py-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-slate-200">BHRP CORE Tactical Gaming Edition</span>
            <span>• Royal Kingdom Gaming</span>
          </div>
          <p className="text-yellow-500/80">Logged in Root Admin: basharat81253@gmail.com</p>
        </div>
      </footer>

      {/* Modals */}
      {showGoogleModal && (
        <GoogleSignInModal
          onClose={() => setShowGoogleModal(false)}
          onDirectEmailSignIn={handleDirectEmailSignIn}
        />
      )}

      {showMemberModal && (
        <MemberModal
          onClose={() => setShowMemberModal(false)}
          onAddMember={handleAddMember}
        />
      )}

      {showJoinModal && userProfile && (
        <FamilyJoinModal
          userProfile={userProfile}
          organizations={organizations}
          onSubmitApplication={handleSubmitApplication}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {selectedDiscordEvent && (
        <DiscordWebhookModal
          event={selectedDiscordEvent}
          onClose={() => setSelectedDiscordEvent(null)}
        />
      )}
    </div>
  );
}
