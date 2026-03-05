import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/AuthProvider';
import { WelliRecordLogo } from '@/shared/ui/WelliRecordLogo';
import {
    LayoutDashboard, ShieldCheck, Building2, Users, CreditCard,
    Bell, FileText, LogOut, ChevronRight, AlertTriangle,
    Activity, Lock, Database, UserCog, Eye,
    MessageSquare, Server, History, Monitor, Flame, Search,
    Menu, X,
} from 'lucide-react';
import { ROLE_METADATA } from '@/shared/rbac/permissions';

const ADMIN_NAV = [
    {
        group: 'Overview',
        items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }],
    },
    {
        group: 'Identity & Verification',
        items: [
            { label: 'Verification Queue', to: '/admin/verifications', icon: ShieldCheck },
            { label: 'Patient Registry', to: '/admin/patients', icon: Users },
            { label: 'Facility Registry', to: '/admin/facilities', icon: Building2 },
        ],
    },
    {
        group: 'Billing & Plans',
        items: [
            { label: 'Revenue Dashboard', to: '/admin/billing', icon: CreditCard },
            { label: 'Subscription Plans', to: '/admin/plans', icon: FileText },
            { label: 'Invoices', to: '/admin/invoices', icon: FileText },
        ],
    },
    {
        group: 'Notifications',
        items: [
            { label: 'Templates', to: '/admin/notification-templates', icon: Bell },
            { label: 'Broadcast', to: '/admin/broadcast', icon: Bell },
        ],
    },
    {
        group: 'Support Desk',
        items: [{ label: 'Ticket Queue', to: '/admin/support', icon: MessageSquare }],
    },
    {
        group: 'Security & Audit',
        items: [
            { label: 'Audit Search', to: '/admin/audit-search', icon: Search },
            { label: 'Platform Audit Log', to: '/admin/audit', icon: Activity },
            { label: 'Security Alerts', to: '/admin/security', icon: AlertTriangle },
            { label: 'Session Controls', to: '/admin/sessions', icon: Monitor },
            { label: 'Permission History', to: '/admin/permission-history', icon: History },
            { label: 'Impersonation Log', to: '/admin/impersonation', icon: Eye },
        ],
    },
    {
        group: 'Governance',
        items: [
            { label: 'Consent Governance', to: '/admin/consent-governance', icon: Lock },
            { label: 'Incident Log', to: '/admin/incidents', icon: Flame },
            { label: 'Data Retention', to: '/admin/data-retention', icon: Database },
        ],
    },
    {
        group: 'System',
        items: [{ label: 'System Health', to: '/admin/system-health', icon: Server }],
    },
];

const ADMIN_STYLES = `
:root {
    --admin-bg: #0c1222;
    --admin-sidebar: #111827;
    --admin-border: rgba(245,158,11,0.12);
    --admin-accent: #f59e0b;
    --admin-accent-dim: rgba(245,158,11,0.1);
    --admin-text: #e5e7eb;
    --admin-muted: #6b7280;
}
@keyframes slide-in-left {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
}
.animate-slide-in-left { animation: slide-in-left 0.22s cubic-bezier(.4,0,.2,1); }
`;

export function AdminLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleSignOut = () => { signOut(); navigate('/auth'); };
    const navTo = (path: string) => { navigate(path); setDrawerOpen(false); };

    const primaryRole = user?.roles?.[0] ?? 'super_admin';
    const roleMeta = ROLE_METADATA[primaryRole];

    const NavList = ({ onNav }: { onNav?: (path: string) => void }) => (
        <>
            {ADMIN_NAV.map(section => (
                <div key={section.group}>
                    <div className="text-[9px] font-black uppercase tracking-widest px-3 mb-1.5 mt-1" style={{ color: 'var(--admin-muted)' }}>
                        {section.group}
                    </div>
                    {section.items.map(item => {
                        const active = location.pathname.startsWith(item.to);
                        return (
                            <button key={item.to} onClick={() => (onNav ?? navTo)(item.to)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5"
                                style={{
                                    background: active ? 'var(--admin-accent-dim)' : 'transparent',
                                    color: active ? 'var(--admin-accent)' : 'var(--admin-muted)',
                                    border: active ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                                }}>
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

    return (
        <>
            <style>{ADMIN_STYLES}</style>
            <div className="flex h-screen" style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif' }}>

                {/* ─── Mobile Slide-over Drawer ─── */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-50 flex md:hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        <aside className="relative flex flex-col w-72 max-w-[85vw] h-full animate-slide-in-left"
                            style={{ background: 'var(--admin-sidebar)', borderRight: '1px solid var(--admin-border)' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
                                <div>
                                    <WelliRecordLogo height={28} theme="light" />
                                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                                        ⚙ Operations Portal
                                    </div>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                                    <X size={18} style={{ color: '#6b7280' }} />
                                </button>
                            </div>
                            {/* User */}
                            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                                        style={{ background: 'var(--admin-accent)', color: '#000' }}>
                                        {(user?.name ?? 'A').charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold" style={{ color: '#e5e7eb' }}>{user?.name ?? 'Admin'}</div>
                                        <div className="text-[10px] font-bold" style={{ color: 'var(--admin-accent)' }}>{roleMeta?.label ?? 'Super Admin'}</div>
                                    </div>
                                </div>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                                <NavList onNav={navTo} />
                            </nav>
                            <div className="p-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-500/10 text-red-400">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* ─── Desktop Sidebar ─── */}
                <aside className="hidden md:flex flex-col w-64 flex-shrink-0 z-20"
                    style={{ background: 'var(--admin-sidebar)', borderRight: '1px solid var(--admin-border)', boxShadow: '2px 0 20px rgba(0,0,0,.4)' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                        <WelliRecordLogo height={36} theme="light" />
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                            ⚙ Operations Portal
                        </div>
                    </div>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                                style={{ background: 'var(--admin-accent)', color: '#000' }}>
                                {(user?.name ?? 'A').charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold truncate" style={{ color: '#e5e7eb' }}>{user?.name ?? 'Admin'}</div>
                                <div className="text-[10px] font-bold" style={{ color: 'var(--admin-accent)' }}>{roleMeta?.label ?? 'Super Admin'}</div>
                            </div>
                        </div>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                        <NavList onNav={navigate} />
                    </nav>
                    <div className="p-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-500/10 text-red-400">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* ─── Main ─── */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {/* Header */}
                    <header className="h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
                        style={{ borderBottom: '1px solid var(--admin-border)', background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(8px)' }}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setDrawerOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-white/10">
                                <Menu size={20} style={{ color: '#9ca3af' }} />
                            </button>
                            <div className="text-sm font-semibold capitalize" style={{ color: '#9ca3af' }}>
                                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'dashboard'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="hidden md:inline">All Systems Operational</span>
                                <span className="md:hidden">Operational</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <UserCog size={12} />
                                <span className="hidden sm:inline">{roleMeta?.label ?? 'Super Admin'}</span>
                            </div>
                        </div>
                    </header>
                    {/* Page content */}
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
