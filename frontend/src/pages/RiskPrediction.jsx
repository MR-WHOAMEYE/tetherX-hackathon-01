import { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Activity, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { api } from '../api'

export default function RiskPrediction() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [risk, setRisk] = useState(null)
    const [trend, setTrend] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients) }, [])

    const analyze = async () => {
        if (!selected) return
        setLoading(true)
        try {
            const [r, t] = await Promise.all([api.getRisk(selected), api.getRiskTrend(selected)])
            setRisk(r); setTrend(t)
        } finally { setLoading(false) }
    }

    const riskColor = (v) => v > 70 ? '#EF4444' : v > 50 ? '#EA580C' : v > 30 ? '#CA8A04' : '#10B981'

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><TrendingUp size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Risk Prediction Engine</h1>
                <p>Predictive analytics for patient deterioration, ICU admission probability, and complication risk assessment.</p></div>

            <div className="card mb-24" style={{ padding: '16px 20px' }}>
                <div className="flex gap-16 items-center">
                    <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                        <option value="">Select a patient...</option>
                        {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={analyze} disabled={loading || !selected}>
                        {loading ? 'Analyzing...' : '📈 Predict Risk'}
                    </button>
                </div>
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
                                    <defs><linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                                    <Area type="monotone" dataKey="risk" stroke="#3B82F6" fill="url(#riskGrad)" strokeWidth={2.5} />
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
