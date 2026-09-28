import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Info,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { RentalProperty, PriceHistoryPoint } from '../types/rental';
import { getPropertyPriceHistory } from '../utils/priceHistory';

interface PriceHistoryChartProps {
  property: RentalProperty;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: PriceHistoryPoint;
    color?: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const currentRent = data.price;
  const median = data.neighborhoodMedian;
  const diffFromMedian = median ? currentRent - median : 0;

  return (
    <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs min-w-[200px] z-50">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          {data.fullDate || label}
        </span>
        {data.event && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            {data.event}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Rent Rate:</span>
          <span className="text-sm font-extrabold text-blue-300">
            ${currentRent.toLocaleString()}
            <span className="text-[10px] font-normal text-slate-400">/mo</span>
          </span>
        </div>

        {median && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Area Median:</span>
            <span className="text-slate-300 font-medium">${median.toLocaleString()}/mo</span>
          </div>
        )}

        {median && (
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">vs Area:</span>
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                diffFromMedian < 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {diffFromMedian < 0 ? (
                <>
                  <ArrowDownRight className="w-3 h-3" />
                  ${Math.abs(diffFromMedian)}/mo below
                </>
              ) : diffFromMedian > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3" />
                  +${diffFromMedian}/mo above
                </>
              ) : (
                'Equal to median'
              )}
            </span>
          </div>
        )}

        {data.note && (
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 italic flex items-start gap-1">
            <Info className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
            <span>{data.note}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ property }) => {
  const [showMedian, setShowMedian] = useState(true);

  // Obtain 12 months history
  const historyData = useMemo(() => {
    return getPropertyPriceHistory(property);
  }, [property]);

  // Calculations
  const prices = historyData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const firstPrice = historyData[0]?.price || property.price;
  const latestPrice = historyData[historyData.length - 1]?.price || property.price;
  const netChange = latestPrice - firstPrice;
  const percentageChange = firstPrice > 0 ? ((netChange / firstPrice) * 100).toFixed(1) : '0.0';

  const averagePrice = Math.round(
    prices.reduce((acc, p) => acc + p, 0) / (prices.length || 1)
  );

  const events = historyData.filter((d) => d.event);

  // Y-axis bounds with padding
  const yMin = Math.floor((minPrice - 150) / 100) * 100;
  const yMax = Math.ceil((maxPrice + 150) / 100) * 100;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              12-Month Rent Price History
            </h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-semibold">
              Live Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical listing rates and seasonal neighborhood trends for this home
          </p>
        </div>

        {/* Toggle median benchmark */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMedian(!showMedian)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showMedian
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showMedian ? 'bg-amber-500' : 'bg-slate-400'
              }`}
            />
            <span>Area Median Benchmark</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-400">Current Rent</span>
          <div className="text-base font-extrabold text-slate-900 mt-0.5">
            ${latestPrice.toLocaleString()}
            <span className="text-xs font-medium text-slate-500">/mo</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-400">12-Mo Net Change</span>
          <div
            className={`text-base font-extrabold flex items-center gap-1 mt-0.5 ${
              netChange < 0
                ? 'text-emerald-600'
                : netChange > 0
                ? 'text-amber-600'
                : 'text-slate-700'
            }`}
          >
            {netChange < 0 ? (
              <TrendingDown className="w-4 h-4 shrink-0" />
            ) : netChange > 0 ? (
              <TrendingUp className="w-4 h-4 shrink-0" />
            ) : null}
            <span>
              {netChange > 0 ? `+` : ''}
              ${Math.abs(netChange).toLocaleString()} ({percentageChange}%)
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-400">12-Mo Range</span>
          <div className="text-xs font-bold text-slate-800 mt-1">
            ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-medium text-slate-400">Average Rate</span>
          <div className="text-xs font-bold text-slate-800 mt-1">
            ${averagePrice.toLocaleString()}/mo
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
          <AreaChart
            data={historyData}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="rentPriceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="medianGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={[yMin, yMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Current price reference line */}
            <ReferenceLine
              y={latestPrice}
              stroke="#2563eb"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />

            {/* Area benchmark for neighborhood median */}
            {showMedian && (
              <Area
                type="monotone"
                dataKey="neighborhoodMedian"
                name="Area Median"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                fill="url(#medianGradient)"
                fillOpacity={0.15}
                activeDot={{ r: 4, fill: '#f59e0b' }}
              />
            )}

            {/* Main Rent Price Area */}
            <Area
              type="monotone"
              dataKey="price"
              name="Property Rent"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#rentPriceGradient)"
              activeDot={{
                r: 6,
                fill: '#2563eb',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.event) {
                  return (
                    <g key={`event-dot-${payload.month}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="#f59e0b"
                        fillOpacity={0.25}
                      />
                    </g>
                  );
                }
                return <circle key={`dot-${payload.month}`} cx={cx} cy={cy} r={2.5} fill="#2563eb" />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Events / Timeline Chips */}
      {events.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Notable Price & Listing Milestones (Last 12 Months)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {events.map((evt) => (
              <div
                key={evt.month}
                className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <span
                  className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    evt.event === 'Price Drop'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : evt.event === 'Listed'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {evt.month}: {evt.event}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800">
                    ${evt.price.toLocaleString()}/mo
                  </div>
                  {evt.note && <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{evt.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Insight Footer Callout */}
      <div className="p-3 bg-linear-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          {latestPrice <= averagePrice ? (
            <>
              <strong>Favorable Timing:</strong> This unit is listed at or below its 12-month average rate of{' '}
              <span className="font-bold">${averagePrice.toLocaleString()}/mo</span>, providing good value for{' '}
              <span className="font-medium">{property.neighborhood}</span>.
            </>
          ) : (
            <>
              <strong>Market Assessment:</strong> Rent reflects premium season and recent renovations. Average 12-mo rate was{' '}
              <span className="font-bold">${averagePrice.toLocaleString()}/mo</span>.
            </>
          )}
        </span>
      </div>
    </div>
  );
};
