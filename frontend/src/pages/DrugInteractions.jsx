import { useState, useEffect } from 'react'
import { Pill, AlertTriangle, ShieldCheck } from 'lucide-react'
import { api } from '../api'

export default function DrugInteractions() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [result, setResult] = useState(null)
    const [allInteractions, setAllInteractions] = useState([])
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState('patient')

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients); api.getInteractions().then(setAllInteractions) }, [])

    const check = async () => {
        if (!selected) return
        setLoading(true)
        try { const r = await api.checkPatientDrugs(selected); setResult(r) }
        finally { setLoading(false) }
    }

    const sevColor = { contraindicated: '#991B1B', severe: '#DC2626', moderate: '#EA580C', mild: '#CA8A04' }
    const sevBg = { contraindicated: '#FEE2E2', severe: '#FEE2E2', moderate: '#FFF7ED', mild: '#FEFCE8' }
    const sevBadge = { contraindicated: 'danger', severe: 'danger', moderate: 'warning', mild: 'warning' }

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><Pill size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Drug Interaction Detection</h1>
                <p>Medication safety verification. Check for potential adverse drug interactions before prescribing new medications.</p></div>

            <div className="tabs">
                <button className={`tab ${tab === 'patient' ? 'active' : ''}`} onClick={() => setTab('patient')}>Patient Check</button>
                <button className={`tab ${tab === 'database' ? 'active' : ''}`} onClick={() => setTab('database')}>Interaction Database</button>
            </div>

            {tab === 'patient' && (
                <>
                    <div className="card mb-24" style={{ padding: '16px 20px' }}>
                        <div className="flex gap-16 items-center">
                            <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                                <option value="">Select a patient...</option>
                                {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                            </select>
                            <button className="btn btn-primary" onClick={check} disabled={loading || !selected}>{loading ? 'Checking...' : '⚠️ Check Interactions'}</button>
                        </div>
                    </div>

                    {result && (
                        <div className="animate-in">
                            <div className="card mb-16">
                                <div className="card-header"><div className="card-title"><Pill size={20} /><h3>Current Medications</h3></div></div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {result.medications?.map((m, i) => (<span key={i} className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>{m}</span>))}
                                </div>
                            </div>

                            {result.interactions?.length > 0 ? (
                                <div className="card">
                                    <div className="card-header"><div className="card-title"><AlertTriangle size={20} /><h3>Interactions Found</h3></div>
                                        <span className="badge badge-danger">{result.interactions.length} found</span></div>
                                    {result.interactions.map((int, i) => (
                                        <div key={i} className="mb-16" style={{ padding: 20, background: sevBg[int.severity], borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${sevColor[int.severity]}` }}>
                                            <div className="flex justify-between items-center mb-8">
                                                <span className="font-semibold">{int.drug_a} + {int.drug_b}</span>
                                                <span className={`badge badge-${sevBadge[int.severity]}`}>{int.severity?.toUpperCase()}</span>
                                            </div>
                                            <div className="text-sm text-secondary mb-8">{int.description}</div>
                                            <div className="text-sm" style={{ color: sevColor[int.severity] }}><strong>Recommendation:</strong> {int.recommendation}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                                    <ShieldCheck size={48} style={{ color: 'var(--success)', marginBottom: 16 }} />
                                    <h3 style={{ color: 'var(--success)' }}>No Interactions Detected</h3>
                                    <p className="text-muted text-sm mt-8">All current medications appear safe to use together.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {tab === 'database' && (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Drug A</th><th>Drug B</th><th>Severity</th><th>Description</th><th>Recommendation</th></tr></thead>
                        <tbody>{allInteractions.map((int, i) => (
                            <tr key={i}>
                                <td className="font-semibold">{int.drug_a}</td><td className="font-semibold">{int.drug_b}</td>
                                <td><span className={`badge badge-${sevBadge[int.severity] || 'neutral'}`}>{int.severity}</span></td>
                                <td className="text-sm">{int.description}</td><td className="text-sm">{int.recommendation}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
