'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Theme {
  mode: 'light' | 'dark';
  color: string;
  fontSize: number;
}

interface Preferences {
  theme: Theme;
  notifications: boolean;
  autoSave: boolean;
  language: string;
  accessibility: {
    highContrast: boolean;
    fontSize: number;
    reduceMotion: boolean;
  };
  dashboard: {
    defaultView: 'list' | 'grid';
    showMetrics: boolean;
    metricsTimeframe: 'week' | 'month' | 'year';
  };
}

interface PreferencesContextType {
  preferences: Preferences;
  updateTheme: (theme: Partial<Theme>) => void;
  toggleNotifications: () => void;
  toggleAutoSave: () => void;
  setLanguage: (lang: string) => void;
  updateAccessibility: (settings: Partial<Preferences['accessibility']>) => void;
  updateDashboardPreferences: (settings: Partial<Preferences['dashboard']>) => void;
}

const defaultPreferences: Preferences = {
  theme: {
    mode: 'light',
    color: '#4299E1',
    fontSize: 16
  },
  notifications: true,
  autoSave: true,
  language: 'en',
  accessibility: {
    highContrast: false,
    fontSize: 16,
    reduceMotion: false
  },
  dashboard: {
    defaultView: 'grid',
    showMetrics: true,
    metricsTimeframe: 'month'
  }
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updateTheme = (theme: Partial<Theme>) => {
    setPreferences(prev => ({
      ...prev,
      theme: { ...prev.theme, ...theme }
    }));
  };

  const toggleNotifications = () => {
    setPreferences(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };

  const toggleAutoSave = () => {
    setPreferences(prev => ({
      ...prev,
      autoSave: !prev.autoSave
    }));
  };

  const setLanguage = (lang: string) => {
    setPreferences(prev => ({
      ...prev,
      language: lang
    }));
  };

  const updateAccessibility = (settings: Partial<Preferences['accessibility']>) => {
    setPreferences(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...settings }
    }));
  };

  const updateDashboardPreferences = (settings: Partial<Preferences['dashboard']>) => {
    setPreferences(prev => ({
      ...prev,
      dashboard: { ...prev.dashboard, ...settings }
    }));
  };

  return (
    <PreferencesContext.Provider value={{
      preferences,
      updateTheme,
      toggleNotifications,
      toggleAutoSave,
      setLanguage,
      updateAccessibility,
      updateDashboardPreferences
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
} 