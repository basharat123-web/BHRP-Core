'use client';

import React from 'react';
import { Eye, Users } from 'lucide-react';

interface LiveViewersBadgeProps {
  count: number;
  compact?: boolean;
}

export const LiveViewersBadge: React.FC<LiveViewersBadgeProps> = ({ count, compact = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
      compact
        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 text-xs'
        : 'bg-slate-900/90 border-emerald-500/40 text-emerald-400 text-sm font-semibold shadow-lg shadow-emerald-950/30'
    }`}>
      {/* Live Glowing Pulse Indicator */}
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      {/* Label & Dynamic Count */}
      <div className="flex items-center gap-1.5 font-mono tracking-tight">
        <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-bold text-white text-xs sm:text-sm">{count}</span>
        <span className="text-[11px] font-semibold text-emerald-300/90 uppercase tracking-wider hidden xs:inline">
          {count === 1 ? 'Live Viewer' : 'Live Viewers'}
        </span>
      </div>
    </div>
  );
};
