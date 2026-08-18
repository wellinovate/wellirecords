import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    Phone, Droplets, AlertTriangle, Share2, ShieldAlert,
    WifiOff, Activity, CheckCircle, Clock, RefreshCw,
    ChevronDown, ChevronUp, Pill, Users, Navigation, Loader2,
} from 'lucide-react';
import { useNetwork } from '@/shared/hooks/useNetwork';
import { fetchProfile } from '@/shared/utils/utilityFunction';
import { getPatientRecords } from '@/shared/api/clinicalApi';
import { consentApi } from '@/shared/api/consentApi';
import { dependantApi, DependantResponseData } from '@/shared/api/dependantApi';

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Profile {
    fullName?: string;
    wrId?: string;
    bloodGroup?: string | null;
    genotype?: string | null;
    emergencyContacts?: { name: string; relationship?: string | null; phone: string }[];
}

interface AllergyItem {
    allergen: string;
    severity?: string | null;
    reaction?: string | null;
}

interface DiagnosisItem {
    diagnosisName: string;
    diagnosisType?: string | null;
}

interface MedicationItem {
    medicationName: string;
    dosage?: { value?: string | number; unit?: string } | null;
}

/* ─── Freshness — derived from when the share link was actually issued,
   not simulated ────────────────────────────────────────────────────── */
type Freshness = 'live' | 'recent' | 'stale';
function useFreshness(issuedAt: string | null): { label: string; freshness: Freshness } {
    const [, forceTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => forceTick((n) => n + 1), 60000);
        return () => clearInterval(id);
    }, []);

    if (!issuedAt) {
        return { label: 'Not generated yet', freshness: 'stale' };
    }
    const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(issuedAt).getTime()) / 60000));
    const freshness: Freshness = minutesAgo < 30 ? 'live' : minutesAgo < 240 ? 'recent' : 'stale';
    const label =
        minutesAgo < 1 ? 'Just now'
            : minutesAgo < 60 ? `${minutesAgo}m ago`
                : minutesAgo < 60 * 24 ? `${Math.floor(minutesAgo / 60)}h ago`
                    : `${Math.floor(minutesAgo / (60 * 24))}d ago`;
    return { label, freshness };
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function EmergencyCardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isOnline } = useNetwork();
    const patientId = (user as any)?.sub as string | undefined;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [allergies, setAllergies] = useState<AllergyItem[]>([]);
    const [conditions, setConditions] = useState<DiagnosisItem[]>([]);
    const [medications, setMedications] = useState<MedicationItem[]>([]);
    const [dependants, setDependants] = useState<DependantResponseData[]>([]);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [shareIssuedAt, setShareIssuedAt] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showFamily, setShowFamily] = useState(false);

    const { label: syncLabel, freshness } = useFreshness(shareIssuedAt);

    const loadEmergencyLink = async (forceNew = false) => {
        if (!patientId) return;
        try {
            if (!forceNew) {
                const grants = await consentApi.getMyGrants(patientId);
                const existing = (Array.isArray(grants) ? grants : [])
                    .filter((g: any) =>
                        g.purpose === 'emergency-card' &&
                        g.accessScope === 'full-record' &&
                        g.status === 'active' &&
                        g.granteeType === 'link' &&
                        (!g.expiresAt || new Date(g.expiresAt) > new Date()),
                    )
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                if (existing?.shareToken) {
                    setShareUrl(`${window.location.origin}/bridge/${existing.shareToken}`);
                    setShareIssuedAt(existing.createdAt);
                    return;
                }
            }

            const result = await consentApi.createShareLink(patientId, {
                accessScope: 'full-record',
                durationHours: 24 * 30,
                oneTimeUse: false,
                purpose: 'emergency-card',
            });
            setShareUrl(result.shareUrl);
            setShareIssuedAt(result.grant?.createdAt ?? new Date().toISOString());
        } catch (err) {
            console.error('Failed to load/create emergency share link:', err);
        }
    };

    useEffect(() => {
        if (!patientId) return;

        let cancelled = false;
        setLoading(true);
        setError('');

        Promise.all([
            fetchProfile().catch(() => null),
            getPatientRecords('allergies', patientId, { limit: 20 }).catch(() => null),
            getPatientRecords('diagnoses', patientId, { limit: 20 }).catch(() => null),
            getPatientRecords('medications', patientId, { limit: 20 }).catch(() => null),
            dependantApi.listDependants().catch(() => []),
            loadEmergencyLink(),
        ]).then(([profileRes, allergyRes, diagnosisRes, medicationRes, deps]) => {
            if (cancelled) return;
            setProfile(profileRes || null);
            setAllergies((allergyRes as any)?.data?.items ?? []);
            setConditions(
                ((diagnosisRes as any)?.data?.items ?? []).filter(
                    (d: any) => d.diagnosisType === 'chronic' || d.diagnosisType === 'confirmed',
                ),
            );
            setMedications((medicationRes as any)?.data?.items ?? []);
            setDependants(Array.isArray(deps) ? deps : []);
        }).catch((err) => {
            if (!cancelled) setError('Some of your emergency information could not be loaded.');
            console.error('Emergency card load failed:', err);
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    const freshnessConfig = {
        live: { bg: '#d1fae5', text: '#065f46', dot: '#22c55e', label: 'Live — Synced' },
        recent: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: `Synced ${syncLabel}` },
        stale: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: shareIssuedAt ? `Last synced ${syncLabel} — Regenerate` : 'Not generated yet' },
    };
    const fc = freshnessConfig[freshness];

    const copyLink = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        await loadEmergencyLink(true);
        setRegenerating(false);
    };

    const displayName = profile?.fullName || user?.name || 'Your name';
    const displayId = profile?.wrId || 'Not yet issued';
    const emergencyContacts = profile?.emergencyContacts ?? [];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin" style={{ color: '#dc2626' }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* ── Offline indicator / emergency banner ── */}
            <div className="mb-6 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-white"
                style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', boxShadow: '0 8px 32px rgba(220,38,38,0.25)' }}>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <ShieldAlert size={20} />
                    {isOnline
                        ? <CheckCircle size={16} style={{ color: '#86efac' }} />
                        : <WifiOff size={16} style={{ color: '#fca5a5' }} />}
                    <span className="text-sm font-bold">
                        {isOnline ? 'Available online' : 'Offline — this card needs a connection to load'}
                    </span>
                </div>
                <div className="w-px h-4 bg-white/20 hidden sm:block" />
                <span className="text-xs opacity-80">
                    Scanning the QR opens a secure, time-limited view of your allergy, blood group, and emergency contact info — no login required for the responder
                </span>
                {!isOnline && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#ef4444' }}>OFFLINE</span>
                )}
            </div>

            {error && (
                <div className="mb-5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            {/* ── Page header ── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
                        <Activity size={24} style={{ color: '#dc2626' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--pat-text)' }}>
                            Emergency Medical Card
                        </h1>
                        <p className="text-xs" style={{ color: 'var(--pat-muted)' }}>
                            Instant-access medical information for first responders and emergency personnel
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: fc.bg, color: fc.text }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: fc.dot, animation: freshness === 'live' ? 'pulse 2s infinite' : undefined }} />
                    <Clock size={11} />
                    {fc.label}
                    {freshness === 'stale' && (
                        <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="ml-1 underline underline-offset-2 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                            {regenerating ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />} Sync
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── Left: QR card (2/5) ── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-5"
                        style={{ background: 'linear-gradient(160deg,#fef2f2 0%,#fee2e2 60%,#fecaca 100%)', border: '2.5px solid #fca5a5' }}>
                        <div className="w-full text-center">
                            <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#dc2626' }}>WelliRecord Emergency ID</div>
                            <div className="font-black text-xl tracking-tight" style={{ color: '#7f1d1d' }}>{displayName}</div>
                            <div className="inline-block text-xs font-mono font-bold px-2 py-0.5 rounded-full mt-1"
                                style={{ background: '#fca5a560', color: '#b91c1c' }}>{displayId}</div>
                        </div>

                        {shareUrl ? (
                            <div className="bg-white p-4 rounded-2xl" style={{ boxShadow: 'inset 0 0 0 3px #fecaca' }}>
                                <QRCode value={shareUrl} size={160} />
                            </div>
                        ) : (
                            <div className="w-[192px] h-[192px] rounded-2xl bg-white flex items-center justify-center text-xs text-center px-4" style={{ color: '#991b1b' }}>
                                Couldn't generate a QR code. Try Sync above.
                            </div>
                        )}

                        {shareUrl && (
                            <div className="w-full text-center text-xs font-mono font-bold break-all" style={{ color: '#b91c1c' }}>
                                {shareUrl.replace(/^https?:\/\//, '')}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={copyLink}
                            disabled={!shareUrl}
                            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-colors disabled:opacity-50 cursor-pointer"
                            style={{ borderColor: '#dc2626', color: '#dc2626', background: copied ? '#fee2e2' : 'white' }}>
                            <Share2 size={15} /> {copied ? 'Link Copied!' : 'Share Access'}
                        </button>
                    </div>

                    <button onClick={() => navigate('/patient/find-care')}
                        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer"
                        style={{ borderColor: '#1a6b42', color: '#1a6b42', background: 'white' }}>
                        <Navigation size={15} /> Find Nearby Care
                    </button>
                </div>

                {/* ── Right: Life-critical data (3/5) ── */}
                <div className="lg:col-span-3 space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                            style={{ background: '#fef2f2', border: '2px solid #fecaca' }}>
                            <Droplets size={100} className="absolute -right-4 -bottom-4 pointer-events-none" style={{ color: '#fecaca' }} />
                            <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#dc2626' }}>Blood Group</div>
                            <div className="text-6xl font-black leading-none" style={{ color: '#991b1b' }}>
                                {profile?.bloodGroup || '—'}
                            </div>
                            <div className="text-[10px] font-semibold mt-2" style={{ color: '#b91c1c' }}>Self-reported, not lab-verified</div>
                        </div>

                        <div className="rounded-3xl p-5 flex flex-col" style={{ background: '#fff7ed', border: '2px solid #fed7aa' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={18} style={{ color: '#ea580c' }} />
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#c2410c' }}>Allergies</div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 justify-center">
                                {allergies.length === 0 && (
                                    <div className="text-xs font-semibold" style={{ color: '#9a3412' }}>None on file</div>
                                )}
                                {allergies.map((a, i) => (
                                    <div key={i} className="font-black text-sm py-2 px-3 rounded-xl"
                                        style={{ background: '#fed7aa', color: '#9a3412', border: '1px solid #fdba74' }}>
                                        ⚠ {a.allergen}{a.severity ? ` — ${a.severity}` : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-3xl p-5" style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Activity size={18} style={{ color: '#16a34a' }} />
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#15803d' }}>Conditions</div>
                            </div>
                            <div className="space-y-2.5">
                                {conditions.length === 0 && (
                                    <div className="text-xs font-semibold" style={{ color: '#166534' }}>None on file</div>
                                )}
                                {conditions.map((c, i) => (
                                    <div key={i} className="font-bold text-sm flex items-start gap-2" style={{ color: '#1a2e1e' }}>
                                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#22c55e' }} />
                                        {c.diagnosisName}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl p-5" style={{ background: '#eff6ff', border: '2px solid #bfdbfe' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Pill size={18} style={{ color: '#2563eb' }} />
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#1d4ed8' }}>Medications</div>
                            </div>
                            <div className="space-y-2.5">
                                {medications.length === 0 && (
                                    <div className="text-xs font-semibold" style={{ color: '#1e40af' }}>None on file</div>
                                )}
                                {medications.map((m, i) => (
                                    <div key={i} className="font-bold text-sm flex items-start gap-2" style={{ color: '#1a2e1e' }}>
                                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3b82f6' }} />
                                        {m.medicationName}{m.dosage?.value ? ` ${m.dosage.value}${m.dosage.unit || ''}` : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl p-5" style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Phone size={18} style={{ color: '#374151' }} />
                            <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#374151' }}>Emergency Contacts</div>
                        </div>
                        {emergencyContacts.length === 0 ? (
                            <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>
                                No emergency contacts on file yet. Add one from your profile settings.
                            </p>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {emergencyContacts.map((c, i) => (
                                    <a href={`tel:${c.phone}`} key={i}
                                        className="flex flex-col p-4 rounded-2xl border transition-all hover:shadow-md group"
                                        style={{ background: 'white', borderColor: '#e5e7eb' }}>
                                        {c.relationship && (
                                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9ca3af' }}>{c.relationship}</div>
                                        )}
                                        <div className="font-black text-sm mb-2" style={{ color: '#1a2e1e' }}>{c.name}</div>
                                        <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: '#2563eb' }}>
                                            <Phone size={11} /> {c.phone}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Family (expandable) */}
                    {dependants.length > 0 && (
                        <div className="rounded-3xl overflow-hidden" style={{ border: '2px solid #ddd6fe' }}>
                            <button
                                onClick={() => setShowFamily((f) => !f)}
                                className="w-full flex items-center justify-between px-5 py-4 transition-colors cursor-pointer"
                                style={{ background: showFamily ? '#ede9fe' : '#f5f3ff' }}>
                                <div className="flex items-center gap-2">
                                    <Users size={18} style={{ color: '#7c3aed' }} />
                                    <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#6d28d9' }}>
                                        Family ({dependants.length})
                                    </div>
                                </div>
                                {showFamily ? <ChevronUp size={16} style={{ color: '#7c3aed' }} /> : <ChevronDown size={16} style={{ color: '#7c3aed' }} />}
                            </button>

                            {showFamily && (
                                <div className="px-5 pb-5 pt-3 space-y-3" style={{ background: '#f5f3ff' }}>
                                    {dependants.map((d) => (
                                        <button
                                            key={d.dependantId}
                                            onClick={() => navigate(`/patient/dependants/${d.dependantId}`)}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer"
                                            style={{ background: 'white', border: '1px solid #ddd6fe' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs flex-shrink-0"
                                                style={{ background: '#7c3aed' }}>
                                                {d.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm" style={{ color: '#1a2e1e' }}>{d.fullName}</div>
                                                <div className="text-[10px] font-semibold" style={{ color: '#9ca3af' }}>View emergency info</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-black text-lg leading-none" style={{ color: '#dc2626' }}>{d.bloodGroup || '—'}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
