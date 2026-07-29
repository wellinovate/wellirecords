import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, ShieldCheck, Pill, Clock, Loader2 } from "lucide-react";
import { bridgeApi, type BridgeSharedRecord } from "@/shared/api/consentApi";

const CATEGORY_LABELS: Record<string, string> = {
  vitals: "Vitals",
  medications: "Medications",
  allergies: "Allergies",
  diagnoses: "Diagnoses",
  "lab-results": "Lab Results",
  procedures: "Procedures",
  immunizations: "Immunizations",
};

export default function BridgeSharePage() {
  const { token } = useParams<{ token: string }>();

  const [record, setRecord] = useState<BridgeSharedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No share link provided.");
      setLoading(false);
      return;
    }

    bridgeApi
      .getSharedRecord(token)
      .then((data) => setRecord(data))
      .catch((err) => {
        setError(
          err?.message ||
            "This link is invalid, expired, or has already been used.",
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Loading shared record...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="mb-2 text-lg font-bold text-slate-900">
            Can't Open This Link
          </h1>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Shared via WelliBridge — verified, patient-authorized access
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-slate-950">
            {record.patient?.fullName || "Patient"}
          </h1>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {record.patient?.wrId && <span>ID: {record.patient.wrId}</span>}
            {record.patient?.gender && <span>{record.patient.gender}</span>}
            {record.patient?.dateOfBirth && (
              <span>
                DOB: {new Date(record.patient.dateOfBirth).toLocaleDateString()}
              </span>
            )}
          </div>

          {record.expiresAt && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              This link expires {new Date(record.expiresAt).toLocaleString()}
              {record.oneTimeUse && " — one-time view only"}
            </div>
          )}
        </div>

        {/* Allergies first — this is the whole reason WelliBridge exists. */}
        <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-bold text-red-900">Allergies</h2>
          </div>

          {record.allergies.length === 0 ? (
            <p className="text-sm text-red-700">
              No allergies on record. Confirm directly with the patient if possible.
            </p>
          ) : (
            <ul className="space-y-2">
              {record.allergies.map((allergy: any) => (
                <li
                  key={allergy._id}
                  className="rounded-xl border border-red-200 bg-white p-3"
                >
                  <p className="font-bold text-slate-900">
                    {allergy.substance || allergy.allergen || "Unnamed allergen"}
                  </p>
                  {allergy.reaction && (
                    <p className="text-sm text-slate-600">
                      Reaction: {allergy.reaction}
                    </p>
                  )}
                  {allergy.severity && (
                    <p className="text-sm text-slate-600">
                      Severity: {allergy.severity}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Current Medications
            </h2>
          </div>

          {record.medications.length === 0 ? (
            <p className="text-sm text-slate-500">
              No current medications on record.
            </p>
          ) : (
            <ul className="space-y-2">
              {record.medications.map((med: any) => (
                <li
                  key={med._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="font-bold text-slate-900">
                    {med.medicationName || "Unnamed medication"}
                  </p>
                  {(med.dosage?.value || med.dosage?.unit) && (
                    <p className="text-sm text-slate-600">
                      {med.dosage?.value} {med.dosage?.unit}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {record.category && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Scope: {CATEGORY_LABELS[record.category] || record.category}
          </p>
        )}
      </div>
    </div>
  );
}
