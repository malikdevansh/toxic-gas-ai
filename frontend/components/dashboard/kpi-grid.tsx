'use client';

import { motion } from 'framer-motion';
import { Wind, Flame, Activity, AlertTriangle } from 'lucide-react';
import { KPICard } from './kpi-card';
import type { PollutionData, RiskLevel } from '@/lib/types';

interface KPIGridProps {
  data: PollutionData[] | undefined;
  isLoading: boolean;
}

function calculateAggregates(data: PollutionData[]) {
  const avgCo = data.reduce((sum, d) => sum + d.co, 0) / data.length;
  const avgNo2 = data.reduce((sum, d) => sum + d.no2, 0) / data.length;
  const avgAqi = data.reduce((sum, d) => sum + d.aqi, 0) / data.length;
  const dangerCount = data.filter(d => d.riskLevel === 'danger').length;
  
  return { avgCo, avgNo2, avgAqi, dangerCount };
}

function getRiskLevel(value: number, thresholds: { safe: number; moderate: number }): RiskLevel {
  if (value <= thresholds.safe) return 'safe';
  if (value <= thresholds.moderate) return 'moderate';
  return 'danger';
}

export function KPIGrid({ data, isLoading }: KPIGridProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { avgCo, avgNo2, avgAqi, dangerCount } = calculateAggregates(data);

  const kpis = [
    {
      title: 'Carbon Monoxide',
      value: avgCo,
      unit: 'ppm',
      icon: <Wind className="w-5 h-5" />,
      riskLevel: getRiskLevel(avgCo, { safe: 4, moderate: 9 }),
      decimals: 1,
      subtitle: 'Average across all stations',
    },
    {
      title: 'Nitrogen Dioxide',
      value: avgNo2,
      unit: 'ppb',
      icon: <Flame className="w-5 h-5" />,
      riskLevel: getRiskLevel(avgNo2, { safe: 30, moderate: 60 }),
      decimals: 1,
      subtitle: 'Average across all stations',
    },
    {
      title: 'Air Quality Index',
      value: avgAqi,
      unit: 'AQI',
      icon: <Activity className="w-5 h-5" />,
      riskLevel: getRiskLevel(avgAqi, { safe: 50, moderate: 100 }),
      decimals: 0,
      subtitle: 'Global average',
    },
    {
      title: 'Active Alerts',
      value: dangerCount,
      unit: 'cities',
      icon: <AlertTriangle className="w-5 h-5" />,
      riskLevel: dangerCount === 0 ? 'safe' : dangerCount <= 2 ? 'moderate' : 'danger',
      decimals: 0,
      subtitle: 'In danger zone',
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <KPICard {...kpi} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 border border-border/30">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/50 animate-pulse" />
        <div className="w-16 h-5 rounded-full bg-secondary/50 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 rounded bg-secondary/50 animate-pulse" />
        <div className="w-32 h-8 rounded bg-secondary/50 animate-pulse" />
      </div>
    </div>
  );
}
