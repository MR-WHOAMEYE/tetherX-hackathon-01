import { useState, useEffect } from 'react'
import { FileText, Users, Download, BarChart3 } from 'lucide-react'
import { api } from '../api'

export default function Reports() {
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { api.getMetrics().then(m => { setMetrics(m); setLoading(false) }) }, [])

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    const reports = [
        { title: 'Patient Census Report', desc: 'Current patient counts by status, department, and acuity level.', type: 'Operations', date: '2026-03-06' },
        { title: 'Clinical Outcomes Report', desc: 'Treatment outcomes, recovery rates, and quality metrics.', type: 'Clinical', date: '2026-03-05' },
        { title: 'Department Performance', desc: 'Departmental capacity, staffing, and patient throughput analysis.', type: 'Admin', date: '2026-03-04' },
        { title: 'Risk Assessment Summary', desc: 'Aggregate patient risk scores and deterioration trends.', type: 'Clinical', date: '2026-03-03' },
        { title: 'Medication Safety Report', desc: 'Drug interaction alerts, medication errors, and safety metrics.', type: 'Pharmacy', date: '2026-03-02' },
        { title: 'Financial Overview', desc: 'Revenue, costs, insurance claims, and billing analytics.', type: 'Finance', date: '2026-03-01' },
    ]

    const typeColors = { Operations: 'primary', Clinical: 'success', Admin: 'purple', Pharmacy: 'warning', Finance: 'neutral' }

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Reports</h1>
                <p>Generate and download comprehensive reports across clinical operations, patient outcomes, and hospital performance.</p></div>

            <div className="grid-3 mb-24">
                <div className="stat-card animate-in stagger-1"><div className="stat-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF' }}><FileText size={22} /></div>
                    <div className="stat-value">6</div><div className="stat-label">Available Reports</div></div>
                <div className="stat-card animate-in stagger-2"><div className="stat-icon" style={{ background: 'rgba(0, 255, 157, 0.1)', color: '#00FF9D' }}><BarChart3 size={22} /></div>
                    <div className="stat-value">{metrics?.total_patients}</div><div className="stat-label">Patients Covered</div></div>
                <div className="stat-card animate-in stagger-3"><div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}><Download size={22} /></div>
                    <div className="stat-value">PDF</div><div className="stat-label">Export Format</div></div>
            </div>

            <div className="card">
                <div className="card-header"><div className="card-title"><FileText size={20} /><h3>Report Library</h3></div></div>
                {reports.map((r, i) => (
                    <div key={i} className={`flex items-center gap-20 mb-12 animate-in stagger-${(i % 4) + 1}`}
                        style={{ padding: '18px 22px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)', transition: 'var(--transition)', cursor: 'pointer' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={20} /></div>
                        <div style={{ flex: 1 }}>
                            <div className="font-semibold">{r.title}</div>
                            <div className="text-sm text-muted mt-8">{r.desc}</div>
                        </div>
                        <span className={`badge badge-${typeColors[r.type] || 'neutral'}`}>{r.type}</span>
                        <span className="text-xs text-muted">{r.date}</span>
                        <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
                    </div>
                ))}
            </div>
        </div>
    )
}
