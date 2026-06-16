"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_VOICE, isValidVoice } from "@/lib/voices";

type VoiceContextType = {
  voice: string;
  setVoice: (v: string) => void;
};

const VoiceContext = createContext<VoiceContextType>({ voice: DEFAULT_VOICE, setVoice: () => {} });

export function useVoice() {
  return useContext(VoiceContext);
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [voice, setVoice] = useState(DEFAULT_VOICE);

  useEffect(() => {
    const saved = localStorage.getItem("ora-voice");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && isValidVoice(saved)) setVoice(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("ora-voice", voice);
  }, [voice]);

  return <VoiceContext.Provider value={{ voice, setVoice }}>{children}</VoiceContext.Provider>;
}
