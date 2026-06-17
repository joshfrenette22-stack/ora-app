"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_VOICE, isValidVoice } from "@/lib/voices";

type VoiceContextType = {
  voice: string;
  setVoice: (v: string) => void;
  /** Narration speed multiplier (1 = normal). */
  speed: number;
  setSpeed: (s: number) => void;
};

const VoiceContext = createContext<VoiceContextType>({ voice: DEFAULT_VOICE, setVoice: () => {}, speed: 1, setSpeed: () => {} });

export function useVoice() {
  return useContext(VoiceContext);
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("ora-voice");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && isValidVoice(saved)) setVoice(saved);
    const savedRate = Number(localStorage.getItem("ora-rate"));
    if (savedRate >= 0.5 && savedRate <= 2) setSpeed(savedRate);
  }, []);

  useEffect(() => {
    localStorage.setItem("ora-voice", voice);
  }, [voice]);

  useEffect(() => {
    localStorage.setItem("ora-rate", String(speed));
  }, [speed]);

  return <VoiceContext.Provider value={{ voice, setVoice, speed, setSpeed }}>{children}</VoiceContext.Provider>;
}
