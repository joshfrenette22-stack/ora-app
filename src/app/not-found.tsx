import Link from "next/link";
import { Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 24px", gap: 14 }}>
      <div style={{ maskImage: "radial-gradient(circle at center, rgba(0,0,0,0.7) 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,0.7) 30%, transparent 70%)" }}>
        <Illustration name="splash-altar" size={200} invertOnDark opacity={0.35} />
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 62, letterSpacing: "-.01em", color: "var(--gold-deep)", lineHeight: 1 }}>
        404
      </div>
      <Fleuron width={200} style={{ margin: "6px auto" }} />
      <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 29, color: "var(--ink)", margin: 0, lineHeight: 1.15 }}>
        Page not found
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--stone-400)", maxWidth: 420, lineHeight: 1.6, margin: "0 0 8px" }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <Link
        href="/"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".01em", borderRadius: 9, padding: "13px 24px", textDecoration: "none", background: "var(--gilt)", color: "#2A2008", boxShadow: "var(--shadow-gold)" }}
      >
        Return Home
      </Link>
    </div>
  );
}
