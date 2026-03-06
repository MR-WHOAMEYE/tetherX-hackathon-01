import { useState, useEffect } from 'react'
import { Building2, Users, Activity, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import { api } from '../api'

export default function HospitalInsights() {
    const [metrics, setMetrics] = useState(null)
    const [departments, setDepartments] = useState([])
    const [admissions, setAdmissions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.getMetrics(), api.getDepartments(), api.getAdmissions()])
            .then(([m, d, a]) => { setMetrics(m); setDepartments(d); setAdmissions(a) })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-container"><div className="spinner" /></div>

    const occColor = (v) => v > 90 ? '#EF4444' : v > 75 ? '#F59E0B' : '#10B981'

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><Building2 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Hospital Intelligence Dashboard</h1>
                <p>Real-time hospital operations metrics. Monitor capacity, staffing, patient flow, and department performance at a glance.</p></div>

            <div className="grid-4 mb-24">
                {[
                    { icon: Users, value: metrics?.total_patients, label: 'Total Patients', color: '#0A5EB5', bg: '#EBF4FF' },
                    { icon: AlertTriangle, value: `${metrics?.er_load}%`, label: 'ER Load', color: metrics?.er_load > 100 ? '#EF4444' : '#F59E0B', bg: metrics?.er_load > 100 ? '#FEE2E2' : '#FEF3C7' },
                    { icon: Activity, value: `${metrics?.bed_occupancy}%`, label: 'Bed Occupancy', color: '#7C3AED', bg: '#F3E8FF' },
                    { icon: Clock, value: `${metrics?.avg_wait_time}m`, label: 'Avg Wait Time', color: '#059669', bg: '#D1FAE5' },
                ].map((k, i) => {
                    const Icon = k.icon; return (
                        <div key={i} className={`stat-card animate-in stagger-${i + 1}`}>
                            <div className="stat-icon" style={{ background: k.bg, color: k.color }}><Icon size={22} /></div>
                            <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
                            <div className="stat-label">{k.label}</div>
                        </div>
                    )
                })}
            </div>

            <div className="grid-2 mb-24">
                <div className="card">
                    <div className="card-header"><div className="card-title"><Building2 size={20} /><h3>Department Occupancy</h3></div></div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={departments} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 13 }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem' }} formatter={v => `${v}%`} />
                            <Bar dataKey="occupancy" radius={[0, 6, 6, 0]} barSize={22}>
                                {departments.map((d, i) => <Cell key={i} fill={occColor(d.occupancy)} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title"><TrendingUp size={20} /><h3>Hourly Admissions</h3></div></div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={admissions}>
                            <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                            <Line type="monotone" dataKey="admissions" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} name="Admissions" />
                            <Line type="monotone" dataKey="discharges" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="Discharges" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><div className="card-title"><Building2 size={20} /><h3>Department Details</h3></div></div>
                <div className="table-container" style={{ border: 'none' }}>
                    <table><thead><tr><th>Department</th><th>Patients</th><th>Capacity</th><th>Occupancy</th><th>Staff</th><th>Status</th></tr></thead>
                        <tbody>{departments.map((d, i) => (
                            <tr key={i}><td className="font-semibold">{d.name}</td><td>{d.patients}</td><td>{d.capacity}</td>
                                <td><div className="flex items-center gap-8"><span className="font-display font-bold" style={{ color: occColor(d.occupancy) }}>{d.occupancy}%</span>
                                    <div className="progress-bar" style={{ width: 80 }}><div className="progress-bar-fill" style={{ width: `${d.occupancy}%`, background: occColor(d.occupancy) }} /></div></div></td>
                                <td>{d.staff}</td>
                                <td><span className={`badge badge-${d.occupancy > 90 ? 'danger' : d.occupancy > 75 ? 'warning' : 'success'}`}>{d.occupancy > 90 ? 'Critical' : d.occupancy > 75 ? 'High' : 'Normal'}</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
