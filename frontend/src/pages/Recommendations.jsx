import { useState, useEffect } from 'react'
import { Lightbulb, Stethoscope, FlaskConical, UserCheck } from 'lucide-react'
import { api } from '../api'

export default function Recommendations() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients) }, [])

    const analyze = async () => {
        if (!selected) return
        setLoading(true)
        try { const r = await api.getPatientRecommendations(selected); setResult(r) }
        finally { setLoading(false) }
    }

    const urgencyBadge = { emergent: 'danger', urgent: 'warning', routine: 'success' }

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><Lightbulb size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Clinical Recommendations</h1>
                <p>Evidence-based treatment guidance. Get personalized treatment plans, diagnostic tests, and specialist referrals based on patient data.</p></div>

            <div className="card mb-24" style={{ padding: '16px 20px' }}>
                <div className="flex gap-16 items-center">
                    <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                        <option value="">Select a patient...</option>
                        {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={analyze} disabled={loading || !selected}>{loading ? 'Loading...' : '💡 Get Recommendations'}</button>
                </div>
            </div>

            {result && (
                <div className="animate-in">
                    <div className="flex items-center gap-12 mb-24">
                        <span className={`badge badge-${urgencyBadge[result.urgency] || 'neutral'}`} style={{ fontSize: '0.82rem', padding: '6px 16px' }}>Urgency: {result.urgency?.toUpperCase()}</span>
                        <span className="text-sm text-muted">Diagnosis: {result.diagnosis || 'Pending'}</span>
                    </div>
                    <div className="grid-3">
                        <div className="card">
                            <div className="card-header"><div className="card-title"><Stethoscope size={20} /><h3>Treatments</h3></div></div>
                            {result.recommended_treatments?.map((t, i) => (
                                <div key={i} className="flex items-center gap-12 mb-8" style={{ padding: '12px 16px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                    <span className="text-sm">{t}</span>
                                </div>
                            ))}
                        </div>
                        <div className="card">
                            <div className="card-header"><div className="card-title"><FlaskConical size={20} /><h3>Diagnostic Tests</h3></div></div>
                            {result.diagnostic_tests?.map((t, i) => (
                                <div key={i} className="flex items-center gap-12 mb-8" style={{ padding: '10px 14px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <FlaskConical size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span className="text-sm">{t}</span>
                                </div>
                            ))}
                        </div>
                        <div className="card">
                            <div className="card-header"><div className="card-title"><UserCheck size={20} /><h3>Specialist Referrals</h3></div></div>
                            {result.specialist_referrals?.length ? result.specialist_referrals.map((s, i) => (
                                <div key={i} className="flex items-center gap-12 mb-8" style={{ padding: '10px 14px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <UserCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                    <span className="text-sm font-semibold">{s}</span>
                                </div>
                            )) : <p className="text-muted text-sm">No specialist referrals needed at this time.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
