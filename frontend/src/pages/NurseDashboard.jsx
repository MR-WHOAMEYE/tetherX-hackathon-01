import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Users, Activity, AlertTriangle, HeartPulse, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

export default function NurseDashboard() {
    const [patients, setPatients] = useState([])
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [vitalsForm, setVitalsForm] = useState({ patient_id: '', heart_rate: 72, oxygen_level: 98, blood_pressure_sys: 120, blood_pressure_dia: 80, temperature: 98.6, respiratory_rate: 16, blood_glucose: 100, weight: 150, recorded_by: '' })
    const [submitting, setSubmitting] = useState(false)
    const [submitMsg, setSubmitMsg] = useState(null)
    const { isConnected, subscribe, liveMetrics } = useWebSocket()

    const fetchData = useCallback(() => {
        Promise.all([api.getPatients(null, null, 50), api.getMetrics()])
            .then(([p, m]) => {
                setPatients(p)
                setMetrics(m)
                setLastUpdated(new Date())
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    // React to server-pushed metrics
    useEffect(() => {
        if (!liveMetrics) return
        setMetrics(liveMetrics.metrics)
        setLastUpdated(new Date())
    }, [liveMetrics])

    // WS subscriptions — refresh on events
    useEffect(() => {
        return subscribe('nurse-dashboard', (msg) => {
            if (msg.type === 'vitals_update' || msg.type === 'alert' || msg.type === 'metrics_update') {
                setTimeout(fetchData, 600)
            }
        })
    }, [subscribe, fetchData])

    // 30-second polling fallback
    useEffect(() => {
        const timer = setInterval(fetchData, 30000)
        return () => clearInterval(timer)
    }, [fetchData])

    const submitVitals = async (e) => {
        e.preventDefault()
        if (!vitalsForm.patient_id) return
        setSubmitting(true)
        setSubmitMsg(null)
        try {
            await api.addVitals(vitalsForm)
            setSubmitMsg({ type: 'success', text: `✅ Vitals recorded for ${vitalsForm.patient_id}` })
            fetchData()
        } catch {
            setSubmitMsg({ type: 'error', text: '❌ Failed to record vitals' })
        } finally {
            setSubmitting(false)
            setTimeout(() => setSubmitMsg(null), 4000)
        }
    }

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    const monitoringPatients = patients.filter(p => p.status === 'monitoring' || p.status === 'critical')

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1><ShieldCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Nurse Dashboard</h1>
                        <p>Patient monitoring hub. Track vitals, manage medication schedules, and update patient statuses in real-time.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <div className={`ws-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                            <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                        </div>
                        {lastUpdated && (
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <RefreshCw size={10} /> {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid-4 mb-24">
                {[
                    { icon: Users, value: metrics?.monitoring_patients, label: 'Monitoring', color: '#FFC400', bg: 'rgba(255, 196, 0, 0.1)' },
                    { icon: AlertTriangle, value: metrics?.critical_patients, label: 'Critical', color: '#FF0A54', bg: 'rgba(255, 10, 84, 0.1)' },
                    { icon: HeartPulse, value: metrics?.active_patients, label: 'Active', color: '#00F0FF', bg: 'rgba(0, 240, 255, 0.1)' },
                    { icon: Activity, value: `${metrics?.bed_occupancy}%`, label: 'Beds Occupied', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
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

            {/* Record Vitals Form */}
            <div className="card mb-24">
                <div className="card-header"><div className="card-title"><HeartPulse size={20} /><h3>Record Patient Vitals</h3></div>
                    {submitMsg && <span className={`badge ${submitMsg.type === 'success' ? 'badge-success' : 'badge-danger'}`}>{submitMsg.text}</span>}
                </div>
                <form onSubmit={submitVitals}>
                    <div className="grid-3 mb-16">
                        <div className="input-group">
                            <label>Patient</label>
                            <select className="select" value={vitalsForm.patient_id} onChange={e => setVitalsForm({ ...vitalsForm, patient_id: e.target.value })} required>
                                <option value="">Select patient...</option>
                                {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name} ({p.patient_id})</option>)}
                            </select>
                        </div>
                        <div className="input-group"><label>Heart Rate (bpm)</label><input className="input" type="number" value={vitalsForm.heart_rate} onChange={e => setVitalsForm({ ...vitalsForm, heart_rate: +e.target.value })} /></div>
                        <div className="input-group"><label>Oxygen Level (%)</label><input className="input" type="number" step="0.1" value={vitalsForm.oxygen_level} onChange={e => setVitalsForm({ ...vitalsForm, oxygen_level: +e.target.value })} /></div>
                    </div>
                    <div className="grid-3 mb-16">
                        <div className="input-group"><label>BP Systolic</label><input className="input" type="number" value={vitalsForm.blood_pressure_sys} onChange={e => setVitalsForm({ ...vitalsForm, blood_pressure_sys: +e.target.value })} /></div>
                        <div className="input-group"><label>BP Diastolic</label><input className="input" type="number" value={vitalsForm.blood_pressure_dia} onChange={e => setVitalsForm({ ...vitalsForm, blood_pressure_dia: +e.target.value })} /></div>
                        <div className="input-group"><label>Temperature (°F)</label><input className="input" type="number" step="0.1" value={vitalsForm.temperature} onChange={e => setVitalsForm({ ...vitalsForm, temperature: +e.target.value })} /></div>
                    </div>
                    <div className="grid-3 mb-16">
                        <div className="input-group"><label>Respiratory Rate (/min)</label><input className="input" type="number" value={vitalsForm.respiratory_rate} onChange={e => setVitalsForm({ ...vitalsForm, respiratory_rate: +e.target.value })} /></div>
                        <div className="input-group"><label>Blood Glucose (mg/dL)</label><input className="input" type="number" step="0.1" value={vitalsForm.blood_glucose} onChange={e => setVitalsForm({ ...vitalsForm, blood_glucose: +e.target.value })} /></div>
                        <div className="input-group"><label>Recorded By</label><input className="input" placeholder="Nurse name" value={vitalsForm.recorded_by} onChange={e => setVitalsForm({ ...vitalsForm, recorded_by: e.target.value })} /></div>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={submitting || !vitalsForm.patient_id}>
                        {submitting ? 'Recording...' : '💉 Record Vitals'}
                    </button>
                </form>
            </div>

            {/* Monitoring Patients Table */}
            <div className="card">
                <div className="card-header"><div className="card-title"><Activity size={20} /><h3>Patients Requiring Monitoring</h3></div>
                    <span className="badge badge-warning">{monitoringPatients.length} patients</span>
                </div>
                {monitoringPatients.length ? (
                    <div className="table-container" style={{ border: 'none' }}>
                        <table><thead><tr><th>Patient</th><th>ID</th><th>Age</th><th>Room</th><th>Symptoms</th><th>Doctor</th><th>Status</th></tr></thead>
                            <tbody>{monitoringPatients.map((p, i) => (
                                <tr key={i}>
                                    <td className="font-semibold">{p.first_name} {p.last_name}</td>
                                    <td><code style={{ fontSize: '0.78rem', background: 'var(--border-light)', padding: '2px 6px', borderRadius: 4 }}>{p.patient_id}</code></td>
                                    <td>{p.age}</td><td>{p.room_number || '—'}</td>
                                    <td className="text-sm text-muted">{(p.symptoms || []).slice(0, 2).join(', ') || '—'}</td>
                                    <td className="text-sm">{p.assigned_doctor || '—'}</td>
                                    <td><span className={`badge badge-${p.status === 'critical' ? 'danger' : 'warning'}`}>{p.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : <p className="text-muted text-sm">No patients currently requiring active monitoring.</p>}
            </div>
        </div>
    )
}
