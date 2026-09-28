import React from 'react';
import {
  X,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { RentalApplication, RentalProperty } from '../types/rental';
import { formatPrice } from '../utils/geo';

interface MyApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: RentalApplication[];
  onOpenChat: (propertyId: string) => void;
  onViewProperty: (propertyId: string) => void;
  onStartNewApplication: () => void;
}

export const MyApplicationsModal: React.FC<MyApplicationsModalProps> = ({
  isOpen,
  onClose,
  applications,
  onOpenChat,
  onViewProperty,
  onStartNewApplication,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: RentalApplication['status']) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Application Approved',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'under_review':
        return {
          label: 'Under Review',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'declined':
        return {
          label: 'Declined',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: 'Submitted & Queued',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">My Rental Applications</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  {applications.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track real-time tenant screening status and landlord decisions
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No Rental Applications Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                You can apply directly to any nearby listing in minutes with our fast, pre-qualified digital rental application.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onStartNewApplication();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Apply to a Rental Property
              </button>
            </div>
          ) : (
            applications.map((app) => {
              const badge = getStatusBadge(app.status);
              return (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Submitted {app.submittedAt}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {app.propertyTitle}
                      </h4>
                      <p className="text-xs text-slate-500">{app.propertyAddress}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">
                        {formatPrice(app.propertyPrice)}/mo
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Move-in: {app.moveInDate}
                      </span>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Applicant</span>
                      <span className="font-semibold text-slate-800">{app.applicantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Employment</span>
                      <span className="font-semibold text-slate-800 truncate block">{app.employerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Annual Income</span>
                      <span className="font-bold text-emerald-600">${app.annualIncome.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Credit Range</span>
                      <span className="font-semibold text-blue-600">{app.creditScoreRange}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onViewProperty(app.propertyId);
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenChat(app.propertyId);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat with Landlord</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            All submitted applications include verified credit & employment verification.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
