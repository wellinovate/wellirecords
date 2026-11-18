import { useEffect, useState } from "react";
import { listCriticalAlerts, acknowledgeCriticalAlert, type CriticalAlert } from "@/shared/api/labOrdersApi";

const SMS_TEXT: Record<string, string> = {
  sent: "Text sent to the requesting doctor",
  failed: "Text to the doctor failed. Phone them.",
  no_phone: "No doctor phone on the order. Phone them.",
  not_attempted: "No text sent",
};

const inputCls = "bg-[#081220] border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none";

export function CriticalAlertsPanel({ refreshKey }: { refreshKey?: number }) {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ notifiedTo: "", method: "phone", note: "" });
  const [error, setError] = useState("");

  const load = () => listCriticalAlerts("open").then(setAlerts).catch(() => setAlerts([]));
  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [refreshKey]);

  if (!alerts.length) return null;

  const submit = async (id: string) => {
    setError("");
    try {
      await acknowledgeCriticalAlert(id, form);
      setOpenId(null);
      setForm({ notifiedTo: "", method: "phone", note: "" });
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not save.");
    }
  };

  return (
    <div role="region" aria-label="Critical results" className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 space-y-3">
      <h3 className="text-sm font-bold text-rose-300">Critical results waiting for a call ({alerts.length})</h3>
      {alerts.map((a) => (
        <div key={a._id} className="rounded-xl border border-rose-500/30 bg-[#0c192b] p-3 text-xs space-y-1.5">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-white font-semibold">{a.patientName || "Patient"} · {a.testName}</span>
            <span className="text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-rose-200">
            {a.values.map((v) => `${v.name} ${v.value}${v.unit ? " " + v.unit : ""}`).join("; ")}
          </div>
          <div className="text-slate-400">
            {a.doctorName ? `Requested by ${a.doctorName}. ` : ""}{SMS_TEXT[a.sms]}
            {a.smsError ? ` (${a.smsError})` : ""}
          </div>
          {openId === a._id ? (
            <div className="flex flex-wrap gap-2 items-center pt-1">
              <input className={inputCls} placeholder="Who was told" value={form.notifiedTo} onChange={(e) => setForm({ ...form, notifiedTo: e.target.value })} />
              <select className={inputCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="phone">Phone call</option>
                <option value="sms">Text message</option>
                <option value="in_person">In person</option>
                <option value="other">Other</option>
              </select>
              <input className={`${inputCls} flex-1 min-w-[10rem]`} placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              <button type="button" onClick={() => submit(a._id)} className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold">Save</button>
              <button type="button" onClick={() => setOpenId(null)} className="text-slate-400 hover:text-white">Cancel</button>
              {error && <span className="text-rose-300 w-full">{error}</span>}
            </div>
          ) : (
            <button type="button" onClick={() => setOpenId(a._id)} className="px-3 py-1.5 rounded-lg border border-rose-400/50 text-rose-200 font-semibold hover:bg-rose-500/20">
              Record that someone was told
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
