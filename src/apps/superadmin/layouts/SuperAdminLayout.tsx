import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import {
    LayoutDashboard, Users, Building2, Shield, CreditCard,
    Bell, FileText, LogOut, ChevronRight, AlertTriangle,
    Activity, Lock, Database, Eye, Server, Zap,
    MessageSquare, History, Monitor, Flame, Search,
    Menu, X, Settings, Flag, Wifi,
} from 'lucide-react';

const SA_NAV = [
    {
        group: 'Overview',
        items: [{ label: 'Dashboard', to: '/super-admin/dashboard', icon: LayoutDashboard }],
    },
    {
        group: 'Platform Management',
        items: [
            { label: 'User Registry', to: '/super-admin/users', icon: Users },
            { label: 'Org Registry', to: '/super-admin/organisations', icon: Building2 },
            { label: 'Role Manager', to: '/super-admin/roles', icon: Shield },
        ],
    },
    {
        group: 'Financial Control',
        items: [
            { label: 'Revenue Dashboard', to: '/super-admin/revenue', icon: CreditCard },
            { label: 'Subscription Plans', to: '/super-admin/plans', icon: FileText },
            { label: 'Invoices', to: '/super-admin/invoices', icon: FileText },
        ],
    },
    {
        group: 'Security & Compliance',
        items: [
            { label: 'Audit Trail', to: '/super-admin/audit', icon: Activity },
            { label: 'Security Alerts', to: '/super-admin/security', icon: AlertTriangle },
            { label: 'Incident Log', to: '/super-admin/incidents', icon: Flame },
            { label: 'Session Controls', to: '/super-admin/sessions', icon: Monitor },
            { label: 'Permission History', to: '/super-admin/permissions', icon: History },
            { label: 'Impersonation Log', to: '/super-admin/impersonation', icon: Eye },
        ],
    },
    {
        group: 'Governance',
        items: [
            { label: 'Consent Governance', to: '/super-admin/consent', icon: Lock },
            { label: 'Data Retention', to: '/super-admin/retention', icon: Database },
        ],
    },
    {
        group: 'System',
        items: [
            { label: 'System Health', to: '/super-admin/system-health', icon: Server },
            { label: 'Feature Flags', to: '/super-admin/feature-flags', icon: Flag },
            { label: 'API Status', to: '/super-admin/api-status', icon: Wifi },
            { label: 'Notifications', to: '/super-admin/notifications', icon: Bell },
            { label: 'Broadcast', to: '/super-admin/broadcast', icon: MessageSquare },
            { label: 'Platform Settings', to: '/super-admin/settings', icon: Settings },
        ],
    },
];

const SA_LAYOUT_STYLES = `
:root {
    --sa-bg: #080e20;
    --sa-sidebar: #0d1233;
    --sa-border: rgba(129,140,248,0.1);
    --sa-accent: #818cf8;
    --sa-accent-dim: rgba(129,140,248,0.1);
    --sa-text: #e2e8f0;
    --sa-muted: #475569;
}
@keyframes slide-in-left {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
}
.sa-slide-in { animation: slide-in-left 0.22s cubic-bezier(.4,0,.2,1); }
`;

export function SuperAdminLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleSignOut = () => { signOut(); navigate('/auth'); };
    const navTo = (path: string) => { navigate(path); setDrawerOpen(false); };

    const NavList = ({ onNav }: { onNav?: (path: string) => void }) => (
        <>
            {SA_NAV.map(section => (
                <div key={section.group}>
                    <div
                        className="text-[9px] font-black uppercase tracking-widest px-3 mb-1.5 mt-1"
                        style={{ color: 'var(--sa-muted)' }}
                    >
                        {section.group}
                    </div>
                    {section.items.map(item => {
                        const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                        return (
                            <button
                                key={item.to}
                                onClick={() => (onNav ?? navTo)(item.to)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5"
                                style={{
                                    background: active ? 'var(--sa-accent-dim)' : 'transparent',
                                    color: active ? 'var(--sa-accent)' : 'var(--sa-muted)',
                                    border: active ? '1px solid rgba(129,140,248,0.2)' : '1px solid transparent',
                                }}
                            >
                                <item.icon size={16} />
                                <span className="flex-1 text-left">{item.label}</span>
                                {active && <ChevronRight size={13} />}
                            </button>
                        );
                    })}
                </div>
            ))}
        </>
    );

    const UserChip = () => (
        <div className="flex items-center gap-2.5">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff' }}
            >
                {(user?.name ?? 'S').charAt(0)}
            </div>
            <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: '#e2e8f0' }}>{user?.name ?? 'Super Admin'}</div>
                <div
                    className="text-[10px] font-black inline-flex items-center gap-1"
                    style={{ color: 'var(--sa-accent)' }}
                >
                    <Zap size={9} /> Super Admin
                </div>
            </div>
        </div>
    );

    const pageLabel = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'dashboard';

    return (
        <>
            <style>{SA_LAYOUT_STYLES}</style>
            <div
                className="flex h-screen"
                style={{ background: 'var(--sa-bg)', color: 'var(--sa-text)', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif' }}
            >
                {/* ─── Mobile Drawer ─── */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-50 flex md:hidden">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        <aside
                            className="relative flex flex-col w-72 max-w-[85vw] h-full sa-slide-in"
                            style={{ background: 'var(--sa-sidebar)', borderRight: '1px solid var(--sa-border)' }}
                        >
                            {/* Drawer header */}
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--sa-border)' }}>
                                <div>
                                    <WelliRecordLogo height={28} theme="light" />
                                    <div
                                        className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                                        style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}
                                    >
                                        ⚡ Super Admin
                                    </div>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                                    <X size={18} style={{ color: '#6b7280' }} />
                                </button>
                            </div>
                            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--sa-border)' }}>
                                <UserChip />
                            </div>
                            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                                <NavList onNav={navTo} />
                            </nav>
                            <div className="p-3 border-t" style={{ borderColor: 'var(--sa-border)' }}>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-500/10 text-red-400"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* ─── Desktop Sidebar ─── */}
                <aside
                    className="hidden md:flex flex-col w-64 flex-shrink-0 z-20"
                    style={{
                        background: 'var(--sa-sidebar)',
                        borderRight: '1px solid var(--sa-border)',
                        boxShadow: '2px 0 30px rgba(0,0,0,.5)',
                    }}
                >
                    {/* Brand */}
                    <div className="p-5 border-b" style={{ borderColor: 'var(--sa-border)' }}>
                        <WelliRecordLogo height={36} theme="light" />
                        <div
                            className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase"
                            style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}
                        >
                            ⚡ Super Admin Portal
                        </div>
                    </div>

                    {/* User */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--sa-border)' }}>
                        <UserChip />
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                        <NavList onNav={navigate} />
                    </nav>

                    {/* Sign out */}
                    <div className="p-3 border-t" style={{ borderColor: 'var(--sa-border)' }}>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-500/10 text-red-400"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* ─── Main Content ─── */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {/* Topbar */}
                    <header
                        className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
                        style={{
                            borderBottom: '1px solid var(--sa-border)',
                            background: 'rgba(13,18,51,0.8)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDrawerOpen(true)}
                                className="md:hidden p-2 rounded-xl hover:bg-white/10"
                            >
                                <Menu size={20} style={{ color: '#6b7280' }} />
                            </button>
                            <div className="text-sm font-semibold capitalize" style={{ color: '#6b7280' }}>
                                {pageLabel}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="hidden md:inline">All Systems Operational</span>
                                <span className="md:hidden">Operational</span>
                            </div>
                            <div
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                                style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}
                            >
                                <Zap size={12} />
                                <span className="hidden sm:inline">Super Admin</span>
                            </div>
                        </div>
                    </header>

                    {/* Page */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
