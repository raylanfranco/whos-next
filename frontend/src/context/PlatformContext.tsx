import { createContext, useContext, useState, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

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

  return (
    <PlatformContext.Provider value={state}>
      {children}
    </PlatformContext.Provider>
  );
}
