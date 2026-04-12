import { phone } from "@/assets";
import { useAuth } from "@/shared/auth/AuthProvider";
import { ArrowLeft, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { apiUrl } from "@/shared/api/authApi";
import Cookies from "js-cookie";

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <label className="text-[18px] font-medium text-[#0A2F6B]">
          {label}
        </label>

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="text-[15px] text-[#0A2F6B]"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="AFRTT6Ygytn56’;."
        className="w-full h-[46px] px-4 rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] text-[16px] outline-none focus:bg-white"
      />
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-[18px] font-medium text-[#0A2F6B]">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-[46px] px-4 rounded-lg border border-[#D7D7D7] bg-[#F8F8F8] text-[16px] outline-none focus:bg-white"
      />
    </div>
  );
}

export function PatientLoginPage() {
  const { signIn, setUser } = useAuth();
  const navigate = useNavigate();

  const [profileType, setProfileType] = useState("Personal");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log("🚀 ~ PatientLoginPage ~ googleClientId:", googleClientId);

  const update =
    (key: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

const isFormValid =
  isEmailValid && form.password.trim() !== "";


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const user = await signIn(form.email, form.password);
      console.log("🚀 ~ handleSubmit ~ user:", user);

      if (!user) {
        setError("Invalid email or password. Try again");
        return;
      }

      toast.success("Login successful");
      localStorage.setItem("activeProfileType", profileType);

      if (user?.data?.account?.accountType === "user") {
        navigate("/patient/overview");
      } else {
        navigate("/provider/overview");
      }
    } catch (error: any) {
      if (error?.message?.includes("timeout")) {
        toast.error("Request took too long. Check your connection.");
      } else {
        toast.error(
          error?.message ===
            "Cannot read properties of undefined (reading 'data')"
            ? "Something went wrong. Try again."
            : error?.message,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");

      console.log("🚀 ~ handleGoogleCredential ~ apiUrl:", apiUrl);
      const res = await axios.post(`${apiUrl}/api/v1/auth/google/login`, {
        credential: response.credential,
        profileType,
      });

      const data = res.data;
      console.log("🚀 ~ handleGoogleCredential ~ data:", data);
      Cookies.set("accessToken", data.token, {
        expires: 1, // days
        secure: true, // only over HTTPS (important in prod)
        sameSite: "lax",
      });

      localStorage.setItem(
        "ui_user",
        JSON.stringify({
          id: data.user.id,
          accountType: data.user.accountType,
        }),
      );

      const userstored = localStorage.getItem("ui_user");
      const storedUser = userstored ? JSON.parse(userstored) : null;
      setUser?.(storedUser);
      toast.success("Google sign-in successful");

      if (data?.user?.accountType === "user") {
        navigate("/patient/overview");
      } else {
        navigate("/provider/overview");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Google sign-in failed",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) {
      console.error("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript && window.google && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      googleBtnRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 460,
      });

      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-gsi-script";

    script.onload = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      googleBtnRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 460,
      });
    };

    document.head.appendChild(script);
  }, [googleClientId]);

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="relative w-full h-screen max-w-full border border-gray-200">
        <div className="mb-4 absolute top-4 left-1 md:top-10 md:left-20 z-50 bg-gray-100 px-5 rounded-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#062B67] hover:opacity-70 transition"
          >
            <ArrowLeft size={26} />
            <span className="text-sm md:text-lg font-bold">Back</span>
          </button>
        </div>

        <div className="flex h-full px-1">
          <div className="hidden md:block relative w-full flex-1 overflow-hidden bg-[#E8EDF2]">
            <img
              src={phone}
              alt="Phone UI"
              className="w-full h-full object-cover"
            />
            <div className="top-0 left-0 w-full h-[4px] bg-[#2F915C]" />
          </div>

          <div className="bg-[#F3F4F5] flex w-full flex-1 items-start justify-center px-3  ">
            <div className="w-full max-w-[460px] mt-[70px]">
              <h1 className=" text-[34px] md:text-[44px] font-extrabold text-center text-[#062B67]">
                Welcome Back!
              </h1>

              <form onSubmit={handleSubmit} className="mt-12 space-y-8">
                <TextInput
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  value={form.email}
                  onChange={update("email")}
                />
           

<PasswordInput
  label="Password"
  value={form.password}
  onChange={update("password")}
/>



                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {error}
                  </div>
                )}

                <div className="text-right text-[14px] text-gray-500">
                  Forgot Password?
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading || !isFormValid}
                  className={`w-full h-[46px] flex justify-center items-center gap-2 text-white rounded-md text-[18px] font-semibold transition
  ${
    loading || googleLoading || !isFormValid
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#2F915C] hover:brightness-95"
  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-300"></div>
                  <span className="text-gray-500 text-[14px]">Or</span>
                  <div className="h-px flex-1 bg-gray-300"></div>
                </div>

                <div className="w-[90%] mx-auto flex justify-center">
                  {googleLoading ? (
                    <div className="flex items-center gap-2 text-[16px] text-[#173A71]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in with Google...
                    </div>
                  ) : (
                    <div ref={googleBtnRef} />
                  )}
                </div>

                {/* <div className="text-center text-[15px] text-[#333]">
                  Connect Wallet (Web3 Access)
                </div> */}

                <div className="text-center text-[15px] text-gray-500">
                  Don’t have an account?{" "}
                  <Link
                    to="/auth/patient/signup"
                    className="text-[#137742] font-bold cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
