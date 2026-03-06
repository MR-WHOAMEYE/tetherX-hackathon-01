import { useState, useEffect } from 'react'
import { CalendarCheck, Clock, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../api'

export default function FollowupCare() {
    const [followups, setFollowups] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.getFollowups(), api.getFollowupStats()])
            .then(([f, s]) => { setFollowups(f); setStats(s) })
            .finally(() => setLoading(false))
    }, [])

    const complete = async (id) => { await api.completeFollowup(id); setFollowups(followups.filter(f => f.id !== id)) }
    const cancel = async (id) => { await api.cancelFollowup(id); setFollowups(followups.filter(f => f.id !== id)) }

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><CalendarCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Follow-Up Care Management</h1>
                <p>Manage patient follow-up appointments, medication reminders, and post-treatment care scheduling.</p></div>

            {stats && (
                <div className="grid-4 mb-24">
                    {[
                        { icon: CalendarCheck, value: stats.scheduled, label: 'Scheduled', color: '#3B82F6', bg: '#EBF4FF' },
                        { icon: CheckCircle, value: stats.completed, label: 'Completed', color: '#10B981', bg: '#D1FAE5' },
                        { icon: XCircle, value: stats.cancelled, label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
                        { icon: Clock, value: stats.total, label: 'Total', color: '#7C3AED', bg: '#F3E8FF' },
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
            )}

            <div className="card">
                <div className="card-header"><div className="card-title"><CalendarCheck size={20} /><h3>Upcoming Appointments</h3></div></div>
                {followups.length ? (
                    <div className="table-container" style={{ border: 'none' }}>
                        <table><thead><tr><th>Patient</th><th>Type</th><th>Doctor</th><th>Date</th><th>Time</th><th>Actions</th></tr></thead>
                            <tbody>{followups.map((f, i) => (
                                <tr key={i}>
                                    <td className="font-semibold">{f.first_name} {f.last_name}</td>
                                    <td><span className="badge badge-primary">{f.appointment_type}</span></td>
                                    <td className="text-sm">{f.doctor_name}</td>
                                    <td>{f.scheduled_date}</td><td>{f.scheduled_time}</td>
                                    <td>
                                        <div className="flex gap-8">
                                            <button className="btn btn-sm btn-primary" onClick={() => complete(f.id)}>Complete</button>
                                            <button className="btn btn-sm btn-ghost" onClick={() => cancel(f.id)}>Cancel</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : <div className="empty-state"><CalendarCheck size={48} /><p>No upcoming appointments</p></div>}
            </div>
        </div>
    )
}
