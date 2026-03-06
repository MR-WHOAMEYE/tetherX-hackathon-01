import { useState, useEffect, useCallback } from 'react'
import { HeartPulse, AlertTriangle, Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

export default function Triage() {
    const [triageData, setTriageData] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const { isConnected, subscribe } = useWebSocket()

    const fetchData = useCallback(() => {
        api.triageAll().then(d => {
            setTriageData(d)
            setLastUpdated(new Date())
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    // WS — re-score triage on vitals changes or alerts
    useEffect(() => {
        return subscribe('triage', (msg) => {
            if (msg.type === 'vitals_update' || msg.type === 'alert') {
                setTimeout(fetchData, 800)
            }
        })
    }, [subscribe, fetchData])

    // 30-second polling fallback
    useEffect(() => {
        const timer = setInterval(fetchData, 30000)
        return () => clearInterval(timer)
    }, [fetchData])

    const priorityConfig = {
        Critical: { color: '#FF0A54', bg: 'rgba(255, 10, 84, 0.1)', badge: 'danger' },
        High: { color: '#EA580C', bg: '#FFF7ED', badge: 'warning' },
        Medium: { color: '#CA8A04', bg: '#FEFCE8', badge: 'warning' },
        Low: { color: '#16A34A', bg: '#F0FDF4', badge: 'success' },
    }

    if (loading) return <div className="loading-container"><div className="spinner" /><span>Calculating triage scores...</span></div>

    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    triageData.forEach(p => { if (counts[p.priority_level] !== undefined) counts[p.priority_level]++ })

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1><HeartPulse size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Intelligent Triage System</h1>
                        <p>AI-driven patient severity scoring and prioritization. Patients are ranked by clinical urgency for optimal resource allocation.</p>
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
                {Object.entries(counts).map(([level, count], i) => {
                    const cfg = priorityConfig[level]
                    return (
                        <div key={level} className={`stat-card animate-in stagger-${i + 1}`}>
                            <div className="stat-icon" style={{ background: cfg.bg, color: cfg.color }}><AlertTriangle size={22} /></div>
                            <div className="stat-value" style={{ color: cfg.color }}>{count}</div>
                            <div className="stat-label">{level} Priority</div>
                        </div>
                    )
                })}
            </div>

            <div className="card">
                <div className="card-header"><div className="card-title"><Activity size={20} /><h3>Patient Triage Queue</h3></div>
                    <span className="badge badge-primary">{triageData.length} patients</span></div>

                {triageData.slice(0, 30).map((p, i) => {
                    const cfg = priorityConfig[p.priority_level] || priorityConfig.Low
                    return (
                        <div key={i} className={`animate-in stagger-${(i % 4) + 1}`} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', borderBottom: '1px solid var(--border-light)', transition: 'var(--transition)' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: cfg.color }}>{p.severity_score}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="flex items-center gap-8">
                                    <span className="font-semibold">{p.first_name} {p.last_name}</span>
                                    <span className={`badge badge-${cfg.badge}`}>{p.priority_level}</span>
                                </div>
                                <div className="text-xs text-muted mt-8">{p.patient_id} · Age {p.age} · {p.gender}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="progress-bar" style={{ width: 200 }}>
                                    <div className="progress-bar-fill" style={{ width: `${p.severity_score}%`, background: cfg.color }} />
                                </div>
                                <div className="text-xs text-muted mt-8">Score: {p.severity_score}/100</div>
                            </div>
                            <div className="text-sm text-secondary" style={{ maxWidth: 280 }}>{p.suggested_action}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
