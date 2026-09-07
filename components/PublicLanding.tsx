'use client';

import React from 'react';
import { Shield, Users, Calendar, Award, Zap, LogIn, Sparkles, CheckCircle2, Lock, ArrowRight, Radio, Globe } from 'lucide-react';
import { LiveViewersBadge } from '@/components/LiveViewersBadge';
import { ConvoyEvent, Member } from '@/lib/types';

interface PublicLandingProps {
  viewerCount: number;
  onGoogleSignIn: () => void;
  onDemoSignIn: () => void;
  members: Member[];
  events: ConvoyEvent[];
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  viewerCount,
  onGoogleSignIn,
  onDemoSignIn,
  members,
  events,
}) => {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0a0d14]/90 border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                    PUBLIC
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Black Hawk RP Family & Convoy Hub</p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-4">
              <LiveViewersBadge count={viewerCount} compact />
              
              <button
                onClick={onGoogleSignIn}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition-all text-xs font-semibold shadow-md hover:shadow-indigo-500/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B11.87 1.84 8 4.01 5.48 8.01c-1.45 2.89-1.45 6.09 0 8.98l3.99-3.12z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google Login</span>
              </button>

              <button
                onClick={onDemoSignIn}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                <span>Enter Hub</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Ambient Glow FX */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
              <LiveViewersBadge count={viewerCount} />
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-300 text-xs font-medium hidden sm:inline flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Official BHRP Platform
              </span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
              Welcome to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">
                Black Hawk RP
              </span>{' '}
              Official Portal
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              The central management hub for GTA V RP & Euro Truck Simulator 2 convoy operations. Real-time family rosters, convoy dispatching, squad ranking system, and member profiles.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGoogleSignIn}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm flex items-center justify-center space-x-3 shadow-xl transition-all hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B11.87 1.84 8 4.01 5.48 8.01c-1.45 2.89-1.45 6.09 0 8.98l3.99-3.12z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <button
                onClick={onDemoSignIn}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-sm flex items-center justify-center space-x-2 backdrop-blur-lg transition-all"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Explore Guest Demo</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Live Community Quick Stats */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold text-slate-400">Total Roster</span>
                </div>
                <p className="text-2xl font-black text-white">{members.length} Members</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold text-slate-400">Upcoming Convoys</span>
                </div>
                <p className="text-2xl font-black text-white">{events.length} Events</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center space-x-2 text-amber-400 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold text-slate-400">Squad Leaders</span>
                </div>
                <p className="text-2xl font-black text-amber-300">
                  {members.filter(m => m.rank === 'Leader' || m.rank === 'High Command').length} HC Officers
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1322]/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold text-slate-400">Live Status</span>
                </div>
                <p className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /> Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-[#0a0d17] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Why Join BHRP Platform?</h2>
            <p className="text-slate-400 text-sm">Engineered specifically for Black Hawk RP members and convoy enthusiasts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#0f1424] border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Member Roster</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Track full squad member profiles, rank hierarchies (Leader, HC, Officers), strike warnings, and XP level advancement.
              </p>
              <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold pt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Supabase Database Sync</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#0f1424] border border-slate-800 hover:border-cyan-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Convoy & Patrol Scheduler</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Claim specialized tactical role slots (Pilot Lead, Heavy Cargo, Escort Guard, Rear Sweeper) for upcoming operations.
              </p>
              <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold pt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>1-Click Discord Webhook Alert</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#0f1424] border border-slate-800 hover:border-purple-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Google OAuth & User Profiles</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Secure 1-click Google Login with dedicated personal profile pages, custom in-game IDs, and rank progression tracking.
              </p>
              <div className="flex items-center space-x-2 text-xs text-purple-400 font-semibold pt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Secure User Profiles</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Public Upcoming Convoys Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-cyan-400" />
              Upcoming Operations Preview
            </h2>
            <p className="text-slate-400 text-xs">Public schedule of upcoming GTA RP patrols and Trucking convoys.</p>
          </div>
          <button
            onClick={onDemoSignIn}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Sign In to Claim Slots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-[#0f1424] rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
              <div className="h-40 relative">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1424] via-transparent to-black/40" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow">
                  {event.game}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Route: {event.routeDetails}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Available Slots:</span>
                  <span className="font-bold text-cyan-400">
                    {event.slots.filter(s => !s.claimedByName).length} / {event.slots.length} Free
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Public Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#06080d] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">BHRP CORE Official Portal</span>
          </div>
          <p className="text-slate-500">© 2026 Black Hawk RolePlay. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};
