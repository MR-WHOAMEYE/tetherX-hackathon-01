import { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

export default function AIInsightsPanel() {
    const [insights, setInsights] = useState([])
    const [loading, setLoading] = useState(true)
    const { subscribe } = useWebSocket()

    const fetchInsights = () => {
        api.getAIInsights(10).then(data => {
            setInsights(data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { fetchInsights() }, [])

    useEffect(() => {
        return subscribe('ai-insights', (msg) => {
            if (msg.type === 'vitals_update') {
                setTimeout(fetchInsights, 1000)
            }
        })
    }, [subscribe])

    const getRiskColor = (score) => {
        if (score >= 70) return 'var(--danger)'
        if (score >= 50) return 'var(--warning)'
        return 'var(--success)'
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'immediate': return <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
            case 'urgent': return <TrendingUp size={16} style={{ color: 'var(--warning)' }} />
            default: return <CheckCircle size={16} style={{ color: 'var(--success)' }} />
        }
    }

    if (loading) return <div className="card"><div className="loading-pulse">Analyzing patient data...</div></div>

    return (
        <div className="card ai-insights-panel">
            <div className="card-header">
                <div className="card-title">
                    <Brain size={20} />
                    <h3>AI Clinical Insights</h3>
                </div>
                <span className="badge badge-purple">{insights.length} Insights</span>
            </div>
            <div className="ai-insights-list">
                {insights.map((insight, i) => (
                    <div key={i} className="ai-insight-card" style={{ borderLeft: `3px solid ${getRiskColor(insight.risk_score)}` }}>
                        <div className="ai-insight-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {getPriorityIcon(insight.triage_priority)}
                                <span style={{ fontWeight: 600 }}>{insight.patient_name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{insight.patient_id}</span>
                            </div>
                            <div className="ai-insight-risk" style={{ color: getRiskColor(insight.risk_score) }}>
                                {insight.risk_score}%
                            </div>
                        </div>
                        <div className="ai-insight-body">
                            <div className="ai-insight-metric">
                                <span className="ai-insight-label">Deterioration Risk</span>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                    <div className="progress-bar-fill" style={{
                                        width: `${insight.deterioration_risk}%`,
                                        background: getRiskColor(insight.deterioration_risk)
                                    }} />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{insight.deterioration_risk}%</span>
                            </div>
                            {insight.factors?.length > 0 && (
                                <div className="ai-insight-factors">
                                    {insight.factors.map((f, j) => (
                                        <span key={j} className="badge badge-neutral">{f}</span>
                                    ))}
                                </div>
                            )}
                            <div className="ai-insight-action">
                                <strong>Suggested Action:</strong> {insight.suggested_action}
                            </div>
                        </div>
                    </div>
                ))}
                {insights.length === 0 && (
                    <div className="event-stream-empty">No risk insights available. System is monitoring...</div>
                )}
            </div>
        </div>
    )
}
