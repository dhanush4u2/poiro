"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CRTScreen } from "@/../components/CRTScreen";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   FOOTER CTA — Grassland TV background + CRT overlay
   
   MOBILE CRT TUNING GUIDE:
   - Adjust these values to position and size the CRT on mobile
   - The CRT should match the TV screen in the background image
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   DESKTOP CRT SETTINGS — Don't change unless desktop needs fixing
   ═══════════════════════════════════════════════════════ */
const CRT_DESKTOP = {
  centerX: "48.8%",    // Horizontal position from left
  centerY: "41.5%",    // Vertical position from top
  width: "8.8%",       // Width of the CRT overlay
  height: "13%",       // Height of the CRT overlay
};

/* ═══════════════════════════════════════════════════════
   MOBILE CRT SETTINGS — Adjust these for mobile view!
   
   Tips for adjusting:
   - centerX: move left (<50%) or right (>50%)
   - centerY: move up (<50%) or down (>50%)
   - width: make wider (increase) or narrower (decrease)
   - height: make taller (increase) or shorter (decrease)
   - aspectRatio: set to match the TV screen shape (width/height ratio)
   ═══════════════════════════════════════════════════════ */
const CRT_MOBILE = {
  centerX: "44%",      // Centered horizontally
  centerY: "41.5%",      // Position from top (adjust to align with TV)
  width: "44%",        // Width relative to container
  aspectRatio: 1.23,   // Aspect ratio (width/height) - 0.75 = slightly taller than wide
};

function FooterScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className="footer-scene"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: "relative",
          width: isMobile ? "100%" : "min(100vw, 177.78vh)",
          height: isMobile ? "100%" : "auto",
          aspectRatio: isMobile ? "auto" : "16 / 9",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <Image
          src="/elements/footer.webp"
          alt="Poiro footer scene"
          fill
          priority
          sizes="100vw"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: isMobile ? "center 60%" : "center bottom",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: isMobile
              ? "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)"
              : "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.38) 70%, rgba(0,0,0,0.78) 100%)",
            zIndex: 1,
          }}
        />

        {/* CRT Screen Overlay - positioned to match the TV in the background */}
        <div
          style={{
            position: "absolute",
            left: isMobile ? CRT_MOBILE.centerX : CRT_DESKTOP.centerX,
            top: isMobile ? CRT_MOBILE.centerY : CRT_DESKTOP.centerY,
            width: isMobile ? CRT_MOBILE.width : CRT_DESKTOP.width,
            // Mobile: use aspectRatio to prevent stretching, Desktop: use fixed height
            height: isMobile ? "auto" : CRT_DESKTOP.height,
            aspectRatio: isMobile ? CRT_MOBILE.aspectRatio : "auto",
            transform: "translate(-50%, -50%)",
            zIndex: 3,
            pointerEvents: "none",
            // Mobile minimum sizes to ensure visibility
            minWidth: isMobile ? "80px" : "auto",
            minHeight: isMobile ? "auto" : "auto",
          }}
        >
          <CRTScreen />
        </div>
      </div>
    </div>
  );
}

export default function FooterCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaHeading = "Ship more. Spend less. Create without limits.";

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".footer-scene",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".footer-reveal",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      id="footer-cta"
      style={{
        position: "relative",
        minHeight: "130svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "clamp(24px, 3vw, 40px) clamp(16px, 4vw, 24px) clamp(24px, 4vw, 52px)",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <FooterScene />

      <div
        className="footer-reveal"
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          marginBottom: "auto",
          paddingTop: "clamp(80px, 15vh, 200px)",
          paddingLeft: "clamp(12px, 3vw, 52px)",
          paddingRight: "clamp(12px, 3vw, 52px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            paddingBottom: "clamp(54px, 9vw, 136px)",
            textAlign: "center",
          }}
        >
          <h3
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] sm:leading-[0.95]"
            style={{
              fontFamily: "var(--font-figtree)",
              margin: 0,
              color: "#ffffff",
              fontWeight: 700,
              // Allow text to wrap on mobile
              whiteSpace: "normal",
              wordBreak: "keep-all",
            }}
          >
            {ctaHeading}
          </h3>
        </div>
      </div>

      <div
        className="footer-reveal"
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(16px, 2vw, 22px)",
          padding: "0 4px",
        }}
      >

        <div
          className="footer-bottom-bar"
          style={{
            width: "min(100%, 1200px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            borderTop: "1px solid var(--color-border-gray)",
            paddingTop: "var(--space-3)",
          }}
        >
          {/* Logo and copyright - stack on mobile */}
          <div 
            className="footer-logo-section"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "var(--space-2)",
              flexShrink: 0,
            }}
          >
            <Image
              src="/logo.png"
              alt="Poiro Logo"
              width={60}
              height={20}
              style={{ objectFit: "contain", opacity: 0.9 }}
            />
            <span
              style={{
                fontFamily: "var(--font-figtree), sans-serif",
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "var(--color-border-gray)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              &copy; {new Date().getFullYear()} Poiro
            </span>
          </div>

          {/* Footer links - properly spaced on mobile */}
          <div 
            className="footer-links"
            style={{ 
              display: "flex", 
              gap: "clamp(12px, 3vw, 24px)",
              flexWrap: "wrap",
            }}
          >
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "var(--font-figtree), sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: "var(--color-dark-gray)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-brand-orange)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-dark-gray)";
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
