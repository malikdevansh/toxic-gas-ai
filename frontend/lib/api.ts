import axios from 'axios';
import { PollutionData, ForecastData, HistoricalData, ModelData, CityRanking } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchLivePollution = async (): Promise<PollutionData[]> => {
  const { data } = await api.get('/api/rankings');
  return data;
};

export const fetchCityRankings = async (): Promise<CityRanking[]> => {
  const { data } = await api.get('/api/rankings');
  return data;
};

export const fetchForecast = async (): Promise<ForecastData[]> => {
  const { data } = await api.get('/api/forecast');
  if (!data?.co_forecast || !Array.isArray(data.co_forecast)) return [];
  
  return data.co_forecast.map((val: number, index: number) => {
    const d = new Date();
    d.setHours(d.getHours() + index);
    return {
      hour: d.getHours(),
      co: val,
      no2: val * 0.8, // Mocking correlation if backend relies purely on CO sequence
      aqi: val > 100 ? 150 : 50,
      timestamp: d.toISOString()
    };
  });
};

export const fetchHistory = async (): Promise<HistoricalData[]> => {
  const { data } = await api.get('/api/history');
  return data.map((item: any) => ({
    date: item.time,
    co: item.co,
    no2: item.no2,
    aqi: (item.co + item.no2) / 2
  }));
};

export const fetchModels = async (): Promise<ModelData[]> => {
  const { data } = await api.get('/api/models');
  if (!data?.models) return [];
  
  return data.models.map((model: any) => ({
    id: model.name.toLowerCase().replace(' ', '-'),
    name: model.name,
    description: `Analysis via ${model.name}`,
    mae: model.mae || 0,
    rmse: model.rmse || 0,
    r2: model.r2 || 0,
    predictions: Array.from({length: 24}).map((_,h) => ({ hour: h, value: Math.random() * 100 }))
  }));
};
