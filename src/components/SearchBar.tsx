import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  X,
  Compass,
  LayoutList,
  Map as MapIcon,
  Columns,
} from 'lucide-react';
import { POPULAR_NEIGHBORHOODS } from '../data/mockRentals';
import { SearchFilters } from '../types/rental';

interface SearchBarProps {
  filters: SearchFilters;
  onUpdateFilters: (partial: Partial<SearchFilters>) => void;
  onSelectNeighborhoodCenter: (neighborhood: { lat: number; lng: number; name: string }) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  onOpenAdvancedFilters: () => void;
  activeFilterCount: number;
  viewMode: 'split' | 'map' | 'list';
  onChangeViewMode: (mode: 'split' | 'map' | 'list') => void;
  totalListingsCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onUpdateFilters,
  onSelectNeighborhoodCenter,
  onUseCurrentLocation,
  isLocating,
  onOpenAdvancedFilters,
  activeFilterCount,
  viewMode,
  onChangeViewMode,
  totalListingsCount,
}) => {
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false);

  const radiusOptions = [1, 2, 3, 5, 10, 15, 25];

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Main Search Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Search Input & Neighborhood Selector */}
          <div className="flex-1 flex items-center bg-slate-100 hover:bg-slate-50 focus-within:bg-white rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3 py-1.5 gap-2 relative">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            
            <input
              type="text"
              value={filters.query}
              onChange={(e) => onUpdateFilters({ query: e.target.value })}
              placeholder="Search by street, building, amenity, or feature..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />

            {filters.query && (
              <button
                onClick={() => onUpdateFilters({ query: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Neighborhood Pill button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNeighborhoodDropdown(!showNeighborhoodDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="max-w-[130px] truncate">
                  {filters.neighborhood === 'All' ? 'Austin Metro' : filters.neighborhood}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Neighborhood Dropdown */}
              {showNeighborhoodDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Popular Nearby Areas
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {POPULAR_NEIGHBORHOODS.map((hood) => (
                      <button
                        key={hood.name}
                        onClick={() => {
                          onSelectNeighborhoodCenter(hood);
                          setShowNeighborhoodDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                          filters.neighborhood === hood.name ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{hood.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                          {hood.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Filter Buttons & Tools */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {/* Locate Near Me Button */}
            <button
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors whitespace-nowrap active:scale-95 shrink-0"
              title="Locate rentals near your current location"
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
            </button>

            {/* Distance Radius Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors whitespace-nowrap"
              >
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>Radius: {filters.maxDistanceMiles} mi</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRadiusDropdown && (
                <div className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Search Radius
                  </div>
                  {radiusOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onUpdateFilters({ maxDistanceMiles: r });
                        setShowRadiusDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        filters.maxDistanceMiles === r ? 'font-bold text-blue-700 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      <span>Within {r} mile{r > 1 ? 's' : ''}</span>
                      {filters.maxDistanceMiles === r && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Available Now Toggle */}
            <button
              onClick={() =>
                onUpdateFilters({
                  availability: filters.availability === 'available_now' ? 'all' : 'available_now',
                })
              }
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                filters.availability === 'available_now'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filters.availability === 'available_now' ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Available Now</span>
            </button>

            {/* All Filters Button with Badge */}
            <button
              onClick={onOpenAdvancedFilters}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                activeFilterCount > 0
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-blue-700 text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode Switcher (Split / Map / List) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => onChangeViewMode('split')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Split View (List + Map)"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={() => onChangeViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Map Only View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onChangeViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List Only View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
