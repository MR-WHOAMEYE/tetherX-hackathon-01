import { Settings as SettingsIcon, User, Shield, Bell, Palette } from 'lucide-react'
import { useState } from 'react'

export default function Settings({ user }) {
    const [tab, setTab] = useState('account')
    const [notifications, setNotifications] = useState({ email: true, push: true, critical: true, reports: false })

    return (
        <div className="animate-in">
            <div className="hero-banner"><h1><SettingsIcon size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10 }} />Settings</h1>
                <p>Manage your account preferences, security settings, and notification configurations.</p></div>

            <div className="tabs mb-24">
                {[{ k: 'account', l: 'Account', i: User }, { k: 'security', l: 'Security', i: Shield }, { k: 'notifications', l: 'Notifications', i: Bell }, { k: 'preferences', l: 'Preferences', i: Palette }]
                    .map(t => <button key={t.k} className={`tab ${tab === t.k ? 'active' : ''}`} onClick={() => setTab(t.k)}>{t.l}</button>)}
            </div>

            {tab === 'account' && (
                <div className="card">
                    <div className="card-header"><div className="card-title"><User size={20} /><h3>Account Information</h3></div></div>
                    <div className="grid-2" style={{ gap: 20 }}>
                        <div className="input-group"><label>Full Name</label><input className="input" defaultValue={user.full_name} /></div>
                        <div className="input-group"><label>Email</label><input className="input" type="email" defaultValue={user.email} /></div>
                        <div className="input-group"><label>Role</label><input className="input" value={user.role} disabled style={{ background: 'var(--border-light)', textTransform: 'capitalize' }} /></div>
                        <div className="input-group"><label>Department</label><input className="input" defaultValue={user.department} /></div>
                    </div>
                    <button className="btn btn-primary mt-24">Save Changes</button>
                </div>
            )}

            {tab === 'security' && (
                <div className="card">
                    <div className="card-header"><div className="card-title"><Shield size={20} /><h3>Security Settings</h3></div></div>
                    <div style={{ maxWidth: 480 }}>
                        <div className="input-group"><label>Current Password</label><input className="input" type="password" placeholder="••••••••" /></div>
                        <div className="input-group"><label>New Password</label><input className="input" type="password" placeholder="Enter new password" /></div>
                        <div className="input-group"><label>Confirm Password</label><input className="input" type="password" placeholder="Confirm new password" /></div>
                    </div>
                    <button className="btn btn-primary mt-24">Update Password</button>
                    <div className="mt-32">
                        <h4 className="mb-16">Two-Factor Authentication</h4>
                        <div className="flex items-center gap-16" style={{ padding: '16px 20px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                            <Shield size={24} style={{ color: 'var(--success)' }} />
                            <div style={{ flex: 1 }}><div className="font-semibold">2FA is enabled</div><div className="text-sm text-muted">Using authenticator app</div></div>
                            <button className="btn btn-secondary btn-sm">Configure</button>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'notifications' && (
                <div className="card">
                    <div className="card-header"><div className="card-title"><Bell size={20} /><h3>Notification Preferences</h3></div></div>
                    {[
                        { k: 'email', l: 'Email Notifications', d: 'Receive notifications via email' },
                        { k: 'push', l: 'Push Notifications', d: 'Browser push notifications for alerts' },
                        { k: 'critical', l: 'Critical Alerts', d: 'Immediate alerts for critical patient events' },
                        { k: 'reports', l: 'Weekly Reports', d: 'Receive weekly performance summary' },
                    ].map(n => (
                        <div key={n.k} className="flex items-center justify-between mb-16" style={{ padding: '16px 20px', background: 'var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                            <div><div className="font-semibold text-sm">{n.l}</div><div className="text-xs text-muted">{n.d}</div></div>
                            <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 26, cursor: 'pointer' }}>
                                <input type="checkbox" checked={notifications[n.k]} onChange={e => setNotifications({ ...notifications, [n.k]: e.target.checked })}
                                    style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: notifications[n.k] ? 'var(--primary)' : '#CBD5E1', borderRadius: 26, transition: '0.3s' }}>
                                    <span style={{ position: 'absolute', content: '', height: 20, width: 20, left: notifications[n.k] ? 24 : 3, bottom: 3, background: 'white', borderRadius: '50%', transition: '0.3s' }} />
                                </span>
                            </label>
                        </div>
                    ))}
                    <button className="btn btn-primary mt-16">Save Preferences</button>
                </div>
            )}

            {tab === 'preferences' && (
                <div className="card">
                    <div className="card-header"><div className="card-title"><Palette size={20} /><h3>Display Preferences</h3></div></div>
                    <div style={{ maxWidth: 480 }}>
                        <div className="input-group"><label>Language</label><select className="select"><option>English (US)</option><option>Spanish</option><option>French</option></select></div>
                        <div className="input-group"><label>Timezone</label><select className="select"><option>UTC+05:30 (IST)</option><option>UTC-05:00 (EST)</option><option>UTC+00:00 (GMT)</option></select></div>
                        <div className="input-group"><label>Date Format</label><select className="select"><option>YYYY-MM-DD</option><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option></select></div>
                    </div>
                    <button className="btn btn-primary mt-24">Save Preferences</button>
                </div>
            )}
        </div>
    )
}
