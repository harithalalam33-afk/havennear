/**
 * Calculate distance in miles between two latitude/longitude points (Haversine formula)
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBeds(beds: number): string {
  if (beds === 0) return 'Studio';
  if (beds === 1) return '1 Bed';
  return `${beds} Beds`;
}

export function formatBaths(baths: number): string {
  if (baths === 1) return '1 Bath';
  return `${baths} Baths`;
}

export function getStatusBadge(status: string): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'available_now':
      return {
        label: 'Available Now',
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500 animate-pulse',
      };
    case 'available_soon':
      return {
        label: 'Available Soon',
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800/60',
        dot: 'bg-blue-500',
      };
    case 'pending_application':
      return {
        label: 'Pending Application',
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      };
    case 'rented':
      return {
        label: 'Rented / Unavailable',
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        text: 'text-zinc-600 dark:text-zinc-400',
        border: 'border-zinc-300 dark:border-zinc-700',
        dot: 'bg-zinc-400',
      };
    default:
      return {
        label: 'Available',
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        text: 'text-zinc-700 dark:text-zinc-300',
        border: 'border-zinc-200 dark:border-zinc-700',
        dot: 'bg-zinc-500',
      };
  }
}
