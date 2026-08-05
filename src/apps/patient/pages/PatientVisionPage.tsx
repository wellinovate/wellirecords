import React, { useEffect, useState } from "react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { VisionRecordSection } from "@/apps/patient/components/VisionRecordSection";
import {
  getVisionRecord,
  type VisionRecord,
  type VisionVisit,
} from "@/shared/api/visionRecordApi";
import {
  Eye,
  Glasses,
  Calendar,
  ChevronRight,
  FileText,
  ImageIcon,
  Shield,
  CheckCircle,
  Download,
  QrCode,
  Share2,
  UploadCloud,
  Building2,
  Activity,
  Sparkles,
  Maximize2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Theme Colors ─────────────────────────────────────────────────────────────

const PAT = {
  primary: "var(--pat-primary, #0d9488)",
  text: "var(--pat-text, #1e293b)",
  muted: "var(--pat-muted, #64748b)",
  surface: "var(--pat-surface, #fff)",
  surface2: "var(--pat-surface2, #f1f5f9)",
  border: "var(--pat-border, #e2e8f0)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, suffix = "") {
  if (val == null) return "—";
  return `${val > 0 ? "+" : ""}${val}${suffix}`;
}

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// Every vision record entry comes from a provider, not the patient
// themselves (see VisionRecordSection — read-only, no edit/delete
// path). So "verified" here just means "a provider actually entered
// this" vs. "nothing on file yet" — not a separate confirmation step.
function StatusTag({ verified }: { verified: boolean }) {
  return (
    <span
      className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      style={
        verified
          ? { background: "rgba(34,197,94,0.15)", color: "#15803d" }
          : { background: "rgba(100,116,139,0.12)", color: "#64748b" }
      }
    >
      {verified ? <CheckCircle size={9} /> : null}
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function AcuityCell({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: PAT.surface2 }}>
      <p className="text-[10px] font-semibold uppercase" style={{ color: PAT.muted }}>{label}</p>
      <p className="text-xl font-bold font-mono mt-1" style={{ color: PAT.text }}>{value || "—"}</p>
    </div>
  );
}

function PrescriptionTable({ visit }: { visit: VisionVisit }) {
  const rRx = visit.lensPrescription?.right;
  const lRx = visit.lensPrescription?.left;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr style={{ background: PAT.surface2 }}>
            <th className="px-3 py-2 text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>Eye</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>SPH</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>CYL</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>AXIS</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase" style={{ color: PAT.muted }}>ADD</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t" style={{ borderColor: PAT.border }}>
            <td className="px-3 py-2.5 font-bold text-xs" style={{ color: PAT.primary }}>R (OD)</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{fmt(rRx?.sphere, "D")}</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{fmt(rRx?.cylinder, "D")}</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{rRx?.axis != null ? `${rRx.axis}°` : "—"}</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{fmt(rRx?.add, "D")}</td>
          </tr>
          <tr className="border-t" style={{ borderColor: PAT.border }}>
            <td className="px-3 py-2.5 font-bold text-xs" style={{ color: PAT.primary }}>L (OS)</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{fmt(lRx?.sphere, "D")}</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{fmt(lRx?.cylinder, "D")}</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{lRx?.axis != null ? `${lRx.axis}°` : "—"}</td>
            <td className="px-3 py-2.5 text-center font-mono font-semibold">{fmt(lRx?.add, "D")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div
      className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
      style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(13,148,136,0.1)" }}>
        <Icon size={28} style={{ color: PAT.primary }} />
      </div>
      <p className="text-base font-semibold" style={{ color: PAT.text }}>{title}</p>
      <p className="text-sm max-w-[340px]" style={{ color: PAT.muted }}>{body}</p>
    </div>
  );
}

// ─── Quick Actions Config ──────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Calendar, label: "Book Appointment", route: "/patient/find-care", color: "#0d9488" },
  { icon: UploadCloud, label: "Upload Eye Report", route: "/patient/vault", color: "#ea580c" },
  { icon: Shield, label: "Emergency Access", route: "/patient/emergency-card", color: "#dc2626" },
  { icon: Glasses, label: "My Prescriptions", tab: "prescriptions", color: "#059669" },
  { icon: Building2, label: "Connect Provider", action: "soon", color: "#2563eb" },
  { icon: QrCode, label: "Scan QR", action: "soon", color: "#7c3aed" },
  { icon: Share2, label: "Share Record", action: "soon", color: "#0891b2" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function PatientVisionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.sub;

  const [record, setRecord] = useState<VisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ url: string; caption: string; date: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (!patientId) return;
    getVisionRecord(patientId)
      .then((r) => {
        setRecord(r);
        if (r?.visits?.length) setSelectedVisitId(r.visits[0]._id);
      })
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  const firstName = user?.fullName?.split(" ")[0] || "Patient";
  const visits = record?.visits ?? [];
  const latestVisit: VisionVisit | undefined =
    visits.find((v) => v._id === selectedVisitId) ?? visits[0];
  const lastExam = visits[0] ? formatDateShort(visits[0].date) : "No visits yet";
  const providersSeen = new Set(visits.map((v) => v.clinicName)).size;
  const hasPrescription =
    !!latestVisit?.lensPrescription &&
    (Object.values(latestVisit.lensPrescription.right ?? {}).some((v) => v != null) ||
      Object.values(latestVisit.lensPrescription.left ?? {}).some((v) => v != null));
  const allPhotos = visits.flatMap((v) =>
    (v.photos ?? []).map((p) => ({ ...p, date: v.date, clinic: v.clinicName })),
  );
  const conditions = latestVisit?.diagnosis
    ? latestVisit.diagnosis.split(/[,·]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-xl animate-fade-in">
          <CheckCircle size={16} className="text-teal-400" />
          {toastMsg}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-7 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #09203f 0%, #1e425e 60%, #29577a 100%)",
          boxShadow: "0 10px 30px rgba(9,32,63,0.15)",
        }}
      >
        <Eye size={260} className="absolute -right-10 -bottom-16 opacity-5 text-teal-300 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 text-teal-300 text-sm font-medium">
            <Eye size={18} />
            <span>{getGreeting()}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-sm mt-1 text-slate-300 max-w-xl">
            Your vision visits, prescriptions, and imaging — recorded by your eye care providers.
          </p>
        </div>

        {/* KPIs — every value here comes from real visit data */}
        <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-4 relative z-10">
          {[
            { label: "Total Visits", val: String(visits.length), hint: visits.length ? "On file" : "None yet", color: "#14b8a6", icon: FileText },
            { label: "Last Exam", val: lastExam, hint: visits[0]?.clinicName || "—", color: "#38bdf8", icon: Calendar },
            { label: "Prescription", val: hasPrescription ? "On file" : "None on file", hint: hasPrescription ? "Latest visit" : "—", color: "#a855f7", icon: Glasses },
            { label: "Providers Seen", val: String(providersSeen), hint: providersSeen === 1 ? "Clinic" : "Clinics", color: "#f59e0b", icon: Building2 },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-3 flex flex-col justify-between"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{item.label}</span>
                <item.icon size={13} style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-base font-bold text-white">{item.val}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-4" style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: PAT.muted }}>
          <Sparkles size={12} style={{ color: PAT.primary }} /> Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, route, action, tab, color }) => (
            <button
              key={label}
              onClick={() => {
                if (route) navigate(route);
                else if (tab) setActiveTab(tab);
                else if (action === "soon") showToast(`${label} — coming soon`);
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:-translate-y-0.5 group text-center"
              style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}15` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-[11px] font-semibold leading-tight" style={{ color: PAT.text }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {[
          { id: "overview", label: "Overview & Conditions", icon: Eye },
          { id: "prescriptions", label: "My Prescriptions", icon: Glasses },
          { id: "imaging", label: "Vision Imaging", icon: ImageIcon },
          { id: "records", label: "All Visit Records", icon: FileText },
        ].map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
              style={
                active
                  ? { background: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)", color: "white", boxShadow: "0 4px 14px rgba(13,148,136,0.25)" }
                  : { background: PAT.surface, border: `1px solid ${PAT.border}`, color: PAT.muted }
              }
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "#0d9488", borderTopColor: "transparent" }} />
          <span className="text-sm" style={{ color: PAT.muted }}>Loading your vision record...</span>
        </div>
      ) : (
        <>
          {/* ── TAB: Overview & Conditions ────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {visits.length === 0 ? (
                <EmptyState
                  icon={Eye}
                  title="No vision visits yet"
                  body="Your vision visits recorded by your eye care providers will appear here after your first consultation."
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual Acuity */}
                    <div className="rounded-2xl p-5" style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: PAT.muted }}>
                          <Eye size={14} style={{ color: PAT.primary }} /> Visual Acuity — {formatDateShort(latestVisit!.date)}
                        </p>
                        <StatusTag verified />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <AcuityCell label="Distance (Right)" value={latestVisit?.acuity?.distance?.right} />
                        <AcuityCell label="Distance (Left)" value={latestVisit?.acuity?.distance?.left} />
                        <AcuityCell label="Near (Right)" value={latestVisit?.acuity?.near?.right} />
                        <AcuityCell label="Near (Left)" value={latestVisit?.acuity?.near?.left} />
                      </div>
                    </div>

                    {/* Conditions — derived from provider's diagnosis text */}
                    <div className="rounded-2xl p-5" style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: PAT.muted }}>
                        <Activity size={14} style={{ color: "#ea580c" }} /> Latest Diagnosis Notes
                      </p>
                      {conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {conditions.map((c) => (
                            <span
                              key={c}
                              className="px-3 py-1.5 rounded-full text-xs font-medium"
                              style={{ background: PAT.surface2, color: PAT.text, border: `1px solid ${PAT.border}` }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: PAT.muted }}>No diagnosis notes on file for this visit.</p>
                      )}
                    </div>
                  </div>

                  {/* Prescription */}
                  <div className="rounded-2xl p-5" style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: PAT.muted }}>
                        <Glasses size={14} style={{ color: PAT.primary }} /> Spectacle Prescription
                      </p>
                      <div className="flex items-center gap-2">
                        <StatusTag verified={hasPrescription} />
                        <button
                          onClick={() => setActiveTab("prescriptions")}
                          className="text-xs font-semibold flex items-center gap-1"
                          style={{ color: PAT.primary }}
                        >
                          Full History <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                    {hasPrescription ? (
                      <PrescriptionTable visit={latestVisit!} />
                    ) : (
                      <p className="text-xs" style={{ color: PAT.muted }}>No prescription on file for this visit.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB: Prescriptions ────────────────────────────────────────── */}
          {activeTab === "prescriptions" && (
            <div className="space-y-6">
              <div className="rounded-2xl p-5" style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: PAT.text }}>Prescription History</h3>
                    <p className="text-xs mt-0.5" style={{ color: PAT.muted }}>Lens specs recorded by your providers, most recent first</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showToast("PDF download — coming soon")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: PAT.surface2, border: `1px solid ${PAT.border}`, color: PAT.text }}
                    >
                      <Download size={13} /> Download PDF
                    </button>
                    <button
                      onClick={() => showToast("QR verification — coming soon")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: PAT.surface2, border: `1px solid ${PAT.border}`, color: PAT.text }}
                    >
                      <QrCode size={13} /> QR Verification
                    </button>
                  </div>
                </div>

                {visits.filter((v) => v.lensPrescription).length === 0 ? (
                  <p className="text-xs" style={{ color: PAT.muted }}>No prescriptions on file yet.</p>
                ) : (
                  <div className="space-y-3">
                    {visits.map((v) => {
                      const has =
                        Object.values(v.lensPrescription?.right ?? {}).some((x) => x != null) ||
                        Object.values(v.lensPrescription?.left ?? {}).some((x) => x != null);
                      if (!has) return null;
                      return (
                        <div key={v._id} className="rounded-xl p-4" style={{ background: PAT.surface2, border: `1px solid ${PAT.border}` }}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-bold" style={{ color: PAT.text }}>{v.clinicName}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: PAT.muted }}>
                                {formatDateShort(v.date)} · {v.providerName}
                              </p>
                            </div>
                            <StatusTag verified />
                          </div>
                          <PrescriptionTable visit={v} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-5" style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}>
                <p className="text-sm font-semibold mb-1" style={{ color: PAT.text }}>Glasses & contact lens history</p>
                <p className="text-xs" style={{ color: PAT.muted }}>
                  Not tracked separately yet — coming soon. Spectacle prescriptions from each visit are shown above.
                </p>
              </div>
            </div>
          )}

          {/* ── TAB: Imaging ──────────────────────────────────────────────── */}
          {activeTab === "imaging" && (
            <div className="space-y-6">
              <div className="rounded-2xl p-5" style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}>
                <h3 className="text-base font-bold mb-1" style={{ color: PAT.text }}>Vision Imaging</h3>
                <p className="text-xs" style={{ color: PAT.muted }}>Photos attached to your vision visits by providers</p>
              </div>

              {allPhotos.length === 0 ? (
                <EmptyState
                  icon={ImageIcon}
                  title="No vision imaging on file"
                  body="Photos attached during your eye examinations will appear here."
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImg({ url: photo.url, caption: photo.caption || "Vision Photo", date: formatDateShort(photo.date) })}
                      className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-md"
                      style={{ background: PAT.surface, border: `1px solid ${PAT.border}` }}
                    >
                      <div className="aspect-square bg-slate-900 overflow-hidden relative">
                        <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold truncate" style={{ color: PAT.text }}>{photo.caption || "Eye Photo"}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: PAT.muted }}>{photo.clinic} · {formatDateShort(photo.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lightbox */}
              {lightboxImg && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in"
                  onClick={() => setLightboxImg(null)}
                >
                  <div className="relative max-w-4xl w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setLightboxImg(null)} className="absolute top-0 right-0 p-2 rounded-full bg-white/10 text-white">
                      <X size={20} />
                    </button>
                    <img src={lightboxImg.url} alt="" className="max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
                    <div className="text-center text-white">
                      <p className="text-base font-bold">{lightboxImg.caption}</p>
                      <p className="text-xs text-slate-400">{lightboxImg.date}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Visit Records ────────────────────────────────────────── */}
          {activeTab === "records" && (
            <div>
              {patientId ? (
                <VisionRecordSection patientId={patientId} />
              ) : (
                <p className="text-sm" style={{ color: PAT.muted }}>Loading visit records...</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
