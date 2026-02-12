import React from 'react';
import { Icons } from './layout/Icons';
import { AppView } from '../types';

interface AboutUsProps {
  onNavigate: (view: AppView) => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {

  const handleNavClick = (sectionId?: string) => {
    onNavigate(AppView.LANDING);
    if (sectionId) {
       // Set hash so LandingPage can pick it up
       window.location.hash = sectionId;
    } else {
       // Clear hash if going home
       window.history.pushState("", document.title, window.location.pathname + window.location.search);
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-ochre-200 selection:text-ochre-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => handleNavClick()}
            >
              <div className="w-10 h-10 bg-welli-700 rounded-xl flex items-center justify-center shadow-lg shadow-welli-900/10">
                <Icons.Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-stone-900 leading-none">Wellinovate</span>
                <span className="text-[10px] font-bold text-ochre-600 tracking-widest uppercase">Ecosystem</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-10 text-sm font-bold text-stone-500">
              <button onClick={() => handleNavClick('how-it-works')} className="hover:text-welli-700 transition-all">How It Works</button>
              <button onClick={() => handleNavClick('ecosystem')} className="hover:text-welli-700 transition-all">The Network</button>
              <button className="text-welli-700 underline decoration-2 underline-offset-4">About Us</button>
            </div>
            <button onClick={() => onNavigate(AppView.DASHBOARD)} className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-welli-700 transition-all shadow-xl shadow-stone-900/10 flex items-center gap-2">
               Enter Dashboard <Icons.ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-40 pb-20 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-welli-900 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ochre-900 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-ochre-400 font-bold tracking-widest uppercase text-sm mb-4 block">About Wellinovate Ecosystem</span>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Reimagining Healthcare from the Ground Up.
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
             We are architecting a future where every African can access healthcare that's both intelligent enough to predict their needs and trustworthy enough to protect their dignity.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block p-3 bg-stone-100 rounded-xl mb-6">
                <Icons.Sprout className="w-6 h-6 text-stone-600" />
              </div>
              <h2 className="text-3xl font-display font-bold text-stone-900 mb-6">Born from Necessity, Built on Innovation.</h2>
              <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
                <p>
                  Wellinovate was founded in Nigeria with a simple but radical belief: every African deserves access to trustworthy, intelligent healthcare.
                </p>
                <p>
                  Our journey began when our founder witnessed firsthand how fragmented medical records and systemic inefficiencies turned manageable conditions into life-threatening crises for millions.
                </p>
                <p className="font-medium text-stone-800 border-l-4 border-welli-500 pl-4 italic">
                  We asked a fundamental question: What if we could rebuild Africa's healthcare infrastructure using technologies that guarantee trust while delivering personalized care?
                </p>
              </div>
            </div>
            <div className="relative">
               <div className="absolute -inset-4 bg-ochre-100 rounded-3xl transform rotate-2"></div>
               <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                 <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="African Healthcare Innovation" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Powered Approach */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-display font-bold text-stone-900 mb-4">Our Dual-Powered Approach</h2>
               <p className="text-stone-600">The synergy of unshakeable trust and advanced intelligence.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               {/* The Trust Backbone */}
               <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-ochre-50 rounded-xl flex items-center justify-center text-ochre-600 mb-6">
                     <Icons.ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-4">The Trust Backbone</h3>
                  <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6">Blockchain-Powered Infrastructure</p>
                  
                  <ul className="space-y-4">
                     <ListItem 
                        title="WelliRecord" 
                        desc="Patient-owned health IDs that travel with you across clinics and regions." 
                     />
                     <ListItem 
                        title="Transparent Supply Chains" 
                        desc="Every medication verified from manufacturer to patient." 
                     />
                     <ListItem 
                        title="Smart Contract Funding" 
                        desc="Donor resources that automatically reach verified services." 
                     />
                     <ListItem 
                        title="WelliCoin Economy" 
                        desc="A fair reward system for healthy behaviors." 
                     />
                  </ul>
               </div>

               {/* The Intelligent Brain */}
               <div className="bg-stone-900 text-white p-8 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-welli-900 rounded-full blur-[60px] opacity-40"></div>
                  <div className="relative z-10">
                     <div className="w-12 h-12 bg-welli-900/50 border border-welli-700/50 rounded-xl flex items-center justify-center text-welli-400 mb-6">
                        <Icons.Cpu className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold mb-4">The Intelligent Brain</h3>
                     <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6">AI-Powered Care Delivery</p>
                     
                     <ul className="space-y-4">
                        <ListItemDark 
                           title="AI Health Assistants" 
                           desc="24/7 medical guidance via WhatsApp and USSD." 
                        />
                        <ListItemDark 
                           title="Predictive Health Analytics" 
                           desc="Early detection of disease risks and outbreaks." 
                        />
                        <ListItemDark 
                           title="Personalized Care Plans" 
                           desc="Treatment tailored to your genetics, lifestyle, and environment." 
                        />
                        <ListItemDark 
                           title="Clinical Decision Support" 
                           desc="AI tools that augment healthcare workers' expertise." 
                        />
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Ecosystem Solutions */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-stone-900 mb-12 text-center">Our Ecosystem of Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <SolutionCard 
                  icon={<Icons.Heart />} 
                  title="WelliCare" 
                  desc="Our flagship platform connecting patients with seamless healthcare experiences through mobile clinics and telemedicine." 
                  color="bg-welli-50 text-welli-700"
               />
               <SolutionCard 
                  icon={<Icons.FileText />} 
                  title="WelliRecord" 
                  desc="Africa's first patient-controlled health record system, giving individuals ownership of their history." 
                  color="bg-ochre-50 text-ochre-700"
               />
               <SolutionCard 
                  icon={<Icons.FlaskConical />} 
                  title="WelliLabs" 
                  desc="R&D pioneering context-aware health technologies designed for African infrastructure challenges." 
                  color="bg-purple-50 text-purple-700"
               />
               <SolutionCard 
                  icon={<Icons.Coins />} 
                  title="WelliCoin" 
                  desc="The utility token that powers our health economy, rewarding preventive care and affordable services." 
                  color="bg-stone-100 text-stone-700"
               />
            </div>
         </div>
      </section>

      {/* Guiding Principles */}
      <section className="py-24 bg-stone-900 text-white relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl font-display font-bold mb-16 text-center">Our Guiding Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <PrincipleCard 
                  num="01" 
                  title="Patient-First Always" 
                  desc="We believe healthcare should center around individuals, not institutions. Patients own their data, control their choices, and direct their care journey."
               />
               <PrincipleCard 
                  num="02" 
                  title="Build for the Last Mile" 
                  desc="Our solutions work with feature phones, low bandwidth, and intermittent electricity—because healthcare shouldn't require perfect infrastructure."
               />
               <PrincipleCard 
                  num="03" 
                  title="Trust Through Transparency" 
                  desc="Every pill, every record, every dollar must be verifiable. We use blockchain not as buzzword, but as bedrock principle."
               />
               <PrincipleCard 
                  num="04" 
                  title="Intelligence with Context" 
                  desc="Our AI understands Nigerian languages, cultural contexts, and local health challenges—making global technology locally relevant."
               />
               <PrincipleCard 
                  num="05" 
                  title="Community as Catalyst" 
                  desc="We don't just build for communities; we build with them. Traditional healers, market women, and religious leaders are co-creators."
               />
            </div>
         </div>
      </section>

      {/* Team & Join */}
      <section className="py-24 bg-stone-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-20 text-center max-w-3xl mx-auto">
               <h2 className="text-3xl font-display font-bold text-stone-900 mb-6">The Team Behind the Vision</h2>
               <p className="text-lg text-stone-600 mb-8">
                  We're a diverse collective of Healthcare Professionals, Blockchain Architects, AI Engineers, and Community Organizers united by the conviction that technology's highest purpose is healing.
               </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100">
               <h3 className="text-2xl font-bold text-stone-900 mb-10 text-center">Join Our Movement</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <JoinCard title="For Patients" desc="Experience healthcare that respects your time." link="Get Started" onNavigate={() => onNavigate(AppView.DASHBOARD)} />
                  <JoinCard title="For Providers" desc="Amplify your impact with smarter tools." link="Partner With Us" />
                  <JoinCard title="For Developers" desc="Build the future of African health tech." link="Explore Careers" />
                  <JoinCard title="For Investors" desc="Support scalable solutions with impact." link="Investment Thesis" />
               </div>
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-stone-900 text-stone-400 border-t border-stone-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-8">Contact Us</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                     <Icons.MapPin className="w-5 h-5 text-ochre-500" />
                  </div>
                  <p className="text-sm">15A Bourdillon Road,<br/>Ikoyi, Lagos, Nigeria</p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                     <Icons.Mail className="w-5 h-5 text-ochre-500" />
                  </div>
                  <p className="text-sm">info@wellinovate.com</p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                     <Icons.Phone className="w-5 h-5 text-ochre-500" />
                  </div>
                  <p className="text-sm">+234 805 333 5504</p>
               </div>
            </div>
            <div className="max-w-2xl mx-auto pt-10 border-t border-stone-800">
               <p className="italic text-lg text-stone-500 font-serif">
                  "We're not just building another health tech company. We're architecting a future where every African can access healthcare that's both intelligent enough to predict their needs and trustworthy enough to protect their dignity."
               </p>
               <p className="mt-4 font-bold text-stone-300">— The WelliNovate Team</p>
            </div>
         </div>
      </section>
      
      {/* Reused Footer from Landing */}
      <footer className="bg-stone-950 text-stone-500 py-8 border-t border-stone-900 text-center text-sm">
         <p>© 2024 Wellinovate Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
};

const ListItem = ({ title, desc }: { title: string, desc: string }) => (
   <li className="flex items-start gap-3">
      <Icons.Check className="w-5 h-5 text-ochre-500 mt-0.5 flex-shrink-0" />
      <div>
         <strong className="text-stone-900 block">{title}</strong>
         <span className="text-stone-600">{desc}</span>
      </div>
   </li>
);

const ListItemDark = ({ title, desc }: { title: string, desc: string }) => (
   <li className="flex items-start gap-3">
      <Icons.Check className="w-5 h-5 text-welli-400 mt-0.5 flex-shrink-0" />
      <div>
         <strong className="text-white block">{title}</strong>
         <span className="text-stone-400">{desc}</span>
      </div>
   </li>
);

const SolutionCard = ({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
   <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-welli-200 hover:shadow-lg transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
         {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{desc}</p>
   </div>
);

const PrincipleCard = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
   <div className="p-6 rounded-2xl bg-stone-800 border border-stone-700 hover:bg-stone-700 transition-colors">
      <div className="text-4xl font-display font-bold text-stone-700 mb-4">{num}</div>
      <h3 className="font-bold text-white mb-3 text-lg">{title}</h3>
      <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
   </div>
);

const JoinCard = ({ title, desc, link, onNavigate }: { title: string, desc: string, link: string, onNavigate?: () => void }) => (
   <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col justify-between h-full">
      <div>
         <h4 className="font-bold text-stone-900 mb-2">{title}</h4>
         <p className="text-sm text-stone-600 mb-6">{desc}</p>
      </div>
      <button onClick={onNavigate} className="text-sm font-bold text-welli-700 hover:text-welli-800 flex items-center gap-1 group">
         {link} <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
   </div>
);