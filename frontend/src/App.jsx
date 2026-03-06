import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
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

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/copilot" element={<ClinicalCopilot />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/nurse" element={<NurseDashboard />} />
          <Route path="/portal" element={<PatientPortal user={user} />} />
          <Route path="/triage" element={<Triage />} />
          <Route path="/risk" element={<RiskPrediction />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/drugs" element={<DrugInteractions />} />
          <Route path="/similarity" element={<CaseSimilarity />} />
          <Route path="/outcomes" element={<TreatmentOutcomes />} />
          <Route path="/timeline" element={<PatientTimeline />} />
          <Route path="/followup" element={<FollowupCare />} />
          <Route path="/insights" element={<HospitalInsights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}
