"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Highlighter } from "@/components/TextHighlighter";

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

  const [showH1, setShowH1] = useState(false);
  const [showH2, setShowH2] = useState(false);
  const [showH3, setShowH3] = useState(false);

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
            onUpdate: (self) => {
              if (self.progress > 0.4) {
                setShowH1(true);
              } else {
                setShowH1(false);
              }
            }
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
            onUpdate: (self) => {
              if (self.progress > 0.5) {
                setShowH2(true);
              } else {
                setShowH2(false);
              }
              
              if (self.progress > 0.8) {
                setShowH3(true);
              } else {
                setShowH3(false);
              }
            }
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
        padding: "120px 24px 48px", /* Adjusted: Less bottom padding to reduce gap to LayersSection */
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
            background: "#ff8015",
            borderRadius: "999px",
            padding: "8px 24px",
            marginBottom: "32px",
            opacity: 0,
            boxShadow: "0 4px 14px rgba(255, 128, 21, 0.4)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-figtree), sans-serif",
              fontSize: "0.80rem",
              textTransform: "uppercase",
              color: "#ffffff",
              letterSpacing: "0.15em",
              fontWeight: 600,
            }}
          >
            The Foundation
          </span>
        </div>

        {/* Heading — single line */}
        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-figtree)",
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--color-foreground)",
            marginBottom: "24px",
            textAlign: "center",
            opacity: 0,
          }}
        >
          Storytelling ≠ <Highlighter show={showH1} action="crossed-off" color="#ff8015" padding={3} strokeWidth={3}>Prompting</Highlighter>{" "}
        </h2>

        {/* Description */}
        <p
          ref={descRef}
          style={{
            fontFamily: "var(--font-figtree), sans-serif",
            fontSize: "clamp(1rem, 1.5vw, 1.3rem)",
            color: "var(--color-light-gray)",
            lineHeight: 1.7,
            maxWidth: 800,
            margin: "0 auto",
            opacity: 0,
          }}
        >
          Effective brand storytelling is built in layers, like a well-crafted
          burger. Each element works together to build strong brand identity,
          drive engagement, and create lasting recall. Poiro engineers every layer with precision, so your brand only has to show up with what no one else has: <Highlighter show={showH1} action="underline" color="#ff8015" padding={3} strokeWidth={3}>your secret sauce.</Highlighter>{" "}
        </p>
      </div>
    </section>
  );
}
