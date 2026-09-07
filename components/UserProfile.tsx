'use client';

import React, { useState } from 'react';
import { UserProfile, Organization } from '@/lib/types';
import { User, Shield, Award, Edit3, Save, LogOut, Check, Crown, Hash, Mail, Clock, MessageSquare, PlusCircle } from 'lucide-react';

interface UserProfileViewProps {
  profile: UserProfile;
  organizations?: Organization[];
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => void;
  onOpenJoinModal?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  organizations = [],
  onUpdateProfile,
  onSignOut,
  onOpenJoinModal,
}) => {
  const myOrg = organizations.find((o) => o.id === profile.currentFamilyId);
  const [isEditing, setIsEditing] = useState(false);
  const [ingameId, setIngameId] = useState(profile.ingameId || 'BH-NEW');
  const [discordTag, setDiscordTag] = useState(profile.discordTag || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isRootAdmin = profile.email.toLowerCase() === 'basharat81253@gmail.com' || profile.isRootAdmin;

  const handleSave = async () => {
    setSaving(true);
    await onUpdateProfile({
      ingameId,
      discordTag,
      bio,
    });
    setSaving(false);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Leader':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black border-yellow-400';
      case 'High Command':
        return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black border-amber-400';
      case 'Officer':
        return 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white font-bold border-yellow-500/40';
      default:
        return 'bg-slate-900 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 flex items-center space-x-3 shadow-lg font-mono">
          <Check className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-bold">Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="relative bg-[#0b0c10] border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.1)]">
        {/* Top Cyber Yellow Glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-yellow-500/20 via-amber-500/15 to-yellow-600/20" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pt-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* User Avatar */}
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-yellow-500/50 shadow-2xl bg-slate-900 flex-shrink-0">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* User Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.fullName}</h1>
                
                {isRootAdmin && (
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border border-yellow-300 shadow-md shadow-yellow-500/20 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> ROOT ADMIN
                  </span>
                )}

                {(() => {
                  const displayRank = profile.accountType === 'Family Leader' ? 'Leader' : (profile.accountType === 'Root Admin' ? 'Root Admin' : profile.rank);
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase border ${getRankBadgeColor(displayRank)}`}>
                      {displayRank}
                    </span>
                  );
                })()}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-yellow-400" /> {profile.email}
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Hash className="w-3.5 h-3.5" /> ID: {profile.ingameId}
                </span>
                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold">
                  Role: {profile.accountType}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#12141c] border border-yellow-500/40 hover:border-yellow-400 text-yellow-400 text-xs font-mono font-bold transition-all"
              >
                <Edit3 className="w-4 h-4 text-yellow-400" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}

            <button
              onClick={onSignOut}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        
        {/* Progression & Family Status */}
        <div className="space-y-6">
          <div className="bg-[#0b0c10] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" /> Progression & Status
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Experience (XP)</span>
                <span className="font-bold text-yellow-400">{profile.xp} / 2000 XP</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (profile.xp / 2000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account Type</span>
                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/30">
                  {profile.accountType}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Family Status</span>
                {profile.accountType === 'Family Leader' ? (
                  myOrg?.status === 'Approved' ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Approved Family Squad
                    </span>
                  ) : (
                    <span className="font-bold text-amber-400 flex items-center gap-1" title="Requires basharat81253@gmail.com approval">
                      <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Root Admin Approval
                    </span>
                  )
                ) : profile.currentFamilyId ? (
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Assigned to Family
                  </span>
                ) : profile.applicationStatus === 'Pending' ? (
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Application Pending Review
                  </span>
                ) : (
                  <span className="text-slate-500">No Family Assigned</span>
                )}
              </div>

              {profile.accountType === 'Member' && !profile.currentFamilyId && onOpenJoinModal && (
                <button
                  onClick={onOpenJoinModal}
                  className="w-full mt-2 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Apply to Join Family</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Editable Profile Fields */}
        <div className="md:col-span-2 bg-[#0b0c10] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2">
            <User className="w-4 h-4 text-yellow-400" /> Gamer Identity & Callsign
          </h3>

          <div className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">In-Game Tag / Callsign</label>
              {isEditing ? (
                <input
                  type="text"
                  value={ingameId}
                  onChange={(e) => setIngameId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-yellow-400 outline-none"
                  placeholder="e.g. BH-105"
                />
              ) : (
                <p className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-sm text-yellow-400 font-bold">
                  {profile.ingameId || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Discord Tag</label>
              {isEditing ? (
                <input
                  type="text"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-yellow-400 outline-none"
                  placeholder="e.g. username#1234"
                />
              ) : (
                <p className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300">
                  {profile.discordTag || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Roleplay Bio / About Me</label>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-yellow-400 outline-none"
                  placeholder="Tell the family about your gaming experience..."
                />
              ) : (
                <p className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
                  {profile.bio || 'No bio provided.'}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
