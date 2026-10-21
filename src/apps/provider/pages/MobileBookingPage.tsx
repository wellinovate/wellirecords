import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Loader2, Video } from "lucide-react";
import { mobileBookingApi, Service, ServiceView, Visit } from "@/shared/api/mobileBookingApi";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const card = "rounded-2xl border border-[#163761] bg-[#081b35]/60 p-5";
const input = "w-full rounded-lg border border-[#163761] bg-[#071830] px-3 py-2 text-sm text-white";
const btn = "rounded-xl px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50";
const naira = (minor?: number) => (typeof minor === "number" ? String(minor / 100) : "");
const toMinor = (v: string) => (v.trim() === "" ? undefined : Math.round(Number(v) * 100));
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }) : "");
const STATUS: Record<string, string> = { requested: "Waiting for you", awaiting_payment: "Waiting for payment", awaiting_hmo: "Waiting for HMO decision", confirmed: "Confirmed" };

type Hours = Record<number, { on: boolean; start: string; end: string }>;
const hoursFrom = (svc: Service): Hours => {
  const h: Hours = {};
  for (let d = 0; d < 7; d++) h[d] = { on: false, start: "09:00", end: "17:00" };
  (svc?.weekly || []).forEach((w) => (h[w.day] = { on: true, start: w.start, end: w.end }));
  return h;
};

function Settings({ view, reload }: { view: ServiceView; reload: () => void }) {
  const svc = view.service;
  const can = view.canManage;
  const [f, setF] = useState({
    active: svc?.active ?? false,
    offersInPerson: svc?.offersInPerson ?? true,
    offersVirtual: svc?.offersVirtual ?? false,
    feeIn: naira(svc?.feeInPersonMinor),
    feeVr: naira(svc?.feeVirtualMinor),
    slot: String(svc?.slotMinutes ?? 30),
    payAtVisit: svc?.payAtVisit ?? true,
    onlinePayment: svc?.onlinePayment ?? false,
    hmos: (svc?.acceptsHmo || []).join(", "),
  });
  const [hours, setHours] = useState<Hours>(hoursFrom(svc));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await mobileBookingApi.saveService({
        active: f.active,
        offersInPerson: f.offersInPerson,
        offersVirtual: f.offersVirtual,
        feeInPersonMinor: toMinor(f.feeIn),
        feeVirtualMinor: toMinor(f.feeVr),
        slotMinutes: Number(f.slot),
        payAtVisit: f.payAtVisit,
        onlinePayment: f.onlinePayment && Boolean(svc?.payoutReady),
        acceptsHmo: f.hmos.split(",").map((x) => x.trim()).filter(Boolean),
        weekly: DAYS.map((_, d) => ({ d, ...hours[d] })).filter((x) => x.on).map((x) => ({ day: x.d, start: x.start, end: x.end })),
      });
      setMsg({ ok: true, text: "Saved. Patients in the app see this now." });
      reload();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${card} space-y-4`}>
      <div>
        <h2 className="text-lg font-bold text-white">Booking in the WelliRecord app</h2>
        <p className="text-xs text-[#9FB3CF]">Shown to patients as {view.organization.name}. {can ? "Fees are in naira." : "Only the organization owner can change these."}</p>
      </div>
      <fieldset disabled={!can || busy} className="space-y-4">
        <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Accept bookings in the app</label>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={f.offersInPerson} onChange={(e) => set("offersInPerson", e.target.checked)} /> In-person visits</label>
            <input className={input} inputMode="decimal" placeholder="Fee in naira" value={f.feeIn} onChange={(e) => set("feeIn", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={f.offersVirtual} onChange={(e) => set("offersVirtual", e.target.checked)} /> Video visits</label>
            <input className={input} inputMode="decimal" placeholder="Fee in naira" value={f.feeVr} onChange={(e) => set("feeVr", e.target.value)} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-white">Weekly hours (Lagos time)</p>
          <div className="space-y-1.5">
            {DAYS.map((name, d) => (
              <div key={d} className="flex flex-wrap items-center gap-2 text-sm text-white">
                <label className="flex w-32 items-center gap-2"><input type="checkbox" checked={hours[d].on} onChange={(e) => setHours((h) => ({ ...h, [d]: { ...h[d], on: e.target.checked } }))} />{name}</label>
                <input type="time" className={`${input} !w-auto`} value={hours[d].start} disabled={!hours[d].on} onChange={(e) => setHours((h) => ({ ...h, [d]: { ...h[d], start: e.target.value } }))} />
                <span className="text-[#9FB3CF]">to</span>
                <input type="time" className={`${input} !w-auto`} value={hours[d].end} disabled={!hours[d].on} onChange={(e) => setHours((h) => ({ ...h, [d]: { ...h[d], end: e.target.value } }))} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-[#9FB3CF]">Visit length (minutes)</label>
            <input className={input} inputMode="numeric" value={f.slot} onChange={(e) => set("slot", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#9FB3CF]">HMOs you accept (comma separated)</label>
            <input className={input} value={f.hmos} onChange={(e) => set("hmos", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1 text-sm text-white">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.payAtVisit} onChange={(e) => set("payAtVisit", e.target.checked)} /> Allow pay at the visit</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.onlinePayment && Boolean(svc?.payoutReady)} disabled={!svc?.payoutReady} onChange={(e) => set("onlinePayment", e.target.checked)} /> Allow online payment</label>
          {!svc?.payoutReady && <p className="text-xs text-amber-300">Online payment needs a payout account. Contact WelliRecord support to set it up. Until then patients pay at the visit or with an HMO.</p>}
        </div>
      </fieldset>
      {msg && <p className={`text-xs ${msg.ok ? "text-emerald-300" : "text-red-300"}`}>{msg.text}</p>}
      {can && <button onClick={save} disabled={busy} className={`${btn} bg-sky-500 text-white hover:bg-sky-400`}>{busy ? "Saving…" : "Save"}</button>}
    </div>
  );
}

function VisitRow({ v, canManage, reload }: { v: Visit; canManage: boolean; reload: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr("");
    try {
      await fn();
      reload();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="rounded-xl border border-[#163761] bg-[#071830]/80 p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{v.patientName} · {v.visitType === "video" ? "Video" : "In person"}</p>
          <p className="text-xs text-[#9FB3CF]">{when(v.startsAt)}{v.bookingRef ? ` · Ref ${v.bookingRef}` : ""}</p>
        </div>
        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] text-sky-300">{STATUS[v.status] || v.status}</span>
      </div>
      {v.reason && <p className="text-xs text-[#9FB3CF]">Reason: {v.reason}</p>}
      {v.hmo?.policyLabel && <p className="text-xs text-[#9FB3CF]">HMO: {v.hmo.policyLabel}{v.hmo.preAuthId ? ` · pre-auth ${v.hmo.preAuthId}` : ""}</p>}
      {typeof v.feeMinor === "number" && <p className="text-xs text-[#9FB3CF]">Fee ₦{(v.feeMinor / 100).toLocaleString("en-NG")} · {v.paymentStatus || v.paymentMethod || ""}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        {v.visitType === "video" && v.status === "confirmed" &&
          (v.canJoin ? (
            <Link to={`/provider/app-bookings/visit/${v.id}`} className={`${btn} inline-flex items-center gap-1.5 bg-emerald-500 text-white`}><Video size={14} />Join video</Link>
          ) : (
            <span className="text-xs text-[#9FB3CF]">{v.joinMessage}</span>
          ))}
        {v.status === "requested" && <button disabled={busy} onClick={() => run(() => mobileBookingApi.act(v.id, "confirm"))} className={`${btn} bg-sky-500 text-white`}>Confirm</button>}
        {v.status === "awaiting_hmo" && canManage && (
          <>
            <button disabled={busy} onClick={() => run(() => mobileBookingApi.hmo(v.id, "approve", window.prompt("HMO approval code (optional)") || ""))} className={`${btn} bg-emerald-500 text-white`}>Approve HMO</button>
            <button disabled={busy} onClick={() => run(() => mobileBookingApi.hmo(v.id, "decline"))} className={`${btn} border border-red-400/40 text-red-300`}>Decline HMO</button>
          </>
        )}
        {["requested", "confirmed", "awaiting_hmo", "awaiting_payment"].includes(v.status) && (
          <button disabled={busy} onClick={() => window.confirm("Cancel this visit? The patient is told.") && run(() => mobileBookingApi.act(v.id, "cancel"))} className={`${btn} border border-[#163761] text-[#9FB3CF]`}>Cancel visit</button>
        )}
      </div>
      {err && <p className="text-xs text-red-300">{err}</p>}
    </div>
  );
}

export function MobileBookingPage() {
  const [view, setView] = useState<ServiceView | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [tab, setTab] = useState<"visits" | "settings">("visits");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const v = await mobileBookingApi.service();
      setView(v);
      setError("");
      if (v.service) setVisits(await mobileBookingApi.visits());
      else setTab("settings");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const upcoming = useMemo(() => visits, [visits]);

  return (
    <div className="animate-fade-in space-y-5 p-2 md:p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-white"><CalendarClock size={20} /><h1 className="text-2xl font-extrabold">App bookings</h1></div>
      <p className="text-sm text-[#9FB3CF]">Patients book you in the WelliRecord app. Set your fees and hours, confirm requests and join video visits here.</p>
      {loading && <p className="flex items-center gap-2 text-sm text-[#9FB3CF]"><Loader2 className="animate-spin" size={16} />Loading…</p>}
      {error && <div className={`${card} text-sm text-red-300`}>{error}</div>}
      {view && (
        <>
          <div className="flex gap-2">
            {(["visits", "settings"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`${btn} ${tab === t ? "bg-sky-500 text-white" : "border border-[#163761] text-[#9FB3CF]"}`}>{t === "visits" ? "Visits" : "Settings"}</button>
            ))}
          </div>
          {tab === "settings" ? (
            <Settings view={view} reload={load} />
          ) : upcoming.length ? (
            <div className="space-y-3">{upcoming.map((v) => <VisitRow key={v.id} v={v} canManage={view.canManage} reload={load} />)}</div>
          ) : (
            <div className={`${card} text-sm text-[#9FB3CF]`}>No upcoming visits. {view.service?.active ? "" : "Turn on bookings in Settings so patients can find you."}</div>
          )}
        </>
      )}
    </div>
  );
}
