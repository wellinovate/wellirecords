
import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  ShieldCheck, 
  Activity, 
  Settings, 
  Globe2,
  LogOut,
  Database,
  Stethoscope,
  Microscope,
  Pill,
  Video,
  Terminal,
  Lock,
  ChevronRight
} from 'lucide-react';
import { ViewState, Language, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  language: Language;
  userRole: UserRole;
  allowedViews: ViewState[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, language, userRole, allowedViews }) => {
  
  const translations: Record<Language, Record<string, string>> = {
    EN: {
      overview: 'Overview',
      clinic: 'Clinical Workspace',
      tele: 'Telemedicine',
      lab: 'Diagnostics & Labs',
      pharma: 'Pharmacy & Meds',
      systems: 'Connected Systems',
      identity: 'Identity & Consent',
      analytics: 'Data Analytics',
      developer: 'Developer API',
      settings: 'Settings',
      systemStatus: 'System Status',
      online: 'Global Node: Online',
      signout: 'Sign Out'
    },
    YOR: {
      overview: 'Àkópọ̀',
      clinic: 'Ààyè Isẹ́ Ìwòsàn',
      tele: 'Ìwòsàn Latọna Jijin',
      lab: 'Àyẹ̀wò & Labs',
      pharma: 'Ilé Oògùn',
      systems: 'Awọn Ẹrọ Ti A Sopọ',
      identity: 'Ìdánimọ̀ & Gbigba',
      analytics: 'Atupale Data',
      developer: 'API Olùgbéejáde',
      settings: 'Ètò',
      systemStatus: 'Ipò Ètò',
      online: 'Oju-ọna Agbaye: Nṣiṣẹ',
      signout: 'Jade'
    },
    IGB: {
      overview: 'Nchịkọta',
      clinic: 'Ebe Ọrụ Ụlọ Ọgwụ',
      tele: 'Ọgwụgwọ Ntanetị',
      lab: 'Nchoputa & Labs',
      pharma: 'Ụlọ Ọgwụ & Ọgwụ',
      systems: 'Sistemụ Jikọrọ',
      identity: 'Njirimara & Nkwenye',
      analytics: 'Nyocha Data',
      developer: 'API Onye Mmepụta',
      settings: 'Ntọala',
      systemStatus: 'Ọnọdụ Sistemụ',
      online: 'Global Node: Ọ na-arụ ọrụ',
      signout: 'Pụọ'
    },
    HAU: {
      overview: 'Takaitaccen Bayani',
      clinic: 'Wajen Aikin Asibiti',
      tele: 'Kiwon Lafiya na Nesa',
      lab: 'Gwaje-gwaje & Labs',
      pharma: 'Farmasi & Magunguna',
      systems: 'Na\'urorin da aka Haɗa',
      identity: 'Shaida & Yardar',
      analytics: 'Nazarin Bayanai',
      developer: 'API na Mai Haɓakawa',
      settings: 'Saituna',
      systemStatus: 'Matsayin Tsarin',
      online: 'Global Node: Yana Aiki',
      signout: 'Fita'
    }
  };

  const t = translations[language];

  const allMenuItems = [
    { id: ViewState.DASHBOARD, label: t.overview, icon: LayoutDashboard },
    { id: ViewState.CLINIC, label: t.clinic, icon: Stethoscope },
    { id: ViewState.TELEMEDICINE, label: t.tele, icon: Video },
    { id: ViewState.LAB, label: t.lab, icon: Microscope },
    { id: ViewState.PHARMACY, label: t.pharma, icon: Pill },
    { id: ViewState.SYSTEMS, label: t.systems, icon: Network },
    { id: ViewState.IDENTITY, label: t.identity, icon: ShieldCheck },
    { id: ViewState.ANALYTICS, label: t.analytics, icon: Activity },
    { id: ViewState.DEVELOPER, label: t.developer, icon: Terminal },
    { id: ViewState.SETTINGS, label: t.settings, icon: Settings },
  ];

  const filteredItems = allMenuItems.filter(item => allowedViews.includes(item.id));

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col shadow-sm z-50">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
          <Globe2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900">WelliRecord</h1>
          <p className="text-xs text-slate-400">Connect Layer v2.1</p>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              Role: {userRole.replace('_', ' ')}
          </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />}
            </button>
          );
        })}
      </nav>

      {/* Global Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.systemStatus}</span>
          <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]"></span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
          <Database className="w-3 h-3" />
          <span>{t.online}</span>
        </div>
        <button className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors w-full px-2 py-2 rounded hover:bg-red-50 text-sm font-medium">
          <LogOut className="w-4 h-4" />
          <span>{t.signout}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
