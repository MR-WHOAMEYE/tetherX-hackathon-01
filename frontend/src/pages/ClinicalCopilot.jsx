import { useState, useEffect } from 'react'
import { Bot, Stethoscope, FlaskConical, UserCheck, AlertTriangle, Zap } from 'lucide-react'
import { api } from '../api'

export default function ClinicalCopilot() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState('patient')
    const [symptoms, setSymptoms] = useState([])

    const ALL_SYMPTOMS = ['Chest pain', 'Shortness of breath', 'Headache', 'Dizziness', 'Nausea', 'Fatigue', 'Fever', 'Cough', 'Abdominal pain', 'Back pain', 'Joint pain', 'Swelling', 'Blurred vision', 'Numbness', 'Palpitations', 'Weight loss', 'Confusion', 'Seizures']

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients) }, [])

    const analyzePatient = async () => {
        if (!selected) return
        setLoading(true); setResult(null)
        try { const r = await api.analyzePatient(selected); setResult(r) }
        catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const analyzeSymptoms = async () => {
        if (!symptoms.length) return
        setLoading(true); setResult(null)
        try { const r = await api.analyzeSymptomsRaw({ symptoms }); setResult(r) }
        catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const getConfColor = (c) => c > 70 ? '#EF4444' : c > 50 ? '#EA580C' : c > 30 ? '#CA8A04' : '#10B981'

    return (
        <div className="animate-in">
            <div className="hero-banner">
                <h1><Bot size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />AI Clinical Copilot</h1>
                <p>AI-powered diagnostic assistant. Analyze patient symptoms and receive intelligent diagnostic suggestions, recommended tests, and specialist referrals.</p>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'patient' ? 'active' : ''}`} onClick={() => setTab('patient')}>Patient Analysis</button>
                <button className={`tab ${tab === 'quick' ? 'active' : ''}`} onClick={() => setTab('quick')}>Quick Assessment</button>
            </div>

            {tab === 'patient' && (
                <div className="card mb-24">
                    <div className="flex gap-16 items-center">
                        <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                            <option value="">Select a patient...</option>
                            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                        </select>
                        <button className="btn btn-primary" onClick={analyzePatient} disabled={loading || !selected}>
                            {loading ? 'Analyzing...' : '🧠 Run AI Analysis'}
                        </button>
                    </div>
                </div>
            )}

            {tab === 'quick' && (
                <div className="card mb-24">
                    <h3 className="mb-16">Select Symptoms</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                        {ALL_SYMPTOMS.map(s => (
                            <button key={s} className={`btn btn-sm ${symptoms.includes(s) ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}>{s}</button>
                        ))}
                    </div>
                    <button className="btn btn-primary" onClick={analyzeSymptoms} disabled={loading || !symptoms.length}>
                        <Zap size={16} /> {loading ? 'Analyzing...' : 'Quick Analyze'}
                    </button>
                </div>
            )}

            {result && (
                <div className="animate-in">
                    {result.clinical_notes?.map((note, i) => (
                        <div key={i} className="card mb-8" style={{ padding: '14px 20px', borderLeft: `4px solid ${note.includes('URGENT') ? '#EF4444' : note.includes('High') ? '#F59E0B' : '#3B82F6'}` }}>
                            <span className="text-sm">{note.includes('URGENT') ? '⚠️' : '💡'} {note}</span>
                        </div>
                    ))}

                    <div className="grid-3 mt-24">
                        <div className="card">
                            <div className="card-header"><div className="card-title"><Stethoscope size={20} /><h3>Possible Conditions</h3></div></div>
                            {result.possible_conditions?.map((c, i) => (
                                <div key={i} className="mb-16" style={{ padding: '12px 16px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm">{c.name}</span>
                                        <span className="font-display font-bold" style={{ color: getConfColor(c.confidence) }}>{c.confidence}%</span>
                                    </div>
                                    <div className="progress-bar mt-8">
                                        <div className="progress-bar-fill" style={{ width: `${c.confidence}%`, background: getConfColor(c.confidence) }} />
                                    </div>
                                    <div className="text-xs text-muted mt-8">Based on: {c.supporting_symptoms?.join(', ')}</div>
                                </div>
                            ))}
                        </div>

                        <div className="card">
                            <div className="card-header"><div className="card-title"><FlaskConical size={20} /><h3>Recommended Tests</h3></div></div>
                            {result.recommended_tests?.map((t, i) => (
                                <div key={i} className="flex items-center gap-12 mb-8" style={{ padding: '10px 14px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <FlaskConical size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span className="text-sm font-semibold">{t}</span>
                                </div>
                            ))}
                        </div>

                        <div className="card">
                            <div className="card-header"><div className="card-title"><UserCheck size={20} /><h3>Specialist Referrals</h3></div></div>
                            {result.specialist_referrals?.length ? result.specialist_referrals.map((s, i) => (
                                <div key={i} className="flex items-center gap-12 mb-8" style={{ padding: '10px 14px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                    <UserCheck size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                    <span className="text-sm font-semibold">{s}</span>
                                </div>
                            )) : <p className="text-muted text-sm">No specialist referrals needed.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
