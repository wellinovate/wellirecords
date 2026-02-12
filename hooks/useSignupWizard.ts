// src/hooks/useSignupWizard.ts
import { SignupPayload, signupUser } from "@/services/authApi";
import { useCallback, useMemo, useState } from "react";

type Errors = Record<"name" | "email" | "phone" | "password" | "nin", string>;
type Touched = Record<keyof Errors, boolean>;

export function useSignupWizard(onComplete: (userData: any) => void) {
  const [wizardStep, setWizardStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState<SignupPayload>({
    name: "",
    email: "",
    phone: "",
    password: "",
    nin: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Errors>({
    name: "",
    email: "",
    phone: "",
    password: "",
    nin: "",
  });

  const [touched, setTouched] = useState<Touched>({
    name: false,
    email: false,
    phone: false,
    password: false,
    nin: false,
  });

  const validateField = useCallback((name: keyof Errors, value: string) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Full Name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email address";
        break;
      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^\+?[\d\s-()]{10,}$/.test(value)) error = "Invalid phone number (min 10 digits)";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be at least 8 characters";
        break;
      case "nin":
        if (!value.trim()) error = "NIN is required";
        else if (!/^\d{11}$/.test(value)) error = "NIN must be exactly 11 digits";
        break;
    }
    return error;
  }, []);

  const reset = useCallback(() => {
    setWizardStep(0);
    setOtp("");
    setLoading(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      nin: "",
      agreeToTerms: false,
    });
    setErrors({ name: "", email: "", phone: "", password: "", nin: "" });
    setTouched({ name: false, email: false, phone: false, password: false, nin: false });
  }, []);

  const isFormValid = useMemo(() => {
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
  }, [errors, formData]);

  const handleInputChange = useCallback(
    (name: keyof SignupPayload, value: string | boolean) => {
      // NIN numbers only
      if (name === "nin" && typeof value === "string" && !/^\d*$/.test(value)) return;

      setFormData((prev) => ({ ...prev, [name]: value } as SignupPayload));

      if (name in touched && touched[name as keyof Touched] && typeof value === "string") {
        const err = validateField(name as keyof Errors, value);
        setErrors((prev) => ({ ...prev, [name]: err } as Errors));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof Errors) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const err = validateField(name, formData[name] ?? "");
      setErrors((prev) => ({ ...prev, [name]: err }));
    },
    [formData, validateField]
  );

  // Standard signup: Step 1 -> Step 2
  const goStandardStep1Next = useCallback(() => {
    const nextErrors: Errors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      password: validateField("password", formData.password),
      nin: "",
    };
    setErrors(nextErrors);
    setTouched((p) => ({ ...p, name: true, email: true, phone: true, password: true }));

    if (Object.values(nextErrors).some(Boolean)) return;
    setWizardStep(2);
  }, [formData, validateField]);

  const submitNin = useCallback(async () => {
    const ninError = validateField("nin", formData.nin);
    if (ninError) {
      setErrors((prev) => ({ ...prev, nin: ninError }));
      setTouched((prev) => ({ ...prev, nin: true }));
      return;
    }

    setLoading(true);
    // simulate verification + sending otp
    setTimeout(() => {
      setLoading(false);
      setWizardStep(3);
    }, 1500);
  }, [formData.nin, validateField]);

  const verifySignupOtp = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setWizardStep(4);
    }, 1000);
  }, []);

  const finalSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await signupUser(formData);
      if (res.status === 201) onComplete(formData);
      else alert("Registration failed, try again");
    } catch (e) {
      alert("Registration failed, try again");
    } finally {
      setLoading(false);
    }
  }, [formData, onComplete]);

  return {
    wizardStep,
    setWizardStep,
    loading,
    otp,
    setOtp,
    formData,
    errors,
    touched,
    isFormValid,
    reset,
    handleInputChange,
    handleBlur,

    // actions
    goStandardStep1Next,
    submitNin,
    verifySignupOtp,
    finalSubmit,
  };
}
