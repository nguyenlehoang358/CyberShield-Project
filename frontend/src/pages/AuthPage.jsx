import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import MfaModal from '../components/MfaModal'
import '../styles/auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ── Password Strength Analysis (from PasswordLab) ── */
const COMMON_PASSWORDS = [
    'password', '123456', '123456789', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
    'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine', 'princess',
    'football', 'letmein', 'shadow', 'superman', 'michael', 'admin', 'welcome', 'login',
    'passw0rd', 'password1', 'pass123', '1234567', '12345', '1234567890', '000000',
]

function analyzePassword(password) {
    if (!password) return null
    const checks = {
        length: password.length,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasDigit: /\d/.test(password),
        hasSpecial: /[^a-zA-Z0-9]/.test(password),
    }

    let poolSize = 0
    if (checks.hasLower) poolSize += 26
    if (checks.hasUpper) poolSize += 26
    if (checks.hasDigit) poolSize += 10
    if (checks.hasSpecial) poolSize += 33

    const entropy = poolSize > 0 ? Math.round(password.length * Math.log2(poolSize)) : 0
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase())

    const patterns = []
    if (/^\d+$/.test(password)) patterns.push('numeric')
    if (/^[a-zA-Z]+$/.test(password)) patterns.push('alpha')
    if (/^(.)\1+$/.test(password)) patterns.push('repeat')

    let score = 0
    score += Math.min(40, password.length * 3.5)
    const diversityCount = [checks.hasLower, checks.hasUpper, checks.hasDigit, checks.hasSpecial].filter(Boolean).length
    score += diversityCount * 7.5
    score += Math.min(20, entropy / 5)
    if (isCommon) score = Math.max(5, score - 60)
    if (patterns.includes('repeat')) score = Math.max(5, score - 30)
    if (patterns.includes('numeric') || patterns.includes('alpha')) score -= 10
    score = Math.max(0, Math.min(100, Math.round(score)))

    let strength, strengthColor
    if (score < 20) { strength = 'very_weak'; strengthColor = '#f85149' }
    else if (score < 40) { strength = 'weak'; strengthColor = '#f0883e' }
    else if (score < 60) { strength = 'fair'; strengthColor = '#d29922' }
    else if (score < 80) { strength = 'good'; strengthColor = '#3fb950' }
    else { strength = 'excellent'; strengthColor = '#58a6ff' }

    return { checks, score, strength, strengthColor, isCommon, patterns }
}

/* ── Password Strength Meter Component ── */
function PasswordStrengthMeter({ password, lang }) {
    const analysis = useMemo(() => analyzePassword(password), [password])
    if (!analysis) return null

    const strengthLabels = {
        vi: { very_weak: 'Rất yếu', weak: 'Yếu', fair: 'Tạm được', good: 'Mạnh', excellent: 'Rất mạnh' },
        en: { very_weak: 'Very Weak', weak: 'Weak', fair: 'Fair', good: 'Good', excellent: 'Excellent' },
    }

    const checkItems = [
        { ok: analysis.checks.length >= 8, label: lang === 'vi' ? `Độ dài: ${analysis.checks.length} ký tự` : `Length: ${analysis.checks.length} chars` },
        { ok: analysis.checks.hasLower, label: lang === 'vi' ? 'Chữ thường (a-z)' : 'Lowercase (a-z)' },
        { ok: analysis.checks.hasUpper, label: lang === 'vi' ? 'Chữ hoa (A-Z)' : 'Uppercase (A-Z)' },
        { ok: analysis.checks.hasDigit, label: lang === 'vi' ? 'Số (0-9)' : 'Numbers (0-9)' },
        { ok: analysis.checks.hasSpecial, label: lang === 'vi' ? 'Ký tự đặc biệt (!@#$)' : 'Special chars (!@#$)' },
        { ok: !analysis.isCommon, bad: analysis.isCommon, label: lang === 'vi' ? 'Không phải mật khẩu phổ biến' : 'Not a common password' },
    ]

    const warningLabels = {
        numeric: lang === 'vi' ? 'Chỉ có số' : 'Numbers only',
        alpha: lang === 'vi' ? 'Chỉ có chữ' : 'Letters only',
        repeat: lang === 'vi' ? 'Ký tự lặp lại' : 'Repeated character',
    }

    return (
        <div className="password-strength-meter">
            {/* Header */}
            <div className="strength-header">
                <span className="strength-label">
                    💪 {lang === 'vi' ? 'Độ mạnh' : 'Strength'}
                </span>
                <span className="strength-value" style={{ color: analysis.strengthColor }}>
                    {analysis.score}% — {strengthLabels[lang][analysis.strength]}
                </span>
            </div>

            {/* Progress bar */}
            <div className="strength-bar-track">
                <div
                    className="strength-bar-fill"
                    style={{
                        width: `${analysis.score}%`,
                        background: `linear-gradient(90deg, ${analysis.strengthColor}, ${analysis.score > 60 ? '#58a6ff' : analysis.strengthColor})`,
                        boxShadow: `0 0 12px ${analysis.strengthColor}40`,
                    }}
                />
            </div>

            {/* Checklist */}
            <div className="strength-checklist">
                {checkItems.map((item, i) => (
                    <div key={i} className={`strength-check-item ${item.bad ? 'bad' : item.ok ? 'ok' : ''}`}>
                        <span className="check-icon">{item.bad ? '❌' : item.ok ? '✅' : '○'}</span>
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Pattern warnings */}
            {analysis.patterns.length > 0 && (
                <div className="strength-warnings">
                    {analysis.patterns.map((p, i) => (
                        <div key={i} className="strength-warning-item">
                            ⚠️ {warningLabels[p] || p}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function AuthPage() {
    const [isActive, setIsActive] = useState(false)
    const [viewMode, setViewMode] = useState('auth') // 'auth' | 'forgot' | 'reset'
    const [isTransitioning, setIsTransitioning] = useState(false)
    const navigate = useNavigate()
    const { login, register, verifyMfa, forgotPassword, resetPassword } = useAuth()
    const { lang, toggleLang, t } = useLanguage()

    const handleSocialLogin = (provider) => {
        window.location.href = `https://localhost:8443/oauth2/authorization/${provider}`
    }

    // Login State
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [showLoginPassword, setShowLoginPassword] = useState(false)
    const [loginEmailError, setLoginEmailError] = useState('')

    // Register State
    const [regUsername, setRegUsername] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [showRegPassword, setShowRegPassword] = useState(false)
    const [regEmailError, setRegEmailError] = useState('')
    const [regPasswordError, setRegPasswordError] = useState('')
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

    // MFA State
    const [mfaRequired, setMfaRequired] = useState(false)
    const [mfaCode, setMfaCode] = useState('')
    const [tempToken, setTempToken] = useState('')

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotError, setForgotError] = useState('')
    const [forgotSuccess, setForgotSuccess] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const [requiresCode, setRequiresCode] = useState(false)
    const [oauthProvider, setOauthProvider] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [codeHint, setCodeHint] = useState('')

    // Reset Password State
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [resetError, setResetError] = useState('')
    const [resetSuccess, setResetSuccess] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const getRedirectPath = (roles) => {
        if (roles?.includes('ROLE_ADMIN')) return '/dashboard'
        return '/'
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoginEmailError('')

        let valid = true;
        if (!EMAIL_REGEX.test(loginEmail)) {
            setLoginEmailError(t('auth_error_email_format'))
            valid = false;
        }

        if (!valid) return;

        const fullEmail = loginEmail
        try {
            const res = await login(fullEmail, loginPassword)
            if (res.mfaRequired) {
                setMfaRequired(true)
                setTempToken(res.tempToken)
            } else {
                toast.success(t('auth_welcome_back'));
                navigate(getRedirectPath(res.roles))
            }
        } catch (err) {
            const data = err.response?.data
            if (data?.blocked) {
                // IP is blocked — show countdown
                const remaining = data.remainingSeconds || 0
                const timeStr = remaining >= 3600 ? `${Math.floor(remaining / 3600)} giờ`
                    : remaining >= 60 ? `${Math.floor(remaining / 60)} phút`
                        : `${remaining} giây`
                toast.error(`🚫 ${data.error || (lang === 'vi'
                    ? `IP đã bị khóa. Vui lòng chờ ${timeStr}.`
                    : `IP has been blocked. Please wait ${timeStr}.`)}`)
            } else if (data?.captchaRequired) {
                const attemptsLeft = data.attemptsRemaining || 0
                toast.error(lang === 'vi'
                    ? `⚠️ Đăng nhập thất bại. Còn ${attemptsLeft} lần thử trước khi bị khóa.`
                    : `⚠️ Login failed. ${attemptsLeft} attempts remaining before lockout.`)
            } else if (data?.failureCount) {
                const attemptsLeft = data.attemptsRemaining || 0
                toast.error(lang === 'vi'
                    ? `❌ Email hoặc mật khẩu không đúng. Còn ${attemptsLeft} lần thử.`
                    : `❌ Wrong email or password. ${attemptsLeft} attempts remaining.`)
            } else {
                const errorMsg = data?.error || err.response?.data?.message || err.message || t('auth_login_failed')
                toast.error(errorMsg)
            }
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setRegEmailError('')
        setRegPasswordError('')

        if (!termsAccepted) {
            toast.error(t('auth_error_terms_required') || "You must agree to the terms.")
            return
        }

        let valid = true

        if (!EMAIL_REGEX.test(regEmail)) {
            setRegEmailError(t('auth_invalid_email'))
            valid = false
        }

        if (regPassword.length < 8 || regPassword.length > 128) {
            setRegPasswordError(t('auth_password_range'))
            valid = false
        }

        if (!valid) return

        const fullEmail = regEmail
        try {
            await register(regUsername, fullEmail, regPassword)
            toast.success(t('auth_welcome_back') || 'Registration successful!')
            navigate('/')
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || t('auth_register_failed')
            toast.error(errorMsg)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setForgotError('')
        setForgotSuccess('')
        if (!EMAIL_REGEX.test(forgotEmail)) {
            setForgotError(t('auth_invalid_email'))
            return
        }
        setForgotLoading(true)
        const fullEmail = forgotEmail
        try {
            const result = await forgotPassword(fullEmail)
            if (result.requiresCode) {
                setRequiresCode(true)
                setOauthProvider(result.provider)
                setForgotSuccess(result.message)
                if (result.hint) setCodeHint(result.hint)
            } else {
                setRequiresCode(false)
                setForgotSuccess(result.message)
                switchViewMode('reset')
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || t('auth_error_generic')
            setForgotError(errorMsg)
        }
        setForgotLoading(false)
    }

    const handleVerifyCodeAndProceed = async (e) => {
        e.preventDefault()
        if (!verificationCode || verificationCode.length !== 6) {
            setForgotError(t('auth_code_error'))
            return
        }
        setForgotError('')
        switchViewMode('reset')
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setResetError('')
        setResetSuccess('')
        setResetLoading(true)

        if (newPassword.length < 8 || newPassword.length > 128) {
            setResetError(t('auth_password_range'))
            setResetLoading(false)
            return
        }
        if (newPassword !== confirmPassword) {
            setResetError(t('auth_confirm_mismatch'))
            setResetLoading(false)
            return
        }

        const fullEmail = forgotEmail
        try {
            const result = await resetPassword(fullEmail, newPassword, requiresCode ? verificationCode : null)
            setResetSuccess(result.message)
            setTimeout(() => {
                goBackToLogin()
            }, 2000)
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || t('auth_error_generic')
            setResetError(errorMsg)
        }
        setResetLoading(false)
    }

    // ─── Smooth transition for view mode changes ───
    const switchViewMode = (newMode) => {
        setIsTransitioning(true)
        setTimeout(() => {
            setViewMode(newMode)
            setTimeout(() => setIsTransitioning(false), 50)
        }, 300)
    }

    const goBackToLogin = () => {
        setIsTransitioning(true)
        setTimeout(() => {
            setViewMode('auth')
            setIsActive(false)
            setForgotError('')
            setForgotSuccess('')
            setRequiresCode(false)
            setVerificationCode('')
            setCodeHint('')
            setNewPassword('')
            setConfirmPassword('')
            setResetError('')
            setResetSuccess('')
            setForgotEmail('')
            setForgotLoading(false)
            setShowLoginPassword(false)
            setShowRegPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)
            setOauthProvider('')
            setTimeout(() => setIsTransitioning(false), 50)
        }, 300)
    }

    // ─── Language Toggle Button (reusable) ───
    const LangToggle = () => (
        <button className="auth-lang-toggle" onClick={toggleLang} aria-label="Toggle language" id="auth-lang-toggle-btn">
            <span className="lang-icon">🌐</span>
            {lang === 'vi' ? 'EN' : 'VI'}
        </button>
    )

    // ─── Forgot Password View ───
    if (viewMode === 'forgot') {
        return (
            <div className="auth-page">
                <Link to="/" className="back-home"><i className='bx bx-arrow-back'></i> {t('auth_back_home')}</Link>
                <LangToggle />
                <div className={`auth-container forgot-container ${isTransitioning ? 'view-transitioning' : 'view-visible'}`}>
                    <div className="form-wrapper">
                        <div className="form-box show" style={{ position: 'relative' }}>
                            {!requiresCode ? (
                                <form onSubmit={handleForgotPassword}>
                                    <div className="forgot-header">
                                        <div className="forgot-icon">
                                            <i className='bx bx-lock-open-alt'></i>
                                        </div>
                                        <h1>{t('auth_forgot_title')}</h1>
                                        <p className="forgot-subtitle">{t('auth_forgot_subtitle')}</p>
                                    </div>

                                    {forgotError && <div className="error-msg">{forgotError}</div>}
                                    {forgotSuccess && <div className="success-msg">{forgotSuccess}</div>}

                                    <div className="input-box">
                                        <i className='bx bx-envelope'></i>
                                        <input
                                            type="text"
                                            placeholder={t('auth_email_placeholder')}
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-full" disabled={forgotLoading}>
                                        {forgotLoading ? (
                                            <span className="btn-loading"><i className='bx bx-loader-alt bx-spin'></i> {t('auth_processing')}</span>
                                        ) : t('auth_confirm_email')}
                                    </button>

                                    <button type="button" className="btn-back-login" onClick={goBackToLogin}>
                                        <i className='bx bx-arrow-back'></i> {t('auth_back_login')}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyCodeAndProceed}>
                                    <div className="forgot-header">
                                        <div className="forgot-icon oauth-icon">
                                            <i className={`bx bxl-${oauthProvider === 'google' ? 'google' : oauthProvider === 'facebook' ? 'facebook' : oauthProvider === 'github' ? 'github' : 'key'}`}></i>
                                        </div>
                                        <h1>{t('auth_verify_title')}</h1>
                                        <p className="forgot-subtitle">
                                            {t('auth_verify_subtitle_provider')} <strong className="provider-name">{oauthProvider.toUpperCase()}</strong>
                                        </p>
                                        <p className="forgot-subtitle">{t('auth_verify_subtitle_code')}</p>
                                    </div>

                                    {forgotError && <div className="error-msg">{forgotError}</div>}
                                    {forgotSuccess && <div className="success-msg">{forgotSuccess}</div>}

                                    {codeHint && (
                                        <div className="code-hint-box">
                                            <i className='bx bx-info-circle'></i>
                                            <span>{t('auth_code_hint')}: <strong>{codeHint}</strong></span>
                                        </div>
                                    )}

                                    <div className="input-box">
                                        <i className='bx bx-key'></i>
                                        <input
                                            type="text"
                                            placeholder={t('auth_enter_code')}
                                            required
                                            maxLength={6}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-full">
                                        {t('auth_confirm_code')}
                                    </button>

                                    <button type="button" className="btn-back-login" onClick={goBackToLogin}>
                                        <i className='bx bx-arrow-back'></i> {t('auth_back_login')}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Reset Password View ───
    if (viewMode === 'reset') {
        return (
            <div className="auth-page">
                <Link to="/" className="back-home"><i className='bx bx-arrow-back'></i> {t('auth_back_home')}</Link>
                <LangToggle />
                <div className={`auth-container forgot-container ${isTransitioning ? 'view-transitioning' : 'view-visible'}`}>
                    <div className="form-wrapper">
                        <div className="form-box show" style={{ position: 'relative' }}>
                            <form onSubmit={handleResetPassword}>
                                <div className="forgot-header">
                                    <div className="forgot-icon reset-icon">
                                        <i className='bx bx-reset'></i>
                                    </div>
                                    <h1>{t('auth_reset_title')}</h1>
                                    <p className="forgot-subtitle">{t('auth_reset_subtitle')}</p>
                                    <p className="forgot-subtitle email-display">
                                        <i className='bx bx-envelope'></i> {forgotEmail}
                                    </p>
                                </div>

                                {resetError && <div className="error-msg">{resetError}</div>}
                                {resetSuccess && <div className="success-msg">{resetSuccess}</div>}

                                <div className="input-box">
                                    <i className='bx bx-lock-alt'></i>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder={t('auth_new_password')}
                                        required
                                        maxLength={128}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <i className={`bx ${showNewPassword ? 'bx-hide' : 'bx-show'} toggle-password`} onClick={() => setShowNewPassword(!showNewPassword)}></i>
                                </div>

                                <div className="input-box">
                                    <i className='bx bx-check-shield'></i>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder={t('auth_confirm_password')}
                                        required
                                        maxLength={128}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <i className={`bx ${showConfirmPassword ? 'bx-hide' : 'bx-show'} toggle-password`} onClick={() => setShowConfirmPassword(!showConfirmPassword)}></i>
                                </div>

                                <div className="password-rules">
                                    <span className={newPassword.length >= 8 && newPassword.length <= 128 ? 'rule-ok' : 'rule-pending'}>
                                        <i className={`bx ${newPassword.length >= 8 && newPassword.length <= 128 ? 'bx-check-circle' : 'bx-circle'}`}></i>
                                        {t('auth_password_rule_range')}
                                    </span>
                                    <span className={newPassword && newPassword === confirmPassword ? 'rule-ok' : 'rule-pending'}>
                                        <i className={`bx ${newPassword && newPassword === confirmPassword ? 'bx-check-circle' : 'bx-circle'}`}></i>
                                        {t('auth_password_rule_match')}
                                    </span>
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={resetLoading}>
                                    {resetLoading ? (
                                        <span className="btn-loading"><i className='bx bx-loader-alt bx-spin'></i> {t('auth_processing')}</span>
                                    ) : t('auth_reset_btn')}
                                </button>

                                <button type="button" className="btn-back-login" onClick={goBackToLogin}>
                                    <i className='bx bx-arrow-back'></i> {t('auth_back_login')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <Link to="/" className="back-home"><i className='bx bx-arrow-back'></i> {t('auth_back_home')}</Link>
            <LangToggle />

            {/* ═══ TERMS & POLICY MODAL ═══ */}
            {isTermsModalOpen && (
                <div className="terms-modal-overlay" onClick={() => setIsTermsModalOpen(false)}>
                    <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="terms-modal-header">
                            <div className="terms-modal-icon">
                                <i className='bx bx-shield-quarter'></i>
                            </div>
                            <h2>{lang === 'vi' ? 'Điều khoản Dịch vụ & Chính sách Bảo mật' : 'Terms of Service & Privacy Policy'}</h2>
                            <p className="terms-modal-subtitle">CyberShield Security Platform</p>
                            <button className="terms-modal-close" onClick={() => setIsTermsModalOpen(false)}>
                                <i className='bx bx-x'></i>
                            </button>
                        </div>
                        <div className="terms-modal-body">
                            {/* Điều 1 */}
                            <div className="terms-article">
                                <div className="terms-article-header">
                                    <span className="terms-article-num">01</span>
                                    <h3>{lang === 'vi' ? 'Chấp thuận giám sát an ninh bằng AI' : 'Consent to AI Security Monitoring'}</h3>
                                </div>
                                <div className="terms-article-content">
                                    <p>{lang === 'vi'
                                        ? 'Bằng việc sử dụng nền tảng CyberShield, bạn đồng ý cho phép hệ thống Trí tuệ Nhân tạo (AI) giám sát và phân tích các hoạt động truy cập để phát hiện hành vi bất thường, bao gồm nhưng không giới hạn:'
                                        : 'By using the CyberShield platform, you consent to Artificial Intelligence (AI) systems monitoring and analyzing access activities to detect anomalous behavior, including but not limited to:'}
                                    </p>
                                    <ul>
                                        <li>{lang === 'vi' ? 'Phân tích payload đầu vào để phát hiện SQL Injection và XSS.' : 'Analyzing input payloads to detect SQL Injection and XSS.'}</li>
                                        <li>{lang === 'vi' ? 'Phát hiện hành vi đăng nhập bất thường (brute force, credential stuffing).' : 'Detecting anomalous login behavior (brute force, credential stuffing).'}</li>
                                        <li>{lang === 'vi' ? 'Tự động chặn IP vi phạm thông qua cơ chế SOAR (Security Orchestration, Automation and Response).' : 'Automatically blocking offending IPs via SOAR (Security Orchestration, Automation and Response) mechanisms.'}</li>
                                        <li>{lang === 'vi' ? 'Sử dụng mô hình Machine Learning (Isolation Forest, TF-IDF) để đánh giá rủi ro theo thời gian thực.' : 'Using Machine Learning models (Isolation Forest, TF-IDF) for real-time risk assessment.'}</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Điều 2 */}
                            <div className="terms-article">
                                <div className="terms-article-header">
                                    <span className="terms-article-num">02</span>
                                    <h3>{lang === 'vi' ? 'Thu thập và xử lý địa chỉ IP' : 'IP Address Collection & Processing'}</h3>
                                </div>
                                <div className="terms-article-content">
                                    <p>{lang === 'vi'
                                        ? 'Hệ thống CyberShield thu thập và lưu trữ vĩnh viễn các thông tin sau phục vụ mục đích bảo mật và huấn luyện mô hình AI:'
                                        : 'CyberShield permanently collects and stores the following information for security purposes and AI model training:'}
                                    </p>
                                    <ul>
                                        <li>{lang === 'vi' ? 'Địa chỉ IP (IPv4/IPv6) của mọi lần đăng nhập (thành công hoặc thất bại).' : 'IP addresses (IPv4/IPv6) of every login attempt (successful or failed).'}</li>
                                        <li>{lang === 'vi' ? 'Thời gian truy cập (timestamp) chính xác đến giây.' : 'Access timestamps accurate to the second.'}</li>
                                        <li>{lang === 'vi' ? 'User-Agent trình duyệt, lý do thất bại, và trạng thái chặn.' : 'Browser User-Agent, failure reasons, and blocking status.'}</li>
                                        <li>{lang === 'vi' ? 'Dữ liệu được mã hóa AES-256 khi lưu trữ (encryption at rest) và truyền tải qua HTTPS.' : 'Data is encrypted with AES-256 at rest and transmitted via HTTPS.'}</li>
                                    </ul>
                                    <div className="terms-highlight">
                                        <i className='bx bx-info-circle'></i>
                                        <span>{lang === 'vi'
                                            ? 'Dữ liệu IP được lưu trữ vĩnh viễn trong PostgreSQL để xây dựng dataset huấn luyện AI. Bạn có quyền yêu cầu xóa dữ liệu cá nhân theo quy định GDPR.'
                                            : 'IP data is permanently stored in PostgreSQL for AI training datasets. You have the right to request personal data deletion under GDPR regulations.'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Điều 3 */}
                            <div className="terms-article">
                                <div className="terms-article-header">
                                    <span className="terms-article-num">03</span>
                                    <h3>{lang === 'vi' ? 'Giới hạn trách nhiệm pháp lý' : 'Limitation of Liability'}</h3>
                                </div>
                                <div className="terms-article-content">
                                    <p>{lang === 'vi'
                                        ? 'CyberShield được cung cấp dưới dạng "NGUYÊN TRẠNG" (AS-IS) cho mục đích nghiên cứu và học thuật tại phòng LAB Bảo mật Mạng. Chúng tôi không chịu trách nhiệm về:'
                                        : 'CyberShield is provided "AS-IS" for research and academic purposes at the Cybersecurity LAB. We are not responsible for:'}
                                    </p>
                                    <ul>
                                        <li>{lang === 'vi' ? 'Thiệt hại phát sinh từ việc IP bị chặn tự động bởi hệ thống AI SOAR.' : 'Damages arising from IPs automatically blocked by the AI SOAR system.'}</li>
                                        <li>{lang === 'vi' ? 'Gián đoạn dịch vụ do bảo trì hệ thống hoặc cập nhật mô hình AI.' : 'Service interruptions due to system maintenance or AI model updates.'}</li>
                                        <li>{lang === 'vi' ? 'Kết quả phân tích sai (false positive/negative) của mô hình Machine Learning.' : 'Incorrect analysis results (false positive/negative) from Machine Learning models.'}</li>
                                    </ul>
                                    <div className="terms-highlight terms-highlight--warning">
                                        <i className='bx bx-error'></i>
                                        <span>{lang === 'vi'
                                            ? 'Vi phạm chính sách bảo mật (brute force, injection attacks) sẽ dẫn đến việc IP bị chặn tự động từ 1 phút đến 24 giờ tùy mức độ vi phạm.'
                                            : 'Violating security policies (brute force, injection attacks) will result in automatic IP blocking from 1 minute to 24 hours depending on severity.'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="terms-footer-info">
                                <p>{lang === 'vi'
                                    ? '📅 Cập nhật lần cuối: Tháng 3, 2026 — Phiên bản 2.0'
                                    : '📅 Last updated: March 2026 — Version 2.0'}
                                </p>
                            </div>
                        </div>
                        <div className="terms-modal-footer">
                            <button
                                className="terms-accept-btn"
                                onClick={() => { setTermsAccepted(true); setIsTermsModalOpen(false) }}
                            >
                                <i className='bx bx-check-shield'></i>
                                {lang === 'vi' ? 'Tôi đã đọc và đồng ý' : 'I have read and agree'}
                            </button>
                            <button
                                className="terms-close-btn"
                                onClick={() => setIsTermsModalOpen(false)}
                            >
                                {lang === 'vi' ? 'Đóng' : 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mfaRequired && (
                <MfaModal
                    isOpen={true}
                    mode="verify"
                    tempToken={tempToken}
                    onClose={() => {
                        setMfaRequired(false);
                        setMfaCode('');
                        setTempToken('');
                    }}
                    onSuccess={(res) => navigate(getRedirectPath(res?.roles))}
                />
            )}

            <div className={`auth-container ${isActive ? 'active' : ''} ${isTransitioning ? 'view-transitioning' : 'view-visible'}`} id="container">

                {/* Form Wrapper */}
                <div className="form-wrapper">
                    {/* Sign Up Form */}
                    <div className={`form-box register`}>
                        <form onSubmit={handleRegister}>
                            <h1>{t('auth_register')}</h1>

                            <div className="input-box">
                                <i className='bx bx-user'></i>
                                <input
                                    type="text"
                                    placeholder={t('auth_username_placeholder')}
                                    required
                                    minLength={3}
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                />
                            </div>
                            <div className="input-box" style={{ marginBottom: regEmailError ? '2rem' : '1.5rem' }}>
                                <i className='bx bx-envelope'></i>
                                <input
                                    type="text"
                                    placeholder={t('auth_email_placeholder')}
                                    required
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    className={regEmailError ? 'input-error' : ''}
                                />
                                {regEmailError && <span className="inline-error-text" style={{ color: '#f85149', fontSize: '0.8rem', position: 'absolute', bottom: '-20px', left: '0' }}>{regEmailError}</span>}
                            </div>
                            <div className="input-box" style={{ marginBottom: regPasswordError ? '2rem' : '1.5rem' }}>
                                <i className='bx bx-lock-alt'></i>
                                <input
                                    type={showRegPassword ? "text" : "password"}
                                    placeholder={t('auth_password_placeholder')}
                                    required
                                    maxLength={128}
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    className={regPasswordError ? 'input-error' : ''}
                                />
                                <i className={`bx ${showRegPassword ? 'bx-hide' : 'bx-show'} toggle-password`} onClick={() => setShowRegPassword(!showRegPassword)}></i>
                                {regPasswordError && <span className="inline-error-text" style={{ color: '#f85149', fontSize: '0.8rem', position: 'absolute', bottom: '-20px', left: '0' }}>{regPasswordError}</span>}
                            </div>

                            {/* Password Strength Meter */}
                            <PasswordStrengthMeter password={regPassword} lang={lang} />

                            <div className="terms-checkbox" style={{ display: 'flex', alignItems: 'flex-start', margin: '15px 0', fontSize: '0.85rem', textAlign: 'left', lineHeight: '1.4' }}>
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    style={{ marginTop: '3px', marginRight: '8px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                                />
                                <label htmlFor="terms" style={{ color: 'var(--text-secondary)' }}>
                                    {t('auth_terms_agree')}{' '}
                                    <span
                                        onClick={(e) => { e.preventDefault(); setIsTermsModalOpen(true) }}
                                        style={{ color: '#58a6ff', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                                    >
                                        {t('auth_terms_of_service')}
                                    </span>
                                    {' '}{t('auth_and')}{' '}
                                    <span
                                        onClick={(e) => { e.preventDefault(); setIsTermsModalOpen(true) }}
                                        style={{ color: '#58a6ff', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                                    >
                                        {t('auth_privacy_policy')}
                                    </span>.
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={!termsAccepted} style={{ opacity: termsAccepted ? 1 : 0.6 }}>{t('auth_register')}</button>

                            <p className="divider">{t('auth_or_register_with')}</p>
                            <div className="social-icons">
                                <button type="button" onClick={() => handleSocialLogin('google')} className="social-btn google-btn" title="Google">
                                    <i className='bx bxl-google'></i>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('facebook')} className="social-btn facebook-btn" title="Facebook">
                                    <i className='bx bxl-facebook'></i>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('github')} className="social-btn github-btn" title="GitHub">
                                    <i className='bx bxl-github'></i>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('linkedin')} className="social-btn linkedin-btn" title="LinkedIn">
                                    <i className='bx bxl-linkedin'></i>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className={`form-box login`}>
                        <form onSubmit={handleLogin}>
                            <h1>{t('auth_login')}</h1>

                            <div className="input-box" style={{ marginBottom: loginEmailError ? '2rem' : '1.5rem' }}>
                                <i className='bx bx-envelope'></i>
                                <input
                                    type="text"
                                    placeholder={t('auth_email_placeholder')}
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className={loginEmailError ? 'input-error' : ''}
                                />
                                {loginEmailError && <span className="inline-error-text" style={{ color: '#f85149', fontSize: '0.8rem', position: 'absolute', bottom: '-20px', left: '0' }}>{loginEmailError}</span>}
                            </div>
                            <div className="input-box">
                                <i className='bx bx-lock-alt'></i>
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    placeholder={t('auth_password_placeholder')}
                                    required
                                    maxLength={128}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <i className={`bx ${showLoginPassword ? 'bx-hide' : 'bx-show'} toggle-password`} onClick={() => setShowLoginPassword(!showLoginPassword)}></i>
                            </div>
                            <div className="forgot-link">
                                <a href="#" onClick={(e) => { e.preventDefault(); switchViewMode('forgot') }}>{t('auth_forgot_password')}</a>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full">
                                {t('auth_login')}
                            </button>

                            <p className="divider">{t('auth_or_login_with')}</p>
                            <div className="social-icons">
                                <button type="button" onClick={() => handleSocialLogin('google')} className="social-btn google-btn" title="Google">
                                    <i className='bx bxl-google'></i>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('facebook')} className="social-btn facebook-btn" title="Facebook">
                                    <i className='bx bxl-facebook'></i>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('github')} className="social-btn github-btn" title="GitHub">
                                    <i className='bx bxl-github'></i>
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('linkedin')} className="social-btn linkedin-btn" title="LinkedIn">
                                    <i className='bx bxl-linkedin'></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Toggle Box (Desktop) */}
                <div className="toggle-box desktop-only">
                    <div className={`toggle-panel toggle-left`}>
                        <h1>{t('auth_welcome_back')}</h1>
                        <p>{t('auth_have_account')}</p>
                        <button className="btn btn-outline" onClick={() => setIsActive(false)}>{t('auth_login')}</button>
                    </div>
                    <div className={`toggle-panel toggle-right`}>
                        <h1>{t('auth_hello')}</h1>
                        <p>{t('auth_no_account')}</p>
                        <button className="btn btn-outline" onClick={() => setIsActive(true)}>{t('auth_register')}</button>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <div className="mobile-toggle">
                    <button className="toggle-link" onClick={() => setIsActive(!isActive)}>
                        {isActive ? t('auth_mobile_login') : t('auth_mobile_register')}
                    </button>
                </div>

            </div>
        </div>
    )
}
