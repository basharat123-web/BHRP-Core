'use client';

import React, { useState } from 'react';
import { Shield, Users, Calendar, Menu, X, Crown, UserCheck, User, LogIn, LogOut, MessageSquare, Radio, Bell, PlusCircle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  activeTab: 'roster' | 'events' | 'profile' | 'admin' | 'applications' | 'chat';
  setActiveTab: (tab: 'roster' | 'events' | 'profile' | 'admin' | 'applications' | 'chat') => void;
  memberCount: number;
  upcomingEventCount: number;
  viewerCount: number;
  pendingAppsCount: number;
  unreadNotifications?: number;
  userProfile: UserProfile | null;
  onOpenJoinModal: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab, memberCount, upcomingEventCount,
  pendingAppsCount, unreadNotifications = 0, userProfile,
  onOpenJoinModal, onGoogleSignIn, onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRootAdmin = userProfile?.email?.toLowerCase() === 'basharat81253@gmail.com' || userProfile?.isRootAdmin;
  const isLeader = userProfile?.accountType === 'Family Leader' || isRootAdmin;
  const canAccessComms = isRootAdmin || isLeader || (userProfile?.accountType === 'Member' && Boolean(userProfile?.currentFamilyId));

  const navBtn = (tab: typeof activeTab, label: string, Icon: any, badge?: number | string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'bg-[#00A884]/15 text-[#00A884]'
          : 'text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#2A3942]'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {badge !== undefined && Number(badge) > 0 && (
        <span className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#00A884] text-white text-[10px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  const mobileNavBtn = (tab: typeof activeTab, label: string, Icon: any, badge?: number) => (
    <button
      onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        activeTab === tab ? 'bg-[#00A884]/15 text-[#00A884]' : 'text-[#8696A0] hover:bg-[#2A3942] hover:text-[#E9EDEF]'
      }`}
    >
      <div className="flex items-center gap-3"><Icon className="w-4 h-4" /><span>{label}</span></div>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-[#00A884] text-white text-[10px] font-bold">{badge}</span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1F2C34] border-b border-[#2A3942]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('roster')}>
            <div className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[#E9EDEF] font-semibold text-sm leading-tight">BHRP Core</p>
              <p className="text-[#8696A0] text-[11px]">Family Dashboard</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {!isRootAdmin && navBtn('roster', 'Family Roster', Users, memberCount)}
            {!isRootAdmin && navBtn('events', 'Convoy Patrols', Calendar, upcomingEventCount)}
            {userProfile && canAccessComms && !isRootAdmin && navBtn('chat', 'Tactical Comms', MessageSquare)}
            {userProfile?.accountType === 'Family Leader' && !isRootAdmin && navBtn('applications', 'Applications', UserCheck, pendingAppsCount)}
            {isRootAdmin && navBtn('admin', 'Admin Console', Crown)}
            {isRootAdmin && navBtn('chat', 'Direct Chat', Radio)}
            {userProfile && navBtn('profile', 'My Profile', User)}
          </nav>

          {/* User Controls */}
          <div className="hidden sm:flex items-center gap-2">
            {userProfile ? (
              <>
                {userProfile.accountType === 'Member' && !userProfile.currentFamilyId && (
                  <button onClick={onOpenJoinModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] hover:border-[#00A884] text-xs font-medium transition-colors">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Join Family</span>
                  </button>
                )}

                <button onClick={() => setActiveTab('chat')} className="relative p-2 rounded-lg text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#2A3942] transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00A884] text-[9px] font-bold text-white">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#2A3942] transition-colors">
                  <img
                    src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={userProfile.fullName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="text-[#E9EDEF] text-xs font-semibold leading-tight">{userProfile.fullName.split(' ')[0]}</p>
                    <p className="text-[#8696A0] text-[10px]">{userProfile.accountType}</p>
                  </div>
                </button>

                <button onClick={onSignOut} title="Sign Out" className="p-2 rounded-lg text-[#8696A0] hover:text-red-400 hover:bg-[#2A3942] transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button onClick={onGoogleSignIn} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A884] hover:bg-[#06CF9C] text-white text-sm font-semibold transition-colors">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#8696A0] hover:bg-[#2A3942] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2A3942] bg-[#1F2C34] px-4 py-3 space-y-1">
          {!isRootAdmin && mobileNavBtn('roster', 'Family Roster', Users, memberCount)}
          {!isRootAdmin && mobileNavBtn('events', 'Convoy Patrols', Calendar, upcomingEventCount)}
          {userProfile && canAccessComms && !isRootAdmin && mobileNavBtn('chat', 'Tactical Comms', MessageSquare)}
          {userProfile?.accountType === 'Family Leader' && !isRootAdmin && mobileNavBtn('applications', 'Applications', UserCheck, pendingAppsCount)}
          {isRootAdmin && mobileNavBtn('admin', 'Admin Console', Crown)}
          {isRootAdmin && mobileNavBtn('chat', 'Direct Chat', Radio)}
          {userProfile && mobileNavBtn('profile', 'My Profile', User)}
          {!userProfile && (
            <button onClick={() => { onGoogleSignIn(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00A884] text-white text-sm font-semibold mt-2">
              <LogIn className="w-4 h-4" /><span>Sign In with Google</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
