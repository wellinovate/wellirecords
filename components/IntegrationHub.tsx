import React, { useState } from 'react';
import { Shield, Smartphone, CreditCard, Building2, Pill, QrCode, CheckCircle, Wifi, WifiOff, RefreshCw, Link as LinkIcon, Search, Coins, Activity, Globe, Printer, Download, Share2, Fingerprint, Lock, Copy, MapPin, Navigation, Star, Clock, Phone, Loader2, AlertCircle, Info, HeartPulse, UserCheck } from 'lucide-react';
import { findMedicalPlaces } from '../services/geminiService';
import { MapPlace } from '../types';

type Tab = 'identity' | 'providers' | 'pharmacy';

export const IntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  // Pharmacy Search State
  const [pharmacies, setPharmacies] = useState<MapPlace[]>([]);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
  const [showPharmacyList, setShowPharmacyList] = useState(false);
  const [pharmacyError, setPharmacyError] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF or Image
    alert("Downloading secure WelliCard PDF...");
  };

  const handleFindPharmacies = () => {
    setShowPharmacyList(true);
    setIsLoadingPharmacies(true);
    setPharmacyError(null);
    setPharmacies([]);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const result = await findMedicalPlaces(
                    "Pharmacies open now", 
                    position.coords.latitude, 
                    position.coords.longitude
                );
                setPharmacies(result.places);
            } catch (error) {
                console.error("Failed to find pharmacies", error);
                setPharmacyError("Unable to fetch pharmacy data at this time.");
            } finally {
                setIsLoadingPharmacies(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error.message);
            let errorMessage = "Unable to access your location.";
            if (error.code === 1) errorMessage = "Location permission denied. Please allow location access.";
            else if (error.code === 2) errorMessage = "Location information is unavailable.";
            else if (error.code === 3) errorMessage = "Location request timed out.";
            
            setPharmacyError(errorMessage);
            setIsLoadingPharmacies(false);
        });
    } else {
        setIsLoadingPharmacies(false);
        setPharmacyError("Geolocation is not supported by this browser.");
    }
  };

  const PARTNER_PHARMACIES = [
      { name: "HealthPlus Pharmacy", discount: "up to 20%" },
      { name: "Medplus Pharmacy", discount: "Preferred" },
      { name: "Alpha Pharmacy", discount: "Accepted" },
      { name: "Nett Pharmacy", discount: "Value Network" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 print:max-w-none print:p-0 animate-in fade-in duration-500">
      
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Globe className="text-blue-500" /> WelliCare Ecosystem
          </h2>
          <p className="text-slate-500">Manage your digital health identity, providers, and rewards.</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2 text-xs font-mono text-slate-400">
                 <div className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></div>
                 {isOfflineMode ? 'OFFLINE MODE' : 'NETWORK ACTIVE'}
             </div>
             <button 
                onClick={() => setIsOfflineMode(!isOfflineMode)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                title="Toggle Network Simulation"
             >
                 {isOfflineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
             </button>
        </div>
      </div>

      {/* Improved Tab Navigation */}
      <div className="border-b border-slate-800 print:hidden">
         <div className="flex gap-8">
            <button
                onClick={() => setActiveTab('identity')}
                className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'identity' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                <Shield size={16} /> ID Card & Rewards
            </button>
            <button
                onClick={() => setActiveTab('providers')}
                className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'providers' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                <Building2 size={16} /> Provider Network
            </button>
            <button
                onClick={() => setActiveTab('pharmacy')}
                className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'pharmacy' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                <Pill size={16} /> Pharmacy
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div>
        {/* === IDENTITY TAB === */}
        {activeTab === 'identity' && (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Health Card Section */}
            <div className="lg:col-span-7 space-y-6">
               <div className="flex items-center justify-between print:hidden">
                   <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">Universal Health Credential</h3>
                   <div className="flex gap-2">
                       <button onClick={handlePrint} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" title="Print Card">
                           <Printer size={18} />
                       </button>
                       <button onClick={handleDownload} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" title="Download PDF">
                           <Download size={18} />
                       </button>
                   </div>
               </div>

               {/* HEALTH CARD VISUALIZATION */}
               <div className="relative group perspective-1000 print:perspective-none">
                  {/* Card Container */}
                  <div className={`relative w-full aspect-[1.586/1] transition-all duration-700 preserve-3d shadow-2xl rounded-2xl ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                      
                      {/* FRONT OF CARD */}
                      <div 
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="absolute inset-0 w-full h-full backface-hidden bg-slate-50 rounded-2xl overflow-hidden cursor-pointer print:border-slate-400 shadow-xl"
                      >
                          {/* Top Band */}
                          <div className="h-16 bg-blue-600 flex items-center justify-between px-6">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 relative shrink-0">
                                     <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow">
                                        <path d="M50 95C50 95 85 78.4 85 45V18L50 5L15 18V45C15 78.4 50 95 50 95Z" fill="white" fillOpacity="0.2" />
                                        <path d="M50 25V65M30 45H70" stroke="white" strokeWidth="8" strokeLinecap="round" />
                                     </svg>
                                  </div>
                                  <span className="text-white font-bold tracking-tight text-lg">WelliRecord</span>
                              </div>
                              <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Universal Health ID</div>
                          </div>

                          {/* Card Body */}
                          <div className="p-6 h-[calc(100%-4rem)] relative">
                              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                  <Shield size={140} className="text-blue-900" />
                              </div>

                              <div className="flex justify-between h-full">
                                  <div className="flex flex-col justify-between">
                                      <div>
                                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Patient Name</div>
                                          <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">JANE DOE</h2>
                                          
                                          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                              <div>
                                                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Member ID</div>
                                                  <div className="font-mono text-base font-semibold text-slate-700">WR-8921-XKA9-22</div>
                                              </div>
                                              <div>
                                                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Date of Birth</div>
                                                  <div className="text-sm font-semibold text-slate-700">12/04/1985</div>
                                              </div>
                                              <div>
                                                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Plan Type</div>
                                                  <div className="text-sm font-semibold text-slate-700">Sovereign / PPO</div>
                                              </div>
                                              <div>
                                                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Issued</div>
                                                  <div className="text-sm font-semibold text-slate-700">05/2024</div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                          Powered by WelliCare Blockchain Network
                                      </div>
                                  </div>

                                  <div className="flex flex-col justify-end items-end gap-2">
                                      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                                          <QrCode className="text-slate-900" size={64} />
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-mono">Scan for Vitals</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* BACK OF CARD */}
                      <div 
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-100 rounded-2xl overflow-hidden cursor-pointer flex flex-col shadow-xl print:hidden text-slate-700"
                      >
                           <div className="h-10 bg-slate-300 w-full mt-6 mb-4"></div>
                           <div className="px-6 flex-1">
                               <h3 className="text-xs font-bold uppercase text-slate-900 mb-2">Emergency Provider Instructions</h3>
                               <p className="text-[10px] leading-relaxed mb-4">
                                   This cardholder authorizes emergency medical treatment. Scan the QR code on the front to access critical health data including allergies, current medications, and blood type. Access is logged immutably.
                               </p>
                               <div className="grid grid-cols-2 gap-4 text-[10px]">
                                   <div>
                                       <span className="block font-bold">Provider Support</span>
                                       <span>1-800-WELLI-MD</span>
                                   </div>
                                   <div>
                                       <span className="block font-bold">Pharmacist Help</span>
                                       <span>1-800-WELLI-RX</span>
                                   </div>
                               </div>
                           </div>
                           <div className="p-4 bg-slate-200 border-t border-slate-300 flex justify-between items-center text-[10px]">
                               <span>return@wellicare.com</span>
                               <span className="font-bold">Not a credit card</span>
                           </div>
                      </div>
                  </div>
               </div>

               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-start gap-3 text-xs text-slate-400 print:hidden">
                   <Shield size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                   <p>
                       This credential serves as your universal health passport. It contains no financial data and is strictly for medical identification and interoperability.
                   </p>
               </div>
            </div>

            {/* Care Rewards & Balance - Distinctly Separated */}
            <div className="lg:col-span-5 space-y-6 print:hidden">
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm h-full flex flex-col">
                    <div className="mb-6 pb-6 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-100 flex items-center gap-2">
                                <HeartPulse className="text-rose-500" /> Care Balance
                            </h3>
                            <div className="group relative">
                                <Info size={16} className="text-slate-500 cursor-help" />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 text-slate-300 text-xs p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-slate-700">
                                    Credits earned by completing health goals. Use for premium features or copay discounts.
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex items-center justify-between">
                             <div>
                                 <div className="text-3xl font-bold text-white mb-1">500</div>
                                 <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Health Points</div>
                             </div>
                             <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                                 <Activity size={20} />
                             </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Activity</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                        <UserCheck size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-200">Identity Verified</div>
                                        <div className="text-xs text-slate-500">Completed setup</div>
                                    </div>
                                </div>
                                <span className="text-emerald-400 font-bold text-sm">+500</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
                                        <Smartphone size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-300">Device Sync</div>
                                        <div className="text-xs text-slate-500">Connect a wearable</div>
                                    </div>
                                </div>
                                <span className="text-slate-500 font-bold text-sm">--</span>
                            </div>
                        </div>
                    </div>
                    
                    <button className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors border border-slate-700">
                        Redeem for Premium Services
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* === PROVIDERS TAB === */}
        {activeTab === 'providers' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                     <div className="flex-1 relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                         <input 
                            type="text" 
                            placeholder="Search clinics, hospitals by name or ID..." 
                            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                         />
                     </div>
                     <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors">
                         Connect Provider
                     </button>
                 </div>

                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Connected Institutions</h3>
                 <div className="space-y-3">
                     {[
                         { name: 'Lagoon Hospitals', type: 'Hospital', id: 'CGH-9921', status: 'Connected', sync: 'Auto-Sync (FHIR)' },
                         { name: 'Dr. Sarah Chen Family Practice', type: 'Clinic', id: 'DSC-8821', status: 'Connected', sync: 'Manual Approval' }
                     ].map((provider, i) => (
                         <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-colors group">
                             <div className="flex items-start gap-4 mb-3 md:mb-0">
                                 <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                                     <Building2 size={24} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-200">{provider.name}</h4>
                                     <div className="flex items-center gap-2 text-xs text-slate-500">
                                         <span className="bg-slate-800 px-1.5 py-0.5 rounded">{provider.type}</span>
                                         <span className="font-mono">ID: {provider.id}</span>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                 <div className="text-right">
                                     <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-end">
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {provider.status}
                                     </div>
                                     <div className="text-[10px] text-slate-500 mt-1">{provider.sync}</div>
                                 </div>
                                 <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                                     <RefreshCw size={16} />
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             <div className="bg-indigo-900/10 border border-indigo-900/30 p-4 rounded-xl flex items-start gap-3">
                 <Activity className="text-indigo-400 shrink-0 mt-1" size={20} />
                 <div>
                     <h4 className="font-bold text-indigo-300 text-sm">Wearable Integration (WelliBit)</h4>
                     <p className="text-xs text-slate-400 mt-1 mb-2">Sync data from Apple Health, Google Fit, and Fitbit directly to your record.</p>
                     <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                         Manage Devices
                     </button>
                 </div>
             </div>
          </div>
        )}

        {/* === PHARMACY TAB === */}
        {activeTab === 'pharmacy' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
              <div className="grid md:grid-cols-3 gap-6">
                  {/* Status Card */}
                  <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800">
                      <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                          <Pill className="text-purple-400" /> Active Prescriptions
                      </h3>
                      
                      <div className="space-y-4">
                          {[
                              { drug: 'Amoxicillin 500mg', doctor: 'Dr. Sarah Chen', date: 'May 10, 2024', status: 'Ready for Pickup', pharmacy: 'HealthPlus Pharmacy', ref: 'RX-992-AA' },
                              { drug: 'Lisinopril 10mg', doctor: 'City Cardiology', date: 'May 01, 2024', status: 'Dispensed', pharmacy: 'Medplus Pharmacy', ref: 'RX-881-BB' }
                          ].map((rx, i) => (
                              <div key={i} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-2">
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${rx.status === 'Ready for Pickup' ? 'bg-purple-900/20 text-purple-300 border border-purple-900/30' : 'bg-slate-800 text-slate-500'}`}>
                                          {rx.status}
                                      </span>
                                  </div>
                                  <div className="flex gap-4">
                                      <div className="w-10 h-10 rounded-full bg-purple-900/20 flex items-center justify-center text-purple-400">
                                          <LinkIcon size={18} />
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-200">{rx.drug}</h4>
                                          <p className="text-xs text-slate-500">Prescribed by {rx.doctor}</p>
                                          
                                          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                                              <span className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">Pharmacy: {rx.pharmacy}</span>
                                              <span className="bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800 font-mono">Ref: {rx.ref}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Network Info */}
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                      <h3 className="font-bold text-slate-100 mb-2">Pharmacy Finder</h3>
                      <p className="text-xs text-slate-400 mb-6">Locate verified pharmacies in your area.</p>
                      
                      <div className="mt-auto space-y-4">
                           {/* Partner Directories List */}
                           <div>
                               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Partner Directories</h4>
                               <div className="grid grid-cols-1 gap-2">
                                   {PARTNER_PHARMACIES.map((p, i) => (
                                       <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                                           <span className="text-xs font-bold text-slate-300">{p.name}</span>
                                           <span className="text-[10px] text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-900/30">{p.discount}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>

                           <button 
                                onClick={handleFindPharmacies}
                                disabled={isLoadingPharmacies}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                           >
                               {isLoadingPharmacies ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                               {isLoadingPharmacies ? "Locating..." : "Find Nearby Pharmacy"}
                           </button>
                           
                           {pharmacyError && (
                               <div className="p-3 bg-red-900/20 border border-red-900/30 rounded-xl flex items-start gap-2 text-xs text-red-400 animate-in fade-in slide-in-from-top-2">
                                   <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                   {pharmacyError}
                               </div>
                           )}

                           {showPharmacyList && !pharmacyError && (
                               <div className="space-y-3 animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto custom-scrollbar">
                                   {pharmacies.length > 0 ? (
                                       pharmacies.map((pharmacy, idx) => (
                                           <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 group hover:border-blue-500/30 transition-all">
                                               <div className="flex justify-between items-start mb-1">
                                                   <h5 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 truncate">{pharmacy.title}</h5>
                                                   {pharmacy.rating && (
                                                       <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
                                                           <Star size={8} className="fill-current" /> {pharmacy.rating}
                                                       </div>
                                                   )}
                                               </div>
                                               <div className="flex items-center gap-2 text-[10px] text-emerald-400 mb-2">
                                                   <Clock size={10} /> Open Now
                                               </div>
                                               <div className="flex gap-2">
                                                   <a 
                                                       href={pharmacy.uri} 
                                                       target="_blank" 
                                                       rel="noopener noreferrer"
                                                       className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold rounded text-center flex items-center justify-center gap-1 transition-colors"
                                                   >
                                                       <Navigation size={10} /> Directions
                                                   </a>
                                                   <button className="px-2 py-1 bg-slate-800 text-slate-400 rounded hover:text-white">
                                                       <Phone size={10} />
                                                   </button>
                                               </div>
                                           </div>
                                       ))
                                   ) : !isLoadingPharmacies && (
                                        <div className="text-center py-4 text-xs text-slate-500">
                                            No pharmacies found nearby.
                                        </div>
                                   )}
                               </div>
                           )}
                      </div>
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};