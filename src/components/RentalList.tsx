import React from 'react';
import { RentalProperty, SearchFilters } from '../types/rental';
import { RentalCard } from './RentalCard';
import { ArrowUpDown, AlertCircle, Sparkles, SlidersHorizontal } from 'lucide-react';

interface RentalListProps {
  properties: RentalProperty[];
  selectedProperty: RentalProperty | null;
  hoveredPropertyId: string | null;
  favorites: string[];
  onToggleFavorite: (propertyId: string) => void;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (propertyId: string | null) => void;
  onOpenChat: (property: RentalProperty) => void;
  onViewDetails: (property: RentalProperty) => void;
  onScheduleTour: (property: RentalProperty) => void;
  onApply?: (property: RentalProperty) => void;
  filters: SearchFilters;
  onUpdateFilters: (partial: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
}

export const RentalList: React.FC<RentalListProps> = ({
  properties,
  selectedProperty,
  hoveredPropertyId,
  favorites,
  onToggleFavorite,
  onSelectProperty,
  onHoverProperty,
  onOpenChat,
  onViewDetails,
  onScheduleTour,
  onApply,
  filters,
  onUpdateFilters,
  onResetFilters,
}) => {
  return (
    <div className="w-full h-full flex flex-col overflow-y-auto pr-1">
      {/* List Header: Results count and Sort Selector */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <span>Nearby House & Apartment Rentals</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-800">{properties.length}</span> properties found in this area
          </p>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdateFilters({ sortBy: e.target.value as any })}
            className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="distance">Distance: Nearest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {properties.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200 my-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No properties match your current filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Try expanding your search radius, lowering bedroom requirements, or resetting your price filters.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Listings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
          {properties.map((property) => (
            <RentalCard
              key={property.id}
              property={property}
              isSelected={selectedProperty?.id === property.id}
              isHovered={hoveredPropertyId === property.id}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProperty={onSelectProperty}
              onHoverProperty={onHoverProperty}
              onOpenChat={onOpenChat}
              onViewDetails={onViewDetails}
              onScheduleTour={onScheduleTour}
              onApply={onApply}
            />
          ))}
        </div>
      )}
    </div>
  );
};
