"use client";

import { useRef, useEffect, useCallback, ReactNode, useState } from "react";
import gsap from "gsap";
import { useLenis } from "./SmoothScroll";
import { FRAME_SEGMENTS } from "@/../lib/frameSegments";

/* ═══════════════════════════════════════════════════════
   HERO SECTION — Cinematic Frame-Sequence Controller
  Auto-play frames start→introEnd (~3s, scroll locked)

  This section owns its viewport content and reports
  frame changes via onFrameChange.
   ═══════════════════════════════════════════════════════ */

const HERO = FRAME_SEGMENTS.HERO;

interface HeroSectionProps {
  onFrameChange?: (frameIndex: number) => void;
  framesLoaded?: boolean;
  onIntroComplete?: () => void;
  onActiveChange?: (active: boolean) => void;
  children?: ReactNode;
}

export default function HeroSection({ onFrameChange, framesLoaded, onIntroComplete, onActiveChange, children }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const introCompleteRef = useRef(false);
  const introStartedRef = useRef(false);
  const [preloaderDismissed, setPreloaderDismissed] = useState(false);
  const { stopScroll, startScroll } = useLenis();

  const setFrameIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(HERO.start, Math.min(HERO.end, Math.floor(idx)));
      onFrameChange?.(clamped);
    },
    [onFrameChange]
  );

  useEffect(() => {
    if (document.documentElement.dataset.preloaderDone === "true") {
      setPreloaderDismissed(true);
    }

    const onPreloaderDismissed = () => setPreloaderDismissed(true);
    window.addEventListener("propheus:preloader-dismissed", onPreloaderDismissed);
    return () => window.removeEventListener("propheus:preloader-dismissed", onPreloaderDismissed);
  }, []);

  /* ── Phase 1: Auto-intro after frames are loaded and preloader is dismissed ── */
  useEffect(() => {
    if (!framesLoaded || !preloaderDismissed || introStartedRef.current) return;
    introStartedRef.current = true;

    onActiveChange?.(true);
    stopScroll();
    document.documentElement.classList.add("scroll-locked");

    const introProgress = { value: HERO.start as number };
    gsap.to(introProgress, {
      value: HERO.introEnd,
      duration: HERO.introDuration,
      ease: "power2.inOut",
      onUpdate: () => {
        setFrameIndex(introProgress.value);
      },
      onComplete: () => {
        introCompleteRef.current = true;
        document.documentElement.classList.remove("scroll-locked");
        startScroll();
        onActiveChange?.(false);
        onIntroComplete?.();
      },
    });
  }, [framesLoaded, preloaderDismissed, setFrameIndex, stopScroll, startScroll, onIntroComplete, onActiveChange]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("scroll-locked");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </section>
  );
}
