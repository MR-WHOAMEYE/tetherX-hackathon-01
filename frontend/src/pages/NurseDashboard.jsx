import { useState, useEffect } from 'react'
import { ShieldCheck, Users, Activity, AlertTriangle, HeartPulse } from 'lucide-react'
import { api } from '../api'

export default function NurseDashboard() {
    const [patients, setPatients] = useState([])
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.getPatients('monitoring', null, 20), api.getMetrics()])
            .then(([p, m]) => { setPatients(p); setMetrics(m) })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <h1><ShieldCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Nurse Dashboard</h1>
                <p>Patient monitoring hub. Track vitals, manage medication schedules, and update patient statuses in real-time.</p>
            </div>

            <div className="grid-4 mb-24">
                {[
                    { icon: Users, value: metrics?.monitoring_patients, label: 'Monitoring', color: '#F59E0B', bg: '#FEF3C7' },
                    { icon: AlertTriangle, value: metrics?.critical_patients, label: 'Critical', color: '#EF4444', bg: '#FEE2E2' },
                    { icon: HeartPulse, value: metrics?.active_patients, label: 'Active', color: '#0A5EB5', bg: '#EBF4FF' },
                    { icon: Activity, value: `${metrics?.bed_occupancy}%`, label: 'Beds Occupied', color: '#7C3AED', bg: '#F3E8FF' },
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

            <div className="card">
                <div className="card-header"><div className="card-title"><Activity size={20} /><h3>Patients Requiring Monitoring</h3></div></div>
                {patients.length ? (
                    <div className="table-container" style={{ border: 'none' }}>
                        <table><thead><tr><th>Patient</th><th>ID</th><th>Age</th><th>Room</th><th>Symptoms</th><th>Doctor</th><th>Status</th></tr></thead>
                            <tbody>{patients.map((p, i) => (
                                <tr key={i}>
                                    <td className="font-semibold">{p.first_name} {p.last_name}</td>
                                    <td><code style={{ fontSize: '0.78rem', background: 'var(--border-light)', padding: '2px 6px', borderRadius: 4 }}>{p.patient_id}</code></td>
                                    <td>{p.age}</td><td>{p.room_number || '—'}</td>
                                    <td className="text-sm text-muted">{(p.symptoms || []).slice(0, 2).join(', ') || '—'}</td>
                                    <td className="text-sm">{p.assigned_doctor || '—'}</td>
                                    <td><span className="badge badge-warning">{p.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : <p className="text-muted text-sm">No patients currently requiring active monitoring.</p>}
            </div>
        </div>
    )
}
