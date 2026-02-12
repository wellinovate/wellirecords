import React, { useState } from 'react';
import { Icons } from './layout/Icons';
import { DashboardModule, AppView } from '../types';
import { AIHealthAssistant } from './Dashboard/AIHealthAssistant';
import { WalletComponent } from './Dashboard/Wallet';
import { MarketComponent } from './Dashboard/Market';
import { RecordsComponent } from './Dashboard/Records';
import { WelliBitComponent } from './Dashboard/WelliBit';
import { WelliBioComponent } from './Dashboard/WelliBio';
import { WelliRootComponent } from './Dashboard/WelliRoot';
import { WelliTrackComponent } from './Dashboard/WelliTrack';

interface NavGroupProps {
  label: string;
  children?: React.ReactNode;
}

const NavGroup: React.FC<NavGroupProps> = ({ label, children }) => (
  <div className="mb-6">
    <div className="px-3 mb-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
      {label}
    </div>
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
      active 
        ? 'bg-welli-50 text-welli-700' 
        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
    }`}
  >
    <div className={`${active ? 'text-welli-600' : 'text-stone-400'}`}>
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
    </div>
    <span>{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-welli-500"></div>}
  </button>
);

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  status: string;
  statusColor: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, status, statusColor, icon }) => (
   <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
         <div className="p-1.5 bg-stone-50 rounded-lg">{icon}</div>
         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{status}</span>
      </div>
      <div>
         <p className="text-xs text-stone-500 font-medium mb-1">{label}</p>
         <p className="text-xl font-bold text-stone-900">{value} <span className="text-xs font-normal text-stone-400">{unit}</span></p>
      </div>
   </div>
);

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, label, onClick, color }) => (
   <button 
      onClick={onClick}
      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all h-28 hover:scale-[1.02] active:scale-95 shadow-sm ${color}`}
   >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 24 }) : icon}
      <span className="text-xs font-bold">{label}</span>
   </button>
);

const HomeSummary = ({ onNavigate }: { onNavigate: (module: DashboardModule) => void }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
    
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-2xl font-display font-bold text-stone-900">Good Afternoon, John</h1>
        <p className="text-stone-500 text-sm mt-1">Here is your daily health briefing.</p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Date</p>
        <p className="text-sm font-bold text-stone-700">Oct 26, 2023</p>
      </div>
    </div>

    {/* ZONE 1: Critical Alerts / Daily Briefing */}
    <div className="space-y-3">
       <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2 px-1">
         <Icons.Clock className="w-3 h-3" /> Time Sensitive
       </h2>
       
       <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-100">
          {/* Item 1: Medication */}
          <div className="flex-1 p-5 flex items-start gap-4 hover:bg-stone-50 transition-colors">
             <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                <Icons.Pill className="w-5 h-5" />
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h3 className="text-sm font-bold text-stone-900">Medication Due</h3>
                   <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">In 2 hrs</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Amoxicillin (500mg) • Take with food</p>
                <div className="mt-3">
                   <button className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                      Mark as Taken <Icons.ChevronRight className="w-3 h-3" />
                   </button>
                </div>
             </div>
          </div>

          {/* Item 2: Appointment */}
          <div className="flex-1 p-5 flex items-start gap-4 hover:bg-stone-50 transition-colors">
             <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                <Icons.Calendar className="w-5 h-5" />
             </div>
             <div className="flex-1">
                 <div className="flex justify-between items-start">
                   <h3 className="text-sm font-bold text-stone-900">Appointment</h3>
                   <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Tomorrow</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Dr. Aminu • General Practice</p>
                <div className="mt-3">
                   <button className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                      View Details <Icons.ChevronRight className="w-3 h-3" />
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>

    {/* ZONE 2: Vitals Snapshot */}
    <div className="space-y-3">
       <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
            <Icons.Activity className="w-3 h-3" /> Health Status
          </h2>
          <button 
             onClick={() => onNavigate(DashboardModule.WELLIBIT)}
             className="text-xs font-bold text-welli-600 hover:text-welli-700 flex items-center gap-1 hover:underline decoration-2"
          >
             Full Vitals <Icons.ChevronRight className="w-3 h-3" />
          </button>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
             label="WelliScore" 
             value="86" 
             unit="/100" 
             status="Good" 
             statusColor="text-green-700 bg-green-50 border border-green-100"
             icon={<Icons.Award className="w-4 h-4 text-welli-600" />}
          />
          <MetricCard 
             label="Heart Rate" 
             value="72" 
             unit="bpm" 
             status="Normal" 
             statusColor="text-stone-600 bg-stone-100 border border-stone-200"
             icon={<Icons.Heart className="w-4 h-4 text-rose-500" />}
          />
           <MetricCard 
             label="Blood Pressure" 
             value="120/80" 
             unit="mmHg" 
             status="Optimal" 
             statusColor="text-green-700 bg-green-50 border border-green-100"
             icon={<Icons.Activity className="w-4 h-4 text-blue-500" />}
          />
           <MetricCard 
             label="Stress Level" 
             value="Low" 
             unit="" 
             status="Stable" 
             statusColor="text-stone-600 bg-stone-100 border border-stone-200"
             icon={<Icons.Zap className="w-4 h-4 text-amber-500" />}
          />
       </div>
    </div>

    {/* ZONE 3: Care Services (Quick Actions) */}
    <div className="space-y-3">
       <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2 px-1">
         <Icons.Zap className="w-3 h-3" /> Quick Actions
       </h2>
       
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard 
             onClick={() => onNavigate(DashboardModule.AI_TRIAGE)}
             icon={<Icons.Stethoscope />}
             label="Check Symptoms"
             color="bg-welli-50 text-welli-700 hover:bg-welli-100 border-welli-200"
          />
          <ActionCard 
             onClick={() => onNavigate(DashboardModule.MARKET)}
             icon={<Icons.ShoppingBag />}
             label="Order Medicine"
             color="bg-white text-stone-600 hover:bg-stone-50 border-stone-200"
          />
          <ActionCard 
             onClick={() => onNavigate(DashboardModule.WELLIBIO)}
             icon={<Icons.FlaskConical />}
             label="Book Lab Test"
             color="bg-white text-stone-600 hover:bg-stone-50 border-stone-200"
          />
          <ActionCard 
             onClick={() => onNavigate(DashboardModule.RECORDS)}
             icon={<Icons.ShieldCheck />}
             label="Share Records"
             color="bg-white text-stone-600 hover:bg-stone-50 border-stone-200"
          />
       </div>
    </div>

    {/* ZONE 4: Secondary Info (Wallet) */}
    <div className="pt-6 border-t border-stone-200">
       <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2 px-1 mb-3">
         <Icons.Wallet className="w-3 h-3" /> Ecosystem Status
       </h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div 
           onClick={() => onNavigate(DashboardModule.WALLET)}
           className="flex items-center justify-between p-4 bg-stone-900 rounded-xl text-white cursor-pointer hover:bg-stone-800 transition-all border border-stone-700"
         >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
                  <Icons.Wallet className="w-5 h-5 text-welli-400" />
               </div>
               <div>
                  <p className="text-xs text-stone-400 font-medium">Wallet Balance</p>
                  <p className="text-lg font-bold">4,250 <span className="text-xs font-normal text-stone-500">WELLI</span></p>
               </div>
            </div>
            <Icons.ChevronRight className="w-5 h-5 text-stone-600" />
         </div>

         <div 
           onClick={() => onNavigate(DashboardModule.WELLITRACK)}
           className="flex items-center justify-between p-4 bg-white rounded-xl text-stone-900 cursor-pointer hover:bg-stone-50 transition-all border border-stone-200"
         >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                  <Icons.Truck className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-xs text-stone-500 font-medium">Active Order</p>
                  <p className="text-sm font-bold">Pharmacy Delivery <span className="text-xs font-normal text-stone-400">• Arriving soon</span></p>
               </div>
            </div>
            <Icons.ChevronRight className="w-5 h-5 text-stone-400" />
         </div>
       </div>
    </div>

  </div>
);

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activeModule, setActiveModule] = useState<DashboardModule>(DashboardModule.HOME);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeModule) {
      case DashboardModule.AI_TRIAGE:
        return <AIHealthAssistant />;
      case DashboardModule.WALLET:
        return <WalletComponent />;
      case DashboardModule.MARKET:
        return <MarketComponent />;
      case DashboardModule.RECORDS:
        return <RecordsComponent />;
      case DashboardModule.WELLIBIT:
        return <WelliBitComponent />;
      case DashboardModule.WELLIBIO:
        return <WelliBioComponent />;
      case DashboardModule.WELLIROOT:
        return <WelliRootComponent />;
      case DashboardModule.WELLITRACK:
        return <WelliTrackComponent />;
      case DashboardModule.HOME:
      default:
        return <HomeSummary onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-stone-200 z-20 shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onNavigate(AppView.LANDING)}
            title="Back to Website"
          >
            <div className="w-9 h-9 bg-welli-600 rounded-xl flex items-center justify-center shadow-lg shadow-welli-600/20 group-hover:scale-105 transition-transform">
              <Icons.Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900 leading-none">Wellinovate</h1>
              <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase mt-0.5">Patient Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          
          <NavGroup label="My Health">
            <NavItem 
              icon={<Icons.LayoutDashboard />} 
              label="Overview" 
              active={activeModule === DashboardModule.HOME}
              onClick={() => setActiveModule(DashboardModule.HOME)} 
            />
            <NavItem 
              icon={<Icons.FileText />} 
              label="Medical Records" 
              active={activeModule === DashboardModule.RECORDS}
              onClick={() => setActiveModule(DashboardModule.RECORDS)} 
            />
             <NavItem 
              icon={<Icons.Activity />} 
              label="Vitals & Monitoring" 
              active={activeModule === DashboardModule.WELLIBIT}
              onClick={() => setActiveModule(DashboardModule.WELLIBIT)} 
            />
            <NavItem 
              icon={<Icons.Dna />} 
              label="Lab Results" 
              active={activeModule === DashboardModule.WELLIBIO}
              onClick={() => setActiveModule(DashboardModule.WELLIBIO)} 
            />
          </NavGroup>

          <NavGroup label="Care Services">
             <NavItem 
              icon={<Icons.Stethoscope />} 
              label="AI Assistant" 
              active={activeModule === DashboardModule.AI_TRIAGE}
              onClick={() => setActiveModule(DashboardModule.AI_TRIAGE)} 
            />
            <NavItem 
              icon={<Icons.ShoppingBag />} 
              label="Pharmacy" 
              active={activeModule === DashboardModule.MARKET}
              onClick={() => setActiveModule(DashboardModule.MARKET)} 
            />
             <NavItem 
              icon={<Icons.Truck />} 
              label="Track Orders" 
              active={activeModule === DashboardModule.WELLITRACK}
              onClick={() => setActiveModule(DashboardModule.WELLITRACK)} 
            />
          </NavGroup>

          <NavGroup label="Account">
            <NavItem 
              icon={<Icons.Wallet />} 
              label="Wallet" 
              active={activeModule === DashboardModule.WALLET}
              onClick={() => setActiveModule(DashboardModule.WALLET)} 
            />
             <NavItem 
              icon={<Icons.Sprout />} 
              label="Rewards & Lifestyle" 
              active={activeModule === DashboardModule.WELLIROOT}
              onClick={() => setActiveModule(DashboardModule.WELLIROOT)} 
            />
          </NavGroup>

        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer mb-2">
            <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 border border-stone-200">
              JD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-stone-900">John Doe</p>
              <p className="text-[10px] text-stone-500 truncate">ID: 849201</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate(AppView.LANDING)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Icons.LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-stone-50 relative">
        
        {/* Header */}
        <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-6 z-10 sticky top-0">
           <div className="md:hidden flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)}>
                 <Icons.Menu className="w-6 h-6 text-stone-600" />
              </button>
              <span 
                className="font-bold text-stone-900 cursor-pointer" 
                onClick={() => onNavigate(AppView.LANDING)}
                title="Back to Website"
              >
                Wellinovate
              </span>
           </div>

           <div className="hidden md:block">
              {/* Optional: Breadcrumb */}
           </div>

           <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 text-stone-400 hover:text-stone-600 transition-colors">
                 <Icons.Bell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
           </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-stone-900/50 backdrop-blur-sm">
             <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-xl text-stone-900">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-stone-100 rounded-lg">
                    <Icons.X className="w-5 h-5" />
                  </button>
               </div>
               <nav className="space-y-2 flex-1 overflow-y-auto">
                  <button onClick={() => { setActiveModule(DashboardModule.HOME); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg font-medium text-stone-600 hover:bg-stone-50">Overview</button>
                  <button onClick={() => { setActiveModule(DashboardModule.AI_TRIAGE); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg font-medium text-stone-600 hover:bg-stone-50">AI Assistant</button>
                  <button onClick={() => { setActiveModule(DashboardModule.RECORDS); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg font-medium text-stone-600 hover:bg-stone-50">Records</button>
                  <button onClick={() => { setActiveModule(DashboardModule.WALLET); setMobileMenuOpen(false); }} className="w-full text-left p-3 rounded-lg font-medium text-stone-600 hover:bg-stone-50">Wallet</button>
                  <div className="h-px bg-stone-100 my-2"></div>
                  <button onClick={() => { onNavigate(AppView.LANDING); }} className="w-full text-left p-3 rounded-lg font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                    <Icons.LogOut className="w-4 h-4" /> Sign Out
                  </button>
               </nav>
             </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </div>

        {/* Persistent FAB SOS Button - Always accessible */}
        <button className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-50 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-2xl shadow-rose-900/30 flex items-center gap-3 py-3 px-6 transition-all hover:scale-105 active:scale-95 group border-4 border-white animate-in slide-in-from-right-10 duration-700">
            <div className="bg-white/20 p-1.5 rounded-full animate-pulse">
                <Icons.AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-start">
                <span className="font-bold text-lg leading-none">SOS</span>
                <span className="text-[10px] font-bold text-rose-100 uppercase tracking-wider">Emergency</span>
            </div>
        </button>

      </main>
    </div>
  );
};