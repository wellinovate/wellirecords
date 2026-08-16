import React, { useEffect, useMemo, useState } from "react";
import {
    ShieldCheck, Plus, X, Loader2, Clock, CheckCircle2, XCircle,
    Banknote, ChevronDown, ChevronUp,
} from "lucide-react";
import { pharmacyClaimsApi, type PharmacyClaim, type ClaimStatus } from "@/shared/api/pharmacyClaimsApi";
import { getAllPharmacyOrders, type PharmacyOrder } from "@/shared/api/pharmacyOrdersApi";
import { PatientSearchPicker } from "@/apps/components/shared/PatientSearchPicker";
import { HmoSearchPicker } from "@/apps/components/shared/HmoSearchPicker";
import { authApi } from "@/shared/api/authApi";

const T = {
    bg: "#0A1624",
    surface: "#0F1C2E",
    border: "rgba(56,189,248,0.12)",
    accent: "#38bdf8",
    text: "#E6EDF3",
    muted: "#7BA3C8",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
};

function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
        val || 0,
    );
}

const STATUS_STYLE: Record<ClaimStatus, { color: string; bg: string; label: string; icon: React.ElementType }> = {
    submitted: { color: T.warning, bg: "rgba(245,158,11,0.12)", label: "Submitted", icon: Clock },
    approved: { color: T.accent, bg: "rgba(56,189,248,0.12)", label: "Approved", icon: CheckCircle2 },
    rejected: { color: T.danger, bg: "rgba(239,68,68,0.12)", label: "Rejected", icon: XCircle },
    paid: { color: T.success, bg: "rgba(16,185,129,0.12)", label: "Paid", icon: Banknote },
};

const FILTERS: { key: ClaimStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "submitted", label: "Submitted" },
    { key: "approved", label: "Approved" },
    { key: "paid", label: "Paid" },
    { key: "rejected", label: "Rejected" },
];

function NewClaimForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
    const [patient, setPatient] = useState<{ id: string; name: string } | null>(null);
    const [orders, setOrders] = useState<PharmacyOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [hmoName, setHmoName] = useState("");
    const [hmoMemberId, setHmoMemberId] = useState("");
    const [claimAmount, setClaimAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [eligibilityNotice, setEligibilityNotice] = useState<{ hmo: string; memberId: string } | null>(null);

    useEffect(() => {
        if (!patient) return;
        setLoadingOrders(true);
        setSelectedOrderIds([]);
        getAllPharmacyOrders(1, 100)
            .then((res) => {
                const eligible = res.items.filter(
                    (o) =>
                        (o.status === "dispensed" || o.status === "picked-up") &&
                        String((o as any).patientId?._id || o.patientId) === patient.id,
                );
                setOrders(eligible);
            })
            .catch(() => setOrders([]))
            .finally(() => setLoadingOrders(false));
    }, [patient?.id]);

    const toggleOrder = (id: string) => {
        setSelectedOrderIds((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            const sum = orders.filter((o) => next.includes(o.id)).reduce((s, o) => s + (o.price || 0), 0);
            setClaimAmount(String(sum));
            return next;
        });
    };

    const canSubmit = patient && selectedOrderIds.length > 0 && hmoName.trim() && Number(claimAmount) >= 0 && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit || !patient) return;
        setSubmitting(true);
        setError("");
        try {
            await pharmacyClaimsApi.create({
                patientId: patient.id,
                orderIds: selectedOrderIds,
                hmoName: hmoName.trim(),
                hmoMemberId: hmoMemberId.trim() || undefined,
                claimAmount: Number(claimAmount),
                notes: notes.trim() || undefined,
            });
            onCreated();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Couldn't create the claim — try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm" style={{ color: T.text }}>New HMO Claim</h4>
                <button onClick={onCancel} style={{ color: T.muted }}><X size={16} /></button>
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: T.muted }}>Patient</label>
                {!patient ? (
                    <PatientSearchPicker
                        searchPatientRequest={authApi.searchPatientRequest}
                        onSelect={(p) => setPatient({ id: p.id, name: p.name })}
                    />
                ) : (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                        <span className="text-sm font-semibold" style={{ color: T.text }}>{patient.name}</span>
                        <button onClick={() => setPatient(null)} className="text-xs font-bold" style={{ color: T.danger }}>Change</button>
                    </div>
                )}
            </div>

            {patient && (
                <div>
                    <label className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: T.muted }}>
                        Dispensed items to claim
                    </label>
                    {loadingOrders ? (
                        <div className="flex items-center gap-2 text-xs py-3" style={{ color: T.muted }}>
                            <Loader2 size={13} className="animate-spin" /> Loading dispensed orders…
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-xs py-2" style={{ color: T.muted }}>No dispensed orders found for this patient.</p>
                    ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {orders.map((o) => (
                                <label key={o.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer"
                                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                                    <input type="checkbox" checked={selectedOrderIds.includes(o.id)} onChange={() => toggleOrder(o.id)} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold truncate" style={{ color: T.text }}>{o.medicationName}</div>
                                        <div className="text-[10px]" style={{ color: T.muted }}>Qty {o.quantity} · {formatCurrency(o.price)}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: T.muted }}>
                        HMO / Insurance Provider
                    </label>
                    <HmoSearchPicker
                        value={hmoName}
                        onChange={(val) => {
                            setHmoName(val);
                            setEligibilityNotice(null);
                        }}
                        variant="dark"
                        placeholder="Search or select HMO..."
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-bold uppercase" style={{ color: T.muted }}>
                            Member ID (optional)
                        </label>
                        {hmoName && hmoMemberId && (
                            <button
                                type="button"
                                onClick={() => setEligibilityNotice({ hmo: hmoName, memberId: hmoMemberId })}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:brightness-110"
                                style={{ background: "rgba(56,189,248,0.12)", color: T.accent, border: `1px solid ${T.border}` }}
                            >
                                <ShieldCheck size={11} /> Verify Eligibility
                            </button>
                        )}
                    </div>
                    <input
                        value={hmoMemberId}
                        onChange={(e) => {
                            setHmoMemberId(e.target.value);
                            setEligibilityNotice(null);
                        }}
                        placeholder="Enter membership number"
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
                    />
                </div>
            </div>

            {eligibilityNotice && (
                <div className="rounded-xl p-3 text-xs space-y-1.5 animate-fade-in" style={{ background: "rgba(56,189,248,0.08)", border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5" style={{ color: T.accent }}>
                            <ShieldCheck size={14} /> HMO Connectivity Gateway
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(245,158,11,0.15)", color: T.warning }}>
                            Standby / In Development
                        </span>
                    </div>
                    <p style={{ color: T.text }}>
                        Automated real-time eligibility verification for <strong>{eligibilityNotice.hmo}</strong> (Member ID: <code className="text-sky-300">{eligibilityNotice.memberId}</code>) will activate upon rollout of WelliRecord's NHIA live gateway integration.
                    </p>
                    <p className="text-[11px]" style={{ color: T.muted }}>
                        You can proceed with filing this claim for facility tracking.
                    </p>
                </div>
            )}

            <div>
                <label className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: T.muted }}>Claim amount</label>
                <input value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} type="number" min={0}
                    placeholder="Auto-filled from selected items, editable"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: T.muted }}>Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    className="w-full resize-none px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
            </div>

            {error && <p className="text-xs" style={{ color: T.danger }}>{error}</p>}

            <button onClick={handleSubmit} disabled={!canSubmit}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-slate-950 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: T.accent }}>
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                File Claim
            </button>
        </div>
    );
}

function ClaimRow({ claim, onUpdated }: { claim: PharmacyClaim; onUpdated: (c: PharmacyClaim) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [claimReference, setClaimReference] = useState(claim.claimReference || "");
    const [rejectionReason, setRejectionReason] = useState("");
    const [acting, setActing] = useState<ClaimStatus | null>(null);
    const [error, setError] = useState("");

    const st = STATUS_STYLE[claim.status];
    const StIcon = st.icon;

    const act = async (status: ClaimStatus) => {
        if (status === "rejected" && !rejectionReason.trim()) {
            setError("A rejection reason is required.");
            return;
        }
        setActing(status);
        setError("");
        try {
            const updated = await pharmacyClaimsApi.updateStatus(claim._id, {
                status,
                claimReference: claimReference.trim() || undefined,
                rejectionReason: status === "rejected" ? rejectionReason.trim() : undefined,
            });
            onUpdated(updated);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Couldn't update this claim.");
        } finally {
            setActing(null);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <StIcon size={15} style={{ color: st.color, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: T.text }}>
                        {claim.patientName} · {claim.hmoName}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: T.muted }}>
                        {formatCurrency(claim.claimAmount)} · {claim.orderIds.length} item{claim.orderIds.length > 1 ? "s" : ""} · {new Date(claim.createdAt).toLocaleDateString("en-NG")}
                    </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                {expanded ? <ChevronUp size={14} style={{ color: T.muted }} /> : <ChevronDown size={14} style={{ color: T.muted }} />}
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: T.border }}>
                    <div className="pt-3 grid grid-cols-2 gap-3 text-xs" style={{ color: T.text }}>
                        {claim.hmoMemberId && (
                            <div><span style={{ color: T.muted }}>Member ID: </span>{claim.hmoMemberId}</div>
                        )}
                        <div><span style={{ color: T.muted }}>Filed by: </span>{claim.recordedByName}</div>
                        {claim.decisionAt && (
                            <div><span style={{ color: T.muted }}>Decision: </span>{new Date(claim.decisionAt).toLocaleDateString("en-NG")}</div>
                        )}
                        {claim.paidAt && (
                            <div><span style={{ color: T.muted }}>Paid: </span>{new Date(claim.paidAt).toLocaleDateString("en-NG")}</div>
                        )}
                    </div>
                    {claim.notes && (
                        <div className="text-xs" style={{ color: T.text }}><span style={{ color: T.muted }}>Notes: </span>{claim.notes}</div>
                    )}
                    {claim.rejectionReason && (
                        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#fca5a5" }}>
                            {claim.rejectionReason}
                        </div>
                    )}

                    {error && <p className="text-xs" style={{ color: T.danger }}>{error}</p>}

                    {claim.status === "submitted" && (
                        <div className="space-y-2 pt-1">
                            <input value={claimReference} onChange={(e) => setClaimReference(e.target.value)}
                                placeholder="HMO claim reference (optional)"
                                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
                            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2}
                                placeholder="Rejection reason (required only if declining)"
                                className="w-full resize-none px-3 py-2 rounded-xl text-xs outline-none"
                                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
                            <div className="flex gap-2">
                                <button onClick={() => act("approved")} disabled={!!acting}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-950 disabled:opacity-40 flex items-center justify-center gap-1.5"
                                    style={{ background: T.success }}>
                                    {acting === "approved" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Approve
                                </button>
                                <button onClick={() => act("rejected")} disabled={!!acting}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1.5"
                                    style={{ background: "rgba(239,68,68,0.15)", color: T.danger, border: "1px solid rgba(239,68,68,0.3)" }}>
                                    {acting === "rejected" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {claim.status === "approved" && (
                        <div className="space-y-2 pt-1">
                            <input value={claimReference} onChange={(e) => setClaimReference(e.target.value)}
                                placeholder="HMO claim reference (optional)"
                                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
                            <button onClick={() => act("paid")} disabled={!!acting}
                                className="w-full py-2 rounded-xl text-xs font-bold text-slate-950 disabled:opacity-40 flex items-center justify-center gap-1.5"
                                style={{ background: T.accent }}>
                                {acting === "paid" ? <Loader2 size={12} className="animate-spin" /> : <Banknote size={12} />} Mark Paid
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function PharmacyClaimsTab({ triggerToast }: { triggerToast: (msg: string) => void }) {
    const [claims, setClaims] = useState<PharmacyClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<ClaimStatus | "all">("all");
    const [showForm, setShowForm] = useState(false);

    const load = () => {
        setLoading(true);
        setError("");
        pharmacyClaimsApi
            .list(filter === "all" ? undefined : filter)
            .then(setClaims)
            .catch(() => setError("Couldn't load claims right now."))
            .finally(() => setLoading(false));
    };

    useEffect(load, [filter]);

    const totalOutstanding = useMemo(
        () => claims.filter((c) => c.status === "submitted" || c.status === "approved").reduce((s, c) => s + c.claimAmount, 0),
        [claims],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} style={{ color: T.accent }} />
                    <h3 className="font-bold text-sm" style={{ color: T.text }}>HMO Claims</h3>
                </div>
                <button onClick={() => setShowForm((s) => !s)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950"
                    style={{ background: T.accent }}>
                    {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? "Cancel" : "New Claim"}
                </button>
            </div>

            <p className="text-[11px]" style={{ color: T.muted }}>
                Internal tracking only — this records what your pharmacy submits to HMOs manually. It doesn't check eligibility
                or submit anything to an HMO's system directly.
            </p>

            {showForm && (
                <NewClaimForm
                    onCancel={() => setShowForm(false)}
                    onCreated={() => {
                        setShowForm(false);
                        triggerToast("Claim recorded.");
                        load();
                    }}
                />
            )}

            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                {FILTERS.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: filter === f.key ? T.accent : "transparent", color: filter === f.key ? "#04101f" : T.muted }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {filter === "all" && !loading && !error && (
                <div className="text-xs" style={{ color: T.muted }}>
                    Outstanding (submitted + approved, not yet paid): <span className="font-bold" style={{ color: T.text }}>{formatCurrency(totalOutstanding)}</span>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: T.muted }}>
                    <Loader2 size={16} className="animate-spin" /> Loading claims…
                </div>
            )}
            {!loading && error && <p className="text-sm py-6 text-center" style={{ color: T.danger }}>{error}</p>}
            {!loading && !error && claims.length === 0 && (
                <p className="text-sm py-10 text-center" style={{ color: T.muted }}>No claims recorded yet.</p>
            )}
            {!loading && !error && (
                <div className="space-y-2">
                    {claims.map((c) => (
                        <ClaimRow key={c._id} claim={c} onUpdated={(updated) => setClaims((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))} />
                    ))}
                </div>
            )}
        </div>
    );
}
