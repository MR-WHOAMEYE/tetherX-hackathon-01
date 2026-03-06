import { useState, useEffect } from 'react'
import { Search, Users, TrendingUp } from 'lucide-react'
import { api } from '../api'

export default function CaseSimilarity() {
    const [patients, setPatients] = useState([])
    const [selected, setSelected] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => { api.getPatients(null, null, 100).then(setPatients) }, [])

    const find = async () => {
        if (!selected) return
        setLoading(true)
        try { const r = await api.findSimilar(selected); setResult(r) }
        finally { setLoading(false) }
    }

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><Search size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Case Similarity Finder</h1>
                <p>Compare current patients with historical cases to identify patterns, common treatments, and recovery outcomes.</p></div>

            <div className="card mb-24" style={{ padding: '16px 20px' }}>
                <div className="flex gap-16 items-center">
                    <select className="select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
                        <option value="">Select a patient...</option>
                        {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.first_name} {p.last_name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={find} disabled={loading || !selected}>{loading ? 'Searching...' : '🔍 Find Similar Cases'}</button>
                </div>
            </div>

            {result && (
                <div className="animate-in">
                    <div className="grid-3 mb-24">
                        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}><Users size={22} /></div>
                            <div className="stat-value">{result.total_similar}</div><div className="stat-label">Similar Cases Found</div></div>
                        <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><TrendingUp size={22} /></div>
                            <div className="stat-value">{result.recovery_rate}%</div><div className="stat-label">Average Recovery Rate</div></div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}><Search size={22} /></div>
                            <div className="stat-label mt-8">Common Treatments</div>
                            <div className="mt-8">{result.common_treatments?.map((t, i) => <div key={i} className="text-sm mb-8">• {t}</div>)}</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><div className="card-title"><Users size={20} /><h3>Similar Patients</h3></div></div>
                        <div className="table-container" style={{ border: 'none' }}>
                            <table><thead><tr><th>Patient</th><th>Age</th><th>Gender</th><th>Status</th><th>Similarity</th><th>Common Symptoms</th></tr></thead>
                                <tbody>{result.similar_cases?.map((c, i) => (
                                    <tr key={i}>
                                        <td className="font-semibold">{c.name}</td><td>{c.age}</td><td>{c.gender}</td>
                                        <td><span className={`badge badge-${c.status === 'discharged' ? 'success' : c.status === 'critical' ? 'danger' : 'primary'}`}>{c.status}</span></td>
                                        <td><div className="flex items-center gap-8"><span className="font-display font-bold" style={{ color: 'var(--primary)' }}>{c.similarity_score}%</span>
                                            <div className="progress-bar" style={{ width: 80 }}><div className="progress-bar-fill" style={{ width: `${c.similarity_score}%`, background: 'var(--primary)' }} /></div></div></td>
                                        <td className="text-sm text-muted">{c.common_symptoms?.join(', ') || '—'}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
