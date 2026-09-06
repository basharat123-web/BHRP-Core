'use client';

import React, { useState } from 'react';
import { Search, UserPlus, ShieldAlert, Award, Calendar, ExternalLink, AlertTriangle, Check, Zap, Star, X, Trash2, Filter } from 'lucide-react';
import { Member, MemberRank, MemberStatus } from '@/lib/types';

interface MemberRosterProps {
  members: Member[];
  onAddMember: () => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
}

export const MemberRoster: React.FC<MemberRosterProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'High Command':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Officer':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Member':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Recruit':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: MemberStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
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

  return (
    <div className="space-y-6">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>BHRP Clan Roster</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              {filteredMembers.length} Members
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track member ranks, strikes, XP points, and gaming resume profiles.
          </p>
        </div>

        <button
          onClick={onAddMember}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Search Input */}
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by member name, In-Game ID (BH-101), or Discord tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Rank Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer"
          >
            <option value="All">All Ranks</option>
            <option value="Leader">Leader</option>
            <option value="High Command">High Command</option>
            <option value="Officer">Officer</option>
            <option value="Member">Member</option>
            <option value="Recruit">Recruit</option>
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="group relative bg-[#0f1422] rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 p-5 transition-all hover:shadow-2xl hover:shadow-indigo-950/40 flex flex-col justify-between"
          >
            {/* Top Bar: Name & Rank */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 
                      onClick={() => setSelectedMember(member)}
                      className="text-lg font-bold text-white group-hover:text-cyan-300 transition cursor-pointer hover:underline"
                    >
                      {member.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {member.ingameId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{member.discordTag}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRankBadgeClass(member.rank)}`}>
                    {member.rank}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getStatusBadgeClass(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Reputation XP</p>
                    <p className="text-sm font-bold text-amber-300">{member.xp} XP</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Joined</p>
                    <p className="text-sm font-medium text-slate-200">{member.joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls: Strikes & Profile Resume Button */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              
              {/* Strike Warning Counter */}
              <div className="flex items-center space-x-2">
                <ShieldAlert className={`w-4 h-4 ${member.strikes > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-xs font-medium text-slate-400">Strikes:</span>
                
                <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => handleStrikeChange(member.id, member.strikes, -1)}
                    className="text-xs font-bold text-slate-400 hover:text-emerald-400 px-1 transition"
                    title="Remove Strike"
                  >
                    -
                  </button>
                  <span className={`text-xs font-bold px-1.5 ${
                    member.strikes === 0 ? 'text-slate-300' : member.strikes < 3 ? 'text-amber-400' : 'text-rose-500 font-extrabold'
                  }`}>
                    {member.strikes}
                  </span>
                  <button
                    onClick={() => handleStrikeChange(member.id, member.strikes, 1)}
                    className="text-xs font-bold text-slate-400 hover:text-rose-400 px-1 transition"
                    title="Add Strike"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="p-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/50 text-xs font-medium flex items-center space-x-1 transition"
                  title="View Gaming Resume"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Profile</span>
                </button>

                <button
                  onClick={() => onDeleteMember(member.id)}
                  className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition"
                  title="Remove Member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gaming Resume Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f1423] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                  {selectedMember.name.charAt(0)}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">{selectedMember.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRankBadgeClass(selectedMember.rank)}`}>
                    {selectedMember.rank}
                  </span>
                </div>
                <p className="text-sm font-mono text-cyan-400 mt-0.5">In-Game ID: {selectedMember.ingameId}</p>
                <p className="text-xs text-slate-400 font-mono">{selectedMember.discordTag}</p>
              </div>
            </div>

            {/* Gaming Resume Body */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Gaming Track Record & Status</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Duty Status</span>
                  <span className="text-sm font-bold text-emerald-400">{selectedMember.status}</span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Total Clan XP</span>
                  <span className="text-sm font-bold text-amber-300">{selectedMember.xp} XP</span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Strikes Received</span>
                  <span className={`text-sm font-bold ${selectedMember.strikes > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {selectedMember.strikes} / 3 Max
                  </span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Joined Family</span>
                  <span className="text-sm font-medium text-slate-200">{selectedMember.joinedDate}</span>
                </div>
              </div>

              {/* Status Update Quick Selector */}
              <div className="pt-2">
                <label className="text-xs text-slate-400 font-medium block mb-2">Update Duty Status:</label>
                <div className="flex gap-2">
                  {(['Active', 'On Leave', 'Inactive'] as MemberStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onUpdateMember(selectedMember.id, { status });
                        setSelectedMember({ ...selectedMember, status });
                      }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${
                        selectedMember.status === status
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700"
              >
                Close Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
