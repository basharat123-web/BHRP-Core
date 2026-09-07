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
    <div className="space-y-6 sm:space-y-8 text-slate-100 font-sans">
      
      {/* Root Admin Top Hero Banner */}
      <div className="relative bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-[#0b0c10] border-2 border-yellow-500/50 rounded-3xl p-5 sm:p-8 overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.1)]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-[11px] font-mono font-black uppercase tracking-widest">
              <Crown className="w-4 h-4 text-yellow-400 animate-pulse" /> Root Admin Master Panel
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
              A-to-Z System <span className="text-yellow-400">Control Console</span>
            </h1>
            <p className="text-xs text-slate-300 font-mono">
              Authenticated Root Admin: <strong className="text-yellow-300">basharat81253@gmail.com</strong>
            </p>
          </div>

          <div className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-[#090a0f] border border-yellow-500/40 font-mono text-xs text-yellow-400 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-yellow-400" /> Full Database Approvals
            </p>
            <p className="text-slate-400 text-[10px]">Permission Level: SUPER_ROOT</p>
          </div>
        </div>
      </div>

      {/* Responsive Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        <div className="bg-[#0b0c10] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-yellow-500/30 space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 text-yellow-400 text-[11px] uppercase font-bold">
            <Shield className="w-4 h-4" />
            <span>Active Families</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{approvedOrgs.length}</p>
        </div>

        <div className="bg-[#0b0c10] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-yellow-500/30 space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 text-yellow-400 text-[11px] uppercase font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending Families</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">{pendingOrgs.length}</p>
        </div>

        <div className="bg-[#0b0c10] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-yellow-500/30 space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 text-yellow-400 text-[11px] uppercase font-bold">
            <Users className="w-4 h-4" />
            <span>Total Roster</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{members.length}</p>
        </div>

        <div className="bg-[#0b0c10] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-yellow-500/30 space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 text-yellow-400 text-[11px] uppercase font-bold">
            <Database className="w-4 h-4" />
            <span>Join Applications</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{applications.length}</p>
        </div>
      </div>

      {/* Pending Family Creation Approvals Section */}
      <div className="bg-[#0b0c10] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            Pending Family Approvals ({pendingOrgs.length})
          </h2>
          <span className="text-xs text-amber-400 font-mono">Requires Root Admin Sign-off</span>
        </div>

        {pendingOrgs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-1 font-mono">
            <p className="text-sm font-bold text-slate-300">No Pending Family Approvals</p>
            <p className="text-xs text-slate-500">All submitted family requests have been approved or processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrgs.map((org) => (
              <div key={org.id} className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{org.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">Callsign: [{org.tag}]</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                    Pending Approval
                  </span>
                </div>

                <div className="pt-2 flex items-center space-x-2 font-mono">
                  <button
                    onClick={() => onRespondOrganization(org.id, 'Approved')}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center space-x-1 shadow-md shadow-yellow-500/20 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => onRespondOrganization(org.id, 'Rejected')}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  {onDeleteOrganization && (
                    <button
                      onClick={() => onDeleteOrganization(org.id)}
                      title="Delete / Purge Family Request"
                      className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
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
      <div className="bg-[#0b0c10] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            Approved Organizations & Family Control
          </h2>
          <span className="text-xs text-slate-400 font-mono">{approvedOrgs.length} Approved</span>
        </div>

        {/* Approved Organization List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedOrgs.map((org) => (
            <div key={org.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-yellow-500/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{org.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">[{org.tag}]</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 font-mono">
                <span className="px-2.5 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold">
                  Active Squad
                </span>

                {onDeleteOrganization && (
                  <button
                    onClick={() => onDeleteOrganization(org.id)}
                    title="Disband / Delete Family for Violation"
                    className="py-1.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disband</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Responsive Member Management Master List */}
      <div className="bg-[#0b0c10] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            Master Members Roster & Strikes Override
          </h2>
          <span className="text-xs text-slate-400 font-mono">{members.length} Total Registered</span>
        </div>

        {/* Responsive Horizontal Scroll Container for Tables */}
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs text-slate-300 min-w-[650px]">
            <thead className="bg-slate-900/80 text-yellow-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Member Name</th>
                <th className="p-3">In-Game Callsign</th>
                <th className="p-3">Rank</th>
                <th className="p-3">Strikes</th>
                <th className="p-3">XP Level</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">{m.name}</td>
                  <td className="p-3 text-yellow-400">{m.ingameId}</td>
                  <td className="p-3">
                    <select
                      value={m.rank}
                      onChange={(e) => onUpdateMember(m.id, { rank: e.target.value as any })}
                      className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 outline-none text-xs"
                    >
                      <option value="Leader">Leader</option>
                      <option value="High Command">High Command</option>
                      <option value="Officer">Officer</option>
                      <option value="Member">Member</option>
                      <option value="Recruit">Recruit</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onUpdateMember(m.id, { strikes: Math.max(0, m.strikes - 1) })}
                        className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-rose-400 font-bold">{m.strikes}</span>
                      <button
                        onClick={() => onUpdateMember(m.id, { strikes: m.strikes + 1 })}
                        className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-yellow-400">{m.xp} XP</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDeleteMember(m.id)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ALL ACCOUNTS MANAGEMENT */}
      <div className="bg-[#0b0c10] border-2 border-rose-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-400" />
            All Registered Accounts ({allProfiles.length})
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={profileSearch}
              onChange={e => setProfileSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-yellow-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-900/80 text-yellow-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Account</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {allProfiles
                .filter(p =>
                  p.fullName.toLowerCase().includes(profileSearch.toLowerCase()) ||
                  p.email.toLowerCase().includes(profileSearch.toLowerCase())
                )
                .map(p => (
                  <tr key={p.id} className={`hover:bg-slate-900/40 ${p.isBlocked ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={p.avatarUrl} alt={p.fullName} className="w-7 h-7 rounded-full object-cover border border-yellow-500/30" />
                        <span className="font-bold text-white">{p.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400">{p.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.isRootAdmin ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                        p.accountType === 'Family Leader' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {p.accountType}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.isBlocked ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-green-500/20 text-green-400 border-green-500/40'
                      }`}>
                        {p.isBlocked ? '⛔ Blocked' : '✅ Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {!p.isRootAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={async () => {
                              const ok = await blockUser(p.id, !p.isBlocked);
                              if (ok) setAllProfiles(prev => prev.map(x => x.id === p.id ? { ...x, isBlocked: !x.isBlocked } : x));
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              p.isBlocked
                                ? 'bg-green-950 hover:bg-green-900 border-green-800 text-green-300'
                                : 'bg-amber-950 hover:bg-amber-900 border-amber-800 text-amber-300'
                            }`}
                            title={p.isBlocked ? 'Unblock Account' : 'Block Account'}
                          >
                            {p.isBlocked ? <><UserCheck className="w-3 h-3" /> Unblock</> : <><UserX className="w-3 h-3" /> Block</>}
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete account for ${p.fullName}? This cannot be undone.`)) return;
                              const ok = await deleteUserProfile(p.id);
                              if (ok) setAllProfiles(prev => prev.filter(x => x.id !== p.id));
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border bg-rose-950 hover:bg-rose-900 border-rose-800 text-rose-300 transition-all cursor-pointer"
                            title="Permanently Delete Account"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {allProfiles.length === 0 && (
            <p className="text-center text-slate-500 text-xs font-mono py-6">No accounts found in database. Make sure Supabase is connected.</p>
          )}
        </div>
      </div>

    </div>
  );
};
