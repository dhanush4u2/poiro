"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ─── Reusable Components ─── */

function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute top-[2px] left-[2px] z-0 text-brand-orange opacity-40 select-none"
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
}

function TerminalLine({
  prefix,
  text,
  delay = 0,
}: {
  prefix: string;
  text: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="font-mono text-sm md:text-base leading-relaxed"
    >
      <span className="text-brand-orange">{prefix}</span>
      <span className="text-light-gray ml-2">{text}</span>
    </motion.div>
  );
}

/* ─── Showcase Card ─── */
function ShowcaseCard({
  title,
  tag,
  description,
  index,
}: {
  title: string;
  tag: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="border border-border-gray bg-black/70 p-6 md:p-8 
                 shadow-[4px_4px_0px_#FF5F1F] hover:shadow-[8px_8px_0px_#FF5F1F]
                 transition-shadow duration-300 group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-brand-orange tracking-widest uppercase">
          {tag}
        </span>
        <span className="font-mono text-xs text-dark-gray">
          [{String(index + 1).padStart(2, "0")}]
        </span>
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-brand-orange transition-colors">
        {title}
      </h3>
      <p className="text-light-gray text-sm leading-relaxed">{description}</p>
      <div className="mt-4 h-px bg-border-gray group-hover:bg-brand-orange transition-colors" />
    </motion.div>
  );
}

/* ─── Showcase Data ─── */
const showcaseItems = [
  {
    title: "Video Content",
    tag: "format::video",
    description:
      "Auto-generated short-form video scripts, visual breakdowns, and performance-ready AI storyboards.",
  },
  {
    title: "Supplement Ad",
    tag: "format::ad",
    description:
      "On-brand ad creatives engineered from real social insights — not guesswork.",
  },
  {
    title: "Tech Review",
    tag: "format::review",
    description:
      "Deep-dive product analyses cross-referenced with audience sentiment data.",
  },
  {
    title: "Social Pulse",
    tag: "format::analytics",
    description:
      "Real-time engagement metrics parsed into content recommendations with a single prompt.",
  },
  {
    title: "Brand Assets",
    tag: "format::design",
    description:
      "Logos, color systems, and typography generated to match your audience's visual language.",
  },
  {
    title: "Campaign Brief",
    tag: "format::strategy",
    description:
      "End-to-end campaign outlines built from competitor analysis and trending topics.",
  },
];

/* ═══════════════════════════════════════════════════════
   PAGE — Three scroll sections over the 3D canvas
   ═══════════════════════════════════════════════════════ */

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  /* Parallax transforms */
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div ref={containerRef}>
      {/* ── SECTION 1: HERO ── */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 relative"
      >
        {/* Top metadata bar */}
        <div className="absolute top-8 left-6 md:left-16 lg:left-24 flex items-center gap-4">
          <span className="font-mono text-xs text-brand-orange tracking-widest">
            POIRO_SYS v1.0
          </span>
          <span className="h-px w-12 bg-border-gray inline-block" />
          <span className="font-mono text-xs text-dark-gray">
            STATUS: ONLINE
          </span>
        </div>

        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] xl:text-[7rem] font-black leading-[0.9] tracking-tight uppercase">
              <GlitchText text="Engineering" />
              <br />
              <span className="text-brand-orange">
                <GlitchText text="Creativity." />
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 md:mt-12"
          >
            <p className="text-light-gray text-lg md:text-xl max-w-xl leading-relaxed">
              Social Insights{" "}
              <span className="text-brand-orange font-mono">→</span> On-brand AI
              Assets.
            </p>
            <p className="text-dark-gray text-sm md:text-base font-mono mt-4 max-w-lg">
              // The platform that turns audience data into production-ready
              creative — at machine speed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex gap-4 flex-wrap"
          >
            <button
              className="bg-brand-orange text-black font-bold px-8 py-4 text-sm uppercase tracking-widest
                         border border-brand-orange shadow-[4px_4px_0px_#ffffff]
                         hover:shadow-[6px_6px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px]
                         transition-all duration-200 active:shadow-none active:translate-x-0 active:translate-y-0"
            >
              Get Started
            </button>
            <button
              className="bg-transparent text-white font-bold px-8 py-4 text-sm uppercase tracking-widest
                         border border-border-gray shadow-[4px_4px_0px_#FF5F1F]
                         hover:shadow-[6px_6px_0px_#FF5F1F] hover:translate-x-[-2px] hover:translate-y-[-2px]
                         hover:border-brand-orange transition-all duration-200
                         active:shadow-none active:translate-x-0 active:translate-y-0"
            >
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-xs text-dark-gray tracking-widest">
            SCROLL
          </span>
          <div className="w-px h-8 bg-brand-orange" />
        </motion.div>
      </motion.section>

      {/* ── SECTION 2: SHOWCASE ── */}
      <section className="min-h-screen px-6 md:px-16 lg:px-24 py-24 md:py-32">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-8 bg-brand-orange inline-block" />
            <span className="font-mono text-xs text-brand-orange tracking-widest uppercase">
              Output Formats
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            What Poiro{" "}
            <span className="text-brand-orange">Generates</span>
          </h2>
        </motion.div>

        {/* Terminal output block */}
        <div className="border border-border-gray bg-black/80 p-6 md:p-8 mb-12 shadow-[4px_4px_0px_#FF5F1F]">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-gray">
            <div className="w-3 h-3 bg-brand-orange" />
            <div className="w-3 h-3 bg-dark-gray" />
            <div className="w-3 h-3 bg-dark-gray" />
            <span className="font-mono text-xs text-dark-gray ml-3">
              poiro@terminal ~ /output
            </span>
          </div>
          <TerminalLine prefix="$" text='poiro generate --type="all"' delay={0.1} />
          <TerminalLine prefix=">" text="Analyzing social data..." delay={0.2} />
          <TerminalLine prefix=">" text="Cross-referencing brand guidelines..." delay={0.35} />
          <TerminalLine prefix=">" text="Generating assets..." delay={0.5} />
          <TerminalLine
            prefix="✓"
            text="6 formats ready. Rendering below."
            delay={0.65}
          />
        </div>

        {/* Showcase grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseItems.map((item, i) => (
            <ShowcaseCard key={item.tag} index={i} {...item} />
          ))}
        </div>
      </section>

      {/* ── SECTION 3: FOOTER / CTA ── */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 md:px-16 lg:px-24 py-24 relative">
        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="border-2 border-brand-orange bg-black/80 p-8 md:p-12 max-w-3xl w-full
                     shadow-[8px_8px_0px_#FF5F1F] mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-brand-orange text-2xl">⚠</span>
            <span className="font-mono text-xs text-brand-orange tracking-widest uppercase">
              System Warning
            </span>
          </div>
          <p className="text-2xl md:text-4xl font-black uppercase leading-tight tracking-tight">
            Warning: Side effects may include{" "}
            <span className="text-brand-orange">dangerously good</span> content!
          </p>
          <div className="mt-6 h-px bg-border-gray" />
          <p className="font-mono text-xs text-dark-gray mt-4">
            // Poiro has been known to cause uncontrollable brand growth.
            Proceed with caution.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            className="bg-brand-orange text-black font-black px-12 py-5 text-lg uppercase tracking-widest
                       border-2 border-brand-orange shadow-[6px_6px_0px_#ffffff]
                       hover:shadow-[10px_10px_0px_#ffffff] hover:translate-x-[-4px] hover:translate-y-[-4px]
                       transition-all duration-200
                       active:shadow-none active:translate-x-0 active:translate-y-0"
          >
            Book a Demo
          </button>
          <p className="font-mono text-xs text-dark-gray mt-6 tracking-wider">
            CTRL+SHIFT+CREATIVITY
          </p>
        </motion.div>

        {/* Bottom metadata */}
        <div className="absolute bottom-8 left-6 md:left-16 right-6 md:right-16 flex justify-between items-center">
          <span className="font-mono text-xs text-dark-gray">
            © 2026 POIRO
          </span>
          <span className="font-mono text-xs text-dark-gray">
            ENGINEERING CREATIVITY
          </span>
        </div>
      </section>
    </div>
  );
}
