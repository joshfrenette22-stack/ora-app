import { ImageResponse } from "next/og";
import { ORA_MARK_DATA_URI, ORA_ICON_BG } from "@/lib/oraMark";

// iOS "Add to Home Screen" icon.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <img src={ORA_MARK_DATA_URI} width={132} height={132} alt="ORA" />
      </div>
    ),
    { ...size },
  );
}
