import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    getMyOrganization,
    uploadOrganizationLogo,
    removeOrganizationLogo,
    MyOrganization,
} from '@/shared/api/organizationApi';
import { orgApi } from '@/shared/api/orgApi';
import {
    Upload,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle,
    Building2,
    ShieldCheck,
    Bell,
    Globe,
    FileCheck2,
    Settings,
    Sliders,
    Sparkles,
} from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/* ─── Branding & Identity Section ────────────────────────────────────────── */
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
        if (!window.confirm('Are you sure you want to remove your facility logo? The default facility icon will be used.')) {
            return;
        }
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
        <div className="card-provider p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#163761' }}>
                <div>
                    <h2 className="font-bold text-base" style={{ color: '#e2eaf4' }}>Facility Branding & Profile</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                        Custom logo and organization identity shown across team portals, orders, and patient vault shares
                    </p>
                </div>
                {org?.verificationStatus === 'approved' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck size={13} />
                        Verified Facility
                    </span>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Logo Preview Avatar */}
                <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border shadow-lg"
                    style={{ background: 'rgba(7,24,48,0.6)', borderColor: '#163761' }}
                >
                    {org?.logo ? (
                        <img src={org.logo} alt={org.organizationName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl">{orgApi.getOrgTypeIcon(org?.organizationType ?? 'hospital')}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-400">No Logo</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                    <div>
                        <h3 className="text-base font-bold truncate" style={{ color: '#e2eaf4' }}>
                            {org?.organizationName || 'Your Facility'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs" style={{ color: '#7ba3c8' }}>
                            <span className="font-mono bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800 text-sky-400">
                                {org?.wrOrgId || 'WR-ORG'}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{org?.organizationType?.replace('_', ' ') || 'Healthcare Provider'}</span>
                            {org?.contactPersonName && (
                                <>
                                    <span>•</span>
                                    <span>Lead: {org.contactPersonName}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action buttons with distinct spacing & layout */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#38bdf8] hover:bg-[#60a5fa] transition-all cursor-pointer select-none active:scale-[0.98]">
                            {uploading ? (
                                <Loader2 size={14} className="animate-spin flex-shrink-0" />
                            ) : (
                                <Upload size={14} className="flex-shrink-0" />
                            )}
                            <span>{uploading ? 'Uploading…' : org?.logo ? 'Replace logo' : 'Upload logo'}</span>
                            <input
                                type="file"
                                accept={ALLOWED_TYPES.join(',')}
                                className="hidden"
                                disabled={uploading}
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                        </label>

                        {org?.logo && (
                            <div className="flex items-center">
                                <div className="h-5 w-px bg-slate-800 mx-1" />
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={removing}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-40"
                                >
                                    {removing ? (
                                        <Loader2 size={13} className="animate-spin flex-shrink-0" />
                                    ) : (
                                        <Trash2 size={13} className="flex-shrink-0" />
                                    )}
                                    <span>Remove logo</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-[11px]" style={{ color: '#4c6a8c' }}>
                        Accepted formats: JPG, PNG, WEBP, or SVG under 5MB. Recommended resolution: 256×256px square.
                    </p>

                    {error && (
                        <p className="text-xs flex items-center gap-1.5" style={{ color: '#f87171' }}>
                            <AlertCircle size={12} className="flex-shrink-0" /> {error}
                        </p>
                    )}
                    {saved && (
                        <p className="text-xs flex items-center gap-1.5" style={{ color: '#34d399' }}>
                            <CheckCircle size={12} className="flex-shrink-0" /> Logo updated successfully.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Operational & Clinical Preferences ─────────────────────────────────── */
function OperationalPreferencesSection() {
    const [encounterDefault, setEncounterDefault] = useState('in_person');
    const [timezone, setTimezone] = useState('Africa/Lagos');
    const [labAutoRelease, setLabAutoRelease] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSave = () => {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="card-provider p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#163761' }}>
                <div>
                    <h2 className="font-bold text-base flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                        <Sliders size={16} className="text-sky-400" />
                        <span>Clinical & Operational Preferences</span>
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                        Facility-wide consultation defaults, timezone settings, and clinical workflow rules
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>
                        Default Consultation Modality
                    </label>
                    <select
                        value={encounterDefault}
                        onChange={(e) => setEncounterDefault(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors focus:border-sky-500"
                        style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761', color: '#e2eaf4' }}
                    >
                        <option value="in_person">In-Person Consultation (Facility Visit)</option>
                        <option value="telemedicine">Telemedicine / Virtual Video Encounter</option>
                        <option value="home_visit">Home Care / Outreach Visit</option>
                    </select>
                    <p className="text-[11px] mt-1" style={{ color: '#4c6a8c' }}>
                        Pre-selected for new encounters created by your clinical team
                    </p>
                </div>

                <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: '#dbe6f2' }}>
                        Facility Timezone & Timestamps
                    </label>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-colors focus:border-sky-500"
                        style={{ background: 'rgba(7,24,48,0.5)', borderColor: '#163761', color: '#e2eaf4' }}
                    >
                        <option value="Africa/Lagos">West Africa Time (WAT / Lagos GMT+1)</option>
                        <option value="Africa/Accra">Greenwich Mean Time (GMT / Accra)</option>
                        <option value="Africa/Nairobi">East Africa Time (EAT / Nairobi GMT+3)</option>
                        <option value="UTC">Universal Coordinated Time (UTC)</option>
                    </select>
                    <p className="text-[11px] mt-1" style={{ color: '#4c6a8c' }}>
                        Used for appointment slots, prescription schedules, and delivery logs
                    </p>
                </div>
            </div>

            <div className="pt-2 border-t" style={{ borderColor: '#163761' }}>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={labAutoRelease}
                        onChange={(e) => setLabAutoRelease(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500"
                    />
                    <div>
                        <span className="block text-xs font-bold" style={{ color: '#e2eaf4' }}>
                            Direct-to-Patient Lab Result Delivery
                        </span>
                        <span className="block text-[11px] mt-0.5 leading-relaxed" style={{ color: '#7ba3c8' }}>
                            When checked, non-critical lab results are automatically released to the patient's Health Vault upon technician entry without requiring a manual review step. Critical results always alert ordering physicians.
                        </span>
                    </div>
                </label>
            </div>

            <div className="flex items-center justify-between pt-2">
                {savedNotice ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle size={13} /> Preferences saved.
                    </span>
                ) : <span />}
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#38bdf8] hover:bg-[#60a5fa] transition-all"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
}

/* ─── Notification & Alert Rules ─────────────────────────────────────────── */
function NotificationPreferencesSection() {
    return (
        <div className="card-provider p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#163761' }}>
                <div>
                    <h2 className="font-bold text-base flex items-center gap-2" style={{ color: '#e2eaf4' }}>
                        <Bell size={16} className="text-sky-400" />
                        <span>Automated Notifications & Dispatch</span>
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: '#7ba3c8' }}>
                        Configure facility messaging channels, panic alerts, and automated patient reminders
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ borderColor: '#163761', background: 'rgba(7,24,48,0.3)' }}>
                    <div>
                        <div className="text-xs font-bold text-slate-200">Critical Lab Panic SMS Alerts</div>
                        <div className="text-[11px] text-slate-400">Immediate SMS alerts to ordering physicians and patients for out-of-bounds lab results</div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active (Termii SMS)
                    </span>
                </div>

                <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ borderColor: '#163761', background: 'rgba(7,24,48,0.3)' }}>
                    <div>
                        <div className="text-xs font-bold text-slate-200">1-Hour Appointment SMS Reminders</div>
                        <div className="text-[11px] text-slate-400">Automated SMS dispatch to patients 60 minutes before scheduled consultation slots</div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active (5m Poll Interval)
                    </span>
                </div>

                <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ borderColor: '#163761', background: 'rgba(7,24,48,0.3)' }}>
                    <div>
                        <div className="text-xs font-bold text-slate-200">In-App Confirmation Dispatches</div>
                        <div className="text-[11px] text-slate-400">Template-driven notification delivery directly to patient mobile and web vaults</div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Enabled
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─── Compliance & Governance Sidebar Card ───────────────────────────────── */
function GovernanceCard() {
    return (
        <div className="card-provider p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold pb-2 border-b" style={{ borderColor: '#163761', color: '#e2eaf4' }}>
                <FileCheck2 size={15} className="text-emerald-400" />
                <span>Governance & Statutory Compliance</span>
            </div>

            <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1">
                    <span style={{ color: '#7ba3c8' }}>Data Sovereign Storage</span>
                    <span className="font-semibold text-slate-200">NDPR / NDPA Compliant</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t" style={{ borderColor: 'rgba(22,55,97,0.4)' }}>
                    <span style={{ color: '#7ba3c8' }}>Clinical Record Retention</span>
                    <span className="font-semibold text-slate-200">7 Years (MDCN Statutory)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t" style={{ borderColor: 'rgba(22,55,97,0.4)' }}>
                    <span style={{ color: '#7ba3c8' }}>Audit Trail Integrity</span>
                    <span className="font-semibold text-emerald-400">Immutable Cryptographic Log</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Coming Soon Modules Card ───────────────────────────────────────────── */
function RoadmapSettingsCard() {
    return (
        <div className="card-provider p-5 space-y-3" style={{ border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.03)' }}>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <Sparkles size={15} className="text-purple-400" />
                <span>Upcoming Facility Extensions</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#7ba3c8' }}>
                Additional provider administration features currently in active deployment:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Custom White-Label Portal Subdomain</span>
                </li>
                <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Inbound HL7 / FHIR EMR Webhook Connectors</span>
                </li>
                <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Multi-Branch Department Routing</span>
                </li>
            </ul>
        </div>
    );
}

/* ─── Main Settings Page Component ───────────────────────────────────────── */
export function ProviderSettingsPage() {
    const { user } = useAuth();
    const [org, setOrg] = useState<MyOrganization | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = (user as any)?.role === 'provider_admin';

    useEffect(() => {
        getMyOrganization()
            .then(setOrg)
            .catch((err) => console.warn('Could not load organization:', err))
            .finally(() => setLoading(false));
    }, []);

    if (!isAdmin) {
        return (
            <div className="animate-fade-in py-16 text-center max-w-md mx-auto" style={{ color: '#7ba3c8' }}>
                <Building2 size={36} className="mx-auto mb-3 opacity-30 text-sky-400" />
                <h3 className="font-bold text-base text-slate-200">Administrator Access Required</h3>
                <p className="text-xs mt-1.5 leading-relaxed">
                    Facility settings and branding controls are restricted to the designated organization administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in w-full max-w-7xl pb-12">
            {/* Header */}
            <div className="mb-6">
                <h1 className="section-header font-display" style={{ color: '#e2eaf4' }}>Facility Settings</h1>
                <p className="text-sm" style={{ color: '#7ba3c8' }}>
                    Configure facility branding, clinical defaults, and operational preferences
                </p>
            </div>

            {loading ? (
                <div className="card-provider p-16 text-center flex flex-col items-center gap-2" style={{ color: '#7ba3c8' }}>
                    <Loader2 size={24} className="animate-spin text-sky-400" />
                    <span className="text-xs font-semibold">Loading facility configuration…</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (Branding & Preferences Form) */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                        <BrandingSection
                            org={org}
                            onUpdated={(logo) => setOrg((prev) => (prev ? { ...prev, logo } : prev))}
                        />
                        <OperationalPreferencesSection />
                        <NotificationPreferencesSection />
                    </div>

                    {/* Right Column (Governance, Compliance & Extensions) */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-5">
                        <GovernanceCard />
                        <RoadmapSettingsCard />
                    </div>
                </div>
            )}
        </div>
    );
}
