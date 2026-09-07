'use client';

import React, { useState } from 'react';
import { AccountType } from '@/lib/types';
import { User, Shield, Crown, ArrowRight, CheckCircle2, Sparkles, Clock } from 'lucide-react';

interface RoleOnboardingModalProps {
  onSelectRole: (role: AccountType, familyName?: string, familyTag?: string) => Promise<void>;
}

export const RoleOnboardingModal: React.FC<RoleOnboardingModalProps> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<'Member' | 'Family Leader' | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [familyTag, setFamilyTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    await onSelectRole(selectedRole, familyName, familyTag);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0b0c10] border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(250,204,21,0.15)] text-slate-100 space-y-6 overflow-hidden">
        
        {/* Ambient Top Cyber Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to BHRP Platform
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Select Your <span className="text-yellow-400">Account Type</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Select how you want to participate. This choice is saved permanently for your account.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 font-sans">
          
          {/* Card 1: Member Account */}
          <div
            onClick={() => setSelectedRole('Member')}
            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between space-y-4 ${
              selectedRole === 'Member'
                ? 'bg-yellow-500/15 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-[1.02]'
                : 'bg-[#12141c] border-slate-800 hover:border-slate-700 hover:bg-[#161924]'
            }`}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center justify-between">
                  <span>Member Account</span>
                  {selectedRole === 'Member' && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Join an existing RP family, participate in convoy patrols, claim tactical slots, and gain XP.
                </p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-yellow-400/90 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
              ✓ Requires Family Join Application
            </div>
          </div>

          {/* Card 2: Family Leader Account */}
          <div
            onClick={() => setSelectedRole('Family Leader')}
            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between space-y-4 ${
              selectedRole === 'Family Leader'
                ? 'bg-yellow-500/15 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-[1.02]'
                : 'bg-[#12141c] border-slate-800 hover:border-slate-700 hover:bg-[#161924]'
            }`}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center justify-between">
                  <span>Family Leader</span>
                  {selectedRole === 'Family Leader' && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Create and command your own official RP Family & Convoy Squad.
                </p>
              </div>
            </div>
            <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Root Admin Approval Required
            </div>
          </div>

        </div>

        {/* Input fields if Family Leader selected */}
        {selectedRole === 'Family Leader' && (
          <div className="p-4 rounded-2xl bg-[#12141c] border border-yellow-500/30 space-y-3 animate-fadeIn relative z-10">
            <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider font-mono">Create Your Family Squad</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Apex Predators RP"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Callsign / Tag</label>
                <input
                  type="text"
                  value={familyTag}
                  onChange={(e) => setFamilyTag(e.target.value)}
                  placeholder="e.g. APEX"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-yellow-400 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 relative z-10">
          <button
            onClick={handleSubmit}
            disabled={!selectedRole || (selectedRole === 'Family Leader' && !familyName) || submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-yellow-500/20 transition-all cursor-pointer"
          >
            <span>{submitting ? 'Setting up Profile...' : 'Confirm & Save Selection'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
