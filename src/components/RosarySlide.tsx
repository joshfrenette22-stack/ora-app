"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { rosarySlide, hasSlides, ROSARY_SLIDES } from "@/data/rosarySlides";

interface RosarySlideProps {
  set: string;
  mysteryIdx: number;
  bead: number;
}

function getAltText(set: string, mysteryIdx: number, bead: number): string {
  if (!hasSlides(set)) return "";
  const mystery = ROSARY_SLIDES[set].mysteries[mysteryIdx];
  if (!mystery) return "";
  if (bead === 0) return `${mystery.name} — Announcement`;
  if (bead >= 1 && bead <= 10) return `${mystery.name} — Hail Mary ${bead}`;
  return `${mystery.name} — ${mystery.fruit}`;
}

function getNextSrc(set: string, mysteryIdx: number, bead: number): string | null {
  const nextBead = bead + 1;
  if (nextBead < 12) return rosarySlide(set, mysteryIdx, nextBead);
  const nextMystery = mysteryIdx + 1;
  if (nextMystery < 5) return rosarySlide(set, nextMystery, 0);
  return null;
}

export function RosarySlide({ set, mysteryIdx, bead }: RosarySlideProps) {
  const src = rosarySlide(set, mysteryIdx, bead);
  const [prev, setPrev] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(src);
  const [fadeIn, setFadeIn] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (src === current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (prefersReducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(src);
      setPrev(null);
      return;
    }

    setPrev(current);
    setCurrent(src);
    setFadeIn(false);

    // Trigger the fade-in on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFadeIn(true));
    });

    // Clear the previous layer after the transition
    timeoutRef.current = setTimeout(() => setPrev(null), 550);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, prefersReducedMotion]);

  // Preload the next slide
  const nextSrc = getNextSrc(set, mysteryIdx, bead);
  useEffect(() => {
    if (!nextSrc) return;
    const img = new window.Image();
    img.src = nextSrc;
  }, [nextSrc]);

  if (!current) return null;

  const alt = getAltText(set, mysteryIdx, bead);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 400,
        aspectRatio: "4 / 3",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(210,107,67,0.18)",
        marginBottom: 28,
        flexShrink: 0,
      }}
    >
      {/* Previous image — fading out */}
      {prev && (
        <Image
          src={prev}
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 400px"
          style={{
            objectFit: "cover",
            opacity: 0,
            transition: "opacity 500ms var(--ease-sacred)",
          }}
          aria-hidden
          draggable={false}
        />
      )}

      {/* Current image — fading in */}
      <Image
        src={current}
        alt={alt}
        fill
        sizes="(max-width: 768px) 90vw, 400px"
        style={{
          objectFit: "cover",
          opacity: prefersReducedMotion ? 1 : fadeIn ? 1 : 0,
          transition: prefersReducedMotion ? "none" : "opacity 500ms var(--ease-sacred)",
        }}
        draggable={false}
      />
    </div>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
