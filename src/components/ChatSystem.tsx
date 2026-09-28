import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Calendar,
  FileText,
  Clock,
  CheckCheck,
  Check,
  Phone,
  ShieldCheck,
  Building,
  Sparkles,
  Paperclip,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
  Dog,
  Car,
  Lightbulb,
} from 'lucide-react';
import { ChatConversation, ChatMessage, RentalProperty } from '../types/rental';
import { formatPrice } from '../utils/geo';

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  activePropertyId: string | null;
  onSelectConversation: (propertyId: string) => void;
  onSendMessage: (propertyId: string, text: string, type?: ChatMessage['type'], tourDetails?: any) => void;
  properties: RentalProperty[];
  onViewPropertyDetails: (property: RentalProperty) => void;
  onOpenApplicationModal?: (property: RentalProperty) => void;
  isLandlordMode: boolean;
  onToggleLandlordMode: (enabled: boolean) => void;
  onUpdateAvailabilityStatus?: (propertyId: string, status: any) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  isOpen,
  onClose,
  conversations,
  activePropertyId,
  onSelectConversation,
  onSendMessage,
  properties,
  onViewPropertyDetails,
  onOpenApplicationModal,
  isLandlordMode,
  onToggleLandlordMode,
  onUpdateAvailabilityStatus,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScheduleInChat, setShowScheduleInChat] = useState(false);
  const [selectedTourDate, setSelectedTourDate] = useState('Tomorrow');
  const [selectedTourTime, setSelectedTourTime] = useState('11:00 AM');
  const [tourType, setTourType] = useState<'In-Person' | 'Live Video Tour'>('In-Person');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation =
    conversations.find((c) => c.propertyId === activePropertyId) || conversations[0];
  const activeProperty =
    properties.find((p) => p.id === activeConversation?.propertyId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const messageText = inputText.trim();
    setInputText('');
    onSendMessage(activeConversation.propertyId, messageText);

    // If tenant sent message and landlord mode is off, simulate realistic smart landlord reply
    if (!isLandlordMode && activeProperty) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let reply = "Thanks for reaching out! I'd be delighted to assist you with any questions about the property.";

        const lower = messageText.toLowerCase();
        if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) {
          reply = `Yes! ${activeProperty.petPolicy.type}. The pet deposit is $${activeProperty.petPolicy.deposit || 250}. Let me know if you would like to tour with your pet!`;
        } else if (lower.includes('park') || lower.includes('garage') || lower.includes('car')) {
          reply = `Regarding parking: ${activeProperty.parking}. It's very convenient and secure!`;
        } else if (lower.includes('util') || lower.includes('water') || lower.includes('electric') || lower.includes('bill')) {
          reply = `Utilities included in rent: ${activeProperty.utilitiesIncluded.join(', ') || 'Tenants set up their own electricity and internet'}. Let me know if you want average monthly estimates!`;
        } else if (lower.includes('tour') || lower.includes('see') || lower.includes('visit') || lower.includes('walkthrough')) {
          reply = `I would love to give you a tour! I have open slots available this week. You can click 'Schedule Tour' right here in our chat to lock in a time that works for you.`;
        } else if (lower.includes('deposit') || lower.includes('lease') || lower.includes('rent')) {
          reply = `The monthly rent is $${activeProperty.price.toLocaleString()} with a refundable security deposit of $${activeProperty.deposit.toLocaleString()}. The lease term is ${activeProperty.leaseTerms}.`;
        }

        onSendMessage(activeConversation.propertyId, reply);
      }, 1400);
    }
  };

  const handleSendQuickPrompt = (promptText: string) => {
    setInputText(promptText);
    setTimeout(() => {
      onSendMessage(activeConversation.propertyId, promptText);

      // Automated reply
      if (!isLandlordMode && activeProperty) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          let reply = "Got your question! Let me provide the exact details.";
          const lower = promptText.toLowerCase();
          if (lower.includes('pet')) {
            reply = `Regarding pets: ${activeProperty.petPolicy.type}. We're very pet-friendly!`;
          } else if (lower.includes('park')) {
            reply = `Parking details: ${activeProperty.parking}.`;
          } else if (lower.includes('util')) {
            reply = `Utilities included: ${activeProperty.utilitiesIncluded.join(', ')}.`;
          }
          onSendMessage(activeConversation.propertyId, reply);
        }, 1200);
      }
    }, 100);
  };

  const handleConfirmTourInChat = () => {
    if (!activeConversation) return;
    onSendMessage(
      activeConversation.propertyId,
      `I would like to schedule a ${tourType} for ${selectedTourDate} at ${selectedTourTime}.`,
      'tour_confirmed',
      {
        date: selectedTourDate,
        time: selectedTourTime,
        tourType: tourType,
        status: 'confirmed',
      }
    );
    setShowScheduleInChat(false);

    // Landlord acknowledgment
    if (!isLandlordMode) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onSendMessage(
          activeConversation.propertyId,
          `Awesome! I have put you down for ${selectedTourDate} at ${selectedTourTime} (${tourType}). I will text you gate/access directions beforehand. See you then!`
        );
      }, 1500);
    }
  };

  const handleSendApplicationRequest = () => {
    if (!activeConversation) return;
    if (activeProperty && onOpenApplicationModal) {
      onOpenApplicationModal(activeProperty);
      return;
    }
    onSendMessage(
      activeConversation.propertyId,
      'I am interested in submitting a rental application for this property. Please review my profile.',
      'application_request'
    );

    if (!isLandlordMode) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onSendMessage(
          activeConversation.propertyId,
          `Thank you for applying! I have received your pre-qualification request. Our standard review takes less than 24 hours. Feel free to message me with any questions in the meantime!`
        );
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      {/* Sliding Drawer Container */}
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Top App Header with Landlord/Tenant Role Switcher */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Landlord Direct Chat</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-medium">Real-Time</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Direct messaging with property owners & leasing agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Perspective Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => onToggleLandlordMode(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  !isLandlordMode ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tenant View
              </button>
              <button
                type="button"
                onClick={() => onToggleLandlordMode(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  isLandlordMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Landlord View
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Conversation selector (left pill/tabs) & Chat thread (right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List / Inquiries (collapsible or tabs on narrow screens) */}
          <div className="w-48 sm:w-56 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              Active Inquiries ({conversations.length})
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60">
              {conversations.map((conv) => {
                const isActive = conv.propertyId === activeConversation?.propertyId;
                return (
                  <button
                    key={conv.propertyId}
                    onClick={() => onSelectConversation(conv.propertyId)}
                    className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 ${
                      isActive ? 'bg-white border-l-4 border-l-blue-600 shadow-2xs' : 'hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={conv.propertyImage}
                      alt={conv.propertyTitle}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.landlord.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{conv.lastMessageTimestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-medium">
                        {conv.propertyTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Landlord Mode Banner if activated */}
            {isLandlordMode && activeProperty && (
              <div className="p-3 bg-emerald-50 border-t border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Landlord Quick Status</span>
                </div>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => onUpdateAvailabilityStatus?.(activeProperty.id, 'available_now')}
                    className="w-full text-left px-2 py-1 bg-white hover:bg-emerald-100 rounded text-[10px] font-semibold border border-emerald-300"
                  >
                    Set Available Now
                  </button>
                  <button
                    onClick={() => onUpdateAvailabilityStatus?.(activeProperty.id, 'pending_application')}
                    className="w-full text-left px-2 py-1 bg-white hover:bg-amber-100 rounded text-[10px] font-semibold border border-amber-300"
                  >
                    Set Pending App
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Chat Thread */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Property Snippet Bar */}
            {activeProperty && (
              <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={activeProperty.landlord.avatar}
                      alt={activeProperty.landlord.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-2xs"
                    />
                    {activeProperty.landlord.verified && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white rounded-full p-0.5 ring-1 ring-white">
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {activeProperty.landlord.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                        {activeProperty.landlord.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <span className="font-semibold text-slate-800">{formatPrice(activeProperty.price)}/mo</span>
                      <span>•</span>
                      <span className="truncate">{activeProperty.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onViewPropertyDetails(activeProperty)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    View Listing
                  </button>
                  <button
                    onClick={() => setShowScheduleInChat(true)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Schedule Tour</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-Chat Tour Scheduler Drawer Card */}
            {showScheduleInChat && (
              <div className="p-4 bg-blue-50/90 border-b border-blue-200 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <span>Select Tour Slot for {activeProperty?.title}</span>
                  </div>
                  <button
                    onClick={() => setShowScheduleInChat(false)}
                    className="text-blue-500 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {['Today 4:00 PM', 'Tomorrow 11:00 AM', 'Tomorrow 2:00 PM', 'Friday 3:30 PM', 'Saturday 1:00 PM'].map(
                    (slot) => {
                      const isSelected = `${selectedTourDate} ${selectedTourTime}` === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            const [d, ...t] = slot.split(' ');
                            setSelectedTourDate(d);
                            setSelectedTourTime(t.join(' '));
                          }}
                          className={`p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-blue-200/60">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTourType('In-Person')}
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        tourType === 'In-Person' ? 'bg-blue-600 text-white' : 'bg-white text-blue-800'
                      }`}
                    >
                      In-Person Tour
                    </button>
                    <button
                      type="button"
                      onClick={() => setTourType('Live Video Tour')}
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        tourType === 'Live Video Tour' ? 'bg-blue-600 text-white' : 'bg-white text-blue-800'
                      }`}
                    >
                      Video Walkthrough
                    </button>
                  </div>

                  <button
                    onClick={handleConfirmTourInChat}
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Confirm & Send Slot
                  </button>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
              {activeConversation?.messages.map((msg) => {
                const isMe = msg.senderRole === (isLandlordMode ? 'landlord' : 'tenant');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    {/* Standard Text Message or Rich Tour Card */}
                    {msg.type === 'tour_confirmed' && msg.tourDetails ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-sm shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Tour Confirmed!</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium">
                          {msg.tourDetails.tourType} scheduled for{' '}
                          <span className="font-bold">{msg.tourDetails.date}</span> at{' '}
                          <span className="font-bold">{msg.tourDetails.time}</span>.
                        </p>
                        <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-700">
                          <span>Status: Confirmed</span>
                          <span className="font-semibold underline cursor-pointer">
                            Add to Calendar
                          </span>
                        </div>
                      </div>
                    ) : msg.type === 'application_request' ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 max-w-sm shadow-sm">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>Rental Application Pre-Qualification</span>
                        </div>
                        <p className="text-xs text-blue-950">
                          {msg.text}
                        </p>
                        <div className="mt-2.5 p-2 bg-white rounded-lg border border-blue-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">Credit & Income Verified</span>
                          <span className="text-emerald-600 font-bold">Ready for Review</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs shadow-2xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-2xl w-24">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-slate-400 font-medium ml-1">typing</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggested Prompts */}
            {!isLandlordMode && (
              <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setShowScheduleInChat(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-[11px] font-semibold shrink-0 transition-colors"
                >
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span>Schedule Tour</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendApplicationRequest}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full text-[11px] font-semibold shrink-0 transition-colors"
                >
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span>Send Application</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickPrompt('Are utilities included in rent?')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-medium shrink-0 transition-colors"
                >
                  <Lightbulb className="w-3 h-3 text-slate-500" />
                  <span>Utilities included?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickPrompt('What is your pet policy and pet deposit?')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-medium shrink-0 transition-colors"
                >
                  <Dog className="w-3 h-3 text-slate-500" />
                  <span>Pet policy?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickPrompt('Is dedicated parking or a garage included?')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[11px] font-medium shrink-0 transition-colors"
                >
                  <Car className="w-3 h-3 text-slate-500" />
                  <span>Parking details?</span>
                </button>
              </div>
            )}

            {/* Input Bar Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isLandlordMode
                    ? `Reply to tenant as ${activeProperty?.landlord.name || 'Landlord'}...`
                    : `Message ${activeProperty?.landlord.name || 'Landlord'} directly...`
                }
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
