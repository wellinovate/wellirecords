import { useEffect, useState } from "react";
import { getVisionRecord, type VisionRecord, type VisionVisit } from "@/shared/api/visionRecordApi";

interface VisionRecordSectionProps {
  patientId: string;
}

// Read-only. There is no edit or delete control anywhere in this
// component — every field here was provider-entered (see spec section
// 2), and the patient view has no path to change it.
export function VisionRecordSection({ patientId }: VisionRecordSectionProps) {
  const [record, setRecord] = useState<VisionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisionRecord(patientId)
      .then(setRecord)
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading vision record...</p>;
  }

  if (!record || record.visits.length === 0) {
    return <p className="text-sm text-slate-500">No vision record entries yet.</p>;
  }

  const [latest, ...history] = record.visits; // already sorted newest-first by the API

  return (
    <div className="space-y-6">
      <VisitCard visit={latest} label="Most recent" />

      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-2">Earlier visits</h3>
          <div className="space-y-3">
            {history.map((visit) => (
              <VisitCard key={visit._id} visit={visit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VisitCard({ visit, label }: { visit: VisionVisit; label?: string }) {
  return (
    <div className="border rounded-2xl p-4">
      {label && <p className="text-xs font-semibold text-teal-700 mb-1">{label}</p>}
      <div className="flex justify-between text-sm text-slate-500 mb-2">
        <span>{visit.clinicName}</span>
        <span>{new Date(visit.date).toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
        <div>
          <p className="text-xs text-slate-400">Distance acuity</p>
          <p>R: {visit.acuity?.distance?.right || "—"} · L: {visit.acuity?.distance?.left || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Near acuity</p>
          <p>R: {visit.acuity?.near?.right || "—"} · L: {visit.acuity?.near?.left || "—"}</p>
        </div>
      </div>

      {visit.diagnosis && <p className="text-sm mb-1"><span className="text-slate-400">Diagnosis:</span> {visit.diagnosis}</p>}
      {visit.treatment && <p className="text-sm mb-2"><span className="text-slate-400">Treatment:</span> {visit.treatment}</p>}

      {visit.photos && visit.photos.length > 0 && (
        <div className="flex gap-2 mt-2">
          {visit.photos.map((photo) => (
            <img key={photo.publicId} src={photo.url} alt="" className="w-16 h-16 object-cover rounded-lg" />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">
        Entered by {visit.providerName} · {visit.provenance?.clinic || visit.clinicName}
      </p>
    </div>
  );
}
