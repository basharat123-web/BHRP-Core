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
    <div className="min-h-screen bg-[#111B21] text-[#E9EDEF] flex flex-col font-sans selection:bg-[#00A884] selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#1F2C34]/90 border-b border-[#2A3942]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#00A884]/10 border border-[#00A884]/30">
                <Shield className="w-5 h-5 text-[#00A884]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-[#E9EDEF]">
                    BHRP
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] font-semibold border border-[#00A884]/20 hidden sm:inline-block">
                    PORTAL
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <LiveViewersBadge count={viewerCount} compact />
              
              <button
                onClick={onGoogleSignIn}
                className="flex items-center space-x-2 px-4 py-2 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Google Login</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center space-x-3 px-3 py-1.5 rounded-full bg-[#1F2C34] border border-[#2A3942]">
              <LiveViewersBadge count={viewerCount} />
              <span className="text-[#8696A0] text-[10px] hidden sm:inline">•</span>
              <span className="text-[#00A884] text-[10px] font-semibold uppercase hidden sm:inline flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#00A884] animate-pulse" /> Official Operations Portal
              </span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-5xl font-bold text-[#E9EDEF] leading-tight">
              Command Your{' '}
              <span className="text-[#00A884]">Family Squad</span>{' '}
              Operations
            </h1>

            <p className="text-base text-[#8696A0] leading-relaxed max-w-2xl mx-auto">
              The premier management platform for RolePlay & convoy commanders. Real-time rosters, squad applications, custom profiles, and event scheduling.
            </p>

            {/* CTA Main Google Login Button */}
            <div className="pt-4 flex items-center justify-center">
              <button
                onClick={onGoogleSignIn}
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-sm flex items-center justify-center space-x-3 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
                  <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B11.87 1.84 8 4.01 5.48 8.01c-1.45 2.89-1.45 6.09 0 8.98l3.99-3.12z"/>
                  <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Sign in with Google Account</span>
              </button>
            </div>

            {/* Live Stats Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-xl bg-[#1F2C34] border border-[#2A3942]">
                <div className="flex items-center space-x-2 text-[#8696A0] mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Total Roster</span>
                </div>
                <p className="text-xl font-bold text-[#E9EDEF]">{members.length} Members</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1F2C34] border border-[#2A3942]">
                <div className="flex items-center space-x-2 text-[#8696A0] mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Events</span>
                </div>
                <p className="text-xl font-bold text-[#E9EDEF]">{events.length} Upcoming</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1F2C34] border border-[#2A3942]">
                <div className="flex items-center space-x-2 text-[#8696A0] mb-2">
                  <Crown className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Commanders</span>
                </div>
                <p className="text-xl font-bold text-[#E9EDEF]">
                  {members.filter(m => m.rank === 'Leader' || m.rank === 'High Command').length} Leaders
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1F2C34] border border-[#2A3942]">
                <div className="flex items-center space-x-2 text-[#8696A0] mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Status</span>
                </div>
                <p className="text-xl font-bold text-[#00A884] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A884] animate-ping" /> Online
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-[#1F2C34] border-t border-[#2A3942]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl font-bold text-[#E9EDEF]">Engineered for RP Operations</h2>
            <p className="text-[#8696A0] text-sm">Built specifically for roleplay families and convoy commanders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-xl bg-[#111B21] border border-[#2A3942] space-y-4 hover:border-[#00A884]/50 transition-colors">
              <div className="w-10 h-10 rounded bg-[#00A884]/10 text-[#00A884] flex items-center justify-center border border-[#00A884]/20">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#E9EDEF]">Member Roster & XP</h3>
              <p className="text-[#8696A0] text-sm leading-relaxed">
                Track full squad member callsigns, rank hierarchies (Leader, HC, Officers), strike warnings, and XP level advancement.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#111B21] border border-[#2A3942] space-y-4 hover:border-[#00A884]/50 transition-colors">
              <div className="w-10 h-10 rounded bg-[#00A884]/10 text-[#00A884] flex items-center justify-center border border-[#00A884]/20">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#E9EDEF]">Convoy Scheduling Slots</h3>
              <p className="text-[#8696A0] text-sm leading-relaxed">
                Create structured patrol events, define tactical role slots (e.g. Lead Pilot, Heavy Cargo), and allow members to instantly claim them.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#111B21] border border-[#2A3942] space-y-4 hover:border-[#00A884]/50 transition-colors">
              <div className="w-10 h-10 rounded bg-[#00A884]/10 text-[#00A884] flex items-center justify-center border border-[#00A884]/20">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#E9EDEF]">Root Admin Family Approvals</h3>
              <p className="text-[#8696A0] text-sm leading-relaxed">
                Maintain high quality RP standards. Family creation requests require Root Admin sign-off before they can start recruiting members.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-[#111B21] border-t border-[#2A3942] text-center">
        <p className="text-[10px] text-[#8696A0] font-semibold">
          © {new Date().getFullYear()} BHRP Core Systems. A custom RolePlay Management Solution.
        </p>
      </footer>

    </div>
  );
};
