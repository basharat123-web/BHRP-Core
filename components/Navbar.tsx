'use client';

import React, { useState } from 'react';
import { Shield, Users, Calendar, Menu, X, CheckCircle2, AlertCircle, User, LogIn, LogOut } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LiveViewersBadge } from '@/components/LiveViewersBadge';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  activeTab: 'roster' | 'events' | 'profile';
  setActiveTab: (tab: 'roster' | 'events' | 'profile') => void;
  memberCount: number;
  upcomingEventCount: number;
  viewerCount: number;
  userProfile: UserProfile | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  memberCount,
  upcomingEventCount,
  viewerCount,
  userProfile,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0d14]/80 border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('roster')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-glow-cyan">
              <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
                  BHRP CORE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Black Hawk RP Family & Convoy Hub</p>
            </div>
          </div>

          {/* Live Viewers Counter Badge in Navbar */}
          <div className="hidden lg:flex items-center">
            <LiveViewersBadge count={viewerCount} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'roster'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Roster</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">
                {memberCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Convoy Scheduler</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-bold">
                {upcomingEventCount}
              </span>
            </button>

            {userProfile && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>My Profile</span>
              </button>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="hidden sm:flex items-center space-x-3">
            {userProfile ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all"
                >
                  <img
                    src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={userProfile.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-cyan-400"
                  />
                  <div className="text-left text-xs">
                    <p className="font-bold text-white leading-tight">{userProfile.fullName.split(' ')[0]}</p>
                    <p className="text-[10px] text-cyan-400 font-mono">{userProfile.rank}</p>
                  </div>
                </button>

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/60 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
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
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0d121f] px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => { setActiveTab('roster'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
              activeTab === 'roster' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5" />
              <span>Family Roster</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-200">{memberCount}</span>
          </button>

          <button
            onClick={() => { setActiveTab('events'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
              activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5" />
              <span>Convoy Scheduler</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300">{upcomingEventCount}</span>
          </button>

          {userProfile ? (
            <button
              onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-cyan-400" />
                <span>My Profile</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-cyan-300">{userProfile.rank}</span>
            </button>
          ) : (
            <button
              onClick={() => { onGoogleSignIn(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold mt-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
