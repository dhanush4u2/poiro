"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

// ── Motion-blur tuning knobs ──────────────────────────────────────────────────
const BLUR_Y_MAX = 24;       // px – peak vertical blur strength (toned down slightly for smaller text)
const BLUR_VEL_SCALE = 0.05; // ×  – spring velocity × scale = blur px
const BLUR_DECAY_RATE = 0.72; // ×/frame – how fast blur fades
const BLUR_DECAY_FLOOR = 0.3; // px – snap to zero below this

// ── Spring tuning knobs ───────────────────────────────────────────────────────
const SPRING_DURATION = 0.9; 
const SPRING_DAMPING = 20 + 40 * (1 / SPRING_DURATION);    // ≈ 64
const SPRING_STIFFNESS = 100 * (1 / SPRING_DURATION);      // ≈ 111
// ─────────────────────────────────────────────────────────────────────────────

export default function PagePreloader() {
  const controls = useAnimation();
  const [isFinished, setIsFinished] = useState(false);
  const isAnimatingRef = useRef(false);

  // CountUp-style spring — smooth interpolation between progress values
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    damping: SPRING_DAMPING,
    stiffness: SPRING_STIFFNESS,
  });

  // Direct DOM refs — zero React re-renders for the text and blur
  const counterRef = useRef<HTMLSpanElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const currentBlurRef = useRef(0);

  useEffect(() => {
    controls.set({ display: "flex", y: "0%" });
  }, [controls]);

  useEffect(() => {
    const showEvent = "propheus:preloader-transition-show";
    const hideEvent = "propheus:preloader-transition-hide";

    const onShow = (event: Event) => {
      if (!isFinished || isAnimatingRef.current) return;

      const custom = event as CustomEvent<{ id?: string }>;
      const requestId = custom.detail?.id;

      isAnimatingRef.current = true;
      controls.set({ display: "flex", y: "-100%" });
      void controls
        .start({
          y: "0%",
          transition: { duration: 0.52, ease: [0.25, 1, 0.5, 1] },
        })
        .then(() => {
          isAnimatingRef.current = false;
          window.dispatchEvent(
            new CustomEvent("propheus:preloader-covered", {
              detail: { id: requestId },
            })
          );
        });
    };

    const onHide = (event: Event) => {
      if (!isFinished || isAnimatingRef.current) return;

      const custom = event as CustomEvent<{ id?: string }>;
      const requestId = custom.detail?.id;

      isAnimatingRef.current = true;
      void controls
        .start({
          y: "-100%",
          transition: { duration: 0.75, ease: [0.87, 0, 0.13, 1] },
        })
        .then(() => {
          controls.set({ display: "none", y: "-100%" });
          isAnimatingRef.current = false;
          window.dispatchEvent(
            new CustomEvent("propheus:preloader-hidden", {
              detail: { id: requestId },
            })
          );
        });
    };

    window.addEventListener(showEvent, onShow as EventListener);
    window.addEventListener(hideEvent, onHide as EventListener);

    return () => {
      window.removeEventListener(showEvent, onShow as EventListener);
      window.removeEventListener(hideEvent, onHide as EventListener);
    };
  }, [controls, isFinished]);

  // SIMULATE LOADING FOR DEMO PURPOSES
  // (In production, replace this with your actual asset/page loading listeners)
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Jump by random chunks to simulate real network loading
      current += Math.random() * 15 + 5; 
      
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }
      
      motionVal.set(current);
    }, 300);

    return () => clearInterval(interval);
  }, [motionVal]);

  // Write spring value straight to the DOM (Numbers)
  useEffect(() => {
    const unsub = springVal.on("change", (latest) => {
      if (counterRef.current) {
        counterRef.current.textContent = String(Math.round(latest));
      }

      // Trigger exit when spring settles at 100
      if (latest >= 99.9 && !isFinished) {
        setIsFinished(true);
        document.documentElement.dataset.preloaderDone = "true";
        window.dispatchEvent(new CustomEvent("propheus:preloader-dismissed"));
        
        // Wait for it to settle visually, then slide up and away
        setTimeout(() => {
          isAnimatingRef.current = true;
          controls
            .start({
              y: "-100%",
              transition: { duration: 1.1, ease: [0.87, 0, 0.13, 1] }, // Buttery ease-out
            })
            .then(() => {
              controls.set({ display: "none", y: "-100%" });
              isAnimatingRef.current = false;
            });
        }, 500);
      }
    });
    return () => unsub();
  }, [springVal, controls, isFinished]);

  // rAF: drive blur from spring velocity — alive as long as number is moving
  useAnimationFrame(() => {
    if (isFinished) return;
    const velocity = Math.abs(springVal.getVelocity());
    const targetBlur = Math.min(BLUR_Y_MAX, velocity * BLUR_VEL_SCALE);

    if (targetBlur > currentBlurRef.current) {
      currentBlurRef.current = targetBlur; // spike up
    } else if (currentBlurRef.current > BLUR_DECAY_FLOOR) {
      currentBlurRef.current *= BLUR_DECAY_RATE; // decay
    } else {
      currentBlurRef.current = 0;
    }

    if (blurRef.current) {
      blurRef.current.setAttribute("stdDeviation", `0 ${currentBlurRef.current.toFixed(2)}`);
    }
  });

  // Transform the 0-100 spring value into percentages for the UI
  // 1. The Clip Path pulls from right to left (100% inset down to 0% inset)
  const clipInset = useTransform(springVal, [0, 100], [100, 0]);
  const clipPath = useTransform(clipInset, (val) => `inset(0 ${val}% 0 0)`);
  
  // 2. The Playhead moves from left to right (0% to 100%)
  const playheadX = useTransform(springVal, [0, 100], ["0%", "100%"]);

  return (
    <>
      {/* Load Comfortaa font securely for this component */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&display=swap');
      `}</style>

      {/* Vertical-only SVG motion blur */}
      <svg
        style={{ position: "fixed", width: 0, height: 0, overflow: "hidden", zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id="preloader-motion-blur" x="-5%" y="-100%" width="110%" height="300%">
            <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>

      <motion.div
        initial={{ y: 0 }}
        animate={controls}
        className="fixed inset-0 z-[10000] bg-[#000000] flex flex-col items-center justify-center pointer-events-auto"
      >
        <div className="relative inline-flex flex-col items-center">
          
          {/* LOGO CONTAINER */}
          <div className="relative">
            
            {/* Base Layer: Faded/Transparent Layer */}
            <div className="select-none opacity-20">
              <img 
                src="/logo.png" 
                alt="Poiro Logo" 
                className="w-[200px] md:w-[300px] lg:w-[400px] h-auto object-contain" 
              />
            </div>

            {/* Fill Layer: Solid Layer, clipped by progress */}
            <motion.div
              className="absolute top-0 left-0 overflow-hidden select-none"
              style={{ clipPath }}
            >
              <img 
                src="/logo.png" 
                alt="Poiro Logo" 
                className="w-[200px] md:w-[300px] lg:w-[400px] h-auto object-contain" 
              />
            </motion.div>
          </div>

          {/* TRACKING COUNTER */}
          <div className="relative w-full h-8 mt-2 md:mt-4">
            <motion.div 
              className="absolute top-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: playheadX }}
            >
              {/* Little connection dot pointing to the text */}
              <div className="w-1.5 h-1.5 rounded-full bg-white mb-2 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
              
              {/* The blurred counter */}
              <span
                ref={counterRef}
                className="text-white text-lg md:text-xl font-mono font-bold tracking-widest"
                style={{
                  fontVariantNumeric: "tabular-nums",
                  filter: "url(#preloader-motion-blur)",
                  willChange: "filter, transform",
                }}
              >
                0
              </span>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </>
  );
}