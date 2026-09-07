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
        return 'bg-[#00A884]/20 text-[#00A884] border-[#00A884]/40 font-bold';
      case 'High Command':
        return 'bg-[#00A884]/10 text-[#00A884] border-[#00A884]/30 font-semibold';
      case 'Officer':
        return 'bg-[#2A3942] text-[#E9EDEF] border-[#2A3942] font-medium';
      case 'Member':
        return 'bg-[#111B21] text-[#8696A0] border-[#2A3942]';
      case 'Recruit':
        return 'bg-[#111B21] text-[#8696A0] border-[#2A3942] opacity-80';
      default:
        return 'bg-[#2A3942] text-[#E9EDEF] border-[#2A3942] font-medium';
    }
  };

  const getStatusBadgeClass = (status: MemberStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-[#00A884]/10 text-[#00A884] border-[#00A884]/30';
      case 'On Leave':
        return 'bg-[#2A3942] text-[#8696A0] border-[#2A3942]';
      case 'Inactive':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
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
    <div className="space-y-6 text-[#E9EDEF] font-sans">
      
      {/* Header & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1F2C34] p-5 sm:p-6 rounded-xl border border-[#2A3942]">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-3 text-[#E9EDEF]">
            <span>Family Squad Roster</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] font-semibold border border-[#00A884]/20">
              {filteredMembers.length} Members
            </span>
          </h2>
          <p className="text-[#8696A0] text-sm mt-1">
            Track squad ranks, callsigns, strike logs, and member profiles.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRankManager(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded bg-[#111B21] border border-[#2A3942] text-[#E9EDEF] hover:border-[#00A884] hover:text-[#00A884] font-semibold text-sm transition-colors cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
              <span>Manage Ranks</span>
            </button>

            <button
              onClick={onAddMember}
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696A0]" />
          <input
            type="text"
            placeholder="Search by callsign (BH-101), member name, or Discord tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#1F2C34] border border-[#2A3942] rounded text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] transition-colors"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696A0]" />
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#1F2C34] border border-[#2A3942] rounded text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] transition-colors cursor-pointer appearance-none"
          >
            <option value="All">All Ranks</option>
            {allAvailableRanks.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="group relative bg-[#1F2C34] rounded-xl border border-[#2A3942] p-5 transition-colors hover:border-[#00A884]/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 
                      onClick={() => setSelectedMember(member)}
                      className="text-base font-semibold text-[#E9EDEF] group-hover:text-[#00A884] transition-colors cursor-pointer"
                    >
                      {member.name}
                    </h3>
                    <span className="text-[10px] text-[#00A884] bg-[#00A884]/10 px-1.5 py-0.5 rounded border border-[#00A884]/20 font-medium">
                      {member.ingameId}
                    </span>
                  </div>
                  <p className="text-xs text-[#8696A0] mt-1">{member.discordTag}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getRankBadgeClass(member.rank)}`}>
                    {member.rank}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusBadgeClass(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-lg bg-[#111B21] border border-[#2A3942]">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <div>
                    <p className="text-[10px] text-[#8696A0] uppercase font-semibold">Strikes</p>
                    <p className="text-sm font-bold text-[#E9EDEF]">{member.strikes}/3</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#00A884]" />
                  <div>
                    <p className="text-[10px] text-[#8696A0] uppercase font-semibold">XP</p>
                    <p className="text-sm font-bold text-[#E9EDEF]">{member.xp}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {canEdit && (
              <div className="pt-3 border-t border-[#2A3942] flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStrikeChange(member.id, member.strikes, 1)}
                    className="p-1.5 rounded hover:bg-[#111B21] text-[#8696A0] hover:text-red-400 transition-colors"
                    title="Add Strike"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStrikeChange(member.id, member.strikes, -1)}
                    disabled={member.strikes === 0}
                    className="p-1.5 rounded hover:bg-[#111B21] text-[#8696A0] hover:text-[#00A884] disabled:opacity-30 transition-colors"
                    title="Remove Strike"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={member.rank}
                    onChange={(e) => onUpdateMember(member.id, { rank: e.target.value as MemberRank })}
                    className="bg-[#111B21] border border-[#2A3942] text-[#E9EDEF] text-[10px] rounded px-2 py-1 focus:outline-none focus:border-[#00A884]"
                  >
                    {allAvailableRanks.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => onDeleteMember(member.id)}
                    className="p-1.5 rounded hover:bg-red-900/40 text-[#8696A0] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-[#1F2C34] rounded-xl border border-[#2A3942]">
          <ShieldAlert className="w-12 h-12 text-[#8696A0] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-[#E9EDEF]">No members found</h3>
          <p className="text-sm text-[#8696A0]">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#2A3942]">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#00A884]" />
                <h3 className="text-lg font-bold text-[#E9EDEF]">Member Dossier</h3>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-[#E9EDEF]">{selectedMember.name}</h4>
                  <p className="text-sm text-[#8696A0]">{selectedMember.discordTag}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded text-xs font-semibold border ${getRankBadgeClass(selectedMember.rank)} mb-1`}>
                    {selectedMember.rank}
                  </div>
                  <div className="text-[#00A884] text-xs font-medium font-mono">{selectedMember.ingameId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#2A3942]">
                <div className="bg-[#111B21] p-3 rounded-lg border border-[#2A3942]">
                  <p className="text-[10px] text-[#8696A0] uppercase font-semibold mb-1">Status</p>
                  <p className="text-sm text-[#E9EDEF]">{selectedMember.status}</p>
                </div>
                <div className="bg-[#111B21] p-3 rounded-lg border border-[#2A3942]">
                  <p className="text-[10px] text-[#8696A0] uppercase font-semibold mb-1">Joined</p>
                  <p className="text-sm text-[#E9EDEF]">{selectedMember.joinedDate}</p>
                </div>
                <div className="bg-[#111B21] p-3 rounded-lg border border-[#2A3942]">
                  <p className="text-[10px] text-[#8696A0] uppercase font-semibold mb-1">Total XP</p>
                  <p className="text-sm text-[#E9EDEF] font-bold">{selectedMember.xp}</p>
                </div>
                <div className="bg-[#111B21] p-3 rounded-lg border border-[#2A3942]">
                  <p className="text-[10px] text-[#8696A0] uppercase font-semibold mb-1">Strikes</p>
                  <p className="text-sm font-bold text-red-400">{selectedMember.strikes} / 3</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[#111B21] border-t border-[#2A3942] flex justify-end">
              <button 
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-[#2A3942] text-[#E9EDEF] text-sm font-semibold rounded hover:bg-[#2A3942]/80 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Custom Ranks Modal */}
      {showRankManager && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#2A3942]">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-[#00A884]" />
                <h3 className="text-lg font-bold text-[#E9EDEF]">Manage Custom Ranks</h3>
              </div>
              <button 
                onClick={() => setShowRankManager(false)}
                className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRankName}
                  onChange={(e) => setNewRankName(e.target.value)}
                  placeholder="e.g. Snipe Commander"
                  className="flex-1 bg-[#111B21] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884]"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomRank()}
                />
                <button
                  onClick={handleAddCustomRank}
                  disabled={!newRankName.trim()}
                  className="px-4 py-2 bg-[#00A884] text-white font-semibold text-sm rounded hover:bg-[#06CF9C] disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                {customRanks.length === 0 ? (
                  <p className="text-sm text-[#8696A0] text-center py-4">No custom ranks defined yet.</p>
                ) : (
                  customRanks.map(rank => (
                    <div key={rank} className="flex items-center justify-between p-3 bg-[#111B21] border border-[#2A3942] rounded-lg">
                      <span className="text-sm font-semibold text-[#E9EDEF]">{rank}</span>
                      <button
                        onClick={() => handleDeleteCustomRank(rank)}
                        className="text-[#8696A0] hover:text-red-400 p-1 rounded hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 bg-[#111B21] border-t border-[#2A3942] flex justify-end">
              <button 
                onClick={() => setShowRankManager(false)}
                className="px-4 py-2 bg-[#2A3942] text-[#E9EDEF] text-sm font-semibold rounded hover:bg-[#2A3942]/80 transition-colors"
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
