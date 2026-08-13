import React, { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { teamApi, MembershipRole, PermissionRegistry } from '@/shared/api/teamApi';

// Only needs the access-relevant fields — deliberately not TeamMember
// itself, so this also accepts MyMembership (used by
// ClinicianDashboardPage, which never has a TeamMember to hand it —
// see teamApi.getMyMembership for why).
export type AccessSubject = {
    role: MembershipRole;
    membershipId: string | null;
    permissions: string[];
    permissionOverrides?: { granted: string[]; revoked: string[] };
};

// Per-member permission overrides on top of the role default. Checkbox
// state reflects the member's current effective permissions; toggling
// one off a role default records it as revoked, toggling one on that
// isn't in the default records it as granted. Saved as the full
// granted/revoked arrays each time — see teamApi.updateMemberPermissions.
export function AccessPanel({
    member, registry, onSaved, readOnly = false,
}: {
    member: AccessSubject; registry: PermissionRegistry;
    onSaved: (permissions: string[], overrides: { granted: string[]; revoked: string[] }) => void;
    readOnly?: boolean;
}) {
    const roleDefaults = registry.roleDefaults[member.role] ?? [];
    const [checked, setChecked] = useState<Set<string>>(new Set(member.permissions));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const toggle = (key: string) => {
        if (readOnly) return;
        setSaved(false);
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        const granted = [...checked].filter(k => !roleDefaults.includes(k));
        const revoked = roleDefaults.filter(k => !checked.has(k));
        try {
            const result = await teamApi.updateMemberPermissions(member.membershipId!, granted, revoked);
            onSaved(result.permissions, result.permissionOverrides);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Couldn't save access — try again.");
        } finally {
            setSaving(false);
        }
    };

    const dirty = (() => {
        const granted = [...checked].filter(k => !roleDefaults.includes(k)).sort();
        const revoked = roleDefaults.filter(k => !checked.has(k)).sort();
        const currentGranted = [...(member.permissionOverrides?.granted ?? [])].sort();
        const currentRevoked = [...(member.permissionOverrides?.revoked ?? [])].sort();
        return JSON.stringify(granted) !== JSON.stringify(currentGranted) || JSON.stringify(revoked) !== JSON.stringify(currentRevoked);
    })();

    return (
        <div className="rounded-2xl border p-4 space-y-4" style={{ background: '#081426', borderColor: 'rgba(56,189,248,.12)' }}>
            {registry.categories.map(cat => {
                const keysInCategory = Object.entries(registry.permissions).filter(([, v]) => v.category === cat.key);
                if (!keysInCategory.length) return null;
                return (
                    <div key={cat.key}>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#4a6f96' }}>{cat.label}</div>
                        <div className="grid sm:grid-cols-2 gap-1.5">
                            {keysInCategory.map(([key, info]) => {
                                const on = checked.has(key);
                                return (
                                    <label key={key}
                                        className={`flex items-start gap-2 text-xs select-none ${readOnly ? '' : 'cursor-pointer'}`}
                                        style={{ color: on ? '#e2eaf4' : '#4a6f96' }}>
                                        {readOnly ? (
                                            <span className="mt-0.5">{on ? '🟢' : '🔴'}</span>
                                        ) : (
                                            <input type="checkbox" checked={on} onChange={() => toggle(key)}
                                                className="mt-0.5 accent-sky-400" />
                                        )}
                                        <span>
                                            {info.label}
                                            {roleDefaults.includes(key) && (
                                                <span className="ml-1.5 text-[9px] font-semibold" style={{ color: '#3e5a78' }}>(default)</span>
                                            )}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {!readOnly && (
                <div className="flex items-center gap-3 pt-1">
                    <button onClick={save} disabled={!dirty || saving}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-40">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        {saving ? 'Saving…' : 'Save access'}
                    </button>
                    {saved && <span className="text-xs" style={{ color: '#34d399' }}>Saved.</span>}
                    {error && <span className="text-xs" style={{ color: '#f87171' }}>{error}</span>}
                </div>
            )}
        </div>
    );
}
