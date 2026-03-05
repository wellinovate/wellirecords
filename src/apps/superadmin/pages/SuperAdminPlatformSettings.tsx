import React, { useState } from 'react';
import {
    Settings, Mail, Shield, Link2, FileCheck,
    CreditCard, Check, X, Edit2, AlertTriangle,
    Lock, Globe, Save
} from 'lucide-react';

const TABS = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Email & SMS', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'compliance', label: 'Compliance', icon: FileCheck },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export function SuperAdminPlatformSettings() {
    const [activeTab, setActiveTab] = useState('general');
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string | boolean>('');
    const [confirmModal, setConfirmModal] = useState<{ key: string, label: string, value: any } | null>(null);

    // Mock global configuration state
    const [config, setConfig] = useState<Record<string, { value: any, type: 'string' | 'boolean' | 'number' | 'password', isCritical: boolean, lastModifiedBy: string, lastModifiedAt: string }>>({
        // General
        'platform_name': { value: 'WelliRecord Medical', type: 'string', isCritical: false, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-01-01 09:00:00Z' },
        'support_email': { value: 'support@wellirecord.com', type: 'string', isCritical: false, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-01-01 09:00:00Z' },
        'default_timezone': { value: 'Africa/Lagos', type: 'string', isCritical: false, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-01-01 09:00:00Z' },

        // Notifications
        'smtp_host': { value: 'smtp.sendgrid.net', type: 'string', isCritical: true, lastModifiedBy: 'System', lastModifiedAt: '2025-11-15 14:22:00Z' },
        'sms_gateway': { value: 'Termii (NG)', type: 'string', isCritical: false, lastModifiedBy: 'System', lastModifiedAt: '2025-12-01 10:00:00Z' },
        'sms_sender_id': { value: 'WelliRecord', type: 'string', isCritical: false, lastModifiedBy: 'System', lastModifiedAt: '2025-12-01 10:00:00Z' },

        // Security
        'session_timeout_mins': { value: 15, type: 'number', isCritical: true, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-02-14 11:30:00Z' },
        'enforce_mfa_global': { value: true, type: 'boolean', isCritical: true, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-02-14 11:30:00Z' },
        'failed_login_lockout': { value: 5, type: 'number', isCritical: true, lastModifiedBy: 'System', lastModifiedAt: '2025-11-15 14:22:00Z' },

        // Integrations
        'fhir_r4_base_url': { value: 'https://api.wellirecord.com/fhir/r4', type: 'string', isCritical: false, lastModifiedBy: 'System', lastModifiedAt: '2025-11-15 14:22:00Z' },
        'api_rate_limit_rpm': { value: 1000, type: 'number', isCritical: true, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-03-01 08:15:00Z' },

        // Compliance
        'data_residency_region': { value: 'af-south-1 (Cape Town)', type: 'string', isCritical: true, lastModifiedBy: 'System', lastModifiedAt: '2025-11-15 14:22:00Z' },
        'audit_log_retention_days': { value: 2555, type: 'number', isCritical: true, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-02-14 11:30:00Z' },
        'auto_anonymize_after_years': { value: 10, type: 'number', isCritical: true, lastModifiedBy: 'System', lastModifiedAt: '2025-11-15 14:22:00Z' },
        'breach_notify_email': { value: 'security-incidents@wellirecord.com', type: 'string', isCritical: true, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-01-01 09:00:00Z' },

        // Billing
        'paystack_public_key': { value: 'pk_live_**********************', type: 'string', isCritical: true, lastModifiedBy: 'Tolu Adeyemi', lastModifiedAt: '2026-01-10 16:45:00Z' },
        'subscription_grace_days': { value: 3, type: 'number', isCritical: false, lastModifiedBy: 'System', lastModifiedAt: '2025-11-15 14:22:00Z' },
        'invoice_prefix': { value: 'WR-INV-', type: 'string', isCritical: false, lastModifiedBy: 'System', lastModifiedAt: '2025-11-15 14:22:00Z' },
    });

    const handleEditStart = (key: string) => {
        setEditingKey(key);
        setEditValue(config[key].value);
    };

    const handleEditSave = (key: string) => {
        const setting = config[key];

        // If critical, spawn confirmation modal instead of saving instantly
        if (setting.isCritical) {
            setConfirmModal({ key, label: formatLabel(key), value: editValue });
            return;
        }

        commitSave(key, editValue);
    };

    const commitSave = (key: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value,
                lastModifiedBy: 'Super Admin',
                lastModifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z'
            }
        }));
        setEditingKey(null);
        setConfirmModal(null);
    };

    const formatLabel = (key: string) => {
        return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const formatValue = (value: any, type: string) => {
        if (type === 'boolean') return value ? 'Enabled' : 'Disabled';
        if (type === 'password' || typeof value === 'string' && value.includes('*')) return '•••••••••••••••••••••';
        return value.toString();
    };

    const renderConfigRow = (key: string, description: string) => {
        const setting = config[key];
        const isEditing = editingKey === key;

        return (
            <div key={key} className="p-5 border-b last:border-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Label & Description */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>{formatLabel(key)}</span>
                            {setting.isCritical && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                    Critical
                                </span>
                            )}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--sa-muted)' }}>{description}</div>

                        {!isEditing && (
                            <div className="text-[10px] mt-2 flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                                <Clock size={10} /> Last modified by <span className="font-semibold" style={{ color: '#9ca3af' }}>{setting.lastModifiedBy}</span> at {setting.lastModifiedAt}
                            </div>
                        )}
                    </div>

                    {/* Value / Editor */}
                    <div className="flex-shrink-0 min-w-[250px]">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                {setting.type === 'boolean' ? (
                                    <select
                                        value={editValue.toString()}
                                        onChange={e => setEditValue(e.target.value === 'true')}
                                        className="text-sm px-3 py-1.5 rounded-lg outline-none w-full"
                                        style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid var(--sa-accent)' }}
                                    >
                                        <option value="true">Enabled</option>
                                        <option value="false">Disabled</option>
                                    </select>
                                ) : (
                                    <input
                                        type={setting.type === 'number' ? 'number' : 'text'}
                                        value={editValue as string}
                                        onChange={e => setEditValue(setting.type === 'number' ? Number(e.target.value) : e.target.value)}
                                        className="text-sm px-3 py-1.5 rounded-lg outline-none w-full focus:ring-1 focus:ring-indigo-500"
                                        style={{ background: '#080e20', color: '#e2e8f0', border: '1px solid var(--sa-accent)' }}
                                    />
                                )}
                                <div className="flex gap-1">
                                    <button onClick={() => handleEditSave(key)} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingKey(null)} className="p-1.5 rounded-lg bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <span className={`text-sm font-mono ${setting.type === 'boolean' ? (setting.value ? 'text-emerald-400' : 'text-slate-400') : 'text-indigo-200'}`}>
                                    {formatValue(setting.value, setting.type)}
                                </span>
                                <button
                                    onClick={() => handleEditStart(key)}
                                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                                    style={{ color: 'var(--sa-muted)' }}
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 relative">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>Platform Settings</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--sa-muted)' }}>Global configuration for the WelliRecord platform, integrations, and compliance rules.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 items-start">

                {/* Horizontal Tab Menu (Desktop: Left sidebar, Mobile: Top row) */}
                <div className="flex xl:flex-col gap-1 w-full xl:w-64 flex-shrink-0 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 xl:flex-shrink"
                                style={{
                                    background: active ? 'var(--sa-accent-dim)' : 'transparent',
                                    color: active ? 'var(--sa-accent)' : '#9ca3af',
                                    border: active ? '1px solid rgba(129,140,248,0.2)' : '1px solid transparent'
                                }}
                            >
                                <Icon size={18} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Configuration Area */}
                <div className="flex-1 w-full min-w-0">
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid var(--sa-border)' }}>
                        <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(8,14,32,0.4)' }}>
                            {React.createElement(TABS.find(t => t.id === activeTab)?.icon || Settings, { size: 20, style: { color: 'var(--sa-accent)' } })}
                            <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>
                                {TABS.find(t => t.id === activeTab)?.label} Configuration
                            </h2>
                        </div>

                        <div className="flex flex-col">
                            {activeTab === 'general' && (
                                <>
                                    {renderConfigRow('platform_name', 'The global display name used in system emails and headers.')}
                                    {renderConfigRow('support_email', 'The primary email address where patients and providers send support queries.')}
                                    {renderConfigRow('default_timezone', 'Standard timezone for audit logs and system events before localized conversion.')}
                                </>
                            )}
                            {activeTab === 'notifications' && (
                                <>
                                    {renderConfigRow('smtp_host', 'Fully Qualified Domain Name of the default SMTP mail relay server.')}
                                    {renderConfigRow('sms_gateway', 'Primary SMS provider for OTPs and appointment reminders (Ensure local market compatibility like Termii).')}
                                    {renderConfigRow('sms_sender_id', 'Alphanumeric Sender ID registered with local telecom regulators.')}
                                </>
                            )}
                            {activeTab === 'security' && (
                                <>
                                    {renderConfigRow('enforce_mfa_global', 'Force Multi-Factor Authentication for all Admin and Provider accounts.')}
                                    {renderConfigRow('session_timeout_mins', 'Idle time before an admin or provider is forcibly logged out.')}
                                    {renderConfigRow('failed_login_lockout', 'Number of consecutive failed passwords before a 15-minute account IP lockout.')}
                                </>
                            )}
                            {activeTab === 'integrations' && (
                                <>
                                    {renderConfigRow('fhir_r4_base_url', 'The base path for all incoming and outgoing FHIR standard data representations.')}
                                    {renderConfigRow('api_rate_limit_rpm', 'Global maximum Requests Per Minute for authenticated 3rd-party integrations.')}
                                </>
                            )}
                            {activeTab === 'compliance' && (
                                <>
                                    {renderConfigRow('data_residency_region', 'AWS Region where all sensitive PHI data is physically stored to comply with NDPR/HIPAA.')}
                                    {renderConfigRow('audit_log_retention_days', 'Minimum legal retention period for system and access logs (7 years default).')}
                                    {renderConfigRow('auto_anonymize_after_years', 'Automatically wipe PII while retaining unlinked medical data for epidemiology models.')}
                                    {renderConfigRow('breach_notify_email', 'Monitored inbox that receives automated alerts if access heuristics indicate a data leak.')}
                                </>
                            )}
                            {activeTab === 'billing' && (
                                <>
                                    {renderConfigRow('paystack_public_key', 'Active gateway key for processing subscription and patient billing transactions.')}
                                    {renderConfigRow('subscription_grace_days', 'Days an organization can operate after a missed payment before systematic suspension.')}
                                    {renderConfigRow('invoice_prefix', 'Standardized prefix for legally compliant invoice generation.')}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Critical Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
                    <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in border mt-[-10vh]"
                        style={{ background: '#0f172a', borderColor: 'rgba(239,68,68,0.3)' }}>
                        <div className="mx-auto w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                        </div>
                        <h3 className="text-xl font-black text-center mb-2" style={{ color: '#e2e8f0' }}>Confirm Security Change</h3>
                        <p className="text-sm text-center mb-6" style={{ color: 'var(--sa-muted)' }}>
                            You are modifying a security-critical setting. This change will be permanently logged and may affect system stability or compliance.
                        </p>

                        <div className="rounded-xl p-4 mb-6 font-mono text-sm" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#9ca3af' }} className="mb-1">{confirmModal.label}</div>
                            <div className="flex items-center gap-2">
                                <span className="line-through opacity-50 text-red-400">{formatValue(config[confirmModal.key].value, config[confirmModal.key].type)}</span>
                                <span className="text-white">→</span>
                                <span className="text-emerald-400 font-bold">{formatValue(confirmModal.value, config[confirmModal.key].type)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 py-2.5 rounded-xl font-bold transition-colors hover:bg-white/5"
                                style={{ color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => commitSave(confirmModal.key, confirmModal.value)}
                                className="flex-1 py-2.5 rounded-xl font-bold transition-colors hover:bg-red-600 flex items-center justify-center gap-2"
                                style={{ background: '#ef4444', color: '#fff' }}
                            >
                                <Save size={16} /> Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

