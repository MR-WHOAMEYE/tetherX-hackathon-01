import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Bot, Users, Stethoscope, HeartPulse, Activity,
    TrendingUp, Lightbulb, Pill, Search, BarChart3, Clock, CalendarCheck,
    Building2, FileText, Settings, LogOut, ShieldCheck, Monitor, Radio,
    ChevronDown, ChevronRight
} from 'lucide-react'

const NAV = {
    doctor: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        {
            label: 'Real-Time Intelligence', icon: Monitor, children: [
                { label: 'Command Center', icon: Monitor, path: '/command-center' },
                { label: 'Live Vitals', icon: Radio, path: '/live-vitals' },
            ]
        },
        {
            label: 'Clinical Tools', icon: Bot, children: [
                { label: 'AI Clinical Copilot', icon: Bot, path: '/copilot' },
                { label: 'Patient Management', icon: Users, path: '/patients' },
                { label: 'Doctor Dashboard', icon: Stethoscope, path: '/doctor' },
            ]
        },
        {
            label: 'Clinical Intelligence', icon: HeartPulse, children: [
                { label: 'Triage System', icon: HeartPulse, path: '/triage' },
                { label: 'Risk Prediction', icon: TrendingUp, path: '/risk' },
                { label: 'Recommendations', icon: Lightbulb, path: '/recommendations' },
                { label: 'Drug Interactions', icon: Pill, path: '/drugs' },
            ]
        },
        {
            label: 'Analysis', icon: Search, children: [
                { label: 'Case Similarity', icon: Search, path: '/similarity' },
                { label: 'Treatment Outcomes', icon: BarChart3, path: '/outcomes' },
                { label: 'Patient Timeline', icon: Clock, path: '/timeline' },
                { label: 'Follow-Up Care', icon: CalendarCheck, path: '/followup' },
            ]
        },
        {
            label: 'Administration', icon: Building2, children: [
                { label: 'Hospital Insights', icon: Building2, path: '/insights' },
                { label: 'Reports', icon: FileText, path: '/reports' },
                { label: 'Settings', icon: Settings, path: '/settings' },
            ]
        },
    ],
    nurse: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        {
            label: 'Real-Time Intelligence', icon: Monitor, children: [
                { label: 'Command Center', icon: Monitor, path: '/command-center' },
                { label: 'Live Vitals', icon: Radio, path: '/live-vitals' },
            ]
        },
        {
            label: 'Patient Care', icon: Users, children: [
                { label: 'Patient Management', icon: Users, path: '/patients' },
                { label: 'Nurse Dashboard', icon: ShieldCheck, path: '/nurse' },
            ]
        },
        {
            label: 'Clinical Tools', icon: HeartPulse, children: [
                { label: 'Triage System', icon: HeartPulse, path: '/triage' },
                { label: 'Risk Prediction', icon: TrendingUp, path: '/risk' },
                { label: 'Patient Timeline', icon: Clock, path: '/timeline' },
                { label: 'Follow-Up Care', icon: CalendarCheck, path: '/followup' },
            ]
        },
        {
            label: 'Administration', icon: FileText, children: [
                { label: 'Reports', icon: FileText, path: '/reports' },
                { label: 'Settings', icon: Settings, path: '/settings' },
            ]
        },
    ],
    patient: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Patient Portal', icon: Users, path: '/portal' },
        { label: 'My Timeline', icon: Clock, path: '/timeline' },
        { label: 'My Appointments', icon: CalendarCheck, path: '/followup' },
        {
            label: 'More', icon: FileText, children: [
                { label: 'My Reports', icon: FileText, path: '/reports' },
                { label: 'Settings', icon: Settings, path: '/settings' },
            ]
        },
    ],
}

export default function Sidebar({ user, onLogout }) {
    const location = useLocation()
    const navigate = useNavigate()
    const items = NAV[user.role] || NAV.patient
    const [expanded, setExpanded] = useState({})
    const [visible, setVisible] = useState(false)
    const sidebarRef = useRef(null)
    const hoverZoneRef = useRef(null)

    // Auto-expand the group that contains the current route
    useEffect(() => {
        const newExpanded = {}
        items.forEach((item) => {
            if (item.children) {
                const hasActive = item.children.some(c => c.path === location.pathname)
                if (hasActive) newExpanded[item.label] = true
            }
        })
        setExpanded(prev => ({ ...prev, ...newExpanded }))
    }, [location.pathname])

    const toggleGroup = (label) => {
        setExpanded(prev => ({ ...prev, [label]: !prev[label] }))
    }

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
                    <div className="sidebar-user-avatar">{user.full_name[0]}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.full_name}</div>
                        <div className="sidebar-user-role">{user.role}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {items.map((item, i) => {
                        if (item.children) {
                            // Group with sub-items
                            const Icon = item.icon
                            const isOpen = expanded[item.label]
                            const hasActiveChild = item.children.some(c => c.path === location.pathname)
                            return (
                                <div key={i} className="sidebar-group">
                                    <div
                                        className={`sidebar-group-header ${hasActiveChild ? 'has-active' : ''}`}
                                        onClick={() => toggleGroup(item.label)}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                        <div className={`sidebar-group-chevron ${isOpen ? 'open' : ''}`}>
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                    <div className={`sidebar-group-children ${isOpen ? 'expanded' : ''}`}>
                                        {item.children.map((child, j) => {
                                            const ChildIcon = child.icon
                                            const active = location.pathname === child.path
                                            return (
                                                <div
                                                    key={j}
                                                    className={`sidebar-item sidebar-sub-item ${active ? 'active' : ''}`}
                                                    onClick={() => handleNavigate(child.path)}
                                                >
                                                    <ChildIcon size={16} />
                                                    <span>{child.label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        }
                        // Top-level direct link
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
