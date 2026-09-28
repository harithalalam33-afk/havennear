import React from 'react';
import {
  X,
  RotateCcw,
  Check,
  DollarSign,
  Home,
  ShieldCheck,
  Dog,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PropertyType, SearchFilters } from '../types/rental';
import { formatPrice } from '../utils/geo';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onUpdateFilters: (partial: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  resultsCount: number;
}

const PROPERTY_TYPES: PropertyType[] = [
  'House',
  'Apartment',
  'Townhouse',
  'Studio',
  'Loft',
  'Penthouse',
];

const AMENITY_OPTIONS = [
  'In-unit Washer/Dryer',
  'Pet Friendly',
  'Central AC',
  'Dedicated Parking',
  'EV Charger',
  'Swimming Pool',
  'Private Backyard',
  'Private Balcony',
  'High-Speed Google Fiber 1Gbps',
  'Smart Home Automation',
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  resultsCount,
}) => {
  if (!isOpen) return null;

  const togglePropertyType = (type: PropertyType) => {
    if (filters.propertyTypes.includes(type)) {
      onUpdateFilters({
        propertyTypes: filters.propertyTypes.filter((t) => t !== type),
      });
    } else {
      onUpdateFilters({
        propertyTypes: [...filters.propertyTypes, type],
      });
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (filters.amenities.includes(amenity)) {
      onUpdateFilters({
        amenities: filters.amenities.filter((a) => a !== amenity),
      });
    } else {
      onUpdateFilters({
        amenities: [...filters.amenities, amenity],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">Map & Rental Filters</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {resultsCount} match{resultsCount === 1 ? '' : 'es'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Price Range */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Monthly Rent Range
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <span className="text-xs text-slate-400">Min Rent</span>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mt-1">
                  <span className="text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={filters.minPrice}
                    step={100}
                    min={500}
                    max={filters.maxPrice - 100}
                    onChange={(e) => onUpdateFilters({ minPrice: Number(e.target.value) })}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 ml-1 focus:outline-none"
                  />
                </div>
              </div>
              <span className="text-slate-300 mt-5">—</span>
              <div className="flex-1">
                <span className="text-xs text-slate-400">Max Rent</span>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mt-1">
                  <span className="text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    step={100}
                    min={filters.minPrice + 100}
                    max={10000}
                    onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 ml-1 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Under $2k', min: 0, max: 2000 },
                { label: '$2k - $3k', min: 2000, max: 3000 },
                { label: '$3k - $4.5k', min: 3000, max: 4500 },
                { label: '$4.5k+', min: 4500, max: 10000 },
              ].map((bracket) => (
                <button
                  key={bracket.label}
                  type="button"
                  onClick={() => onUpdateFilters({ minPrice: bracket.min, maxPrice: bracket.max })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    filters.minPrice === bracket.min && filters.maxPrice === bracket.max
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {bracket.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Bedrooms
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { label: 'Any', value: 'all' as const },
                { label: 'Studio', value: 0 },
                { label: '1+', value: 1 },
                { label: '2+', value: 2 },
                { label: '3+', value: 3 },
                { label: '4+', value: 4 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onUpdateFilters({ bedrooms: opt.value })}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    filters.bedrooms === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Bathrooms
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Any', value: 'all' as const },
                { label: '1+ Bath', value: 1 },
                { label: '2+ Baths', value: 2 },
                { label: '3+ Baths', value: 3 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onUpdateFilters({ bathrooms: opt.value })}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    filters.bathrooms === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Property Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = filters.propertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability Status */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Real-Time Availability
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Listings' },
                { id: 'available_now', label: '🟢 Available Now' },
                { id: 'available_soon', label: '🔵 Available Soon' },
              ].map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => onUpdateFilters({ availability: status.id as any })}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    filters.availability === status.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Toggles: Pet Friendly, Verified Landlord */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2.5">
                <Dog className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Pet Friendly Only</div>
                  <div className="text-[11px] text-slate-500">Allow dogs or cats</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.petFriendlyOnly}
                onChange={(e) => onUpdateFilters({ petFriendlyOnly: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Verified Landlords</div>
                  <div className="text-[11px] text-slate-500">ID & Ownership checked</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.verifiedLandlordOnly}
                onChange={(e) => onUpdateFilters({ verifiedLandlordOnly: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Must-Have Amenities */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Amenities & Perks
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{amenity}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Show {resultsCount} Properties
          </button>
        </div>
      </div>
    </div>
  );
};
