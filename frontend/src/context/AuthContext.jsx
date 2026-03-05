
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// Axios instance
const api = axios.create({
    baseURL: 'https://localhost:8443/api',
    withCredentials: true
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Attach token to requests
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    useEffect(() => {
        const checkAuth = async () => {
            // Check if we can get user (via cookie OR token)
            const token = localStorage.getItem('token')
            // If no token in localstorage, we still try to hit 'me' 
            // because OAuth sets cookie.

            try {
                const res = await api.get('/auth/me')
                setUser(res.data)
            } catch (err) {
                // If 401, not logged in
                setUser(null)
            }
            setLoading(false)
        }
        checkAuth()
    }, [])

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        if (res.data.mfaRequired) {
            return { mfaRequired: true, tempToken: res.data.token };
        }
        setUser({
            username: res.data.username,
            email: res.data.email,
            roles: res.data.roles,
            mfaEnabled: res.data.mfaEnabled
        })
        return { success: true, roles: res.data.roles }
    }

    const verifyMfa = async (tempToken, code) => {
        const res = await api.post('/auth/mfa/verify', { code }, {
            headers: { Authorization: `Bearer ${tempToken}` }
        });
        // Response includes user details
        setUser({ username: res.data.username, email: res.data.email, roles: res.data.roles, mfaEnabled: res.data.mfaEnabled });
        return { success: true };
    }

    const register = async (username, email, password) => {
        const res = await api.post('/auth/register', { username, email, password })
        setUser({ username: res.data.username, email: res.data.email, roles: res.data.roles })
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (e) {
            console.error(e)
        }
        localStorage.removeItem('token') // Keep cleaning up any old state just in case
        setUser(null)
        window.location.href = '/login'
    }

    const forgotPassword = async (email) => {
        const res = await api.post('/auth/forgot-password', { email })
        return res.data
    }

    const resetPassword = async (email, newPassword, verificationCode) => {
        const res = await api.post('/auth/reset-password', { email, newPassword, verificationCode })
        return res.data
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, verifyMfa, register, logout, loading, setLoading, api, forgotPassword, resetPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
