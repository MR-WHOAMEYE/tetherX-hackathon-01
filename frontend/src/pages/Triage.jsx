import { useState, useEffect } from 'react'
import { HeartPulse, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { api } from '../api'

export default function Triage() {
    const [triageData, setTriageData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { api.triageAll().then(d => { setTriageData(d); setLoading(false) }) }, [])

    const priorityConfig = {
        Critical: { color: '#EF4444', bg: '#FEE2E2', badge: 'danger', icon: '🔴' },
        High: { color: '#EA580C', bg: '#FFF7ED', badge: 'warning', icon: '🟠' },
        Medium: { color: '#CA8A04', bg: '#FEFCE8', badge: 'warning', icon: '🟡' },
        Low: { color: '#16A34A', bg: '#F0FDF4', badge: 'success', icon: '🟢' },
    }

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Calculating triage scores...</span></div>

    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    triageData.forEach(p => { if (counts[p.priority_level] !== undefined) counts[p.priority_level]++ })

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><HeartPulse size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Intelligent Triage System</h1>
                <p>AI-driven patient severity scoring and prioritization. Patients are ranked by clinical urgency for optimal resource allocation.</p></div>

            <div className="grid-4 mb-24">
                {Object.entries(counts).map(([level, count], i) => {
                    const cfg = priorityConfig[level]
                    return (
                        <div key={level} className={`stat-card animate-in stagger-${i + 1}`}>
                            <div className="stat-icon" style={{ background: cfg.bg, color: cfg.color }}><AlertTriangle size={22} /></div>
                            <div className="stat-value" style={{ color: cfg.color }}>{count}</div>
                            <div className="stat-label">{level} Priority</div>
                        </div>
                    )
                })}
            </div>

            <div className="card">
                <div className="card-header"><div className="card-title"><Activity size={20} /><h3>Patient Triage Queue</h3></div>
                    <span className="badge badge-primary">{triageData.length} patients</span></div>

                {triageData.slice(0, 30).map((p, i) => {
                    const cfg = priorityConfig[p.priority_level] || priorityConfig.Low
                    return (
                        <div key={i} className={`animate-in stagger-${(i % 4) + 1}`} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', borderBottom: '1px solid var(--border-light)', transition: 'var(--transition)' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: cfg.color }}>{p.severity_score}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="flex items-center gap-8">
                                    <span className="font-semibold">{p.first_name} {p.last_name}</span>
                                    <span className={`badge badge-${cfg.badge}`}>{p.priority_level}</span>
                                </div>
                                <div className="text-xs text-muted mt-8">{p.patient_id} · Age {p.age} · {p.gender}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="progress-bar" style={{ width: 200 }}>
                                    <div className="progress-bar-fill" style={{ width: `${p.severity_score}%`, background: cfg.color }} />
                                </div>
                                <div className="text-xs text-muted mt-8">Score: {p.severity_score}/100</div>
                            </div>
                            <div className="text-sm text-secondary" style={{ maxWidth: 280 }}>{p.suggested_action}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
