"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import HeroCanvas from "@/components/HeroCanvas";
import { Explosion } from "@/../components/Explosion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import OperatingSystemSection from "@/components/sections/OperatingSystemSection";
import SecondVideoSection from "@/components/sections/SecondVideoSection";
import FooterCTASection from "@/components/sections/FooterCTASection";
import PagePreloader from "@/../components/PagePreloader";
import { Nav } from "@/components/componentBoard";
import { FRAME_SEGMENTS } from "@/../lib/frameSegments";
import { LightRays } from "@/../components/LightRays";
import { AmbientParticles } from "@/../components/Particles";

/* ═══════════════════════════════════════════════════════
   HOME PAGE
   Hero (frame 0→420 + explosion) →
   Operating System →
   Second Video (frame 421→661) →
   Footer CTA

   A single fixed HeroCanvas renders both video segments.
   The canvas stays at HERO.end while scrolling through
   the normal sections in between.
   ═══════════════════════════════════════════════════════ */

const HERO = FRAME_SEGMENTS.HERO;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export default function Home() {
  const canvasFrameRef = useRef<number>(HERO.start);
  const [displayFrame, setDisplayFrame] = useState<number>(HERO.start);
  const [explosionProgress, setExplosionProgress] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const lastFrameRef = useRef(-1);

  /* ── rAF loop: read the ref and push to React state ── */
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const current = canvasFrameRef.current;
      if (current !== lastFrameRef.current) {
        lastFrameRef.current = current;
        setDisplayFrame(current);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { running = false; };
  }, []);

  /* ── Hero frames: update shared ref + explosion ── */
  const handleHeroFrameChange = useCallback((frameIndex: number) => {
    canvasFrameRef.current = frameIndex;

    const ep = clamp(
      (frameIndex - HERO.explosionStart) /
        (HERO.explosionEnd - HERO.explosionStart),
      0,
      1
    );
    setExplosionProgress(ep);
  }, []);

  /* ── Second video frames: update shared ref ── */
  const handleSecondVideoFrameChange = useCallback((frameIndex: number) => {
    canvasFrameRef.current = frameIndex;
  }, []);

  /* ── Frames loaded from HeroCanvas ── */
  const handleFramesLoaded = useCallback(() => {
    setFramesLoaded(true);
  }, []);

  /* ── Hero intro finished & its ScrollTrigger exists ── */
  const handleHeroIntroComplete = useCallback(() => {
    setHeroReady(true);
  }, []);

  /* ── Overlay opacity based on hero frame ── */
  // scrolling forward: <280 = 1, 280→300 fade 1→0, >300 = 0
  // scrolling backward: >320 = 0, 300→280 fade 0→1, <280 = 1
  const overlayOpacity = (() => {
    const frame = displayFrame;
    if (frame < 280) return 1;
    if (frame <= 300) return 1 - (frame - 280) / 20;
    return 0;
  })();

  return (
    <>
      <PagePreloader />
      <Nav />
      <Explosion explosionProgress={explosionProgress} />

      {/* Fixed fullscreen canvas — renders both video segments */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <HeroCanvas
          frameIndex={displayFrame}
          onFramesLoaded={handleFramesLoaded}
        />

        {/* Light Rays — above canvas, below particles */}
        {overlayOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              opacity: overlayOpacity,
              transition: "opacity 0.15s linear",
              pointerEvents: "none",
            }}
          >
            <LightRays />
          </div>
        )}

        {/* Particles — above light rays */}
        {overlayOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              opacity: overlayOpacity,
              transition: "opacity 0.15s linear",
              pointerEvents: "auto",
            }}
          >
            <AmbientParticles
              count={300}
              speed={0.15}
              randomness={0.8}
              glowStrength={2.5}
              minSize={0.6}
              maxSize={2.0}
              clusterRadius={0.5}
              horizontalSpread={3.0}
              hoverRadius={250}
              color="255, 255, 255"
            />
          </div>
        )}
      </div>

      <HeroSection
        onFrameChange={handleHeroFrameChange}
        framesLoaded={framesLoaded}
        onIntroComplete={handleHeroIntroComplete}
      />

      {/* Normal sections — stacked naturally */}
      <OperatingSystemSection />

      <SecondVideoSection
        onFrameChange={handleSecondVideoFrameChange}
        heroReady={heroReady}
      />

      {/* Footer section */}
      <FooterCTASection />
    </>
  );
}
