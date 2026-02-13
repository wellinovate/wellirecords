
import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  User, 
  Clock, 
  Calendar, 
  Activity, 
  Heart, 
  Wind, 
  Sparkles,
  FileText,
  ChevronRight,
  ShieldAlert,
  Wifi,
  MoreVertical,
  Maximize2,
  Share,
  Send,
  Search,
  Filter,
  Play,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Settings,
  Laptop
} from 'lucide-react';
import { TeleConsultation } from '../types';

const TelemedicineModule: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<TeleConsultation | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'scribe' | 'history'>('scribe');
  const [scribeText, setScribeText] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data
  const consultations: TeleConsultation[] = [
    {
      id: 'TC-102',
      patientName: 'Sarah Miller',
      patientId: 'did:welli:7a2...b99',
      scheduledTime: '10:30 AM',
      status: 'waiting',
      reason: 'Post-op Recovery Check',
      symptoms: ['Mild pain at incision', 'Itching', 'Low grade fever'],
      remoteVitals: {
        heartRate: 78,
        spo2: 98,
        deviceStatus: 'connected',
        lastUpdate: 'Live'
      }
    },
    {
      id: 'TC-103',
      patientName: 'David Kim',
      patientId: 'did:welli:4f1...m55',
      scheduledTime: '11:00 AM',
      status: 'scheduled',
      reason: 'Migraine Consultation',
      symptoms: ['Light sensitivity', 'Nausea', 'Aura'],
      remoteVitals: {
        heartRate: 82,
        spo2: 97,
        deviceStatus: 'offline',
        lastUpdate: '2h ago'
      }
    },
    {
      id: 'TC-104',
      patientName: 'Elena Rodriguez',
      patientId: 'did:welli:8x9...p22',
      scheduledTime: '11:30 AM',
      status: 'scheduled',
      reason: 'Dermatology Follow-up',
      symptoms: ['Rash improvement', 'Dry skin'],
      remoteVitals: {
        heartRate: 72,
        spo2: 99,
        deviceStatus: 'connected',
        lastUpdate: '10m ago'
      }
    }
  ];

  const stats = [
      { label: 'Avg Wait Time', value: '4m 12s', trend: '-12%', status: 'good' },
      { label: 'Consults Today', value: '8', trend: 'On Track', status: 'neutral' },
      { label: 'Patient Rating', value: '4.9', trend: '+0.1', status: 'good' }
  ];

  // Simulating AI Scribe generation
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected' && activeTab === 'scribe') {
        const phrases = [
            "Subjective: Patient reports adequate pain control with current regimen.",
            "Patient notes mild itching around the incision site, no redness reported.",
            "Objective: Vitals stable. Heart rate 78 bpm, SpO2 98% on room air.",
            "Assessment: Post-operative recovery proceeding as expected.",
            "Plan: Continue current pain management. Advise antihistamine for itching."
        ];
        let i = 0;
        setScribeText([]);
        interval = setInterval(() => {
            if (i < phrases.length) {
                setScribeText(prev => [...prev, phrases[i]]);
                i++;
            }
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [callStatus, activeTab]);

  const handleStartCall = (session: TeleConsultation) => {
    setSelectedSession(session);
    setCallStatus('connecting');
    setTimeout(() => {
        setCallStatus('connected');
    }, 1500);
  };

  const handleEndCall = () => {
      setCallStatus('ended');
      setTimeout(() => {
          setCallStatus('idle');
          setSelectedSession(null);
      }, 2000);
  };

  const nextPatient = consultations.find(c => c.status === 'waiting');

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      
      {/* LEFT PANEL: QUEUE & SCHEDULE (40% Width) */}
      <div className="w-[40%] flex flex-col h-full border-r border-slate-200 bg-white shadow-sm z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-6 h-6 text-blue-600" />
                    Telehealth Queue
                </h2>
                <p className="text-sm text-slate-500">Manage virtual appointments and walk-ins.</p>
            </div>
            <div className="flex gap-2">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-green-700">Online</span>
            </div>
          </div>

          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                  type="text" 
                  placeholder="Filter by patient or reason..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           
           {/* NEXT UP HERO CARD */}
           {nextPatient && !selectedSession && (
               <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="flex items-center gap-2 mb-2 px-1">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Up Next</span>
                       <span className="h-px bg-slate-200 flex-1"></span>
                   </div>
                   <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                       
                       <div className="flex justify-between items-start mb-6 relative z-10">
                           <div className="flex items-center gap-4">
                               <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl border border-white/30 shadow-inner">
                                   {nextPatient.patientName.charAt(0)}
                               </div>
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <h3 className="text-xl font-bold">{nextPatient.patientName}</h3>
                                       <span className="px-2 py-0.5 bg-green-400/20 text-green-100 text-[10px] font-bold uppercase rounded border border-green-400/30 animate-pulse">
                                           Ready Now
                                       </span>
                                   </div>
                                   <p className="text-blue-100 text-sm flex items-center gap-1">
                                       <Clock className="w-3 h-3" /> Waiting for 4m 12s
                                   </p>
                               </div>
                           </div>
                       </div>

                       <div className="space-y-3 mb-6 relative z-10">
                           <div className="flex items-start gap-2 text-sm text-blue-50 bg-white/10 p-3 rounded-lg border border-white/10">
                               <ClipboardList className="w-4 h-4 mt-0.5 flex-shrink-0" />
                               <span>{nextPatient.reason}</span>
                           </div>
                           {nextPatient.remoteVitals && (
                               <div className="flex gap-4">
                                   <div className="flex items-center gap-1.5 text-xs font-medium bg-black/20 px-2 py-1 rounded">
                                       <Heart className="w-3 h-3 text-red-300" /> {nextPatient.remoteVitals.heartRate} BPM
                                   </div>
                                   <div className="flex items-center gap-1.5 text-xs font-medium bg-black/20 px-2 py-1 rounded">
                                       <Wind className="w-3 h-3 text-sky-300" /> {nextPatient.remoteVitals.spo2}% SpO2
                                   </div>
                               </div>
                           )}
                       </div>

                       <button 
                           onClick={() => handleStartCall(nextPatient)}
                           className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
                       >
                           <Play className="w-5 h-5 fill-current" /> Start Appointment
                       </button>
                   </div>
               </div>
           )}

           {/* UPCOMING LIST */}
           <div>
               <div className="flex items-center gap-2 mb-3 px-1">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Schedule</span>
                   <span className="h-px bg-slate-200 flex-1"></span>
               </div>
               
               <div className="space-y-3">
                   {consultations.filter(c => c.status !== 'waiting' || selectedSession).map(consult => (
                       <div 
                           key={consult.id}
                           onClick={() => setSelectedSession(consult)}
                           className={`bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group ${selectedSession?.id === consult.id ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
                       >
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                       {consult.patientName.charAt(0)}
                                   </div>
                                   <div>
                                       <h4 className="font-bold text-slate-900 text-sm">{consult.patientName}</h4>
                                       <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{consult.scheduledTime}</span>
                                            <span>• Follow-up</span>
                                       </div>
                                   </div>
                               </div>
                               <button className="text-slate-300 hover:text-blue-600">
                                   <MoreVertical className="w-4 h-4" />
                               </button>
                           </div>
                           
                           <div className="pl-[52px]">
                               <p className="text-xs text-slate-600 line-clamp-1 mb-2">{consult.reason}</p>
                               <div className="flex items-center gap-2">
                                   {consult.remoteVitals?.deviceStatus === 'connected' ? (
                                       <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 font-medium">
                                           <Activity className="w-3 h-3" /> Live Vitals
                                       </span>
                                   ) : (
                                       <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                           <Wifi className="w-3 h-3" /> Offline
                                       </span>
                                   )}
                                   <span className="text-[10px] text-slate-400 flex-1 text-right">ID: {consult.id}</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        </div>
      </div>

      {/* RIGHT PANEL: DASHBOARD OR ACTIVE CALL (60% Width) */}
      <div className="w-[60%] flex flex-col h-full relative">
         
         {/* STATE 1: DASHBOARD (Idle) */}
         {!selectedSession && (
             <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex flex-col animate-in fade-in duration-500">
                 <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                         <LayoutGrid className="w-6 h-6 text-blue-600" />
                     </div>
                     <div>
                         <h1 className="text-2xl font-bold text-slate-900">Provider Dashboard</h1>
                         <p className="text-slate-500">Welcome back, Dr. Sarah Chen.</p>
                     </div>
                 </div>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-3 gap-4 mb-8">
                     {stats.map((stat, i) => (
                         <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</div>
                             <div className="flex items-end justify-between">
                                 <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                 <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                     stat.status === 'good' ? 'bg-green-50 text-green-700' :
                                     stat.status === 'bad' ? 'bg-red-50 text-red-700' :
                                     'bg-slate-100 text-slate-600'
                                 }`}>
                                     {stat.trend}
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>

                 {/* Quick Actions */}
                 <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-4 mb-8">
                     <button className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group">
                         <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                             <Calendar className="w-4 h-4" />
                         </div>
                         <div className="font-bold text-slate-900 text-sm">Schedule Appointment</div>
                         <p className="text-xs text-slate-500 mt-1">Send invite link to patient</p>
                     </button>
                     <button className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition-all text-left group">
                         <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                             <Laptop className="w-4 h-4" />
                         </div>
                         <div className="font-bold text-slate-900 text-sm">System Check</div>
                         <p className="text-xs text-slate-500 mt-1">Test camera and microphone</p>
                     </button>
                 </div>

                 {/* Recent Activity */}
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                         <h3 className="font-bold text-slate-900 text-sm">Recent Consultations</h3>
                         <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
                     </div>
                     <div className="p-4 space-y-4">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">JD</div>
                             <div className="flex-1">
                                 <div className="text-sm font-medium text-slate-900">John Doe</div>
                                 <div className="text-xs text-slate-500">General Checkup • 10:00 AM</div>
                             </div>
                             <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Completed</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">AS</div>
                             <div className="flex-1">
                                 <div className="text-sm font-medium text-slate-900">Alice Smith</div>
                                 <div className="text-xs text-slate-500">Follow-up • 09:30 AM</div>
                             </div>
                             <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Completed</span>
                         </div>
                     </div>
                 </div>
             </div>
         )}

         {/* STATE 2: ACTIVE CALL / SESSION DETAILS */}
         {selectedSession && (
             <div className="flex flex-col h-full bg-slate-900 relative">
                  {/* Top Bar Overlay */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 pointer-events-none">
                      <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 pointer-events-auto flex items-center gap-3 shadow-lg">
                           <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold border border-slate-600">
                               {selectedSession.patientName.charAt(0)}
                           </div>
                           <div>
                               <h3 className="text-white font-bold text-sm leading-tight">{selectedSession.patientName}</h3>
                               <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-wide">
                                   <ShieldAlert className="w-3 h-3" /> Encrypted
                                   <span className="w-1 h-1 rounded-full bg-green-400"></span>
                                   {selectedSession.reason}
                               </div>
                           </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedSession(null)}
                        className="pointer-events-auto p-2 bg-black/40 hover:bg-black/60 text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
                      >
                          <Maximize2 className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Main Video Stage */}
                  <div className="flex-1 flex items-center justify-center relative bg-slate-800">
                      {callStatus === 'connected' ? (
                          <>
                              {/* Remote Feed */}
                              <img 
                                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000" 
                                  alt="Patient" 
                                  className="w-full h-full object-cover"
                              />
                              
                              {/* Integrated Clinical Sidebar (Overlay) */}
                              <div className="absolute top-20 right-4 w-72 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[calc(100%-140px)] animate-in slide-in-from-right-4 duration-500">
                                  <div className="flex border-b border-white/10">
                                      <button 
                                        onClick={() => setActiveTab('scribe')}
                                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'scribe' ? 'text-blue-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}
                                      >
                                          AI Scribe
                                      </button>
                                      <button 
                                        onClick={() => setActiveTab('history')}
                                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'history' ? 'text-blue-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}
                                      >
                                          History
                                      </button>
                                  </div>
                                  
                                  <div className="p-4 overflow-y-auto flex-1">
                                      {activeTab === 'scribe' ? (
                                          <div className="space-y-3">
                                              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2 text-[10px] text-blue-200 flex gap-2">
                                                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                                                  <span>Listening & transcribing...</span>
                                              </div>
                                              {scribeText.map((text, idx) => (
                                                  <div key={idx} className="text-xs text-slate-200 pl-2 border-l-2 border-blue-400/50">
                                                      {text}
                                                  </div>
                                              ))}
                                              <div className="flex items-center gap-1 text-[10px] text-slate-500 animate-pulse">
                                                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span> Generating notes...
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="space-y-3">
                                              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                                  <div className="text-[10px] text-slate-400">Oct 15, 2023</div>
                                                  <div className="text-xs font-bold text-white mt-1">Appendectomy</div>
                                                  <div className="text-[10px] text-slate-300 mt-1">No complications reported.</div>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              {/* Self View PIP */}
                              <div className="absolute bottom-28 left-6 w-40 h-28 bg-black rounded-lg border border-white/20 shadow-xl overflow-hidden">
                                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                      <User className="w-8 h-8 text-slate-600" />
                                  </div>
                              </div>
                          </>
                      ) : (
                          <div className="text-center">
                              <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-600">
                                   <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                       {selectedSession.patientName.charAt(0)}
                                   </div>
                              </div>
                              <h2 className="text-xl font-bold text-white mb-2">
                                  {callStatus === 'connecting' ? 'Connecting to Patient...' : 'Ready for Consultation'}
                              </h2>
                              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                                  Review patient history and vitals before starting.
                              </p>
                              {callStatus === 'idle' && (
                                  <button 
                                    onClick={() => handleStartCall(selectedSession)}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 mx-auto"
                                  >
                                      <Video className="w-5 h-5" /> Start Video Call
                                  </button>
                              )}
                          </div>
                      )}
                  </div>

                  {/* Bottom Control Bar */}
                  <div className="h-24 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-30">
                      <div className="flex items-center gap-4 w-1/3">
                          {selectedSession.remoteVitals && (
                              <div className="flex gap-4">
                                   <div className="flex flex-col">
                                       <span className="text-[10px] text-slate-500 font-bold uppercase">Heart Rate</span>
                                       <div className="text-lg font-bold text-white flex items-center gap-1">
                                           {selectedSession.remoteVitals.heartRate} <span className="text-xs text-slate-500 font-normal">bpm</span>
                                       </div>
                                   </div>
                                   <div className="flex flex-col">
                                       <span className="text-[10px] text-slate-500 font-bold uppercase">SpO2</span>
                                       <div className="text-lg font-bold text-white flex items-center gap-1">
                                           {selectedSession.remoteVitals.spo2}%
                                       </div>
                                   </div>
                              </div>
                          )}
                      </div>

                      <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setMicOn(!micOn)}
                            className={`p-4 rounded-full transition-all ${micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
                          >
                              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => setCameraOn(!cameraOn)}
                            className={`p-4 rounded-full transition-all ${cameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}
                          >
                              {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={handleEndCall}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg shadow-red-900/20 transition-colors flex items-center gap-2 ml-4"
                          >
                              <PhoneOff className="w-5 h-5" /> End Appointment
                          </button>
                      </div>

                      <div className="flex items-center justify-end gap-3 w-1/3">
                           <button className="p-3 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700">
                               <Share className="w-5 h-5" />
                           </button>
                           <button className="p-3 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700">
                               <MessageSquare className="w-5 h-5" />
                           </button>
                           <button className="p-3 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700">
                               <Settings className="w-5 h-5" />
                           </button>
                      </div>
                  </div>
             </div>
         )}
      </div>
    </div>
  );
};

// Simple Icon component helper if needed, but we used Lucide directly.
const LayoutGrid = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);

export default TelemedicineModule;
