"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrimaryButton, SecondaryButton } from "@/components/componentBoard";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   FOOTER CTA — Premium closing section
   Smooth scroll-driven reveal with o_logo, glow effects,
   and reversible animations.
   ═══════════════════════════════════════════════════════ */

export default function FooterCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* ── Logo reveal ── */
      gsap.fromTo(
        ".footer-logo",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.06,
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            once: true,
          },
        }
      );

      /* ── Horizontal line draw ── */
      gsap.fromTo(
        ".footer-line-draw",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            once: true,
          },
        }
      );

      /* ── Staggered content reveal ── */
      gsap.fromTo(
        ".footer-reveal",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 55%",
            once: true,
          },
        }
      );

      /* ── Bottom links slide up ── */
      gsap.fromTo(
        ".footer-bottom",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".footer-bottom",
            start: "top 85%",
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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(60px, 10vw, 140px) var(--space-3)",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* Background o_logo watermark */}
      <div
        className="footer-logo"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(400px, 50vw, 800px)",
          height: "clamp(400px, 50vw, 800px)",
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <Image
          src="/o_logo.png"
          alt=""
          fill
          style={{ objectFit: "contain", filter: "brightness(0.5)" }}
          aria-hidden="true"
        />
      </div>

      {/* Background glow that reacts to CTA hover */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: hovered ? "1200px" : "600px",
          height: hovered ? "1200px" : "600px",
          background:
            "radial-gradient(circle, rgba(255,95,31,0.08) 0%, transparent 70%)",
          transition: "all 1s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Divider line */}
        <div
          className="footer-line-draw"
          style={{
            height: "1px",
            background: "var(--color-border-gray)",
            marginBottom: "clamp(48px, 6vw, 96px)",
            transformOrigin: "left center",
          }}
        />

        {/* Eyebrow */}
        <p
          className="footer-reveal"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--color-brand-orange)",
            marginBottom: "var(--space-3)",
          }}
        >
          Start Building
        </p>

        {/* Headline */}
        <h2
          className="footer-reveal"
          style={{
            fontSize: "clamp(42px, 7vw, 120px)",
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            maxWidth: 1000,
          }}
        >
          Engineering{" "}
          <span style={{ color: "var(--color-brand-orange)" }}>Creativity</span>
        </h2>

        {/* Subtext */}
        <p
          className="footer-reveal"
          style={{
            marginTop: "var(--space-4)",
            fontSize: "clamp(16px, 1.8vw, 22px)",
            fontWeight: 500,
            color: "var(--color-dark-gray)",
            maxWidth: 600,
            lineHeight: 1.55,
          }}
        >
          Build your brand&apos;s creative engine with Poiro.
        </p>

        {/* CTA buttons */}
        <div
          className="footer-reveal"
          style={{
            marginTop: "clamp(32px, 4vw, 56px)",
            display: "flex",
            gap: "var(--space-2)",
            flexWrap: "wrap",
            alignItems: "center",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <PrimaryButton size="lg">Save Your Spot</PrimaryButton>
          <SecondaryButton size="lg">Book Demo</SecondaryButton>
        </div>

        {/* Footer bottom */}
        <div
          className="footer-bottom"
          style={{
            marginTop: "clamp(60px, 8vw, 120px)",
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
              src="/o_logo.png"
              alt="Poiro"
              width={20}
              height={20}
              style={{ opacity: 0.6 }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
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
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--color-dark-gray)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "var(--color-brand-orange)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--color-dark-gray)";
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
