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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111B21]/90 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#1F2C34] border border-[#2A3942] rounded-2xl p-6 sm:p-8 shadow-2xl text-[#E9EDEF] space-y-6 overflow-hidden">
        
        {/* Modal Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#00A884]/10 text-[#00A884] text-[10px] font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to the Platform
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#E9EDEF]">
            Select Your Account Type
          </h2>
          <p className="text-[#8696A0] text-sm">
            Select how you want to participate. This choice is saved permanently.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 font-sans">
          
          {/* Card 1: Member Account */}
          <div
            onClick={() => setSelectedRole('Member')}
            className={`cursor-pointer p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
              selectedRole === 'Member'
                ? 'bg-[#00A884]/10 border-[#00A884]'
                : 'bg-[#111B21] border-[#2A3942] hover:border-[#00A884]/50'
            }`}
          >
            <div className="space-y-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === 'Member' ? 'bg-[#00A884]/20 text-[#00A884]' : 'bg-[#1F2C34] text-[#8696A0]'}`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E9EDEF] flex items-center justify-between">
                  <span>Member Account</span>
                  {selectedRole === 'Member' && <CheckCircle2 className="w-5 h-5 text-[#00A884]" />}
                </h3>
                <p className="text-[#8696A0] text-xs mt-1 leading-relaxed">
                  Join an existing family, participate in events, claim slots, and gain XP.
                </p>
              </div>
            </div>
            <div className="text-[10px] text-[#8696A0] bg-[#1F2C34] px-2 py-1.5 rounded border border-[#2A3942] font-semibold">
              Requires Family Join Application
            </div>
          </div>

          {/* Card 2: Family Leader Account */}
          <div
            onClick={() => setSelectedRole('Family Leader')}
            className={`cursor-pointer p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
              selectedRole === 'Family Leader'
                ? 'bg-[#00A884]/10 border-[#00A884]'
                : 'bg-[#111B21] border-[#2A3942] hover:border-[#00A884]/50'
            }`}
          >
            <div className="space-y-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === 'Family Leader' ? 'bg-[#00A884]/20 text-[#00A884]' : 'bg-[#1F2C34] text-[#8696A0]'}`}>
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E9EDEF] flex items-center justify-between">
                  <span>Family Leader</span>
                  {selectedRole === 'Family Leader' && <CheckCircle2 className="w-5 h-5 text-[#00A884]" />}
                </h3>
                <p className="text-[#8696A0] text-xs mt-1 leading-relaxed">
                  Create and command your own official RP Family & Convoy Squad.
                </p>
              </div>
            </div>
            <div className="text-[10px] text-[#00A884] bg-[#00A884]/10 px-2 py-1.5 rounded border border-[#00A884]/20 flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3" /> Root Admin Approval Required
            </div>
          </div>

        </div>

        {/* Input fields if Family Leader selected */}
        {selectedRole === 'Family Leader' && (
          <div className="p-4 rounded-xl bg-[#111B21] border border-[#2A3942] space-y-3 animate-fadeIn relative z-10">
            <h4 className="text-[11px] font-semibold text-[#8696A0] uppercase tracking-wide">Create Your Family Squad</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#8696A0] mb-1">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Ghost Recon"
                  className="w-full px-3 py-2.5 rounded bg-[#1F2C34] border border-[#2A3942] text-[#E9EDEF] text-sm focus:border-[#00A884] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#8696A0] mb-1">Callsign / Tag</label>
                <input
                  type="text"
                  value={familyTag}
                  onChange={(e) => setFamilyTag(e.target.value)}
                  placeholder="e.g. GHOST"
                  className="w-full px-3 py-2.5 rounded bg-[#1F2C34] border border-[#2A3942] text-[#E9EDEF] text-sm focus:border-[#00A884] outline-none transition-colors"
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
            className="w-full py-3 rounded bg-[#00A884] hover:bg-[#06CF9C] disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <span>{submitting ? 'Setting up Profile...' : 'Confirm & Save Selection'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
