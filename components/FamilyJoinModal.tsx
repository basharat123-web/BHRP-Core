'use client';

import React, { useState } from 'react';
import { Organization, UserProfile } from '@/lib/types';
import { Users, Shield, Send, CheckCircle2, Clock, X, AlertCircle, RefreshCw } from 'lucide-react';

interface FamilyJoinModalProps {
  userProfile: UserProfile;
  organizations: Organization[];
  onSubmitApplication: (familyId: string, message: string) => Promise<void>;
  onClose: () => void;
  onRefreshStatus?: () => Promise<void>;
}

export const FamilyJoinModal: React.FC<FamilyJoinModalProps> = ({
  userProfile,
  organizations,
  onSubmitApplication,
  onClose,
  onRefreshStatus,
}) => {
  const approvedOrgs = organizations.filter((o) => o.status === 'Approved');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(approvedOrgs[0]?.id || organizations[0]?.id || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefreshStatus) return;
    setRefreshing(true);
    await onRefreshStatus();
    setRefreshing(false);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111B21]/90 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#1F2C34] border border-[#2A3942] rounded-2xl p-6 sm:p-8 shadow-2xl text-[#E9EDEF] space-y-6 overflow-hidden">
        
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-[#111B21] border border-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] text-[10px] font-semibold uppercase">
            <Users className="w-3.5 h-3.5" /> Family Membership
          </div>
          <h2 className="text-2xl font-bold text-[#E9EDEF]">
            Apply to Join a Family
          </h2>
          <p className="text-[#8696A0] text-sm">
            Notice: A member can only belong to <strong className="text-[#E9EDEF]">1 Family at a time</strong>.
          </p>
        </div>

        {/* Check Status */}
        {hasCurrentFamily ? (
          <div className="p-5 rounded-xl bg-[#00A884]/10 border border-[#00A884]/30 text-[#00A884] space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-[#00A884] text-sm">Already in a Family</h4>
                <p className="text-xs opacity-90">You are an active member of your assigned family.</p>
              </div>
            </div>
          </div>
        ) : isPending || submitted ? (
          <div className="p-5 rounded-xl bg-[#2A3942] border border-[#8696A0]/30 text-[#E9EDEF] space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-[#8696A0] animate-pulse" />
              <div>
                <h4 className="font-bold text-[#E9EDEF] text-sm">Application Pending Approval</h4>
                <p className="text-xs text-[#8696A0]">Your join request has been sent to the Family Leader & Root Admin for review.</p>
              </div>
            </div>
            {onRefreshStatus && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full py-2.5 rounded bg-[#111B21] border border-[#2A3942] text-[#E9EDEF] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#2A3942] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Checking status...' : 'Check Approval Status'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Choose Family Radio List */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#8696A0]">Select RP Family / Squad</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {approvedOrgs.length === 0 ? (
                  <p className="text-[#8696A0] text-xs italic p-3 bg-[#111B21] rounded-lg">No active approved families available to join at the moment.</p>
                ) : (
                  approvedOrgs.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                        selectedOrgId === org.id
                          ? 'bg-[#00A884]/10 border-[#00A884]'
                          : 'bg-[#111B21] border-[#2A3942] hover:border-[#00A884]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded bg-[#1F2C34] border border-[#2A3942] flex items-center justify-center">
                          <Shield className={`w-5 h-5 ${selectedOrgId === org.id ? 'text-[#00A884]' : 'text-[#8696A0]'}`} />
                        </div>
                        <div>
                          <h4 className={`font-semibold text-sm ${selectedOrgId === org.id ? 'text-[#E9EDEF]' : 'text-[#8696A0]'}`}>{org.name}</h4>
                          <p className="text-xs text-[#8696A0]">{org.description || 'Official RP Family'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${selectedOrgId === org.id ? 'bg-[#00A884]/20 text-[#00A884] border-[#00A884]/30' : 'bg-[#1F2C34] text-[#8696A0] border-[#2A3942]'}`}>
                        {org.tag}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Note to Leader */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#8696A0] mb-1">Message to Family Leader</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Introduce yourself and your RP experience..."
                className="w-full px-3 py-2.5 rounded bg-[#111B21] border border-[#2A3942] text-[#E9EDEF] text-sm focus:border-[#00A884] outline-none transition-colors"
              />
            </div>

            {/* Action */}
            <button
              onClick={handleSubmit}
              disabled={!selectedOrgId || submitting}
              className="w-full py-3 rounded bg-[#00A884] hover:bg-[#06CF9C] disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
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
