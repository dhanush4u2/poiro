"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./SmoothScroll";
import { FRAME_SEGMENTS, PERCENT_PER_FRAME } from "@/../lib/frameSegments";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   HERO SECTION — Cinematic Frame-Sequence Controller
   Phase 1: Auto-play frames start→introEnd (~3s, scroll locked)
   Phase 2: Scroll-driven frames introEnd→end via ScrollTrigger

   The canvas is now rendered at the page level; this
   component just reports frame changes via onFrameChange.
   ═══════════════════════════════════════════════════════ */

const HERO = FRAME_SEGMENTS.HERO;
const SCROLL_FRAMES = HERO.end - HERO.introEnd;
const SCROLL_DISTANCE = `+=${Math.round(SCROLL_FRAMES * PERCENT_PER_FRAME)}%`;

interface HeroSectionProps {
  onFrameChange?: (frameIndex: number) => void;
  framesLoaded?: boolean;
  onIntroComplete?: () => void;
}

export default function HeroSection({ onFrameChange, framesLoaded, onIntroComplete }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const introCompleteRef = useRef(false);
  const introStartedRef = useRef(false);
  const { stopScroll, startScroll } = useLenis();

  const setFrameIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(HERO.start, Math.min(HERO.end, Math.floor(idx)));
      onFrameChange?.(clamped);
    },
    [onFrameChange]
  );

  /* ── Phase 1: Auto-intro after frames are loaded ── */
  useEffect(() => {
    if (!framesLoaded || introStartedRef.current) return;
    introStartedRef.current = true;

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

        /* ── Phase 2: Scroll-driven ── */
        if (!sectionRef.current) return;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: SCROLL_DISTANCE,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const idx =
              HERO.introEnd +
              Math.floor(self.progress * SCROLL_FRAMES);
            setFrameIndex(idx);
          },
        });

        ScrollTrigger.refresh();
        onIntroComplete?.();
      },
    });
  }, [framesLoaded, setFrameIndex, stopScroll, startScroll, onIntroComplete]);

  /* ── Cleanup ── */
  useEffect(() => {
    const el = sectionRef.current;
    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
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
    />
  );
}
