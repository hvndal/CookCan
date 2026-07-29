import React, { createContext, useContext, type ReactNode } from 'react';
import { colors } from '../theme/colors';

interface SettingsContextType {
  theme: 'light';
  colors: typeof colors;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SettingsContext.Provider value={{ theme: 'light', colors }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
