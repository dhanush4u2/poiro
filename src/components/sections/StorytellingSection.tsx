"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   STORYTELLING SECTION
   Scroll-scrubbed blur + fade-up. The user controls
   the animation speed by scrolling.
   ═══════════════════════════════════════════════════════ */

export default function StorytellingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: sectionRef.current,
        start: "top 85%",
        end: "top 30%",
        scrub: 1.2,
      };

      /* Badge */
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: 24, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", ease: "none", scrollTrigger: trigger }
      );

      /* Heading */
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            ...trigger,
            start: "top 80%",
            end: "top 25%",
          },
        }
      );

      /* Description */
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            ...trigger,
            start: "top 75%",
            end: "top 20%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="storytelling"
      style={{
        padding: "128px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          ref={badgeRef}
          style={{
            display: "inline-block",
            border: "1px solid var(--color-brand-orange)",
            borderRadius: "999px",
            padding: "6px 20px",
            marginBottom: "32px",
            opacity: 0,
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-brand-orange)",
              letterSpacing: "0.04em",
              fontWeight: 500,
            }}
          >
            The Foundation
          </span>
        </div>

        {/* Heading — single line */}
        <h2
          ref={headingRef}
          style={{
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--color-foreground)",
            marginBottom: "24px",
            textAlign: "center",
            opacity: 0,
          }}
        >
          Storytelling ≠ Prompting
        </h2>

        {/* Description */}
        <p
          ref={descRef}
          style={{
            fontSize: "clamp(1rem, 1.5vw, 1.3rem)",
            color: "var(--color-light-gray)",
            lineHeight: 1.7,
            maxWidth: 640,
            margin: "0 auto",
            opacity: 0,
          }}
        >
          Effective brand storytelling is built in layers, like a well-crafted
          burger. Each element works together to build strong brand identity,
          drive engagement, and create lasting recall.
        </p>
      </div>
    </section>
  );
}
