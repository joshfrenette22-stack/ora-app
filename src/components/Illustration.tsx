"use client";

import Image from "next/image";
import { useState } from "react";
import { ILLUSTRATIONS, type IllustrationKey } from "@/lib/illustrations";

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
  // If the file fails to load (offline, cache eviction) render nothing rather
  // than the browser's broken-image glyph — every usage is ornamental.
  const [failed, setFailed] = useState(false);
  const entry = ILLUSTRATIONS[name];
  const resolvedAlt = altOverride ?? entry.alt;
  const w = size ?? widthOverride ?? entry.defaultWidth;
  const h = size ?? heightOverride ?? entry.defaultHeight;
  const isDecorative = resolvedAlt === "";

  const maskValue = feather === true ? FEATHER_MASK : typeof feather === "string" ? feather : undefined;

  const filterStyle: React.CSSProperties = {
    opacity: opacity ?? undefined,
    maskImage: maskValue,
    WebkitMaskImage: maskValue,
    ...style,
  };

  if (failed) return null;

  return (
    <Image
      src={entry.src}
      alt={resolvedAlt}
      width={w}
      height={h}
      priority={priority}
      // Inversion is pure CSS keyed off the .ora-night root class (see
      // globals.css), so art is correct before hydration and on theme change.
      className={`${invertOnDark ? "pw-invert-dark" : ""}${className ? ` ${className}` : ""}`}
      style={filterStyle}
      aria-hidden={isDecorative || undefined}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
