import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck, Clock, CheckCircle, XCircle, Plus, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { api } from '../api'
import { useWebSocket } from '../context/WebSocketContext'

export default function FollowupCare() {
    const [followups, setFollowups] = useState([])
    const [stats, setStats] = useState(null)
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [showSchedule, setShowSchedule] = useState(false)
    const [formData, setFormData] = useState({ patient_id: '', doctor: '', appointment_type: 'Follow-up', date: '', time: '09:00', notes: '' })
    const [scheduling, setScheduling] = useState(false)
    const [msg, setMsg] = useState(null)
    const { isConnected, subscribe } = useWebSocket()

    const fetchData = useCallback(() => {
        Promise.all([api.getFollowups(), api.getFollowupStats()])
            .then(([f, s]) => {
                setFollowups(f)
                setStats(s)
                setLastUpdated(new Date())
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { fetchData() }, [fetchData])
    useEffect(() => { api.getPatients(null, null, 200).then(setPatients) }, [])

    // WS subscription for new follow-ups created via other pages
    useEffect(() => {
        return subscribe('followup', (msg) => {
            if (msg.type === 'metrics_update') setTimeout(fetchData, 600)
        })
    }, [subscribe, fetchData])

    // 60-second polling fallback
    useEffect(() => {
        const timer = setInterval(fetchData, 60000)
        return () => clearInterval(timer)
    }, [fetchData])

    const complete = async (id) => {
        await api.completeFollowup(id)
        setFollowups(prev => prev.filter(f => f.id !== id))
        fetchData()
    }
    const cancel = async (id) => {
        await api.cancelFollowup(id)
        setFollowups(prev => prev.filter(f => f.id !== id))
        fetchData()
    }

    const scheduleAppointment = async (e) => {
        e.preventDefault()
        setScheduling(true)
        try {
            await api.createFollowup(formData)
            setMsg({ type: 'success', text: '✅ Appointment scheduled successfully' })
            setShowSchedule(false)
            setFormData({ patient_id: '', doctor: '', appointment_type: 'Follow-up', date: '', time: '09:00', notes: '' })
            fetchData()
        } catch {
            setMsg({ type: 'error', text: '❌ Failed to schedule appointment' })
        } finally {
            setScheduling(false)
            setTimeout(() => setMsg(null), 4000)
        }
    }

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1><CalendarCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Follow-Up Care Management</h1>
                        <p>Manage patient follow-up appointments, medication reminders, and post-treatment care scheduling.</p>
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

            {stats && (
                <div className="grid-4 mb-24">
                    {[
                        { icon: CalendarCheck, value: stats.scheduled, label: 'Scheduled', color: '#00F0FF', bg: 'rgba(0, 240, 255, 0.1)' },
                        { icon: CheckCircle, value: stats.completed, label: 'Completed', color: '#00FF9D', bg: 'rgba(0, 255, 157, 0.1)' },
                        { icon: XCircle, value: stats.cancelled, label: 'Cancelled', color: '#FF0A54', bg: 'rgba(255, 10, 84, 0.1)' },
                        { icon: Clock, value: stats.total, label: 'Total', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
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

            {/* Schedule Form */}
            <div className="card mb-24">
                <div className="card-header">
                    <div className="card-title"><CalendarCheck size={20} /><h3>Schedule Appointment</h3></div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {msg && <span className={`badge ${msg.type === 'success' ? 'badge-success' : 'badge-danger'}`}>{msg.text}</span>}
                        <button className="btn btn-primary btn-sm" onClick={() => setShowSchedule(!showSchedule)}>
                            <Plus size={14} />{showSchedule ? 'Cancel' : 'New Appointment'}
                        </button>
                    </div>
                </div>
                {showSchedule && (
                    <form onSubmit={scheduleAppointment}>
                        <div className="grid-3 mb-16">
                            <div className="input-group">
                                <label>Patient</label>
                                <select className="select" required value={formData.patient_id} onChange={e => setFormData({ ...formData, patient_id: e.target.value })}>
                                    <option value="">Select patient...</option>
                                    {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name} ({p.patient_id})</option>)}
                                </select>
                            </div>
                            <div className="input-group"><label>Doctor Name</label><input className="input" required placeholder="Dr. Smith" value={formData.doctor} onChange={e => setFormData({ ...formData, doctor: e.target.value })} /></div>
                            <div className="input-group">
                                <label>Type</label>
                                <select className="select" value={formData.appointment_type} onChange={e => setFormData({ ...formData, appointment_type: e.target.value })}>
                                    {['Follow-up', 'Lab Review', 'Physical', 'Specialist Consult', 'Medication Review'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid-3 mb-16">
                            <div className="input-group"><label>Date</label><input className="input" type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
                            <div className="input-group"><label>Time</label><input className="input" type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} /></div>
                            <div className="input-group"><label>Notes</label><input className="input" placeholder="Optional notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={scheduling}>{scheduling ? 'Scheduling...' : '📅 Schedule'}</button>
                    </form>
                )}
            </div>

            <div className="card">
                <div className="card-header"><div className="card-title"><CalendarCheck size={20} /><h3>Upcoming Appointments</h3></div>
                    <span className="badge badge-primary">{followups.length} upcoming</span>
                </div>
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
