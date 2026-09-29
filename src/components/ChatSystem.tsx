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
  Workflow,
  Settings2,
  ExternalLink,
  AlertCircle,
  Zap,
  Info,
} from 'lucide-react';
import { ChatConversation, ChatMessage, RentalProperty } from '../types/rental';
import { formatPrice } from '../utils/geo';
import {
  getN8nConfig,
  saveN8nConfig,
  sendN8nChatMessage,
  testN8nConnection,
  DEFAULT_N8N_WEBHOOK_URL,
  DEFAULT_N8N_TEST_WEBHOOK_URL,
  N8nConfig,
} from '../services/n8nChatService';

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  activePropertyId: string | null;
  onSelectConversation: (propertyId: string) => void;
  onSendMessage: (
    propertyId: string,
    text: string,
    type?: ChatMessage['type'],
    tourDetails?: any,
    meta?: {
      senderRole?: 'tenant' | 'landlord';
      senderName?: string;
      source?: 'n8n' | 'simulated' | 'user';
      n8nStatus?: 'success' | 'inactive' | 'error';
    }
  ) => void;
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

  // n8n Webhook Configuration & Status
  const [n8nConfig, setN8nConfig] = useState<N8nConfig>(getN8nConfig);
  const [showN8nSettings, setShowN8nSettings] = useState(false);
  const [customWebhookInput, setCustomWebhookInput] = useState(n8nConfig.webhookUrl);
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [n8nTestStatus, setN8nTestStatus] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    isWorkflowInactive?: boolean;
  } | null>(null);

  const activeConversation =
    conversations.find((c) => c.propertyId === activePropertyId) || conversations[0];
  const activeProperty =
    properties.find((p) => p.id === activeConversation?.propertyId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  if (!isOpen) return null;

  const handleUpdateN8nConfig = (updated: Partial<N8nConfig>) => {
    const next = { ...n8nConfig, ...updated };
    setN8nConfig(next);
    saveN8nConfig(next);
  };

  const handleTestConnection = async () => {
    setIsTestingN8n(true);
    setN8nTestStatus(null);
    try {
      const res = await testN8nConnection(customWebhookInput);
      setN8nTestStatus({
        tested: true,
        ok: res.ok,
        message: res.message,
        isWorkflowInactive: res.isWorkflowInactive,
      });
    } catch (e: any) {
      setN8nTestStatus({
        tested: true,
        ok: false,
        message: e.message || 'Connection failed',
      });
    } finally {
      setIsTestingN8n(false);
    }
  };

  const getLocalFallbackReply = (text: string, prop: RentalProperty): string => {
    const lower = text.toLowerCase();
    if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) {
      return `Yes! ${prop.petPolicy.type}. The pet deposit is $${prop.petPolicy.deposit || 250}. Let me know if you would like to tour with your pet!`;
    }
    if (lower.includes('park') || lower.includes('garage') || lower.includes('car')) {
      return `Regarding parking: ${prop.parking}. It's very convenient and secure!`;
    }
    if (lower.includes('util') || lower.includes('water') || lower.includes('electric') || lower.includes('bill')) {
      return `Utilities included in rent: ${prop.utilitiesIncluded.join(', ') || 'Tenants set up their own electricity and internet'}. Let me know if you want average monthly estimates!`;
    }
    if (lower.includes('tour') || lower.includes('see') || lower.includes('visit') || lower.includes('walkthrough')) {
      return `I would love to give you a tour! I have open slots available this week. You can click 'Schedule Tour' right here in our chat to lock in a time that works for you.`;
    }
    if (lower.includes('deposit') || lower.includes('lease') || lower.includes('rent') || lower.includes('price')) {
      return `The monthly rent is $${prop.price.toLocaleString()} with a refundable security deposit of $${prop.deposit.toLocaleString()}. The lease term is ${prop.leaseTerms}.`;
    }
    return `Thanks for reaching out! I'd be delighted to assist you with ${prop.title}. Are you looking for an immediate move-in or a later start date?`;
  };

  const executeLandlordReply = async (messageText: string) => {
    if (!activeProperty || !activeConversation) return;

    setIsTyping(true);

    if (n8nConfig.enabled) {
      try {
        const response = await sendN8nChatMessage({
          message: messageText,
          property: activeProperty,
          sessionId: `session-${activeConversation.propertyId}`,
          webhookUrl: customWebhookInput,
        });

        setIsTyping(false);

        if (response.success) {
          onSendMessage(
            activeConversation.propertyId,
            response.reply,
            'text',
            undefined,
            {
              senderRole: 'landlord',
              senderName: activeProperty.landlord.name,
              source: 'n8n',
              n8nStatus: 'success',
            }
          );
        } else if (response.isWorkflowInactive) {
          // n8n reached but workflow inactive on canvas
          const fallback = getLocalFallbackReply(messageText, activeProperty);
          const fullMessage = `${response.reply}\n\n[Auto-Reply from ${activeProperty.landlord.name}]: ${fallback}`;
          onSendMessage(
            activeConversation.propertyId,
            fullMessage,
            'text',
            undefined,
            {
              senderRole: 'landlord',
              senderName: `${activeProperty.landlord.name} (n8n Fallback)`,
              source: 'n8n',
              n8nStatus: 'inactive',
            }
          );
        } else {
          // General error with fallback
          const fallback = getLocalFallbackReply(messageText, activeProperty);
          onSendMessage(
            activeConversation.propertyId,
            `${fallback}\n\n(n8n Agent Note: ${response.reply})`,
            'text',
            undefined,
            {
              senderRole: 'landlord',
              senderName: activeProperty.landlord.name,
              source: 'n8n',
              n8nStatus: 'error',
            }
          );
        }
      } catch (err: any) {
        setIsTyping(false);
        const fallback = getLocalFallbackReply(messageText, activeProperty);
        onSendMessage(
          activeConversation.propertyId,
          fallback,
          'text',
          undefined,
          {
            senderRole: 'landlord',
            senderName: activeProperty.landlord.name,
            source: 'simulated',
          }
        );
      }
    } else {
      // Local simulated landlord
      setTimeout(() => {
        setIsTyping(false);
        const reply = getLocalFallbackReply(messageText, activeProperty);
        onSendMessage(
          activeConversation.propertyId,
          reply,
          'text',
          undefined,
          {
            senderRole: 'landlord',
            senderName: activeProperty.landlord.name,
            source: 'simulated',
          }
        );
      }, 1200);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const messageText = inputText.trim();
    setInputText('');

    // Send the tenant's message
    onSendMessage(
      activeConversation.propertyId,
      messageText,
      'text',
      undefined,
      {
        senderRole: isLandlordMode ? 'landlord' : 'tenant',
        senderName: isLandlordMode ? activeProperty?.landlord.name || 'Landlord' : 'You',
        source: 'user',
      }
    );

    // If tenant sent message and landlord mode is off, trigger n8n / landlord response
    if (!isLandlordMode && activeProperty) {
      executeLandlordReply(messageText);
    }
  };

  const handleSendQuickPrompt = (promptText: string) => {
    if (!activeConversation) return;
    onSendMessage(
      activeConversation.propertyId,
      promptText,
      'text',
      undefined,
      {
        senderRole: 'tenant',
        senderName: 'You',
        source: 'user',
      }
    );

    if (!isLandlordMode && activeProperty) {
      executeLandlordReply(promptText);
    }
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
      },
      {
        senderRole: 'tenant',
        senderName: 'You',
        source: 'user',
      }
    );
    setShowScheduleInChat(false);

    if (!isLandlordMode && activeProperty) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onSendMessage(
          activeConversation.propertyId,
          `Awesome! I have put you down for ${selectedTourDate} at ${selectedTourTime} (${tourType}). I will text you gate/access directions beforehand. See you then!`,
          'text',
          undefined,
          {
            senderRole: 'landlord',
            senderName: activeProperty.landlord.name,
            source: 'simulated',
          }
        );
      }, 1400);
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
      'application_request',
      undefined,
      {
        senderRole: 'tenant',
        senderName: 'You',
        source: 'user',
      }
    );

    if (!isLandlordMode && activeProperty) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onSendMessage(
          activeConversation.propertyId,
          `Thank you for applying! I have received your pre-qualification request. Our standard review takes less than 24 hours. Feel free to message me with any questions in the meantime!`,
          'text',
          undefined,
          {
            senderRole: 'landlord',
            senderName: activeProperty.landlord.name,
            source: 'simulated',
          }
        );
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      {/* Sliding Drawer Container */}
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Top App Header with Landlord/Tenant Role Switcher & n8n Indicator */}
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* n8n Status Pill */}
            <button
              type="button"
              onClick={() => setShowN8nSettings(!showN8nSettings)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                n8nConfig.enabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Configure n8n Webhook Chatbot"
            >
              <Workflow className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {n8nConfig.enabled ? 'n8n AI Active' : 'n8n Disabled'}
              </span>
              <Settings2 className="w-3 h-3 text-slate-400" />
            </button>

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

        {/* n8n Webhook Management Panel (Collapsible Drawer) */}
        {showN8nSettings && (
          <div className="bg-slate-900 border-b border-slate-800 p-4 text-white text-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-slate-100 text-sm">n8n AI Agent Integration</h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Webhook Connected
                </span>
              </div>
              <button
                onClick={() => setShowN8nSettings(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Webhook URL Input */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span>n8n Webhook URL</span>
                  <a
                    href="https://harithalalam.app.n8n.cloud"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px]"
                  >
                    <span>Open n8n Editor</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customWebhookInput}
                    onChange={(e) => {
                      setCustomWebhookInput(e.target.value);
                      handleUpdateN8nConfig({ webhookUrl: e.target.value });
                    }}
                    placeholder="https://harithalalam.app.n8n.cloud/webhook/..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-hidden focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingN8n}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingN8n ? 'animate-spin' : ''}`} />
                    <span>{isTestingN8n ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Test Result Feedback Box */}
              {n8nTestStatus && (
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                    n8nTestStatus.ok
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                      : n8nTestStatus.isWorkflowInactive
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                      : 'bg-red-950/60 border-red-500/50 text-red-200'
                  }`}
                >
                  {n8nTestStatus.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : n8nTestStatus.isWorkflowInactive ? (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{n8nTestStatus.message}</p>
                    {n8nTestStatus.isWorkflowInactive && (
                      <p className="text-[11px] text-amber-300/80 mt-1">
                        👉 <strong>How to fix:</strong> In your n8n workflow canvas at{' '}
                        <code className="text-amber-200">harithalalam.app.n8n.cloud</code>, look at the top-right toggle switch and switch it to <strong>"Active"</strong>.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Toggles & Options */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-4">
                  {/* Enable / Disable n8n */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={n8nConfig.enabled}
                      onChange={(e) => handleUpdateN8nConfig({ enabled: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4 bg-slate-800"
                    />
                    <span className="text-xs text-slate-200 font-medium">Use n8n for Landlord Replies</span>
                  </label>

                  {/* Test Mode URL Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={n8nConfig.isTestMode}
                      onChange={(e) => handleUpdateN8nConfig({ isTestMode: e.target.checked })}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 h-4 w-4 bg-slate-800"
                    />
                    <span className="text-xs text-slate-300">
                      Test Webhook Mode (<code className="text-blue-300">/webhook-test/</code>)
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCustomWebhookInput(DEFAULT_N8N_WEBHOOK_URL);
                    handleUpdateN8nConfig({
                      webhookUrl: DEFAULT_N8N_WEBHOOK_URL,
                      isTestMode: false,
                    });
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  Reset Default URL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Body: Conversation selector (left pill/tabs) & Chat thread (right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List / Inquiries */}
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {activeProperty.landlord.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                        {activeProperty.landlord.role}
                      </span>
                      {n8nConfig.enabled && !isLandlordMode && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300 flex items-center gap-0.5">
                          <Workflow className="w-2.5 h-2.5 text-amber-600" />
                          <span>n8n AI</span>
                        </span>
                      )}
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
                      {msg.source === 'n8n' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Workflow className="w-2.5 h-2.5 text-amber-600" />
                          <span>n8n</span>
                        </span>
                      )}
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
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs shadow-2xs leading-relaxed whitespace-pre-wrap ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : msg.source === 'n8n' && msg.n8nStatus === 'inactive'
                            ? 'bg-amber-50 text-slate-800 border border-amber-300 rounded-bl-xs'
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
                <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-2xl max-w-xs shadow-2xs">
                  {n8nConfig.enabled ? (
                    <div className="flex items-center gap-1.5">
                      <Workflow className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span className="text-[11px] text-slate-600 font-medium">
                        {activeProperty?.landlord.name || 'Landlord'} (via n8n) is thinking...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[10px] text-slate-400 font-medium ml-1">typing</span>
                    </div>
                  )}
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
                    : n8nConfig.enabled
                    ? `Ask ${activeProperty?.landlord.name || 'Landlord'} (n8n AI agent powered)...`
                    : `Message ${activeProperty?.landlord.name || 'Landlord'} directly...`
                }
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
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
