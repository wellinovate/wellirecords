import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { FieldErrors, Practitioner, PractitionerInput, practitionerApi } from "@/shared/api/practitionerApi";

const LABELS: Record<string, string> = {
  doctor: "Doctor", dentist: "Dentist", nurse: "Nurse", midwife: "Midwife", pharmacist: "Pharmacist",
  lab_scientist: "Medical laboratory scientist", radiographer: "Radiographer", physiotherapist: "Physiotherapist",
  optometrist: "Optometrist", other: "Other licensed practitioner",
};

type Props = { initial?: Practitioner | null; submitLabel: string; onSubmit: (v: PractitionerInput) => Promise<void> };

export function PractitionerForm({ initial, submitLabel, onSubmit }: Props) {
  const [professions, setProfessions] = useState<string[]>([]);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [v, setV] = useState({
    profession: initial?.profession || "", licenseNumber: initial?.licenseNumber || "", licenseBody: initial?.licenseBody || "",
    practiceName: initial?.practiceName || "", specialty: initial?.specialty || "", officeAddress: initial?.officeAddress || "",
    contactPhone: initial?.contactPhone || "", yearsExperience: initial?.yearsExperience != null ? String(initial.yearsExperience) : "", bio: initial?.bio || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    practitionerApi.options().then((o) => { setProfessions(o.professions); setHints(o.licenseBodyHints || {}); }).catch(() => {});
  }, []);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const hint = hints[v.profession];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setMessage("");
    try {
      await onSubmit({
        profession: v.profession, licenseNumber: v.licenseNumber, licenseBody: v.licenseBody,
        practiceName: v.practiceName, specialty: v.specialty, officeAddress: v.officeAddress, contactPhone: v.contactPhone,
        yearsExperience: v.yearsExperience === "" ? null : Number(v.yearsExperience), bio: v.bio,
      });
    } catch (err) {
      if (err instanceof FieldErrors) setErrors(err.errors);
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  };

  const input = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const field = (label: string, key: keyof typeof v, el: React.ReactNode, note?: string) => (
    <label className="block space-y-1">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      {el}
      {note && <span className="block text-[11px] text-slate-500">{note}</span>}
      {errors[key] && <span className="block text-[11px] font-semibold text-red-600">{errors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      {field("Profession", "profession", (
        <select value={v.profession} onChange={set("profession")} className={input} required>
          <option value="">Choose one</option>
          {professions.map((p) => <option key={p} value={p}>{LABELS[p] || p}</option>)}
        </select>
      ))}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Licence number", "licenseNumber", <input value={v.licenseNumber} onChange={set("licenseNumber")} className={input} required />)}
        {field("Licensing body", "licenseBody", <input value={v.licenseBody} onChange={set("licenseBody")} className={input} required />, hint ? `For example: ${hint}` : undefined)}
      </div>
      {field("Practice name", "practiceName", <input value={v.practiceName} onChange={set("practiceName")} className={input} />, "Optional. Patients see your name if you leave this empty.")}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Specialty", "specialty", <input value={v.specialty} onChange={set("specialty")} className={input} />)}
        {field("Years in practice", "yearsExperience", <input type="number" min={0} max={70} value={v.yearsExperience} onChange={set("yearsExperience")} className={input} />)}
      </div>
      {field("Practice address", "officeAddress", <input value={v.officeAddress} onChange={set("officeAddress")} className={input} />, "Used to show you to patients nearby.")}
      {field("Contact phone", "contactPhone", <input value={v.contactPhone} onChange={set("contactPhone")} className={input} />)}
      {field("About you", "bio", <textarea rows={3} maxLength={1000} value={v.bio} onChange={set("bio")} className={input} />)}
      {message && <p className="text-xs font-semibold text-red-600">{message}</p>}
      <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
        {busy && <Loader2 size={14} className="animate-spin" />} {submitLabel}
      </button>
    </form>
  );
}
