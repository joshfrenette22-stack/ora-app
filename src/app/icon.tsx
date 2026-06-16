import { ImageResponse } from "next/og";
import { ORA_MARK_DATA_URI, ORA_ICON_BG } from "@/lib/oraMark";

// General-purpose app icon (browsers, PWA manifest, Android).
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ORA_ICON_BG,
        }}
      >
        <img src={ORA_MARK_DATA_URI} width={368} height={368} alt="ORA" />
      </div>
    ),
    { ...size },
  );
}
