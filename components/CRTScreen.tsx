"use client";

import React, { useState, useEffect } from "react";
import { Comfortaa } from "next/font/google";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/* ═══════════════════════════════════════════════════════
   CRT TEXT SIZING
   Desktop: Uses viewport-based scaling
   Mobile: Uses fixed pixel sizes (easier to read on small screens)
   ═══════════════════════════════════════════════════════ */
const CRT_FONT_SIZES = {
  // Desktop sizes (clamp for responsive scaling)
  desktop: {
    poiro: "clamp(20px, 3vw, 45px)",
    engineering: "clamp(4px, 1vw, 14px)",
    creativity: "clamp(6px, 1vw, 14px)",
  },
  // Mobile sizes (fixed pixels for better control in small CRT)
  mobile: {
    engineering: "9px",   // Adjust this if "Engineering" text is too small/large
    creativity: "9px",    // Adjust this if "Creativity." text is too small/large
  }
} as const;

/* ═══════════════════════════════════════════════════════
   CRT SCREEN — Authentic CRT monitor simulation
   Drop inside any sized container; it fills 100%×100%.
   Bulge radius uses !important to override the global
   `border-radius: 0 !important` reset in globals.css.
   ═══════════════════════════════════════════════════════ */

export function CRTScreen({ className = "" }: { className?: string }) {
  const [activeView, setActiveView] = useState<"logo" | "text">("logo");
  const [isGlitching, setIsGlitching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for text sizing
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => {
        setActiveView((current) => (current === "logo" ? "text" : "logo"));
      }, 150);
      setTimeout(() => {
        setIsGlitching(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative w-full h-full bg-[#050505] overflow-hidden crt-bulge ${className}`}
    >
      <style>{`
        /* Override global border-radius reset for CRT */
        .crt-bulge {
          border-radius: 8% / 12%;
          box-shadow:
            inset 0 0 40px rgba(0,0,0,0.9),
            inset 0 0 15px rgba(255,255,255,0.05),
            0 0 20px rgba(255, 255, 255, 0.1);
        }

        .crt-glass {
          background: linear-gradient(
            90deg,
            rgba(0,0,0,0.5) 0%,
            rgba(255,255,255,0.02) 20%,
            rgba(255,255,255,0.05) 50%,
            rgba(255,255,255,0.02) 80%,
            rgba(0,0,0,0.5) 100%
          );
        }

        .scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3));
          background-size: 100% 4px;
        }

        @keyframes vsync-roll {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .vsync-bar {
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.05) 50%, transparent);
          height: 10%;
          animation: vsync-roll 4s linear infinite;
        }

        @keyframes noise-jitter {
          0%, 100% { background-position: 0 0; }
          10% { background-position: -5% -10%; }
          20% { background-position: -15% 5%; }
          30% { background-position: 7% -25%; }
          40% { background-position: 20% 25%; }
          50% { background-position: -25% 10%; }
          60% { background-position: 15% 5%; }
          70% { background-position: 0% 15%; }
          80% { background-position: 25% 35%; }
          90% { background-position: -10% 10%; }
        }
        .static-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          animation: noise-jitter 0.2s infinite;
          opacity: 0.15;
          mix-blend-mode: overlay;
        }

        @keyframes slice-anim {
          0%   { clip-path: inset(10% 0 80% 0); transform: translateX(-5px); }
          20%  { clip-path: inset(80% 0 5%  0); transform: translateX( 5px); }
          40%  { clip-path: inset(40% 0 40% 0); transform: translateX(-5px); }
          60%  { clip-path: inset(20% 0 60% 0); transform: translateX( 5px); }
          80%  { clip-path: inset(60% 0 20% 0); transform: translateX(-5px); }
          100% { clip-path: inset(10% 0 80% 0); transform: translateX( 5px); }
        }

        .glitch-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .glitch-active .glitch-layer-1 {
          animation: slice-anim 0.3s infinite linear alternate-reverse;
          color: #0ff;
          margin-left: -3px;
          opacity: 0.8;
          z-index: 2;
        }

        .glitch-active .glitch-layer-2 {
          animation: slice-anim 0.2s infinite linear alternate;
          color: #f0f;
          margin-left: 3px;
          opacity: 0.8;
          z-index: 1;
        }

        .glow-text {
          text-shadow: 0 0 15px currentColor;
        }

        .crt-text-wrap {
          width: 100%;
          max-width: 85%;
          margin: 0 auto;
          text-align: center;
          line-height: 1.05;
        }
      `}</style>

      {/* Hardware overlays */}
      <div className="absolute inset-0 z-30 pointer-events-none crt-glass" />
      <div className="absolute inset-0 z-20 pointer-events-none scanlines" />
      <div className="absolute inset-0 z-10 pointer-events-none static-noise" />
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none vsync-bar" />

      {/* Content */}
      <div
        className={`relative z-0 w-full h-full flex flex-col items-center justify-center ${
          isGlitching ? "glitch-active" : ""
        }`}
      >
        <div
          className={`transition-opacity duration-100 ${
            isGlitching ? "opacity-50" : "opacity-100"
          } flex items-center justify-center w-full h-full`}
        >
          {activeView === "logo" ? <PoiroLogo /> : <TextLogo isMobile={isMobile} />}
        </div>

        {isGlitching && (
          <>
            <div className="glitch-layer glitch-layer-1">
              {activeView === "logo" ? <PoiroLogo /> : <TextLogo isMobile={isMobile} />}
            </div>
            <div className="glitch-layer glitch-layer-2">
              {activeView === "logo" ? <PoiroLogo /> : <TextLogo isMobile={isMobile} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const PoiroLogo = () => (
  <div className="crt-text-wrap flex justify-center items-center drop-shadow-[0_0_15px_rgba(255,95,31,0.5)]">
    <img 
      src="/logo.png" 
      alt="Poiro Logo" 
      className="w-11/12 max-w-[120px] sm:max-w-[140px] h-auto object-contain"
    />
  </div>
);

const TextLogo = ({ isMobile }: { isMobile: boolean }) => (
  <div
    className={`crt-text-wrap text-white glow-text drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${comfortaa.className}`}
  >
    <span
      className="font-black uppercase tracking-widest block"
      style={{ 
        fontSize: isMobile ? CRT_FONT_SIZES.mobile.engineering : CRT_FONT_SIZES.desktop.engineering, 
        lineHeight: 1.05 
      }}
    >
      Engineering
    </span>
    <span
      className="font-bold uppercase tracking-[0.14em] text-[#888] block"
      style={{ 
        fontSize: isMobile ? CRT_FONT_SIZES.mobile.creativity : CRT_FONT_SIZES.desktop.creativity, 
        lineHeight: 1.05 
      }}
    >
      Creativity.
    </span>
  </div>
);
