import React, { useState } from 'react';
import {
  X,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  DollarSign,
  Calendar,
  MessageSquare,
  Users,
  Eye,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AvailabilityStatus, RentalProperty } from '../types/rental';
import { formatPrice, getStatusBadge } from '../utils/geo';

interface LandlordPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: RentalProperty[];
  onUpdatePropertyStatus: (propertyId: string, newStatus: AvailabilityStatus) => void;
  onUpdatePropertyPrice: (propertyId: string, newPrice: number) => void;
  onOpenChatForProperty: (propertyId: string) => void;
}

export const LandlordPortalModal: React.FC<LandlordPortalModalProps> = ({
  isOpen,
  onClose,
  properties,
  onUpdatePropertyStatus,
  onUpdatePropertyPrice,
  onOpenChatForProperty,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [newPriceInput, setNewPriceInput] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProperty =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const handleStatusChange = (status: AvailabilityStatus) => {
    if (!currentProperty) return;
    onUpdatePropertyStatus(currentProperty.id, status);
    setFeedbackToast(`Updated status to "${status.replace('_', ' ').toUpperCase()}" in real-time!`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProperty) return;
    const num = parseFloat(newPriceInput);
    if (!isNaN(num) && num > 0) {
      onUpdatePropertyPrice(currentProperty.id, num);
      setNewPriceInput('');
      setFeedbackToast(`Rent updated to ${formatPrice(num)}! Price drop broadcasted.`);
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Landlord Real-Time Management Portal</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instant availability updates, pricing control & tour dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Pill */}
        {feedbackToast && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Property Selector Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto">
            <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              Your Managed Listings ({properties.length})
            </div>
            <div className="divide-y divide-slate-200">
              {properties.map((p) => {
                const isSelected = p.id === currentProperty?.id;
                const badge = getStatusBadge(p.availabilityStatus);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPropertyId(p.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-white border-l-4 border-l-blue-600 shadow-2xs' : 'hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={p.images[0]?.url}
                      alt={p.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {formatPrice(p.price)}/mo • {p.neighborhood}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span className="text-[10px] font-semibold text-slate-600">
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Management Workspace for Selected Property */}
          {currentProperty && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Selected Property Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {currentProperty.propertyType}
                    </span>
                    <span className="text-xs text-slate-500">{currentProperty.address}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{currentProperty.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-900">{formatPrice(currentProperty.price)}/mo</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <Eye className="w-3.5 h-3.5" />
                      {currentProperty.activeViewersCount} live viewers
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenChatForProperty(currentProperty.id);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Tenant Messages</span>
                </button>
              </div>

              {/* 1-Click Real-Time Availability Switcher */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Broadcast Real-Time Availability Status
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Clicking instantly updates map markers, listing badges, search filters, and prospective tenants.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'available_now' as const,
                      label: 'Available Now',
                      desc: 'Ready for move-in today',
                      dot: 'bg-emerald-500',
                      btnClass: 'hover:border-emerald-500 hover:bg-emerald-50/50',
                      activeClass: 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 text-emerald-950',
                    },
                    {
                      id: 'available_soon' as const,
                      label: 'Available Soon',
                      desc: 'Upcoming vacancy',
                      dot: 'bg-blue-500',
                      btnClass: 'hover:border-blue-500 hover:bg-blue-50/50',
                      activeClass: 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 text-blue-950',
                    },
                    {
                      id: 'pending_application' as const,
                      label: 'Pending Application',
                      desc: 'Reviewing background',
                      dot: 'bg-amber-500',
                      btnClass: 'hover:border-amber-500 hover:bg-amber-50/50',
                      activeClass: 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20 text-amber-950',
                    },
                    {
                      id: 'rented' as const,
                      label: 'Just Rented',
                      desc: 'Lease executed',
                      dot: 'bg-slate-400',
                      btnClass: 'hover:border-slate-500 hover:bg-slate-50',
                      activeClass: 'border-slate-700 bg-slate-100 ring-2 ring-slate-400/20 text-slate-900',
                    },
                  ].map((option) => {
                    const isActive = currentProperty.availabilityStatus === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleStatusChange(option.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isActive ? option.activeClass : `bg-white border-slate-200 ${option.btnClass}`
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${option.dot}`} />
                          <span className="text-xs font-bold">{option.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">{option.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Adjustment & Promo Trigger */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Update Monthly Rent
                </label>
                <form onSubmit={handlePriceUpdate} className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={newPriceInput}
                      onChange={(e) => setNewPriceInput(e.target.value)}
                      placeholder={`Current rent: $${currentProperty.price}`}
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none ml-1"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                  >
                    Apply New Rent
                  </button>
                </form>
              </div>

              {/* Upcoming Tour Requests Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Open Tour Requests & Timeslots
                  </label>
                  <span className="text-xs text-blue-600 font-semibold cursor-pointer">
                    + Add New Slot
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                  {currentProperty.tourSlots.length > 0 ? (
                    currentProperty.tourSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-800">{slot.date}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{slot.time}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Open Slot
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No current open slots. Click '+ Add New Slot' to announce showings.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
