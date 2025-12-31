import React, { useState } from 'react';
import { Check, Shield, Zap, Crown, CreditCard, Loader2, X, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onUpgrade: () => void;
  isTrialExpired?: boolean;
}

export const SubscriptionModal: React.FC<Props> = ({ onClose, onUpgrade, isTrialExpired }) => {
  const [processing, setProcessing] = useState(false);
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscribe = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onUpgrade();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
         <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white z-10 transition-colors">
            <X size={20} />
         </button>

         {/* Left Side: Value Prop */}
         <div className="md:w-1/2 p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-r border-slate-800 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             
             <div className="relative z-10">
                 {isTrialExpired ? (
                    <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex gap-3 animate-in slide-in-from-top-4">
                        <AlertCircle className="text-red-400 shrink-0" size={24} />
                        <div>
                            <h3 className="font-bold text-red-200">Trial Expired</h3>
                            <p className="text-xs text-red-300/80">Your 21-day trial period has ended. Please upgrade to continue accessing premium features.</p>
                        </div>
                    </div>
                 ) : (
                    <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg mb-6">
                        <Crown size={24} className="text-white" />
                    </div>
                 )}
                 
                 <h2 className="text-3xl font-bold text-white mb-2">{isTrialExpired ? "Restore Your Access" : "Upgrade to WelliPlus™"}</h2>
                 <p className="text-slate-400 mb-8">Unlock the full power of AI-driven healthcare and data sovereignty.</p>

                 <div className="space-y-4">
                    {[
                        "Unlimited Telehealth Consultations",
                        "Unlimited Gemini AI Health Chat",
                        "Real-time Voice Assistant (Welli Voice)",
                        "Advanced Provider Search (Maps Grounding)",
                        "Full Data Portability & Export",
                        "Predictive Health Analytics"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <Check size={12} className="text-emerald-400" />
                            </div>
                            <span className="text-slate-200 text-sm font-medium">{feature}</span>
                        </div>
                    ))}
                 </div>
             </div>
             
             <div className="mt-auto pt-8">
                 <div className="flex items-center gap-2 text-xs text-slate-500">
                     <Shield size={12} /> Secure 256-bit Encrypted Payment
                 </div>
             </div>
         </div>

         {/* Right Side: Payment */}
         <div className="md:w-1/2 p-8 bg-slate-900 flex flex-col justify-center">
             <div className="text-center mb-8">
                 <h3 className="text-lg font-bold text-slate-200">Choose Your Plan</h3>
                 <div className="flex justify-center gap-4 mt-4">
                     <div 
                        onClick={() => setPlan('monthly')}
                        className={`border rounded-xl p-4 w-full cursor-pointer relative transition-all ${plan === 'monthly' ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-900/20' : 'border-slate-700 bg-slate-800/50 opacity-60 hover:opacity-100'}`}
                     >
                         {plan === 'monthly' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Selected</div>}
                         <div className={`text-2xl font-bold ${plan === 'monthly' ? 'text-white' : 'text-slate-300'}`}>$9.99<span className="text-sm text-slate-400 font-normal">/mo</span></div>
                         <div className={`text-xs font-medium mt-1 ${plan === 'monthly' ? 'text-blue-300' : 'text-slate-500'}`}>Monthly Plan</div>
                     </div>
                     <div 
                        onClick={() => setPlan('annual')}
                        className={`border rounded-xl p-4 w-full cursor-pointer relative transition-all ${plan === 'annual' ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-900/20' : 'border-slate-700 bg-slate-800/50 opacity-60 hover:opacity-100'}`}
                     >
                         {plan === 'annual' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Best Value</div>}
                         <div className={`text-2xl font-bold ${plan === 'annual' ? 'text-white' : 'text-slate-300'}`}>$99<span className="text-sm text-slate-400 font-normal">/yr</span></div>
                         <div className={`text-xs font-medium mt-1 ${plan === 'annual' ? 'text-blue-300' : 'text-slate-500'}`}>Annual (Save 15%)</div>
                     </div>
                 </div>
             </div>

             <div className="space-y-4">
                 <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Card Number</label>
                     <div className="relative group">
                         <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                         <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                     </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Expiry</label>
                         <input type="text" placeholder="MM/YY" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                     </div>
                     <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">CVC</label>
                         <input type="text" placeholder="123" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                     </div>
                 </div>
             </div>

             <button 
                onClick={handleSubscribe}
                disabled={processing}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {processing ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                {processing ? 'Processing Payment...' : (isTrialExpired ? 'Reactivate Membership' : `Start ${plan === 'monthly' ? 'Monthly' : 'Annual'} Membership`)}
             </button>
             
             <p className="text-center text-xs text-slate-600 mt-4">
                 Cancel anytime. By subscribing, you agree to our Terms of Service.
             </p>
         </div>
      </div>
    </div>
  );
};