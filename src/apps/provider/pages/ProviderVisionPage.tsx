import React, { useEffect, useState } from "react";
import { Eye, Glasses } from "lucide-react";
import { getAllPatientVision, VisionVisitListItem } from "@/shared/api/visionRecordApi";

export function ProviderVisionPage() {
  const [visits, setVisits] = useState<VisionVisitListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadVision = async (targetPage: number) => {
    try {
      setLoading(true);
      setError("");
      const result = await getAllPatientVision(targetPage, 10);
      setVisits(result.items || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Failed to load vision records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVision(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="animate-fade-in px-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-header font-display" style={{ color: "#e2eaf4" }}>
            Vision
          </h1>
          <p className="text-sm" style={{ color: "#7ba3c8" }}>
            Vision visits recorded across your facility's patients
          </p>
        </div>
      </div>

      {loading && (
        <div className="card-provider p-8 text-center">
          <p className="text-sm" style={{ color: "#7ba3c8" }}>Loading vision records…</p>
        </div>
      )}

      {!loading && error && (
        <div className="card-provider p-8 text-center">
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {visits.map((visit) => (
            <div key={visit.id} className="card-provider p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(56,189,248,.1)" }}
                  >
                    <Glasses size={18} style={{ color: "#38bdf8" }} />
                  </div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: "#e2eaf4" }}>
                      {visit.clinicName}
                    </div>
                    <div className="text-sm" style={{ color: "#38bdf8" }}>
                      {visit.diagnosis || "No diagnosis recorded"}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#7ba3c8" }}>
                      Patient ID: {visit.patientId}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#7ba3c8" }}>
                      Provider: {visit.providerName} · Date:{" "}
                      {new Date(visit.date).toLocaleDateString()}
                    </div>
                    {visit.treatment && (
                      <p className="text-xs italic mt-1" style={{ color: "#3e5a78" }}>
                        {visit.treatment}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(56,189,248,.1)",
                      color: "#38bdf8",
                      border: "1px solid rgba(56,189,248,.2)",
                    }}
                  >
                    <Eye size={10} />
                    {visit.colorVision === "not_tested" ? "Not tested" : visit.colorVision}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {visits.length === 0 && (
            <div className="card-provider p-8 text-center">
              <p className="text-sm" style={{ color: "#7ba3c8" }}>
                No vision records found
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                className="btn btn-sm"
                style={{ background: "rgba(56,189,248,.1)", color: "#38bdf8" }}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-xs" style={{ color: "#7ba3c8" }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm"
                style={{ background: "rgba(56,189,248,.1)", color: "#38bdf8" }}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
