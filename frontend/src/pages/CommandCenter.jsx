import { useState, useEffect } from 'react'
import {
    Users, AlertTriangle, Activity, Stethoscope,
    Building2, Clock, Siren, TrendingUp, Wifi, WifiOff
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'
import LiveEventStream from '../components/LiveEventStream'
import PatientPriorityQueue from '../components/PatientPriorityQueue'
import AIInsightsPanel from '../components/AIInsightsPanel'
import StaffActivityFeed from '../components/StaffActivityFeed'
import WorkloadAnalysis from '../components/WorkloadAnalysis'

const STAT_CONFIG = [
    { key: 'active_patients', label: 'Active Patients', icon: Users, color: 'var(--primary)', bg: 'var(--primary-bg)' },
    { key: 'critical_cases', label: 'Critical Cases', icon: AlertTriangle, color: 'var(--danger)', bg: 'var(--danger-bg)' },
    { key: 'icu_occupancy', label: 'ICU Occupancy', icon: Building2, color: 'var(--purple)', bg: 'var(--purple-bg)' },
    { key: 'active_doctors', label: 'Active Doctors', icon: Stethoscope, color: 'var(--success)', bg: 'var(--success-bg)' },
    { key: 'active_alerts', label: 'Active Alerts', icon: Siren, color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { key: 'avg_wait_minutes', label: 'Avg Wait (min)', icon: Clock, color: 'var(--accent)', bg: 'var(--accent-bg)' },
]

const PIE_COLORS = ['#0A5EB5', '#EF4444', '#F59E0B', '#10B981', '#7C3AED']

export default function CommandCenter() {
    const [metrics, setMetrics] = useState({})
    const [statusDist, setStatusDist] = useState([])
    const [workload, setWorkload] = useState([])
    const [loading, setLoading] = useState(true)
    const { isConnected, subscribe } = useWebSocket()

    const fetchData = () => {
        Promise.all([
            api.getCommandCenterMetrics(),
            api.getStatusDistribution(),
            api.getWorkload(),
        ]).then(([m, s, w]) => {
            setMetrics(m)
            setStatusDist(Object.entries(s).map(([name, value]) => ({ name, value })))
            setWorkload(w)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    // Auto-refresh on WebSocket events
    useEffect(() => {
        return subscribe('command-center', (msg) => {
            if (msg.type === 'vitals_update' || msg.type === 'alert') {
                setTimeout(fetchData, 500)
            }
        })
    }, [subscribe])

    if (loading) return <div className="loading-pulse" style={{ padding: 40 }}>Initializing Command Center...</div>

    return (
        <div className="command-center">
            {/* Header */}
            <div className="hero-banner" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Hospital Command Center</h1>
                        <p>Real-time operational intelligence and monitoring dashboard</p>
                    </div>
                    <div className={`ws-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                </div>
                <div className="hero-stats">
                    {STAT_CONFIG.slice(0, 4).map(s => (
                        <div key={s.key} className="hero-stat">
                            <div className="hero-stat-value">{metrics[s.key] ?? 0}</div>
                            <div className="hero-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid-6" style={{ marginBottom: 24 }}>
                {STAT_CONFIG.map(s => {
                    const Icon = s.icon
                    return (
                        <div key={s.key} className="stat-card">
                            <div className="stat-icon" style={{ background: s.bg }}>
                                <Icon size={22} style={{ color: s.color }} />
                            </div>
                            <div className="stat-value">{metrics[s.key] ?? 0}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    )
                })}
            </div>

            {/* Main Grid */}
            <div className="cc-grid">
                {/* Left column: Events + Priority Queue */}
                <div className="cc-left">
                    <LiveEventStream maxEvents={15} />
                    <PatientPriorityQueue />
                </div>

                {/* Right column: AI Insights + Staff Activity */}
                <div className="cc-right">
                    <AIInsightsPanel />
                    <StaffActivityFeed limit={10} />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginTop: 24 }}>
                {/* Patient Distribution */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <TrendingUp size={20} />
                            <h3>Patient Distribution</h3>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={statusDist} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Doctor Workload Chart */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <Stethoscope size={20} />
                            <h3>Doctor Workload</h3>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={workload}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="assigned_doctor" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="active_patients" name="Active" fill="#0A5EB5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="critical_patients" name="Critical" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="monitoring_patients" name="Monitoring" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Workload Analysis */}
            <div style={{ marginTop: 24 }}>
                <WorkloadAnalysis />
            </div>
        </div>
    )
}
