
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import SafeOutput from '../components/SafeOutput'
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
    const { user, api } = useAuth()
    const [qrUrl, setQrUrl] = useState('')
    const [mfaCode, setMfaCode] = useState('')
    const [setupStep, setSetupStep] = useState(0) // 0: None, 1: QR, 2: Verify
    const [msg, setMsg] = useState('')

    const handleSetupMFA = async () => {
        try {
            const res = await api.post('/auth/mfa/setup')
            setQrUrl(res.data.qrCodeUrl)
            setSetupStep(1)
            setMsg('')
        } catch (err) {
            setMsg('Failed to start MFA setup')
        }
    }

    const handleEnableMFA = async () => {
        try {
            await api.post('/auth/mfa/enable', { code: parseInt(mfaCode) })
            setMsg('MFA Enabled Successfully!')
            setSetupStep(0)
            // Ideally refresh user here
            window.location.reload()
        } catch (err) {
            setMsg('Invalid Code. Try again.')
        }
    }

    return (
        <div className="container section">
            <div className="card max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">User Dashboard</h2>

                <div className="space-y-4">
                    <div className="p-4 bg-opacity-10 bg-white rounded-lg border border-border">
                        <h3 className="text-secondary text-sm mb-1">Username</h3>
                        <p className="text-lg font-medium"><SafeOutput>{user?.username}</SafeOutput></p>
                    </div>

                    <div className="p-4 bg-opacity-10 bg-white rounded-lg border border-border">
                        <h3 className="text-secondary text-sm mb-1">Email</h3>
                        <p className="text-lg font-medium"><SafeOutput>{user?.email}</SafeOutput></p>
                    </div>

                    <div className="p-4 bg-opacity-10 bg-white rounded-lg border border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-secondary text-sm mb-1">Security Status</h3>
                            <div className="flex items-center gap-2">
                                {user?.mfaEnabled ? (
                                    <>
                                        <CheckCircle className="text-green-500" size={20} />
                                        <span className="text-green-500 font-medium">MFA Enabled</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="text-yellow-500" size={20} />
                                        <span className="text-yellow-500 font-medium">MFA Disabled</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {!user?.mfaEnabled && setupStep === 0 && (
                            <button onClick={handleSetupMFA} className="btn btn-primary flex items-center gap-2">
                                <Shield size={18} /> Setup MFA
                            </button>
                        )}
                    </div>

                    {setupStep === 1 && (
                        <div className="mt-6 p-6 border border-border rounded-lg bg-bg-dark text-center">
                            <h3 className="text-xl mb-4">Scan this QR Code</h3>
                            <div className="bg-white p-4 inline-block rounded-lg mb-4">
                                <QRCodeSVG value={qrUrl} size={200} />
                            </div>
                            <p className="text-secondary mb-4 text-sm">Use Google Authenticator or Authy app to scan.</p>

                            <div className="max-w-xs mx-auto">
                                <input
                                    type="number"
                                    placeholder="Enter 6-digit code"
                                    className="form-control mb-3 text-center"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                />
                                <button onClick={handleEnableMFA} className="btn btn-primary w-full">Enable MFA</button>
                            </div>
                        </div>
                    )}

                    {msg && <div className={`text-center p-2 rounded ${msg.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>{msg}</div>}
                </div>
            </div>
        </div>
    )
}
