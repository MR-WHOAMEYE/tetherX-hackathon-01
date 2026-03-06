import { useState, useEffect } from 'react'
import { HeartPulse, Thermometer, Wind, Droplets } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

const VITAL_CHARTS = [
    { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', color: '#FF0A54', icon: HeartPulse, min: 50, max: 120, refLines: [{ y: 60, label: 'Low' }, { y: 100, label: 'High' }] },
    { key: 'oxygen_level', label: 'Oxygen Level', unit: '%', color: '#00F0FF', icon: Droplets, min: 85, max: 100, refLines: [{ y: 90, label: 'Critical' }, { y: 95, label: 'Low' }] },
    { key: 'blood_pressure_sys', label: 'Blood Pressure (Sys)', unit: 'mmHg', color: '#8B5CF6', icon: HeartPulse, min: 70, max: 200, refLines: [{ y: 90, label: 'Low' }, { y: 140, label: 'High' }] },
    { key: 'respiratory_rate', label: 'Respiratory Rate', unit: '/min', color: '#00FF9D', icon: Wind, min: 5, max: 35, refLines: [{ y: 12, label: 'Low' }, { y: 24, label: 'High' }] },
]

export default function LiveVitalMonitor() {
    const [patients, setPatients] = useState([])
    const [selectedPatient, setSelectedPatient] = useState('')
    const [trendData, setTrendData] = useState([])
    const [liveVitals, setLiveVitals] = useState(null)
    const [loading, setLoading] = useState(true)
    const { subscribe } = useWebSocket()

    // Load patients
    useEffect(() => {
        api.getPatients('', '', 100).then(data => {
            setPatients(data)
            if (data.length > 0) setSelectedPatient(data[0].patient_id)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    // Load vitals when patient selected
    useEffect(() => {
        if (!selectedPatient) return
        Promise.all([
            api.getVitalsTrend(selectedPatient, 30),
            api.getLiveVitals(selectedPatient).catch(() => null)
        ]).then(([trend, live]) => {
            setTrendData(trend.map((v, i) => ({ ...v, index: i })))
            setLiveVitals(live)
        })
    }, [selectedPatient])

    // WebSocket updates
    useEffect(() => {
        return subscribe('live-vitals', (msg) => {
            if (msg.type === 'vitals_update' && msg.data?.patient_id === selectedPatient) {
                const newVitals = msg.data.vitals
                setLiveVitals(newVitals)
                setTrendData(prev => [...prev, { ...newVitals, index: prev.length }].slice(-30))
            }
        })
    }, [subscribe, selectedPatient])

    return (
        <div>
            <div className="hero-banner" style={{ marginBottom: 24 }}>
                <h1>Live Vital Monitoring</h1>
                <p>Real-time patient vital signs with threshold alerts</p>
            </div>

            {/* Patient Selector */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <label style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Select Patient:</label>
                    <select className="select" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} style={{ maxWidth: 400 }}>
                        {patients.map(p => (
                            <option key={p.patient_id} value={p.patient_id}>
                                {p.first_name} {p.last_name} ({p.patient_id}) — {p.status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Current Vitals Summary */}
                {liveVitals && (
                    <div className="grid-4" style={{ marginTop: 16 }}>
                        {VITAL_CHARTS.map(v => {
                            const Icon = v.icon
                            const val = liveVitals[v.key]
                            const isAbnormal = v.refLines.some(r => {
                                if (r.label === 'Low' || r.label === 'Critical') return val < r.y
                                if (r.label === 'High') return val > r.y
                                return false
                            })
                            return (
                                <div key={v.key} className="stat-card" style={{ borderLeft: `3px solid ${isAbnormal ? 'var(--danger)' : v.color}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <Icon size={18} style={{ color: v.color }} />
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{v.label}</span>
                                    </div>
                                    <div className="stat-value" style={{ color: isAbnormal ? 'var(--danger)' : 'var(--text-primary)' }}>
                                        {val ?? '—'} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>{v.unit}</span>
                                    </div>
                                    {isAbnormal && <div className="stat-delta negative" style={{ fontSize: '0.72rem' }}>⚠ Abnormal</div>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Vital Charts */}
            <div className="grid-2">
                {VITAL_CHARTS.map(v => (
                    <div key={v.key} className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <v.icon size={18} style={{ color: v.color }} />
                                <h3>{v.label} Trend</h3>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.unit}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                                <YAxis domain={[v.min, v.max]} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                {v.refLines.map((ref, i) => (
                                    <ReferenceLine key={i} y={ref.y} stroke="#FF0A54" strokeDasharray="5 5" label={{ value: ref.label, position: 'right', fontSize: 10 }} />
                                ))}
                                <Line type="monotone" dataKey={v.key} stroke={v.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </div>
    )
}
