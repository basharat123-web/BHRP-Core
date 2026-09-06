'use client';

import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Member, MemberRank, MemberStatus } from '@/lib/types';

interface MemberModalProps {
  onClose: () => void;
  onAddMember: (member: Omit<Member, 'id'>) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({ onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [ingameId, setIngameId] = useState('');
  const [rank, setRank] = useState<MemberRank>('Recruit');
  const [status, setStatus] = useState<MemberStatus>('Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !discordTag || !ingameId) return;

    onAddMember({
      name,
      discordTag,
      ingameId,
      rank,
      status,
      strikes: 0,
      xp: rank === 'Leader' ? 1500 : rank === 'High Command' ? 1000 : 250,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0f1423] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add New Family Member</h3>
            <p className="text-xs text-slate-400">Onboard a gamer to BHRP Roster</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Full Name / Gamer Tag *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rafay King"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Discord Tag *</label>
              <input
                type="text"
                required
                placeholder="e.g. rafay#0001"
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">In-Game Badge / ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. BH-101"
                value={ingameId}
                onChange={(e) => setIngameId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Family Rank</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as MemberRank)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Leader">Leader</option>
                <option value="High Command">High Command</option>
                <option value="Officer">Officer</option>
                <option value="Member">Member</option>
                <option value="Recruit">Recruit</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Duty Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
