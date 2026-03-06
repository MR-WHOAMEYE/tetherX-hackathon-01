import { useState } from 'react'
import { HeartPulse } from 'lucide-react'
import { api } from '../api'

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const data = await api.login(username, password)
            onLogin(data.user)
        } catch (err) {
            setError('Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const quickLogin = async (user, pass) => {
        setUsername(user)
        setPassword(pass)
        setError('')
        setLoading(true)
        try {
            const data = await api.login(user, pass)
            onLogin(data.user)
        } catch (err) {
            setError('Login failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <HeartPulse size={48} strokeWidth={1.5} />
                    <h2>ClinIQ</h2>
                    <p>Clinical Decision Support Platform</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input className="input" type="text" placeholder="Enter your username"
                            value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input className="input" type="password" placeholder="Enter your password"
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}
                        style={{ marginTop: 8 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="demo-accounts">
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Quick Login</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                            onClick={() => quickLogin('dr.chen', 'password123')}>Doctor</button>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                            onClick={() => quickLogin('nurse.scott', 'password123')}>Nurse</button>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                            onClick={() => quickLogin('patient.john', 'password123')}>Patient</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
