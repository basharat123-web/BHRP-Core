'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { User, Shield, Award, Edit3, Save, LogOut, Check, Sparkles, Hash, Mail, Calendar, MessageSquare } from 'lucide-react';

interface UserProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [ingameId, setIngameId] = useState(profile.ingameId || 'BH-NEW');
  const [discordTag, setDiscordTag] = useState(profile.discordTag || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
        return 'bg-gradient-to-r from-amber-500 to-red-600 text-white border-amber-400/40';
      case 'High Command':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/40';
      case 'Officer':
        return 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center space-x-3 shadow-lg">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">Profile updated successfully!</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="relative bg-[#0e1322] border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Top Gradient Banner Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-30" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pt-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* User Avatar */}
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-[#0e1322] shadow-2xl bg-slate-800 flex-shrink-0">
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
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getRankBadgeColor(profile.rank)}`}>
                  {profile.rank}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> {profile.email}
                </span>
                <span className="flex items-center gap-1 font-mono text-cyan-400">
                  <Hash className="w-3.5 h-3.5" /> ID: {profile.ingameId}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold shadow-md transition-all"
              >
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}

            <button
              onClick={onSignOut}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* Profile Details & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: XP & Stats */}
        <div className="space-y-6">
          <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Squad Progression
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Experience (XP)</span>
                <span className="font-bold text-amber-400">{profile.xp} / 2000 XP</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (profile.xp / 2000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Active Member
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Org Affiliation</span>
                <span className="font-bold text-cyan-400">Black Hawk RP (BHRP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Fields */}
        <div className="md:col-span-2 bg-[#0e1322] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" /> Profile Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">In-Game Tag / Callsign</label>
              {isEditing ? (
                <input
                  type="text"
                  value={ingameId}
                  onChange={(e) => setIngameId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-cyan-500 outline-none"
                  placeholder="e.g. BH-105"
                />
              ) : (
                <p className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-sm text-cyan-300">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-indigo-500 outline-none"
                  placeholder="e.g. username#1234"
                />
              ) : (
                <p className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-indigo-300">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-indigo-500 outline-none"
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
