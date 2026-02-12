// ./modals/SignupWizardModal.tsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  X,
  Mail,
  Blocks,
  ArrowRight,
  User,
  Smartphone,
  Lock,
  AlertCircle,
  Fingerprint,
  ShieldCheck,
  Shield,
  Check,
  Activity,
  CheckCircle2,
  Cpu,
  Binary,
  Server,
  Hash,
  FileKey,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type ContractStatus = "idle" | "compiling" | "deploying" | "minting" | "done";

type Props = {
  open: boolean;
  onClose: () => void;
  apiUrl: string;
  onComplete: (user: any) => void;
};

export function WizardModal({ open, onClose, apiUrl, onComplete }: Props) {
  const onboardStatus = localStorage.getItem("welli_onboarded");
  const navigate = useNavigate();
  // Wizard State
  const [wizardStep, setWizardStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    nin: "",
    agreeToTerms: false,
  });

  // Smart Contract State
  const [contractStatus, setContractStatus] = useState<ContractStatus>("idle");
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");

  // Validation State
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    nin: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    nin: false,
  });

  const resetAll = () => {
    setWizardStep(0);
    setLoading(false);
    setOtp("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      nin: "",
      agreeToTerms: false,
    });
    setErrors({ name: "", email: "", phone: "", password: "", nin: "" });
    setTouched({
      name: false,
      email: false,
      phone: false,
      password: false,
      nin: false,
    });
    setContractStatus("idle");
    setGeneratedAddress("");
    setRecoveryPhrase("");
  };

  const close = () => {
    onClose();
    resetAll();
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Full Name is required";
        else if (value.trim().length < 2)
          error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email address";
        break;
      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^\+?[\d\s-()]{10,}$/.test(value))
          error = "Invalid phone number (min 10 digits)";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8)
          error = "Password must be at least 8 characters";
        break;
      case "nin":
        if (!value.trim()) error = "NIN is required";
        else if (!/^\d{11}$/.test(value))
          error = "NIN must be exactly 11 digits";
        break;
    }
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // NIN numeric only
    if (name === "nin" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const isFormValid = useMemo(() => {
    return (
      !errors.name &&
      !errors.email &&
      !errors.phone &&
      !errors.password &&
      !!formData.name &&
      !!formData.email &&
      !!formData.phone &&
      !!formData.password
    );
  }, [errors, formData]);

  // --- Standard Sign Up flow handlers ---
  const handleSignupStep1 = () => {
    const nextErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      password: validateField("password", formData.password),
      nin: "",
    };

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    setTouched((prev) => ({
      ...prev,
      name: true,
      email: true,
      phone: true,
      password: true,
    }));

    if (
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.phone ||
      nextErrors.password
    )
      return;

    setWizardStep(2);
  };

  const handleNinSubmit = async () => {
    const ninError = validateField("nin", formData.nin);
    if (ninError) {
      setErrors((prev) => ({ ...prev, nin: ninError }));
      setTouched((prev) => ({ ...prev, nin: true }));
      return;
    }

    setLoading(true);
    try {
      // If you have a real endpoint, call it here:
      // await axios.post(`${apiUrl}/api/v1/user/verify-nin`, { nin: formData.nin });
      setWizardStep(3);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Failed to verify NIN");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupVerifyCode = async () => {
    setLoading(true);
    try {
      // Optional: verify OTP for signup
      // await axios.post(`${apiUrl}/api/v1/user/verify-signup-otp`, { ... })
      setWizardStep(4);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Smart contract flow handlers ---
  const simulateDeployment = () => {
    setContractStatus("compiling");
    setTimeout(() => {
      setContractStatus("deploying");
      setTimeout(() => {
        setContractStatus("done");
        setGeneratedAddress("0x71C...9A21");
        setRecoveryPhrase("sample seed phrase goes here ...");
      }, 1000);
    }, 1000);
  };

  const handleSCStep1 = () => {
    const nameError = validateField("name", formData.name);
    const ninError = validateField("nin", formData.nin);

    setErrors((prev) => ({ ...prev, name: nameError, nin: ninError }));
    setTouched((prev) => ({ ...prev, name: true, nin: true }));

    if (nameError || ninError) return;

    setWizardStep(6);
    simulateDeployment();
  };

  // --- Final submit (both flows end here) ---
  const handleFinalSubmit = async () => {
    console.log("🚀 ~ WizardModal ~ formData:", formData);
    if (!formData.agreeToTerms) return;

    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/v1/user/users`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      console.log("🚀 ~ handleFinalSubmit ~ res:", res);
      if (res.status === 201) {
        onComplete(formData);
        close();
        localStorage.setItem("welli_onboarded", "true");
        localStorage.setItem("welli_trial_start", new Date().toISOString());
        navigate("/");

        return;
      }
      alert("Registration failed, try again");
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Registration failed, try again");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {wizardStep === 0
                ? "Select Setup Method"
                : wizardStep >= 5
                  ? "Smart Contract Setup"
                  : "Create Secure ID"}
            </h3>
            <p className="text-sm text-slate-500">
              {wizardStep === 0
                ? "Choose how you want to secure your data"
                : wizardStep >= 5
                  ? `Phase ${wizardStep - 4} of 4`
                  : `Step ${wizardStep} of 4`}
            </p>
          </div>

          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {/* STEP 0 */}
          {wizardStep === 0 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setWizardStep(1)}
                className="w-full text-left p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Standard Account
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Sign up with email and password. Easy recovery, managed
                      security.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setWizardStep(5)}
                className="w-full text-left p-6 rounded-xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Blocks size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Smart Contract Identity
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Generate a self-sovereign blockchain wallet. Max privacy,
                      you hold the keys.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* STEP 1 */}
          {wizardStep === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User
                    className={`absolute left-4 top-3.5 ${
                      errors.name && touched.name
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Jane Doe"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all text-slate-800 ${
                      errors.name && touched.name
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-3.5 ${
                      errors.email && touched.email
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="jane@example.com"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all text-slate-800 ${
                      errors.email && touched.email
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Mobile Phone
                </label>
                <div className="relative">
                  <Smartphone
                    className={`absolute left-4 top-3.5 ${
                      errors.phone && touched.phone
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all text-slate-800 ${
                      errors.phone && touched.phone
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Create Password
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-3.5 ${
                      errors.password && touched.password
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all text-slate-800 ${
                      errors.password && touched.password
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.password && touched.password && (
                  <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {wizardStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2">
                  <Fingerprint size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Identity Verification
                </h3>
                <p className="text-slate-500 text-sm px-4">
                  To comply with healthcare regulations, we need to verify your
                  identity. Please enter your 11-digit National Identification
                  Number (NIN).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  National ID Number (NIN)
                </label>
                <div className="relative">
                  <ShieldCheck
                    className={`absolute left-4 top-3.5 ${
                      errors.nin && touched.nin
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                    size={18}
                  />
                  <input
                    type="text"
                    name="nin"
                    placeholder="12345678901"
                    maxLength={11}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all text-slate-800 ${
                      errors.nin && touched.nin
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                    value={formData.nin}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                </div>

                {errors.nin && touched.nin && (
                  <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.nin}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <Lock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600 leading-relaxed">
                  Your NIN is encrypted instantly and used solely for identity
                  verification. It is not stored on our servers in plain text.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {wizardStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2">
                <Smartphone size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Verify Your Number
              </h3>
              <p className="text-slate-500 text-sm px-4">
                We sent a verification code to the phone number linked to your
                NIN (**89). Enter it below to secure your account.
              </p>

              <div className="py-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000 000"
                  className="w-full py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 text-center text-2xl font-mono tracking-[0.5em]"
                />
              </div>
              <p className="text-xs text-slate-400">
                Standard message rates may apply.
              </p>
            </div>
          )}

          {/* STEP 4 */}
          {wizardStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <Shield size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Finalizing Your Vault
              </h3>
              <p className="text-slate-500 text-sm">
                We are generating your unique cryptographic keys. You will be
                the only person with access to your raw health data.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        agreeToTerms: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    I understand that WelliRecord cannot recover my data if I
                    lose my private key, as we do not store it. I agree to the{" "}
                    <a href="#" className="text-blue-600 font-medium underline">
                      Terms of Service
                    </a>
                    .
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5 (Smart Contract) */}
          {wizardStep === 5 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 mb-4 flex gap-3">
                <Blocks className="text-purple-600 shrink-0" size={20} />
                <div className="text-sm text-purple-900">
                  <strong>Blockchain Identity:</strong> You are creating a
                  self-sovereign identity. No email or password required. You
                  will sign in using your cryptographic key.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  National ID (NIN) for Binding
                </label>
                <input
                  type="text"
                  name="nin"
                  placeholder="11-digit NIN"
                  maxLength={11}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  value={formData.nin}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-slate-500">
                  Your NIN will be hashed and bound to your smart contract.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6 (Deploy) */}
          {wizardStep === 6 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 py-4">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center">
                    {contractStatus === "idle" && (
                      <Cpu size={40} className="text-slate-300" />
                    )}
                    {contractStatus === "compiling" && (
                      <Binary
                        size={40}
                        className="text-purple-500 animate-pulse"
                      />
                    )}
                    {contractStatus === "deploying" && (
                      <Server
                        size={40}
                        className="text-blue-500 animate-bounce"
                      />
                    )}
                    {contractStatus === "minting" && (
                      <Fingerprint
                        size={40}
                        className="text-emerald-500 animate-pulse"
                      />
                    )}
                    {contractStatus === "done" && (
                      <CheckCircle2 size={48} className="text-emerald-500" />
                    )}
                  </div>

                  {(contractStatus === "deploying" ||
                    contractStatus === "compiling") && (
                    <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {contractStatus === "idle" && "Initializing..."}
                    {contractStatus === "compiling" &&
                      "Generating Identity Keys..."}
                    {contractStatus === "deploying" &&
                      "Deploying to WelliChain..."}
                    {contractStatus === "minting" &&
                      "Minting Soulbound Token..."}
                    {contractStatus === "done" && "Deployment Complete"}
                  </h3>

                  <p className="text-sm text-slate-500 font-mono">
                    {contractStatus === "deploying" &&
                      "Block #12,894,221 • 2 Confirmations"}
                    {contractStatus === "minting" &&
                      "Binding NIN Hash: 0x9f...a1"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-green-400 h-40 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none"></div>
                <div className="space-y-1 opacity-80">
                  <p> Initiating GenKeypair(curve=secp256k1)...</p>
                  {contractStatus !== "idle" && (
                    <p> Public Key Generated: 0x71C...9A21</p>
                  )}
                  {(contractStatus === "deploying" ||
                    contractStatus === "minting" ||
                    contractStatus === "done") && (
                    <>
                      <p> Compiling SmartContract.sol...</p>
                      <p> Deploying to Network (Gas: 0.002 ETH)...</p>
                      <p className="text-blue-400">
                        {" "}
                        Transaction Hash: 0x3b1...c99e
                      </p>
                    </>
                  )}
                  {contractStatus === "done" && (
                    <p className="text-white font-bold">
                      {" "}
                      CONTRACT DEPLOYED SUCCESSFULLY
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7 (Keys) */}
          {wizardStep === 7 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div className="text-sm text-amber-900">
                  <strong>Save this immediately.</strong> This is the only way
                  to recover your account. We do not store your private key.
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Your Contract Address
                </label>
                <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <Hash size={16} className="text-slate-400" />
                  <code className="text-sm font-mono text-slate-700 flex-1 truncate">
                    {generatedAddress}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Secret Recovery Phrase
                </label>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative group">
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      onClick={() => {
                        // optional: copy to clipboard
                        navigator.clipboard
                          ?.writeText(recoveryPhrase)
                          .catch(() => {});
                      }}
                    >
                      <FileKey size={16} />
                    </button>
                  </div>
                  <code className="text-sm font-mono text-white leading-relaxed tracking-wide">
                    {recoveryPhrase}
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="saved-phrase"
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      agreeToTerms: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="saved-phrase"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  I have saved my recovery phrase in a secure location. I
                  understand that WelliRecord cannot recover my account if I
                  lose this phrase.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          {wizardStep > 0 && wizardStep !== 6 && (
            <button
              onClick={() => {
                if (wizardStep === 5) setWizardStep(0);
                else setWizardStep(wizardStep - 1);
              }}
              className="text-slate-500 font-medium hover:text-slate-800 transition-colors"
            >
              Back
            </button>
          )}

          {wizardStep === 0 && (
            <div className="text-center w-full text-xs text-slate-400">
              Secure • HIPAA Compliant • Decentralized
            </div>
          )}

          {/* Standard flow actions */}
          {wizardStep === 1 ? (
            <button
              onClick={handleSignupStep1}
              disabled={!isFormValid}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : wizardStep === 2 ? (
            <button
              onClick={handleNinSubmit}
              disabled={!formData.nin || formData.nin.length !== 11 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              {loading ? "Verifying..." : "Verify Identity"}
              {!loading && <ArrowRight size={18} />}
            </button>
          ) : wizardStep === 3 ? (
            <button
              onClick={handleSignupVerifyCode}
              disabled={otp.length < 4 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              {loading ? "Verifying..." : "Verify Code"}
              {!loading && <Check size={18} />}
            </button>
          ) : wizardStep === 4 ? (
            <button
              onClick={handleFinalSubmit}
              disabled={!formData.agreeToTerms || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              {loading ? "Creating Account..." : "Complete Setup"}
              {loading ? (
                <Activity className="animate-spin" size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </button>
          ) : wizardStep === 5 ? (
            <button
              onClick={handleSCStep1}
              className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 ml-auto"
            >
              Initialize Account <ArrowRight size={18} />
            </button>
          ) : wizardStep === 6 ? (
            <button
              onClick={() => setWizardStep(7)}
              disabled={contractStatus !== "done"}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              {contractStatus === "done" ? "View Credentials" : "Deploying..."}
              {contractStatus === "done" && <ArrowRight size={18} />}
            </button>
          ) : wizardStep === 7 ? (
            <button
              onClick={handleFinalSubmit}
              disabled={!formData.agreeToTerms || loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              Access Dashboard <CheckCircle2 size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
