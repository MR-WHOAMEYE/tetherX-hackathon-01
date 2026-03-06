import { useState, useEffect } from 'react'
import { HeartPulse, Eye, EyeOff, ArrowRight, Activity, Users, ShieldCheck, Stethoscope, UserCog, UserRound } from 'lucide-react'
import { api } from '../api'

/* ── Animated network nodes for left panel background ── */
function NetworkCanvas() {
    useEffect(() => {
        const canvas = document.getElementById('network-canvas')
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animId
        let nodes = []

        function resize() {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio
            canvas.height = canvas.offsetHeight * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        function initNodes() {
            nodes = []
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            for (let i = 0; i < 80; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 2.5 + 1.2,
                    pulse: Math.random() * Math.PI * 2
                })
            }
        }

        function draw() {
            const w = canvas.offsetWidth
            const h = canvas.offsetHeight
            ctx.clearRect(0, 0, w, h)

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x
                    const dy = nodes[i].y - nodes[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 140) {
                        const alpha = (1 - dist / 140) * 0.25
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(59, 225, 209, ${alpha})`
                        ctx.lineWidth = 0.8
                        ctx.moveTo(nodes[i].x, nodes[i].y)
                        ctx.lineTo(nodes[j].x, nodes[j].y)
                        ctx.stroke()
                    }
                }
            }

            // Draw & update nodes
            for (const n of nodes) {
                n.pulse += 0.02
                const glow = 0.5 + Math.sin(n.pulse) * 0.3
                ctx.beginPath()
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(59, 225, 209, ${glow})`
                ctx.fill()

                // Outer glow
                ctx.beginPath()
                ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(59, 225, 209, ${glow * 0.15})`
                ctx.fill()

                n.x += n.vx
                n.y += n.vy
                if (n.x < 0 || n.x > w) n.vx *= -1
                if (n.y < 0 || n.y > h) n.vy *= -1
            }

            animId = requestAnimationFrame(draw)
        }

        resize()
        initNodes()
        draw()
        window.addEventListener('resize', () => { resize(); initNodes() })
        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return <canvas id="network-canvas" className="login-network-canvas" />
}

/* ── Floating particles ── */
function FloatingParticles() {
    return (
        <div className="login-particles">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="login-particle" style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${i * 1.2}s`,
                    animationDuration: `${6 + Math.random() * 4}s`,
                    width: `${4 + Math.random() * 8}px`,
                    height: `${4 + Math.random() * 8}px`,
                    opacity: 0.15 + Math.random() * 0.2
                }} />
            ))}
        </div>
    )
}

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setTimeout(() => setMounted(true), 100)
    }, [])

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

    const demoCredentials = [
        { role: 'Doctor', username: 'dr.chen', password: 'password123', color: '#3BE1D1', icon: Stethoscope },
        { role: 'Nurse', username: 'nurse.scott', password: 'password123', color: '#60A5FA', icon: UserCog },
        { role: 'Patient', username: 'patient.john', password: 'password123', color: '#FBBF24', icon: UserRound },
    ]

    return (
        <div className={`login-page-v2 ${mounted ? 'mounted' : ''}`}>

            {/* ── Left Hero Panel ── */}
            <div className="login-hero">
                <NetworkCanvas />
                <FloatingParticles />

                <div className="login-hero-content">
                    {/* Logo */}
                    <div className="login-hero-logo">
                        <div className="login-logo-icon">
                            <HeartPulse size={28} strokeWidth={2} />
                        </div>
                        <div>
                            <h2>ClinIQ</h2>
                            <span>Clinical Intelligence Platform</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="login-hero-headline">
                        <h1>
                            Clinical Intelligence,
                            <br />
                            <span className="login-gradient-text">Reimagined.</span>
                        </h1>
                        <p>
                            Real-time analytics, predictive insights, and AI-powered
                            decision support for modern clinical care.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="login-hero-stats">
                        <div className="login-hero-stat">
                            <div className="login-hero-stat-value">60+</div>
                            <div className="login-hero-stat-label">Active Patients</div>
                        </div>
                        <div className="login-hero-stat">
                            <div className="login-hero-stat-value">24/7</div>
                            <div className="login-hero-stat-label">AI Diagnostics</div>
                        </div>
                        <div className="login-hero-stat">
                            <div className="login-hero-stat-value">99.8%</div>
                            <div className="login-hero-stat-label">Prediction Accuracy</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="login-form-panel">
                <div className="login-form-wrapper">

                    {/* Header */}
                    <div className="login-form-header">
                        <h1>Welcome back</h1>
                        <p>Sign in to access the command center</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="login-error-v2">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 4.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form-fields">
                        <div className="login-field">
                            <label className="login-label">USERNAME</label>
                            <div className="login-input-wrapper">
                                <input
                                    id="login-username"
                                    className="login-input-v2"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label className="login-label">PASSWORD</label>
                            <div className="login-input-wrapper">
                                <input
                                    id="login-password"
                                    className="login-input-v2"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="login-eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            className="login-submit-btn"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="login-spinner" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="login-demo-section">
                        <div className="login-demo-header">
                            <ShieldCheck size={16} />
                            <span>Demo Credentials</span>
                        </div>
                        <div className="login-demo-list">
                            {demoCredentials.map(({ role, username: u, password: p, color, icon: Icon }) => (
                                <button
                                    key={role}
                                    className="login-demo-item"
                                    onClick={() => quickLogin(u, p)}
                                    type="button"
                                >
                                    <span className="login-demo-dot" style={{ background: color }}>
                                        <Icon size={12} strokeWidth={2.5} />
                                    </span>
                                    <span className="login-demo-role">{role}:</span>
                                    <span className="login-demo-cred">{u} / {p}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="login-footer-v2">
                        © 2026 ClinIQ · Clinical Intelligence Platform
                    </div>
                </div>
            </div>
        </div>
    )
}
