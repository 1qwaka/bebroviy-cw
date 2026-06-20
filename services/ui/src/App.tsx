import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Callback } from './pages/Callback';
import { Hotels } from './pages/Hotels';
import { Profile } from './pages/Profile';
import { AdminStats } from './pages/AdminStats';

const IndexRedirect = () => {
    const { role } = useAuth();
    if (role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/hotels" replace />;
};

export const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/callback" element={<Callback />} />

                    <Route element={<Layout />}>
                        {/* Базовый редирект в зависимости от роли */}
                        <Route path="/" element={<ProtectedRoute />}>
                            <Route index element={<IndexRedirect />} />
                        </Route>

                        {/* Зона пользователя */}
                        <Route element={<ProtectedRoute allowedRole="User" />}>
                            <Route path="/hotels" element={<Hotels />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* Зона админа */}
                        <Route element={<ProtectedRoute allowedRole="Admin" />}>
                            <Route path="/admin" element={<AdminStats />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};