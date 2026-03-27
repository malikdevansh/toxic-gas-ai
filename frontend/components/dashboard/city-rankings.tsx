'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCityRankings } from '@/hooks/use-pollution-data';
import type { CityRanking, RiskLevel } from '@/lib/types';

type SortKey = 'rank' | 'city' | 'co' | 'no2' | 'aqi';
type SortOrder = 'asc' | 'desc';

export function CityRankings({ searchQuery = '' }: { searchQuery?: string }) {
  const { rankings, isLoading } = useCityRankings();
  const [sortKey, setSortKey] = useState<SortKey>('aqi');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filteredRankings = rankings?.filter(city => 
    city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRankings = filteredRankings
    ? [...filteredRankings].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        return sortOrder === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      })
    : [];

  if (isLoading || !rankings) {
    return <RankingsSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-border/30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Global Rankings</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          Sorted by highest pollution
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <TableHeader 
                label="#" 
                sortKey="rank" 
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableHeader 
                label="City" 
                sortKey="city" 
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableHeader 
                label="CO (ppm)" 
                sortKey="co" 
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
                align="right"
              />
              <TableHeader 
                label="NO2 (ppb)" 
                sortKey="no2" 
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
                align="right"
              />
              <TableHeader 
                label="AQI" 
                sortKey="aqi" 
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {sortedRankings.map((city, index) => (
              <TableRow 
                key={city.city} 
                city={city} 
                index={index}
                isHighest={index === 0 && sortKey === 'aqi' && sortOrder === 'desc'}
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

interface TableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right';
}

function TableHeader({ 
  label, 
  sortKey, 
  currentSortKey, 
  sortOrder, 
  onSort,
  align = 'left' 
}: TableHeaderProps) {
  const isActive = currentSortKey === sortKey;
  
  return (
    <th className={cn(
      'px-4 py-3 text-xs font-medium text-muted-foreground',
      align === 'right' ? 'text-right' : 'text-left'
    )}>
      <button
        onClick={() => onSort(sortKey)}
        className={cn(
          'flex items-center gap-1 hover:text-foreground transition-colors',
          align === 'right' && 'ml-auto',
          isActive && 'text-foreground'
        )}
      >
        <span>{label}</span>
        {isActive ? (
          sortOrder === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
        )}
      </button>
    </th>
  );
}

interface TableRowProps {
  city: CityRanking;
  index: number;
  isHighest: boolean;
}

function TableRow({ city, index, isHighest }: TableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'border-b border-border/20 transition-colors',
        'hover:bg-secondary/30',
        isHighest && 'bg-red-500/5'
      )}
    >
      <td className="px-4 py-3">
        <span className={cn(
          'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
          city.rank === 1 && 'bg-amber-500/20 text-amber-400',
          city.rank === 2 && 'bg-gray-400/20 text-gray-400',
          city.rank === 3 && 'bg-amber-700/20 text-amber-600',
          city.rank > 3 && 'text-muted-foreground'
        )}>
          {city.rank}
        </span>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{city.city}</p>
          <p className="text-xs text-muted-foreground">{city.country}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <ValueCell value={city.co} isHighest={isHighest} />
      </td>
      <td className="px-4 py-3 text-right">
        <ValueCell value={city.no2} isHighest={isHighest} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <ValueCell value={city.aqi} isHighest={isHighest} />
          <RiskBadge level={city.riskLevel} />
        </div>
      </td>
    </motion.tr>
  );
}

interface ValueCellProps {
  value: number;
  isHighest: boolean;
}

function ValueCell({ value, isHighest }: ValueCellProps) {
  return (
    <span className={cn(
      'text-sm font-mono',
      isHighest ? 'text-red-400 font-bold' : 'text-foreground'
    )}>
      {value.toFixed(1)}
    </span>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn(
      'w-2 h-2 rounded-full',
      level === 'safe' && 'bg-emerald-400',
      level === 'moderate' && 'bg-amber-400',
      level === 'danger' && 'bg-red-400'
    )} />
  );
}

function RankingsSkeleton() {
  return (
    <div className="glass rounded-xl border border-border/30 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <div className="w-5 h-5 rounded bg-secondary/50 animate-pulse" />
        <div className="w-32 h-5 rounded bg-secondary/50 animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-secondary/50 animate-pulse" />
            <div className="w-24 h-4 rounded bg-secondary/50 animate-pulse" />
            <div className="ml-auto flex gap-4">
              <div className="w-12 h-4 rounded bg-secondary/50 animate-pulse" />
              <div className="w-12 h-4 rounded bg-secondary/50 animate-pulse" />
              <div className="w-12 h-4 rounded bg-secondary/50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
