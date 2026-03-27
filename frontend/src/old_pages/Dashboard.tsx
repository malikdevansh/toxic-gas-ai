import { useEffect, useState } from 'react';
import KPICards from '../components/KPICards';
import RealTimeECG from '../components/RealTimeECG';
import AlertSystem from '../components/AlertSystem';
import axios from 'axios';

export default function Dashboard() {
    const [data, setData] = useState({ co: 0, no2: 0, aqi: 1, risk: 'Safe' });

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // Mock coordinates for NY as default global overview
                const res = await axios.get('http://localhost:8000/pollution?lat=40.71&lon=-74.00');
                if (res.data.list) {
                    const c = res.data.list[0].components;
                    setData(p => ({ ...p, co: c.co, no2: c.no2, aqi: res.data.list[0].main.aqi, risk: c.co > 200 ? 'Hazardous' : 'Safe' }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchInitial();
    }, []);

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Global Command Center</h1>
                <p className="text-gray-400">Real-time aggregate telemetry from all active sensor nodes.</p>
            </header>

            <AlertSystem co={data.co} no2={data.no2} />
            <KPICards data={data} />

            <div className="mt-8 glass-card p-6 h-[400px] flex flex-col border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Continuous Live Stream</h2>
                        <p className="text-sm text-gray-500 mt-1">Direct endpoint ingestion from <code>/ws/ecg</code> websocket protocol.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saas-cyan opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-saas-cyan"></span>
                        </span>
                        <span className="text-xs font-mono text-saas-cyan uppercase tracking-wider">Live</span>
                    </div>
                </div>

                <div className="flex-1 bg-[#0a0f18]/50 rounded-xl relative overflow-hidden backdrop-blur-sm border border-white/5">
                    <RealTimeECG onLatestData={(latest: any) => setData(p => ({ ...p, co: latest.CO, no2: latest.NO2 }))} />
                </div>
            </div>
        </div>
    );
}
