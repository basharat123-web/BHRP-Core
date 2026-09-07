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
        return 'bg-[#00A884]/20 text-[#00A884] border-[#00A884]/30 font-bold';
      case 'High Command':
        return 'bg-[#00A884]/10 text-[#00A884] border-[#00A884]/20 font-semibold';
      case 'Officer':
        return 'bg-[#2A3942] text-[#E9EDEF] border-[#2A3942] font-medium';
      default:
        return 'bg-[#111B21] text-[#8696A0] border-[#2A3942]';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#E9EDEF] font-sans">
      
      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[#00A884]/10 border border-[#00A884]/30 text-[#00A884] flex items-center space-x-3">
          <Check className="w-5 h-5 text-[#00A884]" />
          <span className="text-sm font-semibold">Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="relative bg-[#1F2C34] border border-[#2A3942] rounded-xl p-6 sm:p-8 overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00A884]" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pt-4">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* User Avatar */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#111B21] bg-[#111B21] flex-shrink-0">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* User Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#E9EDEF]">{profile.fullName}</h1>
                
                {isRootAdmin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> ROOT ADMIN
                  </span>
                )}

                {(() => {
                  const displayRank = profile.accountType === 'Family Leader' ? 'Leader' : (profile.accountType === 'Root Admin' ? 'Root Admin' : profile.rank);
                  return (
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getRankBadgeColor(displayRank)}`}>
                      {displayRank}
                    </span>
                  );
                })()}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#8696A0]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </span>
                <span className="flex items-center gap-1 text-[#00A884]">
                  <Hash className="w-3.5 h-3.5" /> ID: {profile.ingameId}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#111B21] border border-[#2A3942] font-semibold text-[10px]">
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
                className="flex items-center space-x-2 px-4 py-2 rounded bg-[#111B21] border border-[#2A3942] hover:border-[#00A884] text-[#8696A0] hover:text-[#00A884] text-xs font-semibold transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}

            <button
              onClick={onSignOut}
              className="flex items-center space-x-2 px-3 py-2 rounded bg-red-900/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progression & Family Status */}
        <div className="space-y-6">
          <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8696A0] flex items-center gap-2">
              <Award className="w-4 h-4" /> Progression & Status
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#8696A0]">Experience (XP)</span>
                <span className="font-semibold text-[#00A884]">{profile.xp} / 2000 XP</span>
              </div>
              <div className="w-full bg-[#111B21] h-2 rounded-full overflow-hidden border border-[#2A3942]">
                <div
                  className="bg-[#00A884] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (profile.xp / 2000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3942] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8696A0]">Account Type</span>
                <span className="px-2 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] font-semibold border border-[#00A884]/20">
                  {profile.accountType}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#8696A0]">Family Status</span>
                {profile.accountType === 'Family Leader' ? (
                  myOrg ? (
                    myOrg.status === 'Approved' ? (
                      <span className="font-semibold text-[#00A884] flex items-center gap-1 text-[10px]">
                        <Check className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="font-semibold text-[#8696A0] flex items-center gap-1 text-[10px]">
                        <Clock className="w-3.5 h-3.5" /> Pending Root Approval
                      </span>
                    )
                  ) : (
                    <span className="font-semibold text-[#8696A0] flex items-center gap-1 text-[10px]">
                      <Clock className="w-3.5 h-3.5" /> Pending Creation
                    </span>
                  )
                ) : (
                  profile.applicationStatus === 'Approved' && myOrg ? (
                    <span className="font-semibold text-[#00A884] flex items-center gap-1 text-[10px]">
                      <Check className="w-3.5 h-3.5" /> Approved
                    </span>
                  ) : profile.applicationStatus === 'Pending' ? (
                    <span className="font-semibold text-[#8696A0] flex items-center gap-1 text-[10px]">
                      <Clock className="w-3.5 h-3.5" /> Application Pending
                    </span>
                  ) : profile.applicationStatus === 'Rejected' ? (
                    <span className="font-semibold text-red-400 text-[10px]">Application Rejected</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#8696A0] text-[10px]">Not in Family</span>
                      {onOpenJoinModal && (
                        <button
                          onClick={onOpenJoinModal}
                          className="text-[10px] bg-[#00A884]/10 text-[#00A884] hover:bg-[#00A884]/20 px-2 py-0.5 rounded transition-colors"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8696A0] flex items-center gap-2">
              <Shield className="w-4 h-4" /> Security & Account
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#8696A0]">Member ID</span>
                <span className="text-[#E9EDEF] font-mono">{profile.id.substring(0,8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8696A0]">Joined Date</span>
                <span className="text-[#E9EDEF]">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Details Form */}
        <div className="md:col-span-2 bg-[#1F2C34] border border-[#2A3942] rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#2A3942] pb-4 mb-5">
            <h3 className="text-lg font-bold text-[#E9EDEF] flex items-center gap-2">
              <User className="w-5 h-5 text-[#00A884]" /> Identification File
            </h3>
            {isEditing && <span className="text-xs text-[#00A884] font-semibold animate-pulse">Editing Mode Active</span>}
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">In-Game ID (Callsign)</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={ingameId}
                    onChange={(e) => setIngameId(e.target.value)}
                    className="w-full bg-[#111B21] border border-[#2A3942] rounded px-4 py-2.5 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] transition-colors"
                  />
                ) : (
                  <div className="w-full bg-[#111B21] border border-[#2A3942] rounded px-4 py-2.5 text-[#E9EDEF] text-sm opacity-80 cursor-not-allowed">
                    {profile.ingameId || 'Not set'}
                  </div>
                )}
                {isEditing && <p className="text-[10px] text-[#8696A0]">Your official RP server identifier.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">Discord Tag</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    placeholder="e.g. Ghost#1234"
                    className="w-full bg-[#111B21] border border-[#2A3942] rounded px-4 py-2.5 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] transition-colors"
                  />
                ) : (
                  <div className="w-full bg-[#111B21] border border-[#2A3942] rounded px-4 py-2.5 text-[#E9EDEF] text-sm opacity-80 cursor-not-allowed">
                    {profile.discordTag || 'Not set'}
                  </div>
                )}
                {isEditing && <p className="text-[10px] text-[#8696A0]">Used for comms and role syncing.</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">Tactical Bio / Loadout</label>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Share your RP background, preferred roles, or loadout..."
                  className="w-full bg-[#111B21] border border-[#2A3942] rounded px-4 py-2.5 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] transition-colors resize-none"
                />
              ) : (
                <div className="w-full bg-[#111B21] border border-[#2A3942] rounded px-4 py-3 text-[#E9EDEF] text-sm min-h-[100px] opacity-80 cursor-not-allowed">
                  {profile.bio ? (
                    <p className="whitespace-pre-wrap">{profile.bio}</p>
                  ) : (
                    <p className="text-[#8696A0] italic">No tactical bio set.</p>
                  )}
                </div>
              )}
            </div>
            
            {isEditing && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded text-[#8696A0] hover:text-[#E9EDEF] text-sm font-semibold transition-colors mr-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
