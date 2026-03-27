'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { ForecastData } from '@/lib/types';

interface ForecastChartProps {
  data: ForecastData[] | undefined;
  stats: {
    minCo: number;
    maxCo: number;
    avgCo: number;
    trend: 'increasing' | 'decreasing';
  } | null;
  isLoading: boolean;
}

export function ForecastChart({ data, stats, isLoading }: ForecastChartProps) {
  if (isLoading || !data) {
    return <ForecastChartSkeleton />;
  }

  const chartData = data.map(d => ({
    hour: `${d.hour}:00`,
    co: d.co,
    no2: d.no2,
    aqi: d.aqi,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-border/30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">24-Hour Forecast</h3>
        </div>
        {stats && (
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
            stats.trend === 'increasing' 
              ? 'bg-red-500/10 text-red-400' 
              : 'bg-emerald-500/10 text-emerald-400'
          )}>
            {stats.trend === 'increasing' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span className="capitalize">{stats.trend}</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-border/30">
          <StatItem label="Min CO" value={stats.minCo.toFixed(1)} unit="ppm" />
          <StatItem label="Max CO" value={stats.maxCo.toFixed(1)} unit="ppm" />
          <StatItem label="Avg CO" value={stats.avgCo.toFixed(1)} unit="ppm" />
        </div>
      )}

      {/* Chart */}
      <div className="p-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="coGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.05)" 
              vertical={false}
            />
            <XAxis 
              dataKey="hour" 
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="co"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#coGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 p-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#22d3ee]" />
          <span className="text-xs text-muted-foreground">CO Level (ppm)</span>
        </div>
      </div>
    </motion.div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  unit: string;
}

function StatItem({ label, value, unit }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {value}
        <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
      </p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass rounded-lg p-3 border border-border/30 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function ForecastChartSkeleton() {
  return (
    <div className="glass rounded-xl border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-secondary/50 animate-pulse" />
          <div className="w-32 h-5 rounded bg-secondary/50 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-border/30">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="w-12 h-3 rounded bg-secondary/50 animate-pulse mx-auto mb-2" />
            <div className="w-16 h-6 rounded bg-secondary/50 animate-pulse mx-auto" />
          </div>
        ))}
      </div>
      <div className="p-4 h-[280px] flex items-center justify-center">
        <span className="text-muted-foreground">Loading forecast...</span>
      </div>
    </div>
  );
}
