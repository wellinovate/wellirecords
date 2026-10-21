import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { VideoRoom } from "@/shared/video/VideoRoom";

export function TeleConsultSessionPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const back = () => navigate("/provider/queue");
  return (
    <div className="animate-fade-in space-y-6 p-2 md:p-4 max-w-4xl mx-auto">
      <button
        onClick={back}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#163761] bg-[#081b35] px-3.5 py-2 text-xs font-semibold text-[#9FB3CF] hover:text-white hover:bg-white/5 transition"
      >
        <ArrowLeft size={14} />
        <span>Back to live queue</span>
      </button>
      {sessionId ? (
        <VideoRoom appointmentId={sessionId} selfLabel="You" otherLabel="the patient" onLeave={back} />
      ) : (
        <p className="text-sm text-[#9FB3CF]">No visit selected.</p>
      )}
    </div>
  );
}
