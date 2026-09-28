import React, { useState } from 'react';
import {
  Heart,
  MapPin,
  Calendar,
  MessageSquare,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  FileText,
} from 'lucide-react';
import { RentalProperty } from '../types/rental';
import { formatPrice, formatBeds, formatBaths, getStatusBadge } from '../utils/geo';

interface RentalCardProps {
  property: RentalProperty;
  isSelected?: boolean;
  isHovered?: boolean;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string) => void;
  onSelectProperty: (property: RentalProperty) => void;
  onHoverProperty: (propertyId: string | null) => void;
  onOpenChat: (property: RentalProperty) => void;
  onViewDetails: (property: RentalProperty) => void;
  onScheduleTour: (property: RentalProperty) => void;
  onApply?: (property: RentalProperty) => void;
}

export const RentalCard: React.FC<RentalCardProps> = ({
  property,
  isSelected,
  isHovered,
  isFavorite,
  onToggleFavorite,
  onSelectProperty,
  onHoverProperty,
  onOpenChat,
  onViewDetails,
  onScheduleTour,
  onApply,
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const status = getStatusBadge(property.availabilityStatus);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div
      onClick={() => onSelectProperty(property)}
      onMouseEnter={() => onHoverProperty(property.id)}
      onMouseLeave={() => onHoverProperty(null)}
      className={`group bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-lg'
          : isHovered
          ? 'border-slate-300 shadow-md translate-y-[-2px]'
          : 'border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Photo Media Header */}
      <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden">
        <img
          src={property.images[activeImgIndex]?.url}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Image Carousel Arrows */}
        {property.images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Dots */}
        {property.images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {property.images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs border ${status.bg} ${status.text} ${status.border}`}
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span>{status.label}</span>
          </span>

          {/* Real-time viewer indicator */}
          {property.activeViewersCount > 2 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium shadow-xs">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>{property.activeViewersCount} viewing now</span>
            </span>
          )}
        </div>

        {/* Favorite Button & Property Type Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Special Offer Ribbon if available */}
        {property.specialOffer && (
          <div className="absolute bottom-0 inset-x-0 bg-linear-to-r from-blue-700/90 to-indigo-700/90 text-white text-[11px] font-semibold px-3 py-1 backdrop-blur-xs flex items-center gap-1 truncate">
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
            <span className="truncate">{property.specialOffer}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Specs Header */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">
                {formatPrice(property.price)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/month</span>
              {property.originalPrice && property.originalPrice > property.price && (
                <span className="text-xs text-slate-400 line-through ml-1">
                  {formatPrice(property.originalPrice)}
                </span>
              )}
            </div>

            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {property.propertyType}
            </span>
          </div>

          {/* Bed / Bath / Sqft */}
          <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-700">
            <span>{formatBeds(property.bedrooms)}</span>
            <span className="text-slate-300">•</span>
            <span>{formatBaths(property.bathrooms)}</span>
            <span className="text-slate-300">•</span>
            <span>{property.sqft.toLocaleString()} sqft</span>

            {property.distanceMiles !== undefined && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-blue-600 font-medium flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {property.distanceMiles} mi away
                </span>
              </>
            )}
          </div>

          {/* Title & Address */}
          <h3 className="font-semibold text-slate-900 text-sm mt-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
            {property.address}, {property.neighborhood}
          </p>

          {/* Amenities Mini-Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 font-medium">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Landlord Info & Direct Chat Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            {/* Landlord Avatar & Response Time */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={property.landlord.avatar}
                  alt={property.landlord.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                {property.landlord.verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center text-white ring-1 ring-white">
                    <CheckCircle className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <span>{property.landlord.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Replies {property.landlord.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Action buttons: Chat, Schedule, Apply */}
            <div className="flex items-center gap-1.5">
              {onApply && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(property);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-emerald-200"
                  title="Submit online rental application"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Apply</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleTour(property);
                }}
                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                title="Book an in-person or video tour"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Tour</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(property);
                }}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                title="Chat directly with landlord"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
