import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RecordViewer } from './components/RecordViewer';
import { HealthChat } from './components/HealthChat';
import { ProviderFinder } from './components/ProviderFinder';
import { LiveAssistant } from './components/LiveAssistant';
import { Timeline } from './components/Timeline';
import { DocumentUpload } from './components/DocumentUpload';
import { Metrics } from './components/Metrics';
import { Portability } from './components/Portability';
import { Profile } from './components/Profile';
import { IntegrationHub } from './components/IntegrationHub';
import { Telemed } from './components/Telemed';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Onboarding } from './components/Onboarding'; // Import Onboarding
import { AppView } from './types';
import { MOCK_RECORDS } from './constants';

// Unlock all features by default as requested
const LOCKED_VIEWS: AppView[] = [];

const TRIAL_DAYS = 21;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  // Default to premium to activate all features
  const [isPremium, setIsPremium] = useState(true);
  const [showSubscription, setShowSubscription] = useState(false);
  
  // Onboarding State
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Trial Logic
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [hasAccess, setHasAccess] = useState<boolean>(true);

  useEffect(() => {
    // Check if user has onboarded
    const onboardStatus = localStorage.getItem('welli_onboarded');
    if (onboardStatus === 'true') {
      setHasOnboarded(true);
    }
    setIsLoading(false);

    const initTrial = () => {
      const storedStart = localStorage.getItem('welli_trial_start');
      let startDate: Date;

      if (!storedStart) {
        startDate = new Date();
        // Don't set trial start here if we haven't onboarded yet. 
        // We'll set it on onboarding complete.
        if (onboardStatus === 'true') {
            localStorage.setItem('welli_trial_start', startDate.toISOString());
        }
      } else {
        startDate = new Date(storedStart);
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const remaining = TRIAL_DAYS - diffDays;
      setDaysRemaining(Math.max(0, remaining));
      
      // Always allow access if premium
      setHasAccess(isPremium || remaining > 0);
    };

    initTrial();
  }, [isPremium, hasOnboarded]);

  const handleOnboardingComplete = (userData: any) => {
    // Persist onboarding status
    localStorage.setItem('welli_onboarded', 'true');
    // Start trial now
    localStorage.setItem('welli_trial_start', new Date().toISOString());
    
    setHasOnboarded(true);
  };

  const handleSignOut = () => {
    // Clear persistence
    localStorage.removeItem('welli_onboarded');
    // Reset state to show Onboarding
    setHasOnboarded(false);
    // Reset View
    setCurrentView(AppView.DASHBOARD);
    // Optional: Clear other local storage items if needed, but keeping trial start might be desired behavior
  };

  const handleViewChange = (view: AppView) => {
    // Since LOCKED_VIEWS is empty, this check effectively passes for everyone
    if (!hasAccess && LOCKED_VIEWS.includes(view)) {
      setShowSubscription(true);
    } else {
      setCurrentView(view);
    }
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    setHasAccess(true);
    setShowSubscription(false);
  };

  const renderView = () => {
    const commonProps = {
      onChangeView: handleViewChange,
      isPremium: hasAccess, 
      onUpgrade: () => setShowSubscription(true)
    };

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard {...commonProps} daysRemaining={daysRemaining} />;
      case AppView.TIMELINE:
        return <Timeline />;
      case AppView.RECORDS:
        return <RecordViewer records={MOCK_RECORDS} />;
      case AppView.UPLOAD:
        return <DocumentUpload />;
      case AppView.METRICS:
        return <Metrics />;
      case AppView.CHAT:
        return <HealthChat />;
      case AppView.FIND_CARE:
        return <ProviderFinder />;
      case AppView.LIVE_ASSISTANT:
        return <LiveAssistant onChangeView={handleViewChange} />;
      case AppView.PORTABILITY:
        return <Portability />;
      case AppView.PROFILE:
        return <Profile onSignOut={handleSignOut} />;
      case AppView.INTEGRATION:
        return <IntegrationHub />;
      case AppView.TELEMED:
        return <Telemed />;
      default:
        return <Dashboard {...commonProps} daysRemaining={daysRemaining} />;
    }
  };

  if (isLoading) return null; // Or a splash screen

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <Layout 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        isPremium={isPremium}
        hasAccess={hasAccess}
        daysRemaining={daysRemaining}
        onUpgrade={() => setShowSubscription(true)}
        onSignOut={handleSignOut}
      >
        {renderView()}
      </Layout>
      
      {showSubscription && (
        <SubscriptionModal 
          onClose={() => setShowSubscription(false)} 
          onUpgrade={handleUpgrade}
          isTrialExpired={!hasAccess}
        />
      )}
    </>
  );
};

export default App;