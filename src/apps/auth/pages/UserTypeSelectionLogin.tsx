import React from "react";
import { Link } from "react-router-dom";

function PatientIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none">
      <rect x="14" y="6" width="28" height="40" rx="4" fill="#2F915C" />
      <circle cx="28" cy="20" r="6" fill="white" />
      <path
        d="M20 34c1.8-5 4.8-8 8-8s6.2 3 8 8"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="23.5" y="47" width="9" height="14" rx="2" fill="#2F915C" />
      <path d="M28 50v8" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 54h8" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M45 22h10"
        stroke="#2F915C"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M50 18l6 4-6 4"
        stroke="#2F915C"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProviderIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none">
      <rect x="14" y="10" width="36" height="36" rx="4" fill="#2F915C" />
      <path
        d="M32 19v18"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M23 28h18"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <path
        d="M8 5l7 7-7 7"
        stroke="#2F915C"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FloatingRx() {
  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-[22px] border border-slate-200/70 bg-white/35 shadow-[0_10px_30px_rgba(0,0,0,0.03)] backdrop-blur-[2px]">
      <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
        <path
          d="M18 38h28"
          stroke="#C8CDD4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M22 38c2-10 7-16 10-16s8 6 10 16"
          stroke="#C8CDD4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M20 22l24-8"
          stroke="#C8CDD4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M41 17l5-6"
          stroke="#C8CDD4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="25" y="33" fill="#C8CDD4" fontSize="12" fontWeight="700">
          Rx
        </text>
      </svg>
    </div>
  );
}

function FloatingPlus() {
  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-[22px] border border-slate-200/70 bg-white/35 shadow-[0_10px_30px_rgba(0,0,0,0.03)] backdrop-blur-[2px]">
      <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
        <rect
          x="10"
          y="10"
          width="44"
          height="44"
          rx="10"
          stroke="#C8CDD4"
          strokeWidth="2.5"
        />
        <path
          d="M32 20v24"
          stroke="#C8CDD4"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M20 32h24"
          stroke="#C8CDD4"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function OptionCard({ icon, title, description, link }) {
  return (
    <button
      className="
        relative flex h-[300px] w-[400px] flex-col items-center rounded-[14px]
        border border-[#E7E8EB] bg-[#FBFBFC]
        px-3 pt-9 text-center
        shadow-[0_8px_18px_rgba(0,0,0,0.10),0_2px_5px_rgba(0,0,0,0.06)]
        transition duration-200 hover:-translate-y-0.5
      "
    >
      <div className="mb-5">{icon}</div>

      <h2 className="max-w-[340px] text-[32px] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#062B67]">
        {title}
      </h2>

      <p className="mt-4 max-w-[340px] text-[18px] leading-[1.35] text-[#4B5B77]">
        {description}
      </p>

      <Link to={link} className="absolute font-bold flex text-[#062B67] bottom-10 right-14">
        Go to {title} login page<ArrowIcon />
      </Link>
    </button>
  );
}

export default function UserTypeSelectionLogin() {
  return (
    <div className="min-h-screen w-full bg-[#ECEFF2]">
      <div className="relative mx-auto h-screen min-h-[760px] max-w-[1476px] overflow-hidden bg-[#EEF1F4]">
        {/* Background split */}
        <div className="absolute inset-0 grid grid-cols-[53%_47%]">
          <div className="bg-[#ECEEF1]" />
          <div className="bg-[#F3F5F7]" />
        </div>

        {/* Left background photo */}
        <div
          className="absolute left-0 top-0 h-full w-[100%] bg-cover bg-left-top opacity-[0.22] grayscale"
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: "url('/prelogin.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            // backgroundRepeat: "no-repeat",
          }}
        />

     

        {/* Soft white overlay */}
        <div className="absolute inset-0 bg-white/20" />

        {/* Main content */}
        <div className="relative z-10 flex h-full flex-col items-center">
          <div className="pt-[100px] text-center">
            <h1 className="text-[52px] font-extrabold leading-none tracking-[-0.03em] text-[#062B67]">
              Welcome Back
            </h1>
            <p className="mt-3 text-[22px] font-medium text-[#4E5D75]">
              Please select your user type to login to your Health Vault.
            </p>
          </div>

          <div className="mt-[112px] flex items-start gap-[88px]">
            <OptionCard
              icon={<PatientIcon />}
              title="Patient"
              description="Access and manage your personal health records."
              link="/auth/patient/login"
            />

            <OptionCard
              icon={<ProviderIcon />}
              title={
                <>
                  Healthcare {" "}
                  {/* <br /> */}
                  Provider
                </>
              }
              description="Hospitals, labs, pharmacies, or clinics managing patient data."
              link="/auth/provider/login"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
