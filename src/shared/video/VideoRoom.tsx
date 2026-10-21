import React, { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { getJoinInfo, JoinError } from "@/shared/api/telehealthApi";

type Props = { appointmentId: string; selfLabel: string; otherLabel: string; onLeave: () => void; getJoin?: (id: string) => Promise<{ url: string; token: string }> };
type Phase = "loading" | "waiting" | "connecting" | "live" | "error";

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }) : "");

export function VideoRoom({ appointmentId, selfLabel, otherLabel, onLeave, getJoin }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("");
  const [opensAt, setOpensAt] = useState<string | undefined>();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteHere, setRemoteHere] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const localEl = useRef<HTMLVideoElement>(null);
  const remoteEl = useRef<HTMLVideoElement>(null);
  const audioEl = useRef<HTMLDivElement>(null);

  const attach = useCallback((track: RemoteTrack) => {
    if (track.kind === Track.Kind.Video && remoteEl.current) {
      track.attach(remoteEl.current);
      setRemoteHere(true);
    } else if (track.kind === Track.Kind.Audio && audioEl.current) {
      audioEl.current.appendChild(track.attach());
    }
  }, []);

  const connect = useCallback(async () => {
    setPhase("loading");
    try {
      const info = await (getJoin || getJoinInfo)(appointmentId);
      setPhase("connecting");
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      room
        .on(RoomEvent.TrackSubscribed, (t) => attach(t))
        .on(RoomEvent.TrackUnsubscribed, (t) => {
          t.detach().forEach((el) => el.remove());
          if (t.kind === Track.Kind.Video) setRemoteHere(false);
        })
        .on(RoomEvent.ParticipantDisconnected, (_p: RemoteParticipant) => setRemoteHere(false))
        .on(RoomEvent.Disconnected, () => setPhase((p) => (p === "live" ? "error" : p)));
      await room.connect(info.url, info.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      await room.localParticipant.setCameraEnabled(true);
      const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (pub?.track && localEl.current) pub.track.attach(localEl.current);
      room.remoteParticipants.forEach((p) => p.trackPublications.forEach((tp) => tp.track && attach(tp.track as RemoteTrack)));
      setPhase("live");
    } catch (e) {
      if (e instanceof JoinError && e.code === "TOO_EARLY") {
        setOpensAt(e.opensAt);
        setMessage(e.message);
        setPhase("waiting");
        return;
      }
      setMessage(e instanceof Error ? e.message : "Could not join the visit.");
      setPhase("error");
    }
  }, [appointmentId, attach, getJoin]);

  useEffect(() => {
    connect();
    return () => {
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [connect]);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const toggleMic = async () => {
    const next = !micOn;
    await roomRef.current?.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  };
  const toggleCam = async () => {
    const next = !camOn;
    await roomRef.current?.localParticipant.setCameraEnabled(next);
    setCamOn(next);
  };
  const leave = () => {
    roomRef.current?.disconnect();
    onLeave();
  };

  if (phase === "loading" || phase === "connecting") {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-sm text-[#9FB3CF]">
        <Loader2 className="animate-spin" size={24} />
        {phase === "loading" ? "Checking your visit" : "Connecting"}
      </div>
    );
  }
  if (phase === "waiting") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[#163761] bg-[#081b35]/60 p-8 text-center space-y-3">
        <Clock className="mx-auto text-sky-400" size={28} />
        <p className="text-white font-semibold">{message}</p>
        {opensAt && <p className="text-sm text-[#9FB3CF]">Opens {fmt(opensAt)} (Lagos time).</p>}
        <button onClick={connect} className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950">Check again</button>
      </div>
    );
  }
  if (phase === "error") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center space-y-3">
        <AlertTriangle className="mx-auto text-red-400" size={28} />
        <p className="text-white font-semibold">{message || "The call ended."}</p>
        <div className="flex justify-center gap-2">
          <button onClick={connect} className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950">Try again</button>
          <button onClick={onLeave} className="rounded-xl border border-[#163761] px-4 py-2 text-xs font-semibold text-[#9FB3CF]">Back</button>
        </div>
      </div>
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#163761] bg-black">
        <video ref={remoteEl} autoPlay playsInline className="h-full w-full object-cover" />
        {!remoteHere && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9FB3CF]">Waiting for {otherLabel} to join</div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">{mm}:{ss}</div>
        <div className="absolute bottom-3 right-3 h-28 w-40 overflow-hidden rounded-xl border border-white/20 bg-slate-900">
          <video ref={localEl} autoPlay playsInline muted className="h-full w-full object-cover" />
          <span className="absolute bottom-1 left-2 text-[10px] text-white/80">{selfLabel}</span>
        </div>
        <div ref={audioEl} className="hidden" />
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={toggleMic} aria-label={micOn ? "Mute" : "Unmute"} className="rounded-full border border-[#163761] bg-[#081b35] p-3 text-white">
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button onClick={toggleCam} aria-label={camOn ? "Camera off" : "Camera on"} className="rounded-full border border-[#163761] bg-[#081b35] p-3 text-white">
          {camOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        <button onClick={leave} aria-label="Leave" className="rounded-full bg-red-600 p-3 text-white">
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
