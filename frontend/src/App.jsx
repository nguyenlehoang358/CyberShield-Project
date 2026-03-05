import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { LabProgressProvider } from './context/LabProgressContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIChatWidget from './components/AIChatWidget/AIChatWidget'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import About from './pages/About/About'
import Certificate from './pages/About/Certificate'
import Customer from './pages/About/Customer'
import Partner from './pages/About/Partner'
import Contact from './pages/Contact/Contact'
import Placeholder from './components/Placeholder'
import LabHub from './pages/Lab/LabHub'
import LabLayout from './pages/Lab/LabLayout'
import LabSkeleton from './pages/Lab/LabSkeleton'
import axios from 'axios';
/* ─────────────────────────────────────────
   Lazy-loaded Lab Modules (Code Splitting)
   Each lab is 40-53KB — loading on-demand
   cuts initial bundle by ~350KB
   ───────────────────────────────────────── */
const EncryptionLab = lazy(() => import('./pages/Lab/EncryptionLab'))
const HashingLab = lazy(() => import('./pages/Lab/HashingLab'))
const FirewallLab = lazy(() => import('./pages/Lab/FirewallLab'))
const XSSLab = lazy(() => import('./pages/Lab/XSSLab'))
const SQLiLab = lazy(() => import('./pages/Lab/SQLiLab'))
const PasswordLab = lazy(() => import('./pages/Lab/PasswordLab'))
const HttpsLab = lazy(() => import('./pages/Lab/HttpsLab'))
const JWTLab = lazy(() => import('./pages/Lab/JWTLab'))

// Phase 4 — Ecosystem
const BlogList = lazy(() => import('./pages/Blog/BlogList'))

// Hãy dùng cách lấy IP động:
const currentIP = window.location.hostname; 
const baseURL = `https://${currentIP}:8443/api`;

const axiosClient = axios.create({
    baseURL: baseURL,
    // các cấu hình khác của bạn (headers, credentials...) giữ nguyên
});

// const BlogPost      = lazy(() => import('./pages/Blog/BlogPost')) // Sẽ thêm sau khi tạo file chi tiết
const SecurityScanner = lazy(() => import('./pages/Tools/SecurityScanner'))
import CTFHub from './pages/CTF/CTFHub'
import { Toaster } from 'sonner'

function ProtectedRoute() {
    const { user, loading } = useAuth()
    if (loading) return <div className="p-10 text-center">Loading...</div>
    return user ? <Outlet /> : <Navigate to="/login" />
}

function AdminRoute() {
    const { user, loading } = useAuth()
    if (loading) return <div className="p-10 text-center">Loading...</div>
    if (!user) return <Navigate to="/login" />
    const isAdmin = user.roles?.includes('ROLE_ADMIN')
    return isAdmin ? <Outlet /> : <Navigate to="/" />
}

function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Outlet />
            </main>
            <Footer />
            <AIChatWidget />
        </div>
    )
}

function App() {
    return (
        <LanguageProvider>
            <LabProgressProvider>
                <AuthProvider>
                    <Toaster richColors position="top-right" />
                    <Router>
                        <Routes>
                            {/* Admin Dashboard - Fullscreen layout riêng (không dùng Navbar) */}
                            <Route element={<AdminRoute />}>
                                <Route path="/dashboard" element={<AdminDashboard />} />
                            </Route>

                            {/* Auth Pages - Fullscreen (không Navbar, không Footer) */}
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/register" element={<AuthPage />} />

                            {/* Main Layout (có Navbar + Footer) */}
                            <Route element={<Layout />}>
                                <Route path="/" element={<Home />} />

                                {/* User Profile - Yêu cầu đăng nhập */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/profile" element={<Dashboard />} />
                                </Route>

                                {/* About Us Routes */}
                                <Route path="/about" element={<About />} />
                                <Route path="/about/intro" element={<About />} />
                                <Route path="/about/cert" element={<Certificate />} />
                                <Route path="/about/customer" element={<Customer />} />
                                <Route path="/about/partner" element={<Partner />} />

                                {/* Lab Hub — Main page */}
                                <Route path="/lab" element={<LabHub />} />

                                {/* Lab Modules — Lazy loaded with Suspense */}
                                <Route path="/lab" element={<LabLayout />}>
                                    <Route path="encryption" element={<Suspense fallback={<LabSkeleton />}><EncryptionLab /></Suspense>} />
                                    <Route path="hashing" element={<Suspense fallback={<LabSkeleton />}><HashingLab /></Suspense>} />
                                    <Route path="firewall" element={<Suspense fallback={<LabSkeleton />}><FirewallLab /></Suspense>} />
                                    <Route path="xss" element={<Suspense fallback={<LabSkeleton />}><XSSLab /></Suspense>} />
                                    <Route path="sqli" element={<Suspense fallback={<LabSkeleton />}><SQLiLab /></Suspense>} />
                                    <Route path="password" element={<Suspense fallback={<LabSkeleton />}><PasswordLab /></Suspense>} />
                                    <Route path="https" element={<Suspense fallback={<LabSkeleton />}><HttpsLab /></Suspense>} />
                                    <Route path="jwt" element={<Suspense fallback={<LabSkeleton />}><JWTLab /></Suspense>} />
                                </Route>

                                {/* Phase 4 — Ecosystem Routes */}
                                <Route path="/blog" element={<Suspense fallback={<div className="p-10 text-center">Loading Blog...</div>}><BlogList /></Suspense>} />
                                <Route path="/tools/scanner" element={<Suspense fallback={<div className="p-10 text-center">Loading Scanner...</div>}><SecurityScanner /></Suspense>} />
                                <Route path="/ctf" element={<Suspense fallback={<div className="p-10 text-center">Loading CTF Arena...</div>}><CTFHub /></Suspense>} />

                                {/* Other Pages */}
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/news" element={<Placeholder title="News & Events" />} />
                                <Route path="/recruitment" element={<Placeholder title="Join Our Team" />} />
                                <Route path="*" element={<Placeholder title="404 Not Found" />} />
                            </Route>
                        </Routes>
                    </Router>
                </AuthProvider>
            </LabProgressProvider>
        </LanguageProvider>
    )
}

export default App
