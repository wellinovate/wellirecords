import React, { useState, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Camera, Shield, Bell, 
  Lock, ChevronRight, CreditCard, 
  Fingerprint, QrCode, Copy, Check,
  Info, ChevronDown, ChevronUp, Smartphone, Loader2, MessageSquare, ShieldCheck, LogOut
} from 'lucide-react';

interface Props {
    onSignOut?: () => void;
}

export const Profile: React.FC<Props> = ({ onSignOut }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string>("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecurityTips, setShowSecurityTips] = useState(false);
  
  // NIN Verification State
  const [nin, setNin] = useState('');
  const [otp, setOtp] = useState('');
  const [ninStatus, setNinStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  
  const [formData, setFormData] = useState({
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Wellness Blvd, San Francisco, CA",
    memberId: "WR-8921-XKA9-22"
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendNinCode = () => {
    if (!nin || nin.length < 11) return;
    setNinStatus('sending');
    // Simulate SMS API call
    setTimeout(() => {
      setNinStatus('sent');
    }, 2000);
  };

  const handleVerifyNin = () => {
    if (!otp) return;
    setNinStatus('verifying');
    // Simulate Verification API call
    setTimeout(() => {
      setNinStatus('verified');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Account Settings</h2>
          <p className="text-slate-500">Manage your personal information and preferences.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            isEditing 
              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden group">
            {/* Avatar Section */}
            <div className="relative w-32 h-32 mb-4">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-800 shadow-xl relative group-hover:border-blue-500/50 transition-colors">
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              </div>
              
              {/* Floating Action Button */}
              <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-1 right-1 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all duration-300 shadow-lg z-20 border-4 border-slate-900 cursor-pointer"
                  title="Upload new photo"
              >
                <Camera size={16} />
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>

            <h3 className="text-xl font-bold text-slate-100">{formData.name}</h3>
            <p className="text-sm text-slate-500 mb-4">Member since 2024</p>
            
            <div className="w-full pt-4 border-t border-slate-800">
               <div className="flex items-center justify-between text-sm mb-2">
                 <span className="text-slate-400">Status</span>
                 <span className="text-emerald-400 font-bold bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-900/30">Active</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-slate-400">Plan</span>
                 <span className="text-amber-400 font-bold bg-amber-900/20 px-2 py-0.5 rounded border border-amber-900/30">Premium</span>
               </div>
               {ninStatus === 'verified' && (
                 <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-400">Identity</span>
                    <span className="text-blue-400 font-bold flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                    </span>
                 </div>
               )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
             <div className="p-4 border-b border-slate-800 font-bold text-slate-300">Quick Actions</div>
             <div className="divide-y divide-slate-800">
                <button className="w-full p-4 flex items-center justify-between text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
                   <div className="flex items-center gap-3">
                      <CreditCard size={18} /> Billing & Payment
                   </div>
                   <ChevronRight size={16} />
                </button>
                <button className="w-full p-4 flex items-center justify-between text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
                   <div className="flex items-center gap-3">
                      <Bell size={18} /> Notifications
                   </div>
                   <ChevronRight size={16} />
                </button>
                <button 
                    onClick={onSignOut}
                    className="w-full p-4 flex items-center justify-between text-red-400 hover:bg-red-900/10 transition-colors text-sm"
                >
                   <div className="flex items-center gap-3">
                      <LogOut size={18} /> Sign Out
                   </div>
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
           {/* Personal Information */}
           <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
                 <User className="text-blue-500" /> Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <input 
                          type="text" 
                          disabled={!isEditing}
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 outline-none disabled:opacity-50"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Member ID</label>
                    <div className="relative">
                       <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <input 
                          type="text" 
                          disabled
                          value={formData.memberId}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-400 font-mono cursor-not-allowed"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <input 
                          type="email" 
                          disabled={!isEditing}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 outline-none disabled:opacity-50"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <div className="relative">
                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <input 
                          type="tel" 
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 outline-none disabled:opacity-50"
                       />
                    </div>
                 </div>

                 <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <input 
                          type="text" 
                          disabled={!isEditing}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 outline-none disabled:opacity-50"
                       />
                    </div>
                 </div>
              </div>
           </div>

            {/* NIN Verification Section */}
           <div className={`rounded-2xl border p-6 transition-all duration-300 ${ninStatus === 'verified' ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-6">
                 <h3 className={`font-bold text-lg flex items-center gap-2 ${ninStatus === 'verified' ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {ninStatus === 'verified' ? <ShieldCheck /> : <Smartphone className="text-purple-500" />} 
                    Government Identity Verification (NIN)
                 </h3>
                 {ninStatus === 'verified' && (
                     <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                         <Check size={12} /> VERIFIED
                     </span>
                 )}
              </div>

              {ninStatus === 'verified' ? (
                  <div className="text-sm text-slate-400 flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                          <Check size={20} />
                      </div>
                      <div>
                          <p className="font-bold text-slate-200">Identity Confirmed</p>
                          <p>Your National Identification Number has been successfully linked to your WelliRecord profile.</p>
                      </div>
                  </div>
              ) : (
                  <div className="space-y-6">
                      <p className="text-sm text-slate-400">
                          To comply with healthcare regulations, please verify your identity by entering your National Identification Number (NIN). We will send a one-time code to your registered phone number.
                      </p>

                      <div className="grid md:grid-cols-3 gap-4 items-end">
                          <div className="md:col-span-2 space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">National ID Number (NIN)</label>
                              <input 
                                  type="text"
                                  placeholder="Enter 11-digit NIN"
                                  value={nin}
                                  onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                  disabled={ninStatus !== 'idle'}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-blue-500 outline-none disabled:opacity-50"
                              />
                          </div>
                          
                          {(ninStatus === 'idle' || ninStatus === 'sending') && (
                              <button 
                                  onClick={handleSendNinCode}
                                  disabled={nin.length < 11 || ninStatus === 'sending'}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                              >
                                  {ninStatus === 'sending' ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
                                  {ninStatus === 'sending' ? 'Sending...' : 'Send Code'}
                              </button>
                          )}
                      </div>

                      {/* OTP Input Section */}
                      {(ninStatus === 'sent' || ninStatus === 'verifying') && (
                          <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 animate-in slide-in-from-top-2">
                              <div className="flex flex-col md:flex-row gap-4 items-center">
                                  <div className="flex-1 w-full">
                                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                                          Enter Verification Code sent to {formData.phone}
                                      </label>
                                      <input 
                                          type="text"
                                          placeholder="123456"
                                          value={otp}
                                          onChange={(e) => setOtp(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:border-emerald-500 outline-none tracking-widest font-mono text-center text-lg"
                                      />
                                  </div>
                                  <button 
                                      onClick={handleVerifyNin}
                                      disabled={!otp || ninStatus === 'verifying'}
                                      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                                  >
                                      {ninStatus === 'verifying' ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                      {ninStatus === 'verifying' ? 'Verifying...' : 'Verify Identity'}
                                  </button>
                              </div>
                              <p className="text-xs text-slate-500 mt-2 text-center">
                                  Didn't receive code? <button className="text-blue-400 hover:underline" onClick={() => setNinStatus('idle')}>Resend</button>
                              </p>
                          </div>
                      )}
                  </div>
              )}
           </div>

           {/* Security Settings */}
           <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
                 <Shield className="text-emerald-500" /> Security & Privacy
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                          <Lock size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-200 text-sm">Two-Factor Authentication</h4>
                          <p className="text-xs text-slate-500">Secure your account with 2FA</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                          <Fingerprint size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-200 text-sm">Biometric Login</h4>
                          <p className="text-xs text-slate-500">Use FaceID or TouchID</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                 </div>

                 {/* Security Best Practices */}
                 <div className="mt-2 pt-2 border-t border-slate-800/50">
                    <button 
                        onClick={() => setShowSecurityTips(!showSecurityTips)}
                        className="w-full flex items-center justify-between p-2 text-xs font-medium text-slate-500 hover:text-blue-400 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <Info size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                            <span>Security Best Practices</span>
                        </div>
                        {showSecurityTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    {showSecurityTips && (
                        <div className="mt-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-3 animate-in fade-in slide-in-from-top-1">
                            <div className="flex gap-3">
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                <div>
                                    <strong className="text-slate-300 block mb-0.5">Data Sovereignty</strong>
                                    Your private key is your identity. Never share it with anyone, including support staff.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                <div>
                                    <strong className="text-slate-300 block mb-0.5">Regular Audits</strong>
                                    Check your 'Portability' tab monthly to revoke access for providers you no longer see.
                                </div>
                            </div>
                                <div className="flex gap-3">
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                                <div>
                                    <strong className="text-slate-300 block mb-0.5">Biometric Safety</strong>
                                    Enable biometric login to prevent unauthorized access if your device is unlocked.
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
              </div>
           </div>

           {/* WelliID Smart Contract Binding */}
           <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
                 <QrCode className="text-purple-500" /> WelliID Smart Contract Binding
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="bg-white p-2 rounded-xl shrink-0">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${formData.memberId}`} alt="WelliID QR" className="w-32 h-32" />
                  </div>
                  
                  <div className="flex-1 w-full space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Universal Health ID</label>
                          <div className="flex items-center gap-2 mt-1">
                              <code className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono text-sm flex-1">
                                  {formData.memberId}
                              </code>
                              <button 
                                onClick={handleCopy}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center justify-center min-w-[40px]"
                                title="Copy ID"
                              >
                                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                              </button>
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Blockchain Network</label>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-300">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span>Ethereum Mainnet (WelliChain Layer 2)</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Contract: 0x71C...9A21</p>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};