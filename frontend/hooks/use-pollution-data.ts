'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import type { PollutionData, ForecastData, HistoricalData, ModelData, Alert, CityRanking } from '@/lib/types';
import { fetchLivePollution, fetchForecast, fetchHistory, fetchModels, fetchCityRankings } from '@/lib/api';

// Live Pollution Hook - Fetching arrays of geo-located data
export function usePollutionData() {
  const { data, error, isLoading, mutate } = useSWR('pollution-live', fetchLivePollution, {
    refreshInterval: 0, 
    revalidateOnFocus: false,
  });

  return {  data: data || [], error, isLoading, mutate };
}

export function useRealTimePollution(enabled: boolean = true) {
  const { data, mutate } = usePollutionData();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Use env variable for production compatibility (http→ws, https→wss)
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = apiBase.replace(/^http/, 'ws') + '/realtime';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Map payload exactly to PollutionData target structure
        mutate((currentData: any) => {
          const arr = currentData ? [...currentData] : [];
          arr[0] = {
            ...arr[0],
            co: payload.co || arr[0]?.co || 0,
            no2: payload.no2 || arr[0]?.no2 || 0,
            aqi: payload.aqi || arr[0]?.aqi || 0,
            riskLevel: (payload.co > 200 ? 'danger' : payload.co > 100 ? 'moderate' : 'safe'),
            timestamp: new Date().toISOString()
          };
          return arr;
        }, false);
      } catch(e) {}
    };

    wsRef.current.onclose = () => setIsConnected(false);

    return () => {
      if (wsRef.current) wsRef.current.close();
      setIsConnected(false);
    };
  }, [enabled, mutate]);

  return { isConnected };
}

export function useForecastData() {
  const { data, error, isLoading, mutate } = useSWR('forecast', fetchForecast, {
    revalidateOnFocus: false,
  });

  const stats = data ? {
    minCo: Math.min(...data.map(d => d.co)),
    maxCo: Math.max(...data.map(d => d.co)),
    avgCo: data.reduce((sum, d) => sum + d.co, 0) / data.length,
    trend: data[data.length - 1]?.co > data[0]?.co ? 'increasing' : 'decreasing',
  } : null;

  return {
    data,
    stats,
    error,
    isLoading,
    mutate,
  };
}

export function useHistoricalData(days: number = 7) {
  const { data, error, isLoading, mutate } = useSWR(`history-${days}`, fetchHistory, {
    revalidateOnFocus: false 
  });

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export function useModelData() {
  const { data, error, isLoading } = useSWR('models', fetchModels, {
    revalidateOnFocus: false,
  });

  // Safe mapping depending on backend reliability
  return {
    models: data || [],
    error,
    isLoading,
  };
}

// Client-side alerting tracking against active pollution cache
export function useAlerts() {
  const { data: poll } = usePollutionData();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (poll && poll.length > 0) {
      const co = poll[0].co;
      if (co > 200) {
        setAlerts([{ id: Date.now().toString(), type: 'danger', title: 'Critical Hazard', message: 'CO levels > 200 threshold.', timestamp: new Date().toISOString(), read: false }]);
      } else if (co > 100) {
        setAlerts([{ id: Date.now().toString(), type: 'warning', title: 'Elevated Alert', message: 'CO levels > 100 threshold.', timestamp: new Date().toISOString(), read: false }]);
      } else {
        setAlerts([]); // Green - Safe
      }
    }
  }, [poll]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    error: null,
    isLoading: false,
  };
}

export function useCityRankings() {
  const { data, error, isLoading, mutate } = useSWR('rankings', fetchCityRankings, {
    revalidateOnFocus: false,
  });

  return { rankings: data || [], error, isLoading, mutate };
}
