import Link from "next/link";
import { Fleuron } from "@/components/Sacred";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 24px", gap: 14 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56, letterSpacing: ".12em", color: "var(--gold-deep)", lineHeight: 1 }}>
        404
      </div>
      <Fleuron width={200} style={{ margin: "6px auto" }} />
      <h1 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 28, color: "var(--ink)", margin: 0, lineHeight: 1.2 }}>
        Page not found
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--stone-400)", maxWidth: 420, lineHeight: 1.6, margin: "0 0 8px" }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <Link
        href="/"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", borderRadius: 9, padding: "13px 24px", textDecoration: "none", background: "var(--gilt)", color: "#2A2008", boxShadow: "var(--shadow-gold)" }}
      >
        Return Home
      </Link>
    </div>
  );
}
