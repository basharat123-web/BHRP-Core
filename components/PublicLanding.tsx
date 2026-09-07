'use client';

import React from 'react';
import { Shield, Users, Calendar, Award, LogIn, CheckCircle2, Radio, Globe, Crown } from 'lucide-react';
import { LiveViewersBadge } from '@/components/LiveViewersBadge';
import { ConvoyEvent, Member } from '@/lib/types';

interface PublicLandingProps {
  viewerCount: number;
  onGoogleSignIn: () => void;
  members: Member[];
  events: ConvoyEvent[];
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  viewerCount,
  onGoogleSignIn,
  members,
  events,
}) => {
  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-slate-950">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#090a0f]/90 border-b border-yellow-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold">
                    TACTICAL GAMER
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Black Hawk RP Family & Convoy Operations</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <LiveViewersBadge count={viewerCount} compact />
              
              <button
                onClick={onGoogleSignIn}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#000000"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#000000"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#000000"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B11.87 1.84 8 4.01 5.48 8.01c-1.45 2.89-1.45 6.09 0 8.98l3.99-3.12z"
                  />
                  <path
                    fill="#000000"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google Login</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Yellow Ambient Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-yellow-500/15 via-amber-500/20 to-yellow-600/15 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-[#0d0f17]/90 border border-yellow-500/40 backdrop-blur-md shadow-xl">
              <LiveViewersBadge count={viewerCount} />
              <span className="text-slate-600 text-xs hidden sm:inline">•</span>
              <span className="text-yellow-400 text-xs font-mono font-bold uppercase tracking-wider hidden sm:inline flex items-center gap-1">
                <Radio className="w-3 h-3 text-yellow-400 animate-pulse" /> Official BHRP Operations Portal
              </span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-none">
              Command Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
                RP Family & Squad
              </span>{' '}
              Operations
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              The premier tactical management platform for GTA V RolePlay & Euro Truck Simulator 2 convoy commanders. Real-time rosters, squad applications, custom profiles, and convoy scheduling.
            </p>

            {/* CTA Main Google Login Button */}
            <div className="pt-4 flex items-center justify-center">
              <button
                onClick={onGoogleSignIn}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:opacity-95 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center space-x-3 shadow-[0_0_40px_rgba(250,204,21,0.3)] transition-all hover:scale-105 cursor-pointer"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#000000"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#000000"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#000000"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B11.87 1.84 8 4.01 5.48 8.01c-1.45 2.89-1.45 6.09 0 8.98l3.99-3.12z"
                  />
                  <path
                    fill="#000000"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google Account</span>
              </button>
            </div>

            {/* Live Stats Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-[#0e1017] border border-yellow-500/30 font-mono">
                <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold text-slate-400">Total Roster</span>
                </div>
                <p className="text-2xl font-black text-white">{members.length} Members</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1017] border border-yellow-500/30 font-mono">
                <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold text-slate-400">Upcoming Convoys</span>
                </div>
                <p className="text-2xl font-black text-white">{events.length} Events</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1017] border border-yellow-500/30 font-mono">
                <div className="flex items-center space-x-2 text-amber-400 mb-1">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold text-slate-400">Squad Leaders</span>
                </div>
                <p className="text-2xl font-black text-amber-400">
                  {members.filter(m => m.rank === 'Leader' || m.rank === 'High Command').length} HC Officers
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1017] border border-yellow-500/30 font-mono">
                <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold text-slate-400">Network Status</span>
                </div>
                <p className="text-2xl font-black text-yellow-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" /> Online
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-[#090a0e] border-y border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">Engineered for Tactical RP Operations</h2>
            <p className="text-slate-400 text-xs font-mono">Built specifically for Black Hawk RP members and convoy commanders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-[#0e1017] border border-slate-800 hover:border-yellow-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white uppercase">Member Roster & XP Progression</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Track full squad member callsigns, rank hierarchies (Leader, HC, Officers), strike warnings, and XP level advancement.
              </p>
              <div className="flex items-center space-x-2 text-xs text-yellow-400 font-mono font-bold pt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Supabase Database Sync</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0e1017] border border-slate-800 hover:border-yellow-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white uppercase">Tactical Convoy Scheduler</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Claim specialized tactical role slots (Pilot Lead, Heavy Cargo, Escort Guard, Rear Sweeper) for upcoming operations.
              </p>
              <div className="flex items-center space-x-2 text-xs text-yellow-400 font-mono font-bold pt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>1-Click Discord Webhook Alert</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0e1017] border border-slate-800 hover:border-yellow-500/50 transition-all space-y-4 shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white uppercase">Root Admin & Family Approvals</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Super-Admin master console for basharat81253@gmail.com with member family approvals and 1-family rule.
              </p>
              <div className="flex items-center space-x-2 text-xs text-yellow-400 font-mono font-bold pt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Root Admin Master Control</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#06070a] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-slate-300">BHRP CORE Official Gamer Portal</span>
          </div>
          <p className="text-slate-500 font-mono">© 2026 Black Hawk RolePlay. Tactical Gaming Edition.</p>
        </div>
      </footer>

    </div>
  );
};
