import { supabase } from "./supabase";

const STORAGE_KEY = "ora_user_name";
const SKIP_KEY = "ora_onboarding_skipped";

/** Get the user's display name (from localStorage cache first, then Supabase). */
export function getCachedName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/** Record that the user declined to give a name — never nag again. */
export function skipOnboarding(): void {
  try { localStorage.setItem(SKIP_KEY, "1"); } catch { /* private mode */ }
}

export function onboardingSkipped(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(SKIP_KEY) === "1"; } catch { return false; }
}

/** Save display name locally and to Supabase profile. */
export async function setUserName(name: string) {
  localStorage.setItem(STORAGE_KEY, name);

  // Ensure we have an anonymous session
  let { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { data } = await supabase.auth.signInAnonymously({
      options: { data: { display_name: name } },
    });
    user = data.user;
  }

  if (user) {
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: name,
    });
  }
}

/** Check if the user has completed onboarding (named themselves or skipped). */
export function hasCompletedOnboarding(): boolean {
  return !!getCachedName() || onboardingSkipped();
}

/** Ensure an anonymous auth session exists (call on app start). */
export async function ensureSession() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    await supabase.auth.signInAnonymously();
  }
}
