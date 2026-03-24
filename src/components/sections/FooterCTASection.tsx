"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CRTScreen } from "@/../components/CRTScreen";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   FOOTER CTA — Grassland TV background + CRT overlay
   ═══════════════════════════════════════════════════════ */

/* CRT overlay coordinates relative to 16:9 scene container */
const CRT_CENTER_X = "48.8%";
const CRT_CENTER_Y = "41.5%";
const CRT_WIDTH = "8.8%";
const CRT_HEIGHT = "13%";

function FooterScene() {
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
          width: "min(100vw, 177.78vh)",
          aspectRatio: "16 / 9",
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
            objectPosition: "center bottom",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.38) 70%, rgba(0,0,0,0.78) 100%)",
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: CRT_CENTER_X,
            top: CRT_CENTER_Y,
            width: CRT_WIDTH,
            height: CRT_HEIGHT,
            transform: "translate(-50%, -50%)",
            zIndex: 3,
            pointerEvents: "none",
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
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "clamp(24px, 3vw, 40px) var(--space-3) clamp(24px, 4vw, 52px)",
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
          paddingTop: "clamp(3px, 0.8vw, 10px)",
          paddingLeft: "clamp(18px, 4vw, 52px)",
          paddingRight: "clamp(18px, 4vw, 52px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "980px",
            margin: "0 auto",
            paddingBottom: "clamp(54px, 9vw, 136px)",
            textAlign: "center",
          }}
        >
          <h3
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95]"
            style={{
              fontFamily: "var(--font-figtree)",
              margin: 0,
              color: "#ffffff",
              textWrap: "balance",
            }}
          >
            Ship <span className="animate-gradient-text inline-block" style={{ paddingBottom: "12px" }}>more.</span> Spend <span className="animate-gradient-text inline-block" style={{ paddingBottom: "12px" }}>less.</span>
            <br />
            Create without <span className="animate-gradient-text inline-block" style={{ paddingBottom: "12px" }}>limits.</span>
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
        }}
      >

        <div
          style={{
            width: "min(100%, 1200px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-2)",
            borderTop: "1px solid var(--color-border-gray)",
            paddingTop: "var(--space-3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
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
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "var(--color-border-gray)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              &copy; {new Date().getFullYear()} Poiro
            </span>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "var(--font-figtree), sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--color-dark-gray)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
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
