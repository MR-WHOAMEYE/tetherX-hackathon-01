import { useState, useEffect } from 'react'
import { Briefcase, Users, AlertTriangle, Activity } from 'lucide-react'
import { api } from '../api'

export default function WorkloadAnalysis() {
    const [workload, setWorkload] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getWorkload().then(data => {
            setWorkload(data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="card"><div className="loading-pulse">Analyzing workload...</div></div>

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    <Briefcase size={20} />
                    <h3>Doctor Workload Analysis</h3>
                </div>
            </div>
            <div className="workload-grid">
                {workload.map((doc, i) => (
                    <div key={i} className="workload-card">
                        <div className="workload-card-header">
                            <div className="workload-avatar">{doc.assigned_doctor?.[0] || '?'}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{doc.assigned_doctor}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attending Physician</div>
                            </div>
                        </div>
                        <div className="workload-stats">
                            <div className="workload-stat">
                                <Users size={14} style={{ color: 'var(--primary)' }} />
                                <span>{doc.total_patients} patients</span>
                            </div>
                            <div className="workload-stat">
                                <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                                <span>{doc.critical_patients} critical</span>
                            </div>
                            <div className="workload-stat">
                                <Activity size={14} style={{ color: 'var(--warning)' }} />
                                <span>{doc.monitoring_patients} monitoring</span>
                            </div>
                        </div>
                        <div className="progress-bar" style={{ marginTop: 8 }}>
                            <div className="progress-bar-fill" style={{
                                width: `${Math.min(100, (doc.total_patients / 15) * 100)}%`,
                                background: doc.total_patients > 12 ? 'var(--danger)' : doc.total_patients > 8 ? 'var(--warning)' : 'var(--success)'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Capacity: {Math.round((doc.total_patients / 15) * 100)}%
                        </div>
                    </div>
                ))}
                {workload.length === 0 && <div className="event-stream-empty">No workload data available</div>}
            </div>
        </div>
    )
}
