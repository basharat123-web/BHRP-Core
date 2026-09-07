'use client';

import React, { useState } from 'react';
import { Shield, Users, Calendar, Menu, X, Crown, UserCheck, User, LogIn, LogOut, PlusCircle, Sparkles, MessageSquare, Radio } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LiveViewersBadge } from '@/components/LiveViewersBadge';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  activeTab: 'roster' | 'events' | 'profile' | 'admin' | 'applications' | 'chat';
  setActiveTab: (tab: 'roster' | 'events' | 'profile' | 'admin' | 'applications' | 'chat') => void;
  memberCount: number;
  upcomingEventCount: number;
  viewerCount: number;
  pendingAppsCount: number;
  userProfile: UserProfile | null;
  onOpenJoinModal: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  memberCount,
  upcomingEventCount,
  viewerCount,
  pendingAppsCount,
  userProfile,
  onOpenJoinModal,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRootAdmin = userProfile?.email?.toLowerCase() === 'basharat81253@gmail.com' || userProfile?.isRootAdmin;
  const isLeader = userProfile?.accountType === 'Family Leader' || isRootAdmin;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090a0f]/90 border-b border-yellow-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('roster')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
              <div className="w-full h-full bg-[#0b0c10] rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-yellow-400">
                  BHRP CORE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-black">
                  GAMER EDITION
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Tactical Gaming Squad & Convoy Hub</p>
            </div>
          </div>

          {/* Live Viewers Badge */}
          <div className="hidden lg:flex items-center">
            <LiveViewersBadge count={viewerCount} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-[#12141c] p-1.5 rounded-2xl border border-yellow-500/20">
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'roster'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Roster</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-slate-200 font-mono font-bold">
                {memberCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Convoy Patrols</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-yellow-500/20 text-yellow-400 font-mono font-bold">
                {upcomingEventCount}
              </span>
            </button>

            {userProfile && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Radio className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span>Tactical Comms</span>
              </button>
            )}

            {isLeader && (
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'applications'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <UserCheck className="w-4 h-4 text-yellow-400" />
                <span>Applications</span>
                {pendingAppsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono font-bold">
                    {pendingAppsCount}
                  </span>
                )}
              </button>
            )}

            {isRootAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/40'
                    : 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30'
                }`}
              >
                <Crown className="w-4 h-4 animate-bounce" />
                <span>ROOT ADMIN</span>
              </button>
            )}

            {userProfile && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <User className="w-4 h-4 text-yellow-400" />
                <span>My Profile</span>
              </button>
            )}
          </nav>

          {/* User Auth Controls */}
          <div className="hidden sm:flex items-center space-x-3">
            {userProfile ? (
              <div className="flex items-center space-x-3">
                {/* Apply Family Button for unassigned members */}
                {userProfile.accountType === 'Member' && !userProfile.currentFamilyId && (
                  <button
                    onClick={onOpenJoinModal}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 transition-all text-xs font-mono font-bold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Apply to Family</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#12141c] border border-yellow-500/30 hover:border-yellow-400 transition-all"
                >
                  <img
                    src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={userProfile.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-yellow-400"
                  />
                  <div className="text-left text-xs">
                    <p className="font-extrabold text-white leading-tight">{userProfile.fullName.split(' ')[0]}</p>
                    <p className="text-[10px] text-yellow-400 font-mono font-bold">{userProfile.accountType}</p>
                  </div>
                </button>

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-[#12141c] border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Google Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <LiveViewersBadge count={viewerCount} compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#12141c] border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0b0c10] px-4 pt-3 pb-5 space-y-2 font-mono">
          <button
            onClick={() => { setActiveTab('roster'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold ${
              activeTab === 'roster' ? 'bg-yellow-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4" />
              <span>Family Roster</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-900 text-slate-200">{memberCount}</span>
          </button>

          <button
            onClick={() => { setActiveTab('events'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold ${
              activeTab === 'events' ? 'bg-yellow-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4" />
              <span>Convoy Patrols</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">{upcomingEventCount}</span>
          </button>

          {userProfile && (
            <button
              onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold ${
                activeTab === 'chat' ? 'bg-yellow-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Radio className="w-4 h-4 text-yellow-400" />
                <span>Tactical Comms (Chat & Voice)</span>
              </div>
            </button>
          )}

          {isLeader && (
            <button
              onClick={() => { setActiveTab('applications'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold ${
                activeTab === 'applications' ? 'bg-yellow-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4 text-yellow-400" />
                <span>Applications</span>
              </div>
              {pendingAppsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-rose-600 text-white font-bold">{pendingAppsCount}</span>
              )}
            </button>
          )}

          {isRootAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950"
            >
              <div className="flex items-center space-x-3">
                <Crown className="w-4 h-4" />
                <span>ROOT ADMIN PANEL</span>
              </div>
            </button>
          )}

          {userProfile ? (
            <button
              onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold ${
                activeTab === 'profile' ? 'bg-yellow-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-yellow-400" />
                <span>My Profile</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-yellow-400">{userProfile.accountType}</span>
            </button>
          ) : (
            <button
              onClick={() => { onGoogleSignIn(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-yellow-500 text-slate-950 font-black text-xs uppercase mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Google Sign In</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
