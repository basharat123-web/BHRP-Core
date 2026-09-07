'use client';

import React, { useState } from 'react';
import { Member, ConvoyEvent, Organization, UserProfile, FamilyApplication } from '@/lib/types';
import { Crown, Shield, Users, Calendar, Award, Zap, AlertTriangle, Plus, Trash2, Edit, Check, Settings, Sparkles, Database, Clock, X, UserX, UserCheck, Search } from 'lucide-react';
import { respondToOrganization, fetchAllProfiles, blockUser, deleteUserProfile } from '@/lib/supabase';

interface RootAdminPanelProps {
  rootProfile: UserProfile;
  members: Member[];
  events: ConvoyEvent[];
  organizations: Organization[];
  applications: FamilyApplication[];
  onCreateOrganization: (name: string, tag: string, description?: string) => Promise<void>;
  onRespondOrganization: (orgId: string, status: 'Approved' | 'Rejected') => Promise<void>;
  onDeleteOrganization?: (orgId: string) => Promise<void>;
  onUpdateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export const RootAdminPanel: React.FC<RootAdminPanelProps> = ({
  rootProfile,
  members,
  events,
  organizations,
  applications,
  onCreateOrganization,
  onRespondOrganization,
  onDeleteOrganization,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgTag, setNewOrgTag] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [profileSearch, setProfileSearch] = useState('');

  // Load all user profiles for Root Admin
  React.useEffect(() => {
    fetchAllProfiles().then(setAllProfiles);
  }, []);

  const pendingOrgs = organizations.filter((o) => o.status === 'Pending Approval');
  const approvedOrgs = organizations.filter((o) => o.status === 'Approved');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgTag) return;
    setCreatingOrg(true);
    await onCreateOrganization(newOrgName, newOrgTag, newOrgDesc);
    setNewOrgName('');
    setNewOrgTag('');
    setNewOrgDesc('');
    setCreatingOrg(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-[#E9EDEF] font-sans">
      
      {/* Root Admin Top Hero Banner */}
      <div className="bg-[#1F2C34] border border-[#00A884]/30 rounded-xl p-5 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#00A884]/10 text-[#00A884] text-[11px] font-semibold uppercase tracking-widest">
              <Crown className="w-4 h-4" /> Root Admin Master Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E9EDEF]">
              System Control Console
            </h1>
            <p className="text-xs text-[#8696A0]">
              Authenticated as: <strong className="text-[#00A884]">basharat81253@gmail.com</strong>
            </p>
          </div>

          <div className="w-full md:w-auto px-4 py-3 rounded-lg bg-[#111B21] border border-[#2A3942] text-xs text-[#00A884] space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Full Database Approvals
            </p>
            <p className="text-[#8696A0] text-[10px]">Permission Level: SUPER_ROOT</p>
          </div>
        </div>
      </div>

      {/* Responsive Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#1F2C34] p-4 sm:p-5 rounded-xl border border-[#2A3942] space-y-2">
          <div className="flex items-center space-x-2 text-[#8696A0] text-[11px] uppercase font-semibold">
            <Shield className="w-4 h-4" />
            <span>Active Families</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#E9EDEF]">{approvedOrgs.length}</p>
        </div>

        <div className="bg-[#1F2C34] p-4 sm:p-5 rounded-xl border border-[#2A3942] space-y-2">
          <div className="flex items-center space-x-2 text-[#8696A0] text-[11px] uppercase font-semibold">
            <Clock className="w-4 h-4" />
            <span>Pending Families</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#E9EDEF]">{pendingOrgs.length}</p>
        </div>

        <div className="bg-[#1F2C34] p-4 sm:p-5 rounded-xl border border-[#2A3942] space-y-2">
          <div className="flex items-center space-x-2 text-[#8696A0] text-[11px] uppercase font-semibold">
            <Users className="w-4 h-4" />
            <span>Total Roster</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#E9EDEF]">{members.length}</p>
        </div>

        <div className="bg-[#1F2C34] p-4 sm:p-5 rounded-xl border border-[#2A3942] space-y-2">
          <div className="flex items-center space-x-2 text-[#8696A0] text-[11px] uppercase font-semibold">
            <Database className="w-4 h-4" />
            <span>Join Applications</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#E9EDEF]">{applications.length}</p>
        </div>
      </div>

      {/* Pending Family Creation Approvals Section */}
      <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A3942] pb-3">
          <h2 className="text-lg font-bold text-[#E9EDEF] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00A884]" />
            Pending Family Approvals ({pendingOrgs.length})
          </h2>
          <span className="text-xs text-[#8696A0]">Requires Root Admin Sign-off</span>
        </div>

        {pendingOrgs.length === 0 ? (
          <div className="p-6 rounded-lg bg-[#111B21] border border-[#2A3942] text-center space-y-1">
            <p className="text-sm font-semibold text-[#8696A0]">No Pending Family Approvals</p>
            <p className="text-xs text-[#8696A0]/70">All submitted family requests have been approved or processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrgs.map((org) => (
              <div key={org.id} className="p-4 rounded-lg bg-[#111B21] border border-[#2A3942] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#E9EDEF] text-base">{org.name}</h3>
                    <p className="text-xs text-[#8696A0]">Callsign: [{org.tag}]</p>
                  </div>
                  <span className="px-2 py-1 rounded text-[10px] bg-[#00A884]/10 text-[#00A884] font-medium">
                    Pending Approval
                  </span>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => onRespondOrganization(org.id, 'Approved')}
                    className="flex-1 py-2 rounded bg-[#00A884] text-white font-semibold text-xs flex items-center justify-center space-x-1 hover:bg-[#06CF9C] transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => onRespondOrganization(org.id, 'Rejected')}
                    className="py-2 px-3 rounded bg-[#2A3942] text-[#E9EDEF] font-semibold text-xs flex items-center justify-center space-x-1 hover:bg-[#2A3942]/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  {onDeleteOrganization && (
                    <button
                      onClick={() => onDeleteOrganization(org.id)}
                      title="Delete / Purge Family Request"
                      className="py-2 px-3 rounded bg-red-900/40 text-red-400 font-semibold text-xs flex items-center justify-center space-x-1 hover:bg-red-900/60 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family / Organization Management */}
      <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#2A3942] pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#E9EDEF] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00A884]" />
            Approved Organizations & Family Control
          </h2>
          <span className="text-xs text-[#8696A0]">{approvedOrgs.length} Approved</span>
        </div>

        {/* Approved Organization List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedOrgs.map((org) => (
            <div key={org.id} className="p-4 rounded-lg bg-[#111B21] border border-[#2A3942] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-[#1F2C34] border border-[#2A3942] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#00A884]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#E9EDEF]">{org.name}</h4>
                  <p className="text-xs text-[#8696A0]">[{org.tag}]</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-[#00A884]/10 text-[#00A884] text-[10px] font-medium">
                  Active Squad
                </span>
                {onDeleteOrganization && (
                  <button
                    onClick={() => onDeleteOrganization(org.id)}
                    className="px-2 py-1 rounded bg-red-900/40 text-red-400 text-[10px] font-medium flex items-center gap-1 hover:bg-red-900/60"
                  >
                    <Trash2 className="w-3 h-3" /> Disband
                  </button>
                )}
              </div>
            </div>
          ))}
          {approvedOrgs.length === 0 && (
            <p className="text-sm text-[#8696A0] col-span-full">No active organizations approved yet.</p>
          )}
        </div>

        {/* Force Create Organization */}
        <div className="bg-[#111B21] rounded-lg border border-[#2A3942] p-4 sm:p-5 mt-6">
          <h3 className="font-semibold text-[#E9EDEF] mb-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#00A884]" /> Force-Create New Family
          </h3>
          <form onSubmit={handleCreateOrg} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
            <div className="sm:col-span-5 space-y-1">
              <label className="text-xs text-[#8696A0] font-medium uppercase">Family / Squad Name</label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="e.g. Ghost Recon Squad"
                className="w-full bg-[#1F2C34] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884]"
                required
              />
            </div>
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs text-[#8696A0] font-medium uppercase">Callsign Tag</label>
              <input
                type="text"
                value={newOrgTag}
                onChange={(e) => setNewOrgTag(e.target.value)}
                placeholder="e.g. GR-SQ"
                className="w-full bg-[#1F2C34] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884]"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={creatingOrg || !newOrgName || !newOrgTag}
                className="w-full h-[38px] rounded bg-[#00A884] text-white font-semibold text-sm hover:bg-[#06CF9C] disabled:opacity-50 transition-colors"
              >
                {creatingOrg ? 'Creating...' : 'Create Family'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Global Member Directory Control */}
      <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3942] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#E9EDEF] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00A884]" />
              Global User Directory (All Profiles)
            </h2>
            <p className="text-xs text-[#8696A0] mt-1">Super Admin override for all registered accounts.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696A0]" />
            <input
              type="text"
              placeholder="Search by email, name, ingame ID..."
              value={profileSearch}
              onChange={(e) => setProfileSearch(e.target.value)}
              className="w-full sm:w-64 bg-[#111B21] border border-[#2A3942] rounded pl-9 pr-3 py-2 text-sm text-[#E9EDEF] focus:outline-none focus:border-[#00A884]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#2A3942] text-[#8696A0] uppercase tracking-wide text-[10px] font-semibold">
                <th className="pb-3 px-4">User</th>
                <th className="pb-3 px-4">Email / Discord</th>
                <th className="pb-3 px-4">In-Game ID</th>
                <th className="pb-3 px-4">Account Type</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-right">Super Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3942]">
              {allProfiles
                .filter(p => p.fullName?.toLowerCase().includes(profileSearch.toLowerCase()) || 
                             p.email?.toLowerCase().includes(profileSearch.toLowerCase()) || 
                             p.ingameId?.toLowerCase().includes(profileSearch.toLowerCase()))
                .map((profile) => (
                <tr key={profile.id} className="hover:bg-[#111B21] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} className="w-8 h-8 rounded-full border border-[#2A3942] object-cover" alt="" />
                      <div>
                        <div className="font-semibold text-[#E9EDEF] flex items-center gap-1">
                          {profile.fullName}
                          {profile.isRootAdmin && <Crown className="w-3 h-3 text-[#00A884]" />}
                        </div>
                        <div className="text-xs text-[#8696A0]">{profile.id.substring(0,8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[#E9EDEF]">{profile.email}</div>
                    <div className="text-[10px] text-[#8696A0]">{profile.discordTag || 'No Discord'}</div>
                  </td>
                  <td className="py-3 px-4 text-[#E9EDEF] font-mono text-xs">{profile.ingameId || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                      profile.accountType === 'Root Admin' ? 'bg-yellow-500/10 text-[#00A884]' :
                      profile.accountType === 'Family Leader' ? 'bg-[#00A884]/10 text-[#00A884]' :
                      profile.accountType === 'Member' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-[#2A3942] text-[#8696A0]'
                    }`}>
                      {profile.accountType || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {profile.isBlocked ? (
                      <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><UserX className="w-3 h-3" /> Blocked</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#00A884] text-xs font-semibold"><UserCheck className="w-3 h-3" /> Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!profile.isRootAdmin && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={async () => {
                            if (confirm(`Are you sure you want to ${profile.isBlocked ? 'unblock' : 'block'} ${profile.email}?`)) {
                              await blockUser(profile.id, !profile.isBlocked);
                              const fresh = await fetchAllProfiles();
                              setAllProfiles(fresh);
                            }
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold ${profile.isBlocked ? 'bg-[#00A884]/10 text-[#00A884]' : 'bg-[#2A3942] text-[#8696A0]'}`}
                        >
                          {profile.isBlocked ? 'Unblock' : 'Block Login'}
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm(`SUPER ADMIN ACTION: Are you sure you want to completely DELETE the account for ${profile.email}? This cannot be undone.`)) {
                              await deleteUserProfile(profile.id);
                              const fresh = await fetchAllProfiles();
                              setAllProfiles(fresh);
                            }
                          }}
                          className="px-2 py-1 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 transition-colors" title="Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {allProfiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-[#8696A0]">Loading Directory...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
