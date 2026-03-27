'use client';

import { motion } from 'framer-motion';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isConnected?: boolean;
  alertCount?: number;
  onAlertClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ 
  title, 
  subtitle, 
  isConnected = false,
  alertCount = 0,
  onAlertClick,
  searchQuery = '',
  onSearchChange
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
          isConnected 
            ? 'bg-emerald-500/10 text-emerald-400' 
            : 'bg-red-500/10 text-red-400'
        )}>
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          <span>{isConnected ? 'Live' : 'Disconnected'}</span>
          {isConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search cities..."
            className={cn(
              'w-64 pl-10 pr-4 py-2 rounded-lg',
              'bg-secondary/50 border border-border/50',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
              'transition-all duration-200'
            )}
          />
        </div>
        
        {/* Alerts */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAlertClick}
          className={cn(
            'relative p-2 rounded-lg',
            'bg-secondary/50 border border-border/50',
            'hover:bg-secondary transition-colors'
          )}
        >
          <Bell className="w-5 h-5 text-foreground" />
          {alertCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center',
                'bg-red-500 text-white text-xs font-bold rounded-full'
              )}
            >
              {alertCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
