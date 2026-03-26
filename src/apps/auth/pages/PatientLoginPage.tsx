import { phone } from "@/assets";
import { useAuth } from "@/shared/auth/AuthProvider";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PasswordInput({ label, value, onChange }) {
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

function TextInput({ label, placeholder, value, onChange }) {
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.72-.06-1.25-.2-1.8H12v3.41h5.37
        c-.11.85-.74 2.13-2.13 2.99l-.02.11
        3.1 2.4.21.02c1.92-1.77 3.02-4.37
        3.02-7.13z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87
        6.45-2.37l-3.07-2.38
        c-.82.57-1.91.97-3.38.97
        -2.57 0-4.75-1.69-5.52-4.02
        l-.1.01-3.23 2.49-.03.1
        C4.71 19.72 8.08 21.75 12 21.75z"
      />
      <path
        fill="#FBBC05"
        d="M6.48 13.95A5.98 5.98 0 0 1
        6.16 12c0-.68.12-1.34.31-1.95
        l-.01-.13-3.26-2.53-.11.05
        A9.7 9.7 0 0 0 2 12
        c0 1.57.37 3.05 1.03 4.38l3.45-2.43z"
      />
      <path
        fill="#EA4335"
        d="M12 6.03c1.85 0 3.1.8
        3.81 1.46l2.78-2.71
        C16.83 3.16 14.63 2.25
        12 2.25 8.08 2.25
        4.71 4.28 3.12 7.45
        l3.38 2.61C7.25 7.72
        9.43 6.03 12 6.03z"
      />
    </svg>
  );
}

export function PatientLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [profileType, setProfileType] = useState("Personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Access Restrictions based on Profile Type ---
    if (profileType === "Child") {
      setError(
        "Restricted Access: Child records cannot log in independently. A parent or guardian must log in via a Personal or Family profile to access dependants.",
      );
      return;
    }

    console.log("🚀 ~ handleSubmit ~ form?.email:", form?.email);
    // Proceed with login...
    setLoading(true);
    setError("");
    const user = await signIn(form?.email, form?.password);
    console.log("🚀 ~ handleSubmit ~ user:", user);
    setLoading(false);
    if (!user) {
      setError("Invalid email or password. try again");
      return;
    }
    localStorage.setItem("activeProfileType", profileType);
    if (user?.data?.account?.accountType === "user") {
      
      navigate("/patient/overview");
    } else {
      navigate("/provider/overview");
    }
    // if (!user.roles?.includes("patient")) {
    //   setError("This account is not a patient account.");
    //   return;
    // }

    // Pass the profile type to state so we know what mode they logged in as
  };

  //   const handleWeb3 = () => {
  //     setWeb3Loading(true);
  //     setTimeout(() => {
  //       signInAsRole("patient");
  //       navigate("/patient/overview");
  //     }, 1400);
  //   };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full h-screen max-w-full border border-gray-200">
          <div className="mb-4 absolute top-10 left-20 z-50 bg-gray-100 px-5 rounded-lg">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#062B67] hover:opacity-70 transition"
              >
                <ArrowLeft size={36} className="  "/>
                <span className="text-sm md:text-lg  font-bold">Back</span>
              </button>
            </div>
        <div className="flex h-full px-1  ">
          {/* LEFT IMAGE PANEL */}
          <div className="hidden md:block relative w-full flex-1 overflow-hidden bg-[#E8EDF2]">
            
            <img
              src={phone}
              alt="Phone UI"
              className="  w-ful h-full object-cover"
            />

            <div className=" top-0 left-0 w-full h-[4px] bg-[#2F915C]" />
          </div>

          {/* RIGHT LOGIN PANEL */}
          <div className="bg-[#F3F4F5] flex w-full flex-1 items-start justify-center px-3">
            <div className="w-full max-w-[460px] mt-[70px]">
              <h1 className="text-[44px] font-extrabold text-center text-[#062B67]">
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

                <div className="text-right text-[14px] text-gray-500">
                  Forgot Password?
                </div>

                <button
                  type="submit"
                  className="w-full h-[46px] bg-[#2F915C] text-white rounded-md text-[18px] font-semibold hover:brightness-95 transition"
                >
                  {loading ? "Signing in..." : " Log In"}
                </button>

                {/* divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-300"></div>
                  <span className="text-gray-500 text-[14px]">Or</span>
                  <div className="h-px flex-1 bg-gray-300"></div>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 text-[16px] text-[#173A71]"
                >
                  <GoogleIcon />
                  Sign In
                </button>

                <div className="text-center text-[15px] text-[#333]">
                  Connect Wallet (Web3 Access)
                </div>

                <div className="text-center text-[15px] text-gray-500">
                  Don’t have an account?{" "}
                  <span className="text-[#2F915C] cursor-pointer">Sign Up</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
