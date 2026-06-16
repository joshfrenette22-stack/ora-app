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
    const saved = localStorage.getItem("ora-night");
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
