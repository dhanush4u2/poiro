"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Comfortaa } from "next/font/google";
import { useLenis } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

interface NavProps {
  onCtaClick?: () => void;
}

const NAV_LINKS = [
  { label: "Storytelling OS", targetId: "operating-system" },
  { label: "Our Work", targetId: "masonry-gallery" },
  { label: "Try Us", targetId: "what-happens" },
];

export function Nav({ onCtaClick }: NavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef<"up" | "down">("down");
  const thresholdRef = useRef(0);
  const transitionInFlightRef = useRef(false);
  const { lenis } = useLenis();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const waitForTransitionEvent = (eventName: string, requestId: string, timeoutMs = 2000) =>
    new Promise<void>((resolve) => {
      let done = false;

      const timer = window.setTimeout(() => {
        if (done) return;
        done = true;
        window.removeEventListener(eventName, onEvent as EventListener);
        resolve();
      }, timeoutMs);

      const onEvent = (event: Event) => {
        const custom = event as CustomEvent<{ id?: string }>;
        if (custom.detail?.id !== requestId || done) return;
        done = true;
        window.clearTimeout(timer);
        window.removeEventListener(eventName, onEvent as EventListener);
        resolve();
      };

      window.addEventListener(eventName, onEvent as EventListener);
    });

  const waitForScrollPosition = (targetY: number, tolerance = 8, timeoutMs = 2200) =>
    new Promise<void>((resolve) => {
      const started = performance.now();

      const tick = () => {
        const diff = Math.abs(window.scrollY - targetY);
        if (diff <= tolerance || performance.now() - started > timeoutMs) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });

  const scrollWithPreloader = async (target: HTMLElement | number) => {
    if (transitionInFlightRef.current) return;
    transitionInFlightRef.current = true;

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.dispatchEvent(
      new CustomEvent("propheus:preloader-transition-show", { detail: { id: requestId } })
    );

    await waitForTransitionEvent("propheus:preloader-covered", requestId, 1600);

    const targetY =
      typeof target === "number"
        ? target
        : Math.max(0, window.scrollY + target.getBoundingClientRect().top);

    if (lenis) {
      await new Promise<void>((resolve) => {
        lenis.scrollTo(target, {
          duration: 1.35,
          onComplete: () => resolve(),
        });
      });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
      await waitForScrollPosition(targetY);
    }

    window.dispatchEvent(
      new CustomEvent("propheus:preloader-transition-hide", { detail: { id: requestId } })
    );
    await waitForTransitionEvent("propheus:preloader-hidden", requestId, 2200);
    transitionInFlightRef.current = false;
  };

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    void scrollWithPreloader(target);
  };

  const scrollToTop = () => {
    void scrollWithPreloader(0);
  };

  useEffect(() => {
    thresholdRef.current = window.innerHeight * (180 * 1.25 / 100);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      const scrollDelta = currentScrollY - lastScrollYRef.current;
      if (Math.abs(scrollDelta) > 30) {
        scrollDirectionRef.current = scrollDelta > 0 ? "down" : "up";
        lastScrollYRef.current = currentScrollY;
      }

      if (currentScrollY > thresholdRef.current) {
        setIsHidden(scrollDirectionRef.current === "down");
      } else {
        setIsHidden(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Main Navigation Bar */}
      <nav
        id="main-nav"
        className="fixed z-50 flex items-center justify-between"
        style={{
          top: "var(--space-3)",
          left: "50%",
          transform: isHidden && !isMobileMenuOpen ? "translate(-50%, -130%)" : "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "1280px",
          height: "56px",
          padding: "0 12px 0 16px",
          backgroundColor: isScrolled || isMobileMenuOpen ? "rgba(8,8,8,0.95)" : "rgba(12,12,12,0.7)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: isScrolled || isMobileMenuOpen
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px",
          boxShadow: isScrolled
            ? "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "all 700ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <Link
          href="/"
          className="flex items-center group cursor-pointer"
          style={{ flexShrink: 0, textDecoration: "none" }}
          onClick={(event) => {
            if (window.location.pathname === "/") {
              event.preventDefault();
              setIsMobileMenuOpen(false);
              scrollToTop();
            }
          }}
        >
          <img 
            src="/logo.png" 
            alt="Poiro" 
            style={{ height: "22px", width: "auto", objectFit: "contain" }}
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div
          className="hidden md:flex items-center"
          style={{
            gap: "4px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "6px",
          }}
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={`#${item.targetId}`}
              className="transition-all duration-200"
              style={{
                fontFamily: "var(--font-figtree)",
                fontSize: "13px",
                fontWeight: 500,
                color: hoveredLink === item.label ? "#fff" : "rgba(180,180,180,0.8)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                background: hoveredLink === item.label ? "rgba(255,255,255,0.08)" : "transparent",
                letterSpacing: "0.01em",
              }}
              onClick={(event) => {
                event.preventDefault();
                
                if (item.targetId === "what-happens") {
                  const showEvent = new CustomEvent("propheus:preloader-transition-show", { detail: { id: "scroll-to-os" } });
                  window.dispatchEvent(showEvent);

                  setTimeout(() => {
                    const target = document.getElementById("what-happens");
                    if (target) {
                      target.scrollIntoView({ behavior: "instant", block: "center" });
                    }
                    
                    const hideEvent = new CustomEvent("propheus:preloader-transition-hide", { detail: { id: "scroll-to-os" } });
                    window.dispatchEvent(hideEvent);
                  }, 650);
                } else {
                  scrollToSection(item.targetId);
                }
              }}
              onMouseEnter={() => setHoveredLink(item.label)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center" style={{ gap: "8px" }}>
          {/* Desktop CTA Button */}
          <button
            onClick={() => {
              onCtaClick?.();
              scrollToSection("brief-cta");
            }}
            className="hidden md:flex items-center cursor-pointer transition-all duration-200"
            style={{
              fontFamily: "var(--font-figtree)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#000",
              background: "linear-gradient(135deg, #FF6B2B 0%, #ff8015 50%, #e8541a 100%)",
              border: "1px solid rgba(255,95,31,0.6)",
              borderRadius: "10px",
              padding: "9px 20px",
              boxShadow: "0 0 0 0 rgba(255,95,31,0)",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-1px)";
              el.style.boxShadow = "0 4px 20px rgba(255,95,31,0.4), 0 0 0 1px rgba(255,95,31,0.3)";
              el.style.background = "linear-gradient(135deg, #FF7A3B 0%, #FF6B2B 50%, #f5601e 100%)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "0 0 0 0 rgba(255,95,31,0)";
              el.style.background = "linear-gradient(135deg, #FF6B2B 0%, #ff8015 50%, #e8541a 100%)";
            }}
          >
            Enter your Idea
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden items-center justify-center cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            style={{
              width: "40px",
              height: "40px",
              background: isMobileMenuOpen ? "rgba(255,95,31,0.15)" : "rgba(255,255,255,0.06)",
              border: isMobileMenuOpen ? "1px solid rgba(255,95,31,0.4)" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: isMobileMenuOpen ? "#ff8015" : "#fff",
              transition: "all 0.3s ease",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "14px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "2px",
                  width: "100%",
                  background: "currentColor",
                  borderRadius: "1px",
                  transition: "all 0.3s ease",
                  transform: isMobileMenuOpen ? "rotate(45deg) translateY(6px)" : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  height: "2px",
                  width: "100%",
                  background: "currentColor",
                  borderRadius: "1px",
                  transition: "all 0.3s ease",
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: "block",
                  height: "2px",
                  width: "100%",
                  background: "currentColor",
                  borderRadius: "1px",
                  transition: "all 0.3s ease",
                  transform: isMobileMenuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
                }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
          transition: "opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          top: "80px",
          left: "16px",
          right: "16px",
          zIndex: 45,
          backgroundColor: "rgba(12,12,12,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "24px",
          transform: isMobileMenuOpen ? "translateY(0)" : "translateY(-20px)",
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
          transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Mobile Navigation Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {NAV_LINKS.map((item, index) => (
            <a
              key={item.label}
              href={`#${item.targetId}`}
              style={{
                fontFamily: "var(--font-figtree)",
                fontSize: "18px",
                fontWeight: 600,
                color: "#fff",
                textDecoration: "none",
                padding: "16px 20px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s ease",
                transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-20px)",
                opacity: isMobileMenuOpen ? 1 : 0,
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : "0ms",
              }}
              onClick={(event) => {
                event.preventDefault();
                setIsMobileMenuOpen(false);
                
                setTimeout(() => {
                  if (item.targetId === "what-happens") {
                    const showEvent = new CustomEvent("propheus:preloader-transition-show", { detail: { id: "scroll-to-os" } });
                    window.dispatchEvent(showEvent);

                    setTimeout(() => {
                      const target = document.getElementById("what-happens");
                      if (target) {
                        target.scrollIntoView({ behavior: "instant", block: "center" });
                      }
                      
                      const hideEvent = new CustomEvent("propheus:preloader-transition-hide", { detail: { id: "scroll-to-os" } });
                      window.dispatchEvent(hideEvent);
                    }, 650);
                  } else {
                    scrollToSection(item.targetId);
                  }
                }, 200);
              }}
            >
              <span>{item.label}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>→</span>
            </a>
          ))}
        </div>

        {/* Mobile CTA Button */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            setTimeout(() => {
              onCtaClick?.();
              scrollToSection("brief-cta");
            }, 200);
          }}
          style={{
            width: "100%",
            marginTop: "20px",
            fontFamily: "var(--font-figtree)",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#000",
            background: "linear-gradient(135deg, #FF6B2B 0%, #ff8015 50%, #e8541a 100%)",
            border: "none",
            borderRadius: "14px",
            padding: "18px 24px",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(255,95,31,0.35)",
            transform: isMobileMenuOpen ? "translateY(0)" : "translateY(10px)",
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
            transitionDelay: isMobileMenuOpen ? "150ms" : "0ms",
          }}
        >
          Enter your Idea
        </button>
      </div>
    </>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PrimaryButton({
  children,
  onClick,
  size = "md",
  className = "",
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: "var(--space-1) var(--space-3)", fontSize: "11px" },
    md: { padding: "var(--space-2) var(--space-5)", fontSize: "13px" },
    lg: { padding: "var(--space-3) var(--space-8)", fontSize: "15px" },
  };

  return (
    <button
      onClick={onClick}
      className={`bg-brand-orange text-black font-bold uppercase tracking-widest border border-brand-orange cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 transition-all duration-200 ${className}`}
      style={{
        ...sizeStyles[size],
        borderRadius: "10px",
        boxShadow: "var(--shadow-white-sm)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-white-md)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-white-sm)";
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  size = "md",
  className = "",
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: "var(--space-1) var(--space-3)", fontSize: "11px" },
    md: { padding: "var(--space-2) var(--space-5)", fontSize: "13px" },
    lg: { padding: "var(--space-3) var(--space-8)", fontSize: "15px" },
  };

  return (
    <button
      onClick={onClick}
      className={`bg-transparent text-white font-bold uppercase tracking-widest border border-border-gray cursor-pointer hover:border-brand-orange hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 transition-all duration-200 ${className}`}
      style={{
        ...sizeStyles[size],
        borderRadius: "10px",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {children}
    </button>
  );
}

interface ControlPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ControlPanel({ title, children, className = "" }: ControlPanelProps) {
  return (
    <div
      className={`border border-border-gray bg-accent ${className}`}
      style={{ padding: "var(--space-3)", boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="font-mono uppercase tracking-widest text-brand-orange"
        style={{ fontSize: "10px", marginBottom: "var(--space-2)" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

interface TickerProps {
  items: string[];
  speed?: number;
  separator?: string;
  className?: string;
}

export function Ticker({
  items,
  speed = 20,
  separator = "*",
  className = "",
}: TickerProps) {
  const content = items.join(` ${separator} `) + ` ${separator} `;

  return (
    <div
      className={`overflow-hidden whitespace-nowrap border-y border-border-gray ${className}`}
      style={{ padding: "var(--space-2) 0" }}
    >
      <div className="inline-flex" style={{ animation: `ticker-scroll ${speed}s linear infinite` }}>
        <span
          className="text-dark-gray uppercase tracking-widest font-bold"
          style={{ fontSize: "13px", paddingRight: "var(--space-4)" }}
        >
          {content}
        </span>
        <span
          className="text-dark-gray uppercase tracking-widest font-bold"
          style={{ fontSize: "13px", paddingRight: "var(--space-4)" }}
        >
          {content}
        </span>
      </div>
    </div>
  );
}

interface StatBlockProps {
  value: string;
  label: string;
  icon?: string;
  className?: string;
}

export function StatBlock({ value, label, icon, className = "" }: StatBlockProps) {
  return (
    <div className={`border border-border-gray bg-accent ${className}`} style={{ padding: "var(--space-3)" }}>
      {icon && (
        <span className="text-brand-orange" style={{ fontSize: "20px", marginBottom: "var(--space-1)", display: "block" }}>
          {icon}
        </span>
      )}
      <div className="text-white font-bold" style={{ fontSize: "32px", lineHeight: 1, marginBottom: "var(--space-1)" }}>
        {value}
      </div>
      <div className="text-dark-gray font-mono uppercase tracking-widest" style={{ fontSize: "10px" }}>
        {label}
      </div>
    </div>
  );
}

interface TerminalLine {
  prefix: string;
  text: string;
}

interface TerminalConsoleProps {
  title?: string;
  lines: TerminalLine[];
  className?: string;
  animate?: boolean;
}

export function TerminalConsole({
  title = "poiro@terminal",
  lines,
  className = "",
  animate = true,
}: TerminalConsoleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !containerRef.current) return;
    const lineEls = containerRef.current.querySelectorAll(".terminal-line");
    gsap.fromTo(
      lineEls,
      { opacity: 0, x: -16 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.12,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      }
    );
  }, [animate]);

  return (
    <div ref={containerRef} className={`border border-border-gray bg-black/80 ${className}`} style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center border-b border-border-gray" style={{ padding: "var(--space-1) var(--space-2)", gap: "var(--space-1)" }}>
        <div className="bg-brand-orange" style={{ width: "8px", height: "8px" }} />
        <div className="bg-border-gray" style={{ width: "8px", height: "8px" }} />
        <div className="bg-border-gray" style={{ width: "8px", height: "8px" }} />
        <span className="font-mono text-dark-gray" style={{ fontSize: "10px", marginLeft: "var(--space-1)" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "var(--space-2) var(--space-3)" }}>
        {lines.map((line, i) => (
          <div key={i} className="terminal-line font-mono leading-relaxed" style={{ fontSize: "13px", marginBottom: "var(--space-1)" }}>
            <span className="text-brand-orange">{line.prefix}</span>
            <span className="text-light-gray" style={{ marginLeft: "var(--space-1)" }}>
              {line.text}
            </span>
          </div>
        ))}
        <span className="text-brand-orange font-mono inline-block" style={{ animation: "blink 1s step-end infinite", fontSize: "13px" }}>
          |
        </span>
      </div>
    </div>
  );
}

interface PipelineStage {
  name: string;
  description?: string;
}

interface PipelineTrackerProps {
  stages: PipelineStage[];
  activeIndex?: number;
  className?: string;
}

export function PipelineTracker({ stages, activeIndex = -1, className = "" }: PipelineTrackerProps) {
  return (
    <div className={`flex flex-col md:flex-row items-stretch ${className}`} style={{ gap: "var(--space-1)" }}>
      {stages.map((stage, i) => {
        const isActive = i <= activeIndex;
        return (
          <div key={stage.name} className="flex items-center flex-1" style={{ gap: "var(--space-1)" }}>
            <div
              className={`flex-1 border transition-all duration-500 ${isActive ? "border-brand-orange bg-brand-orange/10" : "border-border-gray bg-accent"}`}
              style={{ padding: "var(--space-2) var(--space-3)" }}
            >
              <div
                className={`font-bold uppercase tracking-widest transition-colors duration-500 ${isActive ? "text-brand-orange" : "text-dark-gray"}`}
                style={{ fontSize: "12px", marginBottom: "var(--space-1)" }}
              >
                {stage.name}
              </div>
              {stage.description && (
                <div
                  className={`font-mono transition-colors duration-500 ${isActive ? "text-light-gray" : "text-border-gray"}`}
                  style={{ fontSize: "10px" }}
                >
                  {stage.description}
                </div>
              )}
            </div>
            {i < stages.length - 1 && (
              <span
                className={`font-mono transition-colors duration-500 hidden md:block ${isActive ? "text-brand-orange" : "text-border-gray"}`}
                style={{ fontSize: "18px" }}
              >
                {"->"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  isOn?: boolean;
  onToggle?: (value: boolean) => void;
  className?: string;
}

export function ToggleSwitch({ label, isOn = false, onToggle, className = "" }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onToggle?.(!isOn)}
      className={`flex items-center cursor-pointer bg-transparent border-none ${className}`}
      style={{ gap: "var(--space-2)" }}
    >
      <div className={`relative transition-colors duration-200 ${isOn ? "bg-brand-orange" : "bg-border-gray"}`} style={{ width: "40px", height: "16px" }}>
        <div
          className="absolute top-0 bg-white transition-all duration-200"
          style={{ width: "16px", height: "16px", left: isOn ? "24px" : "0px" }}
        />
      </div>
      <span
        className={`font-mono uppercase tracking-widest transition-colors duration-200 ${isOn ? "text-brand-orange" : "text-dark-gray"}`}
        style={{ fontSize: "10px" }}
      >
        {label}
      </span>
    </button>
  );
}
