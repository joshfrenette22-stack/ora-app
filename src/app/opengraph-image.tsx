import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Prayer Warrior — A Catholic Prayer Companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const buf = await readFile(join(process.cwd(), "public/illustrations/app-icon-crucifix.png"));
  const base64 = buf.toString("base64");
  const dataUri = `data:image/png;base64,${base64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B1916",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Warm radial glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse at 70% 50%, rgba(210,107,67,0.15) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse at 30% 80%, rgba(210,107,67,0.08) 0%, transparent 50%)",
          }}
        />

        {/* Crucifix — right side, large, faded */}
        <div
          style={{
            position: "absolute",
            right: 40,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            opacity: 0.12,
          }}
        >
          <img
            src={dataUri}
            width={520}
            height={520}
            alt=""
            style={{ filter: "invert(1) brightness(1.05) sepia(0.08)" }}
          />
        </div>

        {/* Content — left aligned */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "80px 90px",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              width: 48,
              height: 3,
              borderRadius: 2,
              background: "linear-gradient(90deg, #E68A5E, #D8703F)",
              marginBottom: 32,
            }}
          />

          {/* App name */}
          <div
            style={{
              fontSize: 82,
              fontWeight: 400,
              color: "#F2EBDF",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Prayer Warrior
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(239,230,214,0.6)",
              lineHeight: 1.4,
              maxWidth: 500,
            }}
          >
            A reverent Catholic prayer companion
          </div>

          {/* Features row */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 40,
            }}
          >
            {["Daily Mass", "The Hours", "Holy Rosary", "Devotions"].map((label) => (
              <div
                key={label}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: "#D26B43",
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(210,107,67,0.35)",
                  background: "rgba(210,107,67,0.08)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #C25A2C, #E68A5E, #D8703F)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
