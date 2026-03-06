import { useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Bot, Users, Stethoscope, HeartPulse, Activity,
    TrendingUp, Lightbulb, Pill, Search, BarChart3, Clock, CalendarCheck,
    Building2, FileText, Settings, LogOut, ShieldCheck
} from 'lucide-react'

const NAV = {
    doctor: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'AI Clinical Copilot', icon: Bot, path: '/copilot' },
        { label: 'Patient Management', icon: Users, path: '/patients' },
        { label: 'Doctor Dashboard', icon: Stethoscope, path: '/doctor' },
        { divider: true },
        { section: 'Clinical Intelligence' },
        { label: 'Triage System', icon: HeartPulse, path: '/triage' },
        { label: 'Risk Prediction', icon: TrendingUp, path: '/risk' },
        { label: 'Recommendations', icon: Lightbulb, path: '/recommendations' },
        { label: 'Drug Interactions', icon: Pill, path: '/drugs' },
        { divider: true },
        { section: 'Analysis' },
        { label: 'Case Similarity', icon: Search, path: '/similarity' },
        { label: 'Treatment Outcomes', icon: BarChart3, path: '/outcomes' },
        { label: 'Patient Timeline', icon: Clock, path: '/timeline' },
        { label: 'Follow-Up Care', icon: CalendarCheck, path: '/followup' },
        { divider: true },
        { section: 'Administration' },
        { label: 'Hospital Insights', icon: Building2, path: '/insights' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ],
    nurse: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Patient Management', icon: Users, path: '/patients' },
        { label: 'Nurse Dashboard', icon: ShieldCheck, path: '/nurse' },
        { divider: true },
        { label: 'Triage System', icon: HeartPulse, path: '/triage' },
        { label: 'Risk Prediction', icon: TrendingUp, path: '/risk' },
        { label: 'Patient Timeline', icon: Clock, path: '/timeline' },
        { label: 'Follow-Up Care', icon: CalendarCheck, path: '/followup' },
        { divider: true },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ],
    patient: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Patient Portal', icon: Users, path: '/portal' },
        { label: 'My Timeline', icon: Clock, path: '/timeline' },
        { label: 'My Appointments', icon: CalendarCheck, path: '/followup' },
        { divider: true },
        { label: 'My Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ],
}

export default function Sidebar({ user, onLogout }) {
    const location = useLocation()
    const navigate = useNavigate()
    const items = NAV[user.role] || NAV.patient

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <HeartPulse size={36} strokeWidth={1.8} />
                <h2>ClinIQ</h2>
                <p>Clinical Intelligence Platform</p>
            </div>

            <div className="sidebar-user">
                <div className="sidebar-user-avatar">{user.full_name[0]}</div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{user.full_name}</div>
                    <div className="sidebar-user-role">{user.role}</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {items.map((item, i) => {
                    if (item.divider) return <div key={i} className="sidebar-divider" />
                    if (item.section) return <div key={i} className="sidebar-section-label">{item.section}</div>
                    const Icon = item.icon
                    const active = location.pathname === item.path
                    return (
                        <div
                            key={i}
                            className={`sidebar-item ${active ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
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
    )
}
