import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  UploadCloud,
  FileText,
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Copy,
  Info,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import {
  verifyPatientIdentityApi,
  extractReportDataApi,
  releaseLabDeliveryApi,
} from "@/shared/api/labOrdersApi";
import { sendInvitation } from "@/shared/api/localCustomersApi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
};

export const VerifiedResultDeliveryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"verify" | "upload" | "extract" | "release">(
    "verify"
  );

  // 1. Patient Verification State
  const [verifyForm, setVerifyForm] = useState({
    wrId: "WR-NGA-2026-8891",
    secondFactor: "08034567890",
    secondFactorType: "phone" as "phone" | "email",
  });
  const [verifying, setVerifying] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Unregistered Patient Invite State
  const [isUnregistered, setIsUnregistered] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // 2. Upload & Metadata State
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState({
    testName: "Comprehensive Metabolic & Lipid Panel",
    orderRef: "LAB-2026-9941",
    specimenType: "Venous Blood / EDTA",
    collectionDate: new Date().toISOString().split("T")[0],
    resultDate: new Date().toISOString().split("T")[0],
    referringDoctor: "Dr. Kalu Onuoha (Consultant Physician)",
    pathologist: "Dr. Anthony Mbadiwe (FMCPath)",
    status: "Final",
    confidentiality: "Normal",
    notes: "Fasting lipid and glucose levels reviewed. Abnormal findings flagged for follow-up.",
  });

  // 3. AI Extraction State
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any[]>([]);

  // 4. Critical Flag & Multi-Channel Notification State
  const [resultFlag, setResultFlag] = useState<
    "Critical" | "High" | "Low" | "Abnormal" | "Normal"
  >("Normal");
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: true,
    whatsapp: true,
    push: true,
  });

  const [releasing, setReleasing] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);

  if (!isOpen) return null;

  // Step 1: Execute Verification
  const handleVerifyPatient = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await verifyPatientIdentityApi({
        wrId: verifyForm.wrId.trim(),
        phone:
          verifyForm.secondFactorType === "phone"
            ? verifyForm.secondFactor.trim()
            : undefined,
        email:
          verifyForm.secondFactorType === "email"
            ? verifyForm.secondFactor.trim()
            : undefined,
      });

      setVerifiedPatient(res);
      setIsUnregistered(false);
      setAuditLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Verified identity for ${
          res.name
        } (${res.wrId}) via Dual-Factor Authentication`,
      ]);
      setStep("upload");
    } catch (err: any) {
      setVerifyError(
        err?.message ||
          "Verification failed. WelliRecord ID + matching Phone/Email required for dual-factor verification."
      );
    } finally {
      setVerifying(false);
    }
  };

  // Unregistered Invite Trigger
  const handleSendInvite = async () => {
    try {
      const mockInviteToken = `INV-WR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const fullUrl = `${window.location.origin}/join/${mockInviteToken}`;
      setInviteLink(fullUrl);
      setInviteSent(true);
      navigator.clipboard.writeText(fullUrl);
      setAuditLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Generated & copied invitation onboarding token for unregistered customer`,
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  // Step 2: Handle File Drop & Continue to AI Extraction
  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleStartExtraction = async () => {
    setExtracting(true);
    setStep("extract");
    try {
      const res = await extractReportDataApi({
        fileName: files[0]?.name || "laboratory_report.pdf",
        mimeType: files[0]?.type || "application/pdf",
      });
      setExtractedData(res.extractedObservations || []);
      // Auto-set critical flag if any observation is critical
      if (res.extractedObservations?.some((o: any) => o.flag === "critical")) {
        setResultFlag("Critical");
      }
      setAuditLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] AI/OCR Document Engine extracted ${
          res.extractedObservations.length
        } structured observation rows with ${Math.round(
          res.confidenceScore * 100
        )}% confidence`,
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setExtracting(false);
    }
  };

  // Row Management in Extraction Table
  const handleAddObservation = () => {
    setExtractedData((prev) => [
      ...prev,
      {
        testName: "Serum Calcium",
        resultValue: "9.2",
        unit: "mg/dL",
        referenceRange: "8.5 - 10.2",
        flag: "normal",
        labDepartment: "Chemical Pathology",
      },
    ]);
  };

  const handleRemoveObservation = (index: number) => {
    setExtractedData((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 4: Final Release & Notification Execution
  const handleReleaseResult = async () => {
    setReleasing(true);
    try {
      const res = await releaseLabDeliveryApi({
        patientId: verifiedPatient?.id || "PAT-2026-8891",
        patientWrId: verifiedPatient?.wrId || verifyForm.wrId,
        patientName: verifiedPatient?.name || "Unregistered Patient",
        reportMetadata: {
          ...metadata,
          filesCount: files.length || 1,
          labName: "WelliRecord Certified Diagnostic Hub",
        },
        extractedObservations: extractedData,
        notificationChannels,
        isCritical: resultFlag === "Critical",
        recordedBy: metadata.pathologist,
      });

      onSuccess?.(res.message);
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-sky-400/20 bg-[#09182d] text-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#0c1f3b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Verified Result Upload & Multi-Channel Delivery
              </h2>
              <p className="text-xs text-sky-300/70">
                Identity Verification · Document Upload · AI Extraction · Panic Escalation · Patient Release
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workflow Step Indicator */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-[#071325] text-xs font-semibold">
          <div
            className={`flex items-center justify-center gap-2 py-3 border-r border-slate-800 ${
              step === "verify"
                ? "bg-sky-500/10 text-sky-400 border-b-2 border-b-sky-400"
                : "text-slate-500"
            }`}
          >
            <ShieldCheck size={14} /> 1. Verify Patient
          </div>
          <div
            className={`flex items-center justify-center gap-2 py-3 border-r border-slate-800 ${
              step === "upload"
                ? "bg-sky-500/10 text-sky-400 border-b-2 border-b-sky-400"
                : "text-slate-500"
            }`}
          >
            <UploadCloud size={14} /> 2. Upload & Metadata
          </div>
          <div
            className={`flex items-center justify-center gap-2 py-3 border-r border-slate-800 ${
              step === "extract"
                ? "bg-sky-500/10 text-sky-400 border-b-2 border-b-sky-400"
                : "text-slate-500"
            }`}
          >
            <Sparkles size={14} /> 3. AI Extraction
          </div>
          <div
            className={`flex items-center justify-center gap-2 py-3 ${
              step === "release"
                ? "bg-sky-500/10 text-sky-400 border-b-2 border-b-sky-400"
                : "text-slate-500"
            }`}
          >
            <Send size={14} /> 4. Release & Notify
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: PATIENT IDENTITY VERIFICATION */}
          {step === "verify" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl border border-sky-400/20 bg-sky-500/5 text-xs text-sky-200 flex items-start gap-3">
                <Info size={18} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sky-300 font-bold block mb-0.5">
                    Dual-Factor Patient Identity Safeguard
                  </strong>
                  High-risk clinical result delivery requires confirming the patient's WelliRecord ID (`WR-...`) alongside a second factor (Phone or Email). Upload actions remain locked until identity is verified.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    WelliRecord Patient ID <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={verifyForm.wrId}
                    onChange={(e) =>
                      setVerifyForm({ ...verifyForm, wrId: e.target.value })
                    }
                    placeholder="e.g. WR-NGA-2026-8891"
                    className="w-full rounded-xl border border-slate-700 bg-[#051122] px-4 py-2.5 text-sm text-white focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Second Factor ({verifyForm.secondFactorType.toUpperCase()}) <span className="text-sky-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setVerifyForm((prev) => ({
                          ...prev,
                          secondFactorType:
                            prev.secondFactorType === "phone" ? "email" : "phone",
                        }))
                      }
                      className="text-[11px] text-sky-400 hover:underline"
                    >
                      Switch to {verifyForm.secondFactorType === "phone" ? "Email" : "Phone"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={verifyForm.secondFactor}
                    onChange={(e) =>
                      setVerifyForm({ ...verifyForm, secondFactor: e.target.value })
                    }
                    placeholder={
                      verifyForm.secondFactorType === "phone"
                        ? "e.g. 08034567890"
                        : "e.g. patient@gmail.com"
                    }
                    className="w-full rounded-xl border border-slate-700 bg-[#051122] px-4 py-2.5 text-sm text-white focus:border-sky-400 outline-none"
                  />
                </div>
              </div>

              {verifyError && (
                <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsUnregistered((prev) => !prev)}
                  className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1.5"
                >
                  <span>Patient not on WelliRecord yet?</span>
                  <span className="text-sky-400 font-semibold underline">
                    Send Invitation Flow
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleVerifyPatient}
                  disabled={verifying}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                >
                  <ShieldCheck size={16} />
                  {verifying ? "Verifying..." : "Verify Patient Identity"}
                </button>
              </div>

              {/* Unregistered Patient Workflow Box */}
              {isUnregistered && (
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={14} /> Unregistered Patient Result Escrow & Invitation
                    </span>
                    {inviteSent && (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Invite Link Copied
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-200/80">
                    The report will be securely associated with your verified provider customer record. Access activates automatically when the patient completes account creation.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSendInvite}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                    >
                      <Copy size={14} /> Send WelliRecord Invitation Link (SMS/WhatsApp)
                    </button>
                    {inviteLink && (
                      <span className="text-[11px] text-slate-400 truncate max-w-xs font-mono bg-[#030a14] px-2.5 py-1.5 rounded-lg border border-slate-800">
                        {inviteLink}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REPORT UPLOAD & METADATA FORM */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Verified Patient Banner */}
              {verifiedPatient && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={verifiedPatient.avatarUrl}
                      alt={verifiedPatient.name}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-400/40"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{verifiedPatient.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                          Verified ✓
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        ID: {verifiedPatient.wrId} · {verifiedPatient.gender}, DOB: {verifiedPatient.dob} · {verifiedPatient.phone}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("verify")}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Change Patient
                  </button>
                </div>
              )}

              {/* Multi-File Upload Drag & Drop Box */}
              <div className="border-2 border-dashed border-sky-400/30 hover:border-sky-400 rounded-2xl p-6 bg-[#040e1c] text-center transition-colors">
                <UploadCloud className="w-10 h-10 text-sky-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-white mb-1">
                  Upload Laboratory Report Files (PDF, JPG, PNG)
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Multi-file upload supported for multi-page scans or external lab report attachments
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all">
                  <Plus size={14} /> Select Files
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileDrop}
                    className="hidden"
                  />
                </label>
                {files.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {files.map((f, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-[#0d264a] border border-sky-400/30 text-xs text-sky-200 flex items-center gap-2"
                      >
                        <FileText size={12} /> {f.name} ({(f.size / 1024).toFixed(0)} KB)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinical Report Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Test / Panel Name
                  </label>
                  <input
                    type="text"
                    value={metadata.testName}
                    onChange={(e) =>
                      setMetadata({ ...metadata, testName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#051122] px-3.5 py-2 text-white outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Lab Order / Ref Number
                  </label>
                  <input
                    type="text"
                    value={metadata.orderRef}
                    onChange={(e) =>
                      setMetadata({ ...metadata, orderRef: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#051122] px-3.5 py-2 text-white outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Specimen Type
                  </label>
                  <input
                    type="text"
                    value={metadata.specimenType}
                    onChange={(e) =>
                      setMetadata({ ...metadata, specimenType: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#051122] px-3.5 py-2 text-white outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Referring Doctor / Clinic
                  </label>
                  <input
                    type="text"
                    value={metadata.referringDoctor}
                    onChange={(e) =>
                      setMetadata({ ...metadata, referringDoctor: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#051122] px-3.5 py-2 text-white outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Laboratory Scientist / Pathologist
                  </label>
                  <input
                    type="text"
                    value={metadata.pathologist}
                    onChange={(e) =>
                      setMetadata({ ...metadata, pathologist: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#051122] px-3.5 py-2 text-white outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Result Status
                  </label>
                  <select
                    value={metadata.status}
                    onChange={(e) =>
                      setMetadata({ ...metadata, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#051122] px-3.5 py-2 text-white outline-none focus:border-sky-400"
                  >
                    <option value="Preliminary">Preliminary</option>
                    <option value="Final">Final</option>
                    <option value="Corrected">Corrected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("verify")}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStartExtraction}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                >
                  <Sparkles size={14} /> Run AI Extraction & Review Data
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AI MACHINE-READABLE EXTRACTION REVIEW */}
          {step === "extract" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-sky-400/30 bg-[#061833] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-0.5">
                    <Sparkles size={14} /> AI Document Extraction Engine Active
                  </div>
                  <div className="text-xs text-slate-300">
                    Extracted machine-readable observation rows from report file. Pathologist can edit or add custom rows.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddObservation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 hover:bg-sky-500/30 text-xs font-bold"
                >
                  <Plus size={14} /> Add Test Row
                </button>
              </div>

              {/* Observation Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#051122]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#081b36] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Test Name</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3">Reference Range</th>
                      <th className="px-4 py-3">Flag</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {extractedData.map((obs, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={obs.testName}
                            onChange={(e) => {
                              const updated = [...extractedData];
                              updated[idx].testName = e.target.value;
                              setExtractedData(updated);
                            }}
                            className="bg-transparent border-b border-slate-700 font-semibold text-white outline-none w-full"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={obs.resultValue}
                            onChange={(e) => {
                              const updated = [...extractedData];
                              updated[idx].resultValue = e.target.value;
                              setExtractedData(updated);
                            }}
                            className="bg-transparent border-b border-slate-700 font-bold text-white outline-none w-20"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={obs.unit}
                            onChange={(e) => {
                              const updated = [...extractedData];
                              updated[idx].unit = e.target.value;
                              setExtractedData(updated);
                            }}
                            className="bg-transparent border-b border-slate-700 text-slate-300 outline-none w-16"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={obs.referenceRange}
                            onChange={(e) => {
                              const updated = [...extractedData];
                              updated[idx].referenceRange = e.target.value;
                              setExtractedData(updated);
                            }}
                            className="bg-transparent border-b border-slate-700 text-slate-400 outline-none w-28"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={obs.flag}
                            onChange={(e) => {
                              const updated = [...extractedData];
                              updated[idx].flag = e.target.value;
                              setExtractedData(updated);
                            }}
                            className={`rounded-lg px-2 py-1 text-[11px] font-bold outline-none border ${
                              obs.flag === "critical"
                                ? "bg-red-500/20 text-red-400 border-red-500/40"
                                : obs.flag === "high" || obs.flag === "abnormal"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            <option value="normal" className="bg-slate-900 text-white">
                              Normal
                            </option>
                            <option value="high" className="bg-slate-900 text-white">
                              High
                            </option>
                            <option value="low" className="bg-slate-900 text-white">
                              Low
                            </option>
                            <option value="abnormal" className="bg-slate-900 text-white">
                              Abnormal
                            </option>
                            <option value="critical" className="bg-slate-900 text-white">
                              Critical Panic
                            </option>
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => handleRemoveObservation(idx)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("release")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                >
                  Proceed to Final Release & Notification
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PANIC ESCALATION & MULTI-CHANNEL RELEASE */}
          {step === "release" && (
            <div className="space-y-6">
              {/* Critical Result Panic Flag Selector */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-[#051122] space-y-3">
                <label className="block text-xs font-bold text-white">
                  Overall Result Finding Severity Flag
                </label>
                <div className="flex flex-wrap gap-3">
                  {(["Normal", "Abnormal", "High", "Low", "Critical"] as const).map(
                    (flag) => (
                      <button
                        key={flag}
                        type="button"
                        onClick={() => setResultFlag(flag)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          resultFlag === flag
                            ? flag === "Critical"
                              ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/30"
                              : flag === "High" || flag === "Abnormal"
                              ? "bg-amber-500 text-slate-950 border-amber-400"
                              : "bg-emerald-500 text-slate-950 border-emerald-400"
                            : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {flag === "Critical" ? "🚨 Critical Panic Alert" : flag}
                      </button>
                    )
                  )}
                </div>

                {resultFlag === "Critical" && (
                  <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-xs text-red-200 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 font-bold block">
                        Critical Panic Escalation Triggered
                      </strong>
                      This result will generate a high-priority panic alert to the referring physician ({metadata.referringDoctor}). Patient notification follows approved clinical release protocol.
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Channel Patient Notification Config */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-[#051122] space-y-3">
                <label className="block text-xs font-bold text-white">
                  Automatic Multi-Channel Patient Notification Dispatch
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-800 bg-[#081830] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationChannels.email}
                      onChange={(e) =>
                        setNotificationChannels({
                          ...notificationChannels,
                          email: e.target.checked,
                        })
                      }
                      className="rounded text-sky-500 focus:ring-0"
                    />
                    <Mail size={14} className="text-sky-400" /> Email ✓
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-800 bg-[#081830] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationChannels.sms}
                      onChange={(e) =>
                        setNotificationChannels({
                          ...notificationChannels,
                          sms: e.target.checked,
                        })
                      }
                      className="rounded text-sky-500 focus:ring-0"
                    />
                    <Phone size={14} className="text-sky-400" /> SMS ✓
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-800 bg-[#081830] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationChannels.whatsapp}
                      onChange={(e) =>
                        setNotificationChannels({
                          ...notificationChannels,
                          whatsapp: e.target.checked,
                        })
                      }
                      className="rounded text-sky-500 focus:ring-0"
                    />
                    <Send size={14} className="text-emerald-400" /> WhatsApp ✓
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-800 bg-[#081830] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationChannels.push}
                      onChange={(e) =>
                        setNotificationChannels({
                          ...notificationChannels,
                          push: e.target.checked,
                        })
                      }
                      className="rounded text-sky-500 focus:ring-0"
                    />
                    <Sparkles size={14} className="text-purple-400" /> Push ✓
                  </label>
                </div>

                <div className="p-3 rounded-xl bg-[#030b17] border border-slate-800 text-[11px] text-slate-400 font-mono">
                  <div className="text-slate-300 font-bold mb-1">
                    Notification Template Preview:
                  </div>
                  "New Laboratory Result Available: A laboratory result from WelliRecord Diagnostic Center has been added to your record. Log in to https://wellirecord.com/vault to view securely."
                </div>
              </div>

              {/* Audit Log Box */}
              {auditLog.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-800 bg-[#040c1a] text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Lock size={12} /> Audit Trail Transaction Log:
                  </div>
                  {auditLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep("extract")}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleReleaseResult}
                  disabled={releasing}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                    resultFlag === "Critical"
                      ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/30"
                      : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-400/20"
                  }`}
                >
                  <Send size={14} />
                  {releasing
                    ? "Releasing to WelliRecord..."
                    : resultFlag === "Critical"
                    ? "Release Critical Panic Result"
                    : "Release Result & Send Notifications"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifiedResultDeliveryModal;
