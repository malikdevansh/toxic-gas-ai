'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useHistoricalData } from '@/hooks/use-pollution-data';

const timeRanges = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
];

export function HistoricalChart() {
  const [selectedRange, setSelectedRange] = useState(7);
  const { data, isLoading } = useHistoricalData(selectedRange);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-border/30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Historical Analytics</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range.days}
              onClick={() => setSelectedRange(range.days)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                selectedRange === range.days
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRange}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 h-[300px]"
        >
          {isLoading || !data ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-muted-foreground">Loading data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.05)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Line
                  type="monotone"
                  dataKey="co"
                  name="CO"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="no2"
                  name="NO2"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  name="AQI"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass rounded-lg p-3 border border-border/30 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-foreground">{label}</p>
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium text-foreground">
            {entry.value.toFixed(1)}
            <span className="text-muted-foreground ml-1">
              {entry.name === 'CO' ? 'ppm' : entry.name === 'NO2' ? 'ppb' : ''}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload) return null;

  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">
            {entry.value} {entry.value === 'CO' ? '(ppm)' : entry.value === 'NO2' ? '(ppb)' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}
