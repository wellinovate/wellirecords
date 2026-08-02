import { useAuth } from "@/shared/auth/AuthProvider";
import { VisionRecordSection } from "@/apps/patient/components/VisionRecordSection";

export function PatientVisionPage() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1
          className="section-header font-display mb-1 text-[28px]"
          style={{ color: "var(--pat-text)" }}
        >
          Vision record
        </h1>
        <p className="text-sm font-medium" style={{ color: "var(--pat-muted)" }}>
          Vision visits recorded by your providers.
        </p>
      </div>

      {user?.data?.account?.id ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <VisionRecordSection patientId={user.data.account.id} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">Loading...</p>
      )}
    </div>
  );
}
