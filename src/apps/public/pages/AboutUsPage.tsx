import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Shield, Users, ArrowRight } from "lucide-react";
import { welliIcon } from "@/assets";

export function AboutUsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#071B3F] text-white font-sans antialiased selection:bg-[#1e3a8a] selection:text-white">
      {/* CSS Styles */}
      <style>{`
        .about-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }
        .display-font {
          font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
        }
        .story-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }
        .story-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #60A5FA;
        }
        .highlight-text {
          font-size: 20px;
          line-height: 1.6;
          color: #D7E1F4;
          font-weight: 500;
        }
      `}</style>

      {/* Nav */}
      <header className="border-b border-white/10 bg-[#071B3F]/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={welliIcon} alt="WelliRecord" className="h-8 w-8 object-contain" />
            <span className="display-font font-black text-white text-base tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              Welli<span className="font-normal text-slate-400">Record</span>™
            </span>
          </Link>
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </header>

      <main className="about-container">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#60A5FA] mb-3">Our Mission</p>
          <h1 className="display-font text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
            About Us
          </h1>
          <div className="h-1.5 w-16 bg-[#60A5FA] mx-auto rounded-full" />
        </div>

        <div className="space-y-12">
          {/* Section 1: Intro */}
          <div className="space-y-6">
            <h2 className="display-font text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="text-[#60A5FA] shrink-0" size={24} />
              What is WelliRecord?
            </h2>
            <p className="highlight-text">
              WelliRecord™ is a digital health records platform built in Nigeria. 
              We give every patient one secure record — their diagnoses, medications, 
              allergies, and test results — accessible to any authorised provider, 
              at any facility, with the patient's consent.
            </p>
          </div>

          {/* Section 2: Origin Story */}
          <div className="story-card space-y-6">
            <h2 className="display-font text-2xl font-bold text-white flex items-center gap-3">
              <Heart className="text-[#60A5FA] shrink-0" size={24} />
              How We Started
            </h2>
            <p className="text-slate-300 text-lg leading-8">
              We started with a family emergency. A doctor needed one crucial piece of 
              information — an allergy — and it was visible in seconds. That moment 
              showed us what a record should do: be there when it matters most.
            </p>
          </div>

          {/* Section 3: Today */}
          <div className="space-y-6">
            <h2 className="display-font text-2xl font-bold text-white flex items-center gap-3">
              <Users className="text-[#60A5FA] shrink-0" size={24} />
              WelliRecord Today
            </h2>
            <p className="text-slate-300 text-lg leading-8">
              Today, WelliRecord™ enrolls families through WhatsApp — registration is free, 
              consent comes first, and the patient stays at the centre of their health journey.
            </p>
          </div>

          {/* Core Belief Callout */}
          <div className="border border-white/10 rounded-2xl bg-gradient-to-br from-[#0c2456] to-[#071B3F] p-8 text-center mt-12">
            <p className="display-font text-2xl font-bold tracking-tight text-white sm:text-3xl leading-tight">
              "One patient. One trusted record.<br />
              <span className="text-[#60A5FA]">Accessible when it matters.</span>"
            </p>
          </div>

          {/* Contact Details footer row */}
          <div className="pt-12 border-t border-white/10 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
              <a href="https://www.wellirecord.com" className="hover:text-white transition">www.wellirecord.com</a>
              <span className="hidden sm:inline text-white/20">•</span>
              <a href="tel:08053355504" className="hover:text-white transition">08053355504</a>
              <span className="hidden sm:inline text-white/20">•</span>
              <a href="mailto:inquiry@wellirecord.com" className="hover:text-white transition">inquiry@wellirecord.com</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
