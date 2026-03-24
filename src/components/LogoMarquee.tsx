"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════
   LOGO MARQUEE — True infinite scroll
   No gaps, perfectly looping
   ═══════════════════════════════════════════════════════ */

const LOGOS = [
  { name: "Chumbak", src: "/logos/chumbak.webp" },
  { name: "EFPY", src: "/logos/EFPY.webp" },
  { name: "Foramour", src: "/logos/foramour.webp" },
  { name: "Godrej", src: "/logos/godrej.webp" },
  { name: "Stella", src: "/logos/stella.webp" },
  { name: "Greenfields", src: "/logos/greenfields.webp" },
  { name: "Imara", src: "/logos/imara.webp" },
  { name: "Chumbak", src: "/logos/chumbak.webp" },
  { name: "EFPY", src: "/logos/EFPY.webp" },
  { name: "Foramour", src: "/logos/foramour.webp" },
  { name: "Godrej", src: "/logos/godrej.webp" },
  { name: "Stella", src: "/logos/stella.webp" },
  { name: "Greenfields", src: "/logos/greenfields.webp" },
  { name: "Imara", src: "/logos/imara.webp" },
];

const SCROLL_SPEED_PX_PER_SEC = 40;

export default function LogoMarquee() {
  const sequenceRef = useRef<HTMLDivElement | null>(null);
  const [sequenceWidth, setSequenceWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    if (!sequenceRef.current) return;

    const measure = () => {
      setSequenceWidth(sequenceRef.current?.offsetWidth ?? 0);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(sequenceRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    x.set(0);
  }, [sequenceWidth, x]);

  useAnimationFrame((_, delta) => {
    if (!sequenceWidth) return;

    const distance = (SCROLL_SPEED_PX_PER_SEC * delta) / 1000;
    let next = x.get() - distance;

    while (next <= -sequenceWidth) {
      next += sequenceWidth;
    }

    x.set(next);
  });

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    minHeight: "clamp(60px, 7vw, 80px)",
    width: "max-content",
  } as const;

  return (
    <div
      style={{
        width: "100%",
        padding: "clamp(90px, 12vw, 150px) clamp(18px, 4vw, 48px) clamp(44px, 6vw, 72px)",
      }}
    >
      <div
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "clamp(14px, 1.5vw, 24px)",
            lineHeight: 1.2,
            letterSpacing: "0.01em",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          Brands We&apos;ve Worked With
        </h2>

        <div
          style={{
            marginTop: "clamp(30px, 4vw, 48px)",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.02)",
            padding: "clamp(20px, 3vw, 32px) 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "56px",
              height: "100%",
              background: "linear-gradient(to right, #000, transparent)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "56px",
              height: "100%",
              background: "linear-gradient(to left, #000, transparent)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          <motion.div
            style={{
              x,
              display: "flex",
              width: "max-content",
              alignItems: "center",
              willChange: "transform",
            }}
          >
            <div ref={sequenceRef} style={rowStyle}>
              {LOGOS.map((logo, index) => (
                <div
                  key={`${logo.name}-main-${index}`}
                  style={{
                    padding: "0 clamp(24px, 3vw, 40px)",
                    flexShrink: 0,
                    width: "clamp(200px, 20vw, 260px)",
                    height: "clamp(50px, 6vw, 70px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={260}
                    height={70}
                    sizes="(max-width: 768px) 200px, 260px"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      filter: "brightness(0) saturate(100%) invert(100%)",
                      opacity: 0.6,
                      transition: "opacity 0.25s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.opacity = "0.6";
                    }}
                  />
                </div>
              ))}
            </div>

            <div aria-hidden="true" style={rowStyle}>
              {LOGOS.map((logo, index) => (
                <div
                  key={`${logo.name}-dup-${index}`}
                  style={{
                    padding: "0 clamp(24px, 3vw, 40px)",
                    flexShrink: 0,
                    width: "clamp(200px, 20vw, 260px)",
                    height: "clamp(50px, 6vw, 70px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={260}
                    height={70}
                    sizes="(max-width: 768px) 200px, 260px"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      filter: "brightness(0) saturate(100%) invert(100%)",
                      opacity: 0.6,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}