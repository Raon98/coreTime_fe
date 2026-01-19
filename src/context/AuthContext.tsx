'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'OWNER' | 'INSTRUCTOR' | null;

interface User {
    id: string;
    name: string;
    role: UserRole;
    organizationId?: string | null;
    status?: 'ACTIVE' | 'PENDING' | 'REJECTED';
}

interface AuthContextType {
    user: User | null;
    login: (provider: 'kakao' | 'google') => void;
    logout: () => void;
    selectIdentity: (role: UserRole) => void;
    registerOwner: (data: any) => void;
    registerInstructor: (code: string) => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Load user from local storage on mount (simple persistence)
    useEffect(() => {
        // FOR DEV: Default to OWNER if no user found
        const stored = localStorage.getItem('coretime_user');
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            // DEV OVERRIDE
            const devUser: User = {
                id: 'dev_owner',
                name: '개발자(원장)',
                role: 'OWNER',
                organizationId: 'org_dev',
                status: 'ACTIVE'
            };
            setUser(devUser);
        }
    }, []);

    const login = (provider: 'kakao' | 'google') => {
        // Simulate social login
        const mockUser: User = {
            id: 'user_123',
            name: '홍길동',
            role: null, // No role yet
        };
        setUser(mockUser);
        localStorage.setItem('coretime_user', JSON.stringify(mockUser));

        // If no role, go to identity selection
        // If role exists, go to dashboard
        if (!mockUser.role) {
            router.push('/identity');
        } else {
            router.push('/');
        }
    };

    const selectIdentity = (role: UserRole) => {
        if (!user) return;
        const updated = { ...user, role };
        // Don't save yet? Or save as partial? 
        // Spec says: "Account creation after social login -> identity selection"
        // Let's assume we update the user state but they still need to complete registration
        setUser(updated);
        localStorage.setItem('coretime_user', JSON.stringify(updated));

        if (role === 'OWNER') {
            router.push('/register/owner');
        } else {
            router.push('/register/instructor');
        }
    };

    const registerOwner = (data: any) => {
        if (!user) return;
        const updated: User = {
            ...user,
            role: 'OWNER',
            organizationId: 'org_' + Math.floor(Math.random() * 1000),
            status: 'ACTIVE'
        };
        setUser(updated);
        localStorage.setItem('coretime_user', JSON.stringify(updated));
        router.push('/'); // Go to dashboard
    };

    const registerInstructor = (code: string) => {
        if (!user) return;
        // Simulate pending approval
        const updated: User = {
            ...user,
            role: 'INSTRUCTOR',
            organizationId: 'org_pending',
            status: 'PENDING'
        };
        setUser(updated);
        localStorage.setItem('coretime_user', JSON.stringify(updated));
        router.push('/register/pending');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('coretime_user');
        router.push('/login');
    };

    const checkAuth = () => {
        // Helper to redirect if not logged in?
        // For now just relying on state
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, selectIdentity, registerOwner, registerInstructor, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
