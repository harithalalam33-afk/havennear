import React from 'react';
import { X, Scale, Check, Minus, MessageSquare, Trash2 } from 'lucide-react';
import { RentalProperty } from '../types/rental';
import { formatPrice, formatBeds, formatBaths, getStatusBadge } from '../utils/geo';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: RentalProperty[];
  onRemoveFavorite: (id: string) => void;
  onOpenChat: (property: RentalProperty) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  properties,
  onRemoveFavorite,
  onOpenChat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Compare Saved Rentals</h3>
              <p className="text-xs text-slate-500">Side-by-side breakdown of rent, specs & amenities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-x-auto p-6">
          {properties.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No saved rentals to compare. Save at least two properties using the heart icon!
            </div>
          ) : (
            <div className="min-w-[600px]">
              <div className="grid grid-cols-4 gap-4 pb-4 border-b border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 self-end">
                  Property
                </div>
                {properties.map((p) => (
                  <div key={p.id} className="relative space-y-2">
                    <button
                      onClick={() => onRemoveFavorite(p.id)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white z-10 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <img
                      src={p.images[0]?.url}
                      alt={p.title}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200"
                    />
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                    <div className="text-sm font-black text-blue-600">
                      {formatPrice(p.price)}/mo
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenChat(p);
                      }}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {[
                {
                  label: 'Availability',
                  render: (p: RentalProperty) => {
                    const badge = getStatusBadge(p.availabilityStatus);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    );
                  },
                },
                {
                  label: 'Bedrooms & Baths',
                  render: (p: RentalProperty) => `${formatBeds(p.bedrooms)}, ${formatBaths(p.bathrooms)}`,
                },
                {
                  label: 'Square Footage',
                  render: (p: RentalProperty) => `${p.sqft.toLocaleString()} sqft ($${Math.round(p.price / p.sqft)}/sqft)`,
                },
                {
                  label: 'Security Deposit',
                  render: (p: RentalProperty) => formatPrice(p.deposit),
                },
                {
                  label: 'Neighborhood',
                  render: (p: RentalProperty) => p.neighborhood,
                },
                {
                  label: 'Pet Policy',
                  render: (p: RentalProperty) => p.petPolicy.allowed ? `Yes (${p.petPolicy.type})` : 'No pets',
                },
                {
                  label: 'Parking',
                  render: (p: RentalProperty) => p.parking,
                },
                {
                  label: 'Laundry',
                  render: (p: RentalProperty) => p.laundry,
                },
                {
                  label: 'Walk Score',
                  render: (p: RentalProperty) => `${p.scores.walk}/100`,
                },
                {
                  label: 'Landlord Contact',
                  render: (p: RentalProperty) => `${p.landlord.name} (${p.landlord.role})`,
                },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100 items-center text-xs">
                  <div className="font-semibold text-slate-500">{row.label}</div>
                  {properties.map((p) => (
                    <div key={p.id} className="text-slate-800 font-medium">
                      {row.render(p)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
