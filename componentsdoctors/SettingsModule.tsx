
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Globe, 
  Wifi, 
  WifiOff, 
  Database, 
  Lock, 
  Download, 
  RefreshCw, 
  Server, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone,
  QrCode,
  HardDrive,
  Activity,
  ToggleLeft,
  ToggleRight,
  Languages,
  Save,
  Map,
  Wand2,
  Check,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

const SettingsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interop' | 'security' | 'offline' | 'audit'>('interop');
  const [selectedRegion, setSelectedRegion] = useState<string>('AF');
  const [pendingChanges, setPendingChanges] = useState<number>(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    offlineMode: false,
    lowBandwidth: false,
    fhirEnabled: true,
    hl7Bridge: false,
    language: 'EN',
    syncStrategy: 'realtime'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setPendingChanges(prev => prev + 1);
  };

  const handleSave = () => {
      setPendingChanges(0);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const regions = {
    'NA': { label: 'North America', compliance: 'HIPAA', features: ['ANSI X12', 'SNOMED CT US'] },
    'EU': { label: 'Europe', compliance: 'GDPR', features: ['EuroRec', 'EHR-S FM'] },
    'AF': { label: 'West Africa', compliance: 'NDPR / ECOWAS', features: ['LGA Mapping', 'Minimal Data'] },
    'AS': { label: 'Asia Pacific', compliance: 'APEC CBPR', features: ['Multi-byte Char Support'] },
  };

  const SimpleWorldMap = () => (
    <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-md">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* North America */}
      <path 
        d="M20,20 L80,20 L90,60 L50,90 L20,50 Z" 
        fill={selectedRegion === 'NA' ? '#0d9488' : '#e2e8f0'} 
        stroke="white" 
        strokeWidth="1"
        className="cursor-pointer hover:fill-teal-400 transition-colors"
        onClick={() => setSelectedRegion('NA')}
      />
      {/* Europe */}
      <path 
        d="M160,25 L210,25 L200,60 L170,60 Z" 
        fill={selectedRegion === 'EU' ? '#0d9488' : '#e2e8f0'} 
        stroke="white" 
        strokeWidth="1"
        className="cursor-pointer hover:fill-teal-400 transition-colors"
        onClick={() => setSelectedRegion('EU')}
      />
      {/* Africa */}
      <path 
        d="M150,70 L210,70 L200,130 L160,120 Z" 
        fill={selectedRegion === 'AF' ? '#0d9488' : '#e2e8f0'} 
        stroke="white" 
        strokeWidth="1"
        className="cursor-pointer hover:fill-teal-400 transition-colors"
        onClick={() => setSelectedRegion('AF')}
      />
      {/* Asia */}
      <path 
        d="M220,30 L320,30 L310,90 L240,100 L220,60 Z" 
        fill={selectedRegion === 'AS' ? '#0d9488' : '#e2e8f0'} 
        stroke="white" 
        strokeWidth="1"
        className="cursor-pointer hover:fill-teal-400 transition-colors"
        onClick={() => setSelectedRegion('AS')}
      />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden relative">
      
      {/* Persistent Header & Health Bar */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0 z-20 shadow-sm">
          {/* Top Bar */}
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-teal-600" />
                System Configuration
              </h2>
              <p className="text-slate-500 text-sm mt-1">Manage global interoperability, security protocols, and compliance.</p>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 flex items-center gap-2 text-sm transition-colors border border-indigo-100"
                >
                    <Wand2 className="w-4 h-4" /> Quick Setup Wizard
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                {pendingChanges > 0 && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 animate-in slide-in-from-right-2">
                        {pendingChanges} Unsaved Changes
                    </span>
                )}
                {showSaveSuccess && (
                     <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 animate-in slide-in-from-right-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Saved
                    </span>
                )}
                <button 
                    disabled={pendingChanges === 0}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${
                        pendingChanges > 0 
                        ? 'bg-slate-900 text-white hover:bg-slate-800' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    onClick={handleSave}
                >
                    <Save className="w-4 h-4" /> Save Configuration
                </button>
            </div>
          </div>

          {/* Persistent Health Status Strip */}
          <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-bold text-slate-700">Core Node:</span>
                  <span className="font-mono text-green-700 bg-green-100 px-1.5 rounded text-xs">ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-bold text-slate-700">Encryption:</span>
                  <span className="font-mono text-slate-600 bg-slate-200 px-1.5 rounded text-xs">AES-256 (Hardware)</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-slate-700">Sync Queue:</span>
                  <span className="font-mono text-blue-700 bg-blue-100 px-1.5 rounded text-xs">Idle (0 Pending)</span>
              </div>
          </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto py-6">
            <nav className="space-y-1 px-3">
                <NavButton 
                    id="interop" 
                    label="Interoperability" 
                    icon={Globe} 
                    active={activeTab === 'interop'} 
                    onClick={setActiveTab} 
                />
                <NavButton 
                    id="security" 
                    label="Security & Privacy" 
                    icon={Shield} 
                    active={activeTab === 'security'} 
                    onClick={setActiveTab} 
                />
                <NavButton 
                    id="offline" 
                    label="Connectivity & Sync" 
                    icon={Wifi} 
                    active={activeTab === 'offline'} 
                    onClick={setActiveTab} 
                />
                <NavButton 
                    id="audit" 
                    label="Audit & Governance" 
                    icon={FileJson} 
                    active={activeTab === 'audit'} 
                    onClick={setActiveTab} 
                />
            </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
            
            {/* --- TAB: INTEROPERABILITY --- */}
            {activeTab === 'interop' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 max-w-5xl">
                    
                    {/* Section 1: Regional Compliance (Interactive Map) */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Map className="w-5 h-5 text-teal-600" />
                                    Regional Compliance Layer
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Select your operating jurisdiction to apply automated compliance rules.</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
                                <Info className="w-3.5 h-3.5 text-blue-500" />
                                Active: <span className="font-bold text-slate-900">{regions[selectedRegion as keyof typeof regions].label}</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row h-80">
                            {/* Map Area */}
                            <div className="w-full md:w-1/2 bg-slate-100 p-6 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
                                <SimpleWorldMap />
                                <div className="absolute bottom-4 left-4 text-[10px] text-slate-400 font-medium">
                                    * Click a highlighted region to configure
                                </div>
                            </div>

                            {/* Configuration Panel for Selected Region */}
                            <div className="w-full md:w-1/2 p-6 bg-white">
                                <div className="mb-4 pb-4 border-b border-slate-100">
                                    <h4 className="text-lg font-bold text-slate-900">{regions[selectedRegion as keyof typeof regions].label}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standard:</span>
                                        <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded text-xs font-bold">
                                            {regions[selectedRegion as keyof typeof regions].compliance}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" onChange={() => handleSettingChange('compliance_1', true)} />
                                            <div className="text-sm">
                                                <span className="font-medium text-slate-900 group-hover:text-teal-700">Enforce Data Residency</span>
                                                <p className="text-xs text-slate-500">Store data only on local nodes</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" onChange={() => handleSettingChange('compliance_2', true)} />
                                            <div className="text-sm">
                                                <span className="font-medium text-slate-900 group-hover:text-teal-700">Strict Consent Logging</span>
                                                <p className="text-xs text-slate-500">Mandatory signature for all shares</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mt-4">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Enabled Features</div>
                                        <div className="flex flex-wrap gap-2">
                                            {regions[selectedRegion as keyof typeof regions].features.map(f => (
                                                <span key={f} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 flex items-center gap-1">
                                                    <Check className="w-3 h-3 text-green-500" /> {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Data Standards (Dedicated) */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Database className="w-5 h-5 text-teal-600" />
                            Data Standards & Protocols
                        </h3>
                        
                        <div className="space-y-6">
                            {/* FHIR Config */}
                            <div className="flex items-start justify-between p-4 rounded-lg border border-teal-200 bg-teal-50/50">
                                <div className="flex gap-4">
                                    <div className="p-2 bg-white rounded-lg border border-teal-100 shadow-sm text-teal-600 h-fit">
                                        <FileJson className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">FHIR R4 (Fast Healthcare Interoperability Resources)</h4>
                                        <p className="text-xs text-slate-600 mt-1 max-w-md">
                                            The primary standard for data exchange. Disabling this puts the system into legacy mode.
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <select className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-teal-500/20 outline-none">
                                                <option>Version 4.0.1 (Current)</option>
                                                <option>Version 3.0.2 (STU3)</option>
                                            </select>
                                            <span className="text-xs text-green-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-3 h-3" /> Validated</span>
                                        </div>
                                    </div>
                                </div>
                                <ToggleSwitch 
                                    enabled={settings.fhirEnabled} 
                                    onChange={(v) => handleSettingChange('fhirEnabled', v)} 
                                />
                            </div>

                            {/* HL7 Config */}
                            <div className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-white">
                                <div className="flex gap-4">
                                    <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-500 h-fit">
                                        <Server className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">HL7 v2.x Legacy Bridge</h4>
                                        <p className="text-xs text-slate-600 mt-1 max-w-md">
                                            Translates older ADT/ORM messages to FHIR resources. Useful for connecting with older lab equipment.
                                        </p>
                                    </div>
                                </div>
                                <ToggleSwitch 
                                    enabled={settings.hl7Bridge} 
                                    onChange={(v) => handleSettingChange('hl7Bridge', v)} 
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Localization (Radio Group) */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Languages className="w-5 h-5 text-teal-600" />
                            Interface Localization
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { code: 'EN', label: 'English (UK)', native: 'English' },
                                { code: 'YOR', label: 'Yoruba', native: 'Yorùbá' },
                                { code: 'HAU', label: 'Hausa', native: 'Harshen Hausa' },
                                { code: 'IGB', label: 'Igbo', native: 'Asụsụ Igbo' }
                            ].map(lang => (
                                <label 
                                    key={lang.code}
                                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                                        settings.language === lang.code 
                                        ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-200' 
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${settings.language === lang.code ? 'border-teal-600' : 'border-slate-300'}`}>
                                            {settings.language === lang.code && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${settings.language === lang.code ? 'text-teal-900' : 'text-slate-700'}`}>{lang.label}</div>
                                            <div className="text-xs text-slate-500">{lang.native}</div>
                                        </div>
                                    </div>
                                    <input 
                                        type="radio" 
                                        name="language" 
                                        className="hidden" 
                                        checked={settings.language === lang.code}
                                        onChange={() => handleSettingChange('language', lang.code)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* --- TAB: SECURITY --- */}
            {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-teal-600" />
                            Zero-Knowledge Encryption
                        </h3>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Master Key Status: Active</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Your private key is stored in the secure enclave of this device. 
                                    WelliRecord servers cannot decrypt patient data without this key.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Key Fingerprint</div>
                                <div className="font-mono text-sm text-slate-700 break-all">
                                    SHA256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
                                </div>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Last Rotation</div>
                                <div className="font-mono text-sm text-slate-700">
                                    Oct 24, 2023 • 14:02 UTC
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: CONNECTIVITY --- */}
            {activeTab === 'offline' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <WifiOff className="w-5 h-5 text-teal-600" />
                            Offline Capabilities
                        </h3>
                        
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg mb-4">
                            <div>
                                <div className="font-bold text-slate-900 text-sm">Offline Simulation Mode</div>
                                <div className="text-xs text-slate-500 mt-1">Force system to disconnect from cloud nodes for testing.</div>
                            </div>
                            <ToggleSwitch 
                                enabled={settings.offlineMode} 
                                onChange={(v) => handleSettingChange('offlineMode', v)} 
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg mb-6">
                            <div>
                                <div className="font-bold text-slate-900 text-sm">Low Bandwidth Optimization</div>
                                <div className="text-xs text-slate-500 mt-1">Defer heavy media syncs and compress payloads.</div>
                            </div>
                            <ToggleSwitch 
                                enabled={settings.lowBandwidth} 
                                onChange={(v) => handleSettingChange('lowBandwidth', v)} 
                            />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sync Strategy</h4>
                            <div className="flex gap-2">
                                {['Real-time', 'Deferred (1h)', 'Manual Only'].map(strat => (
                                    <button 
                                        key={strat}
                                        onClick={() => handleSettingChange('syncStrategy', strat.toLowerCase())}
                                        className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
                                            settings.syncStrategy === strat.toLowerCase() || (settings.syncStrategy === 'realtime' && strat === 'Real-time')
                                            ? 'bg-teal-600 text-white border-teal-600' 
                                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {strat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: AUDIT --- */}
            {activeTab === 'audit' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileJson className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Compliance Audit Logs</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">
                            Generate comprehensive reports covering all data access, transfer, and modification events for regulatory review.
                        </p>
                        <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 inline-flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                            <Download className="w-4 h-4" /> Export Full Audit Trail (CSV)
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>

       {/* Quick Setup Wizard Modal */}
       {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Wand2 className="w-6 h-6 text-indigo-600" /> 
                        Quick Setup Wizard
                    </h3>
                    <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-8">
                     <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">1</div>
                         <div>
                             <h4 className="font-bold text-slate-900">Configure Node Identity</h4>
                             <p className="text-sm text-slate-500 mt-1">Set your clinic name and generate a DID.</p>
                             <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600">
                                 Auto-detected: <span className="font-bold">Westside Clinic (Main)</span>
                             </div>
                         </div>
                     </div>
                     <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">2</div>
                         <div>
                             <h4 className="font-bold text-slate-900">Establish Regional Trust</h4>
                             <p className="text-sm text-slate-500 mt-1">Connect to local regulatory nodes for compliance.</p>
                             <div className="mt-3 flex gap-2">
                                 <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200 flex items-center gap-1"><Check className="w-3 h-3" /> NDPR Node</span>
                                 <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200 flex items-center gap-1"><Check className="w-3 h-3" /> ECOWAS Gateway</span>
                             </div>
                         </div>
                     </div>
                     <div className="flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">3</div>
                         <div>
                             <h4 className="font-bold text-slate-400">Sync Historical Data</h4>
                             <p className="text-sm text-slate-400 mt-1">Import existing patient records (Optional).</p>
                         </div>
                     </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsWizardOpen(false)}
                        className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Skip
                    </button>
                    <button 
                        onClick={() => setIsWizardOpen(false)}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        Continue Setup
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Components ---

const NavButton: React.FC<{ id: string; label: string; icon: any; active: boolean; onClick: (id: any) => void }> = ({ id, label, icon: Icon, active, onClick }) => (
    <button 
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
            active 
            ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
        }`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
        {label}
        {active && <ChevronRight className="w-4 h-4 ml-auto text-teal-400" />}
    </button>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (val: boolean) => void }> = ({ enabled, onChange }) => (
    <div 
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${enabled ? 'bg-teal-600' : 'bg-slate-300'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </div>
);

export default SettingsModule;
