import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, parseJwt, removeToken, setToken } from '../utils/auth';

type Role = 'Admin' | 'User' | null;

interface AuthContextType {
    isAuthenticated: boolean;
    role: Role;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<Role>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.exp * 1000 > Date.now()) {
                setIsAuthenticated(true);
                // Fallback на 'User', если IDP не вернул роль явно, чтобы пустить в систему
                setRole(payload.role || 'User');
            } else {
                removeToken();
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        setToken(token);
        const payload = parseJwt(token);
        setIsAuthenticated(true);
        setRole(payload?.role || 'User');
    };

    const logout = () => {
        removeToken();
        setIsAuthenticated(false);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};