import { useState, useEffect } from 'react'
import { Activity, Clock } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

const EVENT_ICONS = {
    vitals_update: '❤️',
    alert: '🚨',
    system: '⚙️',
    patient_registration: '👤',
    prescription: '💊',
    treatment_update: '📋',
    default: '📌'
}

const SEVERITY_COLORS = {
    info: 'var(--primary)',
    warning: 'var(--warning)',
    critical: 'var(--danger)'
}

export default function LiveEventStream({ maxEvents = 20 }) {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const { subscribe } = useWebSocket()

    useEffect(() => {
        api.getEvents(50).then(data => {
            setEvents(data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    useEffect(() => {
        return subscribe('live-event-stream', (msg) => {
            if (msg.type === 'vitals_update' || msg.type === 'alert') {
                const newEvent = {
                    id: Date.now(),
                    event_type: msg.type,
                    title: msg.data?.alerts?.length > 0 ? msg.data.alerts[0].title : `Vitals updated for patient ${msg.data?.patient_id}`,
                    description: msg.data?.alerts?.length > 0 ? msg.data.alerts[0].description : '',
                    severity: msg.data?.alerts?.length > 0 ? 'critical' : 'info',
                    patient_id: msg.data?.patient_id,
                    created_at: msg.timestamp || new Date().toISOString()
                }
                setEvents(prev => [newEvent, ...prev].slice(0, 100))
            }
        })
    }, [subscribe])

    const formatTime = (ts) => {
        if (!ts) return ''
        const d = new Date(ts)
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    if (loading) return <div className="card"><div className="loading-pulse">Loading events...</div></div>

    return (
        <div className="card live-event-stream">
            <div className="card-header">
                <div className="card-title">
                    <Activity size={20} />
                    <h3>Live Clinical Events</h3>
                </div>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="live-dot" /> LIVE
                </span>
            </div>
            <div className="event-stream-list">
                {events.slice(0, maxEvents).map((event, i) => (
                    <div key={event.id || i} className={`event-stream-item severity-${event.severity || 'info'}`} style={{ animationDelay: `${i * 0.03}s` }}>
                        <div className="event-stream-time">
                            <Clock size={12} />
                            <span>{formatTime(event.created_at)}</span>
                        </div>
                        <div className="event-stream-icon">
                            {EVENT_ICONS[event.event_type] || EVENT_ICONS.default}
                        </div>
                        <div className="event-stream-content">
                            <div className="event-stream-title">{event.title}</div>
                            {event.description && <div className="event-stream-desc">{event.description}</div>}
                        </div>
                        <div className="event-stream-severity" style={{ color: SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.info }}>
                            {event.severity?.toUpperCase()}
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="event-stream-empty">No events yet. System is monitoring...</div>
                )}
            </div>
        </div>
    )
}
