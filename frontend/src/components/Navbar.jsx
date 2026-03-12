import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { lang, setLang, toggleLang, t } = useLanguage()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <nav className="navbar" id="main-navbar">
            <div className="nav-container">
                <Link to="/" className="logo">CyberShield</Link>
                <ul className={`nav-links${mobileOpen ? ' open' : ''}`} id="nav-links">
                    <li><Link to="/" onClick={() => setMobileOpen(false)}>{t('nav_products')}</Link></li>
                    <li>
                        <Link to="/about" onClick={() => setMobileOpen(false)}>{t('nav_about')}</Link>
                    </li>
                    <li><Link to="/contact" onClick={() => setMobileOpen(false)}>{t('nav_contact')}</Link></li>
                    <li><Link to="/lab" onClick={() => setMobileOpen(false)}>{t('nav_lab')}</Link></li>
                    <li><Link to="/blog" onClick={() => setMobileOpen(false)}>{t('nav_news')}</Link></li>

                    {/* Language Dropdown */}
                    <li className="user-menu lang-menu">
                        <button className="lang-toggle" onClick={() => {}} aria-label="Toggle language" id="lang-toggle-btn" style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <span className="lang-icon">🌐</span>
                            {lang.toUpperCase()} <i className='bx bx-chevron-down'></i>
                        </button>
                        <div className="user-menu-content lang-menu-content">
                            <a href="#" onClick={(e) => { e.preventDefault(); setLang('vi'); setMobileOpen(false); }}>🇻🇳 Tiếng Việt</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); setLang('en'); setMobileOpen(false); }}>🇬🇧 English</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); setLang('ja'); setMobileOpen(false); }}>🇯🇵 日本語</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); setLang('ko'); setMobileOpen(false); }}>🇰🇷 한국어</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); setLang('zh'); setMobileOpen(false); }}>🇨🇳 中文</a>
                        </div>
                    </li>

                    {user ? (
                        <li className="user-menu">
                            <span className="user-badge">{user.username} <i className='bx bx-user'></i></span>
                            <div className="user-menu-content">
                                <Link to="/profile" onClick={() => setMobileOpen(false)}>{t('nav_profile') || 'Trang cá nhân'}</Link>
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>{t('nav_dashboard')}</Link>
                                <a href="#" onClick={(e) => { e.preventDefault(); logout(); setMobileOpen(false); }}>{t('nav_logout')}</a>
                            </div>
                        </li>
                    ) : (
                        <li><Link to="/login" className="btn-login" onClick={() => setMobileOpen(false)}>{t('nav_login')}</Link></li>
                    )}
                </ul>
                <button
                    className="nav-toggle"
                    aria-label="Menu"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    id="nav-toggle-btn"
                >
                    <i className={mobileOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
                </button>
            </div>
        </nav>
    )
}
