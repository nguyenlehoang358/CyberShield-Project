import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import SolutionManager from './Admin/SolutionManager'
import SimpleBarChart from '../components/Admin/SimpleBarChart'
import SecurityDashboard from '../components/SecurityDashboard/SecurityDashboard'
import SecurityAdvisor from '../components/SecurityAdvisor/SecurityAdvisor'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import '../styles/admin-dashboard.css'
import '../styles/lab.css'

export default function AdminDashboard() {
    const { user, logout, api } = useAuth()
    const { lang, toggleLang, t } = useLanguage()
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('overview')
    const [stats, setStats] = useState({
        userCount: 0,
        tables: [],
        charts: {},
        recentLogs: []
    })
    const [users, setUsers] = useState([])
    const [loadingData, setLoadingData] = useState(false)

    // Database PIN lock
    const [dbUnlocked, setDbUnlocked] = useState(false)
    const [dbPin, setDbPin] = useState('')
    const [dbPinError, setDbPinError] = useState('')

    useEffect(() => {
        loadStats()
        // Thiết lập tự động cập nhật (Polling) mỗi 5 giây cho tính năng Real-time
        const interval = setInterval(() => {
            if (activeSection === 'overview' || activeSection === 'database') {
                loadStats()
            }
            if (activeSection === 'users' || activeSection === 'database') {
                loadUsers()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [activeSection])

    const loadStats = async () => {
        try {
            const res = await api.get('/dashboard/stats')
            setStats(res.data)
        } catch (err) {
            console.error('Failed to load stats:', err)
        }
    }

    const loadUsers = async () => {
        setLoadingData(true)
        try {
            const res = await api.get('/dashboard/database/users')
            setUsers(res.data)
        } catch (err) {
            console.error('Failed to load users:', err)
        }
        setLoadingData(false)
    }

    const handleSectionChange = (section) => {
        setActiveSection(section)
        if (section === 'database' || section === 'users') loadUsers()
        if (section === 'overview' || section === 'database') loadStats()
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const formatDate = (iso) => {
        if (!iso) return '-'
        try {
            return new Date(iso).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')
        } catch { return iso }
    }

    return (
        <div className="admin-dashboard lab-hub">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Link to="/" className="admin-logo">CyberShield</Link>
                    <span className="admin-badge">Admin Panel</span>
                </div>
                <nav className="admin-sidebar-nav">
                    <button
                        className={`admin-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('overview')}
                    >
                        <i className='bx bx-grid-alt'></i>
                        <span>{lang === 'vi' ? 'Tổng quan' : 'Overview'}</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'database' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('database')}
                    >
                        <i className='bx bx-data'></i>
                        <span>{lang === 'vi' ? 'Cơ sở dữ liệu' : 'Database'}</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('users')}
                    >
                        <i className='bx bx-user'></i>
                        <span>{lang === 'vi' ? 'Người dùng' : 'Users'}</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'solutions' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('solutions')}
                    >
                        <i className='bx bx-layer'></i>
                        <span>{lang === 'vi' ? 'Giải pháp' : 'Solutions'}</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'security' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('security')}
                    >
                        <i className='bx bx-shield-quarter'></i>
                        <span>{lang === 'vi' ? 'Bảo mật' : 'Security'}</span>
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'advisor' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('advisor')}
                    >
                        <i className='bx bx-bot'></i>
                        <span>{lang === 'vi' ? 'AI Advisor' : 'AI Advisor'}</span>
                    </button>
                    <button className="admin-nav-item disabled">
                        <i className='bx bx-cog'></i>
                        <span>{lang === 'vi' ? 'Cài đặt' : 'Settings'}</span>
                    </button>
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/" className="admin-nav-item">
                        <i className='bx bx-home'></i>
                        <span>{lang === 'vi' ? 'Về trang chủ' : 'Home'}</span>
                    </Link>
                    <button className="admin-nav-item" onClick={handleLogout}>
                        <i className='bx bx-log-out'></i>
                        <span>{lang === 'vi' ? 'Đăng xuất' : 'Logout'}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <h1 className="admin-page-title lab-hub-title" style={{ marginBottom: 0, fontSize: '1.8rem' }}>
                            {activeSection === 'overview' && (lang === 'vi' ? 'Tổng quan hệ thống' : 'System Overview')}
                            {activeSection === 'database' && 'Database Manager'}
                            {activeSection === 'users' && (lang === 'vi' ? 'Quản lý người dùng' : 'User Management')}
                            {activeSection === 'solutions' && (lang === 'vi' ? 'Quản lý Giải pháp' : 'Solutions Management')}
                            {activeSection === 'security' && (lang === 'vi' ? 'Bảo mật hệ thống' : 'System Security')}
                            {activeSection === 'advisor' && (lang === 'vi' ? 'AI Security Advisor' : 'AI Security Advisor')}
                        </h1>
                    </div>

                    <div className="admin-header-actions">
                        <button onClick={toggleLang} className="admin-lang-toggle">
                            {lang === 'vi' ? 'VI / EN' : 'EN / VI'}
                        </button>
                        <span className="admin-user-info">
                            <i className='bx bx-user-circle'></i> {user?.username}
                        </span>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Section: Overview */}
                    {activeSection === 'overview' && (
                        <section className="admin-section">
                            {/* Key Metrics */}
                            <div className="admin-stats-grid">
                                <div className="admin-stat-card">
                                    <i className='bx bx-user admin-stat-icon'></i>
                                    <div>
                                        <span className="admin-stat-value">{stats.userCount ?? 0}</span>
                                        <span className="admin-stat-label">Total Users</span>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <i className='bx bx-envelope admin-stat-icon'></i>
                                    <div>
                                        <span className="admin-stat-value">{stats.contactCount ?? 0}</span>
                                        <span className="admin-stat-label">Messages</span>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <i className='bx bx-shield admin-stat-icon'></i>
                                    <div>
                                        <span className="admin-stat-value">{stats.charts?.security?.danger ?? 0}</span>
                                        <span className="admin-stat-label">Security Alerts</span>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <i className='bx bx-server admin-stat-icon'></i>
                                    <div>
                                        <span className="admin-stat-value">Active</span>
                                        <span className="admin-stat-label">System Status</span>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem', color: 'var(--text-primary)' }}>
                                {lang === 'vi' ? 'Thống kê dữ liệu' : 'Data Analytics'}
                            </h3>
                            <div className="admin-chart-grid">
                                {stats.charts?.contacts && (
                                    <SimpleBarChart
                                        title={lang === 'vi' ? 'Liên hệ khách hàng' : 'Contact Messages'}
                                        data={[
                                            { label: 'Unread', value: stats.charts.contacts.unread, color: 'var(--lab-red)' },
                                            { label: 'Read', value: stats.charts.contacts.read, color: 'var(--lab-green)' },
                                            { label: 'Total', value: stats.charts.contacts.total, color: 'var(--lab-blue)' }
                                        ]}
                                    />
                                )}
                                {stats.charts?.blogs && (
                                    <SimpleBarChart
                                        title={lang === 'vi' ? 'Bài viết & Tin tức' : 'Blogs & News'}
                                        data={[
                                            { label: 'Published', value: stats.charts.blogs.published, color: 'var(--lab-green)' },
                                            { label: 'Drafts', value: stats.charts.blogs.draft, color: 'var(--lab-yellow)' },
                                            { label: 'Total', value: stats.charts.blogs.total, color: 'var(--lab-blue)' }
                                        ]}
                                    />
                                )}
                                {stats.charts?.security && (
                                    <SimpleBarChart
                                        title={lang === 'vi' ? 'Trạng thái bảo mật' : 'Security Status'}
                                        data={[
                                            { label: 'Danger', value: stats.charts.security.danger, color: 'var(--lab-red)' },
                                            { label: 'Safe Ops', value: stats.charts.security.safe, color: 'var(--lab-green)' }
                                        ]}
                                    />
                                )}
                            </div>

                            {/* Security Logs Table */}
                            <h3 style={{ marginBottom: '1.5rem', marginTop: '2rem', color: 'var(--text-primary)' }}>
                                {lang === 'vi' ? 'Nhật ký bảo mật gần đây' : 'Recent Security Logs'}
                            </h3>
                            <div className="admin-table-wrapper">
                                <div className="admin-table-scroll">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Action</th>
                                                <th>User</th>
                                                <th>IP</th>
                                                <th>Severity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentLogs?.length > 0 ? (
                                                stats.recentLogs.map(log => (
                                                    <tr key={log.id}>
                                                        <td>{formatDate(log.timestamp)}</td>
                                                        <td>{log.action}</td>
                                                        <td>{log.username || 'Anonymous'}</td>
                                                        <td>{log.ipAddress}</td>
                                                        <td className={`log-severity-${log.severity}`}>{log.severity}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No logs available</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Move database tables to actual Database section */}
                        </section>
                    )}

                    {/* Section: Database */}
                    {activeSection === 'database' && (
                        <section className="admin-section">
                            {!dbUnlocked ? (
                                /* ═══ PIN LOCK GATE ═══ */
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    minHeight: '400px'
                                }}>
                                    <div style={{
                                        width: '100%', maxWidth: '420px',
                                        background: 'rgba(15, 15, 30, 0.8)',
                                        border: '1px solid rgba(99, 102, 241, 0.15)',
                                        borderRadius: '20px', padding: '2.5rem',
                                        textAlign: 'center',
                                        boxShadow: '0 16px 48px rgba(0,0,0,0.4)'
                                    }}>
                                        <div style={{
                                            width: 64, height: 64, borderRadius: 16,
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1.25rem', fontSize: '1.75rem',
                                            boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
                                        }}>
                                            🔒
                                        </div>
                                        <h3 style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                            {lang === 'vi' ? 'Khu vực bảo mật' : 'Secured Area'}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                            {lang === 'vi'
                                                ? 'Nhập mã PIN bảo mật để truy cập cơ sở dữ liệu hệ thống.'
                                                : 'Enter security PIN to access the system database.'}
                                        </p>

                                        {dbPinError && (
                                            <div style={{
                                                color: '#f87171', fontSize: '0.85rem',
                                                background: 'rgba(239,68,68,0.1)',
                                                border: '1px solid rgba(239,68,68,0.2)',
                                                borderRadius: 10, padding: '0.6rem 1rem',
                                                marginBottom: '1rem'
                                            }}>
                                                ❌ {dbPinError}
                                            </div>
                                        )}

                                        <form onSubmit={(e) => {
                                            e.preventDefault()
                                            if (dbPin === '123456') {
                                                setDbUnlocked(true)
                                                setDbPinError('')
                                                loadStats()
                                                loadUsers()
                                            } else {
                                                setDbPinError(lang === 'vi' ? 'Mã PIN không đúng. Vui lòng thử lại.' : 'Incorrect PIN. Please try again.')
                                            }
                                        }}>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={6}
                                                placeholder={lang === 'vi' ? 'Nhập mã PIN (6 chữ số)' : 'Enter PIN (6 digits)'}
                                                value={dbPin}
                                                onChange={(e) => setDbPin(e.target.value.replace(/\D/g, ''))}
                                                style={{
                                                    width: '100%', padding: '0.9rem 1.25rem',
                                                    background: 'rgba(30, 30, 50, 0.9)',
                                                    border: `1px solid ${dbPinError ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.2)'}`,
                                                    borderRadius: 12, color: '#e2e8f0',
                                                    fontSize: '1.1rem', fontWeight: 700,
                                                    textAlign: 'center', letterSpacing: '0.3em',
                                                    outline: 'none', marginBottom: '1rem',
                                                    fontFamily: "'JetBrains Mono', monospace"
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                type="submit"
                                                disabled={dbPin.length < 4}
                                                style={{
                                                    width: '100%', padding: '0.85rem',
                                                    background: dbPin.length >= 4
                                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                        : 'rgba(99,102,241,0.2)',
                                                    border: 'none', borderRadius: 12,
                                                    color: 'white', fontSize: '0.95rem',
                                                    fontWeight: 700, cursor: dbPin.length >= 4 ? 'pointer' : 'not-allowed',
                                                    opacity: dbPin.length >= 4 ? 1 : 0.5,
                                                    transition: 'all 0.3s',
                                                    boxShadow: dbPin.length >= 4 ? '0 4px 15px rgba(99,102,241,0.35)' : 'none'
                                                }}
                                            >
                                                🔓 {lang === 'vi' ? 'Mở khóa' : 'Unlock'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                /* ═══ UNLOCKED DATABASE CONTENT ═══ */
                                <>
                                    <h3 style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>
                                        {lang === 'vi' ? 'Sơ đồ cơ sở dữ liệu hệ thống' : 'Database Schema Overview'}
                                    </h3>
                                    {stats.tables?.length > 0 ? (
                                        <div className="admin-table-wrapper">
                                            <div className="admin-table-header">
                                                <h3>{lang === 'vi' ? 'Gồm ' + stats.tables.length + ' bảng dữ liệu chính (Cập nhật thời gian thực)' : stats.tables.length + ' Tables Found (Real-time)'}</h3>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="admin-btn admin-btn-sm" onClick={loadStats}>
                                                        <i className='bx bx-refresh'></i> Refresh
                                                    </button>
                                                    <button
                                                        className="admin-btn admin-btn-sm"
                                                        onClick={() => window.open('http://localhost:8080/browser/', '_blank')}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                            border: 'none', color: 'white'
                                                        }}
                                                    >
                                                        <i className='bx bx-link-external'></i> {lang === 'vi' ? 'Truy cập pgAdmin' : 'Open pgAdmin'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="admin-table-scroll">
                                                <table className="admin-data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Table Name</th>
                                                            <th>Records</th>
                                                            <th>Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {stats.tables.map((t, i) => (
                                                            <tr key={i}>
                                                                <td><code style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{t.name}</code></td>
                                                                <td>{t.rows}</td>
                                                                <td>{t.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="admin-table-wrapper" style={{ padding: '2rem', textAlign: 'center' }}>
                                            <p style={{ color: 'var(--text-secondary)' }}>Loading database overview...</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    )}

                    {/* Section: Users */}
                    {activeSection === 'users' && (
                        <section className="admin-section">

                            <div className="admin-table-wrapper">
                                <div className="admin-table-header">
                                    <h3>User Records</h3>
                                    <button className="admin-btn admin-btn-sm" onClick={loadUsers}>
                                        <i className='bx bx-refresh'></i> Refresh
                                    </button>
                                </div>
                                <div className="admin-table-scroll">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>OAuth</th>
                                                <th>Roles</th>
                                                <th>Status</th>
                                                <th>Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingData ? (
                                                <tr><td colSpan="7" className="admin-loading" style={{ textAlign: 'center', padding: '1.5rem' }}>Loading users...</td></tr>
                                            ) : users.length === 0 ? (
                                                <tr><td colSpan="7" className="admin-loading" style={{ textAlign: 'center', padding: '1.5rem' }}>No users found or error connecting to database.</td></tr>
                                            ) : (
                                                users.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.id}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                                                    {u.username.charAt(0).toUpperCase()}
                                                                </div>
                                                                {u.username}
                                                            </div>
                                                        </td>
                                                        <td>{u.email}</td>
                                                        <td>{u.oauthProvider || '-'}</td>
                                                        <td>
                                                            {typeof u.roles === 'string'
                                                                ? u.roles.split(', ').filter(Boolean).map((r, i) => (
                                                                    <span key={i} className="admin-role-badge">{r}</span>
                                                                ))
                                                                : u.roles?.map(r => (
                                                                    <span key={r.id || r.name} className="admin-role-badge">{r.name || r}</span>
                                                                ))
                                                            }
                                                        </td>
                                                        <td>
                                                            <span className={`admin-status ${u.enabled !== false ? 'active' : 'locked'}`}>
                                                                {u.enabled !== false ? 'Active' : 'Locked'}
                                                            </span>
                                                        </td>
                                                        <td>{formatDate(u.createdAt)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Section: Solutions */}
                    {activeSection === 'solutions' && (
                        <SolutionManager />
                    )}

                    {/* Section: Security */}
                    {activeSection === 'security' && (
                        <section className="admin-section">
                            <ErrorBoundary title="Security Dashboard Error" message="Could not load security dashboard. Please refresh.">
                                <SecurityDashboard />
                            </ErrorBoundary>
                        </section>
                    )}

                    {/* Section: AI Security Advisor */}
                    {activeSection === 'advisor' && (
                        <section className="admin-section">
                            <ErrorBoundary title="AI Advisor Error" message="Could not load AI Security Advisor. Please refresh.">
                                <SecurityAdvisor />
                            </ErrorBoundary>
                        </section>
                    )}
                </div>
            </main>
        </div>
    )
}
