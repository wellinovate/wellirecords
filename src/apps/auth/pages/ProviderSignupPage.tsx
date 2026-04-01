import { WelliRecordLogo } from "@/shared/ui/WelliRecordLogo";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/shared/auth/AuthProvider";
import { doctorsignup } from "@/assets";

const ORG_TYPE_OPTIONS = [
  { value: "", label: "Select organization type", disabled: true },
  { value: "healthcare_provider", label: "Hospital / Clinic" },
  { value: "diagnostic", label: "Diagnostic Lab" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "telehealth", label: "Telehealth Platform" },
  { value: "insurance", label: "Insurance Provider" },
  { value: "ngo", label: "NGO" },
  { value: "government", label: "Government / Ministry" },
  { value: "healthtech", label: "HealthTech Company" },
  { value: "vendor", label: "Medical / Device Vendor" },
  { value: "other", label: "Other" },
];

const PROVIDER_ROLE_OPTIONS = [
  { value: "", label: "Select provider role", disabled: true },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "caregiver", label: "Caregiver" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "lab_scientist", label: "Lab Scientist" },
  { value: "therapist", label: "Therapist" },
  { value: "provider", label: "Other Provider" },
];

const COUNTRY_OPTIONS = [
  { value: "", label: "Select country", disabled: true },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "Kenya", label: "Kenya" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
];

type SignupTab = "organization" | "individual";

type OrganizationForm = {
  organizationName: string;
  organizationType: string;
  workEmail: string;
  phone: string;
  contactPersonName: string;
  contactPersonRole: string;
  country: string;
  state: string;
  city: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
};

type IndividualForm = {
  fullName: string;
  providerRole: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
};

function FormInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  showToggle = false,
  error,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showToggle?: boolean;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[13px] md:text-[15px] font-medium leading-none text-[#0A2F6B]">
          {label}
        </label>

        {showToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-[14px] md:text-[15px] font-medium text-[#0A2F6B]"
          >
            {visible ? "Hide" : "Show"}
          </button>
        ) : (
          <span />
        )}
      </div>

      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-[39px] w-full rounded-[9px] border bg-[#F8F8F8] px-4 text-[16px] md:text-[17px] text-[#384152] outline-none focus:bg-white ${
          error ? "border-red-400" : "border-[#D7D7D7] focus:border-[#BFC9D8]"
        }`}
      />

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
}) {
  return (
    <div className="w-full">
      <div className="mb-2">
        <label className="text-[13px] md:text-[15px] font-medium leading-none text-[#333B4C]">
          {label}
        </label>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`h-[38px] w-full appearance-none rounded-[7px] border bg-[#F8F8F8] px-4 pr-12 text-[14px] md:text-[17px] text-[#384152] outline-none focus:bg-white ${
            error ? "border-red-400" : "border-[#BFC9D8]"
          }`}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="#3B4658"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <path
        d="M21.35 12.23c0-.72-.06-1.25-.2-1.8H12v3.41h5.37c-.11.85-.74 2.13-2.13 2.99l-.02.11 3.1 2.4.21.02c1.92-1.77 3.02-4.37 3.02-7.13Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.37l-3.07-2.38c-.82.57-1.91.97-3.38.97-2.57 0-4.75-1.69-5.52-4.02l-.1.01-3.23 2.49-.03.1C4.71 19.72 8.08 21.75 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.48 13.95A5.98 5.98 0 0 1 6.16 12c0-.68.12-1.34.31-1.95l-.01-.13-3.26-2.53-.11.05A9.7 9.7 0 0 0 2 12c0 1.57.37 3.05 1.03 4.38l3.45-2.43Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.03c1.85 0 3.1.8 3.81 1.46l2.78-2.71C16.83 3.16 14.63 2.25 12 2.25 8.08 2.25 4.71 4.28 3.12 7.45l3.38 2.61C7.25 7.72 9.43 6.03 12 6.03Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function ProviderSignupPage() {
  const { signUpProvider } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SignupTab>("organization");
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [organizationForm, setOrganizationForm] = useState<OrganizationForm>({
    organizationName: "",
    organizationType: "",
    workEmail: "",
    phone: "",
    contactPersonName: "",
    contactPersonRole: "",
    country: "Nigeria",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [individualForm, setIndividualForm] = useState<IndividualForm>({
    fullName: "",
    providerRole: "",
    email: "",
    phone: "",
    country: "Nigeria",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [orgErrors, setOrgErrors] = useState<Record<string, string>>({});
  const [individualErrors, setIndividualErrors] = useState<Record<string, string>>({});

  const updateOrganization =
    (key: keyof OrganizationForm) =>
    (
      e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
    ) => {
      const value =
        key === "agree" && "checked" in e.target
          ? e.target.checked
          : e.target.value;

      setOrganizationForm((prev) => ({
        ...prev,
        [key]: value,
      }));

      setOrgErrors((prev) => ({ ...prev, [key]: "" }));
      setGeneralError("");
    };

  const updateIndividual =
    (key: keyof IndividualForm) =>
    (
      e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
    ) => {
      const value =
        key === "agree" && "checked" in e.target
          ? e.target.checked
          : e.target.value;

      setIndividualForm((prev) => ({
        ...prev,
        [key]: value,
      }));

      setIndividualErrors((prev) => ({ ...prev, [key]: "" }));
      setGeneralError("");
    };

  const validateOrganization = () => {
    const errors: Record<string, string> = {};

    if (!organizationForm.organizationName.trim()) {
      errors.organizationName = "Organization name is required";
    }
    if (!organizationForm.organizationType) {
      errors.organizationType = "Organization type is required";
    }
    if (!organizationForm.workEmail.trim()) {
      errors.workEmail = "Work email is required";
    }
    if (!organizationForm.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    if (!organizationForm.contactPersonName.trim()) {
      errors.contactPersonName = "Contact person name is required";
    }
    if (!organizationForm.contactPersonRole.trim()) {
      errors.contactPersonRole = "Contact person role is required";
    }
    if (!organizationForm.country.trim()) {
      errors.country = "Country is required";
    }
    if (!organizationForm.state.trim()) {
      errors.state = "State is required";
    }
    if (!organizationForm.city.trim()) {
      errors.city = "City is required";
    }
    if (!organizationForm.password.trim()) {
      errors.password = "Password is required";
    } else if (organizationForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!organizationForm.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (organizationForm.password !== organizationForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!organizationForm.agree) {
      errors.agree = "You must agree to the Terms and Privacy Policy";
    }

    setOrgErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateIndividual = () => {
    const errors: Record<string, string> = {};

    if (!individualForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!individualForm.providerRole) {
      errors.providerRole = "Provider role is required";
    }
    if (!individualForm.email.trim()) {
      errors.email = "Email is required";
    }
    if (!individualForm.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    if (!individualForm.country.trim()) {
      errors.country = "Country is required";
    }
    if (!individualForm.state.trim()) {
      errors.state = "State is required";
    }
    if (!individualForm.city.trim()) {
      errors.city = "City is required";
    }
    if (!individualForm.password.trim()) {
      errors.password = "Password is required";
    } else if (individualForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!individualForm.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (individualForm.password !== individualForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!individualForm.agree) {
      errors.agree = "You must agree to the Terms and Privacy Policy";
    }

    setIndividualErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateOrganization()) return;

    setLoading(true);
    try {
      const payload = {
        accountType: "organization",
        organizationName: organizationForm.organizationName,
        organizationType: organizationForm.organizationType,
        email: organizationForm.workEmail,
        phone: organizationForm.phone,
        country: organizationForm.country,
        state: organizationForm.state,
        city: organizationForm.city,
        contactPersonName: organizationForm.contactPersonName,
        contactPersonRole: organizationForm.contactPersonRole,
        password: organizationForm.password,
      };

      console.log("Organization signup payload:", payload);

      // Replace this with a dedicated backend function later
      const resp = await signUpProvider(payload);

      if (resp === "Account created successfully") {
        navigate("/auth/login");
      }
    } catch (error: any) {
      console.log("Organization signup error:", error);
      setGeneralError(
        error?.response?.data?.message || "Unable to create organization account",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateIndividual()) return;

    setLoading(true);
    try {
      const payload = {
        accountType: "user",
        role: individualForm.providerRole,
        fullName: individualForm.fullName,
        email: individualForm.email,
        phone: individualForm.phone,
        country: individualForm.country,
        state: individualForm.state,
        city: individualForm.city,
        password: individualForm.password,
      };

      console.log("Individual provider signup payload:", payload);

      // Replace this with a dedicated backend function later
      const resp = await signUpProvider(
        individualForm.providerRole,
        individualForm.fullName,
        individualForm.email,
        individualForm.phone,
        individualForm.country,
        individualForm.password,
      );

      if (resp === "Account created successfully") {
        navigate("/auth/provider/login");
      }
    } catch (error: any) {
      console.log("Individual provider signup error:", error);
      setGeneralError(
        error?.response?.data?.message ||
          "Unable to create individual provider account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative mx-auto min-h-screen max-w-full overflow-hidden border border-[#DDDDDD] bg-white">
        <div className="absolute top-5 z-50 rounded-lg bg-gray-100 px-5 md:left-20 md:top-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#062B67] transition hover:opacity-70"
          >
            <ArrowLeft size={26} />
            <span className="text-sm font-bold md:text-lg">Back</span>
          </button>
        </div>

        <div className="flex min-h-screen">
          <div className="relative hidden overflow-hidden bg-[#DDE5EE] md:block md:w-[45%]">
            <img
              src={doctorsignup}
              alt="Healthcare professional"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.00)_72%,rgba(221,229,238,0.22)_100%)]" />
          </div>

          <div className="overflow-y-auto bg-[#F3F4F5] pt-5 md:w-[55%]">
            <div className="mx-auto flex w-full max-w-[720px] flex-col px-5 pb-14 pt-[4px] md:px-[82px]">
              {/* <div className="mb-3 flex justify-center">
                <WelliRecordLogo />
              </div> */}

              <div className="text-center">
                <h1 className="text-[22px] font-extrabold leading-[1.08] text-[#062B67] md:text-[36px] md:tracking-[-0.03em]">
                  Join WelliRecord
                </h1>
                <p className="mt-2 text-[15px] text-[#4A5870] md:text-[16px]">
                  Choose how you want to register
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("organization");
                      setGeneralError("");
                    }}
                    className={`h-[30px] rounded-xl text-[14px] md:text-[16px] font-semibold transition ${
                      activeTab === "organization"
                        ? "bg-[#062B67] text-white"
                        : "bg-[#F3F4F5] text-[#24416D]"
                    }`}
                  >
                    Organization
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("individual");
                      setGeneralError("");
                    }}
                    className={`h-[30px] rounded-xl text-[14px] md:text-[16px] font-semibold transition ${
                      activeTab === "individual"
                        ? "bg-[#062B67] text-white"
                        : "bg-[#F3F4F5] text-[#24416D]"
                    }`}
                  >
                    Individual Provider
                  </button>
                </div>
              </div>

              {generalError ? (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {generalError}
                </div>
              ) : null}

              {activeTab === "organization" ? (
                <form onSubmit={handleOrganizationSubmit} className="mt-8 space-y-6">
                  <FormInput
                    label="Organization Name"
                    placeholder="Example: WelliCare Hospital"
                    value={organizationForm.organizationName}
                    onChange={updateOrganization("organizationName")}
                    error={orgErrors.organizationName}
                  />

                  <FormSelect
                    label="Organization Type"
                    value={organizationForm.organizationType}
                    onChange={updateOrganization("organizationType")}
                    options={ORG_TYPE_OPTIONS}
                    error={orgErrors.organizationType}
                  />

                  <FormInput
                    label="Work Email"
                    placeholder="admin@hospital.com"
                    type="email"
                    value={organizationForm.workEmail}
                    onChange={updateOrganization("workEmail")}
                    error={orgErrors.workEmail}
                  />

                  <FormInput
                    label="Phone Number"
                    placeholder="+234 800 000 0000"
                    value={organizationForm.phone}
                    onChange={updateOrganization("phone")}
                    error={orgErrors.phone}
                  />

                  <FormInput
                    label="Contact Person Name"
                    placeholder="Example: Dr. John Doe"
                    value={organizationForm.contactPersonName}
                    onChange={updateOrganization("contactPersonName")}
                    error={orgErrors.contactPersonName}
                  />

                  <FormInput
                    label="Contact Person Role"
                    placeholder="Example: Medical Director"
                    value={organizationForm.contactPersonRole}
                    onChange={updateOrganization("contactPersonRole")}
                    error={orgErrors.contactPersonRole}
                  />

                  <FormSelect
                    label="Country"
                    value={organizationForm.country}
                    onChange={updateOrganization("country")}
                    options={COUNTRY_OPTIONS}
                    error={orgErrors.country}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormInput
                      label="State"
                      placeholder="Example: FCT Abuja"
                      value={organizationForm.state}
                      onChange={updateOrganization("state")}
                      error={orgErrors.state}
                    />

                    <FormInput
                      label="City"
                      placeholder="Example: Abuja"
                      value={organizationForm.city}
                      onChange={updateOrganization("city")}
                      error={orgErrors.city}
                    />
                  </div>

                  <FormInput
                    label="Create Password"
                    placeholder="Minimum 8 characters"
                    value={organizationForm.password}
                    onChange={updateOrganization("password")}
                    showToggle
                    error={orgErrors.password}
                  />

                  <FormInput
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={organizationForm.confirmPassword}
                    onChange={updateOrganization("confirmPassword")}
                    showToggle
                    error={orgErrors.confirmPassword}
                  />

                  <div className="pt-1">
                    <label className="flex items-start gap-3 text-[15px] leading-[1.4] text-[#173A71]">
                      <input
                        type="checkbox"
                        checked={organizationForm.agree}
                        onChange={updateOrganization("agree")}
                        className="mt-1 h-[18px] w-[18px] rounded border border-[#C6CEDA] accent-[#2F915C]"
                      />
                      <span>
                        By continuing, you agree to our Terms of Service and Privacy
                        Policy.
                      </span>
                    </label>
                    {orgErrors.agree ? (
                      <p className="mt-2 text-sm text-red-500">{orgErrors.agree}</p>
                    ) : null}
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-[46px] min-w-[220px] items-center justify-center rounded-[8px] bg-[#2F915C] px-8 text-[16px] font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Creating account..." : "Register Organization"}
                    </button>
                  </div>

                  <p className="text-center text-[15px] font-bold text-[#023520]">
                    Organization accounts may be reviewed before full activation.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleIndividualSubmit} className="mt-8 space-y-6">
                  <FormInput
                    label="Full Name"
                    placeholder="Example: Dr. Jane Doe"
                    value={individualForm.fullName}
                    onChange={updateIndividual("fullName")}
                    error={individualErrors.fullName}
                  />

                  <FormSelect
                    label="Provider Role"
                    value={individualForm.providerRole}
                    onChange={updateIndividual("providerRole")}
                    options={PROVIDER_ROLE_OPTIONS}
                    error={individualErrors.providerRole}
                  />

                  <FormInput
                    label="Email"
                    placeholder="janedoe@email.com"
                    type="email"
                    value={individualForm.email}
                    onChange={updateIndividual("email")}
                    error={individualErrors.email}
                  />

                  <FormInput
                    label="Phone Number"
                    placeholder="+234 800 000 0000"
                    value={individualForm.phone}
                    onChange={updateIndividual("phone")}
                    error={individualErrors.phone}
                  />

                  <FormSelect
                    label="Country"
                    value={individualForm.country}
                    onChange={updateIndividual("country")}
                    options={COUNTRY_OPTIONS}
                    error={individualErrors.country}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormInput
                      label="State"
                      placeholder="Example: Lagos"
                      value={individualForm.state}
                      onChange={updateIndividual("state")}
                      error={individualErrors.state}
                    />

                    <FormInput
                      label="City"
                      placeholder="Example: Ikeja"
                      value={individualForm.city}
                      onChange={updateIndividual("city")}
                      error={individualErrors.city}
                    />
                  </div>

                  <FormInput
                    label="Create Password"
                    placeholder="Minimum 8 characters"
                    value={individualForm.password}
                    onChange={updateIndividual("password")}
                    showToggle
                    error={individualErrors.password}
                  />

                  <FormInput
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={individualForm.confirmPassword}
                    onChange={updateIndividual("confirmPassword")}
                    showToggle
                    error={individualErrors.confirmPassword}
                  />

                  <div className="pt-1">
                    <label className="flex items-start gap-3 text-[15px] leading-[1.4] text-[#173A71]">
                      <input
                        type="checkbox"
                        checked={individualForm.agree}
                        onChange={updateIndividual("agree")}
                        className="mt-1 h-[18px] w-[18px] rounded border border-[#C6CEDA] accent-[#2F915C]"
                      />
                      <span>
                        By continuing, you agree to our Terms of Service and Privacy
                        Policy.
                      </span>
                    </label>
                    {individualErrors.agree ? (
                      <p className="mt-2 text-sm text-red-500">
                        {individualErrors.agree}
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-[46px] min-w-[220px] items-center justify-center rounded-[8px] bg-[#2F915C] px-8 text-[16px] font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Creating account..." : "Register Provider"}
                    </button>
                  </div>

                  <p className="text-center text-[15px] text-[#32445B]">
                    Individual provider accounts may require verification later.
                  </p>
                </form>
              )}

              <div className="mt-10">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-[84px] bg-[#D9D9D9]" />
                  <span className="text-[15px] text-[#4D4D4D]">Or</span>
                  <div className="h-px w-[84px] bg-[#D9D9D9]" />
                </div>

                

                <div className="mt-6 text-center text-[15px] text-[#5E5E5E]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/provider/login")}
                    className="text-[#2F915C] underline underline-offset-2"
                  >
                    Log in
                  </button>
                </div>
              </div>
            </div>

            <div className="h-[8px] w-full bg-[#1B0D2A]" />
          </div>
        </div>
      </div>
    </div>
  );
}