"use client";

import { useState } from "react";
import { Cross } from "@/components/Sacred";
import { setUserName } from "@/lib/user";

interface WelcomeOverlayProps {
  onComplete: (name: string) => void;
}

export function WelcomeOverlay({ onComplete }: WelcomeOverlayProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    await setUserName(trimmed);
    onComplete(trimmed);
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 300,
      background: "var(--surface-ink, #1A130D)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "1.5px solid rgba(239,230,214,0.4)",
        display: "grid",
        placeItems: "center",
        color: "var(--gold)",
        marginBottom: 28,
      }}>
        <Cross size={26} />
      </div>

      <h1 style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 500,
        fontSize: 30,
        color: "#F6F0E6",
        margin: "0 0 10px",
        textAlign: "center",
        letterSpacing: "-.015em",
      }}>
        Welcome to Ora
      </h1>

      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: 16,
        color: "rgba(239,230,214,0.65)",
        textAlign: "center",
        margin: "0 0 36px",
        maxWidth: 340,
        lineHeight: 1.55,
      }}>
        A sacred companion for your daily prayer life. What should we call you?
      </p>

      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        width: "100%",
        maxWidth: 320,
      }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your first name"
          autoFocus
          autoComplete="given-name"
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 14,
            border: "1px solid rgba(239,230,214,0.2)",
            background: "rgba(239,230,214,0.06)",
            color: "#F6F0E6",
            fontFamily: "var(--font-body)",
            fontSize: 17,
            outline: "none",
            textAlign: "center",
          }}
        />
        <button
          type="submit"
          disabled={!name.trim() || saving}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: 14,
            border: "none",
            background: name.trim() ? "var(--gilt)" : "rgba(239,230,214,0.08)",
            color: name.trim() ? "#2A1A0E" : "rgba(239,230,214,0.3)",
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 700,
            cursor: name.trim() ? "pointer" : "default",
            boxShadow: name.trim() ? "var(--shadow-gold)" : "none",
            transition: "all .2s",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Setting up..." : "Begin"}
        </button>
      </form>

      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: 13,
        color: "rgba(239,230,214,0.35)",
        textAlign: "center",
        margin: "28px 0 0",
        maxWidth: 280,
        lineHeight: 1.5,
      }}>
        Your name is stored privately and used only to greet you.
      </p>
    </div>
  );
}
