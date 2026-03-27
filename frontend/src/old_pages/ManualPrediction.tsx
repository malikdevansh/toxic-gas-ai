import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function ManualPrediction() {
    const [inputs, setInputs] = useState({ co: 10.5, no2: 45.0, temperature: 25.0, humidity: 60.0 });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/predict', inputs);
            setResult(res.data);
        } catch (error) {
            console.error("Prediction failed", error);
        }
        setLoading(false);
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Manual Prediction Terminal</h1>
                <p className="text-gray-400">Inject custom environmental parameters into the Random Forest classification layer.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 border border-[#1e293b]">
                    <form onSubmit={handlePredict} className="space-y-6">
                        {Object.entries(inputs).map(([key, val]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-400 capitalize mb-2">{key}</label>
                                <input
                                    type="number" step="0.1"
                                    value={val}
                                    onChange={(e) => setInputs(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                                    className="w-full bg-[#0a0f18] border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-saas-cyan focus:ring-1 focus:ring-saas-cyan transition-colors"
                                />
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="w-full bg-saas-cyan text-[#0a0f18] font-bold py-4 rounded-lg hover:bg-[#00e5b3]/90 transition shadow-[0_0_20px_rgba(0,229,179,0.3)] flex items-center justify-center gap-2">
                            {loading ? <Cpu className="animate-spin w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                            Execute Deep Scan
                        </button>
                    </form>
                </div>

                <div className="flex flex-col gap-6">
                    {result ? (
                        <div className={`glass-card p-8 border relative overflow-hidden ${result.prediction === 1 ? 'border-red-500/50' : 'border-saas-cyan/50'}`}>
                            <div className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 blur-[100px] rounded-full ${result.prediction === 1 ? 'bg-red-500/20' : 'bg-saas-cyan/20'}`} />

                            <h3 className="text-gray-400 font-medium tracking-widest uppercase text-sm mb-6">Model Output</h3>

                            <div className="flex items-center gap-6 mb-8">
                                <div className={`p-4 rounded-2xl ${result.prediction === 1 ? 'bg-red-500/10 text-red-500' : 'bg-saas-cyan/10 text-saas-cyan'}`}>
                                    {result.prediction === 1 ? <ShieldAlert className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                                </div>
                                <div>
                                    <p className="text-4xl font-bold tracking-tight text-white mb-1">{result.category}</p>
                                    <p className="text-gray-400 text-sm">Classification Result</p>
                                </div>
                            </div>

                            {/* Linear Gauge */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Safety Threshold</span>
                                    <span className="font-bold text-white">{(result.probability * 100).toFixed(1)}% Confidence</span>
                                </div>
                                <div className="h-3 w-full bg-[#0f172a] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full opacity-80 ${result.prediction === 1 ? 'bg-gradient-to-r from-yellow-500 to-red-500' : 'bg-gradient-to-r from-saas-blue to-saas-cyan'}`}
                                        style={{ width: `${result.probability * 100}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-8 border border-[#1e293b] flex flex-col items-center justify-center text-center h-full opacity-50">
                            <Cpu className="w-12 h-12 text-gray-500 mb-4" />
                            <p className="text-gray-400">Awaiting parameter injection.<br />Initiate scan to compute risk vector.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
