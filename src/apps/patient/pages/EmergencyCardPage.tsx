import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import {
    QrCode, Phone, Droplets, AlertTriangle, Download, Share2, ShieldAlert,
    WifiOff, Activity, Heart, CheckCircle, MapPin, Clock, RefreshCw,
    ChevronDown, ChevronUp, Pill, Users, Building2, Navigation,
} from 'lucide-react';
import { useNetwork } from '@/shared/hooks/useNetwork';

/* ─── Mock data ──────────────────────────────────────────────────────── */
const EMERGENCY_DATA = {
    bloodType: 'B+',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: ['Hypertension (controlled)', 'Type 2 Diabetes'],
    medications: ['Lisinopril 10mg/day', 'Metformin 500mg twice daily'],
    contacts: [
        { name: 'Chukwuemeka Okafor', rel: 'Husband', phone: '+234 801 234 5678' },
        { name: 'Dr. Fatima Aliyu', rel: 'Primary Doctor', phone: '+234 812 345 6789' },
    ],
};

const FAMILY_MEMBERS = [
    { name: 'Chukwuemeka Okafor', rel: 'Husband', age: 48, bloodType: 'O+', allergies: ['Sulfa drugs'], avatar: 'CO', avatarBg: '#1a6b42' },
    { name: 'Adaeze Okafor', rel: 'Daughter', age: 19, bloodType: 'A+', allergies: [], avatar: 'AO', avatarBg: '#8b5cf6' },
    { name: 'Emeka Okafor Jr.', rel: 'Son', age: 14, bloodType: 'B+', allergies: ['Latex'], avatar: 'EO', avatarBg: '#0ea5e9' },
];

const NEARBY_HOSPITALS = [
    { name: 'Lagos Island General Hospital', distance: '0.8 km', type: 'Government', verified: true, phone: '+234 1 460 0000', accepts: ['Emergency', 'Trauma', 'ICU'] },
    { name: 'Reddington Hospital', distance: '1.4 km', type: 'Private', verified: true, phone: '+234 1 271 9900', accepts: ['Emergency', 'Cardiology', 'Surgery'] },
    { name: 'St. Nicholas Hospital', distance: '2.1 km', type: 'Private', verified: true, phone: '+234 1 263 5861', accepts: ['Emergency', 'Endocrinology'] },
];

/* ─── Freshness indicator ────────────────────────────────────────────── */
type Freshness = 'live' | 'recent' | 'stale';
function useFreshness(): { label: string; freshness: Freshness; minutesAgo: number } {
    // Simulate last sync was 2 hours ago
    const minutesAgo = 120;
    const freshness: Freshness = minutesAgo < 30 ? 'live' : minutesAgo < 240 ? 'recent' : 'stale';
    const label = minutesAgo < 1 ? 'Just now' : minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`;
    return { label, freshness, minutesAgo };
}

/* ─── Red QR (no diagonal stripes) ──────────────────────────────────── */
function RedQR({ userId }: { userId?: string }) {
    const pattern = React.useMemo(() => {
        const seed = (userId ?? 'default').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return Array.from({ length: 100 }, (_, i) => {
            const row = Math.floor(i / 10), col = i % 10;
            const isFinder = (row < 3 && col < 3) || (row < 3 && col >= 7) || (row >= 7 && col < 3);
            return isFinder ? true : ((seed * (i + 1) * 7919) % 100) > 45;
        });
    }, [userId]);

    return (
        <div className="bg-white p-4 rounded-2xl relative overflow-hidden"
            style={{ boxShadow: 'inset 0 0 0 3px #fecaca' }}>
            {/* Scan line */}
            <div className="absolute left-2 right-2 h-0.5 z-10 rounded-full"
                style={{ background: 'rgba(220,38,38,0.6)', boxShadow: '0 0 10px rgba(220,38,38,0.8)', animation: 'qrscan 2.5s ease-in-out infinite', top: '15%' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,16px)', gridTemplateRows: 'repeat(10,16px)', gap: 1 }}>
                {pattern.map((dark, i) => {
                    const row = Math.floor(i / 10), col = i % 10;
                    const isFinder = (row < 3 && col < 3) || (row < 3 && col >= 7) || (row >= 7 && col < 3);
                    return (
                        <div key={i} style={{
                            background: dark ? '#dc2626' : '#fff',
                            borderRadius: isFinder ? 3 : 1,
                        }} />
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export function EmergencyCardPage() {
    const { user } = useAuth();
    const { isOnline } = useNetwork();
    const { label: syncLabel, freshness } = useFreshness();
    const [copied, setCopied] = useState(false);
    const [showFamily, setShowFamily] = useState(false);
    const [showHospitals, setShowHospitals] = useState(false);
    const [locating, setLocating] = useState(false);

    const freshnessConfig = {
        live: { bg: '#d1fae5', text: '#065f46', dot: '#22c55e', label: 'Live — Synced' },
        recent: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: `Synced ${syncLabel}` },
        stale: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: `Last sync ${syncLabel} — Update now` },
    };
    const fc = freshnessConfig[freshness];

    const copyLink = () => {
        navigator.clipboard.writeText(`https://welli.ng/emergency/${user?.userId ?? 'patient'}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLocate = () => {
        setLocating(true);
        setTimeout(() => { setLocating(false); setShowHospitals(true); }, 1400);
    };

    const displayId = user?.userId ? `WR-${user.userId.slice(-4).toUpperCase()}-EMG` : 'WR-XKA9-EMG';
    const displayName = user?.name && user.name !== 'MOCK PATIENT' ? user.name : 'Adaeze M. Okafor';

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">

            {/* ── Persistent offline / SMS banner ── */}
            <div className="mb-5 rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3"
                style={{ background: 'linear-gradient(135deg,#1a2e1e,#1a6b42)', color: 'white' }}>
                <div className="flex items-center gap-2">
                    {isOnline
                        ? <CheckCircle size={16} style={{ color: '#86efac' }} />
                        : <WifiOff size={16} style={{ color: '#fca5a5' }} />}
                    <span className="text-sm font-bold">
                        {isOnline ? 'Available online & offline' : 'Offline Mode — Cached data displayed'}
                    </span>
                </div>
                <div className="w-px h-4 bg-white/20 hidden sm:block" />
                <span className="text-xs opacity-80">
                    📲 Scanning the QR instantly SMS-alerts your emergency contacts · No internet required for first responders
                </span>
                {!isOnline && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#ef4444' }}>OFFLINE</span>
                )}
            </div>

            {/* ── Page header ── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: '#dc2626', boxShadow: '0 0 24px rgba(220,38,38,0.35)' }}>
                        <ShieldAlert size={30} className="text-white" style={{ animation: 'pulse 2.5s infinite' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-black uppercase tracking-tight" style={{ color: '#b91c1c' }}>Emergency Card</h1>
                        <p className="text-sm font-semibold" style={{ color: '#991b1b' }}>Break-glass access for first responders</p>
                    </div>
                </div>

                {/* Freshness indicator */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: fc.bg, color: fc.text }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: fc.dot, animation: freshness === 'live' ? 'pulse 2s infinite' : undefined }} />
                    <Clock size={11} />
                    {fc.label}
                    {freshness === 'stale' && (
                        <button className="ml-1 underline underline-offset-2 flex items-center gap-1">
                            <RefreshCw size={10} /> Sync
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">

                {/* ── Left: QR card (2/5) ── */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Red-tinted card — no stripes */}
                    <div className="rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-5"
                        style={{ background: 'linear-gradient(160deg,#fef2f2 0%,#fee2e2 60%,#fecaca 100%)', border: '2.5px solid #fca5a5' }}>
                        {/* Patient ID header */}
                        <div className="w-full text-center">
                            <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#dc2626' }}>WelliRecord Emergency ID</div>
                            <div className="font-black text-xl tracking-tight" style={{ color: '#7f1d1d' }}>{displayName}</div>
                            <div className="font-mono text-xs font-bold mt-1 px-3 py-1 rounded-lg inline-block"
                                style={{ background: '#fca5a560', color: '#b91c1c' }}>{displayId}</div>
                        </div>

                        <RedQR userId={user?.userId} />

                        <div className="w-full text-center text-xs font-mono font-bold"
                            style={{ color: '#b91c1c' }}>
                            welli.ng/em/{user?.userId?.slice(-6) ?? 'xka9b1'}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button onClick={copyLink}
                            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-colors"
                            style={{ borderColor: '#dc2626', color: '#dc2626', background: copied ? '#fee2e2' : 'white' }}>
                            <Share2 size={15} /> {copied ? 'Link Copied!' : 'Share Access'}
                        </button>
                        <button className="py-3 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-colors"
                            style={{ background: '#dc2626', boxShadow: '0 4px 14px rgba(220,38,38,0.4)' }}>
                            <Download size={15} /> Save
                        </button>
                    </div>

                    {/* Nearby hospitals */}
                    <button onClick={handleLocate}
                        disabled={locating}
                        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all"
                        style={{ borderColor: '#1a6b42', color: '#1a6b42', background: 'white' }}>
                        {locating
                            ? <><RefreshCw size={15} className="animate-spin" /> Locating...</>
                            : <><Navigation size={15} /> Show Nearby WelliRecord Hospitals</>}
                    </button>

                    {/* Nearby hospitals panel */}
                    {showHospitals && (
                        <div className="space-y-2 animate-fade-in">
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5a7a63' }}>
                                3 Verified Partners Near You
                            </div>
                            {NEARBY_HOSPITALS.map((h, i) => (
                                <div key={i} className="rounded-xl border p-3" style={{ background: 'white', borderColor: '#e5e7eb' }}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="font-bold text-xs" style={{ color: '#1a2e1e' }}>{h.name}</div>
                                            <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: '#6b7280' }}>
                                                <span className="flex items-center gap-0.5"><MapPin size={9} /> {h.distance}</span>
                                                <span>·</span>
                                                <span>{h.type}</span>
                                                {h.verified && <span className="text-green-600 font-bold flex items-center gap-0.5"><CheckCircle size={9} /> Verified</span>}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {h.accepts.map(a => (
                                                    <span key={a} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                                        style={{ background: '#d1fae5', color: '#065f46' }}>{a}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <a href={`tel:${h.phone}`}
                                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ background: '#1a6b42', color: 'white' }}>
                                            <Phone size={13} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right: Life-critical data (3/5) ── */}
                <div className="lg:col-span-3 space-y-5">

                    {/* Blood type + Allergies */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                            style={{ background: '#fef2f2', border: '2px solid #fecaca' }}>
                            <Droplets size={100} className="absolute -right-4 -bottom-4 pointer-events-none" style={{ color: '#fecaca' }} />
                            <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#dc2626' }}>Blood Group</div>
                            <div className="text-7xl font-black leading-none" style={{ color: '#991b1b' }}>
                                {EMERGENCY_DATA.bloodType}
                            </div>
                        </div>

                        <div className="rounded-3xl p-5 flex flex-col" style={{ background: '#fff7ed', border: '2px solid #fed7aa' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={18} style={{ color: '#ea580c' }} />
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#c2410c' }}>Severe Allergies</div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 justify-center">
                                {EMERGENCY_DATA.allergies.map(a => (
                                    <div key={a} className="font-black text-base py-2 px-3 rounded-xl"
                                        style={{ background: '#fed7aa', color: '#9a3412', border: '1px solid #fdba74' }}>
                                        ⚠ {a}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Conditions + Meds */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-3xl p-5" style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Activity size={18} style={{ color: '#16a34a' }} />
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#15803d' }}>Conditions</div>
                            </div>
                            <div className="space-y-2.5">
                                {EMERGENCY_DATA.conditions.map(c => (
                                    <div key={c} className="font-bold text-sm flex items-start gap-2" style={{ color: '#1a2e1e' }}>
                                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#22c55e' }} />
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl p-5" style={{ background: '#eff6ff', border: '2px solid #bfdbfe' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Pill size={18} style={{ color: '#2563eb' }} />
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#1d4ed8' }}>Lifesaving Meds</div>
                            </div>
                            <div className="space-y-2.5">
                                {EMERGENCY_DATA.medications.map(m => (
                                    <div key={m} className="font-bold text-sm flex items-start gap-2" style={{ color: '#1a2e1e' }}>
                                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3b82f6' }} />
                                        {m}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ICE Contacts */}
                    <div className="rounded-3xl p-5" style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Phone size={18} style={{ color: '#374151' }} />
                            <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#374151' }}>ICE Contacts</div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {EMERGENCY_DATA.contacts.map(c => (
                                <a href={`tel:${c.phone}`} key={c.phone}
                                    className="flex flex-col p-4 rounded-2xl border transition-all hover:shadow-md group"
                                    style={{ background: 'white', borderColor: '#e5e7eb' }}>
                                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9ca3af' }}>{c.rel}</div>
                                    <div className="font-black text-sm mb-2" style={{ color: '#1a2e1e' }}>{c.name}</div>
                                    <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: '#2563eb' }}>
                                        <Phone size={11} /> {c.phone}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Family Emergency Contacts (expandable) */}
                    <div className="rounded-3xl overflow-hidden" style={{ border: '2px solid #ddd6fe' }}>
                        <button
                            onClick={() => setShowFamily(f => !f)}
                            className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                            style={{ background: showFamily ? '#ede9fe' : '#f5f3ff' }}>
                            <div className="flex items-center gap-2">
                                <Users size={18} style={{ color: '#7c3aed' }} />
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#6d28d9' }}>
                                    Family Emergency Contacts ({FAMILY_MEMBERS.length} members)
                                </div>
                            </div>
                            {showFamily ? <ChevronUp size={16} style={{ color: '#7c3aed' }} /> : <ChevronDown size={16} style={{ color: '#7c3aed' }} />}
                        </button>

                        {showFamily && (
                            <div className="px-5 pb-5 pt-3 space-y-3" style={{ background: '#f5f3ff' }}>
                                {FAMILY_MEMBERS.map(m => (
                                    <div key={m.name}
                                        className="flex items-center gap-3 p-3 rounded-2xl"
                                        style={{ background: 'white', border: '1px solid #ddd6fe' }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs flex-shrink-0"
                                            style={{ background: m.avatarBg }}>{m.avatar}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm" style={{ color: '#1a2e1e' }}>{m.name}</div>
                                            <div className="text-[10px] font-semibold" style={{ color: '#9ca3af' }}>{m.rel} · Age {m.age}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="font-black text-xl leading-none" style={{ color: '#dc2626' }}>{m.bloodType}</div>
                                            {m.allergies.length > 0 && (
                                                <div className="text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full"
                                                    style={{ background: '#fee2e2', color: '#b91c1c' }}>
                                                    ⚠ {m.allergies.join(', ')}
                                                </div>
                                            )}
                                            {m.allergies.length === 0 && (
                                                <div className="text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full"
                                                    style={{ background: '#d1fae5', color: '#065f46' }}>
                                                    No known allergies
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes qrscan {
                    0%   { top: 12%; opacity: 0; }
                    8%   { opacity: 1; }
                    92%  { opacity: 1; }
                    100% { top: 88%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
