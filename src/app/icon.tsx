import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const contentType = "image/png";

// Four real variants instead of one 512px image lying about its size in the
// manifest: proper 192/512 in both "any" and "maskable" purposes. The maskable
// art sits inside Android's ~80% safe zone so the crucifix never gets clipped
// when the launcher crops to a circle/squircle.
export function generateImageMetadata() {
  return [
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png", alt: "Prayer Warrior" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png", alt: "Prayer Warrior" },
    { id: "maskable-192", size: { width: 192, height: 192 }, contentType: "image/png", alt: "Prayer Warrior" },
    { id: "maskable-512", size: { width: 512, height: 512 }, contentType: "image/png", alt: "Prayer Warrior" },
  ];
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = String(await id);
  const px = iconId.endsWith("512") ? 512 : 192;
  const maskable = iconId.startsWith("maskable");
  const art = Math.round(px * (maskable ? 0.56 : 0.78));

  const buf = await readFile(join(process.cwd(), "public/illustrations/app-icon-crucifix.png"));
  const dataUri = `data:image/png;base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 40%, #2A2410 0%, #1B1916 72%)",
        }}
      >
        <img
          src={dataUri}
          width={art}
          height={art}
          alt="Prayer Warrior"
          style={{ filter: "invert(1) brightness(1.05) sepia(0.08)" }}
        />
      </div>
    ),
    { width: px, height: px },
  );
}
