"use client";

import { useCallback, useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import HeroCanvas from "@/components/HeroCanvas";
import { Explosion } from "@/../components/Explosion";
import OperatingSystemSection from "@/components/sections/OperatingSystemSection";
import StorytellingSection from "@/components/sections/StorytellingSection";
import LayersSection from "@/components/sections/LayersSection";
import SecondVideoSection from "@/components/sections/SecondVideoSection";
import MasonryGallerySection from "@/components/sections/MasonryGallerySection";
import BriefCTASection from "@/components/sections/BriefCTASection";
import FooterCTASection from "@/components/sections/FooterCTASection";
import PagePreloader from "@/../components/PagePreloader";
import { Nav } from "@/components/componentBoard";
import { FRAME_SEGMENTS } from "@/../lib/frameSegments";
import { LightRays } from "@/../components/LightRays";
import { AmbientParticles } from "@/../components/Particles";
import LogoMarquee from "@/components/LogoMarquee";

/* ═══════════════════════════════════════════════════════
   HOME PAGE
  Hero (frame 0→599 + explosion) →
   Operating System →
  Second Video (frame 600→779) →
   Footer CTA

  Hero and second-video canvases render inside their
  own pinned sections, so section flow is natural.
   ═══════════════════════════════════════════════════════ */

const HERO = FRAME_SEGMENTS.HERO;
const SECOND_VIDEO = FRAME_SEGMENTS.SECOND_VIDEO;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export default function Home() {
  const [heroFrame, setHeroFrame] = useState<number>(HERO.start);
  const [secondVideoFrame, setSecondVideoFrame] = useState<number>(SECOND_VIDEO.start);
  const [explosionProgress, setExplosionProgress] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [isSecondVideoActive, setIsSecondVideoActive] = useState(false);

  useEffect(() => {
    // Force user to start at top on refresh
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  /* ── Hero frames: update hero segment state + explosion ── */
  const handleHeroFrameChange = useCallback((frameIndex: number) => {
    setHeroFrame(frameIndex);

    const ep = clamp(
      (frameIndex - HERO.explosionStart) /
        (HERO.explosionEnd - HERO.explosionStart),
      0,
      1
    );
    setExplosionProgress(ep);
  }, []);

  /* ── Second video frames: update second segment state ── */
  const handleSecondVideoFrameChange = useCallback((frameIndex: number) => {
    setSecondVideoFrame(frameIndex);
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
  // With intro-only hero playback, this stays fully visible through frame 180.
  const overlayOpacity = (() => {
    const frame = heroFrame;
    if (frame < 280) return 1;
    if (frame <= 300) return 1 - (frame - 280) / 20;
    return 0;
  })();

  const secondVideoRenderFrame = isSecondVideoActive
    ? secondVideoFrame
    : Math.max(secondVideoFrame, SECOND_VIDEO.start);

  return (
    <>
      <PagePreloader />
      <Nav />
      <Explosion explosionProgress={explosionProgress} />

      <HeroSection
        onFrameChange={handleHeroFrameChange}
        framesLoaded={framesLoaded}
        onIntroComplete={handleHeroIntroComplete}
      >
        <HeroCanvas
          frameIndex={heroFrame}
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

        {/* Hero Text Overlay — above particles */}
        {overlayOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              opacity: overlayOpacity,
              transition: "opacity 0.15s linear",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                maxWidth: 896,
                width: "100%",
                padding: "0 24px",
                textAlign: "center",
                animation: "heroFadeUp 0.6s ease-out both",
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                  marginBottom: "16px",
                  textShadow: "0 2px 32px rgba(0,0,0,0.4)",
                }}
              >
                Engineering Creativity
              </h1>
              <p
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  color: "rgba(255, 255, 255, 0.9)",
                  marginBottom: "32px",
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                }}
              >
                Where AI Meets Brand Storytelling
              </p>
              <a
                href="#storytelling"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--color-brand-orange)",
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  pointerEvents: "auto",
                  transition: "filter 0.2s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.filter = "brightness(1.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.filter = "brightness(1)")
                }
              >
                Begin your story ↗
              </a>
            </div>
          </div>
        )}
      </HeroSection>

      {/* Logo marquee strip — directly below hero, above OS section */}
      <LogoMarquee />

      {/* Storytelling section */}
      <StorytellingSection />

      {/* Layers section */}
      <LayersSection />

      {/* Normal sections — stacked naturally */}
      <OperatingSystemSection />

      <SecondVideoSection
        onFrameChange={handleSecondVideoFrameChange}
        heroReady={heroReady}
        onActiveChange={setIsSecondVideoActive}
      >
        <HeroCanvas frameIndex={secondVideoRenderFrame} />
      </SecondVideoSection>

      <MasonryGallerySection />

      <BriefCTASection />

      {/* Footer section */}
      <FooterCTASection />
    </>
  );
}
