import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    getMyOrganization,
    uploadOrganizationLogo,
    removeOrganizationLogo,
    MyOrganization,
} from '@/shared/api/organizationApi';
import { orgApi } from '@/shared/api/orgApi';
import { Image, Upload, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/* ─── Branding section ───────────────────────────────────────────────── */
function BrandingSection({ org, onUpdated }: { org: MyOrganization | null; onUpdated: (logo: string | null) => void }) {
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleFile = async (file: File) => {
        setError(null);
        setSaved(false);

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only JPG, PNG, WEBP, or SVG files are accepted.');
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            setError('Image must be under 5MB.');
            return;
        }

        setUploading(true);
        try {
            const logo = await uploadOrganizationLogo(file);
            onUpdated(logo);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Couldn't upload the logo — try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setError(null);
        setRemoving(true);
        try {
            await removeOrganizationLogo();
            onUpdated(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Couldn't remove the logo — try again.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="rounded-2xl border p-6" style={{ background: 'var(--prov-surface)', borderColor: 'var(--prov-border)' }}>
            <h2 className="font-bold text-base mb-1" style={{ color: '#e2eaf4' }}>Branding</h2>
            <p className="text-sm mb-5" style={{ color: '#7ba3c8' }}>
                Your logo replaces the default icon in the sidebar for everyone on your team.
            </p>

            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border"
                    style={{ background: 'rgba(56,189,248,.06)', borderColor: 'var(--prov-border)' }}>
                    {org?.logo ? (
                        <img src={org.logo} alt={org.organizationName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl">{orgApi.getOrgTypeIcon(org?.organizationType ?? 'hospital')}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                        <label className="btn btn-provider gap-2 cursor-pointer text-sm">
                            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {uploading ? 'Uploading…' : org?.logo ? 'Replace logo' : 'Upload logo'}
                            <input type="file" accept={ALLOWED_TYPES.join(',')} className="hidden" disabled={uploading}
                                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                        </label>
                        {org?.logo && (
                            <button onClick={handleRemove} disabled={removing}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border disabled:opacity-40"
                                style={{ borderColor: 'rgba(248,113,113,.3)', color: '#f87171' }}>
                                {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Remove
                            </button>
                        )}
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#3e5a78' }}>JPG, PNG, WEBP, or SVG. Under 5MB.</p>
                    {error && (
                        <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#f87171' }}>
                            <AlertCircle size={12} /> {error}
                        </p>
                    )}
                    {saved && (
                        <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#34d399' }}>
                            <CheckCircle size={12} /> Logo updated.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function ProviderSettingsPage() {
    const { user } = useAuth();
    const [org, setOrg] = useState<MyOrganization | null>(null);
    const [loading, setLoading] = useState(true);

    // See DoctorsPage.tsx for why this checks user.role (singular) and
    // not user.roles — the plural field is never populated by the login
    // flow, so `?? true` here was making every non-admin an admin.
    const isAdmin = (user as any)?.role === 'provider_admin';

    useEffect(() => {
        getMyOrganization()
            .then(setOrg)
            .catch((err) => console.warn('Could not load organization:', err))
            .finally(() => setLoading(false));
    }, []);

    if (!isAdmin) {
        return (
            <div className="animate-fade-in py-16 text-center" style={{ color: '#3e5a78' }}>
                <Image size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Settings are only available to your facility's administrator.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-2xl">
            <div className="mb-6">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Settings</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>Facility branding and preferences</p>
            </div>

            {loading ? (
                <div className="py-16 text-center" style={{ color: '#3e5a78' }}>
                    <Loader2 size={24} className="mx-auto animate-spin" />
                </div>
            ) : (
                <BrandingSection org={org} onUpdated={(logo) => setOrg(prev => prev ? { ...prev, logo } : prev)} />
            )}
        </div>
    );
}
