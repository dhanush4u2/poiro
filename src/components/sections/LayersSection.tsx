"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Highlighter } from "@/components/TextHighlighter";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   LAYERS SECTION
   "Built Layer by Layer" — burger video left, bullet
   points right. Scroll-scrubbed blur+fade animations.
   ═══════════════════════════════════════════════════════ */

const LAYERS = [
  {
    label: "Content Strategy",
    detail: "The blueprint that shapes every story",
  },
  {
    label: "Audience Insights",
    detail: "Understanding what truly resonates",
  },
  {
    label: "Scripting",
    detail: "Turning ideas into words that captivate",
  },
  {
    label: "Creative Direction",
    detail: "Bringing your vision to life",
  },
  {
    label: "Brand & Product",
    detail: "Weave in your brand seamlessly",
  },
];

export default function LayersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);

  const [showLayers, setShowLayers] = useState<boolean[]>(new Array(LAYERS.length).fill(false));

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* ── Video: fade + scale in (Removed blur for smooth video playback) ── */
      gsap.fromTo(
        videoWrapRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "none",
          force3D: true, // Hardware acceleration
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top 35%",
            scrub: 1.4,
          },
        }
      );

      /* ── Heading: blur fade-up ── */
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 36, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1.2,
          },
        }
      );

      /* ── Bullet items: staggered scrub ── */
      const items = itemsRef.current?.querySelectorAll(".layer-item");
      if (items && items.length > 0) {
        items.forEach((item, i) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 28, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `top ${78 - i * 6}%`,
                end: `top ${28 - i * 4}%`,
                scrub: 1,
                onUpdate: (self) => {
                  setShowLayers((prev) => {
                    const isActive = self.progress > 0.3;
                    if (prev[i] === isActive) return prev;
                    const next = [...prev];
                    next[i] = isActive;
                    return next;
                  });
                },
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="layers"
      style={{
        padding: "48px 48px 80px", /* Adjusted: Smaller top/bottom padding to reduce gaps, removed negative marginTop */
        background: "var(--color-background)",
        minHeight: "55vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="layers-grid"
        style={{
          maxWidth: 1300,
          width: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: "30px",
          alignItems: "center",
        }}
      >
        {/* Left — burger video */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            ref={videoWrapRef}
            style={{
              width: "100%",
              maxWidth: 650,
              aspectRatio: "1 / 1",
              borderRadius: 12,
              overflow: "hidden",
              opacity: 0,
              transform: "translateZ(0)", // Force GPU layer
            }}
          >
            <video
              src="/burger.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transform: "translateZ(0)",
                willChange: "transform",
              }}
            />
          </div>
        </div>

        {/* Right — text */}
        <div>
          <h2
            ref={headingRef}
            style={{
              fontFamily: "var(--font-figtree)",
              fontSize: "clamp(36px, 4vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "var(--color-foreground)",
              marginBottom: "40px",
              opacity: 0,
            }}
          >
            Built Layer by Layer
          </h2>

          <ul
            ref={itemsRef}
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {LAYERS.map((layer, index) => (
              <li
                key={layer.label}
                className="layer-item"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  opacity: 0,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--color-brand-orange)",
                    flexShrink: 0,
                    marginTop: "0.55em",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-figtree)",
                    fontSize: "clamp(18px, 1.5vw, 22px)",
                    color: "var(--color-foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ fontWeight: 700 }}>
                    <Highlighter show={showLayers[index]} action="underline" color="#ff8015" padding={3}>
                      {layer.label}
                    </Highlighter>
                    :
                  </strong>{" "}
                  <span style={{ color: "var(--color-light-gray)" }}>
                    {layer.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Responsive stacking */}
      <style>{`
        @media (max-width: 767px) {
          .layers-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
