import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { WebSocketProvider } from './context/WebSocketContext'
import Sidebar from './components/Sidebar'
import AlertNotification from './components/AlertNotification'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CommandCenter from './pages/CommandCenter'
import LiveVitalMonitor from './pages/LiveVitalMonitor'
import ClinicalCopilot from './pages/ClinicalCopilot'
import PatientManagement from './pages/PatientManagement'
import DoctorDashboard from './pages/DoctorDashboard'
import NurseDashboard from './pages/NurseDashboard'
import PatientPortal from './pages/PatientPortal'
import Triage from './pages/Triage'
import RiskPrediction from './pages/RiskPrediction'
import Recommendations from './pages/Recommendations'
import DrugInteractions from './pages/DrugInteractions'
import CaseSimilarity from './pages/CaseSimilarity'
import TreatmentOutcomes from './pages/TreatmentOutcomes'
import PatientTimeline from './pages/PatientTimeline'
import FollowupCare from './pages/FollowupCare'
import HospitalInsights from './pages/HospitalInsights'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

/* ── Role-based route access configuration ── */
const ROLE_ROUTES = {
  doctor: [
    '/', '/command-center', '/live-vitals', '/copilot', '/patients',
    '/triage', '/risk', '/recommendations', '/drugs',
    '/similarity', '/outcomes', '/reports', '/settings',
  ],
  nurse: [
    '/', '/command-center', '/live-vitals', '/patients',
    '/reports', '/settings',
  ],
  patient: [
    '/', '/portal', '/timeline', '/followup', '/reports', '/settings',
  ],
}

/* ── Guard component — redirects if role doesn't have access ── */
function RoleGuard({ user, path, children }) {
  const allowed = ROLE_ROUTES[user.role] || ROLE_ROUTES.patient
  if (!allowed.includes(path)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cliniq_user')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('cliniq_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('cliniq_user')
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  /* ── Role-specific home page component ── */
  const HomeComponent = () => {
    switch (user.role) {
      case 'doctor':
        return <DoctorDashboard />
      case 'nurse':
        return <NurseDashboard />
      case 'patient':
        return <PatientPortal user={user} />
      default:
        return <Dashboard user={user} />
    }
  }

  return (
    <WebSocketProvider>
      <div className="app-layout">
        <Sidebar user={user} onLogout={handleLogout} />
        <AlertNotification />
        <main className="main-content">
          <Routes>
            {/* Home — role-specific dashboard */}
            <Route path="/" element={<HomeComponent />} />

            {/* Doctor & Nurse shared routes */}
            <Route path="/command-center" element={
              <RoleGuard user={user} path="/command-center"><CommandCenter /></RoleGuard>
            } />
            <Route path="/live-vitals" element={
              <RoleGuard user={user} path="/live-vitals"><LiveVitalMonitor /></RoleGuard>
            } />
            <Route path="/patients" element={
              <RoleGuard user={user} path="/patients"><PatientManagement /></RoleGuard>
            } />

            {/* Doctor-only routes */}
            <Route path="/copilot" element={
              <RoleGuard user={user} path="/copilot"><ClinicalCopilot /></RoleGuard>
            } />
            <Route path="/doctor" element={
              <RoleGuard user={user} path="/doctor"><DoctorDashboard /></RoleGuard>
            } />
            <Route path="/recommendations" element={
              <RoleGuard user={user} path="/recommendations"><Recommendations /></RoleGuard>
            } />
            <Route path="/drugs" element={
              <RoleGuard user={user} path="/drugs"><DrugInteractions /></RoleGuard>
            } />
            <Route path="/similarity" element={
              <RoleGuard user={user} path="/similarity"><CaseSimilarity /></RoleGuard>
            } />
            <Route path="/outcomes" element={
              <RoleGuard user={user} path="/outcomes"><TreatmentOutcomes /></RoleGuard>
            } />
            <Route path="/insights" element={
              <RoleGuard user={user} path="/insights"><HospitalInsights /></RoleGuard>
            } />

            {/* Nurse-only route */}
            <Route path="/nurse" element={
              <RoleGuard user={user} path="/nurse"><NurseDashboard /></RoleGuard>
            } />

            {/* Patient-only route */}
            <Route path="/portal" element={
              <RoleGuard user={user} path="/portal"><PatientPortal user={user} /></RoleGuard>
            } />

            {/* Shared routes (all roles) */}
            <Route path="/triage" element={
              <RoleGuard user={user} path="/triage"><Triage /></RoleGuard>
            } />
            <Route path="/risk" element={
              <RoleGuard user={user} path="/risk"><RiskPrediction /></RoleGuard>
            } />
            <Route path="/timeline" element={
              <RoleGuard user={user} path="/timeline"><PatientTimeline /></RoleGuard>
            } />
            <Route path="/followup" element={
              <RoleGuard user={user} path="/followup"><FollowupCare /></RoleGuard>
            } />
            <Route path="/reports" element={
              <RoleGuard user={user} path="/reports"><Reports /></RoleGuard>
            } />
            <Route path="/settings" element={
              <RoleGuard user={user} path="/settings"><Settings user={user} /></RoleGuard>
            } />

            {/* Catch-all — redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </WebSocketProvider>
  )
}
