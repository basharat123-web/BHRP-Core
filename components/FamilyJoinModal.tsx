'use client';

import React, { useState } from 'react';
import { Organization, UserProfile } from '@/lib/types';
import { Users, Shield, Send, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';

interface FamilyJoinModalProps {
  userProfile: UserProfile;
  organizations: Organization[];
  onSubmitApplication: (familyId: string, message: string) => Promise<void>;
  onClose: () => void;
}

export const FamilyJoinModal: React.FC<FamilyJoinModalProps> = ({
  userProfile,
  organizations,
  onSubmitApplication,
  onClose,
}) => {
  const approvedOrgs = organizations.filter((o) => o.status === 'Approved');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(approvedOrgs[0]?.id || organizations[0]?.id || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOrgId) return;
    setSubmitting(true);
    await onSubmitApplication(selectedOrgId, message);
    setSubmitting(false);
    setSubmitted(true);
  };

  const hasCurrentFamily = Boolean(userProfile.currentFamilyId);
  const isPending = userProfile.applicationStatus === 'Pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0b0c10] border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(250,204,21,0.15)] text-slate-100 space-y-6 overflow-hidden">
        
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold uppercase">
            <Users className="w-3.5 h-3.5" /> Family Membership
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            Apply to <span className="text-yellow-400">Join a Family</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Notice: A member can only belong to <strong className="text-yellow-400 font-bold">1 Family at a time</strong>.
          </p>
        </div>

        {/* Check Status */}
        {hasCurrentFamily ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="font-extrabold text-white text-sm">Already in a Family</h4>
                <p className="text-xs text-emerald-400/90">You are an active member of your assigned family.</p>
              </div>
            </div>
          </div>
        ) : isPending || submitted ? (
          <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 space-y-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-white text-sm">Application Pending Approval</h4>
                <p className="text-xs text-amber-400/90">Your join request has been sent to the Family Leader & Root Admin for review.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Choose Family Radio List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select RP Family / Squad</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {approvedOrgs.length === 0 ? (
                  <p className="text-slate-400 text-xs italic font-mono p-3 bg-slate-900/60 rounded-xl">No active approved families available to join at the moment.</p>
                ) : (
                  approvedOrgs.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        selectedOrgId === org.id
                          ? 'bg-yellow-500/15 border-yellow-400 shadow-md shadow-yellow-500/10'
                          : 'bg-[#12141c] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{org.name}</h4>
                          <p className="text-xs text-slate-400">{org.description || 'Official RP Family'}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">
                        [{org.tag}]
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Note to Leader */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Message to Family Leader</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Introduce yourself and your RP experience..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-yellow-400 outline-none"
              />
            </div>

            {/* Action */}
            <button
              onClick={handleSubmit}
              disabled={!selectedOrgId || submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Application...' : 'Submit Join Application'}</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
