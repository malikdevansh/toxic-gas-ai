'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { KPIGrid } from '@/components/dashboard/kpi-grid';
import { PollutionMap } from '@/components/dashboard/pollution-map';
import { ForecastChart } from '@/components/dashboard/forecast-chart';
import { HistoricalChart } from '@/components/dashboard/historical-chart';
import { ModelAnalysis } from '@/components/dashboard/model-analysis';
import { CityRankings } from '@/components/dashboard/city-rankings';
import { AlertPanel } from '@/components/dashboard/alert-panel';
import { PageTransition } from '@/components/dashboard/page-transition';
import { 
  usePollutionData, 
  useRealTimePollution, 
  useForecastData,
  useAlerts,
} from '@/hooks/use-pollution-data';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isAlertPanelOpen, setIsAlertPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: pollutionData, isLoading: pollutionLoading } = usePollutionData();
  const { isConnected } = useRealTimePollution(true);
  const { data: forecastData, stats: forecastStats, isLoading: forecastLoading } = useForecastData();
  const { unreadCount } = useAlerts();

  const handleNavigate = (id: string) => {
    if (id === 'alerts') {
      setIsAlertPanelOpen(true);
    } else {
      setActivePage(id);
    }
  };

  const filteredPollutionData = pollutionData?.filter(city => 
    city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activePage} 
        onNavigate={handleNavigate}
        alertCount={unreadCount}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <PageTransition pageKey={activePage}>
          {activePage === 'dashboard' && (
            <DashboardView 
              pollutionData={filteredPollutionData}
              pollutionLoading={pollutionLoading}
              forecastData={forecastData}
              forecastStats={forecastStats}
              forecastLoading={forecastLoading}
              isConnected={isConnected}
              alertCount={unreadCount}
              onAlertClick={() => setIsAlertPanelOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activePage === 'map' && (
            <MapView 
              pollutionData={filteredPollutionData}
              pollutionLoading={pollutionLoading}
              isConnected={isConnected}
              alertCount={unreadCount}
              onAlertClick={() => setIsAlertPanelOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activePage === 'forecast' && (
            <ForecastView 
              forecastData={forecastData}
              forecastStats={forecastStats}
              forecastLoading={forecastLoading}
              isConnected={isConnected}
              alertCount={unreadCount}
              onAlertClick={() => setIsAlertPanelOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activePage === 'models' && (
            <ModelsView 
              isConnected={isConnected}
              alertCount={unreadCount}
              onAlertClick={() => setIsAlertPanelOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activePage === 'history' && (
            <HistoryView 
              isConnected={isConnected}
              alertCount={unreadCount}
              onAlertClick={() => setIsAlertPanelOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activePage === 'rankings' && (
            <RankingsView 
              isConnected={isConnected}
              alertCount={unreadCount}
              onAlertClick={() => setIsAlertPanelOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activePage === 'settings' && (
            <SettingsView 
              isConnected={isConnected}
              alertCount={unreadCount}
              onAlertClick={() => setIsAlertPanelOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </PageTransition>
      </main>

      {/* Alert Panel */}
      <AlertPanel 
        isOpen={isAlertPanelOpen} 
        onClose={() => setIsAlertPanelOpen(false)} 
      />
    </div>
  );
}

// Dashboard View
interface DashboardViewProps {
  pollutionData: any;
  pollutionLoading: boolean;
  forecastData: any;
  forecastStats: any;
  forecastLoading: boolean;
  isConnected: boolean;
  alertCount: number;
  onAlertClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function DashboardView({ 
  pollutionData, 
  pollutionLoading, 
  forecastData,
  forecastStats,
  forecastLoading,
  isConnected, 
  alertCount, 
  onAlertClick,
  searchQuery,
  onSearchChange
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <Header 
        title="Command Center"
        subtitle="Real-time global toxic gas monitoring"
        isConnected={isConnected}
        alertCount={alertCount}
        onAlertClick={onAlertClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      {/* KPI Cards */}
      <KPIGrid data={pollutionData} isLoading={pollutionLoading} />

      {/* Map and Forecast Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PollutionMap data={pollutionData} isLoading={pollutionLoading} />
        <ForecastChart data={forecastData} stats={forecastStats} isLoading={forecastLoading} />
      </div>

      {/* Model Analysis and Rankings Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ModelAnalysis />
        <CityRankings searchQuery={searchQuery} />
      </div>

      {/* Historical Chart */}
      <HistoricalChart />
    </div>
  );
}

// Map View
interface MapViewProps {
  pollutionData: any;
  pollutionLoading: boolean;
  isConnected: boolean;
  alertCount: number;
  onAlertClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function MapView({ pollutionData, pollutionLoading, isConnected, alertCount, onAlertClick, searchQuery, onSearchChange }: MapViewProps) {
  return (
    <div className="space-y-6">
      <Header 
        title="Live Pollution Map"
        subtitle="Interactive global pollution visualization"
        isConnected={isConnected}
        alertCount={alertCount}
        onAlertClick={onAlertClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <div className="h-[calc(100vh-180px)]">
        <PollutionMap data={pollutionData} isLoading={pollutionLoading} />
      </div>
    </div>
  );
}

// Forecast View
interface ForecastViewProps {
  forecastData: any;
  forecastStats: any;
  forecastLoading: boolean;
  isConnected: boolean;
  alertCount: number;
  onAlertClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function ForecastView({ forecastData, forecastStats, forecastLoading, isConnected, alertCount, onAlertClick, searchQuery, onSearchChange }: ForecastViewProps) {
  return (
    <div className="space-y-6">
      <Header 
        title="24-Hour Forecast"
        subtitle="AI-powered pollution predictions"
        isConnected={isConnected}
        alertCount={alertCount}
        onAlertClick={onAlertClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <ForecastChart data={forecastData} stats={forecastStats} isLoading={forecastLoading} />
      <HistoricalChart />
    </div>
  );
}

// Models View
interface ModelsViewProps {
  isConnected: boolean;
  alertCount: number;
  onAlertClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function ModelsView({ isConnected, alertCount, onAlertClick, searchQuery, onSearchChange }: ModelsViewProps) {
  return (
    <div className="space-y-6">
      <Header 
        title="AI Models"
        subtitle="Compare prediction model performance"
        isConnected={isConnected}
        alertCount={alertCount}
        onAlertClick={onAlertClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <ModelAnalysis />
    </div>
  );
}

// History View
interface HistoryViewProps {
  isConnected: boolean;
  alertCount: number;
  onAlertClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function HistoryView({ isConnected, alertCount, onAlertClick, searchQuery, onSearchChange }: HistoryViewProps) {
  return (
    <div className="space-y-6">
      <Header 
        title="Historical Analytics"
        subtitle="Analyze past pollution trends"
        isConnected={isConnected}
        alertCount={alertCount}
        onAlertClick={onAlertClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <HistoricalChart />
    </div>
  );
}

// Rankings View
interface RankingsViewProps {
  isConnected: boolean;
  alertCount: number;
  onAlertClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function RankingsView({ isConnected, alertCount, onAlertClick, searchQuery, onSearchChange }: RankingsViewProps) {
  return (
    <div className="space-y-6">
      <Header 
        title="Global Rankings"
        subtitle="Cities ranked by pollution levels"
        isConnected={isConnected}
        alertCount={alertCount}
        onAlertClick={onAlertClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <CityRankings searchQuery={searchQuery} />
    </div>
  );
}

// Settings View
interface SettingsViewProps {
  isConnected: boolean;
  alertCount: number;
  onAlertClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function SettingsView({ isConnected, alertCount, onAlertClick, searchQuery, onSearchChange }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <Header 
        title="Settings"
        subtitle="Configure your dashboard preferences"
        isConnected={isConnected}
        alertCount={alertCount}
        onAlertClick={onAlertClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <div className="glass rounded-xl border border-border/30 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Pollution API Endpoint</label>
            <input 
              type="text" 
              defaultValue="/api/pollution/live"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-foreground text-sm"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Forecast API Endpoint</label>
            <input 
              type="text" 
              defaultValue="/api/forecast"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-foreground text-sm"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">WebSocket Endpoint</label>
            <input 
              type="text" 
              defaultValue="ws://localhost:8000/realtime"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 text-foreground text-sm"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
