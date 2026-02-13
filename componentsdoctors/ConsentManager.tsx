import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Check, 
  X, 
  ChevronDown, 
  AlertCircle, 
  FileText, 
  Activity, 
  Fingerprint,
  History,
  Building2,
  Stethoscope,
  Microscope,
  Pill,
  Search,
  Bell,
  Clock,
  AlertTriangle,
  Eye,
  BarChart3,
  Unlock,
  BellRing,
  Siren,
  Key,
  Database,
  Link,
  Smartphone,
  CheckCircle,
  User,
  ArrowRight,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { ConsentRecord, DataScope, AccessDuration } from '../types';

interface ConsentLog {
  id: string;
  action: 'approved' | 'revoked' | 'expired' | 'modified' | 'emergency_access' | 'access_view';
  target: string;
  timestamp: string;
  details: string;
  blockHash: string;
  blockHeight: number;
}

const DATA_TYPES: { key: DataScope; label: string; icon: any; sensitive: boolean }[] = [
  { key: 'demographics', label: 'Profile', icon: User, sensitive: false },
  { key: 'clinical_notes', label: 'Notes', icon: FileText, sensitive: false },
  { key: 'medications', label: 'Meds', icon: Pill, sensitive: false },
  { key: 'lab_results', label: 'Labs', icon: Activity, sensitive: false },
  { key: 'genomics', label: 'Genomics', icon: Fingerprint, sensitive: true },
  { key: 'mental_health', label: 'Mental', icon: Brain, sensitive: true },
];

// Helper icon component since Brain isn't imported from lucide-react in the original list
function Brain(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 12.1 0 1 1 9.5 22 2.5 12.1 0 1 1 9.5 2z" />
      <path d="M14.5 2A2.5 12.1 0 1 0 14.5 22 2.5 12.1 0 1 0 14.5 2z" />
      <path d="M9.5 6a7.5 5 0 0 1 5 0" />
      <path d="M9.5 18a7.5 5 0 0 0 5 0" />
    </svg>
  );
}

const ConsentManager: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'emergency' | 'history'>('overview');
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'sensitive' | 'pending'>('all');

  // Mock State for Pending Requests
  const [requests, setRequests] = useState<ConsentRecord[]>([
    {
      id: 'req_1',
      providerName: 'University Research Hospital',
      providerType: 'research',
      trustScore: 98,
      lastAccess: 'Never',
      status: 'pending',
      scopes: [
        { key: 'demographics', label: 'Demographics', enabled: true, sensitive: false, duration: 'forever' },
        { key: 'genomics', label: 'Genomics Data', enabled: true, sensitive: true, duration: '30d' },
      ]
    }
  ]);

  // Mock State for Active Consents
  const [consents, setConsents] = useState<ConsentRecord[]>([
    {
      id: 'con_1',
      providerName: 'Metro General Clinic',
      providerType: 'clinic',
      trustScore: 99,
      lastAccess: '2 hours ago',
      status: 'active',
      scopes: [
        { key: 'demographics', label: 'Profile', enabled: true, sensitive: false, duration: 'forever' },
        { key: 'clinical_notes', label: 'Clinical Notes', enabled: true, sensitive: false, duration: 'forever' },
        { key: 'medications', label: 'Medications', enabled: true, sensitive: false, duration: 'forever' },
        { key: 'mental_health', label: 'Mental Health', enabled: false, sensitive: true, duration: 'forever' },
        { key: 'genomics', label: 'Genomics', enabled: false, sensitive: true, duration: 'forever' },
        { key: 'lab_results', label: 'Labs', enabled: true, sensitive: false, duration: 'forever' },
      ]
    },
    {
      id: 'con_2',
      providerName: 'BioCore Labs',
      providerType: 'lab',
      trustScore: 95,
      lastAccess: '1 day ago',
      status: 'active',
      scopes: [
        { key: 'demographics', label: 'Profile', enabled: true, sensitive: false, duration: 'forever' },
        { key: 'lab_results', label: 'Lab Results', enabled: true, sensitive: false, duration: '30d' },
        { key: 'clinical_notes', label: 'Clinical Notes', enabled: false, sensitive: false, duration: 'forever' },
        { key: 'medications', label: 'Medications', enabled: false, sensitive: false, duration: 'forever' },
        { key: 'mental_health', label: 'Mental Health', enabled: false, sensitive: true, duration: 'forever' },
        { key: 'genomics', label: 'Genomics', enabled: true, sensitive: true, duration: '30d' },
      ]
    },
    {
      id: 'con_3',
      providerName: 'QuickMeds Pharmacy',
      providerType: 'pharmacy',
      trustScore: 88,
      lastAccess: '1 week ago',
      status: 'active',
      scopes: [
        { key: 'demographics', label: 'Profile', enabled: true, sensitive: false, duration: 'forever' },
        { key: 'medications', label: 'Prescriptions', enabled: true, sensitive: false, duration: '7d' },
        { key: 'lab_results', label: 'Lab Results', enabled: false, sensitive: false, duration: 'forever' },
        { key: 'clinical_notes', label: 'Clinical Notes', enabled: false, sensitive: false, duration: 'forever' },
        { key: 'mental_health', label: 'Mental Health', enabled: false, sensitive: true, duration: 'forever' },
        { key: 'genomics', label: 'Genomics', enabled: false, sensitive: true, duration: 'forever' },
      ]
    }
  ]);

  const [logs, setLogs] = useState<ConsentLog[]>([
      { id: 'l1', action: 'access_view', target: 'Metro General Clinic', timestamp: '2 hours ago', details: 'Accessed Clinical Notes', blockHash: '0x8f2...a91', blockHeight: 1402391 },
      { id: 'l2', action: 'access_view', target: 'BioCore Labs', timestamp: '1 day ago', details: 'Accessed Genomics Data', blockHash: '0x3a1...b22', blockHeight: 1400122 },
      { id: 'l3', action: 'revoked', target: 'Dr. Smith Private Practice', timestamp: '2 days ago', details: 'Full access revocation', blockHash: '0x8f2...a91', blockHeight: 1402391 },
      { id: 'l4', action: 'approved', target: 'QuickMeds Pharmacy', timestamp: '1 week ago', details: 'Prescription access granted (7 days)', blockHash: '0x3a1...b22', blockHeight: 1400122 }
  ]);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Calculate stats
  const sensitiveShares = consents.reduce((acc, c) => 
    acc + c.scopes.filter(s => s.sensitive && s.enabled).length, 0);

  const toggleScope = (consentId: string, scopeKey: DataScope) => {
    setConsents(prev => prev.map(c => {
      if (c.id !== consentId) return c;
      const newScopes = c.scopes.map(s => s.key === scopeKey ? { ...s, enabled: !s.enabled } : s);
      
      // If scope doesn't exist in the list (e.g. from mock mismatch), add it
      if (!c.scopes.find(s => s.key === scopeKey)) {
          newScopes.push({ key: scopeKey, label: scopeKey, enabled: true, sensitive: ['genomics', 'mental_health'].includes(scopeKey), duration: 'forever' });
      }

      return { ...c, scopes: newScopes };
    }));
  };

  const handleRequest = (id: string, action: 'approve' | 'deny') => {
    const req = requests.find(r => r.id === id);
    if (req && action === 'approve') {
        const newConsent = { ...req, status: 'active' as const };
        // Ensure all scopes are present for the matrix
        DATA_TYPES.forEach(dt => {
            if (!newConsent.scopes.find(s => s.key === dt.key)) {
                newConsent.scopes.push({ ...dt, enabled: false, duration: 'forever' });
            }
        });
        setConsents(prev => [newConsent, ...prev]);
        setLogs(prev => [{
            id: Date.now().toString(),
            action: 'approved',
            target: req.providerName,
            timestamp: 'Just now',
            details: 'Access request approved',
            blockHash: '0xPending...',
            blockHeight: 1402406
        }, ...prev]);
    }
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const confirmRevoke = () => {
    if (revokingId) {
        const target = consents.find(c => c.id === revokingId);
        setConsents(prev => prev.filter(c => c.id !== revokingId));
        if (target) {
            setLogs(prev => [{
                id: Date.now().toString(),
                action: 'revoked',
                target: target.providerName,
                timestamp: 'Just now',
                details: 'Full access revoked',
                blockHash: '0xPending...',
                blockHeight: 1402407
            }, ...prev]);
        }
        setRevokingId(null);
    }
  };

  const getProviderIcon = (type: string) => {
      switch(type) {
          case 'clinic': return Stethoscope;
          case 'lab': return Microscope;
          case 'pharmacy': return Pill;
          default: return Building2;
      }
  }

  // Filtered List
  const displayConsents = consents.filter(c => {
      if (filterMode === 'sensitive') {
          return c.scopes.some(s => s.sensitive && s.enabled);
      }
      return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" />
            Identity & Permission Control
          </h2>
          <p className="text-slate-500 mt-1">Manage data sharing, review access logs, and control your digital identity.</p>
        </div>
        
        {/* LIGHT THEME IDENTITY CARD */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-5 shadow-sm min-w-[380px]">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
             <User className="w-8 h-8" />
           </div>
           <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
               <span className="font-bold text-lg text-slate-900">Jane Doe</span>
               <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold rounded flex items-center gap-1 uppercase tracking-wider">
                   <CheckCircle className="w-3 h-3" /> Verified
               </span>
             </div>
             <p className="text-xs text-slate-500 font-mono tracking-wide mb-2">DID:ion:EiC5...392f</p>
             <div className="flex items-center gap-3">
                 <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                     <Smartphone className="w-3 h-3" /> MFA Config
                 </button>
                 <span className="text-slate-300">|</span>
                 <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                     <Key className="w-3 h-3" /> Biometric Keys
                 </button>
             </div>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'overview' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Lock className="w-4 h-4" /> Permissions Matrix
          </button>
          <button 
            onClick={() => setActiveTab('emergency')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'emergency' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-red-600'}`}
          >
              <Siren className="w-4 h-4" />
              Emergency Rules
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Database className="w-4 h-4" />
              Audit Log
          </button>
      </div>

      {/* TAB CONTENT: OVERVIEW (MATRIX) */}
      {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              
              {/* Top Section: Activity & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Actionable Stat Buttons */}
                  <div className="space-y-4">
                      <div 
                        onClick={() => setFilterMode('all')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${filterMode === 'all' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg border border-slate-100 text-blue-600 shadow-sm group-hover:scale-110 transition-transform"><Building2 className="w-5 h-5" /></div>
                              <div>
                                  <div className="font-bold text-slate-900">Active Providers</div>
                                  <div className="text-xs text-slate-500">Manage connections</div>
                              </div>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{consents.length}</div>
                      </div>

                      <div 
                        onClick={() => setFilterMode('sensitive')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${filterMode === 'sensitive' ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-slate-200 hover:border-purple-300'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg border border-slate-100 text-purple-600 shadow-sm group-hover:scale-110 transition-transform"><AlertTriangle className="w-5 h-5" /></div>
                              <div>
                                  <div className="font-bold text-slate-900">Sensitive Shares</div>
                                  <div className="text-xs text-slate-500">Genomics / Mental Health</div>
                              </div>
                          </div>
                          <div className="text-2xl font-bold text-purple-700">{sensitiveShares}</div>
                      </div>

                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors group">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg border border-amber-100 text-amber-600 shadow-sm group-hover:scale-110 transition-transform"><Bell className="w-5 h-5" /></div>
                              <div>
                                  <div className="font-bold text-slate-900">Pending Requests</div>
                                  <div className="text-xs text-amber-800">Action required</div>
                              </div>
                          </div>
                          <div className="text-2xl font-bold text-amber-700">{requests.length}</div>
                      </div>
                  </div>

                  {/* Live Activity Feed */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                              <Activity className="w-4 h-4 text-teal-600" /> Recent Data Access
                          </h3>
                          <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> LIVE
                          </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-0">
                          {logs.slice(0, 4).map((log, idx) => (
                              <div key={idx} className="p-3 flex items-start gap-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                      log.action === 'revoked' ? 'bg-red-500' : 
                                      log.details.includes('Sensitive') ? 'bg-purple-500' : 'bg-teal-500'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                          <p className="text-sm font-medium text-slate-900 truncate">
                                              <span className="font-bold">{log.target}</span> <span className="font-normal text-slate-600">{log.action === 'access_view' ? 'viewed' : log.action}</span> {log.details.replace('Accessed ', '')}
                                          </p>
                                          <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{log.timestamp}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* PERMISSION MATRIX */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                          <Lock className="w-5 h-5 text-teal-600" />
                          Access Control Matrix
                      </h3>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 mr-2">Legend:</span>
                          <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 font-bold"><Check className="w-3 h-3" /> Standard</span>
                          <span className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 font-bold"><AlertTriangle className="w-3 h-3" /> Sensitive</span>
                      </div>
                  </div>

                  {/* Pending Requests Section within Matrix */}
                  {requests.length > 0 && filterMode !== 'sensitive' && (
                      <div className="bg-amber-50/50 border-b border-amber-100">
                          {requests.map(req => (
                              <div key={req.id} className="p-4 flex items-center justify-between border-b border-amber-100 last:border-0">
                                  <div className="flex items-center gap-4">
                                      <div className="p-2 bg-white rounded-lg border border-amber-200 text-amber-600 shadow-sm">
                                          <BellRing className="w-5 h-5 animate-pulse" />
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-900">{req.providerName}</h4>
                                          <div className="text-xs text-amber-800 mt-0.5">
                                              Requesting access to: <b>{req.scopes.map(s => s.label).join(', ')}</b>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleRequest(req.id, 'deny')} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded hover:bg-slate-50">Deny</button>
                                      <button onClick={() => handleRequest(req.id, 'approve')} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded hover:bg-teal-700 shadow-sm">Approve Access</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* The Matrix Table */}
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                  <th className="px-6 py-4 font-bold w-64 bg-slate-50 sticky left-0 z-10 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">Provider</th>
                                  {DATA_TYPES.map(type => (
                                      <th key={type.key} className={`px-4 py-4 font-bold text-center border-l border-slate-200 ${type.sensitive ? 'text-purple-700 bg-purple-50/30' : ''}`}>
                                          <div className="flex flex-col items-center gap-1">
                                              <type.icon className="w-4 h-4 mb-1" />
                                              {type.label}
                                              {type.sensitive && <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded">SENSITIVE</span>}
                                          </div>
                                      </th>
                                  ))}
                                  <th className="px-6 py-4 font-bold text-right border-l border-slate-200">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                              {displayConsents.map(consent => {
                                  const ProviderIcon = getProviderIcon(consent.providerType);
                                  return (
                                      <tr key={consent.id} className="hover:bg-slate-50/80 transition-colors group">
                                          {/* Provider Column */}
                                          <td className="px-6 py-4 bg-white group-hover:bg-slate-50/80 sticky left-0 z-10 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] border-r border-slate-100">
                                              <div className="flex items-center gap-3">
                                                  <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                                                      <ProviderIcon className="w-5 h-5" />
                                                  </div>
                                                  <div>
                                                      <div className="font-bold text-slate-900">{consent.providerName}</div>
                                                      <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                                                          {consent.providerType}
                                                          {consent.trustScore > 90 && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                      </div>
                                                  </div>
                                              </div>
                                          </td>

                                          {/* Permission Columns */}
                                          {DATA_TYPES.map(type => {
                                              const scope = consent.scopes.find(s => s.key === type.key);
                                              const isEnabled = scope?.enabled;
                                              const isSensitive = type.sensitive;
                                              
                                              return (
                                                  <td key={type.key} className="px-4 py-4 text-center border-l border-slate-100 relative">
                                                      <button 
                                                          onClick={() => toggleScope(consent.id, type.key)}
                                                          className={`
                                                              w-full h-10 rounded-lg flex items-center justify-center transition-all duration-200
                                                              ${isEnabled 
                                                                  ? (isSensitive 
                                                                      ? 'bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200' 
                                                                      : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200')
                                                                  : 'bg-slate-50 text-slate-300 border border-transparent hover:border-slate-300 hover:text-slate-400'
                                                              }
                                                          `}
                                                      >
                                                          {isEnabled ? (
                                                              <div className="flex flex-col items-center">
                                                                  {isSensitive && <AlertTriangle className="w-3 h-3 mb-0.5" />}
                                                                  <Check className="w-4 h-4" />
                                                                  {scope?.duration !== 'forever' && <span className="text-[9px] font-bold uppercase mt-0.5">{scope?.duration}</span>}
                                                              </div>
                                                          ) : (
                                                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                          )}
                                                      </button>
                                                  </td>
                                              );
                                          })}

                                          {/* Actions Column */}
                                          <td className="px-6 py-4 text-right border-l border-slate-100">
                                              <div className="flex flex-col items-end gap-1">
                                                  <span className="text-[10px] text-slate-400">Last access: {consent.lastAccess}</span>
                                                  <button 
                                                      onClick={() => setRevokingId(consent.id)}
                                                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                                                  >
                                                      <X className="w-3 h-3" /> Revoke
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* TAB CONTENT: EMERGENCY */}
      {activeTab === 'emergency' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-red-100 text-red-600 rounded-full">
                      <Siren className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-900">Break Glass Protocol</h3>
                      <p className="text-sm text-red-700 mt-1 max-w-2xl">
                          Enabling this allows verified Emergency Department personnel immediate, temporary access to your full medical history (including sensitive data) for 4 hours.
                          Access events are immutably logged and trigger immediate alerts to your trusted guardians.
                      </p>
                  </div>
                  <div>
                      <button 
                        onClick={() => {
                            setEmergencyActive(!emergencyActive);
                            setLogs(prev => [{
                                id: Date.now().toString(),
                                action: 'emergency_access',
                                target: 'System Wide',
                                timestamp: 'Just now',
                                details: !emergencyActive ? 'Break Glass: Emergency Access ENABLED' : 'Emergency Access DISABLED',
                                blockHash: '0xCritical...',
                                blockHeight: 1402408
                            }, ...prev]);
                        }}
                        className={`px-6 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 ${
                            emergencyActive 
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' 
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                          {emergencyActive ? 'DISABLE Emergency Access' : 'ENABLE Emergency Access'}
                      </button>
                  </div>
              </div>
              {/* Emergency details placeholder for brevity - standard card layout */}
              <div className="bg-white p-8 text-center text-slate-400 border border-slate-200 rounded-xl">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Emergency Contacts and Data Packets configuration.</p>
              </div>
          </div>
      )}

      {/* TAB CONTENT: HISTORY (Blockchain View) */}
      {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Link className="w-5 h-5 text-teal-600" />
                      Immutable Audit Ledger
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Node Synced
                  </div>
              </div>
              <div className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${
                                log.action === 'approved' ? 'bg-green-100 text-green-600' : 
                                log.action === 'revoked' ? 'bg-red-100 text-red-600' :
                                log.action === 'emergency_access' ? 'bg-red-600 text-white animate-pulse' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                                {log.action === 'approved' ? <Check className="w-4 h-4" /> : 
                                    log.action === 'revoked' ? <X className="w-4 h-4" /> :
                                    log.action === 'emergency_access' ? <Siren className="w-4 h-4" /> :
                                    <Eye className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-900 text-sm truncate pr-2">{log.target}</h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                                
                                <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-100/50">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                        <Database className="w-3 h-3" />
                                        Block #{log.blockHeight}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                        <Link className="w-3 h-3" />
                                        Hash: <span className="text-teal-600">{log.blockHash}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
          </div>
      )}

      {/* Confirmation Modal */}
      {revokingId && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setRevokingId(null)}
        >
            <div 
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full flex-shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Revoke Access?</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Are you sure you want to revoke all data access permissions for this provider? This action will stop any ongoing data synchronization immediately.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={() => setRevokingId(null)}
                        className="px-4 py-2 text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmRevoke}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm shadow-red-200 transition-colors"
                    >
                        Yes, Revoke Access
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ConsentManager;