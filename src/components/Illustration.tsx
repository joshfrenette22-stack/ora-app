"use client";

import Image from "next/image";
import { ILLUSTRATIONS, type IllustrationKey } from "@/lib/illustrations";
import { useTheme } from "./ThemeProvider";

interface IllustrationProps {
  /** Key from the illustration manifest. A bad key is a compile error. */
  name: IllustrationKey;
  /** Override the manifest alt. Pass "" for purely decorative images. */
  alt?: string;
  /** Width in px (defaults to manifest defaultWidth). */
  width?: number;
  /** Height in px (defaults to manifest defaultHeight). */
  height?: number;
  /** Shorthand — sets both width and height for square images. */
  size?: number;
  /** Mark as above-the-fold for eager loading (default false → lazy). */
  priority?: boolean;
  /** Additional className for the wrapper. */
  className?: string;
  /** Additional inline styles for the wrapper. */
  style?: React.CSSProperties;
  /**
   * Invert the black line art to cream/ivory on dark surfaces.
   * Default true — the art is black-on-transparent, so it needs inversion
   * on dark backgrounds. Set false for pre-inverted or non-line-art images.
   */
  invertOnDark?: boolean;
  /** Opacity override (0–1). */
  opacity?: number;
  /**
   * Soft-edge feathering. Dissolves all edges so there are never hard lines.
   * - true (default): radial vignette that fades edges to transparent
   * - false: no mask (useful for hero/centered images that need full visibility)
   * - custom string: pass your own CSS mask-image value
   */
  feather?: boolean | string;
}

/**
 * The dark-mode inversion filter:
 * - invert(1) flips black → white
 * - brightness(1.05) warms it slightly toward ivory
 * - sepia(0.08) adds a faint warmth so it doesn't look cold-white on charcoal
 *
 * This produces a warm cream line that matches --gold-bright (#EFE6D6) tonally.
 */
const DARK_FILTER = "invert(1) brightness(1.05) sepia(0.08)";

/**
 * Default edge-feathering mask: a radial vignette that dissolves all edges
 * so illustrations never show hard rectangular boundaries.
 */
const FEATHER_MASK = "radial-gradient(ellipse at center, rgba(0,0,0,1) 10%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.25) 50%, transparent 65%)";

export function Illustration({
  name,
  alt: altOverride,
  width: widthOverride,
  height: heightOverride,
  size,
  priority = false,
  className,
  style,
  invertOnDark = true,
  opacity,
  feather = true,
}: IllustrationProps) {
  const { night } = useTheme();
  const entry = ILLUSTRATIONS[name];
  const resolvedAlt = altOverride ?? entry.alt;
  const w = size ?? widthOverride ?? entry.defaultWidth;
  const h = size ?? heightOverride ?? entry.defaultHeight;
  const isDecorative = resolvedAlt === "";

  const maskValue = feather === true ? FEATHER_MASK : typeof feather === "string" ? feather : undefined;

  const filterStyle: React.CSSProperties = {
    filter: invertOnDark && night ? DARK_FILTER : undefined,
    transition: "filter var(--dur-base) var(--ease-sacred)",
    opacity: opacity ?? undefined,
    maskImage: maskValue,
    WebkitMaskImage: maskValue,
    ...style,
  };

  return (
    <Image
      src={entry.src}
      alt={resolvedAlt}
      width={w}
      height={h}
      priority={priority}
      className={className}
      style={filterStyle}
      aria-hidden={isDecorative || undefined}
      draggable={false}
    />
  );
}
