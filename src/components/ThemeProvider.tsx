"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type ThemeContextType = {
  night: boolean;
  setNight: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({ night: false, setNight: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [night, setNight] = useState(false);

  useEffect(() => {
    // Read the saved preference on the client after mount; doing this in initial
    // state would break SSR (localStorage is unavailable on the server).
    const saved = localStorage.getItem("ora-night");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "true") setNight(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("ora-night", String(night));
    document.documentElement.classList.toggle("ora-night", night);
  }, [night]);

  return (
    <ThemeContext.Provider value={{ night, setNight }}>
      {children}
    </ThemeContext.Provider>
  );
}
