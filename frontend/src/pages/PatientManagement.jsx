import { useState, useEffect } from 'react'
import { Users, Search, Plus, Activity } from 'lucide-react'
import { api } from '../api'

export default function PatientManagement() {
    const [patients, setPatients] = useState([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [tab, setTab] = useState('list')
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({ first_name: '', last_name: '', age: 30, gender: 'Male', blood_type: 'O+', symptoms: [], allergies: [], medical_history: [] })
    const [expandedId, setExpandedId] = useState(null)
    const [vitals, setVitals] = useState({})

    const ALL_SYMPTOMS = ['Chest pain', 'Shortness of breath', 'Headache', 'Dizziness', 'Nausea', 'Fatigue', 'Fever', 'Cough', 'Abdominal pain', 'Back pain', 'Joint pain', 'Swelling', 'Blurred vision', 'Numbness', 'Palpitations', 'Weight loss', 'Confusion', 'Seizures']

    useEffect(() => { loadPatients() }, [status, search])

    const loadPatients = () => {
        setLoading(true)
        api.getPatients(status !== 'all' ? status : null, search || null, 100).then(setPatients).finally(() => setLoading(false))
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            const res = await api.createPatient(formData)
            alert(`Patient registered: ${res.patient_id}`)
            setTab('list'); loadPatients()
        } catch (e) { alert('Error registering patient') }
    }

    const loadVitals = async (pid) => {
        const v = await api.getVitals(pid, 3)
        setVitals(prev => ({ ...prev, [pid]: v }))
    }

    const toggleExpand = (pid) => {
        if (expandedId === pid) { setExpandedId(null) } else { setExpandedId(pid); loadVitals(pid) }
    }

    const statusColors = { active: 'primary', critical: 'danger', monitoring: 'warning', discharged: 'success' }

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><Users size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Patient Management</h1>
                <p>Comprehensive patient record management. Register, search, and manage patient data.</p></div>

            <div className="tabs">
                <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>Patient Records</button>
                <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register Patient</button>
            </div>

            {tab === 'list' && (
                <>
                    <div className="card mb-24" style={{ padding: '16px 20px' }}>
                        <div className="flex gap-16 items-center">
                            <div style={{ flex: 2, position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" style={{ paddingLeft: 36 }} placeholder="Search by name or patient ID..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <select className="select" style={{ flex: 1 }} value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="monitoring">Monitoring</option>
                                <option value="critical">Critical</option>
                                <option value="discharged">Discharged</option>
                            </select>
                        </div>
                    </div>

                    {loading ? <div className="loading-container"><div className="spinner" /></div> : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Patient</th><th>ID</th><th>Age</th><th>Gender</th><th>Status</th><th>Doctor</th><th>Room</th><th>Symptoms</th></tr></thead>
                                <tbody>
                                    {patients.map(p => (
                                        <tr key={p.patient_id} onClick={() => toggleExpand(p.patient_id)} style={{ cursor: 'pointer' }}>
                                            <td className="font-semibold">{p.first_name} {p.last_name}</td>
                                            <td><code style={{ fontSize: '0.8rem', background: 'var(--border-light)', padding: '2px 8px', borderRadius: 4 }}>{p.patient_id}</code></td>
                                            <td>{p.age}</td><td>{p.gender}</td>
                                            <td><span className={`badge badge-${statusColors[p.status] || 'neutral'}`}>{p.status}</span></td>
                                            <td className="text-sm">{p.assigned_doctor || '—'}</td>
                                            <td>{p.room_number || '—'}</td>
                                            <td className="text-sm text-muted">{(p.symptoms || []).slice(0, 2).join(', ') || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {expandedId && patients.find(p => p.patient_id === expandedId) && (() => {
                        const p = patients.find(x => x.patient_id === expandedId)
                        return (
                            <div className="card mt-16 animate-slide">
                                <div className="card-header"><div className="card-title"><Activity size={20} /><h3>{p.first_name} {p.last_name} — Detail</h3></div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setExpandedId(null)}>✕</button></div>
                                <div className="grid-3">
                                    <div><h4 className="mb-8">Allergies</h4>{(p.allergies || []).map((a, i) => <div key={i} className="text-sm mb-8">• {a}</div>) || <span className="text-muted text-sm">None</span>}</div>
                                    <div><h4 className="mb-8">Medical History</h4>{(p.medical_history || []).map((h, i) => <div key={i} className="text-sm mb-8">• {h}</div>) || <span className="text-muted text-sm">None</span>}</div>
                                    <div><h4 className="mb-8">Current Medications</h4>{(p.current_medications || []).map((m, i) => <div key={i} className="text-sm mb-8">• {m}</div>) || <span className="text-muted text-sm">None</span>}</div>
                                </div>
                                {vitals[expandedId]?.length > 0 && (
                                    <div className="mt-24">
                                        <h4 className="mb-8">Latest Vitals</h4>
                                        <div className="table-container">
                                            <table><thead><tr><th>BP</th><th>HR</th><th>O2</th><th>Temp</th><th>RR</th><th>Recorded</th></tr></thead>
                                                <tbody>{vitals[expandedId].map((v, i) => (
                                                    <tr key={i}><td>{v.blood_pressure_sys}/{v.blood_pressure_dia}</td><td>{v.heart_rate}</td><td>{v.oxygen_level}%</td><td>{v.temperature}°F</td><td>{v.respiratory_rate}</td><td className="text-xs">{v.recorded_at}</td></tr>
                                                ))}</tbody></table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()}
                </>
            )}

            {tab === 'register' && (
                <div className="card">
                    <div className="card-header"><div className="card-title"><Plus size={20} /><h3>Register New Patient</h3></div></div>
                    <form onSubmit={handleRegister}>
                        <div className="grid-3 mb-16">
                            <div className="input-group"><label>First Name*</label><input className="input" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} /></div>
                            <div className="input-group"><label>Last Name*</label><input className="input" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} /></div>
                            <div className="input-group"><label>Age*</label><input className="input" type="number" min="0" max="120" value={formData.age} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} /></div>
                        </div>
                        <div className="grid-3 mb-16">
                            <div className="input-group"><label>Gender*</label><select className="select" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}><option>Male</option><option>Female</option></select></div>
                            <div className="input-group"><label>Blood Type</label><select className="select" value={formData.blood_type} onChange={e => setFormData({ ...formData, blood_type: e.target.value })}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}</select></div>
                            <div className="input-group"><label>Room Number</label><input className="input" placeholder="e.g. A101" /></div>
                        </div>
                        <div className="input-group mb-16">
                            <label>Symptoms</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{ALL_SYMPTOMS.map(s => (
                                <button type="button" key={s} className={`btn btn-sm ${formData.symptoms.includes(s) ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFormData({ ...formData, symptoms: formData.symptoms.includes(s) ? formData.symptoms.filter(x => x !== s) : [...formData.symptoms, s] })}>{s}</button>
                            ))}</div>
                        </div>
                        <button className="btn btn-primary btn-lg btn-full" type="submit">Register Patient</button>
                    </form>
                </div>
            )}
        </div>
    )
}
