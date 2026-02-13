
import React, { useState, useEffect, useRef } from 'react';
import { 
  Microscope, 
  FlaskConical, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  User, 
  FileText,
  Upload,
  BrainCircuit,
  Save,
  Send,
  X,
  Siren,
  BellRing,
  Radio,
  Check,
  Paperclip,
  Image as ImageIcon,
  Trash2,
  Loader2,
  ShieldCheck,
  FileJson,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Filter,
  MoreHorizontal,
  Printer,
  Share2,
  ArrowLeft,
  Calendar,
  Layers
} from 'lucide-react';
import { LabOrder, LabResultAnalyte } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image';
  status: 'scanning' | 'compliant' | 'error';
  issues?: string[];
}

// Enhanced Lab Order Type for UI
interface LabOrderUI extends LabOrder {
  trendData: { value: number }[];
  selected?: boolean;
}

const INITIAL_ANALYTES: LabResultAnalyte[] = [
  { 
    id: 'a1', 
    name: 'Glucose', 
    value: '142', 
    unit: 'mg/dL', 
    range: '70-99', 
    flag: 'abnormal', 
    history: [
      { date: 'Jan', value: 98 }, { date: 'Mar', value: 105 }, { date: 'Jun', value: 115 }, { date: 'Sep', value: 130 }, { date: 'Oct', value: 142 }
    ] 
  },
  { 
    id: 'a2', 
    name: 'BUN', 
    value: '18', 
    unit: 'mg/dL', 
    range: '6-20', 
    flag: 'normal',
    history: [
      { date: 'Jan', value: 15 }, { date: 'Mar', value: 16 }, { date: 'Jun', value: 18 }, { date: 'Sep', value: 17 }, { date: 'Oct', value: 18 }
    ]
  },
  { 
    id: 'a3', 
    name: 'Creatinine', 
    value: '0.9', 
    unit: 'mg/dL', 
    range: '0.6-1.2', 
    flag: 'normal',
    history: [
      { date: 'Jan', value: 0.8 }, { date: 'Mar', value: 0.85 }, { date: 'Jun', value: 0.9 }, { date: 'Sep', value: 0.88 }, { date: 'Oct', value: 0.9 }
    ]
  },
  { 
    id: 'a4', 
    name: 'Sodium', 
    value: '139', 
    unit: 'mmol/L', 
    range: '134-144', 
    flag: 'normal',
    history: [
      { date: 'Jan', value: 140 }, { date: 'Mar', value: 138 }, { date: 'Jun', value: 141 }, { date: 'Sep', value: 139 }, { date: 'Oct', value: 139 }
    ]
  },
   { 
    id: 'a5', 
    name: 'Potassium', 
    value: '5.8', 
    unit: 'mmol/L', 
    range: '3.5-5.2', 
    flag: 'critical',
    history: [
      { date: 'Jan', value: 4.2 }, { date: 'Mar', value: 4.5 }, { date: 'Jun', value: 4.8 }, { date: 'Sep', value: 5.1 }, { date: 'Oct', value: 5.8 }
    ]
  }
];

const LabModule: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<LabOrderUI | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [notifyProvider, setNotifyProvider] = useState(true);
  const [notifyPatient, setNotifyPatient] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveDraftSuccess, setSaveDraftSuccess] = useState(false);
  
  // Grid View States
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'stat' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Real-time Validation State
  const [analytes, setAnalytes] = useState<LabResultAnalyte[]>(INITIAL_ANALYTES);

  // Attachment State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Data for Orders with Trend Data
  const [orders, setOrders] = useState<LabOrderUI[]>([
    { 
      id: 'ORD-2023-849', 
      patientName: 'James Wilson', 
      patientId: 'did:welli:1c4...e33', 
      requester: 'Dr. Sarah Chen', 
      testName: 'Comprehensive Metabolic Panel', 
      priority: 'stat', 
      status: 'pending', 
      receivedAt: '10 min ago', 
      specimenId: 'SP-99281',
      trendData: [{ value: 40 }, { value: 35 }, { value: 50 }, { value: 65 }, { value: 80 }]
    },
    { 
      id: 'ORD-2023-848', 
      patientName: 'Maria Rodriguez', 
      patientId: 'did:welli:9b2...k12', 
      requester: 'TeleHealth Connect', 
      testName: 'Lipid Panel', 
      priority: 'routine', 
      status: 'pending', 
      receivedAt: '25 min ago', 
      specimenId: 'SP-99274',
      trendData: [{ value: 180 }, { value: 175 }, { value: 170 }, { value: 168 }, { value: 165 }]
    },
    { 
      id: 'ORD-2023-847', 
      patientName: 'David Kim', 
      patientId: 'did:welli:4f1...m55', 
      requester: 'Metro General Clinic', 
      testName: 'HbA1c', 
      priority: 'routine', 
      status: 'processing', 
      receivedAt: '1 hour ago', 
      specimenId: 'SP-99260',
      trendData: [{ value: 5.4 }, { value: 5.6 }, { value: 5.9 }, { value: 6.1 }, { value: 6.3 }]
    },
    { 
      id: 'ORD-2023-846', 
      patientName: 'Elena Gilbert', 
      patientId: 'did:welli:7x9...p22', 
      requester: 'City Hospital', 
      testName: 'Thyroid Panel', 
      priority: 'urgent', 
      status: 'pending', 
      receivedAt: '1.5 hours ago', 
      specimenId: 'SP-99255',
      trendData: [{ value: 2.1 }, { value: 2.4 }, { value: 1.8 }, { value: 2.9 }, { value: 3.2 }]
    },
    { 
      id: 'ORD-2023-845', 
      patientName: 'Marcus Johnson', 
      patientId: 'did:welli:3k2...m99', 
      requester: 'Dr. Emily Wong', 
      testName: 'CBC with Diff', 
      priority: 'routine', 
      status: 'completed', 
      receivedAt: '3 hours ago', 
      specimenId: 'SP-99240',
      trendData: [{ value: 12 }, { value: 12.5 }, { value: 11.8 }, { value: 12.2 }, { value: 12.1 }]
    },
  ]);

  // Reset state when order changes
  useEffect(() => {
    setSubmissionStatus('idle');
    setNotifyProvider(true);
    setNotifyPatient(false);
    setAttachments([]);
    setAnalytes(JSON.parse(JSON.stringify(INITIAL_ANALYTES)));
    setSaveDraftSuccess(false);
  }, [selectedOrder]);

  const hasCriticalResults = analytes.some(a => a.flag === 'critical');

  const handleResultChange = (id: string, newVal: string) => {
    setAnalytes(prev => prev.map(item => {
      if (item.id !== id) return item;
      const num = parseFloat(newVal);
      let newFlag: 'normal' | 'abnormal' | 'critical' = 'normal';
      if (!isNaN(num)) {
         const [min, max] = item.range.split('-').map(Number);
         const span = max - min;
         const criticalThreshold = span * 0.25; 
         if (num < min) {
             newFlag = (min - num) > criticalThreshold ? 'critical' : 'abnormal';
         } else if (num > max) {
             newFlag = (num - max) > criticalThreshold ? 'critical' : 'abnormal';
         }
      }
      return { ...item, value: newVal, flag: newFlag };
    }));
  };

  const handleSignAndRelease = () => {
    setSubmissionStatus('sending');
    setTimeout(() => {
      setSubmissionStatus('sent');
      // Update the main list in a real app
    }, 2000);
  };

  const handleSaveDraft = () => {
      setIsSavingDraft(true);
      setTimeout(() => {
          setIsSavingDraft(false);
          setSaveDraftSuccess(true);
          setTimeout(() => setSaveDraftSuccess(false), 2000);
      }, 1000);
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const selectAll = () => {
      if (selectedIds.size === filteredOrders.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredOrders.map(o => o.id)));
      }
  };

  const filteredOrders = orders.filter(order => {
      const matchesSearch = 
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === 'all') return matchesSearch;
      if (activeFilter === 'stat') return matchesSearch && (order.priority === 'stat' || order.priority === 'urgent');
      return matchesSearch && order.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'completed': return 'bg-green-100 text-green-700 border-green-200';
          case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
  };

  // Helper for visual range
  const getRangePos = (min: number, max: number, val: number) => {
      const rangeSpan = max - min;
      const visualMin = min - (rangeSpan * 0.5);
      const visualMax = max + (rangeSpan * 0.5);
      const totalSpan = visualMax - visualMin;
      const left = ((min - visualMin) / totalSpan) * 100;
      const width = ((max - min) / totalSpan) * 100;
      const marker = Math.min(Math.max(((val - visualMin) / totalSpan) * 100), 100);
      return { left, width, marker };
  };

  // --- GRID VIEW RENDER ---
  const renderGridView = () => (
    <div className="flex flex-col h-full bg-slate-50/50">
        {/* Top Controls */}
        <div className="p-8 pb-0">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                 <div>
                     <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Microscope className="w-6 h-6 text-teal-600" />
                        Lab Processing Center
                     </h2>
                     <p className="text-slate-500 mt-1">Manage test orders, result entry, and analyzer integration.</p>
                 </div>
                 
                 {/* Interactive Filters */}
                 <div className="flex gap-2">
                     <button 
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${activeFilter === 'all' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                     >
                         All Orders
                     </button>
                     <button 
                        onClick={() => setActiveFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${activeFilter === 'pending' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                     >
                         Pending <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">12</span>
                     </button>
                     <button 
                        onClick={() => setActiveFilter('stat')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${activeFilter === 'stat' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                     >
                         STAT / Urgent <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs animate-pulse">2</span>
                     </button>
                     <button 
                        onClick={() => setActiveFilter('completed')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${activeFilter === 'completed' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                     >
                         Completed <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">48</span>
                     </button>
                 </div>
             </div>

             {/* Toolbar */}
             <div className="flex items-center justify-between gap-4 mb-6">
                 <div className="relative flex-1 max-w-lg">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="Search patient, test name, or order ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                     />
                 </div>
                 <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                         <input 
                            type="checkbox" 
                            checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                            onChange={selectAll}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                         />
                         Select All
                     </div>
                     {selectedIds.size > 0 && (
                         <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                             <button className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                                 <Printer className="w-3 h-3" /> Batch Print Labels ({selectedIds.size})
                             </button>
                             <button className="px-3 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm">
                                 <Layers className="w-3 h-3" /> Batch Process
                             </button>
                         </div>
                     )}
                 </div>
             </div>
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                    <div 
                        key={order.id}
                        className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all group relative overflow-hidden ${
                            selectedIds.has(order.id) ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
                        }`}
                    >
                        {/* Priority Top Border */}
                        <div className={`h-1.5 w-full ${
                            order.priority === 'stat' ? 'bg-red-500' : 
                            order.priority === 'urgent' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(order.id)}
                                        onChange={() => toggleSelection(order.id)}
                                        className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <div>
                                        <h3 
                                            onClick={() => setSelectedOrder(order)}
                                            className="font-bold text-lg text-slate-900 hover:text-teal-600 cursor-pointer transition-colors"
                                        >
                                            {order.patientName}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-mono">{order.id} • {order.patientId}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                                    order.priority === 'stat' ? 'bg-red-50 text-red-700 border-red-100' : 
                                    order.priority === 'urgent' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {order.priority}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm font-semibold text-slate-800 mb-1">{order.testName}</div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.requester}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.receivedAt}</span>
                                </div>
                            </div>

                            {/* Micro Chart Area */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4 flex items-center gap-3 group-hover:bg-slate-100 transition-colors">
                                <div className="flex-1 h-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={order.trendData}>
                                            <Area type="monotone" dataKey="value" stroke="#0f766e" fill="#ccfbf1" strokeWidth={1.5} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Last Result</div>
                                    <div className="text-xs font-bold text-slate-700">Trend Analysis</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition-colors"
                                >
                                    Enter Results
                                </button>
                                <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded border border-transparent hover:border-teal-100 transition-colors">
                                    <Printer className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  // --- DETAIL VIEW RENDER ---
  const renderDetailView = () => {
    if (!selectedOrder) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto animate-in slide-in-from-right-4 duration-300 z-20 absolute inset-0">
             {/* Header Actions */}
             <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                             <h1 className="text-xl font-bold text-slate-900">{selectedOrder.testName}</h1>
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded border border-slate-200">{selectedOrder.id}</span>
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                    selectedOrder.priority === 'stat' ? 'bg-red-50 text-red-700 border-red-100' : 
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {selectedOrder.priority}
                             </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                            Specimen ID: <span className="font-mono font-medium text-slate-700">{selectedOrder.specimenId}</span>
                            <span className="text-slate-300">|</span>
                            Collected: {selectedOrder.receivedAt}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm text-sm"
                     >
                         <Upload className="w-4 h-4" /> Upload Source
                     </button>
                     <button 
                        onClick={handleSaveDraft}
                        disabled={isSavingDraft}
                        className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 shadow-sm flex items-center gap-2 text-sm disabled:opacity-70 transition-all"
                     >
                         {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : saveDraftSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                         {saveDraftSuccess ? 'Saved!' : 'Save Draft'}
                     </button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto w-full">
                {/* Patient Banner */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 border border-teal-100">
                            <User className="w-7 h-7" />
                        </div>
                        <div>
                             <h3 className="font-bold text-lg text-slate-900">{selectedOrder.patientName}</h3>
                             <div className="flex items-center gap-3 text-sm text-slate-500">
                                 <span className="font-mono">{selectedOrder.patientId}</span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                 <span>DOB: 12/04/1982 (41y)</span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                 <span>Male</span>
                             </div>
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Ordering Provider</div>
                         <div className="flex items-center gap-2 justify-end">
                             <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">SC</div>
                             <div className="text-sm font-medium text-slate-700">{selectedOrder.requester}</div>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left Column: Result Entry */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Result Entry Form */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-teal-600" />
                                    Result Entry
                                </h3>
                                <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> FHIR R4 Validation Active
                                </span>
                            </div>
                            <table className="w-full">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold text-left border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Analyte</th>
                                        <th className="px-6 py-4">Result Value</th>
                                        <th className="px-6 py-4">Reference Range</th>
                                        <th className="px-6 py-4">History</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {analytes.map(analyte => {
                                        const [rangeMin, rangeMax] = analyte.range.split('-').map(parseFloat);
                                        const currentVal = parseFloat(analyte.value) || 0;
                                        const rangeVis = getRangePos(rangeMin, rangeMax, currentVal);
                                        
                                        const prev = analyte.history.length > 1 ? analyte.history[analyte.history.length - 2] : null;
                                        const prevVal = prev ? prev.value : 0;
                                        const delta = prev ? currentVal - prevVal : 0;
                                        const isUp = delta > 0;
                                        const isChange = delta !== 0;

                                        return (
                                            <tr key={analyte.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">{analyte.name}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={analyte.value}
                                                            onChange={(e) => handleResultChange(analyte.id, e.target.value)}
                                                            className={`w-24 px-3 py-1.5 border rounded-lg text-right font-mono font-bold transition-all focus:outline-none focus:ring-4 ${
                                                                analyte.flag === 'critical' ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-500/20' :
                                                                analyte.flag === 'abnormal' ? 'border-amber-300 bg-amber-50 text-amber-700 focus:ring-amber-500/20' :
                                                                'border-slate-300 text-slate-700 focus:ring-teal-500/20 focus:border-teal-500'
                                                            }`}
                                                        />
                                                        <span className="text-sm text-slate-500 font-medium">{analyte.unit}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-40">
                                                        <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
                                                            <span>{rangeMin}</span>
                                                            <span className="text-slate-500 font-semibold">{analyte.range}</span>
                                                            <span>{rangeMax}</span>
                                                        </div>
                                                        <div className="h-2.5 bg-slate-100 rounded-full relative overflow-visible shadow-inner">
                                                            <div 
                                                                className="absolute top-0 h-full bg-slate-300/50 rounded-full"
                                                                style={{ left: `${rangeVis.left}%`, width: `${rangeVis.width}%` }}
                                                            ></div>
                                                            {!isNaN(parseFloat(analyte.value)) && (
                                                              <div 
                                                                  className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow transition-all duration-300 ${
                                                                      analyte.flag === 'critical' ? 'bg-red-500 scale-125' : 
                                                                      analyte.flag === 'abnormal' ? 'bg-amber-500' : 'bg-teal-500'
                                                                  }`}
                                                                  style={{ left: `${rangeVis.marker}%` }}
                                                              ></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {prev ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-slate-500">{prevVal} <span className="text-[10px] font-normal opacity-75">({prev.date})</span></span>
                                                            {isChange && !isNaN(parseFloat(analyte.value)) && (
                                                                <div className={`flex items-center gap-0.5 text-[10px] font-bold ${
                                                                    isUp ? 'text-red-600' : 'text-blue-600'
                                                                }`}>
                                                                    {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                                    <span>{Math.abs(delta).toFixed(1)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">No history</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {analyte.flag !== 'normal' && (
                                                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit animate-in zoom-in duration-200 ${
                                                            analyte.flag === 'critical' ? 'bg-red-100 text-red-700 border-red-200 shadow-sm' : 
                                                            'bg-amber-100 text-amber-700 border-amber-200'
                                                        }`}>
                                                            {analyte.flag === 'critical' && <Siren className="w-3 h-3 animate-pulse" />}
                                                            {analyte.flag}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Attachments (Simplified for brevity) */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-white hover:border-teal-400 transition-colors cursor-pointer group"
                        >
                            <input type="file" ref={fileInputRef} className="hidden" onChange={() => {}} />
                            <div className="w-12 h-12 bg-white text-slate-400 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:text-teal-500 group-hover:scale-110 transition-all">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">Upload Analyzer Reports</p>
                            <p className="text-xs text-slate-500 mt-1">PDF or Image • Max 10MB</p>
                        </div>
                    </div>

                    {/* Right Column: AI Analysis & Validation */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl border border-slate-800">
                             <h3 className="font-bold flex items-center gap-2 mb-6">
                                <BrainCircuit className="w-5 h-5 text-teal-400" />
                                AI Clinical Insight
                             </h3>
                             
                             <div className="relative h-48 w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytes[4].history}>
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[3, 6]} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: 'white' }}
                                            itemStyle={{ color: '#2dd4bf' }}
                                        />
                                        <ReferenceLine y={5.2} stroke="#f87171" strokeDasharray="3 3" label={{ value: 'Critical Limit', fill: '#f87171', fontSize: 10 }} />
                                        <Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                             </div>
                             
                             <div className="text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-200">
                                <strong className="text-red-400 block mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Trend Alert</strong>
                                Potassium levels are trending upward (+38%) consistently over the last 6 months. Current value (5.8) exceeds critical threshold.
                             </div>
                        </div>

                        {/* Sign & Submit Panel */}
                        <div className={`bg-white rounded-xl border p-6 shadow-sm transition-all ${
                            hasCriticalResults ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-200'
                        }`}>
                             <h3 className="font-bold text-slate-900 mb-4">Release Authorization</h3>
                             
                             {hasCriticalResults && (
                                 <div className="mb-6">
                                     <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                         <Siren className="w-4 h-4" /> Critical Result Protocol
                                     </div>
                                     <div className="space-y-3">
                                         <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                             <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifyProvider ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
                                                 {notifyProvider && <Check className="w-3.5 h-3.5 text-white" />}
                                             </div>
                                             <input type="checkbox" checked={notifyProvider} onChange={e => setNotifyProvider(e.target.checked)} className="hidden" />
                                             <div className="flex-1">
                                                 <div className="text-sm font-bold text-slate-900">Page Provider (STAT)</div>
                                                 <div className="text-xs text-slate-500">Dr. Sarah Chen • 555-0123</div>
                                             </div>
                                         </label>
                                     </div>
                                 </div>
                             )}

                             <div className="flex items-center justify-between mb-6 pt-4 border-t border-slate-100">
                                 <div className="text-xs text-slate-500">
                                     Signing as <span className="font-bold text-slate-700">James Miller (Lab Tech)</span>
                                 </div>
                                 <div className="text-xs font-mono text-slate-400">
                                     ID: 8392-1928
                                 </div>
                             </div>

                             <button 
                                onClick={handleSignAndRelease}
                                disabled={submissionStatus !== 'idle'}
                                className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                                    hasCriticalResults 
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' 
                                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200'
                                }`}
                             >
                                {submissionStatus === 'idle' ? (
                                    <>
                                        {hasCriticalResults ? <BellRing className="w-5 h-5 animate-bounce" /> : <Send className="w-5 h-5" />}
                                        {hasCriticalResults ? 'Broadcast Critical Alert' : 'Sign & Release Results'}
                                    </>
                                ) : (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                )}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-full relative bg-slate-50/50">
       {/* Use simple conditional rendering for view swapping */}
       {selectedOrder ? renderDetailView() : renderGridView()}
    </div>
  );
};

export default LabModule;
