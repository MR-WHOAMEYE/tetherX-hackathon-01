import { useState, useEffect } from 'react'
import { AlertTriangle, Users } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

const STATUS_BADGE = {
    critical: 'badge-danger',
    monitoring: 'badge-warning',
    active: 'badge-success',
}

const TRIAGE_BADGE = {
    immediate: 'badge-danger',
    urgent: 'badge-warning',
    delayed: 'badge-primary',
    minimal: 'badge-neutral',
}

export default function PatientPriorityQueue() {
    const [queue, setQueue] = useState([])
    const [loading, setLoading] = useState(true)
    const { subscribe } = useWebSocket()

    const fetchQueue = () => {
        api.getPriorityQueue(20).then(data => {
            setQueue(data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { fetchQueue() }, [])

    useEffect(() => {
        return subscribe('priority-queue', (msg) => {
            if (msg.type === 'vitals_update') {
                fetchQueue()
            }
        })
    }, [subscribe])

    if (loading) return <div className="card"><div className="loading-pulse">Loading priority queue...</div></div>

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    <AlertTriangle size={20} />
                    <h3>Critical Patient Queue</h3>
                </div>
                <span className="badge badge-danger">{queue.filter(p => p.status === 'critical').length} Critical</span>
            </div>
            <div className="table-container" style={{ border: 'none', maxHeight: 400, overflowY: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Risk Score</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Doctor</th>
                            <th>Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queue.map((p, i) => (
                            <tr key={p.patient_id || i}>
                                <td style={{ fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Users size={14} />
                                        {p.first_name} {p.last_name}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.patient_id}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="progress-bar" style={{ width: 60 }}>
                                            <div className="progress-bar-fill" style={{
                                                width: `${p.risk_score || 0}%`,
                                                background: (p.risk_score || 0) >= 70 ? 'var(--danger)' : (p.risk_score || 0) >= 40 ? 'var(--warning)' : 'var(--success)'
                                            }} />
                                        </div>
                                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                                            {p.risk_score ?? '—'}%
                                        </span>
                                    </div>
                                </td>
                                <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-neutral'}`}>{p.status}</span></td>
                                <td><span className={`badge ${TRIAGE_BADGE[p.triage_priority] || 'badge-neutral'}`}>{p.triage_priority || '—'}</span></td>
                                <td style={{ fontSize: '0.85rem' }}>{p.assigned_doctor || '—'}</td>
                                <td style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{p.room_number || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
