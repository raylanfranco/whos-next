import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

interface PlatformState {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
}

const PlatformContext = createContext<PlatformState>({
  isNative: false,
  platform: 'web',
});

export function usePlatform() {
  return useContext(PlatformContext);
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [state] = useState<PlatformState>(() => ({
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform() as 'web' | 'ios' | 'android',
  }));

  useEffect(() => {
    if (!state.isNative) return;

    // Configure status bar for dark theme
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0D0B0A' }).catch(() => {});
  }, [state.isNative]);

  return (
    <PlatformContext.Provider value={state}>
      {children}
    </PlatformContext.Provider>
  );
}
