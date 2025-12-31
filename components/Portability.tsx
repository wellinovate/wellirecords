import React, { useState } from 'react';
import { 
  Download, Share2, Shield, Lock, FileJson, Globe, Users, Clock, 
  AlertTriangle, Plus, X, Check, Eye, FileText, Pill, Activity, 
  Stethoscope, Microscope, UploadCloud, Edit3, FilePlus, Search, 
  Filter, ChevronDown, Key, Copy, QrCode, Server, Database,
  ArrowRight, MoreHorizontal, FileCheck, AlertCircle, CheckCircle,
  FlaskConical, ClipboardList
} from 'lucide-react';

// --- Mock Data ---

const MOCK_PERMISSIONS = [
  { 
    id: 1, 
    name: 'Dr. Sarah Chen', 
    role: 'Primary Care Physician', 
    initials: 'SC',
    scopes: [
      { label: 'Medical History', icon: FileText, allowed: true },
      { label: 'Lab Results', icon: Activity, allowed: true },
      { label: 'Prescriptions', icon: Pill, allowed: true },
      { label: 'Clinical Notes', icon: Edit3, allowed: true }
    ],
    accessLevel: 'Full Write',
    duration: 30,
    remaining: 28,
    unit: 'days',
    status: 'active' 
  },
  { 
    id: 2, 
    name: 'Valley Imaging Center', 
    role: 'Diagnostic Facility', 
    initials: 'VI',
    scopes: [
      { label: 'Upload Results', icon: UploadCloud, allowed: true },
      { label: 'View History', icon: Eye, allowed: false }
    ],
    accessLevel: 'Upload Only',
    duration: 7,
    remaining: 1,
    unit: 'days',
    status: 'expiring' 
  },
  { 
    id: 3, 
    name: 'GreenCross Pharmacy', 
    role: 'Pharmacy', 
    initials: 'GC',
    scopes: [
      { label: 'View Prescriptions', icon: Pill, allowed: true },
      { label: 'History', icon: FileText, allowed: false }
    ],
    accessLevel: 'Read Only',
    duration: 90,
    remaining: 45,
    unit: 'days',
    status: 'active' 
  }
];

const MOCK_LOGS = [
  { id: 'log_01', date: 'Today, 10:42 AM', actor: 'Valley Imaging Center', action: 'WRITE', resource: 'MRI_Lumbar_Spine.dcm', hash: '0x8f...2a91', verified: true },
  { id: 'log_02', date: 'Yesterday, 4:15 PM', actor: 'Dr. Sarah Chen', action: 'READ', resource: 'Blood_Panel_May2024.pdf', hash: '0x3c...9b22', verified: true },
  { id: 'log_03', date: 'May 10, 09:30 AM', actor: 'Dr. Sarah Chen', action: 'WRITE', resource: 'Rx_Amoxicillin_500mg', hash: '0x1d...8c44', verified: true },
  { id: 'log_04', date: 'May 08, 02:22 PM', actor: 'Central City Lab', action: 'READ', resource: 'Patient_Demographics', hash: '0x7e...1f55', verified: true },
  { id: 'log_05', date: 'May 05, 11:00 AM', actor: 'GreenCross Pharmacy', action: 'READ', resource: 'Rx_Lisinopril_10mg', hash: '0x9a...3d11', verified: true },
];

type AccessRole = 'doctor' | 'diagnostic' | 'pharmacy';

export const Portability: React.FC = () => {
  const [permissions, setPermissions] = useState(MOCK_PERMISSIONS);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [searchLog, setSearchLog] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'READ' | 'WRITE'>('ALL');
  
  // Grant Modal State
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantProviderName, setGrantProviderName] = useState('');
  const [grantRole, setGrantRole] = useState<AccessRole>('doctor');
  const [grantDuration, setGrantDuration] = useState('24');

  const filteredLogs = logs.filter(log => {
      const matchesSearch = log.actor.toLowerCase().includes(searchLog.toLowerCase()) || log.resource.toLowerCase().includes(searchLog.toLowerCase());
      const matchesFilter = filterType === 'ALL' || log.action === filterType;
      return matchesSearch && matchesFilter;
  });

  const handleRevoke = (id: number) => {
      if (window.confirm("Are you sure you want to revoke access? This action is immediate and recorded on the blockchain.")) {
          setPermissions(prev => prev.filter(p => p.id !== id));
      }
  };

  const getScopesForRole = (role: AccessRole) => {
      switch(role) {
          case 'doctor':
              return [
                  { label: 'Read Medical History', icon: FileText, allowed: true },
                  { label: 'Read Lab Results', icon: Activity, allowed: true },
                  { label: 'Read Prescriptions', icon: Pill, allowed: true },
                  { label: 'Write Clinical Notes', icon: Edit3, allowed: true },
                  { label: 'Prescribe Medication', icon: Pill, allowed: true },
              ];
          case 'diagnostic':
              return [
                  { label: 'Upload Lab Results', icon: UploadCloud, allowed: true },
                  { label: 'Read Medical History', icon: FileText, allowed: false },
                  { label: 'Read Prescriptions', icon: Pill, allowed: false },
              ];
          case 'pharmacy':
              return [
                  { label: 'Read Prescriptions', icon: Pill, allowed: true },
                  { label: 'Read Medical History', icon: FileText, allowed: false },
                  { label: 'Write Clinical Notes', icon: Edit3, allowed: false },
              ];
          default:
              return [];
      }
  };

  const handleGrantConfirm = () => {
      if (!grantProviderName) return;

      const newPermission = {
          id: Date.now(),
          name: grantProviderName,
          role: grantRole === 'doctor' ? 'Physician' : grantRole === 'diagnostic' ? 'Diagnostic Center' : 'Pharmacy',
          initials: grantProviderName.substring(0, 2).toUpperCase(),
          scopes: getScopesForRole(grantRole),
          accessLevel: grantRole === 'doctor' ? 'Full Access' : grantRole === 'diagnostic' ? 'Upload Only' : 'Read Only',
          duration: parseInt(grantDuration),
          remaining: parseInt(grantDuration),
          unit: 'hours',
          status: 'active'
      };

      setPermissions([newPermission as any, ...permissions]);
      setShowGrantModal(false);
      setGrantProviderName('');
      setGrantRole('doctor');
      setGrantDuration('24');
  };

  const calculateProgress = (current: number, total: number) => {
      return Math.max(0, Math.min(100, (current / total) * 100));
  };

  const getProgressColor = (val: number, unit: string) => {
      if (unit === 'hours') {
          if (val <= 1) return 'bg-red-500';
          if (val <= 4) return 'bg-amber-500';
          return 'bg-emerald-500';
      }
      // days
      if (val <= 2) return 'bg-red-500';
      if (val <= 7) return 'bg-amber-500';
      return 'bg-emerald-500';
  };

  const isExpiring = (val: number, unit: string) => {
      if (unit === 'hours') return val <= 4;
      return val <= 5;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
             <Shield className="text-blue-500" /> Data Sovereignty Center
           </h2>
           <p className="text-slate-500 max-w-2xl">
             Control exactly who has access to your health records. Every permission grant and data access is cryptographically signed and logged.
           </p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg font-medium transition-colors">
                 <Download size={16} /> Export All Data
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- LEFT COLUMN: Active Grants (HERO) --- */}
          <div className="flex-1 w-full space-y-6">
              
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-200">Active Access Grants</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-900/50">
                          {permissions.length} Active
                      </span>
                  </div>
                  <button 
                    onClick={() => setShowGrantModal(true)}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                  >
                    <Plus size={16} /> Grant New Access
                  </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                  {permissions.map((perm) => {
                      const expiring = isExpiring(perm.remaining, perm.unit);
                      
                      return (
                      <div key={perm.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all group relative overflow-hidden">
                          {/* Expiration Indicator Bar */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                              <div 
                                className={`h-full ${getProgressColor(perm.remaining, perm.unit)} transition-all duration-1000`} 
                                style={{ width: `${calculateProgress(perm.remaining, perm.duration)}%` }}
                              ></div>
                          </div>

                          <div className="flex justify-between items-start mb-4 mt-2">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shadow-inner">
                                      {perm.initials}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-100 text-sm">{perm.name}</h4>
                                      <p className="text-xs text-slate-500">{perm.role}</p>
                                  </div>
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                                  expiring 
                                  ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' 
                                  : 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30'
                              }`}>
                                  {expiring ? 'Expiring Soon' : 'Active'}
                              </div>
                          </div>

                          {/* Permission Scopes Grid */}
                          <div className="grid grid-cols-2 gap-2 mb-5">
                              {perm.scopes.map((scope, idx) => (
                                  <div key={idx} className={`flex items-center gap-2 text-xs p-1.5 rounded-lg ${scope.allowed ? 'text-slate-300 bg-slate-800/50' : 'text-slate-600 bg-transparent'}`}>
                                      <scope.icon size={12} className={scope.allowed ? 'text-blue-400' : 'text-slate-700'} />
                                      <span className={!scope.allowed ? 'line-through decoration-slate-700' : ''}>{scope.label}</span>
                                  </div>
                              ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                  <Clock size={12} />
                                  <span>Expires in <span className={expiring ? 'text-amber-400' : 'text-slate-300'}>{perm.remaining} {perm.unit}</span></span>
                              </div>
                              <div className="flex gap-2">
                                  <button className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                                      Edit
                                  </button>
                                  <button 
                                    onClick={() => handleRevoke(perm.id)}
                                    className="text-xs font-bold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-colors"
                                  >
                                      Revoke
                                  </button>
                              </div>
                          </div>
                      </div>
                  )})}

                  {/* Empty State Slot (if needed, purely visual filler for balance) */}
                  {permissions.length % 2 !== 0 && (
                      <div className="bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed p-5 flex flex-col items-center justify-center text-slate-600 gap-2 hover:bg-slate-900/50 hover:border-slate-700 transition-colors cursor-pointer" onClick={() => setShowGrantModal(true)}>
                          <div className="p-3 bg-slate-800 rounded-full">
                              <Plus size={20} />
                          </div>
                          <span className="text-sm font-medium">Add New Provider</span>
                      </div>
                  )}
              </div>
          </div>

          {/* --- RIGHT COLUMN: ID Widget & Stats --- */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
              
              {/* Compact Universal ID Widget */}
              <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-2xl p-1 border border-emerald-500/20 relative overflow-hidden group">
                  <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-5 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg text-white shadow-lg">
                                  <Shield size={16} fill="currentColor" />
                              </div>
                              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Universal ID</span>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      </div>
                      
                      <div className="text-center mb-4">
                           <div className="bg-white p-2 rounded-lg inline-block shadow-md mb-2">
                               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=WR-8921-XKA9-22`} alt="ID QR" className="w-24 h-24 mix-blend-multiply" />
                           </div>
                           <div className="font-mono text-sm font-bold text-slate-200 tracking-wider">WR-8921-XKA9-22</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                          <button className="flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors">
                              <Copy size={12} /> Copy ID
                          </button>
                          <button className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
                              <Share2 size={12} /> Share
                          </button>
                      </div>
                  </div>
              </div>

              {/* Data Stats */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Statistics (30d)</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg">
                              <Eye size={16} />
                          </div>
                          <div>
                              <div className="text-lg font-bold text-slate-200">24</div>
                              <div className="text-[10px] text-slate-500 uppercase">Records Viewed</div>
                          </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-900/20 text-purple-400 rounded-lg">
                              <FilePlus size={16} />
                          </div>
                          <div>
                              <div className="text-lg font-bold text-slate-200">5</div>
                              <div className="text-[10px] text-slate-500 uppercase">New Records Added</div>
                          </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-600" />
                  </div>
              </div>

          </div>
      </div>

      {/* --- BOTTOM SECTION: Detailed Logs --- */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm mt-8">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/30">
              <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <Database size={18} className="text-slate-500" /> Immutable Access Log
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Real-time ledger of all interactions with your health data.</p>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input 
                          type="text" 
                          value={searchLog}
                          onChange={(e) => setSearchLog(e.target.value)}
                          placeholder="Search logs..." 
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                  </div>
                  <div className="relative">
                      <select 
                          value={filterType}
                          onChange={(e: any) => setFilterType(e.target.value)}
                          className="appearance-none bg-slate-900 border border-slate-700 text-slate-300 text-sm font-medium py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                          <option value="ALL">All Actions</option>
                          <option value="READ">Read Only</option>
                          <option value="WRITE">Write Only</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                  </div>
              </div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-xs">
                      <tr>
                          <th className="px-6 py-4 font-bold tracking-wider">Timestamp</th>
                          <th className="px-6 py-4 font-bold tracking-wider">Actor</th>
                          <th className="px-6 py-4 font-bold tracking-wider">Action</th>
                          <th className="px-6 py-4 font-bold tracking-wider">Resource Accessed</th>
                          <th className="px-6 py-4 font-bold tracking-wider text-right">Verification</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{log.date}</td>
                              <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-slate-700">
                                      {log.actor.charAt(0)}
                                  </div>
                                  {log.actor}
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${
                                      log.action === 'WRITE' 
                                      ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' 
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}>
                                      {log.action}
                                  </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-300">{log.resource}</td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 text-emerald-500 text-xs font-mono opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline">
                                      <CheckCircle size={14} /> {log.hash}
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                          <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                  No logs found matching your criteria.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex justify-center">
              <button className="text-xs text-slate-500 hover:text-blue-400 font-medium transition-colors">Load older logs</button>
          </div>
      </div>

       {/* Enhanced Grant Access Modal */}
       {showGrantModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                   {/* Modal Header */}
                   <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <div>
                             <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                 <Shield className="text-blue-500" size={24} /> Grant Access
                             </h3>
                             <p className="text-slate-400 text-sm mt-1">Configure granular permissions for external providers.</p>
                        </div>
                        <button onClick={() => setShowGrantModal(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"><X size={20}/></button>
                   </div>
                   
                   {/* Modal Body */}
                   <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                       
                       {/* 1. Recipient */}
                       <div className="space-y-3">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider / Recipient</label>
                           <div className="relative">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                               <input 
                                    type="text" 
                                    value={grantProviderName}
                                    onChange={(e) => setGrantProviderName(e.target.value)}
                                    placeholder="Enter Provider Name, ID, or Wallet Address" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3.5 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600" 
                               />
                           </div>
                       </div>

                       {/* 2. Role Selection */}
                       <div className="space-y-3">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Level</label>
                           <div className="grid md:grid-cols-3 gap-3">
                               {/* Doctor Role */}
                               <div 
                                    onClick={() => setGrantRole('doctor')}
                                    className={`cursor-pointer p-4 rounded-xl border transition-all relative ${grantRole === 'doctor' ? 'bg-blue-900/20 border-blue-500/50 shadow-lg shadow-blue-900/20' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                               >
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${grantRole === 'doctor' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                       <Stethoscope size={18} />
                                   </div>
                                   <h4 className={`font-bold text-sm mb-1 ${grantRole === 'doctor' ? 'text-white' : 'text-slate-300'}`}>Full Access</h4>
                                   <p className="text-xs text-slate-500 leading-snug">For Doctors. Diagnose, Prescribe, View All.</p>
                                   {grantRole === 'doctor' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle size={16} /></div>}
                               </div>

                               {/* Diagnostic Role */}
                               <div 
                                    onClick={() => setGrantRole('diagnostic')}
                                    className={`cursor-pointer p-4 rounded-xl border transition-all relative ${grantRole === 'diagnostic' ? 'bg-purple-900/20 border-purple-500/50 shadow-lg shadow-purple-900/20' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                               >
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${grantRole === 'diagnostic' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                       <UploadCloud size={18} />
                                   </div>
                                   <h4 className={`font-bold text-sm mb-1 ${grantRole === 'diagnostic' ? 'text-white' : 'text-slate-300'}`}>Limited Upload</h4>
                                   <p className="text-xs text-slate-500 leading-snug">For Labs. Upload Test Results Only.</p>
                                   {grantRole === 'diagnostic' && <div className="absolute top-3 right-3 text-purple-500"><CheckCircle size={16} /></div>}
                               </div>

                               {/* Pharmacy Role */}
                               <div 
                                    onClick={() => setGrantRole('pharmacy')}
                                    className={`cursor-pointer p-4 rounded-xl border transition-all relative ${grantRole === 'pharmacy' ? 'bg-emerald-900/20 border-emerald-500/50 shadow-lg shadow-emerald-900/20' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                               >
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${grantRole === 'pharmacy' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                       <Pill size={18} />
                                   </div>
                                   <h4 className={`font-bold text-sm mb-1 ${grantRole === 'pharmacy' ? 'text-white' : 'text-slate-300'}`}>View Rx Only</h4>
                                   <p className="text-xs text-slate-500 leading-snug">For Pharmacists. View Prescriptions.</p>
                                   {grantRole === 'pharmacy' && <div className="absolute top-3 right-3 text-emerald-500"><CheckCircle size={16} /></div>}
                               </div>
                           </div>
                       </div>

                       {/* 3. Scope Preview & Duration */}
                       <div className="grid md:grid-cols-2 gap-6 pt-2">
                           <div className="space-y-3">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Granted Permissions</label>
                               <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                   {getScopesForRole(grantRole).map((scope, idx) => (
                                       <div key={idx} className={`flex items-center gap-3 text-xs ${scope.allowed ? 'text-slate-200' : 'text-slate-600 opacity-50'}`}>
                                           {scope.allowed ? <Check size={14} className="text-blue-500" /> : <X size={14} />}
                                           <div className="flex items-center gap-2">
                                               <scope.icon size={12} />
                                               <span className={!scope.allowed ? 'line-through' : ''}>{scope.label}</span>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>

                           <div className="space-y-3">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                               <div className="grid grid-cols-2 gap-2">
                                   {['2', '7', '12', '24'].map((d) => (
                                       <button 
                                           key={d}
                                           onClick={() => setGrantDuration(d)}
                                           className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                                               grantDuration === d 
                                               ? 'bg-blue-600 text-white border-blue-500' 
                                               : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                                           }`}
                                       >
                                           {d} Hours
                                       </button>
                                   ))}
                               </div>
                               <div className="flex items-center gap-2 p-3 bg-amber-900/10 border border-amber-900/20 rounded-lg text-xs text-amber-500/80 mt-2">
                                   <AlertTriangle size={14} />
                                   Access auto-revokes after {grantDuration} hours.
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* Footer */}
                   <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex gap-3">
                       <button onClick={() => setShowGrantModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors">Cancel</button>
                       <button 
                            onClick={handleGrantConfirm}
                            disabled={!grantProviderName}
                            className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           Confirm Access Grant
                       </button>
                   </div>
               </div>
          </div>
       )}
    </div>
  );
};