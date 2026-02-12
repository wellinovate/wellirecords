// ./modals/LoginModal.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, LogIn, Wallet, Loader2, Cpu, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  apiUrl: string;
  onComplete: (user: any) => void;
  onCreateAccount: () => void;
};

export function LoginModal({
  open,
  onClose,
  apiUrl,
  onComplete,
  onCreateAccount,
}: Props) {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"email" | "wallet">("email");
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [walletStatus, setWalletStatus] = useState<
    "idle" | "connecting" | "checking" | "deploying" | "connected"
  >("idle");

  const [formData, setFormData] = useState({ email: "", password: "" });

  const { isConnected } = useAccount();

  const resetAll = () => {
    setLoginMethod("email");
    setLoginStep(1);
    setOtp("");
    setLoading(false);
    setWalletStatus("idle");
    setFormData({ email: "", password: "" });
  };

  const close = () => {
    onClose();
    resetAll();
  };
  const onboardStatus = localStorage.getItem("welli_onboarded");
  useEffect(() => {
    // if user connects wallet, you can move flow forward
    if (onboardStatus) navigate("/");
    if (!open) return;
    if (!isConnected) localStorage.setItem("welli_onboarded", "false");
    if (isConnected) {
      localStorage.setItem("welli_onboarded", "true");
      // localStorage.setItem("welli_trial_start", new Date().toISOString());
      navigate("/");
    }
    // optionally auto-start wallet flow when connected
  }, [isConnected, open]);

  const handleLoginCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/v1/user/login`, {
        email: formData.email,
        password: formData.password,
      });

      
      if (response.status === 200) {
        const data = await response.data;
        localStorage.setItem("welli_onboarded", "true");
        localStorage.setItem("userData", data?.user?._id);
        setLoginStep(2);}
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const otptrue = otp === "123456"; // for testing, replace with real OTP verification
      // const response = await axios.post(`${apiUrl}/api/v1/user/verify-otp`, {
      //   email: formData.email,
      //   otp: Number(otp),
      // });

      // if (response.status === 200) {
      if (otptrue === true) {
        onComplete({ email: formData.email, name: "Returning User" });
        close();
        localStorage.setItem("welli_onboarded", "true");
        // localStorage.setItem("welli_trial_start", new Date().toISOString());
        navigate("/");
      } else {
        alert("Wrong OTP");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Wrong OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWalletFlow = () => {
    setWalletStatus("connecting");
    setTimeout(() => {
      setWalletStatus("checking");
      setTimeout(() => {
        setWalletStatus("deploying");
        setTimeout(() => {
          setWalletStatus("connected");
          setTimeout(() => {
            onComplete({
              name: "Wallet User",
              email: "wallet@wellichain.eth",
              memberId: "WR-SMART-99",
            });
            close();
          }, 700);
        }, 1500);
      }, 1000);
    }, 700);
  };

  if (!open) return null;

  // ✅ Keep your existing JSX; replace prop references with local state/handlers.
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* header */}
        <div className="p-8 pb-0">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <LogIn size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Welcome Back</h3>
            <p className="text-slate-500 text-sm">Access your health vault</p>
          </div>

          {/* tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => setLoginMethod("email")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                loginMethod === "email"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Email / ID
            </button>

            <button
              onClick={() => setLoginMethod("wallet")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                loginMethod === "wallet"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Wallet size={14} /> Web3 Wallet
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          {loginMethod === "email" ? (
            loginStep === 1 ? (
              <form
                onSubmit={handleLoginCredentialsSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Email or Member ID
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, password: e.target.value }))
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginVerifySubmit} className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    Enter the 6-digit code from your authenticator app or sent
                    to ••89.
                  </p>

                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full py-3 border-2 border-slate-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:border-blue-500 outline-none"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Verify & Login"
                  )}
                </button>
              </form>
            )
          ) : (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
              <div className="py-2">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-100">
                  {walletStatus === "idle" && (
                    <Wallet size={32} className="text-purple-600" />
                  )}
                  {walletStatus === "connecting" && (
                    <Loader2
                      size={32}
                      className="text-purple-600 animate-spin"
                    />
                  )}
                  {(walletStatus === "checking" ||
                    walletStatus === "deploying") && (
                    <Cpu size={32} className="text-purple-600 animate-pulse" />
                  )}
                  {walletStatus === "connected" && (
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-lg">
                  {walletStatus === "idle" && "Connect Web3 Wallet"}
                  {walletStatus === "connecting" && "Connecting Wallet..."}
                  {walletStatus === "checking" && "Verifying Identity..."}
                  {walletStatus === "deploying" &&
                    "Auto-Generating Contract..."}
                  {walletStatus === "connected" && "Identity Confirmed"}
                </h4>
              </div>

              {walletStatus === "idle" && (
                <button
                  onClick={handleConnectWalletFlow}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Wallet size={18} />
                  <ConnectButton
                    showBalance={true}
                    chainStatus="icon"
                    accountStatus="address"
                  />
                </button>
              )}
            </div>
          )}
        </div>

        {loginMethod === "email" && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                onClick={onCreateAccount}
                className="text-blue-600 font-bold hover:underline"
              >
                Create one
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
