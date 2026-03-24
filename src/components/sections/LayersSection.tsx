"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   LAYERS SECTION
   "Built Layer by Layer" — burger video left, bullet
   points right. Scroll-scrubbed blur+fade animations.
   ═══════════════════════════════════════════════════════ */

const LAYERS = [
  {
    label: "Brand Strategy",
    detail: "The foundation that defines your essence",
  },
  {
    label: "Audience Insights",
    detail: "Understanding what truly resonates",
  },
  {
    label: "Content Marketing",
    detail: "Crafting messages that move people",
  },
  {
    label: "Consistent Messaging",
    detail: "Reinforcing your story everywhere",
  },
  {
    label: "Creative Direction",
    detail: "Bringing your brand vision to life",
  },
];

export default function LayersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* ── Video: fade + blur in ── */
      gsap.fromTo(
        videoWrapRef.current,
        { opacity: 0, filter: "blur(16px)", scale: 0.97 },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          ease: "none",
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
        padding: "160px 48px",
        background: "var(--color-background)",
        minHeight: "75vh",
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
            }}
          >
            <video
              src="/burger.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* Right — text */}
        <div>
          <h2
            ref={headingRef}
            style={{
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
            {LAYERS.map((layer) => (
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
                    fontSize: "clamp(18px, 1.5vw, 22px)",
                    color: "var(--color-foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ fontWeight: 700 }}>{layer.label}:</strong>{" "}
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
