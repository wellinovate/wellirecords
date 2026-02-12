import { useState } from "react";

export function useOnboardingUI() {
  const [showWizard, setShowWizard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showSalesContact, setShowSalesContact] = useState(false);

  const [activeFeature, setActiveFeature] = useState<any>(null);
  const [activeSecurityFeature, setActiveSecurityFeature] = useState<
    "certificate" | "whitepaper" | "network" | null
  >(null);

  const startWizard = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowWizard(true);
    setShowLogin(false);
    setShowSalesContact(false);
    setActiveFeature(null);
    setActiveSecurityFeature(null);
  };

  const startLogin = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowLogin(true);
    setShowWizard(false);
    setShowSalesContact(false);
    setActiveFeature(null);
    setActiveSecurityFeature(null);
  };

  return {
    showWizard,
    showLogin,
    showDemo,
    showSalesContact,
    activeFeature,
    activeSecurityFeature,

    setShowWizard,
    setShowLogin,
    setShowDemo,
    setShowSalesContact,
    setActiveFeature,
    setActiveSecurityFeature,

    startWizard,
    startLogin,
  };
}
