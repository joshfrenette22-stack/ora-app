// The visitor's name, stored locally so the experience can greet them by name.
// Collected once on a new device (see SplashScreen) and editable in Settings.
// There is no account — this never leaves the device.

import { useEffect, useState } from "react";

const KEY = "pw-user-name";
const ASKED_KEY = "pw-name-asked";
const EVT = "pw-username-changed";

export function getUserName(): string {
  try { return (localStorage.getItem(KEY) ?? "").trim(); } catch { return ""; }
}

/** Save (or clear, if blank) the name, and mark that we've asked. */
export function setUserName(name: string): void {
  try {
    const v = name.trim();
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
    localStorage.setItem(ASKED_KEY, "1");
    window.dispatchEvent(new CustomEvent(EVT, { detail: v }));
  } catch {
    /* storage blocked */
  }
}

export function hasAskedName(): boolean {
  try { return localStorage.getItem(ASKED_KEY) === "1"; } catch { return false; }
}

/** Note that the name has been requested, without storing one (a skip). */
export function markAskedName(): void {
  try {
    localStorage.setItem(ASKED_KEY, "1");
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
    /* storage blocked */
  }
}

/** Capitalise the first letter for display ("josh" → "Josh"). */
export function displayName(name: string): string {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "";
}

/** Live first name, updating when it changes here or in another tab. */
export function useUserName(): string {
  const [name, setName] = useState("");
  useEffect(() => {
    const sync = () => setName(getUserName());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return name;
}
