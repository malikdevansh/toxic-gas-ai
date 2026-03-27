'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, AlertCircle, Info, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlerts } from '@/hooks/use-pollution-data';
import type { Alert } from '@/lib/types';

interface AlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertPanel({ isOpen, onClose }: AlertPanelProps) {
  const { alerts, unreadCount, markAsRead, markAllAsRead, isLoading } = useAlerts();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 glass border-l border-border/30 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Alerts</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Alert List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <AlertsSkeleton />
              ) : alerts && alerts.length > 0 ? (
                <AnimatePresence>
                  {alerts.map((alert, index) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      index={index}
                      onMarkRead={() => markAsRead(alert.id)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No alerts</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    You&apos;re all caught up!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface AlertItemProps {
  alert: Alert;
  index: number;
  onMarkRead: () => void;
}

function AlertItem({ alert, index, onMarkRead }: AlertItemProps) {
  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
    },
    warning: {
      icon: <AlertCircle className="w-4 h-4" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
    info: {
      icon: <Info className="w-4 h-4" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
    },
  };

  const config = typeConfig[alert.type];
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-xl border transition-all',
        config.bg,
        config.border,
        !alert.read && 'ring-1 ring-primary/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bg)}>
          <span className={config.text}>{config.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn('font-medium text-sm', config.text)}>
              {alert.title}
            </h4>
            {!alert.read && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {alert.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground/70">
              {timeAgo}
            </span>
            {!alert.read && (
              <button
                onClick={onMarkRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Check className="w-3 h-3" />
                Mark read
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function AlertsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-secondary/20 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/50" />
            <div className="flex-1">
              <div className="w-24 h-4 rounded bg-secondary/50 mb-2" />
              <div className="w-full h-3 rounded bg-secondary/50" />
              <div className="w-16 h-3 rounded bg-secondary/50 mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
