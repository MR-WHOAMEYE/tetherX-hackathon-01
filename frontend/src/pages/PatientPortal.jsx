import { useState, useEffect } from 'react'
import { Users, CalendarCheck, Clock, FileText } from 'lucide-react'
import { api } from '../api'

export default function PatientPortal({ user }) {
    const [followups, setFollowups] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { api.getFollowups().then(f => { setFollowups(f.slice(0, 5)); setLoading(false) }) }, [])

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <h1><Users size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Patient Portal</h1>
                <p>Welcome, {user.full_name}. View your treatment timeline, upcoming appointments, and download medical reports.</p>
            </div>

            <div className="grid-3 mb-24">
                <div className="stat-card animate-in stagger-1">
                    <div className="stat-icon" style={{ background: '#EBF4FF', color: '#0A5EB5' }}><CalendarCheck size={22} /></div>
                    <div className="stat-value">{followups.length}</div>
                    <div className="stat-label">Upcoming Appointments</div>
                </div>
                <div className="stat-card animate-in stagger-2">
                    <div className="stat-icon" style={{ background: '#D1FAE5', color: '#059669' }}><Clock size={22} /></div>
                    <div className="stat-value">Active</div>
                    <div className="stat-label">Treatment Status</div>
                </div>
                <div className="stat-card animate-in stagger-3">
                    <div className="stat-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}><FileText size={22} /></div>
                    <div className="stat-value">3</div>
                    <div className="stat-label">Available Reports</div>
                </div>
            </div>

            <div className="card mb-24">
                <div className="card-header"><div className="card-title"><CalendarCheck size={20} /><h3>My Appointments</h3></div></div>
                {followups.length ? followups.map((f, i) => (
                    <div key={i} className="flex items-center gap-16 mb-12" style={{ padding: '14px 18px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarCheck size={22} /></div>
                        <div style={{ flex: 1 }}>
                            <div className="font-semibold">{f.appointment_type}</div>
                            <div className="text-xs text-muted">with {f.doctor_name}</div>
                        </div>
                        <div className="text-sm text-secondary">{f.scheduled_date} at {f.scheduled_time}</div>
                        <span className="badge badge-primary">Scheduled</span>
                    </div>
                )) : <p className="text-muted text-sm">No upcoming appointments.</p>}
            </div>

            <div className="card">
                <div className="card-header"><div className="card-title"><FileText size={20} /><h3>Health Resources</h3></div></div>
                <div className="grid-3">
                    {['Understanding Your Diagnosis', 'Medication Guide', 'Post-Treatment Care'].map((title, i) => (
                        <div key={i} className="patient-card" style={{ cursor: 'default' }}>
                            <FileText size={24} style={{ color: 'var(--primary)', marginBottom: 12 }} />
                            <div className="font-semibold mb-8">{title}</div>
                            <div className="text-sm text-muted">Access helpful information about your healthcare journey.</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
