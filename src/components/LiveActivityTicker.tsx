import React, { useState, useEffect } from 'react';
import { Sparkles, Radio, ArrowUpRight, Flame, Bell } from 'lucide-react';
import { ActivityNotification, RentalProperty } from '../types/rental';

interface LiveActivityTickerProps {
  notifications: ActivityNotification[];
  onSelectPropertyById: (propertyId: string) => void;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  notifications,
  onSelectPropertyById,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (notifications.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [notifications.length]);

  if (notifications.length === 0) return null;

  const current = notifications[currentIndex] || notifications[0];

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 py-1.5 px-4 text-xs font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] shrink-0 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE UPDATES</span>
          </div>

          <div
            onClick={() => onSelectPropertyById(current.propertyId)}
            className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer transition-colors truncate"
          >
            <span className="truncate">{current.message}</span>
            <span className="text-slate-500 text-[10px] shrink-0">({current.timestamp})</span>
            <ArrowUpRight className="w-3 h-3 text-blue-400 shrink-0" />
          </div>
        </div>

        {/* Viewers online badge */}
        <div className="hidden md:flex items-center gap-2 shrink-0 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-200 font-semibold">42 active renters</span> exploring Austin area
          </span>
        </div>
      </div>
    </div>
  );
};
