'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { version, features, limits } from '@/config/version';

interface Version {
  id: string;
  content: string;
  timestamp: string;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
}

interface VersionContextType {
  versions: Version[];
  currentVersion: Version | null;
  addVersion: (version: Version) => void;
  setCurrentVersion: (versionId: string) => void;
  compareVersions: (v1: string, v2: string) => {
    additions: string[];
    deletions: string[];
    modifications: string[];
  };
}

const VersionContext = createContext<VersionContextType | null>(null);

export function VersionProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersionState] = useState<Version | null>(null);

  const addVersion = (version: Version) => {
    setVersions(prev => [...prev, version]);
    if (!currentVersion) {
      setCurrentVersionState(version);
    }
  };

  const setCurrentVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersionState(version);
    }
  };

  const compareVersions = (v1: string, v2: string) => {
    // Implementation
    return {
      additions: [],
      deletions: [],
      modifications: []
    };
  };

  return (
    <VersionContext.Provider value={{
      versions,
      currentVersion,
      addVersion,
      setCurrentVersion,
      compareVersions
    }}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion() {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
} 