import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
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
          background: "radial-gradient(circle at 50% 40%, #2A2410 0%, #1B1916 72%)",
        }}
      >
        <img
          src={dataUri}
          width={400}
          height={400}
          alt="ORA"
          style={{ filter: "invert(1) brightness(1.05) sepia(0.08)" }}
        />
      </div>
    ),
    { ...size },
  );
}
