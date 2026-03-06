import { useState, useEffect } from 'react'
import { UserCheck, Stethoscope, ShieldCheck } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

const ROLE_ICONS = {
    doctor: Stethoscope,
    nurse: ShieldCheck,
    default: UserCheck,
}

const ROLE_COLORS = {
    doctor: 'var(--primary)',
    nurse: 'var(--accent)',
}

export default function StaffActivityFeed({ limit = 15 }) {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const { subscribe } = useWebSocket()

    useEffect(() => {
        api.getStaffActivity(30).then(data => {
            setActivities(data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    useEffect(() => {
        return subscribe('staff-activity', (msg) => {
            if (msg.type === 'vitals_update' && msg.data?.vitals?.recorded_by) {
                const newActivity = {
                    id: Date.now(),
                    staff_name: msg.data.vitals.recorded_by,
                    staff_role: 'nurse',
                    action_type: 'vitals_recording',
                    patient_id: msg.data.patient_id,
                    description: `Recorded vitals for patient ${msg.data.patient_id}`,
                    created_at: msg.timestamp || new Date().toISOString()
                }
                setActivities(prev => [newActivity, ...prev].slice(0, 50))
            }
        })
    }, [subscribe])

    const formatTime = (ts) => {
        if (!ts) return ''
        const d = new Date(ts)
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    if (loading) return <div className="card"><div className="loading-pulse">Loading staff activity...</div></div>

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    <UserCheck size={20} />
                    <h3>Staff Activity Feed</h3>
                </div>
            </div>
            <div className="staff-activity-list">
                {activities.slice(0, limit).map((a, i) => {
                    const Icon = ROLE_ICONS[a.staff_role] || ROLE_ICONS.default
                    const color = ROLE_COLORS[a.staff_role] || 'var(--text-muted)'
                    return (
                        <div key={a.id || i} className="staff-activity-item">
                            <div className="staff-activity-avatar" style={{ background: `${color}15`, color }}>
                                <Icon size={16} />
                            </div>
                            <div className="staff-activity-content">
                                <div>
                                    <span style={{ fontWeight: 600 }}>{a.staff_name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}> • {a.staff_role}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{a.description}</div>
                            </div>
                            <div className="staff-activity-time">{formatTime(a.created_at)}</div>
                        </div>
                    )
                })}
                {activities.length === 0 && <div className="event-stream-empty">No staff activity recorded yet</div>}
            </div>
        </div>
    )
}
