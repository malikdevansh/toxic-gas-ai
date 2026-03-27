export type RiskLevel = 'safe' | 'moderate' | 'danger';

export interface PollutionData {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  co: number;
  no2: number;
  aqi: number;
  riskLevel: RiskLevel;
  timestamp: string;
}

export interface ForecastData {
  hour: number;
  co: number;
  no2: number;
  aqi: number;
  timestamp: string;
}

export interface HistoricalData {
  date: string;
  co: number;
  no2: number;
  aqi: number;
}

export interface ModelData {
  id: string;
  name: string;
  description: string;
  mae: number;
  rmse: number;
  r2: number;
  predictions: { hour: number; value: number }[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  city?: string;
  timestamp: string;
  read: boolean;
}

export interface CityRanking {
  rank: number;
  city: string;
  country: string;
  co: number;
  no2: number;
  aqi: number;
  riskLevel: RiskLevel;
}
