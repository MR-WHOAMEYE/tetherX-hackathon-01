import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '../api'

export default function TreatmentOutcomes() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [outcomes, setOutcomes] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients) }, [])

    const predict = async () => {
        if (!selected) return
        setLoading(true)
        try { const r = await api.getOutcomes(selected); setOutcomes(r) }
        finally { setLoading(false) }
    }

    const getColor = (p) => p > 75 ? '#10B981' : p > 50 ? '#3B82F6' : p > 30 ? '#F59E0B' : '#EF4444'

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><BarChart3 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Treatment Outcome Predictor</h1>
                <p>Predict success probability and recovery timelines for different treatment options using clinical data analysis.</p></div>

            <div className="card mb-24" style={{ padding: '16px 20px' }}>
                <div className="flex gap-16 items-center">
                    <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                        <option value="">Select a patient...</option>
                        {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={predict} disabled={loading || !selected}>{loading ? 'Predicting...' : '📊 Predict Outcomes'}</button>
                </div>
            </div>

            {outcomes.length > 0 && (
                <div className="animate-in">
                    <div className="grid-2 mb-24">
                        <div className="card">
                            <div className="card-header"><div className="card-title"><BarChart3 size={20} /><h3>Recovery Probability</h3></div></div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={outcomes} margin={{ left: 0, right: 20 }}>
                                    <XAxis dataKey="treatment_name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={80} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                                    <Bar dataKey="recovery_probability" radius={[6, 6, 0, 0]} barSize={40}>
                                        {outcomes.map((o, i) => <Cell key={i} fill={getColor(o.recovery_probability)} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <div className="card-header"><div className="card-title"><TrendingUp size={20} /><h3>Treatment Comparison</h3></div></div>
                            {outcomes.map((o, i) => (
                                <div key={i} className={`mb-16 animate-in stagger-${i + 1}`} style={{ padding: '16px 20px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${getColor(o.recovery_probability)}` }}>
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="font-semibold">{o.treatment_name}</span>
                                        <span className="font-display font-bold" style={{ fontSize: '1.2rem', color: getColor(o.recovery_probability) }}>{o.recovery_probability}%</span>
                                    </div>
                                    <div className="progress-bar mb-8"><div className="progress-bar-fill" style={{ width: `${o.recovery_probability}%`, background: getColor(o.recovery_probability) }} /></div>
                                    <div className="flex gap-20 text-xs text-muted">
                                        <span>Recovery: {o.time_to_recovery}</span>
                                        <span>Side effects: {o.side_effects_risk}%</span>
                                        <span className={`badge badge-${o.confidence_level === 'High' ? 'success' : o.confidence_level === 'Moderate' ? 'primary' : 'warning'}`} style={{ fontSize: '0.68rem' }}>{o.confidence_level}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
