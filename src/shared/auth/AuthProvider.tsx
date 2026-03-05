import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser, UserRole } from '@/shared/types/types';
import { authApi } from '@/shared/api/authApi';

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthContextValue = {
    user: AuthUser | null;
    isLoading: boolean;
    isPatient: boolean;
    isProvider: boolean;
    signIn: (email: string, password: string) => AuthUser | null;
    signInAsRole: (role: UserRole) => AuthUser;
    signUpPatient: (name: string, email: string) => AuthUser;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const stored = authApi.getCurrentUser();
        setUser(stored);
        setIsLoading(false);
    }, []);

    const signIn = (email: string, password: string): AuthUser | null => {
        const u = authApi.signIn(email, password);
        setUser(u);
        return u;
    };

    const signInAsRole = (role: UserRole): AuthUser => {
        const u = authApi.signInAsRole(role);
        setUser(u);
        return u;
    };

    const signUpPatient = (name: string, email: string): AuthUser => {
        const u = authApi.signUpPatient(name, email);
        setUser(u);
        return u;
    };

    const signOut = () => {
        authApi.signOut();
        setUser(null);
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isLoading,
            isPatient: user?.userType === 'PATIENT',
            isProvider: user?.userType === 'ORG_USER',
            signIn,
            signInAsRole,
            signUpPatient,
            signOut,
        }),
        [user, isLoading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
