import React from "react";
import { X, Play } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DemoModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl relative overflow-hidden border border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all"
        >
          <X size={24} />
        </button>

        <div className="w-full h-full flex items-center justify-center flex-col">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-pulse mb-4 cursor-pointer">
            <Play size={32} fill="currentColor" className="text-white ml-1" />
          </div>
          <h3 className="text-white font-bold text-xl">Interactive Demo</h3>
          <p className="text-slate-400 mt-2">WelliRecord Platform Tour</p>
        </div>
      </div>
    </div>
  );
}
