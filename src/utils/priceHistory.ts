import { PriceHistoryPoint, RentalProperty } from '../types/rental';

/**
 * Generates 12 months of realistic historical rent data ending in Sep 2026.
 * If property has custom priceHistory, uses that; otherwise creates realistic fluctuations.
 */
export function getPropertyPriceHistory(property: RentalProperty): PriceHistoryPoint[] {
  if (property.priceHistory && property.priceHistory.length > 0) {
    return property.priceHistory;
  }

  const months = [
    { label: "Oct '25", full: 'October 2025' },
    { label: "Nov '25", full: 'November 2025' },
    { label: "Dec '25", full: 'December 2025' },
    { label: "Jan '26", full: 'January 2026' },
    { label: "Feb '26", full: 'February 2026' },
    { label: "Mar '26", full: 'March 2026' },
    { label: "Apr '26", full: 'April 2026' },
    { label: "May '26", full: 'May 2026' },
    { label: "Jun '26", full: 'June 2026' },
    { label: "Jul '26", full: 'July 2026' },
    { label: "Aug '26", full: 'August 2026' },
    { label: "Sep '26", full: 'September 2026' },
  ];

  const currentPrice = property.price;
  const originalPrice = property.originalPrice || currentPrice;
  const hasDiscount = originalPrice > currentPrice;

  // Base median for neighborhood
  const neighborhoodBase = Math.round(currentPrice * 1.02);

  // Derive pseudo-deterministic seed from property id
  const charSum = property.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const varianceFactor = ((charSum % 7) - 3) * 15; // -45 to +45

  return months.map((m, index) => {
    let price: number;
    let event: PriceHistoryPoint['event'] = undefined;
    let note: string | undefined = undefined;

    if (hasDiscount) {
      // Started at originalPrice or higher, had price reductions
      if (index === 0) {
        price = originalPrice;
        event = 'Listed';
        note = `Initial listing at $${originalPrice.toLocaleString()}/mo`;
      } else if (index < 4) {
        price = originalPrice;
      } else if (index === 4) {
        // slight adjustment
        price = Math.round(originalPrice * 0.98 / 25) * 25;
        event = 'Market Adjustment';
        note = 'Winter market seasonal rate adjustment';
      } else if (index < 9) {
        price = Math.round((originalPrice + currentPrice) / 2 / 25) * 25;
      } else if (index === 9) {
        price = currentPrice;
        event = 'Price Drop';
        note = `Landlord dropped price to $${currentPrice.toLocaleString()}/mo for immediate occupancy`;
      } else {
        price = currentPrice;
      }
    } else {
      // General slight seasonal variation: lower in winter, peak in summer, stabilized now
      const seasonalOffsets = [
        -20, -40, -50, -50, -30, 0, 30, 60, 80, 50, 20, 0
      ];
      const offset = seasonalOffsets[index] + (index === 11 ? 0 : (index % 3 === 0 ? varianceFactor : 0));
      price = Math.round((currentPrice + offset) / 25) * 25;

      if (index === 0) {
        event = 'Listed';
        note = `Property listed for lease at $${price.toLocaleString()}/mo`;
      } else if (index === 6) {
        event = 'Price Increase';
        note = 'Spring market demand uptick';
      } else if (index === 11 && price !== currentPrice) {
        price = currentPrice;
      }
    }

    // Neighborhood median seasonal curve
    const medianOffset = Math.sin((index / 12) * Math.PI * 2) * 60;
    const neighborhoodMedian = Math.round((neighborhoodBase + medianOffset) / 25) * 25;

    return {
      month: m.label,
      fullDate: m.full,
      price,
      neighborhoodMedian,
      event,
      note,
    };
  });
}
