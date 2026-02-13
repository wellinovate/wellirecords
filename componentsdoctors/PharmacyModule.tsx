
import React, { useState } from 'react';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User, 
  ShieldAlert, 
  History, 
  Check, 
  Printer, 
  PackageCheck,
  Globe,
  Siren,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Scale,
  Ban,
  Activity,
  CreditCard,
  Thermometer,
  Filter,
  Pause
} from 'lucide-react';
import { Prescription } from '../types';

// Extended type for internal UI logic
interface RichPrescription extends Prescription {
  patientAge: number;
  patientWeight: string; // e.g. "185 lbs"
  insuranceStatus: 'active' | 'pending' | 'expired' | 'failed';
  copay: string;
}

const PharmacyModule: React.FC = () => {
  // Default to first item selected to avoid empty state
  const [selectedRx, setSelectedRx] = useState<RichPrescription | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [safetyChecks, setSafetyChecks] = useState({
    patientId: false,
    drugDose: false,
    interactions: false,
    allergy: false
  });
  const [isDispensing, setIsDispensing] = useState(false);

  // Mock Data
  const [prescriptions, setPrescriptions] = useState<RichPrescription[]>([
    { 
      id: 'RX-29381', 
      patientName: 'David Kim', 
      patientId: 'did:welli:4f1...m55', 
      provider: 'Pain Management Ctr', 
      medication: 'OxyContin', 
      genericName: 'Oxycodone HCl', 
      dosage: '10mg', 
      instructions: 'Take 1 tablet every 12 hours as needed for severe pain', 
      date: '10 min ago', 
      status: 'pending', 
      type: 'refill', 
      refillsRemaining: 0,
      isControlled: true,
      patientAge: 72,
      patientWeight: '165 lbs',
      insuranceStatus: 'active',
      copay: '$15.00',
      interactions: [
        { 
            type: 'condition', 
            severity: 'high', 
            description: 'GERIATRIC ALERT: Patient is > 65. High risk of respiratory depression. Starting dose of 10mg may be too high.' 
        },
        {
            type: 'drug',
            severity: 'moderate',
            description: 'Interaction with active Benzodiazepine prescription (Xanax).'
        }
      ]
    },
    { 
      id: 'RX-29384', 
      patientName: 'James Wilson', 
      patientId: 'did:welli:1c4...e33', 
      provider: 'Dr. Sarah Chen', 
      medication: 'Coumadin', 
      genericName: 'Warfarin Sodium',
      dosage: '5mg', 
      instructions: 'Take 1 tablet daily in the evening', 
      date: '25 min ago', 
      status: 'pending', 
      type: 'new',
      refillsRemaining: 3,
      patientAge: 55,
      patientWeight: '210 lbs',
      insuranceStatus: 'pending',
      copay: '$8.50',
      interactions: [
        { 
            type: 'drug', 
            severity: 'high', 
            description: 'MAJOR INTERACTION: Concurrent use with Aspirin significantly increases bleeding risk. INR monitoring required.' 
        }
      ]
    },
    { 
      id: 'RX-29383', 
      patientName: 'Maria Rodriguez', 
      patientId: 'did:welli:9b2...k12', 
      provider: 'Dr. Emily Wong', 
      medication: 'Amoxicillin', 
      genericName: 'Amoxicillin', 
      dosage: '500mg', 
      instructions: 'Take 1 capsule every 8 hours for 7 days', 
      date: '45 min ago', 
      status: 'verified', 
      type: 'new',
      refillsRemaining: 0,
      patientAge: 34,
      patientWeight: '145 lbs',
      insuranceStatus: 'active',
      copay: '$4.00',
      interactions: []
    }
  ]);

  // Initialize selection
  React.useEffect(() => {
    if (!selectedRx && prescriptions.length > 0) {
        setSelectedRx(prescriptions[0]);
    }
  }, []);

  // Reset checks when selection changes
  React.useEffect(() => {
    setSafetyChecks({
        patientId: false,
        drugDose: false,
        interactions: false,
        allergy: false
    });
    setIsDispensing(false);
  }, [selectedRx?.id]);

  const toggleCheck = (key: keyof typeof safetyChecks) => {
      setSafetyChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(safetyChecks).every(Boolean);

  const handleDispense = () => {
      setIsDispensing(true);
      setTimeout(() => {
          setIsDispensing(false);
          setPrescriptions(prev => prev.map(p => p.id === selectedRx?.id ? { ...p, status: 'filled' as const } : p));
          if(selectedRx) setSelectedRx({ ...selectedRx, status: 'filled' as const });
      }, 2000);
  };

  const handleHold = () => {
      setPrescriptions(prev => prev.map(p => p.id === selectedRx?.id ? { ...p, status: 'flagged' as const } : p));
      if(selectedRx) setSelectedRx({ ...selectedRx, status: 'flagged' as const });
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      
      {/* LEFT PANEL: INTAKE QUEUE (35%) */}
      <div className="w-[35%] flex flex-col h-full border-r border-slate-200 bg-white shadow-sm z-10">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-6 h-6 text-teal-600" />
                Pharmacy Queue
            </h2>
            <div className="flex gap-1">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">2 High Risk</span>
                <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-bold">1 Verified</span>
            </div>
          </div>
          
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by Rx#, Drug, or Patient..." 
               className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {prescriptions.map(rx => {
                const isActive = selectedRx?.id === rx.id;
                const hasMajorIssue = rx.interactions?.some(i => i.severity === 'high');
                
                return (
                    <div 
                        key={rx.id}
                        onClick={() => setSelectedRx(rx)}
                        className={`
                            relative rounded-xl p-4 cursor-pointer transition-all border-l-4 group
                            ${isActive ? 'bg-teal-50 shadow-md ring-1 ring-teal-200' : 'bg-white border hover:shadow-sm'}
                            ${rx.status === 'flagged' ? 'border-l-slate-400 bg-slate-50 opacity-80' : 
                              rx.status === 'filled' ? 'border-l-green-500 bg-green-50/50' :
                              rx.isControlled ? 'border-l-red-600' : hasMajorIssue ? 'border-l-amber-500' : 'border-l-teal-500'}
                            ${!isActive && 'border-y-slate-200 border-r-slate-200'}
                        `}
                    >
                        {/* Top Badge Row */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    rx.status === 'flagged' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                    rx.status === 'filled' ? 'bg-green-100 text-green-700 border-green-200' :
                                    rx.type === 'new' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'
                                }`}>
                                    {rx.status === 'flagged' ? 'ON HOLD' : rx.status === 'filled' ? 'DISPENSED' : rx.type}
                                </span>
                                {rx.isControlled && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                                        <ShieldAlert className="w-3 h-3" /> CS-II
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-mono text-slate-400">{rx.date}</span>
                        </div>

                        {/* Drug Details */}
                        <div className="mb-2">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">
                                {rx.medication}
                            </h3>
                            <div className="text-sm font-semibold text-slate-600">{rx.dosage}</div>
                        </div>

                        {/* Patient Context */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-1 font-medium text-slate-700">
                                <User className="w-3 h-3" /> {rx.patientName}
                            </div>
                            <span className="text-slate-300">|</span>
                            <span>{rx.patientAge}y</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1">
                                <Scale className="w-3 h-3" /> {rx.patientWeight}
                            </span>
                        </div>

                        {/* Alerts Summary */}
                        {rx.interactions && rx.interactions.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {rx.interactions.length} Interaction{rx.interactions.length > 1 ? 's' : ''} Detected
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* RIGHT PANEL: REVIEW WORKSPACE (65%) */}
      <div className="w-[65%] flex flex-col h-full bg-slate-50/50 relative">
        {selectedRx ? (
            <>
                {/* 1. SAFETY HEADER */}
                <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
                    
                    {/* High Severity Alert Banner */}
                    {selectedRx.interactions && selectedRx.interactions.some(i => i.severity === 'high') && (
                        <div className="bg-red-600 text-white px-6 py-3 flex items-start gap-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Siren className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-sm uppercase tracking-wider">High Severity Safety Alert</h3>
                                <p className="text-sm text-red-100 mt-1 opacity-90">
                                    Dispensing halted. Clinical intervention required. Review the interaction details below.
                                </p>
                            </div>
                            <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-bold uppercase transition-colors">
                                Acknowledge
                            </button>
                        </div>
                    )}

                    <div className="px-8 py-5 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-slate-900">{selectedRx.medication}</h1>
                                <span className="text-xl text-slate-500 font-medium">{selectedRx.dosage}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-mono text-slate-400">{selectedRx.id}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="font-medium text-teal-700 uppercase">{selectedRx.genericName}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center justify-end gap-2 mb-1">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insurance</span>
                                 {selectedRx.insuranceStatus === 'active' ? (
                                     <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                         <CheckCircle2 className="w-3 h-3" /> Active
                                     </span>
                                 ) : (
                                     <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                         <Clock className="w-3 h-3" /> Pending
                                     </span>
                                 )}
                             </div>
                             <div className="text-xl font-bold text-slate-900 flex items-center justify-end gap-2">
                                 <CreditCard className="w-4 h-4 text-slate-400" />
                                 {selectedRx.copay} <span className="text-xs font-normal text-slate-500">Copay</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 2. SCROLLABLE CLINICAL CONTEXT */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {/* Patient Banner */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex items-center gap-6 shadow-sm">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200">
                            <User className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-900">{selectedRx.patientName}</h3>
                            <div className="flex gap-4 mt-1 text-sm text-slate-600">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    <History className="w-3.5 h-3.5 text-slate-400" /> {selectedRx.patientAge} Years Old
                                </span>
                                <span className={`flex items-center gap-1.5 px-2 py-1 rounded border ${selectedRx.patientAge > 65 || selectedRx.patientAge < 12 ? 'bg-amber-50 border-amber-100 text-amber-700 font-bold' : 'bg-slate-50 border-slate-100'}`}>
                                    <Scale className="w-3.5 h-3.5" /> {selectedRx.patientWeight}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-slate-400 uppercase font-bold mb-1">Prescriber</div>
                             <div className="text-sm font-bold text-slate-900">{selectedRx.provider}</div>
                             <div className="text-xs text-green-600 flex items-center justify-end gap-1 mt-0.5">
                                 <CheckCircle2 className="w-3 h-3" /> DEA Verified
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                        {/* Clinical Checks */}
                        <div className="space-y-4">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                 <Activity className="w-4 h-4" /> Clinical Review
                             </h4>
                             
                             {/* Interactions Box */}
                             {selectedRx.interactions && selectedRx.interactions.length > 0 ? (
                                 <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                                     <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
                                         <span className="text-xs font-bold text-red-700 uppercase">Drug Utilization Review</span>
                                         <span className="bg-red-200 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedRx.interactions.length} Alerts</span>
                                     </div>
                                     <div className="p-4 space-y-3">
                                         {selectedRx.interactions.map((alert, i) => (
                                             <div key={i} className={`p-3 rounded-lg border text-sm ${
                                                 alert.severity === 'high' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                                             }`}>
                                                 <div className="flex items-center gap-2 font-bold mb-1">
                                                     {alert.severity === 'high' ? <Ban className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                                     {alert.severity === 'high' ? 'CONTRAINDICATION' : 'PRECAUTION'}
                                                 </div>
                                                 {alert.description}
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             ) : (
                                 <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                                     <div className="bg-green-100 p-2 rounded-full text-green-600">
                                         <CheckCircle2 className="w-5 h-5" />
                                     </div>
                                     <div>
                                         <div className="font-bold text-green-800 text-sm">No Interactions Detected</div>
                                         <div className="text-xs text-green-600">Checked against current meds & allergies.</div>
                                     </div>
                                 </div>
                             )}
                             
                             {/* Instructions Box */}
                             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                 <div className="text-xs font-bold text-slate-400 uppercase mb-2">Sig (Instructions)</div>
                                 <p className="text-lg font-medium text-slate-900">{selectedRx.instructions}</p>
                             </div>
                        </div>

                        {/* Patient History Context */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <History className="w-4 h-4" /> Profile Context
                            </h4>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-slate-100">
                                    <div className="p-4">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-3">Active Meds</div>
                                        <ul className="space-y-2 text-sm text-slate-700">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                Lisinopril 10mg
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                Atorvastatin 20mg
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                Aspirin 81mg
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-slate-50/50">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-3">Allergies</div>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center gap-2 text-red-600 font-medium">
                                                <Ban className="w-3 h-3" /> Penicillin
                                            </li>
                                            <li className="flex items-center gap-2 text-slate-600">
                                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                                Peanuts (Mild)
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. STICKY ACTION FOOTER */}
                <div className="bg-white border-t border-slate-200 p-6 z-30">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Mandatory Checklist */}
                        <div className="flex flex-wrap gap-4 mb-6 justify-center">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${safetyChecks.patientId ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                <input type="checkbox" checked={safetyChecks.patientId} onChange={() => toggleCheck('patientId')} className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
                                <span className="text-sm font-bold">Right Patient</span>
                            </label>
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${safetyChecks.drugDose ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                <input type="checkbox" checked={safetyChecks.drugDose} onChange={() => toggleCheck('drugDose')} className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
                                <span className="text-sm font-bold">Right Drug & Dose</span>
                            </label>
                             <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${safetyChecks.interactions ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                <input type="checkbox" checked={safetyChecks.interactions} onChange={() => toggleCheck('interactions')} className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
                                <span className="text-sm font-bold">Interactions Reviewed</span>
                            </label>
                             <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${safetyChecks.allergy ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                <input type="checkbox" checked={safetyChecks.allergy} onChange={() => toggleCheck('allergy')} className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
                                <span className="text-sm font-bold">Allergies Checked</span>
                            </label>
                        </div>

                        {/* Primary Action */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleHold}
                                disabled={selectedRx.status === 'filled' || selectedRx.status === 'flagged'}
                                className="px-6 py-4 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors w-1/3 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Pause className="w-5 h-5" /> Place on Hold
                            </button>
                            <button 
                                onClick={handleDispense}
                                disabled={!allChecksPassed || isDispensing || selectedRx.status === 'filled'}
                                className={`flex-1 py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg ${
                                    allChecksPassed && selectedRx.status !== 'filled'
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200 hover:scale-[1.01]' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isDispensing ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> Processing Sale...</>
                                ) : (
                                    <><PackageCheck className="w-6 h-6" /> Dispense & Complete</>
                                )}
                            </button>
                        </div>
                        {!allChecksPassed && selectedRx.status !== 'filled' && (
                            <p className="text-center text-xs text-red-500 font-bold mt-3 uppercase tracking-wide animate-pulse">
                                * Complete all safety checks to unlock dispensing
                            </p>
                        )}
                        {selectedRx.status === 'filled' && (
                            <p className="text-center text-xs text-green-600 font-bold mt-3 uppercase tracking-wide">
                                Prescription Dispensed Successfully
                            </p>
                        )}
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Pill className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Pharmacy Workspace</h3>
                <p>Select a prescription from the queue to begin the safety review process.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyModule;
