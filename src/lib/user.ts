import { supabase } from "./supabase";

const STORAGE_KEY = "ora_user_name";

/** Get the user's display name (from localStorage cache first, then Supabase). */
export function getCachedName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
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

/** Check if the user has completed onboarding (has a name set). */
export function hasCompletedOnboarding(): boolean {
  return !!getCachedName();
}

/** Ensure an anonymous auth session exists (call on app start). */
export async function ensureSession() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    await supabase.auth.signInAnonymously();
  }
}
