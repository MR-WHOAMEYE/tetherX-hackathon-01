import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Bot, Users, HeartPulse,
    TrendingUp, Lightbulb, Pill, Search, BarChart3, Clock, CalendarCheck,
    Building2, FileText, Settings, LogOut, Monitor, Radio
} from 'lucide-react'

/* ── Role-specific navigation configuration ──
   Each role sees ONLY the pages relevant to their dashboard.
   Home (/) renders: Doctor → DoctorDashboard, Nurse → NurseDashboard, Patient → PatientPortal
*/
const NAV = {
    doctor: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { type: 'divider' },
        { type: 'section', label: 'Real-Time Intelligence' },
        { label: 'Command Center', icon: Monitor, path: '/command-center' },
        { label: 'Live Vitals', icon: Radio, path: '/live-vitals' },
        { type: 'divider' },
        { type: 'section', label: 'Clinical Tools' },
        { label: 'AI Clinical Copilot', icon: Bot, path: '/copilot' },
        { label: 'Patient Management', icon: Users, path: '/patients' },
        { label: 'Triage System', icon: HeartPulse, path: '/triage' },
        { type: 'divider' },
        { type: 'section', label: 'Intelligence & Analysis' },
        { label: 'Risk Prediction', icon: TrendingUp, path: '/risk' },
        { label: 'Recommendations', icon: Lightbulb, path: '/recommendations' },
        { label: 'Drug Interactions', icon: Pill, path: '/drugs' },
        { label: 'Case Similarity', icon: Search, path: '/similarity' },
        { label: 'Treatment Outcomes', icon: BarChart3, path: '/outcomes' },
        { type: 'divider' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ],
    nurse: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { type: 'divider' },
        { type: 'section', label: 'Real-Time Monitoring' },
        { label: 'Command Center', icon: Monitor, path: '/command-center' },
        { label: 'Live Vitals', icon: Radio, path: '/live-vitals' },
        { type: 'divider' },
        { type: 'section', label: 'Patient Care' },
        { label: 'Patient Management', icon: Users, path: '/patients' },
        { type: 'divider' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ],
    patient: [
        { label: 'My Dashboard', icon: LayoutDashboard, path: '/' },
        { type: 'divider' },
        { type: 'section', label: 'My Health' },
        { label: 'Patient Portal', icon: Users, path: '/portal' },
        { label: 'My Timeline', icon: Clock, path: '/timeline' },
        { label: 'My Appointments', icon: CalendarCheck, path: '/followup' },
        { type: 'divider' },
        { type: 'section', label: 'Account' },
        { label: 'My Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ],
}

const ROLE_LABELS = {
    doctor: 'Physician',
    nurse: 'Nursing Staff',
    patient: 'Patient',
}

const ROLE_COLORS = {
    doctor: '#3BE1D1',
    nurse: '#60A5FA',
    patient: '#FBBF24',
}

export default function Sidebar({ user, onLogout }) {
    const location = useLocation()
    const navigate = useNavigate()
    const items = NAV[user.role] || NAV.patient
    const [visible, setVisible] = useState(false)
    const sidebarRef = useRef(null)
    const hoverZoneRef = useRef(null)

    const handleNavigate = (path) => {
        navigate(path)
    }

    return (
        <>
            {/* Invisible hover zone at left edge */}
            <div
                ref={hoverZoneRef}
                className="sidebar-hover-zone"
                onMouseEnter={() => setVisible(true)}
            />

            {/* Overlay to close sidebar when clicking outside */}
            {visible && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setVisible(false)}
                />
            )}

            <aside
                ref={sidebarRef}
                className={`sidebar ${visible ? 'sidebar-open' : 'sidebar-closed'}`}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
            >
                <div className="sidebar-logo">
                    <HeartPulse size={32} strokeWidth={1.8} />
                    <h2>ClinIQ</h2>
                    <p>Clinical Intelligence Platform</p>
                </div>

                <div className="sidebar-user">
                    <div className="sidebar-user-avatar" style={{
                        background: `${ROLE_COLORS[user.role] || '#67B8F7'}22`,
                        color: ROLE_COLORS[user.role] || '#67B8F7',
                    }}>
                        {user.full_name[0]}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.full_name}</div>
                        <div className="sidebar-user-role" style={{ color: ROLE_COLORS[user.role] }}>
                            {ROLE_LABELS[user.role] || user.role}
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {items.map((item, i) => {
                        // Divider
                        if (item.type === 'divider') {
                            return <div key={i} className="sidebar-divider" />
                        }
                        // Section label
                        if (item.type === 'section') {
                            return <div key={i} className="sidebar-section-label">{item.label}</div>
                        }
                        // Nav item
                        const Icon = item.icon
                        const active = location.pathname === item.path
                        return (
                            <div
                                key={i}
                                className={`sidebar-item ${active ? 'active' : ''}`}
                                onClick={() => handleNavigate(item.path)}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </div>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={onLogout}>
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

