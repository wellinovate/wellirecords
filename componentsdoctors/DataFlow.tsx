import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Server, Smartphone, Laptop, Tablet, ArrowRight } from 'lucide-react';

// A mock visualization of data packets moving between nodes
const DataFlow: React.FC = () => {
  const [packets, setPackets] = useState<{ id: number; from: string; to: string }[]>([]);
  
  // Simulate continuous data traffic
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const sources = ['clinic', 'lab', 'tele', 'pharmacy'];
      const source = sources[Math.floor(Math.random() * sources.length)];
      setPackets(prev => [...prev.slice(-5), { id, from: source, to: 'hub' }]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden min-h-[300px] flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Central Hub */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* Hub Icon */}
        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center border border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.3)] relative">
            <div className="absolute inset-0 rounded-full border border-teal-400/30 animate-ping"></div>
            <Database className="w-8 h-8 text-teal-400" />
        </div>
        <div className="mt-4 text-center">
            <h3 className="text-sm font-semibold text-teal-100">WelliRecord Core</h3>
            <p className="text-xs text-teal-400/60">Secure Enclave</p>
        </div>
      </div>

      {/* Nodes */}
      {/* Positions are absolute relative to container */}
      <Node position="top-left" icon={Server} label="Major Clinics" color="blue" />
      <Node position="top-right" icon={Laptop} label="Identity Providers" color="purple" />
      <Node position="bottom-left" icon={Smartphone} label="Patient Apps" color="pink" />
      <Node position="bottom-right" icon={Tablet} label="Pharmacies" color="emerald" />

      {/* Animated Packets */}
      <AnimatePresence>
        {packets.map(packet => (
           <Packet key={packet.id} from={packet.from} /> 
        ))}
      </AnimatePresence>
    </div>
  );
};

const Node = ({ position, icon: Icon, label, color }: { position: string, icon: any, label: string, color: string }) => {
    const classes = {
        'top-left': 'top-8 left-8',
        'top-right': 'top-8 right-8',
        'bottom-left': 'bottom-8 left-8',
        'bottom-right': 'bottom-8 right-8',
    };
    
    // Tailwind dynamic classes hack - assume standard colors
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };

    return (
        <div className={`absolute ${classes[position as keyof typeof classes]} flex flex-col items-center z-10`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border backdrop-blur-sm ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="mt-2 text-xs font-medium text-slate-400">{label}</span>
        </div>
    );
};

const Packet: React.FC<{ from: string }> = ({ from }) => {
    // Map 'from' to starting coordinates (approximate % for simplicity)
    const startPos = {
        clinic: { x: '-40%', y: '-40%' }, // top-left
        lab: { x: '40%', y: '-40%' }, // top-right (mapped randomly)
        tele: { x: '-40%', y: '40%' }, // bottom-left
        pharmacy: { x: '40%', y: '40%' }, // bottom-right
    };
    
    // Simple random mapping for the demo
    const map = {
        clinic: startPos.clinic,
        identity: startPos.lab,
        tele: startPos.tele,
        pharmacy: startPos.pharmacy
    };

    const initial = map[from as keyof typeof map] || startPos.clinic;

    return (
        <motion.div
            initial={{ x: initial.x, y: initial.y, opacity: 0, scale: 0.5 }}
            animate={{ x: '0%', y: '0%', opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute z-0"
            style={{ 
                left: '50%', 
                top: '50%',
                marginLeft: -4, 
                marginTop: -4 
            }}
        >
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>
        </motion.div>
    );
};

export default DataFlow;