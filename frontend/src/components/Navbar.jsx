import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const { lang, toggleLang, t } = useLanguage()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <nav className="navbar" id="main-navbar">
            <div className="nav-container">
                <Link to="/" className="logo">CyberShield</Link>
                <ul className={`nav-links${mobileOpen ? ' open' : ''}`} id="nav-links">
                    <li><Link to="/" onClick={() => setMobileOpen(false)}>{t('nav_products')}</Link></li>
                    <li className="user-menu">
                        <Link to="/about">{t('nav_about')} <i className='bx bx-chevron-down'></i></Link>
                        <div className="user-menu-content">
                            <Link to="/about/intro" onClick={() => setMobileOpen(false)}>{t('nav_intro')}</Link>
                            <Link to="/about/cert" onClick={() => setMobileOpen(false)}>{t('nav_cert')}</Link>
                            <Link to="/about/customer" onClick={() => setMobileOpen(false)}>{t('nav_customer')}</Link>
                            <Link to="/about/partner" onClick={() => setMobileOpen(false)}>{t('nav_partner')}</Link>
                        </div>
                    </li>
                    <li><Link to="/contact" onClick={() => setMobileOpen(false)}>{t('nav_contact')}</Link></li>
                    <li className="user-menu">
                        <Link to="/lab">{t('nav_lab')} <i className='bx bx-chevron-down'></i></Link>
                        <div className="user-menu-content">
                            <Link to="/lab" onClick={() => setMobileOpen(false)}>{t('nav_lab')}</Link>
                            <Link to="/ctf" onClick={() => setMobileOpen(false)}>{t('nav_ctf')}</Link>
                            <Link to="/tools/scanner" onClick={() => setMobileOpen(false)}>{t('nav_scanner')}</Link>
                        </div>
                    </li>
                    <li><Link to="/blog" onClick={() => setMobileOpen(false)}>{t('nav_news')}</Link></li>
                    <li><Link to="/recruitment" onClick={() => setMobileOpen(false)}>{t('nav_recruitment')}</Link></li>

                    {/* Language Toggle */}
                    <li>
                        <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language" id="lang-toggle-btn">
                            <span className="lang-icon">🌐</span>
                            {lang === 'vi' ? 'EN' : 'VI'}
                        </button>
                    </li>

                    {user ? (
                        <li className="user-menu">
                            <span className="user-badge">{user.username} <i className='bx bx-user'></i></span>
                            <div className="user-menu-content">
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
