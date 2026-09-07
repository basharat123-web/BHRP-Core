'use client';

import React, { useState } from 'react';
import { Search, UserPlus, ShieldAlert, Award, Calendar, ExternalLink, AlertTriangle, Check, Zap, Star, X, Trash2, Filter, Shield, Settings2 } from 'lucide-react';
import { Member, MemberRank, MemberStatus } from '@/lib/types';

interface MemberRosterProps {
  members: Member[];
  canEdit?: boolean;
  customRanks?: string[];
  onUpdateCustomRanks?: (ranks: string[]) => void;
  onAddMember: () => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
}

export const MemberRoster: React.FC<MemberRosterProps> = ({
  members,
  canEdit = false,
  customRanks = [],
  onUpdateCustomRanks,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Manage Ranks Modal State
  const [showRankManager, setShowRankManager] = useState(false);
  const [newRankName, setNewRankName] = useState('');

  // Filter Members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ingameId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.discordTag.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRank = selectedRank === 'All' || m.rank === selectedRank;

    return matchesSearch && matchesRank;
  });

  const getRankBadgeClass = (rank: MemberRank) => {
    switch (rank) {
      case 'Leader':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-black';
      case 'High Command':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'Officer':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Member':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Recruit':
        return 'bg-slate-900 text-slate-400 border-slate-800';
      default:
        // Custom ranks get a blue theme
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold';
    }
  };

  const getStatusBadgeClass = (status: MemberStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'On Leave':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Inactive':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const handleStrikeChange = (id: string, currentStrikes: number, delta: number) => {
    const newStrikes = Math.max(0, currentStrikes + delta);
    onUpdateMember(id, { strikes: newStrikes });
  };

  const handleAddCustomRank = () => {
    if (!newRankName.trim()) return;
    if (customRanks.includes(newRankName.trim())) return;
    if (onUpdateCustomRanks) {
      onUpdateCustomRanks([...customRanks, newRankName.trim()]);
    }
    setNewRankName('');
  };

  const handleDeleteCustomRank = (rank: string) => {
    if (onUpdateCustomRanks) {
      onUpdateCustomRanks(customRanks.filter(r => r !== rank));
    }
  };

  const allAvailableRanks = ['Leader', 'High Command', 'Officer', 'Member', 'Recruit', ...customRanks];

  return (
    <div className="space-y-6">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b0c10] p-6 rounded-3xl border-2 border-yellow-500/30 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3">
            <span>BHRP Family Squad Roster</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-mono border border-yellow-500/40 font-bold">
              {filteredMembers.length} Active Members
            </span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Track squad ranks, callsigns, strike logs, and member XP profiles.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRankManager(true)}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-yellow-500/50 text-slate-300 hover:text-yellow-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
              <span>Manage Ranks</span>
            </button>

            <button
              onClick={onAddMember}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-yellow-400" />
          <input
            type="text"
            placeholder="Search by callsign (BH-101), member name, or Discord tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0b0c10] border border-slate-800 rounded-2xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-3.5 w-4 h-4 text-yellow-400" />
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0b0c10] border border-slate-800 rounded-2xl text-yellow-400 text-xs focus:outline-none focus:border-yellow-400 transition cursor-pointer"
          >
            <option value="All">All Ranks</option>
            {allAvailableRanks.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="group relative bg-[#0b0c10] rounded-3xl border border-slate-800 hover:border-yellow-500/50 p-5 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 
                      onClick={() => setSelectedMember(member)}
                      className="text-base font-extrabold text-white group-hover:text-yellow-400 transition cursor-pointer hover:underline"
                    >
                      {member.name}
                    </h3>
                    <span className="text-xs font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30 font-bold">
                      {member.ingameId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{member.discordTag}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 font-mono">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRankBadgeClass(member.rank)}`}>
                    {member.rank}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getStatusBadgeClass(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Reputation XP</p>
                    <p className="text-xs font-black text-yellow-400">{member.xp} XP</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Joined</p>
                    <p className="text-xs font-medium text-slate-200">{member.joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2">
                <ShieldAlert className={`w-4 h-4 ${member.strikes > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-xs font-medium text-slate-400">Strikes:</span>
                
                {canEdit ? (
                  <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => handleStrikeChange(member.id, member.strikes, -1)}
                      className="text-xs font-bold text-slate-400 hover:text-yellow-400 px-1 transition"
                    >
                      -
                    </button>
                    <span className={`text-xs font-bold px-1.5 ${
                      member.strikes === 0 ? 'text-slate-300' : member.strikes < 3 ? 'text-yellow-400' : 'text-rose-500 font-black'
                    }`}>
                      {member.strikes}
                    </span>
                    <button
                      onClick={() => handleStrikeChange(member.id, member.strikes, 1)}
                      className="text-xs font-bold text-slate-400 hover:text-rose-400 px-1 transition"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                    <span className={`text-xs font-bold ${
                      member.strikes === 0 ? 'text-slate-300' : member.strikes < 3 ? 'text-yellow-400' : 'text-rose-500 font-black'
                    }`}>
                      {member.strikes}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold flex items-center space-x-1 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>

                {canEdit && (
                  <button
                    onClick={() => onDeleteMember(member.id)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-800/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gaming Resume Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0b0c10] border-2 border-yellow-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-black text-yellow-400">
                  {selectedMember.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-black text-white">{selectedMember.name}</h3>
                  
                  {canEdit ? (
                    <select
                      value={selectedMember.rank}
                      onChange={(e) => {
                        onUpdateMember(selectedMember.id, { rank: e.target.value as MemberRank });
                        setSelectedMember({ ...selectedMember, rank: e.target.value as MemberRank });
                      }}
                      className="w-full max-w-[200px] bg-slate-900 border border-slate-700 text-yellow-400 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-yellow-500 cursor-pointer"
                    >
                      {allAvailableRanks.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-block w-max px-2.5 py-0.5 rounded-full text-xs font-mono border ${getRankBadgeClass(selectedMember.rank)}`}>
                      {selectedMember.rank}
                    </span>
                  )}

                </div>
                <p className="text-xs font-mono text-yellow-400 mt-2">In-Game Callsign: {selectedMember.ingameId}</p>
                <p className="text-xs text-slate-400 font-mono">{selectedMember.discordTag}</p>
              </div>
            </div>

            <div className="space-y-4 font-mono">
              <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Squad Track Record & Status</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block">Duty Status</span>
                  {canEdit ? (
                    <select
                      value={selectedMember.status}
                      onChange={(e) => {
                        onUpdateMember(selectedMember.id, { status: e.target.value as MemberStatus });
                        setSelectedMember({ ...selectedMember, status: e.target.value as MemberStatus });
                      }}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 text-yellow-400 rounded px-2 py-1 text-xs font-bold outline-none focus:border-yellow-500 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-yellow-400 mt-1 block">{selectedMember.status}</span>
                  )}
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block">Squad XP</span>
                  <span className="text-xs font-bold text-yellow-400 mt-1 block">{selectedMember.xp} XP</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-bold border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rank Manager Modal */}
      {showRankManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0b0c10] border-2 border-blue-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowRankManager(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-400" />
                Manage Custom Ranks
              </h2>
              <p className="text-slate-400 text-xs font-mono">Create unique ranks exclusively for your family squad.</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Head Shooter, Driver..."
                  value={newRankName}
                  onChange={e => setNewRankName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCustomRank()}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={handleAddCustomRank}
                  disabled={!newRankName.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 space-y-3 max-h-60 overflow-y-auto">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Custom Ranks</h3>
                {customRanks.length === 0 ? (
                  <p className="text-slate-600 text-xs font-mono italic">No custom ranks created yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {customRanks.map(rank => (
                      <div key={rank} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                        <span>{rank}</span>
                        <button
                          onClick={() => handleDeleteCustomRank(rank)}
                          className="text-blue-400/50 hover:text-rose-400 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRankManager(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
