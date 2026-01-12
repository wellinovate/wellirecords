import React, { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Lock,
  Globe,
  Check,
  Smartphone,
  Building2,
  User,
  Mail,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronRight,
  X,
  LogIn,
  MessageSquare,
  ShieldCheck,
  Database,
  Key,
  ExternalLink,
  FileText,
  Server,
  Video,
  AlertCircle,
  Send,
  Award,
  FileCode,
  Cpu,
  Hash,
  Clock,
  Download,
  CheckCircle,
  Fingerprint,
  Blocks,
  Binary,
  FileKey,
  Wallet,
  Loader2,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi'

interface Props {
  onComplete: (userData: any) => void;
}

// Feature Data Configuration
const FEATURES = [
  {
    id: "universal",
    icon: Globe,
    color: "bg-blue-100 text-blue-600",
    modalColor: "bg-blue-600",
    title: "Universal Access",
    desc: "Access your records from anywhere in the world. Whether you are switching doctors or traveling abroad, your history travels with you.",
    details:
      "WelliRecord is built on the HL7 FHIR standard, ensuring your health data speaks the global language of healthcare. Whether you are seeing a specialist in London or an emergency room in Lagos, your critical health information is instantly available and readable.",
    benefits: [
      "Global Interoperability (FHIR Compliant)",
      "Instant Emergency Profile Access",
      "Multi-language Translation via Gemini AI",
    ],
  },
  {
    id: "control",
    icon: Lock,
    color: "bg-emerald-100 text-emerald-600",
    modalColor: "bg-emerald-600",
    title: "You Control Access",
    desc: "Share specific records with a specialist for 24 hours, then revoke access instantly. No more faxing sensitive forms.",
    details:
      'Our "Smart Consent" protocol puts you in the driver’s seat. Grant granular permissions—share just your latest MRI with a radiologist or your full history with a new GP. Set automatic expiration timers so you never have to remember to revoke access.',
    benefits: [
      "Granular Permission Settings",
      "Time-Limited Access Grants",
      "Immutable Access Logs on Blockchain",
    ],
  },
  {
    id: "sync",
    icon: Smartphone,
    color: "bg-purple-100 text-purple-600",
    modalColor: "bg-purple-600",
    title: "Wearable Sync",
    desc: "Connect Apple Health, Fitbit, and more. Our AI correlates your daily vitals with your clinical records for deeper insights.",
    details:
      "WelliRecord doesn’t just store clinical data; it brings it to life with real-world context. Sync data from Apple Health, Google Fit, and Oura. Our Gemini 2.5 AI engine analyzes your sleep, heart rate variability, and activity alongside your lab results to find hidden correlations.",
    benefits: [
      "Real-time Vitals Dashboard",
      "AI-Driven Health Correlations",
      "Automatic Anomaly Detection",
    ],
  },
];

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showSalesContact, setShowSalesContact] = useState(false);
  const [activeFeature, setActiveFeature] = useState<any>(null);
  
  const {  isConnected } = useAccount()

  // Security Feature States
  const [activeSecurityFeature, setActiveSecurityFeature] = useState<
    "certificate" | "whitepaper" | "network" | null
  >(null);

  // Wizard State (Sign Up)
  // Step 0: Mode Selection
  // Path A (Standard): Step 1: Details, Step 2: NIN, Step 3: OTP, Step 4: Terms/Finalize
  // Path B (Smart Contract): Step 5: Identity, Step 6: Deploy, Step 7: Keys, Step 8: Finalize
  const [wizardStep, setWizardStep] = useState(0);

  // Login State
  const [loginStep, setLoginStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState<"email" | "wallet">("email");
  const [walletStatus, setWalletStatus] = useState<
    "idle" | "connecting" | "checking" | "deploying" | "connected"
  >("idle");

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    nin: "",
    agreeToTerms: false,
  });

  // Smart Contract Specific State
  const [contractStatus, setContractStatus] = useState<
    "idle" | "compiling" | "deploying" | "minting" | "done"
  >("idle");
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");

  useEffect(() => {
    handleManinConnectWallet();
  }, [isConnected]);

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

  // Sales Form State
  const [salesForm, setSalesForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [salesSubmitted, setSalesSubmitted] = useState(false);

  const handleStartWizard = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowWizard(true);
    setShowLogin(false);
    setShowSalesContact(false);
    setActiveFeature(null);
    setActiveSecurityFeature(null);
    setWizardStep(0); // Start at mode selection
    setOtp("");
    setErrors({ name: "", email: "", phone: "", password: "", nin: "" });
    setTouched({
      name: false,
      email: false,
      phone: false,
      password: false,
      nin: false,
    });
    setContractStatus("idle");
  };

  const handleStartLogin = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowLogin(true);
    setShowWizard(false);
    setShowSalesContact(false);
    setActiveFeature(null);
    setActiveSecurityFeature(null);
    setLoginStep(1);
    setLoginMethod("email");
    setWalletStatus("idle");
    setOtp("");
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Offset for fixed header (80px nav + 20px padding)
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // --- Validation Logic ---
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
    // For NIN, restrict to numbers
    if (name === "nin" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    return (
      !errors.name &&
      !errors.email &&
      !errors.phone &&
      !errors.password &&
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.password
    );
  };

  // --- Sign Up Handlers (Standard) ---

  const handleSignupStep1 = () => {
    const formErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      password: validateField("password", formData.password),
      nin: "",
    };

    setErrors(formErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      nin: false,
    });

    if (
      formErrors.name ||
      formErrors.email ||
      formErrors.phone ||
      formErrors.password
    )
      return;

    setWizardStep(2);
  };

  const handleNinSubmit = () => {
    const ninError = validateField("nin", formData.nin);
    if (ninError) {
      setErrors((prev) => ({ ...prev, nin: ninError }));
      setTouched((prev) => ({ ...prev, nin: true }));
      return;
    }

    setLoading(true);
    // Simulate NIN verification and sending OTP
    setTimeout(() => {
      setLoading(false);
      setWizardStep(3);
    }, 1500);
  };

  const handleSignupVerifyCode = () => {
    setLoading(true);
    // Simulate verifying code
    setTimeout(() => {
      setLoading(false);
      setWizardStep(4);
    }, 1000);
  };

  // --- Smart Contract Handlers ---

  const handleSCStep1 = () => {
    // Validate Name and NIN
    const nameError = validateField("name", formData.name);
    const ninError = validateField("nin", formData.nin);

    setErrors((prev) => ({ ...prev, name: nameError, nin: ninError }));
    setTouched((prev) => ({ ...prev, name: true, nin: true }));

    if (nameError || ninError) return;

    setWizardStep(6);
    simulateDeployment();
  };

  const simulateDeployment = () => {
    setContractStatus("compiling");
    setTimeout(() => {
      setContractStatus("deploying");
      setTimeout(() => {
        setContractStatus("minting");
        setTimeout(() => {
          setContractStatus("done");
          // Generate Mock Credentials
          setGeneratedAddress(
            `0x${Array.from({ length: 40 }, () =>
              Math.floor(Math.random() * 16).toString(16)
            ).join("")}`
          );
          setRecoveryPhrase(
            "witch collapse practice feed shame open despair creek road again ice least"
          );
        }, 2000);
      }, 2000);
    }, 1500);
  };

  const handleFinalSubmit = () => {
    setLoading(true);
    // Simulate API call for Sign Up
    setTimeout(() => {
      onComplete(formData);
    }, 2000);
  };

  // --- Login Handlers ---

  const handleLoginCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate checking credentials
    setTimeout(() => {
      setLoading(false);
      setLoginStep(2); // Move to OTP
    }, 1000);
  };

  const handleLoginVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verifying OTP and logging in
    setTimeout(() => {
      onComplete({ ...formData, name: "Returning User" });
    }, 1500);
  }; 

  const handleManinConnectWallet = () => {
    if(isConnected) handleConnectWallet();
  }

  const handleConnectWallet = () => {
    setWalletStatus("connecting");
    // Simulate Wallet Connection
    setTimeout(() => {
      setWalletStatus("checking");
      // Simulate Contract Check and Deployment
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
          }, 1000);
        }, 2500);
      }, 1500);
    }, 1500);
  };

  // --- Sales Contact Handler ---
  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSalesSubmitted(true);
    }, 1500);
  };

  // --- SALES CONTACT MODAL ---
  const renderSalesContact = () => (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]">
        <button
          onClick={() => {
            setShowSalesContact(false);
            setSalesSubmitted(false);
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {salesSubmitted ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-slate-500 mb-8 max-w-xs">
              Thank you for your interest in WelliRecord Enterprise. Our sales
              team will contact you at <strong>{salesForm.email}</strong> within
              24 hours.
            </p>
            <button
              onClick={() => {
                setShowSalesContact(false);
                setSalesSubmitted(false);
                setSalesForm({ name: "", email: "", company: "", message: "" });
              }}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Contact Sales
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Interested in deploying WelliRecord for your hospital, clinic,
                or insurance network? Let's talk.
              </p>
            </div>

            <form
              onSubmit={handleSalesSubmit}
              className="p-8 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm"
                    placeholder="Jane Doe"
                    value={salesForm.name}
                    onChange={(e) =>
                      setSalesForm({ ...salesForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm"
                    placeholder="jane@company.com"
                    value={salesForm.email}
                    onChange={(e) =>
                      setSalesForm({ ...salesForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Organization Name
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-3 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm"
                    placeholder="Hospital / Clinic / Company"
                    value={salesForm.company}
                    onChange={(e) =>
                      setSalesForm({ ...salesForm, company: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  How can we help?
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm resize-none"
                  placeholder="Tell us about your needs..."
                  value={salesForm.message}
                  onChange={(e) =>
                    setSalesForm({ ...salesForm, message: e.target.value })
                  }
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Inquiry"}
                {!loading && <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );

  // --- SECURITY MODALS ---
  const renderSecurityModal = () => {
    if (!activeSecurityFeature) return null;

    const close = () => setActiveSecurityFeature(null);

    // 1. Certificate View
    if (activeSecurityFeature === "certificate") {
      return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-sm shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Close */}
            <button
              onClick={close}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>

            {/* Certificate Body */}
            <div className="p-12 border-8 border-slate-100 h-full flex flex-col items-center text-center overflow-y-auto relative">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <ShieldCheck size={400} />
              </div>

              <div className="mb-8">
                <Award size={64} className="text-emerald-600 mx-auto mb-4" />
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                  Certificate of Compliance
                </h2>
                <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">
                  WelliRecord Data Systems
                </p>
              </div>

              <div className="prose prose-slate max-w-lg mx-auto text-sm leading-relaxed mb-8">
                <p>
                  This document certifies that the{" "}
                  <strong>WelliRecord™ Health Ecosystem</strong> has
                  successfully passed all security audits and compliance
                  verifications for the handling of Protected Health Information
                  (PHI).
                </p>
                <p>
                  The architecture strictly adheres to the data privacy and
                  security mandates defined by:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-8">
                <div className="border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center bg-slate-50">
                  <div className="font-bold text-lg text-slate-900">NDPR</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    Nitda Nigeria
                  </div>
                  <div className="mt-2 text-emerald-600">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center bg-slate-50">
                  <div className="font-bold text-lg text-slate-900">HIPAA</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    United States
                  </div>
                  <div className="mt-2 text-emerald-600">
                    <CheckCircle size={20} />
                  </div>
                </div>
              </div>

              <div className="mt-auto w-full border-t border-slate-200 pt-6 flex justify-between items-end text-left">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">
                    Certificate ID
                  </div>
                  <div className="font-mono text-slate-700">
                    CERT-8921-NDPR-2024
                  </div>
                </div>
                <div className="text-right">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_sample.svg"
                    alt="Signature"
                    className="h-8 mb-1 opacity-50"
                  />
                  <div className="text-xs text-slate-400 uppercase font-bold">
                    Chief Compliance Officer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. Whitepaper View
    if (activeSecurityFeature === "whitepaper") {
      return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl relative flex flex-col max-h-[85vh] border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                  <FileCode size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    Technical Whitepaper
                  </h3>
                  <p className="text-xs text-slate-500">
                    Protocol v2.1 • Zero-Knowledge Architecture
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto prose prose-invert max-w-none prose-sm">
              <h2 className="text-white">Abstract</h2>
              <p className="text-slate-400">
                This paper introduces the WelliRecord Protocol, a decentralized
                framework for health data interoperability that prioritizes
                patient sovereignty through Zero-Knowledge Proofs (ZKPs). By
                utilizing client-side encryption and verifiable credentials,
                WelliRecord ensures that no central authority—including
                WelliCare itself—ever possesses the decryption keys to raw
                patient data.
              </p>

              <div className="my-8 p-6 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
                {/* Abstract Diagram Code */}
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-900/10 text-emerald-400">
                      <User size={24} />
                    </div>
                    <span>Client (Keys)</span>
                  </div>
                  <div className="h-px w-12 bg-slate-700 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 px-1">
                      Encrypted Blob
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-lg border-2 border-slate-700 flex items-center justify-center bg-slate-800 text-slate-400">
                      <Server size={24} />
                    </div>
                    <span>Welli Server</span>
                  </div>
                  <div className="h-px w-12 bg-slate-700 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 px-1">
                      ZKP Proof
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-lg border-2 border-blue-500 flex items-center justify-center bg-blue-900/10 text-blue-400">
                      <Database size={24} />
                    </div>
                    <span>Blockchain</span>
                  </div>
                </div>
              </div>

              <h3 className="text-white">1.0 Zero-Knowledge Proofs</h3>
              <p className="text-slate-400">
                WelliRecord employs zk-SNARKs to allow patients to prove
                eligibility (e.g., insurance coverage, age requirement) without
                revealing underlying data. For instance, a patient can prove
                they are over 18 without revealing their exact birth date.
              </p>

              <h3 className="text-white">2.0 Client-Side Encryption</h3>
              <p className="text-slate-400">
                All health records are encrypted on the user's device using
                AES-256-GCM before transmission. The private key is derived from
                the user's master seed phrase and never leaves the local
                environment.
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">
                <Download size={18} /> Download PDF (2.4 MB)
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. Network Explorer View
    if (activeSecurityFeature === "network") {
      return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300 font-mono">
          <div className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-black">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-400 text-sm ml-4">
                  admin@wellichain-mainnet:~
                </span>
              </div>
              <button
                onClick={close}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-4 border border-emerald-500/30 bg-emerald-900/10 rounded-lg">
                  <div className="text-xs text-emerald-500 uppercase mb-1">
                    Network Status
                  </div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="animate-pulse" /> ONLINE
                  </div>
                </div>
                <div className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase mb-1">
                    Block Height
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    #12,894,021
                  </div>
                </div>
                <div className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase mb-1">
                    Validator Nodes
                  </div>
                  <div className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                    <Server size={20} /> 128
                  </div>
                </div>
                <div className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase mb-1">
                    Avg Block Time
                  </div>
                  <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                    <Clock size={20} /> 2.1s
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Transactions */}
                <div className="lg:col-span-2 border border-slate-800 rounded-lg bg-black/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 text-xs font-bold text-slate-400 uppercase flex justify-between">
                    <span>Live Transactions (Mempool)</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                      Streaming
                    </span>
                  </div>
                  <div className="p-4 space-y-2 font-mono text-xs">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-slate-500 animate-in slide-in-from-right-4 fade-in duration-500"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <span className="text-blue-500">
                          0x{Math.random().toString(16).substr(2, 8)}...
                          {Math.random().toString(16).substr(2, 4)}
                        </span>
                        <span className="text-purple-400">WRITE_RECORD</span>
                        <span>{Math.floor(Math.random() * 500)}ms ago</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Node Map Visualization (Abstract) */}
                <div className="border border-slate-800 rounded-lg bg-black/50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-transparent"></div>
                  <div className="relative z-10 w-48 h-48">
                    {/* Central Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>
                    {/* Orbiting Nodes */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-slate-600 rounded-full"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${
                            i * 60
                          }deg) translateX(${80}px) rotate(-${i * 60}deg)`,
                        }}
                      >
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-px bg-slate-800 -z-10 origin-left"
                          style={{ transform: `rotate(${i * 60 + 180}deg)` }}
                        ></div>
                      </div>
                    ))}
                    <div className="absolute inset-0 border border-slate-800/50 rounded-full animate-spin-slow"></div>
                  </div>
                  <p className="mt-4 text-xs text-slate-500 text-center">
                    Decentralized Storage Topology
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // --- WIZARD SUB-COMPONENT ---
  const renderWizard = () => (
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
            onClick={() => setShowWizard(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {/* STEP 0: MODE SELECTION */}
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
                onClick={() => setWizardStep(5)} // Jump to SC Flow
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

          {/* --- STANDARD FLOW (1-4) --- */}

          {wizardStep === 1 ? (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
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
          ) : wizardStep === 2 ? (
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
          ) : wizardStep === 3 ? (
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
          ) : wizardStep === 4 ? (
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
                      setFormData({
                        ...formData,
                        agreeToTerms: e.target.checked,
                      })
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
          ) : // --- SMART CONTRACT FLOW (5-8) ---

          wizardStep === 5 ? (
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
          ) : wizardStep === 6 ? (
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
                      <CheckCircle size={48} className="text-emerald-500" />
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

              {/* Simulated Terminal Output */}
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
          ) : wizardStep === 7 ? (
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
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
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
                    setFormData({ ...formData, agreeToTerms: e.target.checked })
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
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          {wizardStep > 0 && wizardStep !== 6 && (
            <button
              onClick={() => {
                if (wizardStep === 5) setWizardStep(0);
                else if (wizardStep > 5) setWizardStep(wizardStep - 1);
                else setWizardStep(wizardStep - 1);
              }}
              className="text-slate-500 font-medium hover:text-slate-800 transition-colors"
            >
              Back
            </button>
          )}

          {/* Mode Select Footer */}
          {wizardStep === 0 && (
            <div className="text-center w-full text-xs text-slate-400">
              Secure • HIPAA Compliant • Decentralized
            </div>
          )}

          {/* Standard Flow Actions */}
          {wizardStep === 1 ? (
            <button
              onClick={handleSignupStep1}
              disabled={!isFormValid()}
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
          ) : // Smart Contract Flow Actions
          wizardStep === 5 ? (
            <button
              onClick={handleSCStep1}
              className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 ml-auto"
            >
              Initialize Contract <ArrowRight size={18} />
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
              disabled={!formData.agreeToTerms}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
              Access Dashboard <CheckCircle2 size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  // --- LOGIN MODAL ---
  const renderLogin = () => (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 pb-0">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <LogIn size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Welcome Back</h3>
            <p className="text-slate-500 text-sm">Access your health vault</p>
          </div>

          {/* Login Method Tabs */}
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
                      setFormData({ ...formData, email: e.target.value })
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
                      setFormData({ ...formData, password: e.target.value })
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

                <p className="text-sm text-slate-500 mt-2 min-h-[40px]">
                  {walletStatus === "idle" &&
                    "Sign in or create a patient identity automatically using your blockchain wallet."}
                  {walletStatus === "connecting" &&
                    "Please approve the connection request in your wallet app."}
                  {walletStatus === "checking" &&
                    "Checking WelliChain for existing patient record..."}
                  {walletStatus === "deploying" &&
                    "No record found. Deploying new Patient Smart Contract to blockchain..."}
                  {walletStatus === "connected" &&
                    "Redirecting to your secure dashboard..."}
                </p>
              </div>

              {walletStatus === "idle" && (
                <button
                  onClick={handleManinConnectWallet}
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

              <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <strong>Note:</strong> Connecting a new wallet will
                automatically initialize a patient setup smart contract.
              </div>
            </div>
          )}
        </div>

        {loginMethod === "email" && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <button
                onClick={handleStartWizard}
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

  // --- DEMO MODAL ---
  const renderDemo = () => (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl relative overflow-hidden border border-slate-800">
        <button
          onClick={() => setShowDemo(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all"
        >
          <X size={24} />
        </button>
        <div className="w-full h-full flex items-center justify-center flex-col">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-pulse mb-4 cursor-pointer">
            <Play size={32} fill="currentColor" className="text-white ml-1" />
          </div>
          <h3 className="text-white font-bold text-xl">Interactive Demo</h3>
          <p className="text-slate-400 mt-2">WelliRecord Platform Tour</p>
        </div>
      </div>
    </div>
  );

  // --- FEATURE MODAL ---
  const renderFeatureModal = () => {
    if (!activeFeature) return null;
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div
            className={`p-8 ${activeFeature.modalColor} text-white relative`}
          >
            <button
              onClick={() => setActiveFeature(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white">
              <activeFeature.icon size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-2">{activeFeature.title}</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              {activeFeature.desc}
            </p>
          </div>

          <div className="p-8 overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              Deep Dive
            </h4>
            <p className="text-slate-600 leading-relaxed mb-8">
              {activeFeature.details}
            </p>

            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              Key Benefits
            </h4>
            <div className="space-y-3">
              {activeFeature.benefits.map((benefit: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <CheckCircle2
                    className={`shrink-0 mt-0.5 ${
                      activeFeature.color.split(" ")[1]
                    }`}
                    size={18}
                  />
                  <span className="text-slate-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={() => setActiveFeature(null)}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- LANDING PAGE ---
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      {showWizard && renderWizard()}
      {showLogin && renderLogin()}
      {showDemo && renderDemo()}
      {showSalesContact && renderSalesContact()}
      {activeFeature && renderFeatureModal()}
      {activeSecurityFeature && renderSecurityModal()}

      {/* --- NAV --- */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 text-blue-600">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M50 95C50 95 85 78.4 85 45V18L50 5L15 18V45C15 78.4 50 95 50 95Z"
                  fill="currentColor"
                />
                <path
                  d="M50 25V65M30 45H70"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              WelliRecord
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, "features")}
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, "security")}
              className="hover:text-blue-600 transition-colors"
            >
              Security
            </a>
            <a
              href="#partners"
              onClick={(e) => scrollToSection(e, "partners")}
              className="hover:text-blue-600 transition-colors"
            >
              Partners
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleStartLogin}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 hidden sm:block"
            >
              Log In
            </button>
            <button
              onClick={handleStartWizard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-blue-600/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100">
              <Shield size={12} /> HIPAA Compliant & Secure
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Your complete medical history,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                accessible anywhere.
              </span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
              Stop chasing down faxed records. WelliRecord connects your
              doctors, labs, and wearables into one secure timeline—owned
              completely by you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartWizard}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
              >
                Create Free Account <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setShowDemo(true)}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Play
                  size={18}
                  fill="currentColor"
                  className="text-slate-400"
                />{" "}
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="User"
                    />
                  </div>
                ))}
              </div>
              <div>Trusted by 50,000+ patients</div>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Abstract representation of the app UI */}
            <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-slate-900 overflow-hidden ring-1 ring-slate-900/5">
              {/* Mock App Header */}
              <div className="h-14 bg-slate-800 flex items-center justify-between px-6">
                <div className="w-20 h-4 bg-slate-700 rounded-full"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
              {/* Mock App Body */}
              <div className="p-6 space-y-4">
                <div className="h-32 bg-slate-800 rounded-2xl w-full p-4 space-y-2">
                  <div className="flex justify-between">
                    <div className="w-24 h-4 bg-slate-700 rounded"></div>
                    <div className="w-12 h-4 bg-emerald-500/20 rounded"></div>
                  </div>
                  <div className="w-full h-12 bg-slate-700/50 rounded-lg mt-4"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-slate-800 rounded-2xl"></div>
                  <div className="h-24 bg-slate-800 rounded-2xl"></div>
                </div>
                <div className="h-16 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center px-4 gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                  <div className="space-y-1.5">
                    <div className="w-32 h-3 bg-blue-200/20 rounded"></div>
                    <div className="w-20 h-2 bg-blue-200/10 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Floating Element: Verified Badge */}
              <div className="absolute bottom-8 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-full text-white shadow-lg">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div className="text-white">
                  <div className="font-bold text-sm">Records Synced</div>
                  <div className="text-xs opacity-80">
                    Mount Sinai Hospital • Just now
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements around phone */}
            <div
              className="absolute top-1/4 -right-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">
                  Vitals
                </div>
                <div className="font-bold text-slate-900">Perfect Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF (PARTNERS) --- */}
      <section
        className="border-y border-slate-100 bg-slate-50 py-16"
        id="partners"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">
            Trusted by Top Nigerian Healthcare Providers
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {/* Nigerian Hospitals - Interactive Links */}
            {[
              "Lagoon Hospitals",
              "Reddington Hospital",
              "Eko Hospital",
              "First Cardiology",
              "Cedarcrest Hospitals",
            ].map((name, i) => (
              <button
                key={i}
                onClick={() =>
                  alert(
                    `Initiating secure connection request to ${name} Portal...`
                  )
                }
                className="group flex items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
              >
                <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <Building2 size={24} />
                </div>
                <span className="text-lg font-serif font-bold text-slate-700 group-hover:text-slate-900">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-24" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to manage your health
            </h2>
            <p className="text-lg text-slate-500">
              Traditional patient portals are fragmented. WelliRecord brings it
              all together in one beautiful, secure dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  {feature.desc}
                </p>
                <button
                  onClick={() => setActiveFeature(feature)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group/btn"
                >
                  Learn more{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW SECURITY SECTION --- */}
      <section
        className="py-24 bg-slate-900 text-white border-y border-slate-800"
        id="security"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wide border border-emerald-500/20 mb-4">
              <Lock size={12} /> Iron-Clad Protection
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your health data, secured like a vault.
            </h2>
            <p className="text-lg text-slate-400">
              We use military-grade encryption and decentralized storage to
              ensure that you—and only you—hold the keys to your medical
              history.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-colors flex flex-col">
              <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">NDPR & HIPAA Compliant</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                Fully compliant with the Nigeria Data Protection Regulation
                (NDPR) and US HIPAA standards, ensuring your rights are
                protected globally.
              </p>
              <button
                onClick={() => setActiveSecurityFeature("certificate")}
                className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
              >
                View Certificate <ExternalLink size={12} />
              </button>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-colors flex flex-col">
              <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <Key size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Zero-Knowledge Architecture
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                Your data is encrypted on your device before it ever touches our
                servers. We cannot see your records, even if we wanted to.
              </p>
              <button
                onClick={() => setActiveSecurityFeature("whitepaper")}
                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
              >
                Read Whitepaper <FileText size={12} />
              </button>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition-colors flex flex-col">
              <div className="w-12 h-12 bg-purple-900/30 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Data Sovereignty</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                Your records are stored on the WelliChain, an immutable ledger.
                You grant and revoke access permissions in real-time.
              </p>
              <button
                onClick={() => setActiveSecurityFeature("network")}
                className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider"
              >
                Explore Network <Server size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- AI SECTION --- */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-500/30">
              Powered by Gemini 2.5
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Medical jargon, translated into plain English.
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Don't just read your lab results—understand them. WelliRecord's AI
              assistant analyzes complex clinical notes and explains them
              simply, highlighting what actually matters for your health.
            </p>
            <ul className="space-y-4">
              {[
                "Instant lab result analysis & trends",
                "Drug interaction warnings",
                "Personalized wellness recommendations",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-1 rounded-full text-emerald-400">
                    <Check size={16} />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl relative">
            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold text-white">AI</span>
              </div>
              <div className="bg-slate-700 rounded-2xl rounded-tl-none p-4 text-sm text-slate-200 leading-relaxed shadow-sm">
                <p className="mb-2">
                  I've analyzed your Comprehensive Metabolic Panel.
                </p>
                <p>
                  <strong>Good news:</strong> Your Kidney Function (eGFR) has
                  improved by 15% since last year. However, your Vitamin D is
                  slightly low (28 ng/mL).
                </p>
                <p className="mt-2 text-blue-300 cursor-pointer hover:underline">
                  View suggested supplements &rarr;
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 text-sm shadow-sm">
                That's great! What foods should I eat for Vitamin D?
              </div>
              <div className="w-10 h-10 bg-slate-600 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/100?img=12" alt="User" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA / FOOTER --- */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to take control of your health?
          </h2>
          <p className="text-slate-500 mb-10 text-lg">
            Join thousands of patients who have already secured their medical
            future.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleStartWizard}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-600/20 transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => setShowSalesContact(true)}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-lg transition-all"
            >
              Contact Sales
            </button>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            WelliRecord complies with NDPR, HIPAA, GDPR, and SOC2 Type II
            standards. Your data is encrypted at rest and in transit.
          </p>
        </div>
      </section>
    </div>
  );
};
