"use client";

import { useEffect, useRef, ReactNode, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAME_SEGMENTS, PERCENT_PER_FRAME } from "@/../lib/frameSegments";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   SECOND VIDEO SECTION — Scroll-driven frame sequence
   Frames SECOND_VIDEO.start → SECOND_VIDEO.end, pinned
   and scrubbed. Reports frame changes to the parent via
  onFrameChange so the parent can render the current frame.

   The ScrollTrigger is only created once heroReady=true,
   which guarantees the hero section's pin spacer already
   exists so trigger positions are calculated correctly.
   
   Mobile: Reduced scrub for smoother performance
   ═══════════════════════════════════════════════════════ */

const SEGMENT = FRAME_SEGMENTS.SECOND_VIDEO;
const HERO = FRAME_SEGMENTS.HERO;
const FRAME_COUNT = SEGMENT.end - SEGMENT.start;
const SCROLL_DISTANCE = `+=${Math.round(FRAME_COUNT * PERCENT_PER_FRAME)}%`;

interface SecondVideoSectionProps {
  onFrameChange: (frameIndex: number) => void;
  heroReady: boolean;
  onActiveChange?: (active: boolean) => void;
  children?: ReactNode;
}

export default function SecondVideoSection({ onFrameChange, heroReady, onActiveChange, children }: SecondVideoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for performance optimizations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!heroReady || !sectionRef.current || triggerRef.current) return;

    // Mobile: Higher scrub value for smoother, less janky scrolling
    const scrubValue = isMobile ? 2.5 : 1;

    triggerRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: SCROLL_DISTANCE,
      pin: true,
      scrub: scrubValue,
      invalidateOnRefresh: true,
      fastScrollEnd: isMobile, // Snap to end on fast scroll (mobile optimization)
      onEnter: () => {
        onActiveChange?.(true);
        onFrameChange(SEGMENT.start);
      },
      onLeave: () => {
        onFrameChange(SEGMENT.end);
        onActiveChange?.(false);
      },
      onEnterBack: () => {
        onActiveChange?.(true);
        onFrameChange(SEGMENT.end);
      },
      onLeaveBack: () => {
        onFrameChange(HERO.end);
        onActiveChange?.(false);
      },
      onUpdate: (self) => {
        if (!self.isActive) return;
        const idx = SEGMENT.start + Math.floor(self.progress * FRAME_COUNT);
        onFrameChange(Math.max(SEGMENT.start, Math.min(SEGMENT.end, idx)));
      },
    });

    ScrollTrigger.refresh();

    return () => {
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, [heroReady, onFrameChange, onActiveChange, isMobile]);

  return (
    <section
      ref={sectionRef}
      id="second-video"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
        // Mobile: GPU acceleration hints
        transform: "translateZ(0)",
        willChange: isMobile ? "transform" : "auto",
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
