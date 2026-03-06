import { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, AlertOctagon, Siren } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

const SEVERITY_CONFIG = {
    warning: { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'WARNING' },
    critical: { icon: AlertOctagon, color: 'var(--danger)', bg: 'var(--danger-bg)', label: 'CRITICAL' },
    emergency: { icon: Siren, color: '#7f1d1d', bg: '#fca5a5', label: 'EMERGENCY' },
}

export default function AlertNotification() {
    const [alerts, setAlerts] = useState([])
    const [toasts, setToasts] = useState([])
    const [showPanel, setShowPanel] = useState(false)
    const { subscribe } = useWebSocket()

    useEffect(() => {
        api.getAlerts(50).then(setAlerts).catch(() => { })
    }, [])

    useEffect(() => {
        return subscribe('alert-notifications', (msg) => {
            if (msg.type === 'alert') {
                setAlerts(prev => [msg.data, ...prev])
                setToasts(prev => [...prev, { ...msg.data, toastId: Date.now() }])
                setTimeout(() => {
                    setToasts(prev => prev.slice(1))
                }, 6000)
            }
            if (msg.type === 'alert_acknowledged') {
                setAlerts(prev => prev.filter(a => a.id !== msg.data.id))
            }
        })
    }, [subscribe])

    const handleAcknowledge = (alertId) => {
        api.acknowledgeAlert(alertId).then(() => {
            setAlerts(prev => prev.filter(a => a.id !== alertId))
        }).catch(() => { })
    }

    const activeCount = alerts.filter(a => a.status === 'active').length

    return (
        <>
            {/* Toast notifications */}
            <div className="alert-toast-container">
                {toasts.map((toast) => {
                    const config = SEVERITY_CONFIG[toast.severity] || SEVERITY_CONFIG.warning
                    const Icon = config.icon
                    return (
                        <div key={toast.toastId} className="alert-toast" style={{ borderLeft: `4px solid ${config.color}`, background: config.bg }}>
                            <Icon size={18} style={{ color: config.color, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: config.color }}>{config.label}</div>
                                <div style={{ fontSize: '0.82rem' }}>{toast.title}</div>
                            </div>
                            <X size={14} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setToasts(prev => prev.filter(t => t.toastId !== toast.toastId))} />
                        </div>
                    )
                })}
            </div>

            {/* Alert bell button */}
            <div className="alert-bell" onClick={() => setShowPanel(!showPanel)}>
                <Bell size={20} />
                {activeCount > 0 && <span className="alert-bell-count">{activeCount}</span>}
            </div>

            {/* Alert panel */}
            {showPanel && (
                <div className="alert-panel-overlay" onClick={() => setShowPanel(false)}>
                    <div className="alert-panel" onClick={e => e.stopPropagation()}>
                        <div className="alert-panel-header">
                            <h3>Active Alerts ({activeCount})</h3>
                            <X size={18} onClick={() => setShowPanel(false)} style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="alert-panel-list">
                            {alerts.filter(a => a.status === 'active').map((alert) => {
                                const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.warning
                                const Icon = config.icon
                                return (
                                    <div key={alert.id} className="alert-panel-item" style={{ borderLeft: `3px solid ${config.color}` }}>
                                        <Icon size={16} style={{ color: config.color }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.title}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{alert.description}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 2 }}>
                                                Patient: {alert.patient_id} • {new Date(alert.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleAcknowledge(alert.id)}>Ack</button>
                                    </div>
                                )
                            })}
                            {activeCount === 0 && <div className="event-stream-empty">No active alerts</div>}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
