import { FEATURES } from "@/constants";
import axios from "axios";
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  Key,
  Lock,
  Play,
  Server,
  Shield,
  ShieldCheck
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { DemoModal } from "./modals/DemoModal";
import { FeatureModal } from "./modals/FeatureModal";
import { LoginModal } from "./modals/LoginModal";
import { SalesContactModal } from "./modals/SalesContactModal";
import { SecurityModal } from "./modals/SecurityModal";
import { WizardModal } from "./modals/SignupWizardModal";
import { LandingNav } from "./landing/LandingNav";
import { HeroSection } from "./landing/HeroSection";
import { PartnersSection } from "./landing/PartnersSection";
import { FeaturesSection } from "./landing/FeaturesSection";
import { SecuritySection } from "./landing/SecuritySection";
import { AISection } from "./landing/AISection";
import { CTASection } from "./landing/CTASection";

interface Props {
  onComplete: (userData: any) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showSalesContact, setShowSalesContact] = useState(false);
  const [activeFeature, setActiveFeature] = useState<any>(null);
  const { connect, isPending, error } = useConnect();

  const { isConnected } = useAccount();

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

  // Ideally, store your base URL in an .env file
  const API_URL = "https://welli-record.vercel.app";

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

    if (
      formErrors.name ||
      formErrors.email ||
      formErrors.phone ||
      formErrors.password
    )
      return;
    console.log("stepone", formData);
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
      console.log("step two", formData);
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
      setContractStatus("done");
    }, 1500);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    // Simulate API call for Sign Up
    const response = await axios.post(`${API_URL}/api/v1/user/users`, {
      formData,
    });
    if (response.status === 201) {
      setLoading(false);
      onComplete(formData);
    } else {
      alert("Registration failed, try again");
      setLoading(false);
    }
  };

  // --- Login Handlers ---

  const handleLoginCredentialsSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate checking credentials
    // Send the email to the backend to generate/send OTP
    const response = await axios.post(`${API_URL}/api/v1/user/initiate`, {
      email: formData.email,
      password: formData.password,
    });
    console.log("OTP response: ", response);
    if (response.status === 200) {
      setLoading(false);
      setLoginStep(2); // Move to OTP
    }
  };

  const handleLoginVerifySubmit = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verifying OTP and logging in
    const response = await axios.post(`${API_URL}/api/v1/user/verify-otp`, {
      email: formData.email,
      otp: Number(otp),
    });
    if (response.status === 200) {
      onComplete({ ...formData, name: "Returning User" });
    } else {
      alert("Wrong OTP");
    }
    // setTimeout(() => {

    // }, 1500);
  };

  const handleManinConnectWallet = () => {
    if (isConnected) handleConnectWallet();
  };

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
  const handleSalesSubmit = (e: React.ChangeEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSalesSubmitted(true);
    }, 1500);
  };

  // --- LANDING PAGE ---
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      <WizardModal
        open={showWizard}
        onClose={() => setShowWizard(false)}
        apiUrl="http://localhost:3000"
        onComplete={(user) => onComplete(user)}
      />

      {/* <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        loginMethod={loginMethod}
        setLoginMethod={setLoginMethod}
        loginStep={loginStep}
        otp={otp}
        setOtp={setOtp}
        formData={{ email: formData.email, password: formData.password }}
        setFormData={(next) => setFormData({ ...formData, ...next })}
        loading={loading}
        walletStatus={walletStatus}
        handleLoginCredentialsSubmit={handleLoginCredentialsSubmit}
        handleLoginVerifySubmit={handleLoginVerifySubmit}
        handleManinConnectWallet={handleManinConnectWallet}
        handleStartWizard={handleStartWizard}
      /> */}

       <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        // apiUrl="https://welli-record.vercel.app"
        apiUrl="http://localhost:3000"
        onComplete={(user) => onComplete(user)}
        onCreateAccount={() => {
          setShowLogin(false);
          setShowWizard(true);
        }}
      />

      <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />

      <FeatureModal
        feature={activeFeature}
        onClose={() => setActiveFeature(null)}
      />

      <SalesContactModal
        open={showSalesContact}
        loading={loading}
        salesSubmitted={salesSubmitted}
        salesForm={salesForm}
        setSalesForm={setSalesForm}
        onSubmit={handleSalesSubmit}
        onClose={() => setShowSalesContact(false)}
        onResetSubmitted={() => setSalesSubmitted(false)}
      />

      <SecurityModal
        active={activeSecurityFeature}
        onClose={() => setActiveSecurityFeature(null)}
      />

     <LandingNav
      scrollToSection={scrollToSection}
      onLogin={handleStartLogin}
      onGetStarted={handleStartWizard}
    />

    <HeroSection
      onGetStarted={handleStartWizard}
      onWatchDemo={() => setShowDemo(true)}
    />

    <PartnersSection />

    <FeaturesSection
      features={FEATURES}
      onOpenFeature={(feature) => setActiveFeature(feature)}
    />

    <SecuritySection onOpen={(f) => setActiveSecurityFeature(f)} />

    <AISection />

    <CTASection
      onGetStarted={handleStartWizard}
      onContactSales={() => setShowSalesContact(true)}
    />
    </div>
  );
};
