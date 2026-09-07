'use client';

import React from 'react';
import { Eye } from 'lucide-react';

interface LiveViewersBadgeProps {
  count: number;
  compact?: boolean;
}

export const LiveViewersBadge: React.FC<LiveViewersBadgeProps> = ({ count, compact = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
      compact
        ? 'bg-[#00A884]/10 border-[#00A884]/30 text-[#00A884] text-xs'
        : 'bg-[#111B21] border-[#2A3942] text-[#00A884] text-sm font-semibold'
    }`}>
      {/* Live Glowing Pulse Indicator */}
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A884] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00A884]"></span>
      </span>

      {/* Label & Dynamic Count */}
      <div className="flex items-center gap-1.5 font-sans tracking-tight">
        <Eye className="w-3.5 h-3.5 text-[#00A884] opacity-80" />
        <span className="font-bold text-[#E9EDEF] text-xs sm:text-sm">{count}</span>
        <span className="text-[10px] font-semibold text-[#8696A0] uppercase tracking-wider hidden xs:inline">
          {count === 1 ? 'Live Viewer' : 'Live Viewers'}
        </span>
      </div>
    </div>
  );
};
