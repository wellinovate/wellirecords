import { useRef, useEffect } from "react";

interface OTPFormProps {
  maskedPhone: string;
  code: string;
  setCode: (code: string) => void;
  isCodeValid: boolean;
  verifying: boolean;
  handleResend: () => void;
  resending: boolean;
  timeLeft: number;
  setTimeLeft: (seconds: number) => void;
}

export default function OTPForm({
  maskedPhone,
  code,
  setCode,
  isCodeValid,
  verifying,
  handleResend,
  resending,
  timeLeft,
  setTimeLeft
}: OTPFormProps) {
  const OTP_LENGTH = 6;
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return; // stop at 0
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, setTimeLeft]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const codeArray = code.split("").slice(0, OTP_LENGTH);
    codeArray[index] = value;
    const newCode = codeArray.join("").padEnd(OTP_LENGTH, "");
    setCode(newCode);

    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Enter login code</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        We sent a 6-digit code to <span className="font-bold text-[#062B67]">{maskedPhone}</span>. Enter it below.
      </p>

      <div className="mt-6 flex justify-between gap-2">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el!)}
            value={code[i] || ""}
            onChange={(e) => handleChange(e.target.value, i)}
            maxLength={1}
            inputMode="numeric"
            className="w-12 h-12 rounded-xl border border-slate-300 text-center text-2xl focus:border-emerald-500 outline-none"
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Expires in: {formatTime(timeLeft)}</span>
        <button
          type="button"
          disabled={timeLeft > 0 || resending}
          onClick={handleResend}
          className={`text-emerald-600 font-bold ${timeLeft > 0 || resending ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
        >
          {resending ? "Resending..." : "Resend Code"}
        </button>
      </div>
    </div>
  );
}