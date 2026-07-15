import React, { useEffect, useRef, useState } from 'react';
import { 
  Mic, MicOff, PhoneOff, Activity, Radio, Volume2, Globe, ChevronDown, Check,
  Sparkles, Shield, Lock, FileText, Calendar, Search, Keyboard, Zap, Play, Info
} from 'lucide-react';
import { AppView } from '../types';

// Language Configuration
const LANGUAGES = [
  { 
    id: 'en', 
    label: 'English', 
    flag: '🇺🇸',
    instruction: "You are Welli, an advanced empathetic health assistant. Speak clearly, concisely, and supportively in English. Help the user with their health data and wellness questions." 
  },
  { 
    id: 'pcm', 
    label: 'Pidgin English', 
    flag: '🇳🇬',
    instruction: "You are Welli, a friendly health assistant. Speak in Nigerian Pidgin English. Be relatable, warm, and use local expressions like 'How body?', 'Wetin dey worry you?', 'No wahala'. Keep medical advice simple, clear, and easy to understand." 
  },
  { 
    id: 'ha', 
    label: 'Hausa', 
    flag: '🇳🇬',
    instruction: "You are Welli. Speak primarily in Hausa. Be respectful, polite, and helpful regarding health matters. Use clear and standard Hausa terminology for medical concepts where possible." 
  },
  { 
    id: 'yo', 
    label: 'Yoruba', 
    flag: '🇳🇬',
    instruction: "You are Welli. Speak primarily in Yoruba. Be respectful (using 'Ẹ') and helpful regarding health matters. Explain medical concepts clearly in Yoruba." 
  },
  { 
    id: 'ig', 
    label: 'Igbo', 
    flag: '🇳🇬',
    instruction: "You are Welli. Speak primarily in Igbo. Be respectful and helpful regarding health matters. Ensure your Igbo is natural and clear." 
  },
];

const SUGGESTIONS = [
  { 
    id: 'labs', 
    icon: FileText, 
    label: "Analyze Results", 
    prompt: "Can you analyze my latest blood work results from May?",
    desc: "Understand your metrics" 
  },
  { 
    id: 'booking', 
    icon: Calendar, 
    label: "Schedule Visit", 
    prompt: "I need to schedule a follow-up with Dr. Chen next week.",
    desc: "Book appointments" 
  },
  { 
    id: 'vitals', 
    icon: Activity, 
    label: "Check Vitals", 
    prompt: "Is my resting heart rate of 72 bpm normal for my age?",
    desc: "Health benchmarks" 
  },
  { 
    id: 'care', 
    icon: Search, 
    label: "Find Care", 
    prompt: "Where is the nearest urgent care that accepts BlueCross?",
    desc: "Locate providers" 
  }
];

interface Props {
  onChangeView: (view: AppView) => void;
}

export const LiveAssistant: React.FC<Props> = ({ onChangeView }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [volume, setVolume] = useState(0);
  const [assistantText, setAssistantText] = useState<string>('');
  
  // Language State
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanupAudio = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    // Stop current playback source
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    // Stop stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setVolume(0);
  };

  // Convert Blob to Base64 String
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startSession = async () => {
    try {
      cleanupAudio();
      setStatus('connecting');
      setShowLangMenu(false);
      setAssistantText('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio analyzer for voice visualizer while user speaks
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Simple visualizer loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setVolume(average / 15); // Scale appropriately
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Configure MediaRecorder
      audioChunksRef.current = [];
      const options = { mimeType: 'audio/webm' };
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback for browsers that don't support audio/webm
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setStatus('connecting');
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          const base64Audio = await blobToBase64(audioBlob);

          // Call secure backend proxy
          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'voice',
              base64Audio,
              mimeType: mediaRecorder.mimeType || 'audio/webm',
              instruction: selectedLang.instruction
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const result = await response.json();
          setAssistantText(result.text || "Here is your response.");

          if (result.audio) {
            // Decode and play back the generated audio
            const audioData = Uint8Array.from(atob(result.audio), c => c.charCodeAt(0));
            const responseAudioContext = audioContextRef.current || new AudioCtx();
            if (!audioContextRef.current) {
              audioContextRef.current = responseAudioContext;
            }

            const audioBuffer = await responseAudioContext.decodeAudioData(audioData.buffer);
            
            // Connect to visualizer node during playback
            const playAnalyser = responseAudioContext.createAnalyser();
            playAnalyser.fftSize = 256;
            analyserRef.current = playAnalyser;
            playAnalyser.connect(responseAudioContext.destination);

            const playSource = responseAudioContext.createBufferSource();
            playSource.buffer = audioBuffer;
            playSource.connect(playAnalyser);
            audioSourceRef.current = playSource;

            // Simple visualizer loop for output playback
            const outputDataArray = new Uint8Array(playAnalyser.frequencyBinCount);
            const updatePlayVolume = () => {
              if (!audioSourceRef.current) return;
              playAnalyser.getByteFrequencyData(outputDataArray);
              let sum = 0;
              for (let i = 0; i < playAnalyser.frequencyBinCount; i++) {
                sum += outputDataArray[i];
              }
              const average = sum / playAnalyser.frequencyBinCount;
              setVolume(average / 15);
              animationFrameRef.current = requestAnimationFrame(updatePlayVolume);
            };
            updatePlayVolume();

            playSource.onended = () => {
              cleanupAudio();
              setStatus('idle');
              setIsActive(false);
            };

            playSource.start(0);
            setStatus('active');
          } else {
            // No audio, reset to idle
            cleanupAudio();
            setStatus('idle');
            setIsActive(false);
          }

        } catch (error) {
          console.error("Failed to process voice response:", error);
          setStatus('error');
          setIsActive(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setStatus('active');
      setIsActive(true);

    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudio();
      setIsActive(false);
      setStatus('idle');
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-500">
      
      {/* --- Top Bar: Brand & Controls --- */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                 <Radio className="text-white" size={20} />
             </div>
             <div>
                 <h2 className="text-lg font-bold text-slate-100 leading-tight">Welli Voice Assistant</h2>
                 <p className="text-xs text-blue-400 font-medium flex items-center gap-1">
                     <Zap size={10} fill="currentColor" /> Powered by Gemini 2.5
                 </p>
             </div>
         </div>

         <div className="flex items-center gap-3">
             {/* Secure Badge */}
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/20 border border-emerald-900/30 rounded-full">
                 <Lock size={12} className="text-emerald-400" />
                 <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Encrypted</span>
             </div>

             {/* Language Dropdown */}
             <div className="relative">
                <button 
                   onClick={() => !isActive && setShowLangMenu(!showLangMenu)}
                   disabled={isActive}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                       isActive 
                       ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                       : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-blue-500 hover:text-white'
                   }`}
                >
                    <Globe size={16} />
                    <span className="text-xs font-bold">{selectedLang.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                </button>

                {showLangMenu && !isActive && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 z-30">
                        <div className="p-1 space-y-0.5">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => {
                                        setSelectedLang(lang);
                                        setShowLangMenu(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                        selectedLang.id === lang.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{lang.flag}</span>
                                        {lang.label}
                                    </span>
                                    {selectedLang.id === lang.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
             </div>
         </div>
      </div>

      {/* --- Main Interactive Area --- */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden">
          
          {/* Ambient Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-30'}`}></div>
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] transition-all duration-1000 ${isActive ? 'scale-150 opacity-80' : 'scale-100 opacity-20'}`}></div>
          </div>

          {/* Status Indicator */}
          <div className="relative z-10 mb-12 flex flex-col items-center gap-3">
              <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                  status === 'active' 
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                  <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}></div>
                  {status === 'active' ? (mediaRecorderRef.current?.state === 'recording' ? 'Listening...' : 'Speaking...') : status === 'connecting' ? 'Processing Voice...' : 'Ready to Connect'}
              </div>
          </div>

          {/* Central Orb / Visualizer */}
          <div className="relative z-10 mb-12">
               <div className={`relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-700 ${status === 'active' ? 'scale-110' : 'scale-100'}`}>
                   
                   {/* Idle Rings */}
                   <div className={`absolute inset-0 rounded-full border border-slate-700/50 ${status === 'idle' ? 'scale-100' : 'scale-110 opacity-0'} transition-all`}></div>
                   <div className={`absolute inset-4 rounded-full border border-slate-800 ${status === 'idle' ? 'scale-100' : 'scale-90 opacity-0'} transition-all`}></div>

                   {/* Active Pulse Waves */}
                   {status === 'active' && (
                     <>
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute -inset-4 rounded-full border border-indigo-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
                        
                        {/* Audio Reactive Ring */}
                        <div 
                           className="absolute inset-0 rounded-full border-4 border-blue-400/50 transition-transform duration-75 ease-out"
                           style={{ transform: `scale(${1 + Math.min(volume * 0.5, 0.5)})` }}
                        ></div>
                     </>
                   )}
                   
                   {/* Center Button Area */}
                   <div className="absolute inset-2 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl z-20 overflow-hidden">
                       <div className={`absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}></div>
                       
                       {!isActive ? (
                         <button
                           onClick={startSession}
                           disabled={status === 'connecting'}
                           className="w-full h-full flex flex-col items-center justify-center gap-2 group hover:bg-slate-800/50 transition-colors"
                         >
                           {status === 'connecting' ? (
                              <Activity className="text-blue-500 animate-spin" size={40} />
                           ) : (
                              <>
                                <Mic size={40} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-widest">Tap to Speak</span>
                              </>
                           )}
                         </button>
                       ) : (
                         <button
                           onClick={stopSession}
                           className="w-full h-full flex flex-col items-center justify-center gap-2 group bg-red-900/5 hover:bg-red-900/10 transition-colors"
                         >
                           {mediaRecorderRef.current?.state === 'recording' ? (
                             <>
                               <MicOff size={40} className="text-red-500 animate-pulse" />
                               <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Stop Recording</span>
                             </>
                           ) : (
                             <>
                               <PhoneOff size={40} className="text-red-500" />
                               <span className="text-xs font-bold text-red-500 uppercase tracking-widest">End Session</span>
                             </>
                           )}
                         </button>
                       )}
                   </div>
               </div>
          </div>

          {/* Conversation Starters (The Void Filler) */}
          {!isActive && (
              <div className="relative z-10 w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-700 delay-100">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Try Asking...</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {SUGGESTIONS.map((item) => (
                          <button 
                             key={item.id}
                             onClick={startSession} // Simple Interaction: Just start session
                             className="text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all group hover:-translate-y-1 hover:shadow-lg"
                          >
                              <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors text-slate-400">
                                      <item.icon size={16} />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                              </div>
                              <p className="text-sm font-medium text-slate-300 group-hover:text-white leading-snug">
                                  "{item.prompt}"
                              </p>
                              <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play size={8} fill="currentColor" /> Tap to ask
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* Active Session Info */}
          {isActive && (
              <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-500 max-w-xl">
                  {mediaRecorderRef.current?.state === 'recording' ? (
                    <>
                      <p className="text-lg text-slate-300 font-medium mb-2">I'm listening...</p>
                      <p className="text-sm text-slate-500">Go ahead and speak. Click 'Stop Recording' when you are done.</p>
                      <div className="mt-8 flex justify-center gap-2">
                          {[1,2,3,4,5].map(i => (
                              <div key={i} className="w-1 h-8 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-lg text-blue-400 font-medium mb-2">Welli Assistant</p>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 p-4 rounded-xl">{assistantText || "Responding..."}</p>
                    </>
                  )}
              </div>
          )}
      </div>

      {/* --- Footer: Trust & Fallback --- */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-500">
              <div className="flex items-center gap-1.5">
                  <Shield size={12} /> HIPAA Compliant
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700"></div>
              <div className="flex items-center gap-1.5">
                  <Info size={12} /> Private & Confidential
              </div>
          </div>
          
          <button 
             onClick={() => onChangeView(AppView.CHAT)}
             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
              <Keyboard size={14} />
              <span>In a public place? Use Text Chat</span>
          </button>
      </div>
    </div>
  );
};