import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, parseJwt, removeToken, setToken } from '../utils/auth';

type Role = 'Admin' | 'User' | null;


export interface UserProfile {
    username: string;
    email: string;
    name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    role: Role;
    user?: UserProfile | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<Role>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.exp * 1000 > Date.now()) {
                setIsAuthenticated(true);
                setRole(payload.role || 'User');
                setUser({
                    username: payload.preferred_username || '',
                    email: payload.email || '',
                    name: payload.name || '',
                });
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
        setUser(payload ? {
            username: payload.preferred_username || '',
            email: payload.email || '',
            name: payload.name || '',
        } : null);
    };

    const logout = () => {
        removeToken();
        setIsAuthenticated(false);
        setRole(null);
        setUser(null)
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

