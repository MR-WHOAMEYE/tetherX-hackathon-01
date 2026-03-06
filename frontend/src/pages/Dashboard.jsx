import { useState, useEffect, useCallback } from 'react'
import { Users, AlertTriangle, Activity, Clock, Stethoscope, TrendingUp, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

const COLORS = { active: '#3B82F6', monitoring: '#F59E0B', critical: '#EF4444', discharged: '#10B981' }

export default function Dashboard({ user }) {
    const [metrics, setMetrics] = useState(null)
    const [statusDist, setStatusDist] = useState({})
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const { isConnected, subscribe, liveMetrics } = useWebSocket()

    const fetchData = useCallback(() => {
        Promise.all([api.getMetrics(), api.getStatusDistribution(), api.getPatients(null, null, 8)])
            .then(([m, s, p]) => {
                setMetrics(m)
                setStatusDist(s)
                setPatients(p)
                setLastUpdated(new Date())
            })
            .finally(() => setLoading(false))
    }, [])

    // Initial load
    useEffect(() => { fetchData() }, [fetchData])

    // React to live metrics broadcast from server (every 30s)
    useEffect(() => {
        if (!liveMetrics) return
        setMetrics(liveMetrics.metrics)
        setStatusDist(liveMetrics.status_distribution || {})
        setLastUpdated(new Date())
    }, [liveMetrics])

    // WebSocket event subscription — refresh on vitals/alert events
    useEffect(() => {
        return subscribe('dashboard', (msg) => {
            if (msg.type === 'vitals_update' || msg.type === 'alert' || msg.type === 'metrics_update') {
                setTimeout(fetchData, 600)
            }
        })
    }, [subscribe, fetchData])

    // Polling fallback every 30 seconds
    useEffect(() => {
        const timer = setInterval(fetchData, 30000)
        return () => clearInterval(timer)
    }, [fetchData])

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Loading dashboard...</span></div>

    const pieData = Object.entries(statusDist).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: COLORS[k] || '#94A3B8' }))

    const docLoad = metrics?.doctor_workload
        ? Object.entries(metrics.doctor_workload).map(([name, count]) => ({ name: name.replace('Dr. ', ''), count }))
        : []

    return (
        <div className="animate-in">
            {/* Hero Banner */}
            <div className="hero-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Welcome back, {user.full_name}</h1>
                        <p>AI-powered clinical intelligence at your fingertips. Monitor patients, analyze risks, and make data-driven decisions.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <div className={`ws-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                            <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                        </div>
                        {lastUpdated && (
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <RefreshCw size={10} />
                                {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
                {metrics && (
                    <div className="hero-stats">
                        <div className="hero-stat"><div className="hero-stat-value">{metrics.total_patients}</div><div className="hero-stat-label">Total Patients</div></div>
                        <div className="hero-stat"><div className="hero-stat-value">{metrics.critical_patients}</div><div className="hero-stat-label">Critical Cases</div></div>
                        <div className="hero-stat"><div className="hero-stat-value">{metrics.bed_occupancy}%</div><div className="hero-stat-label">Bed Occupancy</div></div>
                        <div className="hero-stat"><div className="hero-stat-value">{metrics.staff_available}</div><div className="hero-stat-label">Staff On Duty</div></div>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid-4 mb-24">
                {[
                    { icon: Users, value: metrics?.active_patients, label: 'Active Patients', color: '#0A5EB5', bg: '#EBF4FF' },
                    { icon: AlertTriangle, value: metrics?.critical_patients, label: 'Critical Alerts', color: '#EF4444', bg: '#FEE2E2' },
                    { icon: Activity, value: `${metrics?.icu_capacity}%`, label: 'ICU Capacity', color: '#7C3AED', bg: '#F3E8FF' },
                    { icon: Clock, value: `${metrics?.avg_wait_time}m`, label: 'Avg Wait Time', color: '#059669', bg: '#D1FAE5' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon
                    return (
                        <div key={i} className={`stat-card animate-in stagger-${i + 1}`}>
                            <div className="stat-icon" style={{ background: kpi.bg, color: kpi.color }}><Icon size={22} /></div>
                            <div className="stat-value" style={{ color: kpi.color }}>{kpi.value}</div>
                            <div className="stat-label">{kpi.label}</div>
                        </div>
                    )
                })}
            </div>

            {/* Charts */}
            <div className="grid-2 mb-24">
                <div className="card">
                    <div className="card-header"><div className="card-title"><Activity size={20} /><h3>Patient Distribution</h3></div></div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" stroke="none">
                                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                        {pieData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                                <span style={{ color: '#64748B' }}>{d.name}: {d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title"><Stethoscope size={20} /><h3>Doctor Workload</h3></div></div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={docLoad} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13, fill: '#475569' }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                            <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Patients */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title"><Users size={20} /><h3>Recent Patients</h3></div>
                    <span className="badge badge-primary">{patients.length} shown</span>
                </div>
                <div className="grid-4">
                    {patients.slice(0, 8).map((p, i) => {
                        const statusMap = { active: 'primary', critical: 'danger', monitoring: 'warning', discharged: 'success' }
                        return (
                            <div key={i} className={`patient-card animate-in stagger-${(i % 4) + 1}`}>
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <div className="font-semibold">{p.first_name} {p.last_name}</div>
                                        <div className="text-xs text-muted">{p.patient_id} · Age {p.age}</div>
                                    </div>
                                    <span className={`badge badge-${statusMap[p.status] || 'neutral'}`}>{p.status}</span>
                                </div>
                                <div className="text-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Stethoscope size={14} style={{ color: 'var(--primary)' }} />
                                    {(p.symptoms || []).slice(0, 2).join(', ') || 'No symptoms'}
                                </div>
                                <div className="text-xs text-muted mt-8" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <TrendingUp size={12} /> {p.assigned_doctor || 'Unassigned'}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
