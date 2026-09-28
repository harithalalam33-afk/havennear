import React, { useState } from 'react';
import {
  X,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building,
  Upload,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { RentalProperty, RentalApplication } from '../types/rental';
import { formatPrice } from '../utils/geo';

interface RentalApplicationModalProps {
  property: RentalProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (application: RentalApplication) => void;
}

export const RentalApplicationModal: React.FC<RentalApplicationModalProps> = ({
  property,
  isOpen,
  onClose,
  onSubmitApplication,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Fields
  const [applicantName, setApplicantName] = useState('Haritha Lalam');
  const [applicantEmail, setApplicantEmail] = useState('harithalalam33@gmail.com');
  const [applicantPhone, setApplicantPhone] = useState('(512) 843-0912');
  const [currentAddress, setCurrentAddress] = useState('2400 Rio Grande St, Austin, TX 78705');
  const [occupantsCount, setOccupantsCount] = useState(1);
  const [petsCount, setPetsCount] = useState(0);
  const [petDetails, setPetDetails] = useState('');
  const [moveInDate, setMoveInDate] = useState('2026-10-15');
  const [leaseTermMonths, setLeaseTermMonths] = useState(12);

  // Financial & Employment
  const [employmentStatus, setEmploymentStatus] = useState<RentalApplication['employmentStatus']>('Employed Full-Time');
  const [employerName, setEmployerName] = useState('Tech Systems Inc.');
  const [jobTitle, setJobTitle] = useState('Lead Software Engineer');
  const [annualIncome, setAnnualIncome] = useState(125000);
  const [creditScoreRange, setCreditScoreRange] = useState<RentalApplication['creditScoreRange']>('750+');

  // Emergency & References
  const [emergencyContactName, setEmergencyContactName] = useState('Sarah Lalam');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('(512) 555-0199');
  const [references, setReferences] = useState('Previous Landlord: David Miller - (512) 441-2091');
  const [additionalNotes, setAdditionalNotes] = useState('Non-smoker, clean rental history, looking for 12+ month quiet lease.');

  if (!isOpen || !property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newApp: RentalApplication = {
      id: `app-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyPrice: property.price,
      propertyAddress: property.address,
      applicantName,
      applicantEmail,
      applicantPhone,
      currentAddress,
      occupantsCount,
      petsCount,
      petDetails: petsCount > 0 ? petDetails : 'No pets',
      moveInDate,
      leaseTermMonths,
      employmentStatus,
      employerName,
      jobTitle,
      annualIncome,
      creditScoreRange,
      hasEmergencyContact: true,
      emergencyContactName,
      emergencyContactPhone,
      references,
      additionalNotes,
      status: 'submitted',
      submittedAt: 'Just now',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onSubmitApplication(newApp);
    }, 1200);
  };

  const handleDone = () => {
    setIsSuccess(false);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Online Rental Application</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  Instant Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct submission to {property.landlord.name} ({property.landlord.company || 'Property Owner'})
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

        {/* Property Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={property.images[0]?.url}
              alt={property.title}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{property.title}</h4>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{property.address}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-sm font-black text-slate-900">{formatPrice(property.price)}/mo</div>
            <div className="text-[10px] text-slate-500">Deposit: {formatPrice(property.deposit)}</div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Application Submitted Successfully!</h3>
            <p className="text-xs text-slate-600 mt-2 max-w-md leading-relaxed">
              Your comprehensive rental application has been routed directly to <span className="font-semibold text-slate-900">{property.landlord.name}</span>. A copy and confirmation message has been added to your landlord chat conversation.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md w-full space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Applicant:</span>
                <span className="font-bold text-slate-900">{applicantName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Target Move-in:</span>
                <span className="font-bold text-slate-900">{moveInDate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Annual Income:</span>
                <span className="font-bold text-emerald-600">${annualIncome.toLocaleString()} / year</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Review Estimate:</span>
                <span className="font-semibold text-blue-600">Within 24 hours</span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Back to Listings & Chat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Step Progress Tracker */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 1 ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  1
                </span>
                <span>Personal & Lease</span>
              </button>

              <span className="text-slate-300">———</span>

              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 2 ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  2
                </span>
                <span>Income & Employment</span>
              </button>

              <span className="text-slate-300">———</span>

              <button
                type="button"
                onClick={() => setStep(3)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 3 ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  3
                </span>
                <span>Verification & Review</span>
              </button>
            </div>

            {/* Step Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Step 1: Personal & Lease Terms */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Current Living Address
                      </label>
                      <input
                        type="text"
                        required
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Target Move-in Date
                      </label>
                      <input
                        type="date"
                        required
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Desired Lease Length
                      </label>
                      <select
                        value={leaseTermMonths}
                        onChange={(e) => setLeaseTermMonths(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months (Standard)</option>
                        <option value={15}>15 Months</option>
                        <option value={24}>24 Months</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Number of Occupants
                      </label>
                      <select
                        value={occupantsCount}
                        onChange={(e) => setOccupantsCount(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value={1}>1 Person</option>
                        <option value={2}>2 People</option>
                        <option value={3}>3 People</option>
                        <option value={4}>4+ People</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-800">Do you have pets?</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPetsCount(0)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            petsCount === 0 ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
                          }`}
                        >
                          No Pets
                        </button>
                        <button
                          type="button"
                          onClick={() => setPetsCount(1)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            petsCount > 0 ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
                          }`}
                        >
                          Yes, Have Pets
                        </button>
                      </div>
                    </div>

                    {petsCount > 0 && (
                      <input
                        type="text"
                        placeholder="Pet breed, weight, age (e.g. 1 Golden Retriever, 45 lbs, vaccinated)"
                        value={petDetails}
                        onChange={(e) => setPetDetails(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 mt-2"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Income & Employment */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Employment Status
                      </label>
                      <select
                        value={employmentStatus}
                        onChange={(e) => setEmploymentStatus(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Employed Full-Time">Employed Full-Time</option>
                        <option value="Employed Part-Time">Employed Part-Time</option>
                        <option value="Self-Employed">Self-Employed / Contractor</option>
                        <option value="Student">Student</option>
                        <option value="Other">Other / Retired</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Employer / Company Name
                      </label>
                      <input
                        type="text"
                        required
                        value={employerName}
                        onChange={(e) => setEmployerName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Gross Annual Income ($)
                      </label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <span className="text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          required
                          step={1000}
                          value={annualIncome}
                          onChange={(e) => setAnnualIncome(Number(e.target.value))}
                          className="w-full bg-transparent text-xs font-bold text-slate-900 ml-1 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Estimated Credit Score
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {(['750+', '700-749', '650-699', '600-649', 'Under 600'] as const).map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setCreditScoreRange(range)}
                          className={`py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                            creditScoreRange === range
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Affordability check banner */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-950">Income to Rent Ratio: </span>
                      <span className="font-semibold text-emerald-700">
                        {Math.round((annualIncome / 12 / property.price) * 10) / 10}x monthly rent
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                      Meets 3x Criteria
                    </span>
                  </div>
                </div>
              )}

              {/* Step 3: References & Review */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        required
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Rental References (Previous Landlord or Professional)
                    </label>
                    <textarea
                      rows={2}
                      value={references}
                      onChange={(e) => setReferences(e.target.value)}
                      placeholder="Name, relation, phone number"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Message / Notes to Landlord
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Brief note introducing yourself to the property owner..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Pre-submission Summary */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="font-bold text-slate-900">Application Summary:</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>Applicant: <span className="font-semibold text-slate-900">{applicantName}</span></div>
                      <div>Target Move-in: <span className="font-semibold text-slate-900">{moveInDate}</span></div>
                      <div>Employer: <span className="font-semibold text-slate-900">{employerName}</span></div>
                      <div>Annual Income: <span className="font-semibold text-slate-900">${annualIncome.toLocaleString()}</span></div>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      By submitting, you certify information is accurate and authorize {property.landlord.name} to perform standard tenant pre-qualification checks.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Previous Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev + 1) as any)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending Application...' : 'Submit Application Now'}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
