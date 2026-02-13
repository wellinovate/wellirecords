
import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown, Globe, Wifi, WifiOff, Check, Users, ShieldAlert } from 'lucide-react';
import { Language, UserRole } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, userRole, setUserRole }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'EN', label: 'English', flag: '🇬🇧' },
    { code: 'YOR', label: 'Yoruba', flag: '🇳🇬' },
    { code: 'IGB', label: 'Igbo', flag: '🇳🇬' },
    { code: 'HAU', label: 'Hausa', flag: '🇳🇬' },
  ];

  const roles: { id: UserRole; label: string; desc: string }[] = [
      { id: 'clinician', label: 'Clinician', desc: 'Dr. Sarah Chen' },
      { id: 'lab_tech', label: 'Lab Technician', desc: 'James Miller' },
      { id: 'pharmacist', label: 'Pharmacist', desc: 'Priestley Pharmacy' },
      { id: 'telemedicine', label: 'Telemedicine Provider', desc: 'Dr. David Okafor' },
      { id: 'regulator', label: 'Regulator / Auditor', desc: 'Compliance Officer' },
      { id: 'developer', label: 'Developer', desc: 'Integration Team' },
      { id: 'patient', label: 'Patient View', desc: 'Jane Doe' },
      { id: 'admin', label: 'Super Admin', desc: 'System Root' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];
  const currentRoleInfo = roles.find(r => r.id === userRole) || roles[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
      {/* Search */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search providers, patients, or transaction IDs..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* System Controls */}
        <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
           {/* Offline Toggle */}
           <button 
             onClick={() => setIsOnline(!isOnline)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                 isOnline 
                 ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                 : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
             }`}
             title={isOnline ? "System Online" : "Offline Mode"}
           >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'ONLINE' : 'OFFLINE'}
           </button>

           {/* Language Selector */}
           <div className="relative">
             <button 
               onClick={() => setIsLangOpen(!isLangOpen)}
               className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all min-w-[100px] justify-between"
             >
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  <span>{currentLang.label}</span>
                </div>
                <ChevronDown className="w-3 h-3" />
             </button>

             {isLangOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)}></div>
                 <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Language</div>
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${language === lang.code ? 'text-teal-600 bg-teal-50' : 'text-slate-700'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          {lang.label}
                        </span>
                        {language === lang.code && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                 </div>
               </>
             )}
           </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative">
             <div 
                className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsRoleOpen(!isRoleOpen)}
             >
                <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-slate-900">{currentRoleInfo.desc}</p>
                    <p className="text-xs text-teal-600 font-bold uppercase tracking-wide">{currentRoleInfo.label}</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-teal-700">
                    <User className="w-5 h-5" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {isRoleOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setIsRoleOpen(false)}></div>
                 <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1 flex items-center gap-2">
                        <Users className="w-3 h-3" /> Switch Persona (Demo)
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => {
                            setUserRole(role.id);
                            setIsRoleOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm flex items-start justify-between hover:bg-slate-50 transition-colors ${userRole === role.id ? 'bg-teal-50' : ''}`}
                        >
                            <div>
                                <div className={`font-semibold ${userRole === role.id ? 'text-teal-700' : 'text-slate-900'}`}>{role.label}</div>
                                <div className="text-xs text-slate-500">{role.desc}</div>
                            </div>
                            {userRole === role.id && <Check className="w-4 h-4 text-teal-600 mt-1" />}
                        </button>
                        ))}
                    </div>
                 </div>
               </>
             )}
        </div>
      </div>
    </header>
  );
};

export default Header;
