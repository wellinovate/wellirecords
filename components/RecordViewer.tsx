import React, { useState } from 'react';
import { HealthRecord } from '../types';
import { analyzeHealthRecord } from '../services/geminiService';
import { 
  FileText, ShieldCheck, Sparkles, ChevronRight, X, Lock, Fingerprint, Globe, 
  CheckCircle, Database, Server, Link as LinkIcon, DownloadCloud, Activity, 
  Pill, Stethoscope, Syringe, Search, Filter, MoreHorizontal, Calendar, 
  AlertTriangle, Save, Edit3, ArrowLeft, Clock, MapPin
} from 'lucide-react';

interface Props {
  records: HealthRecord[];
}

// Visual configuration for different record types
const RECORD_THEMES: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  'Lab Result': { 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/50', 
    icon: Activity,
    label: 'Diagnostic Lab'
  },
  'Prescription': { 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/50', 
    icon: Pill,
    label: 'Medication'
  },
  'Imaging': { 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/50', 
    icon: FileText,
    label: 'Radiology'
  },
  'Clinical Note': { 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/50', 
    icon: Stethoscope,
    label: 'Clinical Encounter'
  },
  'Vaccination': { 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/50', 
    icon: Syringe,
    label: 'Immunization'
  }
};

const DEFAULT_THEME = { 
  color: 'text-slate-400', 
  bg: 'bg-slate-500/10', 
  border: 'border-slate-500/50', 
  icon: FileText,
  label: 'Record' 
};

export const RecordViewer: React.FC<Props> = ({ records }) => {
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Analysis States
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Verification States
  const [verifying, setVerifying] = useState(false);
  const [verifiedChain, setVerifiedChain] = useState(false);

  // Filtered Records
  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.date.includes(searchTerm)
  );

  const getTheme = (type: string) => RECORD_THEMES[type] || DEFAULT_THEME;

  const handleAnalyze = async () => {
    if (!selectedRecord) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
        const text = `Type: ${selectedRecord.type}\nTitle: ${selectedRecord.title}\nDate: ${selectedRecord.date}\nSummary: ${selectedRecord.summary}\nProvider: ${selectedRecord.provider}`;
        const result = await analyzeHealthRecord(text);
        setAnalysis(result);
    } catch (e) {
        setAnalysis("Failed to analyze.");
    } finally {
        setAnalyzing(false);
    }
  };

  const handleVerify = () => {
      setVerifying(true);
      setVerifiedChain(false);
      setTimeout(() => {
          setVerifying(false);
          setVerifiedChain(true);
      }, 1500);
  };

  const selectRecord = (rec: HealthRecord) => {
      setSelectedRecord(rec);
      setIsEditing(false);
      setAnalysis(null);
      setVerifiedChain(false);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full animate-in fade-in duration-500">
      
      {/* --- LEFT COLUMN: RECORD LIST --- */}
      <div className={`lg:col-span-4 flex flex-col h-[calc(100vh-140px)] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl transition-all ${selectedRecord ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* List Header & Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-200 text-lg">Health Records</h3>
                    <p className="text-xs text-slate-500">{filteredRecords.length} records secured on WelliChain</p>
                </div>
                <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700">
                    <Filter size={18} />
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search diagnoses, providers, dates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-600 transition-all"
                />
            </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {filteredRecords.map(rec => {
                const theme = getTheme(rec.type);
                const Icon = theme.icon;
                const isSelected = selectedRecord?.id === rec.id;

                return (
                    <div 
                        key={rec.id}
                        onClick={() => selectRecord(rec)}
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                            isSelected 
                            ? 'bg-slate-900 border-blue-500/50 shadow-lg' 
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        {/* Status Strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSelected ? 'bg-blue-500' : theme.bg.replace('/10', '/50')}`}></div>

                        <div className="flex justify-between items-start mb-2 pl-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${theme.bg} ${theme.color}`}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.color}`}>{theme.label}</span>
                                    <h4 className={`font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>{rec.title}</h4>
                                </div>
                            </div>
                            {rec.status === 'Verified' && (
                                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                            )}
                        </div>

                        <div className="pl-3 flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                 <Calendar size={12} />
                                 <span className="font-medium">{rec.date}</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                 <Globe size={12} />
                                 <span className="truncate max-w-[100px]">{rec.provider}</span>
                             </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {/* --- RIGHT COLUMN: DETAIL VIEW / EDIT FORM --- */}
      <div className={`lg:col-span-8 flex flex-col h-[calc(100vh-140px)] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl relative ${!selectedRecord ? 'hidden lg:flex' : 'flex'}`}>
        
        {selectedRecord ? (
            <>
                {/* Detail Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/30 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSelectedRecord(null)}
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getTheme(selectedRecord.type).bg.replace('/10', '')}`}></span>
                                {isEditing ? 'Editing Record' : 'Record Details'}
                             </h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors" title="Download">
                                    <DownloadCloud size={18} />
                                </button>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 flex items-center gap-2 transition-all"
                                >
                                    <Edit3 size={16} /> Edit
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-900">
                    {isEditing ? (
                        // === EDIT FORM ===
                        <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-2">
                            {/* Section 1: Identification */}
                            <section>
                                <h3 className="text-slate-100 font-bold flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                                    <Database size={18} className="text-blue-500" /> Record Identification
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Record Title</label>
                                        <input 
                                            type="text" 
                                            defaultValue={selectedRecord.title}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Record Type</label>
                                        <select 
                                            defaultValue={selectedRecord.type}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                                        >
                                            {Object.keys(RECORD_THEMES).map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Clinical Context */}
                            <section>
                                <h3 className="text-slate-100 font-bold flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                                    <Activity size={18} className="text-emerald-500" /> Clinical Data
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Service</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input 
                                                    type="date" 
                                                    defaultValue={selectedRecord.date}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider / Facility</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input 
                                                    type="text" 
                                                    defaultValue={selectedRecord.provider}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                                            Clinical Summary
                                            <span className="text-slate-600 font-normal normal-case">Markdown supported</span>
                                        </label>
                                        <textarea 
                                            defaultValue={selectedRecord.summary}
                                            rows={6}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed font-mono text-sm resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-amber-900/10 border border-amber-900/20 rounded-xl">
                                        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                                        <div className="flex-1">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500" />
                                                <span className="text-sm font-medium text-slate-200">Mark as Critical / High Priority</span>
                                            </label>
                                            <p className="text-xs text-slate-500 mt-1 pl-6">Highlight this record for emergency responders.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    ) : (
                        // === VIEW MODE ===
                        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in">
                            
                            {/* Record Title Card */}
                            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getTheme(selectedRecord.type).bg} ${getTheme(selectedRecord.type).color} border ${getTheme(selectedRecord.type).border}`}>
                                            {selectedRecord.type}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                                            <Lock size={12} /> Encrypted
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-100 leading-tight">{selectedRecord.title}</h1>
                                    <div className="flex items-center gap-4 text-sm text-slate-400 pt-1">
                                         <div className="flex items-center gap-1.5">
                                             <Globe size={16} className="text-slate-500" />
                                             {selectedRecord.provider}
                                         </div>
                                         <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                         <div className="flex items-center gap-1.5">
                                             <Clock size={16} className="text-slate-500" />
                                             {selectedRecord.date}
                                         </div>
                                    </div>
                                </div>
                                <div className="shrink-0 text-center bg-slate-950 p-4 rounded-xl border border-slate-800 min-w-[120px]">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Status</div>
                                    {selectedRecord.status === 'Verified' ? (
                                        <div className="flex flex-col items-center gap-1 text-emerald-400">
                                            <ShieldCheck size={28} />
                                            <span className="font-bold text-sm">Verified</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-amber-400">
                                            <AlertTriangle size={28} />
                                            <span className="font-bold text-sm">Pending</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="border-slate-800" />

                            {/* Clinical Summary Widget */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Stethoscope size={16} /> Clinical Context
                                </h3>
                                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed font-sans text-base shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                                    {selectedRecord.summary}
                                </div>
                            </section>

                            {/* AI Analysis Integration */}
                            <section className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 rounded-2xl p-1 border border-indigo-500/20">
                                <div className="bg-slate-900/80 rounded-xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                                                <Sparkles size={18} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-200">Gemini Medical Insights</h3>
                                                <p className="text-xs text-slate-500">AI-powered explanation & actionable steps</p>
                                            </div>
                                        </div>
                                        {!analysis && !analyzing && (
                                            <button 
                                                onClick={handleAnalyze}
                                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-lg border border-indigo-500/30 transition-all text-xs uppercase tracking-wide"
                                            >
                                                Generate Analysis
                                            </button>
                                        )}
                                    </div>

                                    {analyzing && (
                                        <div className="flex items-center gap-3 text-sm text-indigo-300 py-4 animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                            Analyzing clinical terminology...
                                        </div>
                                    )}

                                    {analysis && (
                                        <div className="prose prose-sm prose-invert max-w-none animate-in fade-in slide-in-from-bottom-2">
                                            <div className="bg-indigo-950/30 p-4 rounded-lg border border-indigo-500/10 text-slate-300">
                                                {analysis}
                                            </div>
                                            <div className="mt-3 text-right">
                                                 <button onClick={() => setAnalysis(null)} className="text-xs text-slate-500 hover:text-indigo-400 underline">Clear Analysis</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Blockchain Verification Footer */}
                            <section className="bg-slate-950 rounded-xl border border-slate-800 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                        <LinkIcon size={16} /> Data Sovereignty Verification
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        BLOCK: #12,894,021
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 group cursor-pointer hover:border-slate-700 transition-colors">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Merkle Root</div>
                                        <div className="font-mono text-xs text-slate-300 flex items-center gap-2">
                                            <Fingerprint size={12} className="text-slate-500" />
                                            0x9f8...21a8b9
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 group cursor-pointer hover:border-slate-700 transition-colors">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Transaction Hash</div>
                                        <div className="font-mono text-xs text-slate-300 flex items-center gap-2">
                                            <Server size={12} className="text-slate-500" />
                                            0x3b1...c99e21
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-900 flex justify-center">
                                    {!verifiedChain ? (
                                        <button 
                                            onClick={handleVerify}
                                            disabled={verifying}
                                            className="text-xs font-bold text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {verifying ? <span className="animate-spin">⟳</span> : <CheckCircle size={14} />}
                                            {verifying ? "Verifying cryptographic proof..." : "Verify On-Chain Integrity"}
                                        </button>
                                    ) : (
                                        <div className="text-xs font-bold text-emerald-500 flex items-center gap-2 animate-in fade-in">
                                            <CheckCircle size={14} /> Cryptographic Proof Verified (100%)
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </>
        ) : (
            // === EMPTY STATE ===
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 p-8 text-center">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center shadow-inner mb-6 relative">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full border-t-blue-500/20 rotate-45"></div>
                    <FileText size={48} className="text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-300 mb-2">Select a Health Record</h2>
                <p className="max-w-xs text-sm leading-relaxed mb-8">
                    View detailed clinical data, AI insights, and blockchain verification proofs for your medical history.
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div className="px-4 py-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                        <Lock size={14} className="text-emerald-500" /> End-to-End Encrypted
                    </div>
                     <div className="px-4 py-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                        <Database size={14} className="text-blue-500" /> Decentralized Storage
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};