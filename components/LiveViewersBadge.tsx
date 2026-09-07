'use client';

import React from 'react';
import { Eye } from 'lucide-react';

interface LiveViewersBadgeProps {
  count: number;
  compact?: boolean;
}

export const LiveViewersBadge: React.FC<LiveViewersBadgeProps> = ({ count, compact = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
      compact
        ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 text-xs'
        : 'bg-[#0e1017]/90 border-yellow-500/50 text-yellow-400 text-sm font-semibold shadow-[0_0_20px_rgba(250,204,21,0.15)]'
    }`}>
      {/* Live Glowing Yellow Pulse Indicator */}
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
      </span>

      {/* Label & Dynamic Count */}
      <div className="flex items-center gap-1.5 font-mono tracking-tight">
        <Eye className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
        <span className="font-bold text-white text-xs sm:text-sm">{count}</span>
        <span className="text-[11px] font-extrabold text-yellow-400/90 uppercase tracking-wider hidden xs:inline">
          {count === 1 ? 'Live Viewer' : 'Live Viewers'}
        </span>
      </div>
    </div>
  );
};
