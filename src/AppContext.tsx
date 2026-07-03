import React, { createContext, useContext, useState, useCallback } from 'react';

interface AppState {
  text: string;
  fontSize: number;
  voiceFollow: boolean;
  setText: (text: string) => void;
  setFontSize: (size: number) => void;
  setVoiceFollow: (enabled: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [voiceFollow, setVoiceFollow] = useState(false);

  const handleSetText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleSetFontSize = useCallback((size: number) => {
    setFontSize(size);
  }, []);

  const handleSetVoiceFollow = useCallback((enabled: boolean) => {
    setVoiceFollow(enabled);
  }, []);

  return (
    <AppContext.Provider
      value={{
        text,
        fontSize,
        voiceFollow,
        setText: handleSetText,
        setFontSize: handleSetFontSize,
        setVoiceFollow: handleSetVoiceFollow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
