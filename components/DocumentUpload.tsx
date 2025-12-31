import React, { useState, useRef } from 'react';
import { extractDocumentData } from '../services/geminiService';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, X, Clock, Image as ImageIcon, MoreVertical, Shield, Zap, ScanLine, FileCheck, ChevronRight } from 'lucide-react';

const RECENT_UPLOADS = [
  { id: 1, name: 'Blood_Work_May_2024.jpg', type: 'Lab Result', date: '2 hrs ago', status: 'Processed', size: '2.4 MB' },
  { id: 2, name: 'Prescription_Amoxicillin.png', type: 'Prescription', date: 'Yesterday', status: 'Processed', size: '1.1 MB' },
  { id: 3, name: 'Annual_Physical_Report.pdf', type: 'Clinical Note', date: 'May 10, 2024', status: 'Pending', size: '4.2 MB' },
];

export const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFileSelection(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedFile = e.dataTransfer.files?.[0];
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        processFileSelection(selectedFile);
      }
  };

  const processFileSelection = (selectedFile: File) => {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
  };

  const processDocument = async () => {
    if (!preview || !file) return;
    
    setLoading(true);
    setError(null);
    try {
        const base64Data = preview.split(',')[1];
        const data = await extractDocumentData(base64Data, file.type);
        setResult(data);
    } catch (err) {
        setError("Failed to extract data. Please ensure the document is legible.");
    } finally {
        setLoading(false);
    }
  };

  const reset = () => {
      setFile(null);
      setPreview(null);
      setResult(null);
      setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
             <ScanLine className="text-blue-500" /> AI Document Scanner
           </h2>
           <p className="text-slate-500">Transform physical records into secure digital data.</p>
        </div>
        <div className="flex gap-3">
             <div className="px-3 py-1.5 bg-blue-900/20 text-blue-400 text-xs font-bold uppercase rounded-lg border border-blue-900/30 flex items-center gap-2">
                 <Zap size={14} /> Gemini Vision 2.5
             </div>
             <div className="px-3 py-1.5 bg-emerald-900/20 text-emerald-400 text-xs font-bold uppercase rounded-lg border border-emerald-900/30 flex items-center gap-2">
                 <Shield size={14} /> Encrypted Upload
             </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start h-full">
         
         {/* LEFT COLUMN: Upload & History */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Compact Upload Zone */}
            <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`
                    relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group min-h-[220px] flex flex-col items-center justify-center
                    ${file 
                        ? 'border-blue-500/50 bg-slate-900' 
                        : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    }
                `}
            >
                {!file ? (
                    <>
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="text-white" size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                            Click to Upload or Drag File
                        </h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
                            Support for JPG, PNG. Optimized for Lab Reports, Prescriptions, and Clinical Notes.
                        </p>
                    </>
                ) : (
                    <div className="w-full h-full p-6 flex items-center gap-6 relative z-10">
                        <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-700 shadow-xl shrink-0 bg-black">
                            {preview && <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-slate-200 truncate">{file.name}</h4>
                            <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            
                            <div className="flex gap-3 mt-4">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); processDocument(); }}
                                    disabled={loading || result}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                    {loading ? 'Scanning...' : 'Extract Data'}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); reset(); }}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold border border-slate-700 transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* 2. Recent Uploads Section */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                    <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">Recent Documents</h3>
                    <button className="text-blue-400 text-xs font-bold hover:underline">View All</button>
                </div>
                <div>
                    {RECENT_UPLOADS.map((doc) => (
                        <div key={doc.id} className="px-6 py-4 border-b border-slate-800 hover:bg-slate-800/40 transition-colors flex items-center justify-between group last:border-0">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${
                                    doc.type === 'Lab Result' ? 'bg-blue-900/20 text-blue-400' : 
                                    doc.type === 'Prescription' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-amber-900/20 text-amber-400'
                                }`}>
                                    {doc.type === 'Lab Result' ? <Zap size={18} /> : doc.type === 'Prescription' ? <FileText size={18} /> : <FileCheck size={18} />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{doc.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>{doc.type}</span>
                                        <span>•</span>
                                        <span>{doc.size}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400">{doc.date}</div>
                                    <div className="text-[10px] text-emerald-500 flex items-center gap-1 justify-end mt-0.5">
                                        <CheckCircle size={10} /> {doc.status}
                                    </div>
                                </div>
                                <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* RIGHT COLUMN: Analysis & Info */}
         <div className="lg:col-span-1 h-full">
            <div className={`h-full bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl transition-all ${result ? 'ring-2 ring-blue-500/20' : ''}`}>
                
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">Extraction Results</span>
                    {result && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">CONFIDENCE 98%</span>}
                </div>

                <div className="flex-1 p-6 relative">
                    
                    {/* Empty State / Capabilities Guide */}
                    {!loading && !result && !error && (
                        <div className="space-y-6">
                           <div className="text-center mb-6 opacity-60">
                               <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 rotate-3 border border-slate-700">
                                   <ScanLine size={32} className="text-slate-400" />
                               </div>
                               <h4 className="text-slate-300 font-bold">Ready to Analyze</h4>
                               <p className="text-slate-500 text-xs mt-1">Upload a document to see AI in action.</p>
                           </div>

                           <div>
                               <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">What Gemini Extracts</h5>
                               <div className="space-y-3">
                                   {[
                                       { label: 'Clinical Provider', icon: Shield, color: 'text-blue-400' },
                                       { label: 'Date of Service', icon: Clock, color: 'text-amber-400' },
                                       { label: 'Diagnosis / Findings', icon: FileText, color: 'text-emerald-400' },
                                       { label: 'Medication Details', icon: CheckCircle, color: 'text-purple-400' }
                                   ].map((item, i) => (
                                       <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                           <div className={`p-1.5 rounded-md bg-slate-900 ${item.color}`}>
                                               <item.icon size={14} />
                                           </div>
                                           <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap size={20} className="text-blue-500 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-slate-300 font-medium text-sm animate-pulse">Analyzing Structure...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-red-400 font-bold text-sm">Extraction Failed</h4>
                                <p className="text-red-300/80 text-xs mt-1 leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Result State */}
                    {result && (
                         <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                             <div>
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Document Title</label>
                                 <div className="text-lg font-bold text-slate-100">{result.title || "Untitled Document"}</div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                                     <div className="text-slate-300 font-medium text-sm mt-0.5">{result.date || "N/A"}</div>
                                 </div>
                                 <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</label>
                                     <div className="text-slate-300 font-medium text-sm mt-0.5">{result.type || "Unknown"}</div>
                                 </div>
                             </div>

                             <div>
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Provider</label>
                                 <div className="text-slate-300 font-medium flex items-center gap-2">
                                    <Shield size={14} className="text-blue-500" />
                                    {result.provider || "N/A"}
                                 </div>
                             </div>

                             <div>
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">AI Summary</label>
                                 <div className="p-4 bg-slate-950 rounded-xl text-slate-400 text-sm leading-relaxed border border-slate-800 relative">
                                     <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
                                     {result.summary || "No summary available."}
                                 </div>
                             </div>
                             
                             <div className="pt-4 border-t border-slate-800">
                                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> Save to Records
                                </button>
                             </div>
                         </div>
                    )}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};