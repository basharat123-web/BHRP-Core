'use client';

import React, { useState } from 'react';
import { FamilyApplication } from '@/lib/types';
import { Shield, Check, X, Clock, Mail, Hash, UserCheck, Sparkles, MessageSquare } from 'lucide-react';

interface FamilyApplicationsViewProps {
  applications: FamilyApplication[];
  onRespond: (
    applicationId: string,
    userId: string,
    familyId: string,
    status: 'Approved' | 'Rejected',
    applicantName: string,
    discordTag: string,
    ingameId: string
  ) => Promise<void>;
}

export const FamilyApplicationsView: React.FC<FamilyApplicationsViewProps> = ({
  applications,
  onRespond,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingApps = applications.filter((app) => app.status === 'Pending');

  const handleAction = async (
    app: FamilyApplication,
    status: 'Approved' | 'Rejected'
  ) => {
    setProcessingId(app.id);
    await onRespond(
      app.id,
      app.userId,
      app.familyId,
      status,
      app.applicantName,
      app.discordTag || 'User#0000',
      app.ingameId || 'BH-NEW'
    );
    setProcessingId(null);
  };

  return (
    <div className="space-y-6 text-[#E9EDEF] font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl bg-[#1F2C34] border border-[#2A3942]">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] text-[10px] font-semibold uppercase">
            <UserCheck className="w-3.5 h-3.5" /> Leader & Admin Review
          </div>
          <h2 className="text-xl font-bold text-[#E9EDEF]">
            Pending Applications
          </h2>
          <p className="text-[#8696A0] text-sm">
            Review join requests from new members wishing to join your family squad.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded bg-[#111B21] border border-[#2A3942] text-[#8696A0] font-semibold text-xs">
          {pendingApps.length} Pending
        </span>
      </div>

      {/* Applications List */}
      {pendingApps.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#1F2C34] border border-[#2A3942] text-center space-y-3">
          <Clock className="w-10 h-10 text-[#8696A0] mx-auto opacity-50" />
          <h3 className="text-[#E9EDEF] font-semibold text-base">No Pending Applications</h3>
          <p className="text-[#8696A0] text-sm">All family join requests have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingApps.map((app) => (
            <div
              key={app.id}
              className="bg-[#1F2C34] border border-[#2A3942] hover:border-[#00A884]/50 rounded-xl p-5 space-y-4 transition-colors relative overflow-hidden"
            >
              {/* Applicant Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#111B21] border border-[#2A3942] text-[#00A884] flex items-center justify-center font-bold text-lg">
                    {app.applicantName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#E9EDEF] text-base">{app.applicantName}</h3>
                    <p className="text-xs text-[#8696A0] flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {app.applicantEmail}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] bg-[#00A884]/10 text-[#00A884] font-medium border border-[#00A884]/20">
                  Target: {app.familyName || 'Family'}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded bg-[#111B21] border border-[#2A3942]">
                <div>
                  <span className="text-[#8696A0] block text-[10px] uppercase font-semibold mb-0.5">In-Game ID</span>
                  <p className="text-[#E9EDEF] font-medium">{app.ingameId || 'BH-NEW'}</p>
                </div>
                <div>
                  <span className="text-[#8696A0] block text-[10px] uppercase font-semibold mb-0.5">Discord Tag</span>
                  <p className="text-[#E9EDEF] font-medium">{app.discordTag || 'Not set'}</p>
                </div>
              </div>

              {/* Message if present */}
              {app.message && (
                <div className="p-3 rounded bg-[#111B21] border border-[#2A3942] text-xs text-[#8696A0] flex items-start space-x-2">
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 opacity-70" />
                  <p className="italic leading-relaxed">{app.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleAction(app, 'Rejected')}
                  disabled={processingId === app.id}
                  className="flex-1 py-2 rounded bg-[#2A3942] hover:bg-[#2A3942]/80 text-[#E9EDEF] font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleAction(app, 'Approved')}
                  disabled={processingId === app.id}
                  className="flex-1 py-2 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Member</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
