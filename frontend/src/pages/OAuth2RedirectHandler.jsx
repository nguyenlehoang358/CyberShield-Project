import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setLoading, api } = useAuth(); // we need to export these from context

    useEffect(() => {
        const handleOAuth2Callback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (token) {
                localStorage.setItem('token', token);
                try {
                    // Update interceptor manually for this specific fetch if needed,
                    // but axios interceptor should pick up localStorage immediately if we 
                    // await a new request. Let's force it on headers just in case:
                    const res = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (setUser) setUser(res.data);
                    navigate('/dashboard', { replace: true });
                } catch (err) {
                    console.error("Token provided but failed to fetch user", err);
                    localStorage.removeItem('token');
                    navigate('/login?error=auth_failed_after_oauth');
                }
            } else {
                console.error("OAuth2 Error:", error || "No token found");
                navigate('/login?error=' + (error || "oauth2_failed"));
            }
        };

        handleOAuth2Callback();
    }, [searchParams, navigate, api, setUser]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <i className='bx bx-loader-alt bx-spin text-4xl text-blue-500'></i>
                <div className="text-xl font-semibold">Authenticating... Please wait</div>
            </div>
        </div>
    );
}
