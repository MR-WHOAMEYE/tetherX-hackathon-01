import { useState, useEffect } from 'react'
import { Stethoscope, Users, AlertTriangle, Activity, Bot, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { api } from '../api'

export default function DoctorDashboard() {
    const [metrics, setMetrics] = useState(null)
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.getMetrics(), api.getPatients('critical', null, 10)])
            .then(([m, p]) => { setMetrics(m); setPatients(p) })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    const statusData = metrics?.status_distribution
        ? Object.entries(metrics.status_distribution).map(([k, v]) => ({ name: k, value: v }))
        : []
    const colors = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981']

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <h1><Stethoscope size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Doctor Dashboard</h1>
                <p>Your clinical overview. Monitor assigned patients, review critical cases, and access AI-powered diagnostic tools.</p>
            </div>

            <div className="grid-4 mb-24">
                {[
                    { icon: Users, value: metrics?.active_patients, label: 'My Patients', color: '#0A5EB5', bg: '#EBF4FF' },
                    { icon: AlertTriangle, value: metrics?.critical_patients, label: 'Critical', color: '#EF4444', bg: '#FEE2E2' },
                    { icon: Activity, value: metrics?.critical_labs, label: 'Critical Labs', color: '#F59E0B', bg: '#FEF3C7' },
                    { icon: Bot, value: '24/7', label: 'AI Copilot', color: '#7C3AED', bg: '#F3E8FF' },
                ].map((k, i) => {
                    const Icon = k.icon; return (
                        <div key={i} className={`stat-card animate-in stagger-${i + 1}`}>
                            <div className="stat-icon" style={{ background: k.bg, color: k.color }}><Icon size={22} /></div>
                            <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
                            <div className="stat-label">{k.label}</div>
                        </div>
                    )
                })}
            </div>

            <div className="grid-2 mb-24">
                <div className="card">
                    <div className="card-header"><div className="card-title"><AlertTriangle size={20} /><h3>Critical Patients</h3></div>
                        <span className="badge badge-danger">{patients.length} patients</span></div>
                    {patients.map((p, i) => (
                        <div key={i} className="flex items-center gap-16 mb-12" style={{ padding: '12px 16px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ flex: 1 }}>
                                <div className="font-semibold">{p.first_name} {p.last_name}</div>
                                <div className="text-xs text-muted">{p.patient_id} · Age {p.age} · Room {p.room_number || '—'}</div>
                            </div>
                            <div className="text-sm text-secondary">{(p.symptoms || []).slice(0, 2).join(', ')}</div>
                        </div>
                    ))}
                    {!patients.length && <p className="text-muted text-sm">No critical patients at this time.</p>}
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title"><TrendingUp size={20} /><h3>Patient Distribution</h3></div></div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke="none">
                            {statusData.map((d, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {statusData.map((d, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length] }} /><span className="text-muted">{d.name}: {d.value}</span></div>))}
                    </div>
                </div>
            </div>
        </div>
    )
}
