/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RentalProperty,
  SearchFilters,
  ChatConversation,
  ActivityNotification,
  AvailabilityStatus,
  RentalApplication,
} from './types/rental';
import {
  INITIAL_RENTAL_PROPERTIES,
  INITIAL_CONVERSATIONS,
  POPULAR_NEIGHBORHOODS,
} from './data/mockRentals';
import { calculateDistanceMiles } from './utils/geo';
import { Navbar } from './components/Navbar';
import { LiveActivityTicker } from './components/LiveActivityTicker';
import { SearchBar } from './components/SearchBar';
import { FilterModal } from './components/FilterBar';
import { RentalList } from './components/RentalList';
import { RentalMap } from './components/RentalMap';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { ChatSystem } from './components/ChatSystem';
import { ScheduleTourModal } from './components/ScheduleTourModal';
import { LandlordPortalModal } from './components/LandlordPortalModal';
import { CompareModal } from './components/CompareModal';
import { RentalApplicationModal } from './components/RentalApplicationModal';
import { MyApplicationsModal } from './components/MyApplicationsModal';

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  neighborhood: 'All',
  maxDistanceMiles: 5,
  minPrice: 1000,
  maxPrice: 6000,
  bedrooms: 'all',
  bathrooms: 'all',
  propertyTypes: [],
  availability: 'all',
  amenities: [],
  petFriendlyOnly: false,
  inUnitLaundryOnly: false,
  parkingIncludedOnly: false,
  verifiedLandlordOnly: false,
  sortBy: 'recommended',
};

const INITIAL_NOTIFICATIONS: ActivityNotification[] = [
  {
    id: 'n-1',
    propertyId: 'prop-1',
    propertyTitle: 'The Modernist Craftsman & Garden Studio',
    type: 'tour_booked',
    message: 'Tour slot booked for Today 4:00 PM at 1408 Willow Creek St',
    timestamp: '2 mins ago',
  },
  {
    id: 'n-2',
    propertyId: 'prop-3',
    propertyTitle: 'The Industrial Loft at Foundry Yards',
    type: 'application_received',
    message: 'New prospective tenant pre-qualification received for East 5th St',
    timestamp: '7 mins ago',
  },
  {
    id: 'n-3',
    propertyId: 'prop-4',
    propertyTitle: 'Zilker Park Contemporary Townhome',
    type: 'price_drop',
    message: 'Price dropped by $210/mo on Zilker Park Contemporary Townhome',
    timestamp: '14 mins ago',
  },
  {
    id: 'n-4',
    propertyId: 'prop-5',
    propertyTitle: 'The Botanist Flat at Mueller Central',
    type: 'status_change',
    message: 'Immediate move-in confirmed for Mueller Central 1BR flat',
    timestamp: '25 mins ago',
  },
];

export default function App() {
  // Core Data State
  const [properties, setProperties] = useState<RentalProperty[]>(INITIAL_RENTAL_PROPERTIES);
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [notifications, setNotifications] = useState<ActivityNotification[]>(INITIAL_NOTIFICATIONS);

  // Search & Filter State
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number }>({
    lat: 30.2672,
    lng: -97.7431, // Austin downtown/central
  });
  const [isLocating, setIsLocating] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // UI Selections & Modals
  const [selectedProperty, setSelectedProperty] = useState<RentalProperty | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [detailProperty, setDetailProperty] = useState<RentalProperty | null>(null);
  const [tourBookingProperty, setTourBookingProperty] = useState<RentalProperty | null>(null);
  const [applyingProperty, setApplyingProperty] = useState<RentalProperty | null>(null);

  // Modal Visibility
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatPropertyId, setActiveChatPropertyId] = useState<string | null>(null);
  const [isLandlordPortalOpen, setIsLandlordPortalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isMyApplicationsModalOpen, setIsMyApplicationsModalOpen] = useState(false);
  const [isLandlordMode, setIsLandlordMode] = useState(false);

  // Applications Store
  const [applications, setApplications] = useState<RentalApplication[]>(() => {
    try {
      const saved = localStorage.getItem('haven_rental_applications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'app-sample-1',
        propertyId: 'prop-1',
        propertyTitle: 'The Modernist Craftsman & Garden Studio',
        propertyPrice: 3450,
        propertyAddress: '1408 Willow Creek St',
        applicantName: 'Haritha Lalam',
        applicantEmail: 'harithalalam33@gmail.com',
        applicantPhone: '(512) 843-0912',
        currentAddress: '2400 Rio Grande St, Austin, TX 78705',
        occupantsCount: 1,
        petsCount: 0,
        petDetails: 'No pets',
        moveInDate: '2026-10-15',
        leaseTermMonths: 12,
        employmentStatus: 'Employed Full-Time',
        employerName: 'Tech Systems Inc.',
        jobTitle: 'Lead Software Engineer',
        annualIncome: 125000,
        creditScoreRange: '750+',
        hasEmergencyContact: true,
        references: 'David Miller - (512) 441-2091',
        status: 'under_review',
        submittedAt: 'Today 9:15 AM',
      },
    ];
  });

  // Persist applications
  useEffect(() => {
    try {
      localStorage.setItem('haven_rental_applications', JSON.stringify(applications));
    } catch (e) {
      console.warn(e);
    }
  }, [applications]);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('haven_favorites');
      return saved ? JSON.parse(saved) : ['prop-1', 'prop-4'];
    } catch {
      return ['prop-1', 'prop-4'];
    }
  });

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('haven_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites to localStorage', e);
    }
  }, [favorites]);

  // Real-Time Simulation: Live viewer counts oscillation & automated marketplace updates
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setProperties((prev) =>
        prev.map((p) => {
          // randomly shift active viewers by +1 or -1 occasionally
          if (Math.random() > 0.6) {
            const delta = Math.random() > 0.5 ? 1 : -1;
            const newCount = Math.max(1, Math.min(14, p.activeViewersCount + delta));
            return { ...p, activeViewersCount: newCount };
          }
          return p;
        })
      );
    }, 7000);

    return () => clearInterval(viewerInterval);
  }, []);

  // Compute distance for each property relative to current search center
  const propertiesWithDistance = useMemo(() => {
    return properties.map((prop) => {
      const distance = calculateDistanceMiles(
        searchCenter.lat,
        searchCenter.lng,
        prop.lat,
        prop.lng
      );
      return { ...prop, distanceMiles: distance };
    });
  }, [properties, searchCenter]);

  // Filter & Sort Properties
  const filteredProperties = useMemo(() => {
    return propertiesWithDistance
      .filter((prop) => {
        // Query search
        if (filters.query.trim()) {
          const q = filters.query.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchAddr = prop.address.toLowerCase().includes(q);
          const matchHood = prop.neighborhood.toLowerCase().includes(q);
          const matchAmenity = prop.amenities.some((a) => a.toLowerCase().includes(q));
          const matchType = prop.propertyType.toLowerCase().includes(q);
          if (!matchTitle && !matchAddr && !matchHood && !matchAmenity && !matchType) {
            return false;
          }
        }

        // Neighborhood filter
        if (filters.neighborhood !== 'All') {
          if (!prop.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())) {
            return false;
          }
        }

        // Distance Radius filter
        if (prop.distanceMiles !== undefined && prop.distanceMiles > filters.maxDistanceMiles) {
          return false;
        }

        // Price filter
        if (prop.price < filters.minPrice || prop.price > filters.maxPrice) {
          return false;
        }

        // Bedrooms filter
        if (filters.bedrooms !== 'all') {
          if (filters.bedrooms === 4) {
            if (prop.bedrooms < 4) return false;
          } else {
            if (prop.bedrooms !== filters.bedrooms) return false;
          }
        }

        // Bathrooms filter
        if (filters.bathrooms !== 'all') {
          if (prop.bathrooms < filters.bathrooms) return false;
        }

        // Property types
        if (filters.propertyTypes.length > 0) {
          if (!filters.propertyTypes.includes(prop.propertyType)) {
            return false;
          }
        }

        // Real-Time Availability filter
        if (filters.availability === 'available_now') {
          if (prop.availabilityStatus !== 'available_now') return false;
        } else if (filters.availability === 'available_soon') {
          if (
            prop.availabilityStatus !== 'available_now' &&
            prop.availabilityStatus !== 'available_soon'
          ) {
            return false;
          }
        }

        // Pet Friendly Only
        if (filters.petFriendlyOnly && !prop.petPolicy.allowed) {
          return false;
        }

        // In-Unit Laundry Only
        if (filters.inUnitLaundryOnly && !prop.amenities.some((a) => a.includes('Washer/Dryer'))) {
          return false;
        }

        // Parking Included Only
        if (filters.parkingIncludedOnly && !prop.amenities.some((a) => a.includes('Parking') || a.includes('Garage'))) {
          return false;
        }

        // Verified Landlord Only
        if (filters.verifiedLandlordOnly && !prop.landlord.verified) {
          return false;
        }

        // Amenities filter
        if (filters.amenities.length > 0) {
          const hasAllSelectedAmenities = filters.amenities.every((req) =>
            prop.amenities.some((a) => a.toLowerCase().includes(req.toLowerCase()))
          );
          if (!hasAllSelectedAmenities) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'distance') {
          return (a.distanceMiles || 0) - (b.distanceMiles || 0);
        }
        if (filters.sortBy === 'price_asc') {
          return a.price - b.price;
        }
        if (filters.sortBy === 'price_desc') {
          return b.price - a.price;
        }
        if (filters.sortBy === 'newest') {
          return b.yearBuilt - a.yearBuilt;
        }
        // Recommended: Featured first, then lowest distance
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.distanceMiles || 0) - (b.distanceMiles || 0);
      });
  }, [propertiesWithDistance, filters]);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.neighborhood !== 'All') count++;
    if (filters.minPrice > 1000 || filters.maxPrice < 6000) count++;
    if (filters.bedrooms !== 'all') count++;
    if (filters.bathrooms !== 'all') count++;
    if (filters.propertyTypes.length > 0) count += filters.propertyTypes.length;
    if (filters.availability !== 'all') count++;
    if (filters.petFriendlyOnly) count++;
    if (filters.verifiedLandlordOnly) count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    return count;
  }, [filters]);

  // Handlers
  const handleUpdateFilters = useCallback((partial: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSelectNeighborhoodCenter = useCallback(
    (neighborhood: { lat: number; lng: number; name: string }) => {
      setSearchCenter({ lat: neighborhood.lat, lng: neighborhood.lng });
      setFilters((prev) => ({
        ...prev,
        neighborhood: neighborhood.name === 'All Neighborhoods' ? 'All' : neighborhood.name,
      }));
    },
    []
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setSearchCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setFilters((prev) => ({ ...prev, neighborhood: 'All' }));
        },
        (error) => {
          setIsLocating(false);
          console.warn('Geolocation failed or permission denied:', error);
          alert('Could not detect your GPS location. Centered on Austin downtown.');
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const handleOpenChat = useCallback((property: RentalProperty) => {
    setActiveChatPropertyId(property.id);

    // Ensure conversation exists for this property
    setConversations((prev) => {
      const exists = prev.some((c) => c.propertyId === property.id);
      if (exists) return prev;

      const newConv: ChatConversation = {
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyAddress: property.address,
        propertyImage: property.images[0]?.url || '',
        landlord: property.landlord,
        lastMessage: `Hi! Thanks for checking out ${property.title}. How can I assist you today?`,
        lastMessageTimestamp: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `m-init-${Date.now()}`,
            propertyId: property.id,
            senderId: property.landlord.id,
            senderName: property.landlord.name,
            senderRole: 'landlord',
            text: `Hi! Thanks for checking out ${property.title}. How can I assist you with move-in dates or scheduling a walkthrough?`,
            timestamp: 'Just now',
            read: true,
          },
        ],
      };
      return [newConv, ...prev];
    });

    setIsChatOpen(true);
  }, []);

  const handleSendMessage = useCallback(
    (
      propertyId: string,
      text: string,
      type?: any,
      tourDetails?: any,
      meta?: {
        senderRole?: 'tenant' | 'landlord';
        senderName?: string;
        source?: 'n8n' | 'simulated' | 'user';
        n8nStatus?: 'success' | 'inactive' | 'error';
      }
    ) => {
      const activeProp = properties.find((p) => p.id === propertyId);
      const isLandlordSender = meta?.senderRole ? meta.senderRole === 'landlord' : isLandlordMode;

      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        propertyId,
        senderId: isLandlordSender ? activeProp?.landlord.id || 'landlord-me' : 'tenant-me',
        senderName:
          meta?.senderName ||
          (isLandlordSender ? activeProp?.landlord.name || 'Landlord' : 'You'),
        senderRole: isLandlordSender ? ('landlord' as const) : ('tenant' as const),
        text,
        timestamp: 'Just now',
        type: type || 'text',
        tourDetails,
        read: true,
        source: meta?.source,
        n8nStatus: meta?.n8nStatus,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.propertyId === propertyId) {
            return {
              ...c,
              lastMessage: text,
              lastMessageTimestamp: 'Just now',
              messages: [...c.messages, newMsg],
            };
          }
          return c;
        })
      );
    },
    [isLandlordMode, properties]
  );

  // Landlord Real-Time Availability Status Updater
  const handleUpdatePropertyStatus = useCallback(
    (propertyId: string, newStatus: AvailabilityStatus) => {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === propertyId) {
            return {
              ...p,
              availabilityStatus: newStatus,
              lastStatusUpdated: 'Just now (Updated in real-time)',
            };
          }
          return p;
        })
      );

      // Add to live activity ticker
      const target = properties.find((p) => p.id === propertyId);
      if (target) {
        const newNotif: ActivityNotification = {
          id: `notif-${Date.now()}`,
          propertyId,
          propertyTitle: target.title,
          type: 'status_change',
          message: `${target.landlord.name} updated ${target.title} availability to ${newStatus.replace('_', ' ').toUpperCase()}`,
          timestamp: 'Just now',
        };
        setNotifications((prev) => [newNotif, ...prev.slice(0, 8)]);
      }
    },
    [properties]
  );

  // Landlord Price Update
  const handleUpdatePropertyPrice = useCallback(
    (propertyId: string, newPrice: number) => {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === propertyId) {
            const originalPrice = p.originalPrice || p.price;
            return {
              ...p,
              price: newPrice,
              originalPrice: originalPrice > newPrice ? originalPrice : undefined,
              lastStatusUpdated: 'Price adjusted just now',
            };
          }
          return p;
        })
      );

      const target = properties.find((p) => p.id === propertyId);
      if (target) {
        const newNotif: ActivityNotification = {
          id: `notif-${Date.now()}`,
          propertyId,
          propertyTitle: target.title,
          type: 'price_drop',
          message: `Rent updated to $${newPrice.toLocaleString()}/mo on ${target.title}`,
          timestamp: 'Just now',
        };
        setNotifications((prev) => [newNotif, ...prev.slice(0, 8)]);
      }
    },
    [properties]
  );

  // Tour Booking Confirmation
  const handleConfirmTour = useCallback(
    (
      property: RentalProperty,
      tourData: { date: string; time: string; type: 'In-Person' | 'Live Video Tour'; contactName: string }
    ) => {
      handleOpenChat(property);
      handleSendMessage(
        property.id,
        `Tour scheduled for ${tourData.date} at ${tourData.time} (${tourData.type}) by ${tourData.contactName}.`,
        'tour_confirmed',
        {
          date: tourData.date,
          time: tourData.time,
          tourType: tourData.type,
          status: 'confirmed',
        }
      );

      // Add to live activity ticker
      const newNotif: ActivityNotification = {
        id: `notif-${Date.now()}`,
        propertyId: property.id,
        propertyTitle: property.title,
        type: 'tour_booked',
        message: `New ${tourData.type} booked for ${property.title} on ${tourData.date}`,
        timestamp: 'Just now',
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 8)]);
    },
    [handleOpenChat, handleSendMessage]
  );

  // Application Submission Handler
  const handleSubmitApplication = useCallback(
    (newApp: RentalApplication) => {
      setApplications((prev) => [newApp, ...prev]);

      // Route message into chat
      const target = properties.find((p) => p.id === newApp.propertyId);
      if (target) {
        handleSendMessage(
          newApp.propertyId,
          `Rental Application submitted for ${newApp.propertyTitle}. Applicant: ${newApp.applicantName}, Income: $${newApp.annualIncome.toLocaleString()}/yr, Target Move-in: ${newApp.moveInDate}.`,
          'application_request'
        );

        // Add to live activity ticker
        const newNotif: ActivityNotification = {
          id: `notif-${Date.now()}`,
          propertyId: newApp.propertyId,
          propertyTitle: target.title,
          type: 'application_received',
          message: `Application received for ${target.title} (${newApp.applicantName})`,
          timestamp: 'Just now',
        };
        setNotifications((prev) => [newNotif, ...prev.slice(0, 8)]);
      }
    },
    [properties, handleSendMessage]
  );

  // Unread messages count
  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  }, [conversations]);

  // Saved properties for comparison
  const savedProperties = useMemo(() => {
    return properties.filter((p) => favorites.includes(p.id));
  }, [properties, favorites]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Live Activity Ticker (Real-Time Availability & Tour Stream) */}
      <LiveActivityTicker
        notifications={notifications}
        onSelectPropertyById={(id) => {
          const prop = properties.find((p) => p.id === id);
          if (prop) {
            setSelectedProperty(prop);
            setDetailProperty(prop);
          }
        }}
      />

      {/* Top Navbar */}
      <Navbar
        favoritesCount={favorites.length}
        unreadMessagesCount={unreadMessagesCount}
        applicationsCount={applications.length}
        onOpenFavorites={() => {
          if (favorites.length >= 2) {
            setIsCompareModalOpen(true);
          } else if (favorites.length === 1) {
            const single = properties.find((p) => p.id === favorites[0]);
            if (single) setDetailProperty(single);
          } else {
            alert('You haven’t saved any rentals yet! Click the heart on any property to save it.');
          }
        }}
        onOpenChat={() => {
          if (!activeChatPropertyId && properties[0]) {
            setActiveChatPropertyId(properties[0].id);
          }
          setIsChatOpen(true);
        }}
        onOpenApplications={() => setIsMyApplicationsModalOpen(true)}
        onOpenLandlordPortal={() => setIsLandlordPortalOpen(true)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        totalPropertiesCount={properties.length}
      />

      {/* Search Bar & Primary Filters */}
      <SearchBar
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onSelectNeighborhoodCenter={handleSelectNeighborhoodCenter}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
        onOpenAdvancedFilters={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        totalListingsCount={filteredProperties.length}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col">
        {/* Split View (Default): List on Left, Map on Right */}
        {viewMode === 'split' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
            {/* Left Column: Rental Listings List (7 cols) */}
            <div className="lg:col-span-7 h-[calc(100vh-210px)] min-h-[500px]">
              <RentalList
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                hoveredPropertyId={hoveredPropertyId}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectProperty={(p) => setSelectedProperty(p)}
                onHoverProperty={(id) => setHoveredPropertyId(id)}
                onOpenChat={handleOpenChat}
                onViewDetails={(p) => setDetailProperty(p)}
                onScheduleTour={(p) => setTourBookingProperty(p)}
                onApply={(p) => setApplyingProperty(p)}
                filters={filters}
                onUpdateFilters={handleUpdateFilters}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Right Column: Interactive Google Map (5 cols) */}
            <div className="lg:col-span-5 h-[calc(100vh-210px)] min-h-[420px] sticky top-28">
              <RentalMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                hoveredPropertyId={hoveredPropertyId}
                onSelectProperty={(p) => setSelectedProperty(p)}
                onHoverProperty={(id) => setHoveredPropertyId(id)}
                center={searchCenter}
                radiusMiles={filters.maxDistanceMiles}
                onCenterChange={(newCenter) => setSearchCenter(newCenter)}
                onOpenChatWithLandlord={handleOpenChat}
                onViewPropertyDetails={(p) => setDetailProperty(p)}
                onApply={(p) => setApplyingProperty(p)}
              />
            </div>
          </div>
        )}

        {/* Map-Only View */}
        {viewMode === 'map' && (
          <div className="flex-1 h-[calc(100vh-210px)] min-h-[550px]">
            <RentalMap
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              hoveredPropertyId={hoveredPropertyId}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onHoverProperty={(id) => setHoveredPropertyId(id)}
              center={searchCenter}
              radiusMiles={filters.maxDistanceMiles}
              onCenterChange={(newCenter) => setSearchCenter(newCenter)}
              onOpenChatWithLandlord={handleOpenChat}
              onViewPropertyDetails={(p) => setDetailProperty(p)}
              onApply={(p) => setApplyingProperty(p)}
            />
          </div>
        )}

        {/* List-Only View */}
        {viewMode === 'list' && (
          <div className="flex-1 max-w-5xl mx-auto w-full">
            <RentalList
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              hoveredPropertyId={hoveredPropertyId}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onHoverProperty={(id) => setHoveredPropertyId(id)}
              onOpenChat={handleOpenChat}
              onViewDetails={(p) => setDetailProperty(p)}
              onScheduleTour={(p) => setTourBookingProperty(p)}
              onApply={(p) => setApplyingProperty(p)}
              filters={filters}
              onUpdateFilters={handleUpdateFilters}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}
      </main>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        resultsCount={filteredProperties.length}
      />

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={detailProperty}
        isOpen={!!detailProperty}
        onClose={() => setDetailProperty(null)}
        isFavorite={detailProperty ? favorites.includes(detailProperty.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenChat={(p) => {
          setDetailProperty(null);
          handleOpenChat(p);
        }}
        onScheduleTour={(p) => {
          setDetailProperty(null);
          setTourBookingProperty(p);
        }}
        onApply={(p) => {
          setDetailProperty(null);
          setApplyingProperty(p);
        }}
      />

      {/* Integrated Landlord Chat System */}
      <ChatSystem
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        conversations={conversations}
        activePropertyId={activeChatPropertyId}
        onSelectConversation={(id) => setActiveChatPropertyId(id)}
        onSendMessage={handleSendMessage}
        properties={properties}
        onViewPropertyDetails={(p) => {
          setIsChatOpen(false);
          setDetailProperty(p);
        }}
        onOpenApplicationModal={(p) => {
          setApplyingProperty(p);
        }}
        isLandlordMode={isLandlordMode}
        onToggleLandlordMode={(enabled) => setIsLandlordMode(enabled)}
        onUpdateAvailabilityStatus={handleUpdatePropertyStatus}
      />

      {/* Schedule Tour Modal */}
      <ScheduleTourModal
        property={tourBookingProperty}
        isOpen={!!tourBookingProperty}
        onClose={() => setTourBookingProperty(null)}
        onConfirmTour={handleConfirmTour}
      />

      {/* Online Rental Application Modal */}
      <RentalApplicationModal
        property={applyingProperty}
        isOpen={!!applyingProperty}
        onClose={() => setApplyingProperty(null)}
        onSubmitApplication={handleSubmitApplication}
      />

      {/* My Applications Tracker Modal */}
      <MyApplicationsModal
        isOpen={isMyApplicationsModalOpen}
        onClose={() => setIsMyApplicationsModalOpen(false)}
        applications={applications}
        onOpenChat={(propertyId) => {
          setActiveChatPropertyId(propertyId);
          setIsChatOpen(true);
        }}
        onViewProperty={(propertyId) => {
          const prop = properties.find((p) => p.id === propertyId);
          if (prop) setDetailProperty(prop);
        }}
        onStartNewApplication={() => {
          if (properties[0]) {
            setApplyingProperty(properties[0]);
          }
        }}
      />

      {/* Landlord Real-Time Management Portal */}
      <LandlordPortalModal
        isOpen={isLandlordPortalOpen}
        onClose={() => setIsLandlordPortalOpen(false)}
        properties={properties}
        onUpdatePropertyStatus={handleUpdatePropertyStatus}
        onUpdatePropertyPrice={handleUpdatePropertyPrice}
        onOpenChatForProperty={(propId) => {
          setIsLandlordPortalOpen(false);
          setActiveChatPropertyId(propId);
          setIsChatOpen(true);
        }}
      />

      {/* Property Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        properties={savedProperties}
        onRemoveFavorite={handleToggleFavorite}
        onOpenChat={(p) => {
          setIsCompareModalOpen(false);
          handleOpenChat(p);
        }}
      />
    </div>
  );
}
