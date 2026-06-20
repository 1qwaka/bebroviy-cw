import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
    const { role, logout } = useAuth();

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans">
            <header className="border-b border-zinc-200 py-4 px-6 flex justify-between items-center">
                <div className="font-semibold text-lg tracking-tight">Booking System</div>
                <nav className="flex gap-6 items-center text-sm font-medium">
                    {role === 'Admin' ? (
                        <Link to="/admin" className="hover:text-zinc-600 transition-colors">Статистика</Link>
                    ) : (
                        <>
                            <Link to="/hotels" className="hover:text-zinc-600 transition-colors">Отели</Link>
                            <Link to="/profile" className="hover:text-zinc-600 transition-colors">Мои бронирования</Link>
                        </>
                    )}
                    <button
                        onClick={logout}
                        className="text-zinc-500 hover:text-black transition-colors"
                    >
                        Выйти
                    </button>
                </nav>
            </header>
            <main className="max-w-6xl mx-auto p-6 mt-4">
                <Outlet />
            </main>
        </div>
    );
};