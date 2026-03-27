'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Brain,
  History,
  Trophy,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  activeItem: string;
  onNavigate: (id: string) => void;
  alertCount?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'map', label: 'Live Map', icon: <Map className="w-5 h-5" /> },
  { id: 'forecast', label: 'Forecast', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'models', label: 'AI Models', icon: <Brain className="w-5 h-5" /> },
  { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
  { id: 'rankings', label: 'Rankings', icon: <Trophy className="w-5 h-5" /> },
];

const bottomItems: NavItem[] = [
  { id: 'alerts', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ activeItem, onNavigate, alertCount = 0 }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? 72 : 240,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="glass border-r border-border/50 h-screen sticky top-0 flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-toxic-cyan to-toxic-purple flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold text-foreground whitespace-nowrap">ToxicAI</h1>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Gas Monitoring</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavButton
                item={item}
                isActive={activeItem === item.id}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate(item.id)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border/50">
        <ul className="space-y-1">
          {bottomItems.map((item) => (
            <li key={item.id}>
              <NavButton
                item={{
                  ...item,
                  badge: item.id === 'alerts' ? alertCount : undefined,
                }}
                isActive={activeItem === item.id}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate(item.id)}
              />
            </li>
          ))}
        </ul>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'mt-3 w-full flex items-center justify-center gap-2 p-2 rounded-lg',
            'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
            'transition-colors duration-200'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function NavButton({ item, isActive, isCollapsed, onClick }: NavButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
        'transition-all duration-200 relative overflow-hidden',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
        />
      )}
      
      <span className={cn(
        'flex-shrink-0 transition-colors',
        isActive && 'text-primary'
      )}>
        {item.icon}
      </span>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      
      {/* Badge */}
      {item.badge !== undefined && item.badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'ml-auto px-2 py-0.5 text-xs font-bold rounded-full',
            'bg-red-500/20 text-red-400',
            isCollapsed && 'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0'
          )}
        >
          {item.badge}
        </motion.span>
      )}
    </motion.button>
  );
}
