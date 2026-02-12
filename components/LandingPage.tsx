import React, { useEffect } from 'react';
import { Icons } from './layout/Icons';
import { AppView } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  
  // Handle scrolling to hash when component mounts (e.g. coming from About Us page)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Small timeout to ensure layout is stable
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const handleLogoClick = () => {
    if (window.location.hash) {
      window.history.pushState("", document.title, window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNavigate(AppView.LANDING);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL without jumping
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-ochre-200 selection:text-ochre-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
              <div className="w-10 h-10 bg-welli-700 rounded-xl flex items-center justify-center shadow-lg shadow-welli-900/10">
                <Icons.Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-stone-900 leading-none">Wellinovate</span>
                <span className="text-[10px] font-bold text-ochre-600 tracking-widest uppercase">Ecosystem</span>
              </div>
            </div>
            {/* Nav Links - Interactive Text Styles */}
            <div className="hidden lg:flex items-center space-x-10 text-sm font-bold text-stone-500">
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="hover:text-welli-700 hover:underline decoration-2 underline-offset-4 transition-all"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('ecosystem')} 
                className="hover:text-welli-700 hover:underline decoration-2 underline-offset-4 transition-all"
              >
                The Network
              </button>
              <button 
                onClick={() => onNavigate(AppView.ABOUT_US)} 
                className="hover:text-welli-700 hover:underline decoration-2 underline-offset-4 transition-all"
              >
                About Us
              </button>
            </div>
            <button 
              onClick={() => onNavigate(AppView.DASHBOARD)}
              className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-welli-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-900/10 flex items-center gap-2"
            >
              Enter Dashboard <Icons.ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden bg-pattern-dots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              {/* Location Badge - Subtle */}
              <div className="flex items-center gap-2 text-ochre-600 font-bold text-xs uppercase tracking-widest mb-6">
                <Icons.MapPin className="w-4 h-4" />
                <span>Live in Lagos, Abuja & Port Harcourt</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-display font-bold text-stone-900 tracking-tight mb-4 leading-[1.05]">
                Quality Healthcare for Everyone
              </h1>
              <h2 className="text-2xl md:text-3xl font-display text-stone-500 font-medium mb-8">
                Anytime. Anywhere. <span className="text-welli-700 font-bold relative inline-block">Intelligent Care.<svg className="absolute w-full h-2 bottom-1 left-0 text-ochre-400 opacity-40" viewBox="0 0 200 9" fill="none"><path d="M2.00025 6.99997C25.7535 2.68603 69.8647 1.45524 102.5 1.50002C130.65 1.53864 167.361 2.50285 198 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>
              </h2>
              
              <p className="text-lg text-stone-600 mb-10 leading-relaxed max-w-lg">
                Connect with doctors in minutes, own your medical records, and earn rewards for staying healthy. We bridge the gap between urban hospitals and rural communities.
              </p>
              
              {/* CTAs - Prioritized */}
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => onNavigate(AppView.DASHBOARD)}
                     className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-3"
                   >
                     <Icons.Stethoscope className="w-5 h-5" />
                     Start Health Assessment
                   </button>
                   <span className="text-xs text-stone-500 font-medium text-center">AI-powered triage. Instant results.</span>
                </div>
                
                <div className="flex flex-col gap-2">
                   <button className="bg-white text-welli-700 border-2 border-welli-100 px-8 py-4 rounded-xl font-bold text-lg hover:bg-welli-50 hover:border-welli-200 transition-all shadow-sm flex items-center justify-center gap-3">
                     <Icons.Smartphone className="w-5 h-5" />
                     Download App
                   </button>
                   <span className="text-xs text-stone-500 font-medium text-center">For iOS & Android.</span>
                </div>
              </div>

              {/* Social Proof - Cleaned */}
              <div className="flex items-center gap-4 text-sm font-medium text-stone-500">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-stone-50 bg-stone-200 overflow-hidden">
                       <img src={`https://picsum.photos/100/100?random=${i+50}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                   <div className="flex text-ochre-500 mb-0.5">
                     <Icons.Star className="w-3.5 h-3.5 fill-current" />
                     <Icons.Star className="w-3.5 h-3.5 fill-current" />
                     <Icons.Star className="w-3.5 h-3.5 fill-current" />
                     <Icons.Star className="w-3.5 h-3.5 fill-current" />
                     <Icons.Star className="w-3.5 h-3.5 fill-current" />
                   </div>
                   <span><strong>2,347</strong> patients helped this week</span>
                </div>
              </div>
            </div>

            {/* Right Visual - Modern App Concept */}
            <div className="relative hidden lg:block h-[600px]">
              {/* Decorative Blobs */}
              <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-ochre-100/50 rounded-full blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-welli-100/40 rounded-full blur-[80px]"></div>

              {/* Floating Element 1: Doctor Call (Behind) */}
              <div className="absolute top-20 left-10 z-10 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 w-64 rotate-[-6deg] animate-pulse" style={{animationDuration: '4s'}}>
                  <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden relative">
                          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80" className="object-cover w-full h-full" alt="Doctor" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                          <div className="text-sm font-bold text-stone-900">Dr. Amina</div>
                          <div className="text-[10px] text-stone-500">Cardiologist • Live</div>
                      </div>
                  </div>
                  <div className="flex gap-2">
                     <div className="h-2 bg-stone-100 rounded-full w-full"></div>
                  </div>
              </div>

              {/* Main Smartphone Interface */}
              <div className="absolute top-0 right-10 z-20 w-[300px] bg-stone-900 rounded-[2.5rem] border-8 border-stone-900 shadow-2xl overflow-hidden rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-900 rounded-b-xl z-20"></div>
                <div className="bg-stone-50 h-[580px] w-full p-4 pt-12 overflow-hidden flex flex-col gap-4">
                   {/* App Header */}
                   <div className="flex justify-between items-center mb-1">
                      <div className="flex gap-2 items-center">
                         <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                           <img src="https://picsum.photos/100/100?random=1" className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <div className="text-[10px] text-stone-500 font-bold">Good Morning</div>
                            <div className="text-sm font-bold text-stone-900">Chioma</div>
                         </div>
                      </div>
                   </div>
                   
                   {/* Balance Card */}
                   <div className="bg-stone-900 rounded-2xl p-4 text-white shadow-lg">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                           <div className="text-xs text-stone-400">WelliWallet</div>
                           <div className="text-xl font-bold">4,250 <span className="text-xs text-ochre-400">WELLI</span></div>
                         </div>
                         <Icons.Wallet className="w-5 h-5 text-welli-400" />
                      </div>
                   </div>

                   {/* AI Assistant Card (New) */}
                   <div className="bg-welli-50 p-4 rounded-2xl border border-welli-100 relative overflow-hidden">
                       <div className="flex items-start gap-3 relative z-10">
                           <div className="p-2 bg-white rounded-lg shadow-sm text-welli-600">
                               <Icons.Stethoscope className="w-5 h-5" />
                           </div>
                           <div>
                               <div className="text-xs font-bold text-welli-900 mb-1">Welli-AI Assistant</div>
                               <div className="text-xs text-welli-700 leading-snug">
                                   "Your heart rate is normal. Would you like to schedule your check-up?"
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* Action Grid */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100">
                         <div className="p-2 bg-stone-50 rounded-lg w-fit mb-2"><Icons.Video className="w-4 h-4 text-stone-600" /></div>
                         <div className="font-bold text-xs">Video Call</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100">
                         <div className="p-2 bg-ochre-50 rounded-lg w-fit mb-2"><Icons.ShoppingBag className="w-4 h-4 text-ochre-600" /></div>
                         <div className="font-bold text-xs">Pharmacy</div>
                      </div>
                   </div>

                   {/* Notifications List */}
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex-1">
                      <div className="font-bold text-sm mb-3 text-stone-900">Recent Activity</div>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 border-b border-stone-50 pb-2">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center"><Icons.Check className="w-4 h-4 text-green-600" /></div>
                            <div>
                               <div className="text-xs font-bold text-stone-800">Lab Results Ready</div>
                               <div className="text-[10px] text-stone-400">Malaria Screen • Negative</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Icons.Truck className="w-4 h-4 text-blue-600" /></div>
                            <div>
                               <div className="text-xs font-bold text-stone-800">Medication Arriving</div>
                               <div className="text-[10px] text-stone-400">Rider is 5 mins away</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Element 2: Vitals (Bottom Left) */}
              <div className="absolute bottom-20 left-0 z-30 bg-white p-3 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                   <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                       <Icons.Heart className="w-5 h-5 text-rose-500" />
                   </div>
                   <div>
                       <div className="text-xs text-stone-400 font-bold uppercase">Heart Rate</div>
                       <div className="text-lg font-bold text-stone-900">72 <span className="text-xs font-normal text-stone-400">BPM</span></div>
                   </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-10 border-y border-stone-200 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Powering Healthcare Across the Continent</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {['Clinix', 'MedPlus', 'HealthConnect', 'LagosState', 'RedCross'].map((brand, i) => (
                  <div key={i} className="flex items-center gap-2 font-display font-bold text-xl text-stone-600 cursor-default">
                     <div className="w-8 h-8 bg-stone-300 rounded-full"></div>
                     {brand}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* How It Works & Two Worlds */}
      <section id="how-it-works" className="py-24 bg-stone-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           
           {/* Steps Header */}
           <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-bold text-welli-600 tracking-wider uppercase text-sm">How It Works</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-900 mt-2 mb-4">Your Journey to Wellness.</h2>
              <p className="text-lg text-stone-600">
                 Complex healthcare, simplified into three steps.
              </p>
           </div>

           {/* 3-Step Process Visualization */}
           <div className="grid md:grid-cols-3 gap-8 mb-24 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-stone-200 z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 text-center group">
                 <div className="w-24 h-24 bg-white rounded-full border-4 border-stone-50 group-hover:border-welli-100 shadow-sm mx-auto flex items-center justify-center mb-6 relative transition-all">
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <Icons.Smartphone className="w-10 h-10 text-stone-400 group-hover:text-stone-900 transition-colors" />
                 </div>
                 <h3 className="text-xl font-bold text-stone-900 mb-2">Connect</h3>
                 <p className="text-stone-500 text-sm px-8">
                    Download the App to create your secure WelliRecord. (Offline support available).
                 </p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 text-center group">
                 <div className="w-24 h-24 bg-white rounded-full border-4 border-stone-50 group-hover:border-welli-100 shadow-sm mx-auto flex items-center justify-center mb-6 relative transition-all">
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-welli-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <Icons.Stethoscope className="w-10 h-10 text-welli-600" />
                 </div>
                 <h3 className="text-xl font-bold text-stone-900 mb-2">Consult</h3>
                 <p className="text-stone-500 text-sm px-8">
                    Chat with our AI Assistant for triage or video call a specialist in minutes.
                 </p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 text-center group">
                 <div className="w-24 h-24 bg-white rounded-full border-4 border-stone-50 group-hover:border-welli-100 shadow-sm mx-auto flex items-center justify-center mb-6 relative transition-all">
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-ochre-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <Icons.Truck className="w-10 h-10 text-ochre-500" />
                 </div>
                 <h3 className="text-xl font-bold text-stone-900 mb-2">Care</h3>
                 <p className="text-stone-500 text-sm px-8">
                    Medications delivered to your doorstep via WakaTask or pickup at a nearby partner.
                 </p>
              </div>
           </div>

           {/* Two Worlds Divider/Header */}
           <div className="text-center max-w-3xl mx-auto mb-12">
               <span className="font-bold text-stone-400 tracking-wider uppercase text-xs">Universal Access</span>
               <h2 className="text-2xl md:text-3xl font-display font-bold text-stone-900 mt-2 mb-4">Two Worlds, One Standard.</h2>
               <p className="text-stone-600">
                  Whether you are in a high-rise in Lagos or a village in Benue, Wellinovate adapts to your reality.
               </p>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              {/* Scenario 1: Urban */}
              <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden group hover:border-welli-200 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icons.Building className="w-32 h-32" />
                 </div>
                 <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold mb-4">THE URBAN EXPERIENCE</span>
                    <h3 className="text-2xl font-bold text-stone-900 mb-4">The Connected Professional</h3>
                    <ul className="space-y-4 text-stone-600 mb-8">
                       <li className="flex items-start gap-3">
                          <Icons.Check className="w-5 h-5 text-welli-600 mt-0.5" />
                          <span>Video calls with specialists in 4K.</span>
                       </li>
                       <li className="flex items-start gap-3">
                          <Icons.Check className="w-5 h-5 text-welli-600 mt-0.5" />
                          <span>Drone delivery of prescriptions in &lt;1hr.</span>
                       </li>
                       <li className="flex items-start gap-3">
                          <Icons.Check className="w-5 h-5 text-welli-600 mt-0.5" />
                          <span>Wearable syncing for heart monitoring.</span>
                       </li>
                    </ul>
                    <div className="h-48 bg-stone-100 rounded-2xl overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Urban Doctor" />
                    </div>
                 </div>
              </div>

              {/* Scenario 2: Rural */}
              <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icons.Globe className="w-32 h-32" />
                 </div>
                 <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-stone-800 text-ochre-400 rounded-lg text-xs font-bold mb-4">THE RURAL EXPERIENCE</span>
                    <h3 className="text-2xl font-bold text-white mb-4">The Remote Community</h3>
                    <ul className="space-y-4 text-stone-300 mb-8">
                       <li className="flex items-start gap-3">
                          <Icons.Check className="w-5 h-5 text-ochre-500 mt-0.5" />
                          <span>Works offline. Data syncs when online.</span>
                       </li>
                       <li className="flex items-start gap-3">
                          <Icons.Check className="w-5 h-5 text-ochre-500 mt-0.5" />
                          <span>SMS & Voice support for feature phones.</span>
                       </li>
                       <li className="flex items-start gap-3">
                          <Icons.Check className="w-5 h-5 text-ochre-500 mt-0.5" />
                          <span>Community Health Workers armed with AI diagnostics.</span>
                       </li>
                    </ul>
                    <div className="h-48 bg-stone-800 rounded-2xl overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Rural Clinic" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 font-mono text-xs text-ochre-400">CONNECTIVITY: 2G/EDGE</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* The Ecosystem (Organized) */}
      <section id="ecosystem" className="py-24 bg-white bg-pattern-geo relative scroll-mt-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-16">
               <span className="font-bold text-welli-700 tracking-wider uppercase text-sm">The 10 Pillars</span>
               <h2 className="text-4xl md:text-5xl font-display font-bold text-stone-900 mt-2">A Complete Health OS.</h2>
               <p className="text-lg text-stone-600 mt-4 max-w-2xl">
                  It's not just an app. It's an economy, a record system, and a logistics network rolled into one.
               </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
               
               {/* Pillar 1: Care (Large) */}
               <div className="md:col-span-8 bg-stone-50 rounded-3xl p-8 border border-stone-200 hover:shadow-lg transition-all group">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                     <div className="flex-1">
                        <div className="w-12 h-12 bg-welli-100 rounded-xl flex items-center justify-center text-welli-700 mb-6">
                           <Icons.Heart className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-2">WelliCare™</h3>
                        <p className="text-stone-600 mb-6">
                           The Super App. Access telemedicine, symptom triage, and appointments in one place.
                        </p>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-stone-500 font-medium">
                           <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-welli-600" /> Virtual Consults</li>
                           <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-welli-600" /> AI Triage</li>
                           <li className="flex gap-2"><Icons.Check className="w-4 h-4 text-welli-600" /> SOS Beacon</li>
                        </ul>
                     </div>
                     <div className="w-full md:w-64 bg-white rounded-2xl p-4 shadow-sm border border-stone-100 rotate-2 group-hover:rotate-0 transition-transform">
                        {/* Mock Chat */}
                        <div className="space-y-2 text-xs">
                           <div className="bg-stone-100 p-2 rounded-lg rounded-bl-none text-stone-600">I have a fever and headache.</div>
                           <div className="bg-welli-600 p-2 rounded-lg rounded-br-none text-white ml-auto w-fit">Based on duration, recommending malaria test.</div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pillar 2: Records (Tall) */}
               <div className="md:col-span-4 bg-stone-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-stone-700 rounded-full blur-[50px] opacity-30"></div>
                  <div className="relative z-10">
                     <div className="w-12 h-12 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-center text-white mb-6">
                        <Icons.FileText className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold mb-2">WelliRecord™</h3>
                     <p className="text-stone-400 text-sm mb-6">
                        Your medical history on the blockchain. You own it. You control who sees it.
                     </p>
                  </div>
                  <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                           <Icons.ShieldCheck className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                           <div className="font-bold text-sm">Access Granted</div>
                           <div className="text-[10px] text-stone-400">Dr. Aminu • Lagos Gen Hospital</div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Pillar 3: Wallet (Medium) */}
               <div className="md:col-span-4 bg-ochre-50 rounded-3xl p-8 border border-ochre-100 hover:border-ochre-300 transition-all">
                  <div className="w-12 h-12 bg-ochre-200 rounded-xl flex items-center justify-center text-ochre-800 mb-6">
                     <Icons.Wallet className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">WelliWallet™</h3>
                  <p className="text-stone-600 text-sm">
                     Healthcare fintech. Pay for care, save for emergencies, and get micro-loans.
                  </p>
               </div>

               {/* Pillar 4: Coin (Medium) */}
               <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-stone-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-amber-500 mb-6">
                     <Icons.Coins className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">WelliCoin™</h3>
                  <p className="text-stone-600 text-sm">
                     Earn by walking, sleeping well, or adhering to meds. Spend on care.
                  </p>
               </div>

               {/* Pillar 5: Market (Medium) */}
               <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-stone-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                     <Icons.ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">WelliMarket™</h3>
                  <p className="text-stone-600 text-sm">
                     Verified medicines & authentic devices delivered to your door.
                  </p>
               </div>

               {/* Infrastructure Strip */}
               <div className="md:col-span-12 bg-stone-100 rounded-3xl p-8 border border-stone-200">
                  <h4 className="font-bold text-stone-500 text-xs uppercase tracking-widest mb-6">Infrastructure Layer</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                     <InfraItem icon={<Icons.Dna />} label="WelliBio" sub="AI Diagnostics" />
                     <InfraItem icon={<Icons.LayoutDashboard />} label="WelliDash" sub="Gov Intel" />
                     <InfraItem icon={<Icons.Cpu />} label="WelliBit" sub="Prediction" />
                     <InfraItem icon={<Icons.Truck />} label="WelliTrack" sub="Logistics" />
                     <InfraItem icon={<Icons.Sprout />} label="WelliRoot" sub="Culture" />
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 bg-stone-900 text-white relative overflow-hidden">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#44403c 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Building the Future of African Health.</h2>
                  <p className="text-stone-400 text-lg mb-8">
                     We measure success not in downloads, but in lives impacted. Our goal is to create a self-sustaining ecosystem that funds itself.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <div className="text-4xl font-bold text-ochre-500 mb-1">100%</div>
                        <div className="text-sm text-stone-400">Data Ownership</div>
                     </div>
                     <div>
                        <div className="text-4xl font-bold text-welli-400 mb-1">&lt;30m</div>
                        <div className="text-sm text-stone-400">Avg. Response Time</div>
                     </div>
                     <div>
                        <div className="text-4xl font-bold text-white mb-1">10+</div>
                        <div className="text-sm text-stone-400">Integrated Modules</div>
                     </div>
                     <div>
                        <div className="text-4xl font-bold text-white mb-1">24/7</div>
                        <div className="text-sm text-stone-400">AI Monitoring</div>
                     </div>
                  </div>
               </div>
               <div className="bg-stone-800 rounded-3xl p-8 border border-stone-700">
                  <h3 className="font-bold text-white mb-6">The "Mega Impact" Goals</h3>
                  <div className="space-y-4">
                     <ImpactRow text="A health identity for every African" />
                     <ImpactRow text="Predictive care acting BEFORE sickness" />
                     <ImpactRow text="Financial safety net for medical bills" />
                     <ImpactRow text="Unified national health dashboard" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials / Voices */}
      <section className="py-24 bg-stone-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-display font-bold text-stone-900 mb-12">Voices from the Network</h2>
            <div className="grid md:grid-cols-3 gap-8">
               <TestimonialCard 
                  quote="Before Wellinovate, I had to travel 4 hours for a checkup. Now, the clinic comes to me via my phone."
                  author="Grace A."
                  role="Teacher, Kaduna"
               />
               <TestimonialCard 
                  quote="WelliRecord allows our hospital to see a patient's history instantly, saving critical time in emergencies."
                  author="Dr. Okafor"
                  role="Chief Surgeon, Lagos"
               />
               <TestimonialCard 
                  quote="Earning WelliCoins for my daily steps pays for my hypertension medication. It's a lifesaver."
                  author="Emmanuel B."
                  role="Small Business Owner"
               />
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white border-t border-stone-200">
         <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-stone-900 mb-6">Ready to take control of your health?</h2>
            <p className="text-xl text-stone-600 mb-10">
               Join thousands of Africans building a healthier future today.
            </p>
            <button 
              onClick={() => onNavigate(AppView.DASHBOARD)}
              className="bg-stone-900 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-welli-700 transition-all shadow-xl hover:scale-105"
            >
              Launch Dashboard
            </button>
         </div>
      </section>

      {/* Redesigned Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
             {/* Brand Column */}
             <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-welli-700 rounded-xl flex items-center justify-center">
                      <Icons.Heart className="w-5 h-5 text-white" />
                   </div>
                   <span className="font-display font-bold text-xl text-white">Wellinovate</span>
                </div>
                <p className="text-sm leading-relaxed mb-6">
                   Africa's first integrated, decentralized, predictive health & wellness network. Building the civilization layer for healthcare.
                </p>
                <div className="flex items-start gap-3 text-sm mb-2">
                   <Icons.MapPin className="w-5 h-5 text-ochre-500 shrink-0" />
                   <span>12 Ozumba Mbadiwe Ave, Victoria Island, Lagos, Nigeria</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <Icons.Mail className="w-5 h-5 text-ochre-500 shrink-0" />
                   <a href="mailto:hello@wellinovate.com" className="hover:text-white transition-colors">hello@wellinovate.com</a>
                </div>
             </div>

             {/* Platform Links */}
             <div>
                <h4 className="font-bold text-white mb-6">Platform</h4>
                <ul className="space-y-4 text-sm">
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">WelliCare™ Telehealth</a></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">WelliRecord™ EHR</a></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">WelliWallet™ Fintech</a></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">WelliMarket™ Store</a></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">WelliBio™ Labs</a></li>
                </ul>
             </div>

             {/* Company & Legal */}
             <div>
                <h4 className="font-bold text-white mb-6">Company</h4>
                <ul className="space-y-4 text-sm">
                   <li><button onClick={() => onNavigate(AppView.ABOUT_US)} className="hover:text-ochre-400 transition-colors">About Us</button></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">Careers</a></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">Partner Program</a></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">Privacy Policy</a></li>
                   <li><a href="#" className="hover:text-ochre-400 transition-colors">Terms of Service</a></li>
                </ul>
             </div>

             {/* Newsletter */}
             <div>
                <h4 className="font-bold text-white mb-6">Stay Updated</h4>
                <p className="text-sm mb-4">Subscribe to our newsletter for health tips and ecosystem updates.</p>
                <div className="flex gap-2">
                   <input type="email" placeholder="Enter your email" className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-welli-500 w-full" />
                   <button className="bg-welli-600 hover:bg-welli-700 text-white rounded-lg px-3 py-2 transition-colors">
                      <Icons.ArrowRight className="w-4 h-4" />
                   </button>
                </div>
                <div className="mt-8">
                   <div className="flex gap-4">
                      <a href="#" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors"><Icons.Twitter className="w-5 h-5 text-white" /></a>
                      <a href="#" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors"><Icons.Linkedin className="w-5 h-5 text-white" /></a>
                      <a href="#" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors"><Icons.Instagram className="w-5 h-5 text-white" /></a>
                      <a href="#" className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors"><Icons.Facebook className="w-5 h-5 text-white" /></a>
                   </div>
                </div>
             </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
             <div>© 2024 Wellinovate Ltd. All rights reserved.</div>
             <div className="flex gap-6">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Systems Operational</span>
                <span>NDPR Compliant</span>
                <span>HIPAA Ready</span>
             </div>
          </div>
        </footer>
    </div>
  );
};

const InfraItem = ({ icon, label, sub }: { icon: any, label: string, sub: string }) => (
   <div className="flex flex-col items-center text-center group cursor-pointer">
      <div className="w-12 h-12 bg-white rounded-2xl border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-welli-600 group-hover:border-welli-200 transition-all mb-3 shadow-sm">
         {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="font-bold text-stone-900 text-sm">{label}</div>
      <div className="text-[10px] text-stone-500 uppercase tracking-wide">{sub}</div>
   </div>
);

const ImpactRow = ({ text }: { text: string }) => (
   <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
      <Icons.Check className="w-5 h-5 text-green-400 flex-shrink-0" />
      <span className="text-stone-300 text-sm font-medium">{text}</span>
   </div>
);

const TestimonialCard = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
   <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm relative">
      <Icons.Quote className="w-8 h-8 text-ochre-200 absolute top-6 left-6" />
      <p className="text-stone-700 italic mb-6 relative z-10 pt-4 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-bold text-stone-500">
            {author.charAt(0)}
         </div>
         <div>
            <div className="font-bold text-stone-900 text-sm">{author}</div>
            <div className="text-xs text-stone-500">{role}</div>
         </div>
      </div>
   </div>
);