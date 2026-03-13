import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { UserRole } from '@/shared/types/types';

const ADMIN_ROLES: UserRole[] = [
    'super_admin', 'support_agent', 'verification_officer',
    'security_admin', 'finance_admin', 'data_governance', 'admin',
];

interface RequireRoleProps {
    children: React.ReactNode;
    allow: UserRole[] | 'patient' | 'provider' | 'admin' | 'super_admin' | 'any';
}

export function RequireRole({ children, allow }: RequireRoleProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // const permitted =
    //     allow === 'any' ? true
    //         : allow === 'patient' ? user.userType === 'PATIENT'
    //             : allow === 'provider' ? user.userType === 'ORG_USER'
    //                 : allow === 'super_admin' ? (user.roles ?? []).includes('super_admin')
    //                     : allow === 'admin' ? (user.roles ?? []).some(r => ADMIN_ROLES.includes(r))
    //                         : (user.roles ?? []).some(r => (allow as UserRole[]).includes(r));

    // if (!permitted) {
    //     const role = user.roles?.[0] ?? '';
    //     if (role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
    //     if (ADMIN_ROLES.includes(role as UserRole)) return <Navigate to="/admin/dashboard" replace />;
    //     const dest = user.userType === 'PATIENT' ? '/patient/overview' : '/patient/overview';
    //     return <Navigate to={dest} replace />;
    // }

    return <>{children}</>;
}
