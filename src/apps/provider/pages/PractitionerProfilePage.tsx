import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Repeat } from "lucide-react";
import { Practitioner, practitionerApi } from "@/shared/api/practitionerApi";
import { PractitionerForm } from "@/shared/ui/PractitionerForm";

export function PractitionerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ isPractitioner: boolean; profile: Practitioner | null; inPracticeView: boolean } | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    practitionerApi.me().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" /></div>;
  if (!data?.profile) return <p className="p-4 text-sm text-[#9FB3CF]">{error || "This account is not a practitioner account."}</p>;

  const p = data.profile;
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-2 md:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{p.practiceName}</h1>
          <p className="text-sm text-[#9FB3CF]">Licence review: {p.verificationStatus.replace(/_/g, " ")}</p>
          {p.verificationNote && <p className="mt-1 text-xs text-amber-300">{p.verificationNote}</p>}
        </div>
        {data.inPracticeView && (
          <button
            onClick={() => practitionerApi.switchTo("patient").catch((e) => setError(e.message))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#163761] bg-[#081b35] px-3.5 py-2 text-xs font-semibold text-white"
          >
            <Repeat size={13} /> Switch to patient view
          </button>
        )}
      </div>
      {["not_submitted", "rejected"].includes(p.verificationStatus) && (
        <Link to="/auth/provider/verify-org" className="inline-block rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950">Upload your licence</Link>
      )}
      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
      {notice && <p className="text-sm font-semibold text-emerald-400">{notice}</p>}
      <div className="rounded-2xl bg-white p-5">
        <PractitionerForm
          initial={p}
          submitLabel="Save changes"
          onSubmit={async (v) => {
            const r = await practitionerApi.update(v);
            setData({ ...data, profile: r.profile });
            setNotice(r.reverify ? "Saved. Your licence details changed, so they are checked again." : "Saved.");
          }}
        />
      </div>
    </div>
  );
}
