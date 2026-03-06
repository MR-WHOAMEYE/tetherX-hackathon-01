import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, AlertTriangle, Activity, Clock, Wifi, WifiOff } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

export default function RiskPrediction() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [risk, setRisk] = useState(null)
    const [trend, setTrend] = useState([])
    const [loading, setLoading] = useState(false)
    const [autoRefreshed, setAutoRefreshed] = useState(false)
    const { isConnected, subscribe } = useWebSocket()

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients) }, [])

    const analyze = useCallback(async (silent = false) => {
        if (!selected) return
        if (!silent) setLoading(true)
        try {
            const [r, t] = await Promise.all([api.getRisk(selected), api.getRiskTrend(selected)])
            setRisk(r); setTrend(t)
            if (silent) { setAutoRefreshed(true); setTimeout(() => setAutoRefreshed(false), 2500) }
        } finally { if (!silent) setLoading(false) }
    }, [selected])

    // Auto-refresh when vitals update for the selected patient
    useEffect(() => {
        return subscribe('risk-prediction', (msg) => {
            if (msg.type === 'vitals_update' && msg.data?.patient_id === selected && selected) {
                setTimeout(() => analyze(true), 1000)
            }
        })
    }, [subscribe, selected, analyze])

    const riskColor = (v) => v > 70 ? '#FF0A54' : v > 50 ? '#EA580C' : v > 30 ? '#CA8A04' : '#00FF9D'

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1><TrendingUp size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Risk Prediction Engine</h1>
                        <p>Predictive analytics for patient deterioration, ICU admission probability, and complication risk assessment.</p>
                    </div>
                    <div className={`ws-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                </div>
            </div>

            <div className="card mb-24" style={{ padding: '16px 20px' }}>
                <div className="flex gap-16 items-center">
                    <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                        <option value="">Select a patient...</option>
                        {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => analyze(false)} disabled={loading || !selected}>
                        {loading ? 'Analyzing...' : '📈 Predict Risk'}
                    </button>
                    {autoRefreshed && <span className="badge badge-success" style={{ animation: 'fadeIn 0.3s ease' }}>⚡ Auto-updated</span>}
                </div>
                {isConnected && selected && (
                    <div className="text-xs text-muted mt-8" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF9D', display: 'inline-block' }} />
                        Risk score will auto-update when new vitals are recorded for this patient
                    </div>
                )}
            </div>

            {risk && (
                <div className="animate-in">
                    <div className="grid-4 mb-24">
                        {[
                            { label: 'Deterioration Risk', value: `${risk.deterioration_risk}%`, color: riskColor(risk.deterioration_risk) },
                            { label: 'ICU Admission Risk', value: `${risk.icu_risk}%`, color: riskColor(risk.icu_risk) },
                            { label: 'Complication Risk', value: `${risk.complication_risk}%`, color: riskColor(risk.complication_risk) },
                            { label: 'Monitoring Freq', value: risk.monitoring_frequency, color: 'var(--primary)' },
                        ].map((r, i) => (
                            <div key={i} className={`stat-card animate-in stagger-${i + 1}`}>
                                <div className="stat-icon" style={{ background: i < 3 ? `${r.color}15` : 'var(--primary-bg)', color: r.color }}>{i < 3 ? <AlertTriangle size={22} /> : <Clock size={22} />}</div>
                                <div className="stat-value" style={{ color: r.color, fontSize: i === 3 ? '1.1rem' : '1.85rem' }}>{r.value}</div>
                                <div className="stat-label">{r.label}</div>
                                {i < 3 && <div className="progress-bar mt-8"><div className="progress-bar-fill" style={{ width: `${parseFloat(r.value)}%`, background: r.color }} /></div>}
                            </div>
                        ))}
                    </div>

                    <div className="grid-2">
                        <div className="card">
                            <div className="card-header"><div className="card-title"><Activity size={20} /><h3>Risk Trend (7 Days)</h3></div></div>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={trend}>
                                    <defs><linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2} /><stop offset="95%" stopColor="#00F0FF" stopOpacity={0} /></linearGradient></defs>
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                                    <Area type="monotone" dataKey="risk" stroke="#00F0FF" fill="url(#riskGrad)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <div className="card-header"><div className="card-title"><AlertTriangle size={20} /><h3>Risk Factors</h3></div>
                                <span className={`badge badge-${risk.risk_level === 'Critical' ? 'danger' : risk.risk_level === 'High' ? 'warning' : 'success'}`}>{risk.risk_level}</span></div>
                            {risk.risk_factors?.length ? risk.risk_factors.map((f, i) => (
                                <div key={i} className="flex items-center gap-12 mb-8" style={{ padding: '10px 14px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                                    <span className="text-sm">{f}</span>
                                </div>
                            )) : <p className="text-muted text-sm">No significant risk factors identified.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
