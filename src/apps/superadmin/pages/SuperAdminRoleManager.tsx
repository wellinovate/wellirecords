import React, { useState } from 'react';
import {
    Shield, ShieldAlert, Users, AlertTriangle,
    Copy, Search, Check, Save, History, Building2, Stethoscope, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Types & Mock Data ---

type PermissionGroup = 'clinical' | 'operations' | 'privacy' | 'high_risk';

interface PermissionDef {
    id: string;
    label: string;
    description: string;
    group: PermissionGroup;
}

interface RoleDef {
    id: string;
    name: string;
    description: string;
    usersCount: number;
    icon: any;
    isSystem: boolean; // Cannot be deleted
    lastModifiedBy: string;
    lastModifiedAt: string;
    permissions: string[];
}

const ALL_PERMISSIONS: PermissionDef[] = [
    // Clinical
    { id: 'view_records', label: 'View Records', description: 'Read-only access to patient EHR files.', group: 'clinical' },
    { id: 'create_encounters', label: 'Create Encounters', description: 'Log new hospital visits and clinical notes.', group: 'clinical' },
    { id: 'order_labs', label: 'Order Labs', description: 'Authorize new diagnostic tests and imaging.', group: 'clinical' },
    { id: 'issue_prescriptions', label: 'Issue Prescriptions', description: 'Write and transmit medication orders (e-Rx).', group: 'clinical' },
    // Operations
    { id: 'manage_team', label: 'Manage Team', description: 'Invite, suspend, and alter roles of other staff members.', group: 'operations' },
    { id: 'billing_management', label: 'Billing Management', description: 'View and process patient invoices and org subscriptions.', group: 'operations' },
    { id: 'system_config', label: 'System Config', description: 'Modify global or organizational configuration parameters.', group: 'operations' },
    // Privacy
    { id: 'grant_consent', label: 'Grant Consent', description: 'Authorize access to patient records on their behalf.', group: 'privacy' },
    { id: 'revoke_consent', label: 'Revoke Consent', description: 'Withdraw previously granted record access.', group: 'privacy' },
    // High Risk
    { id: 'export_data', label: 'Export Bulk Data', description: 'Extract large datasets or full patient registries.', group: 'high_risk' },
    { id: 'view_audit_logs', label: 'View Audit Logs', description: 'Access unredacted systemic access history.', group: 'high_risk' },
    { id: 'api_access', label: 'API Access', description: 'Generate tokens for programmatic data manipulation.', group: 'high_risk' },
    { id: 'impersonate_user', label: 'Impersonate User', description: 'Assume the identity of another user in the system for debugging.', group: 'high_risk' }
];

const INITIAL_ROLES: RoleDef[] = [
    {
        id: 'role_super_admin',
        name: 'Super Admin',
        description: 'Global system administrators with unrestricted access.',
        usersCount: 3,
        icon: ShieldAlert,
        isSystem: true,
        lastModifiedBy: 'System Baseline',
        lastModifiedAt: '2025-01-01T00:00:00Z',
        permissions: ALL_PERMISSIONS.map(p => p.id) // All permissions
    },
    {
        id: 'role_platform_auditor',
        name: 'Platform Auditor',
        description: 'Read-only systemic oversight for compliance verification.',
        usersCount: 2,
        icon: History,
        isSystem: true,
        lastModifiedBy: 'Tolu Adeyemi',
        lastModifiedAt: '2026-02-14T09:30:00Z',
        permissions: ['view_records', 'view_audit_logs']
    },
    {
        id: 'role_org_admin',
        name: 'Organisation Admin',
        description: 'Tenant-level administrator managing staff and clinic settings.',
        usersCount: 842,
        icon: Building2,
        isSystem: true,
        lastModifiedBy: 'System Baseline',
        lastModifiedAt: '2025-01-01T00:00:00Z',
        permissions: ['view_records', 'manage_team', 'billing_management', 'system_config', 'export_data']
    },
    {
        id: 'role_clinician',
        name: 'Clinician (Doctor)',
        description: 'Standard medical practitioner with full charting rights.',
        usersCount: 4250,
        icon: Stethoscope,
        isSystem: true,
        lastModifiedBy: 'Medical Board',
        lastModifiedAt: '2025-06-15T11:20:00Z',
        permissions: ['view_records', 'create_encounters', 'order_labs', 'issue_prescriptions', 'grant_consent', 'revoke_consent']
    },
    {
        id: 'role_nurse',
        name: 'Registered Nurse',
        description: 'Nursing staff assisting with encounters and vitals.',
        usersCount: 8100,
        icon: Users,
        isSystem: true,
        lastModifiedBy: 'System Baseline',
        lastModifiedAt: '2025-01-01T00:00:00Z',
        permissions: ['view_records', 'create_encounters', 'order_labs']
    },
    {
        id: 'role_billing_clerk',
        name: 'Billing Clerk',
        description: 'Financial staff handling patient invoicing.',
        usersCount: 1120,
        icon: Lock,
        isSystem: true,
        lastModifiedBy: 'System Baseline',
        lastModifiedAt: '2025-01-01T00:00:00Z',
        permissions: ['billing_management']
    }
];

// --- Subcomponents ---

function ConflictWarning({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-6 border animate-in slide-in-from-top-2"
            style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#fcd34d' }}>
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
            <div>
                <h4 className="text-sm font-bold mb-0.5" style={{ color: '#fde68a' }}>NDPR Segregation of Duties Conflict</h4>
                <p className="text-xs" style={{ color: '#fcd34d' }}>{message}</p>
            </div>
        </div>
    );
}

// --- Main Component ---

export function SuperAdminRoleManager() {
    const [roles, setRoles] = useState<RoleDef[]>(INITIAL_ROLES);
    const [activeRoleIndex, setActiveRoleIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Track unsaved permission changes for the active role
    const [pendingPermissions, setPendingPermissions] = useState<Set<string>>(new Set(INITIAL_ROLES[0].permissions));

    // When role changes, reset pending permissions
    const selectRole = (idx: number) => {
        setActiveRoleIndex(idx);
        setPendingPermissions(new Set(roles[idx].permissions));
    };

    const activeRole = roles[activeRoleIndex];
    const isEditing = activeRole.permissions.length !== pendingPermissions.size ||
        !activeRole.permissions.every(p => pendingPermissions.has(p));

    const togglePermission = (permId: string) => {
        const next = new Set(pendingPermissions);
        if (next.has(permId)) {
            next.delete(permId);
        } else {
            next.add(permId);
        }
        setPendingPermissions(next);
    };

    const handleSave = () => {
        const nextRoles = [...roles];
        nextRoles[activeRoleIndex] = {
            ...activeRole,
            permissions: Array.from(pendingPermissions),
            lastModifiedBy: 'Super Admin',
            lastModifiedAt: new Date().toISOString()
        };
        setRoles(nextRoles);
    };

    const handleClone = () => {
        const clone: RoleDef = {
            ...activeRole,
            id: `role_custom_${Date.now()}`,
            name: `${activeRole.name} (Copy)`,
            usersCount: 0,
            isSystem: false,
            lastModifiedBy: 'Super Admin',
            lastModifiedAt: new Date().toISOString(),
            permissions: Array.from(pendingPermissions)
        };
        setRoles([...roles, clone]);
        setActiveRoleIndex(roles.length);
        setPendingPermissions(new Set(clone.permissions));
    };

    // Analyze Compliance Conflicts
    const conflicts: string[] = [];
    if (pendingPermissions.has('export_data') && pendingPermissions.has('impersonate_user')) {
        conflicts.push('Combining "Export Bulk Data" with "Impersonate User" violates data provenance requirements by allowing untraceable mass extraction.');
    }
    if (pendingPermissions.has('system_config') && pendingPermissions.has('view_audit_logs')) {
        if (!activeRole.isSystem) conflicts.push('Allowing custom roles to modify System Configuration while also viewing Audit Logs risks log tampering capabilities.');
    }
    if (pendingPermissions.has('grant_consent') && pendingPermissions.has('issue_prescriptions')) {
        // Technically this happens for Clinical roles in our system, but imagine it as a strict B2B SoD rule.
        // We will skip this specific clinical warning to avoid noise on standard Doctor roles.
    }

    const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>Role & Permission Manager</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--sa-muted)' }}>Configure platform access matrices and enforce NDPR compliance policies.</p>
            </div>

            {/* Split Layout */}
            <div className="flex flex-1 min-h-0 gap-6">

                {/* LEFT PANEL: Role Roster */}
                <div className="w-80 flex flex-col rounded-2xl overflow-hidden flex-shrink-0" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                    {/* Search */}
                    <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--sa-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full text-sm rounded-xl pl-10 pr-4 py-2 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50"
                                style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>
                    </div>

                    {/* Roster List */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                        <div className="p-2 space-y-1">
                            {filteredRoles.map((role) => {
                                // Find actual index in unbounded list
                                const actualIdx = roles.findIndex(r => r.id === role.id);
                                const isActive = activeRoleIndex === actualIdx;
                                const Icon = role.icon;

                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => selectRole(actualIdx)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group"
                                        style={{
                                            background: isActive ? 'var(--sa-accent-dim)' : 'transparent',
                                            border: isActive ? '1px solid rgba(129,140,248,0.2)' : '1px solid transparent'
                                        }}
                                    >
                                        <div className="p-2 rounded-lg flex-shrink-0"
                                            style={{ background: isActive ? '#080e20' : 'rgba(255,255,255,0.05)', color: isActive ? 'var(--sa-accent)' : '#9ca3af' }}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold truncate group-hover:text-white transition-colors"
                                                style={{ color: isActive ? '#e2e8f0' : '#cbd5e1' }}>
                                                {role.name}
                                                {role.isSystem && <Shield size={10} className="inline ml-1.5 opacity-50" />}
                                            </div>
                                            <div className="text-[10px] truncate" style={{ color: isActive ? '#a5b4fc' : '#6b7280' }}>
                                                {role.usersCount.toLocaleString()} Users
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Permission Matrix */}
                <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-w-0" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>

                    {/* Matrix Header */}
                    <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(8, 14, 32, 0.4)' }}>
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                                <h2 className="text-xl font-black mb-1 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                                    {activeRole.name}
                                    {activeRole.isSystem && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700">System Default</span>
                                    )}
                                </h2>
                                <p className="text-sm" style={{ color: 'var(--sa-muted)' }}>{activeRole.description}</p>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={handleClone} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-white/10 flex items-center gap-1.5"
                                    style={{ color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Copy size={14} /> Clone Role
                                </button>

                                {isEditing && (
                                    <button onClick={handleSave} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-emerald-600 flex items-center gap-1.5"
                                        style={{ background: '#10b981', color: '#fff' }}>
                                        <Save size={14} /> Save Changes
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs">
                            <span style={{ color: '#6b7280' }}>
                                Last modified by <span className="font-semibold" style={{ color: '#9ca3af' }}>{activeRole.lastModifiedBy}</span> • {new Date(activeRole.lastModifiedAt).toLocaleDateString()}
                            </span>

                            <Link to="/super-admin/users" className="font-semibold flex items-center gap-1 hover:underline transition-all" style={{ color: 'var(--sa-accent)' }}>
                                <Users size={12} /> View {activeRole.usersCount.toLocaleString()} Users in Role
                            </Link>
                        </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

                        {conflicts.map((msg, i) => (
                            <ConflictWarning key={i} message={msg} />
                        ))}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Grouping Rendering Logic */}
                            {(['clinical', 'operations', 'privacy', 'high_risk'] as PermissionGroup[]).map(group => {
                                const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group);
                                if (groupPerms.length === 0) return null;

                                const groupLabels = {
                                    'clinical': 'Clinical Data & Actions',
                                    'operations': 'Platform Operations',
                                    'privacy': 'Patient Privacy Governance',
                                    'high_risk': 'High Risk / Security Actions'
                                };

                                return (
                                    <div key={group} className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest pb-2 border-b"
                                            style={{ color: group === 'high_risk' ? '#ef4444' : '#e2e8f0', borderColor: 'rgba(255,255,255,0.05)' }}>
                                            {groupLabels[group]}
                                        </h3>

                                        <div className="space-y-3">
                                            {groupPerms.map(perm => {
                                                const hasPerm = pendingPermissions.has(perm.id);
                                                return (
                                                    <label key={perm.id} className="flex items-start gap-3 cursor-pointer group/toggle">
                                                        <div className="relative mt-0.5">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only"
                                                                checked={hasPerm}
                                                                onChange={() => togglePermission(perm.id)}
                                                            />
                                                            <div className="w-5 h-5 rounded flex items-center justify-center transition-all border"
                                                                style={{
                                                                    background: hasPerm ? 'var(--sa-accent)' : '#080e20',
                                                                    borderColor: hasPerm ? 'var(--sa-accent)' : 'rgba(255,255,255,0.2)'
                                                                }}>
                                                                <Check size={12} className={`text-white transition-opacity ${hasPerm ? 'opacity-100' : 'opacity-0'}`} />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold group-hover/toggle:text-white transition-colors"
                                                                style={{ color: hasPerm ? '#e2e8f0' : '#9ca3af' }}>
                                                                {perm.label}
                                                            </div>
                                                            <div className="text-xs mt-0.5" style={{ color: 'var(--sa-muted)' }}>
                                                                {perm.description}
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

