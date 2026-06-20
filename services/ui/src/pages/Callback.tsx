import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const called = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code || called.current) return;
        called.current = true;

        apiClient.get(`/callback?code=${code}`)
            .then((response) => {
                const token = response.data.access_token;
                if (token) {
                    login(token);
                    navigate('/');
                } else {
                    throw new Error('No token in response');
                }
            })
            .catch((err) => {
                console.error('Ошибка авторизации', err);
                navigate('/login');
            });
    }, [searchParams, login, navigate]);

    return <div className="p-8 text-zinc-500">Авторизация...</div>;
};