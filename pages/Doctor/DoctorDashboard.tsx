
import React, { useState, useEffect } from 'react';

import { ViewState, Language, UserRole } from '../../types';
import ClinicModule from '@/componentsdoctors/ClinicModule';
import LabModule from '@/componentsdoctors/LabModule';
import PharmacyModule from '@/componentsdoctors/PharmacyModule';
import TelemedicineModule from '@/componentsdoctors/TelemedicineModule';
import DeveloperConsole from '@/componentsdoctors/DeveloperConsole';
import SettingsModule from '@/componentsdoctors/SettingsModule';
import SystemsModule from '@/componentsdoctors/SystemsModule';
import ConsentManager from '@/componentsdoctors/ConsentManager';
import AnalyticsModule from '@/componentsdoctors/AnalyticsModule';
import Sidebar from '@/componentsdoctors/Sidebar';
import Header from '@/componentsdoctors/Header';
import Dashboard from '@/componentsdoctors/Dashboard';

const DoctorDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [language, setLanguage] = useState<Language>('EN');
  const [userRole, setUserRole] = useState<UserRole>('clinician');

  // Role Permission Matrix
  const rolePermissions: Record<UserRole, ViewState[]> = {
      admin: Object.values(ViewState),
      clinician: [ViewState.DASHBOARD, ViewState.CLINIC, ViewState.LAB, ViewState.PHARMACY, ViewState.TELEMEDICINE, ViewState.IDENTITY, ViewState.ANALYTICS, ViewState.SETTINGS],
      lab_tech: [ViewState.DASHBOARD, ViewState.LAB, ViewState.SYSTEMS, ViewState.SETTINGS],
      pharmacist: [ViewState.DASHBOARD, ViewState.PHARMACY, ViewState.IDENTITY, ViewState.SETTINGS],
      telemedicine: [ViewState.DASHBOARD, ViewState.TELEMEDICINE, ViewState.CLINIC, ViewState.IDENTITY, ViewState.SETTINGS],
      regulator: [ViewState.DASHBOARD, ViewState.SYSTEMS, ViewState.IDENTITY, ViewState.ANALYTICS, ViewState.SETTINGS],
      developer: [ViewState.DASHBOARD, ViewState.SYSTEMS, ViewState.DEVELOPER, ViewState.SETTINGS],
      patient: [ViewState.DASHBOARD, ViewState.IDENTITY, ViewState.SETTINGS]
  };

  // Check if current view is allowed when role changes
  useEffect(() => {
      const allowedViews = rolePermissions[userRole];
      if (!allowedViews.includes(currentView)) {
          // Redirect to the first allowed view (usually Dashboard)
          setCurrentView(allowedViews[0]);
      }
  }, [userRole, currentView]);

  const renderContent = () => {
    // Double check permissions before rendering
    if (!rolePermissions[userRole].includes(currentView)) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-300">Access Denied</h2>
                    <p>Your current role ({userRole}) does not have permission to view this module.</p>
                </div>
            </div>
        );
    }

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard language={language} />;
      case ViewState.CLINIC:
        return <ClinicModule />;
      case ViewState.LAB:
        return <LabModule />;
      case ViewState.PHARMACY:
        return <PharmacyModule />;
      case ViewState.TELEMEDICINE:
        return <TelemedicineModule />;
      case ViewState.DEVELOPER:
        return <DeveloperConsole />;
      case ViewState.SETTINGS:
        return <SettingsModule />;
      case ViewState.SYSTEMS:
        return <SystemsModule />;
      case ViewState.IDENTITY:
        return <ConsentManager />;
      case ViewState.ANALYTICS:
        return <AnalyticsModule />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          language={language}
          userRole={userRole}
          allowedViews={rolePermissions[userRole]}
      />
      
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Header 
            language={language} 
            setLanguage={setLanguage} 
            userRole={userRole}
            setUserRole={setUserRole}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
