import { useState, useEffect } from 'react'
import { Clock, CheckCircle } from 'lucide-react'
import { api } from '../api'

export default function PatientTimeline() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [timeline, setTimeline] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients) }, [])

    const load = async () => {
        if (!selected) return
        setLoading(true)
        try { const r = await api.getTimeline(selected); setTimeline(r) }
        finally { setLoading(false) }
    }

    const stageIcons = { registration: '📋', diagnosis: '🔬', treatment: '💊', monitoring: '📡', lab_result: '🧪', medication: '💉', consultation: '👨‍⚕️', discharge: '🏠' }
    const stageColors = { registration: '#3B82F6', diagnosis: '#7C3AED', treatment: '#10B981', monitoring: '#F59E0B', lab_result: '#06B6D4', medication: '#EC4899', consultation: '#0A5EB5', discharge: '#10B981' }

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><Clock size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Smart Patient Timeline</h1>
                <p>Visual patient lifecycle tracking from registration through discharge. Monitor every milestone in the care journey.</p></div>

            <div className="card mb-24" style={{ padding: '16px 20px' }}>
                <div className="flex gap-16 items-center">
                    <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                        <option value="">Select a patient...</option>
                        {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={load} disabled={loading || !selected}>{loading ? 'Loading...' : '📋 View Timeline'}</button>
                </div>
            </div>

            {timeline && (
                <div className="animate-in">
                    {timeline.current_stage && (
                        <div className="card mb-24">
                            <div className="card-header"><div className="card-title"><CheckCircle size={20} /><h3>Current Stage</h3></div>
                                <span className="badge badge-primary">{timeline.current_stage.label}</span></div>
                            <div className="progress-bar" style={{ height: 12 }}>
                                <div className="progress-bar-fill" style={{ width: `${timeline.current_stage.progress}%`, background: 'linear-gradient(90deg,#3B82F6,#06B6D4)' }} />
                            </div>
                            <div className="flex justify-between mt-8 text-xs text-muted">
                                <span>Registration</span><span>Diagnosis</span><span>Treatment</span><span>Monitoring</span><span>Recovery</span><span>Discharge</span>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="card-header"><div className="card-title"><Clock size={20} /><h3>Timeline Events</h3></div>
                            <span className="badge badge-neutral">{timeline.events?.length || 0} events</span></div>

                        {timeline.events?.map((e, i) => (
                            <div key={i} className="timeline-item animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="timeline-dot" style={{ background: stageColors[e.event_type] || 'var(--primary)' }} />
                                <div style={{ flex: 1 }}>
                                    <div className="flex items-center gap-12 mb-8">
                                        <span style={{ fontSize: '1.2rem' }}>{stageIcons[e.event_type] || '📌'}</span>
                                        <span className="font-semibold">{e.event_title}</span>
                                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{e.stage_label}</span>
                                    </div>
                                    <div className="text-sm text-secondary">{e.event_description}</div>
                                    <div className="text-xs text-muted mt-8">{e.event_date} · {e.created_by}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
