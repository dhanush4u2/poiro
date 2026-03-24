"use client";

import React, { useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "motion/react";

type ModuleConfig = {
  id: string;
  title: string;
  system: string;
  description: string;
  image: string;
};

const MODULES: ModuleConfig[] = [
  {
    id: "context",
    title: "Curate Context",
    system: "Brand Cosmos",
    description: "Map audience signals, cultural context, and brand positioning into a living strategic universe.",
    image: "/os/brand-cosmos.webp",
  },
  {
    id: "atlas",
    title: "Ideate & Communicate",
    system: "Atlas",
    description: "Translate insights into narrative direction and messaging systems.",
    image: "/os/atlas.webp",
  },
  {
    id: "flow",
    title: "Create Limitlessly",
    system: "Infinite Flow",
    description: "Generate visual stories and creative variations at scale through AI workflows.",
    image: "/os/infinite-flow.webp",
  },
  {
    id: "apps",
    title: "Build Apps",
    system: "AppStudio",
    description: "Turn creative workflows into custom applications powering marketing operations.",
    image: "/os/appstudio.webp",
  },
  {
    id: "studio",
    title: "Final Touch",
    system: "Poiro Studio",
    description: "Refine, distribute, and optimize content across channels.",
    image: "/os/poiro-studio.webp",
  },
];

export default function OperatingSystemSection() {
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const cardLength = MODULES.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = MODULES.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const activeModule = MODULES[activeCard];

  return (
    <section
      id="operating-system"
      className="os-feature-matrix"
      style={{
        position: "relative",
        padding: "clamp(80px, 12vw, 180px) var(--space-3)",
        background: "#000000",
      }}
    >
      <style>
        {`
          @keyframes osTextFlow {
            0% { background-position: 0% center; }
            100% { background-position: -200% center; }
          }

          .os-animate-text-flow {
            background: linear-gradient(to right, #ff7809, #ffea2b, #ff8015);
            background-size: 200% auto;
            animation: osTextFlow 4s linear infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
          }

          .os-matrix-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: clamp(28px, 4vw, 48px);
            align-items: start;
          }

          @media (min-width: 1024px) {
            .os-matrix-grid {
              grid-template-columns: 1fr 1fr;
              gap: clamp(36px, 4vw, 96px);
            }
          }
        `}
      </style>

      {/* BACKGROUND GLOW */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(900px, 110vw)",
          height: "min(900px, 110vw)",
          background: "radial-gradient(circle, rgba(255,95,31,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "clamp(40px, 6vw, 80px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--color-brand-orange)",
              marginBottom: "var(--space-2)",
              fontWeight: 600,
            }}
          >
            System Architecture
          </p>
          <h2
            style={{
              fontSize: "clamp(36px, 6vw, 84px)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            An Operating System for{" "}
            <span className="os-animate-text-flow">Storytelling.</span>
          </h2>
          <div
            style={{
              marginTop: "clamp(24px, 3.2vw, 38px)",
              height: 1,
              width: "100%",
              background: "linear-gradient(to right, rgba(0,0,0,0), rgba(68,68,68,1), rgba(0,0,0,0))",
            }}
          />
        </div>

        <div className="os-matrix-grid" ref={containerRef}>
          {/* LEFT SIDE - Flows naturally down the page */}
          <div className="relative flex items-start w-full">
            <div className="max-w-2xl w-full">
              {MODULES.map((module, index) => (
                <div key={module.id} style={{ padding: "12vh 0" }}> {/* Spacing creates the "flow" */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeCard === index ? 1 : 0.35 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: activeCard === index ? "#ffffff" : "rgba(255,255,255,0.6)",
                        marginBottom: "8px",
                        fontWeight: 500,
                        transition: "color 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      0{index + 1}. {module.title}
                    </p>
                    <h3
                      style={{
                        fontSize: "clamp(32px, 3vw, 42px)",
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        marginBottom: "12px",
                      }}
                    >
                      {module.system}
                    </h3>
                    <p
                      style={{
                        fontSize: "1.05rem",
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.7,
                        maxWidth: "520px",
                      }}
                    >
                      {module.description}
                    </p>

                    {/* Inline image for mobile only */}
                    <div
                      className="lg:hidden"
                      style={{
                        width: "100%",
                        aspectRatio: "4 / 3",
                        borderRadius: "12px",
                        background: "#050505",
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.06)",
                        position: "relative",
                        marginTop: "24px",
                      }}
                    >
                      <img
                        src={module.image}
                        alt={module.system}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </motion.div>
                </div>
              ))}
              {/* Extra padding at the bottom so the last item can reach the center before scrolling off */}
              <div style={{ height: "20vh" }} />
            </div>
          </div>

          {/* RIGHT SIDE - Sticky Image Panel */}
          <div className="hidden lg:flex w-full sticky top-[20vh] h-[60vh] flex-col justify-center">
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "18px",
                background: "#050505",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
                overflow: "hidden",
              }}
            >
              <motion.div
                key={activeModule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute",
                  inset: 0,
                }}
              >
                <img
                  src={activeModule.image}
                  alt={activeModule.system}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.25), transparent)",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <div style={{ marginTop: "clamp(160px, 12vw, 240px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <h2
              style={{
                fontSize: "clamp(36px, 6vw, 84px)",
                fontWeight: 800,
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                maxWidth: 900,
                margin: "0 auto",
              }}
            >
              Here's What Happens to your{" "}
              <span className="os-animate-text-flow">Brief.</span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
