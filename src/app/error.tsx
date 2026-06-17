"use client";

import Link from "next/link";
import { Illustration } from "@/components/Illustration";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 24px", gap: 14 }}>
      <div style={{ opacity: 0.15 }}>
        <Illustration name="app-icon-crucifix" size={120} invertOnDark />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em", color: "var(--gold-deep)" }}>
        Something went wrong
      </div>
      <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 31, color: "var(--ink)", margin: 0, lineHeight: 1.15 }}>
        An unexpected error occurred
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--stone-400)", maxWidth: 420, lineHeight: 1.6, margin: "0 0 8px" }}>
        Please try again. If the problem persists, return to Today.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".01em", border: "none", borderRadius: 9, padding: "13px 24px", cursor: "pointer", background: "var(--gilt)", color: "#2A2008", boxShadow: "var(--shadow-gold)" }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".01em", borderRadius: 9, padding: "13px 24px", textDecoration: "none", color: "var(--gold-deep)", boxShadow: "inset 0 0 0 1.5px var(--gold)", display: "inline-flex", alignItems: "center" }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
