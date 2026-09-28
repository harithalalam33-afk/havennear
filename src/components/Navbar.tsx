import React from 'react';
import {
  Home,
  MessageSquare,
  Heart,
  Building2,
  Sliders,
  Sparkles,
  MapPin,
  Bell,
  Scale,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  favoritesCount: number;
  unreadMessagesCount: number;
  applicationsCount?: number;
  onOpenFavorites: () => void;
  onOpenChat: () => void;
  onOpenApplications?: () => void;
  onOpenLandlordPortal: () => void;
  onOpenCompare: () => void;
  totalPropertiesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  favoritesCount,
  unreadMessagesCount,
  applicationsCount = 0,
  onOpenFavorites,
  onOpenChat,
  onOpenApplications,
  onOpenLandlordPortal,
  onOpenCompare,
  totalPropertiesCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & City Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Haven<span className="text-blue-600">Near</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  Live Rentals
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Map-based rentals & instant landlord messaging
              </p>
            </div>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Applications Button */}
          {onOpenApplications && (
            <button
              onClick={onOpenApplications}
              className="relative px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="My Rental Applications"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Applications</span>
              {applicationsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {applicationsCount}
                </span>
              )}
            </button>
          )}

          {/* Compare Button */}
          {favoritesCount >= 2 && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              title="Compare saved properties"
            >
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Compare ({favoritesCount})</span>
            </button>
          )}

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Saved Favorites"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
            <span className="text-xs font-semibold hidden md:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Messages Button */}
          <button
            onClick={onOpenChat}
            className="relative px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Landlord Chat System"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Landlord Chat</span>
            {unreadMessagesCount > 0 ? (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Landlord Management Mode Button */}
          <button
            onClick={onOpenLandlordPortal}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            title="Switch to Landlord Management Mode"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Landlord Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
