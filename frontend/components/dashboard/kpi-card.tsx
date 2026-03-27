'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import type { RiskLevel } from '@/lib/types';

interface KPICardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  riskLevel: RiskLevel;
  decimals?: number;
  subtitle?: string;
}

const riskConfig = {
  safe: {
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/30',
    glow: 'glow-green',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    label: 'Safe',
  },
  moderate: {
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/30',
    glow: 'glow-yellow',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    label: 'Moderate',
  },
  danger: {
    gradient: 'from-red-500/20 to-red-600/5',
    border: 'border-red-500/30',
    glow: 'pulse-danger',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    label: 'Danger',
  },
};

export function KPICard({ 
  title, 
  value, 
  unit, 
  icon, 
  riskLevel, 
  decimals = 1,
  subtitle 
}: KPICardProps) {
  const config = riskConfig[riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'glass relative overflow-hidden rounded-xl p-5',
        'border',
        config.border,
        riskLevel === 'danger' && config.glow
      )}
    >
      {/* Background gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50',
        config.gradient
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={cn('p-2 rounded-lg', config.bg)}>
            <span className={config.text}>{icon}</span>
          </div>
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            config.bg,
            config.text
          )}>
            {config.label}
          </span>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter 
              value={value} 
              decimals={decimals}
              className={cn('text-3xl font-bold tracking-tight', config.text)}
            />
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Decorative corner gradient */}
      <div className={cn(
        'absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20',
        riskLevel === 'safe' && 'bg-emerald-500',
        riskLevel === 'moderate' && 'bg-amber-500',
        riskLevel === 'danger' && 'bg-red-500'
      )} />
    </motion.div>
  );
}
