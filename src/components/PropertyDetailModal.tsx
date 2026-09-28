import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  Eye,
  Footprints,
  Bus,
  Bike,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Phone,
  Check,
  Building,
  Info,
  FileText,
  TrendingDown,
} from 'lucide-react';
import { RentalProperty } from '../types/rental';
import { formatPrice, formatBeds, formatBaths, getStatusBadge } from '../utils/geo';
import { PriceHistoryChart } from './PriceHistoryChart';

interface PropertyDetailModalProps {
  property: RentalProperty | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenChat: (property: RentalProperty) => void;
  onScheduleTour: (property: RentalProperty) => void;
  onApply?: (property: RentalProperty) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenChat,
  onScheduleTour,
  onApply,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!isOpen || !property) return null;

  const status = getStatusBadge(property.availabilityStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Floating Controls */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span>{status.label}</span>
            </span>

            {property.activeViewersCount > 2 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>{property.activeViewersCount} viewing now</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(property.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Save property"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Listing link copied to clipboard!');
                }
              }}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Photo Gallery Hero */}
          <div className="relative aspect-16/9 md:aspect-21/9 w-full bg-slate-900 overflow-hidden">
            <img
              src={property.images[selectedPhotoIndex]?.url}
              alt={property.images[selectedPhotoIndex]?.caption || property.title}
              className="w-full h-full object-cover"
            />

            {/* Photo navigation buttons */}
            {property.images.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-between">
                <button
                  onClick={() =>
                    setSelectedPhotoIndex(
                      (prev) => (prev - 1 + property.images.length) % property.images.length
                    )
                  }
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setSelectedPhotoIndex((prev) => (prev + 1) % property.images.length)
                  }
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Caption */}
            <div className="absolute bottom-3 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
              {property.images[selectedPhotoIndex]?.caption || property.title} (
              {selectedPhotoIndex + 1}/{property.images.length})
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-2 p-3 bg-slate-100 overflow-x-auto">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  selectedPhotoIndex === idx ? 'border-blue-600 scale-102 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Details Body */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Title, Address & Core Price */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                    {property.propertyType}
                  </span>
                  <span className="text-xs text-slate-500">{property.neighborhood}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                  {property.title}
                </h1>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </span>
                </p>
              </div>

              {/* Price & Deposit Pill */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right md:min-w-[200px]">
                {property.originalPrice && property.originalPrice > property.price && (
                  <div className="flex items-center justify-end gap-1.5 mb-1">
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(property.originalPrice)}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" />
                      Save {formatPrice(property.originalPrice - property.price)}/mo
                    </span>
                  </div>
                )}
                <div className="text-2xl font-black text-slate-900">
                  {formatPrice(property.price)}
                  <span className="text-xs text-slate-500 font-medium"> /month</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Deposit: <span className="font-semibold text-slate-700">{formatPrice(property.deposit)}</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Move-in: {property.availableDate}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-400 font-medium">Bedrooms</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">
                  {formatBeds(property.bedrooms)}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-400 font-medium">Bathrooms</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">
                  {formatBaths(property.bathrooms)}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-400 font-medium">Living Area</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">
                  {property.sqft.toLocaleString()} sqft
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-400 font-medium">Lease Terms</span>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                  {property.leaseTerms}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                About this Home
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities & Features */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Key Amenities & Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {property.amenities.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pet Policy & Utilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Pet Policy
                </h4>
                <p className="text-xs font-bold text-slate-800">{property.petPolicy.type}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Pet deposit: ${property.petPolicy.deposit || 0} • Monthly: ${property.petPolicy.monthlyFee || 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Utilities Included
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {property.utilitiesIncluded.map((u) => (
                    <span
                      key={u}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Neighborhood Transit & Walkability Scores */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Neighborhood Scores
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <Footprints className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-base font-black text-emerald-950">
                      {property.scores.walk}/100
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">Walk Score</div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <Bus className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-base font-black text-blue-950">
                      {property.scores.transit}/100
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium">Transit Score</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                  <Bike className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-base font-black text-amber-950">
                      {property.scores.bike}/100
                    </div>
                    <div className="text-[11px] text-amber-700 font-medium">Bike Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Month Price History Chart */}
            <PriceHistoryChart property={property} />

            {/* Landlord Profile Card */}
            <div className="p-5 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={property.landlord.avatar}
                    alt={property.landlord.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold">{property.landlord.name}</h4>
                      {property.landlord.verified && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold flex items-center gap-1 border border-blue-400/30">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      {property.landlord.role} • {property.landlord.company || 'Property Owner'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Typically responds {property.landlord.responseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onScheduleTour(property);
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Tour</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenChat(property);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Action Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">{formatPrice(property.price)}</span>
            <span className="text-xs text-slate-500">/mo</span>
          </div>

          <div className="flex items-center gap-2">
            {onApply && (
              <button
                onClick={() => {
                  onClose();
                  onApply(property);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Apply Now</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onScheduleTour(property);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Schedule Tour</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenChat(property);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Landlord</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
