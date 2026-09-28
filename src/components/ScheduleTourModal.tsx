import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Phone,
  Mail,
  CheckCircle2,
  MapPin,
  Building,
} from 'lucide-react';
import { RentalProperty } from '../types/rental';
import { formatPrice } from '../utils/geo';

interface ScheduleTourModalProps {
  property: RentalProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmTour: (
    property: RentalProperty,
    tourData: { date: string; time: string; type: 'In-Person' | 'Live Video Tour'; contactName: string }
  ) => void;
}

export const ScheduleTourModal: React.FC<ScheduleTourModalProps> = ({
  property,
  isOpen,
  onClose,
  onConfirmTour,
}) => {
  const [tourType, setTourType] = useState<'In-Person' | 'Live Video Tour'>('In-Person');
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('2:00 PM');
  const [name, setName] = useState('Haritha Lalam');
  const [phone, setPhone] = useState('(512) 843-0912');
  const [email, setEmail] = useState('harithalalam33@gmail.com');
  const [notes, setNotes] = useState('Looking forward to viewing the property!');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !property) return null;

  const dateOptions = ['Today', 'Tomorrow', 'This Friday', 'This Saturday', 'Next Monday'];
  const timeSlots = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
    setTimeout(() => {
      onConfirmTour(property, {
        date: selectedDate,
        time: selectedTime,
        type: tourType,
        contactName: name,
      });
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule a Rental Tour</h3>
              <p className="text-xs text-slate-500">Fast confirmation with landlord</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Brief */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <img
            src={property.images[0]?.url}
            alt={property.title}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{property.title}</h4>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{property.address}</span>
            </p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {formatPrice(property.price)}
              <span className="text-[10px] text-slate-500 font-normal"> /month</span>
            </p>
          </div>
        </div>

        {confirmed ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Tour Booked Successfully!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Your tour for <span className="font-semibold text-slate-800">{selectedDate} at {selectedTime}</span> has been confirmed and logged in your landlord chat.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tour Type Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Tour Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTourType('In-Person')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    tourType === 'In-Person'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>In-Person Walkthrough</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTourType('Live Video Tour')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    tourType === 'Live Video Tour'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Live Video Tour</span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Select Day
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {dateOptions.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedDate === date
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Select Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Confirm Tour Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
