import React, { useEffect, useState } from "react";
import { Loader2, Stethoscope } from "lucide-react";
import { Practitioner, practitionerApi } from "@/shared/api/practitionerApi";
import { PractitionerForm } from "@/shared/ui/PractitionerForm";

export function BecomeProviderPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Practitioner | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    practitionerApi.me().then((r) => setProfile(r.profile)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const open = async () => {
    setBusy(true);
    try { await practitionerApi.switchTo("provider"); } catch (e) { setError((e as Error).message); setBusy(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-2 md:p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Stethoscope size={22} /></div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Work as a provider</h1>
          <p className="text-sm text-slate-600">Keep your own patient account. Add a provider profile for your practice. Switch between them without signing in again.</p>
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {profile ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">{profile.practiceName}</p>
          <p className="text-xs text-slate-600">Licence review: {profile.verificationStatus.replace(/_/g, " ")}</p>
          <button onClick={open} disabled={busy} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Open provider workspace</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <PractitionerForm
            submitLabel="Create provider profile"
            onSubmit={async (v) => { setProfile(await practitionerApi.become(v)); }}
          />
          <p className="mt-4 text-[11px] text-slate-500">You upload your licence next. Patients can book you after an admin approves it.</p>
        </div>
      )}
    </div>
  );
}
