'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Check } from 'lucide-react';
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
import { useModelData } from '@/hooks/use-pollution-data';

export function ModelAnalysis() {
  const { models, isLoading } = useModelData();
  const [selectedModelId, setSelectedModelId] = useState<string>('lstm');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedModel = models?.find(m => m.id === selectedModelId);

  if (isLoading || !models) {
    return <ModelAnalysisSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-border/30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Multi-Model Analysis</h3>
        </div>
        
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-secondary/50 border border-border/50',
              'text-sm font-medium text-foreground',
              'hover:bg-secondary transition-colors'
            )}
          >
            <span>{selectedModel?.name || 'Select Model'}</span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              isDropdownOpen && 'rotate-180'
            )} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-56 z-20 glass rounded-lg border border-border/30 overflow-hidden"
              >
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModelId(model.id);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-left',
                      'hover:bg-secondary/50 transition-colors',
                      selectedModelId === model.id && 'bg-primary/10'
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{model.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        R²: {model.r2.toFixed(2)}
                      </p>
                    </div>
                    {selectedModelId === model.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Model Info */}
      <AnimatePresence mode="wait">
        {selectedModel && (
          <motion.div
            key={selectedModel.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-border/30">
              <p className="text-sm text-muted-foreground mb-4">
                {selectedModel.description}
              </p>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <MetricCard 
                  label="MAE" 
                  value={selectedModel.mae.toFixed(2)} 
                  description="Mean Absolute Error"
                />
                <MetricCard 
                  label="RMSE" 
                  value={selectedModel.rmse.toFixed(2)} 
                  description="Root Mean Square Error"
                />
                <MetricCard 
                  label="R²" 
                  value={selectedModel.r2.toFixed(2)} 
                  description="Coefficient of Determination"
                  highlight
                />
              </div>
            </div>

            {/* Prediction Chart */}
            <div className="p-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedModel.predictions}>
                  <defs>
                    <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => `${value}h`}
                    interval={3}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Predicted AQI"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#predGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
}

function MetricCard({ label, value, description, highlight }: MetricCardProps) {
  return (
    <div className={cn(
      'p-3 rounded-lg',
      highlight ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30'
    )}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn(
        'text-xl font-bold',
        highlight ? 'text-primary' : 'text-foreground'
      )}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass rounded-lg p-3 border border-border/30 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-2">Hour {label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

function ModelAnalysisSkeleton() {
  return (
    <div className="glass rounded-xl border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-secondary/50 animate-pulse" />
          <div className="w-36 h-5 rounded bg-secondary/50 animate-pulse" />
        </div>
        <div className="w-32 h-9 rounded-lg bg-secondary/50 animate-pulse" />
      </div>
      <div className="p-4 border-b border-border/30">
        <div className="w-full h-4 rounded bg-secondary/50 animate-pulse mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-3 rounded bg-secondary/50 animate-pulse mb-2" />
              <div className="w-16 h-6 rounded bg-secondary/50 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 h-[220px] flex items-center justify-center">
        <span className="text-muted-foreground">Loading model data...</span>
      </div>
    </div>
  );
}
