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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0b0c10] border-2 border-yellow-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold uppercase">
            <UserCheck className="w-3.5 h-3.5" /> Leader & Admin Review
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            Pending Member <span className="text-yellow-400">Applications</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Review join requests from new members wishing to join your family squad.
          </p>
        </div>

        <span className="px-4 py-2 rounded-2xl bg-yellow-500/20 text-yellow-400 font-mono font-bold text-sm border border-yellow-500/40">
          {pendingApps.length} Pending
        </span>
      </div>

      {/* Applications List */}
      {pendingApps.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0d0f18] border border-slate-800 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-slate-300 font-bold text-base">No Pending Applications</h3>
          <p className="text-slate-500 text-xs">All family join requests have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingApps.map((app) => (
            <div
              key={app.id}
              className="bg-[#0f111a] border-2 border-slate-800 hover:border-yellow-500/40 rounded-3xl p-6 space-y-4 shadow-xl transition-all relative overflow-hidden"
            >
              {/* Applicant Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-yellow-500/30 text-yellow-400 flex items-center justify-center font-bold text-lg">
                    {app.applicantName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">{app.applicantName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-yellow-400" /> {app.applicantEmail}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold">
                  Target: {app.familyName || 'Family'}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500">In-Game ID:</span>
                  <p className="text-yellow-400 font-bold">{app.ingameId || 'BH-NEW'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Discord Tag:</span>
                  <p className="text-slate-300 font-bold">{app.discordTag || 'Not set'}</p>
                </div>
              </div>

              {/* Message if present */}
              {app.message && (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="italic">{app.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={() => handleAction(app, 'Approved')}
                  disabled={processingId === app.id}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Member</span>
                </button>

                <button
                  onClick={() => handleAction(app, 'Rejected')}
                  disabled={processingId === app.id}
                  className="flex-1 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
