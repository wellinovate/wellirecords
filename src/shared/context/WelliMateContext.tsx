import React, { createContext, useContext, useState, useEffect } from 'react';

interface WelliMateContextType {
    isWelliMateEnabled: boolean;
    setWelliMateEnabled: (enabled: boolean) => void;
}

const WelliMateContext = createContext<WelliMateContextType | undefined>(undefined);

export function WelliMateProvider({ children }: { children: React.ReactNode }) {
    const [isWelliMateEnabled, setWelliMateEnabled] = useState(() => {
        const stored = localStorage.getItem('wellimate_enabled');
        return stored !== null ? stored === 'true' : true; // Default enabled
    });

    useEffect(() => {
        localStorage.setItem('wellimate_enabled', String(isWelliMateEnabled));
    }, [isWelliMateEnabled]);

    return (
        <WelliMateContext.Provider value={{ isWelliMateEnabled, setWelliMateEnabled }}>
            {children}
        </WelliMateContext.Provider>
    );
}

export function useWelliMate() {
    const context = useContext(WelliMateContext);
    if (!context) {
        throw new Error('useWelliMate must be used within a WelliMateProvider');
    }
    return context;
}
