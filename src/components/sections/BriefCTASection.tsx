"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Figtree } from "next/font/google";
import ColorBends from "@/components/ColorBends";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

type TimelineStep = {
  step: number;
  title: string;
  desc: string;
  tickHeight: number;
  textMargin: number;
};

type UploadState = "idle" | "uploading" | "success" | "error";

type BriefFormData = {
  name: string;
  email: string;
  company: string;
  brief: string;
};

const TIMELINE: TimelineStep[] = [
  { step: 1, title: "Send the Brief", desc: "Share your goal, product, and guardrails.", tickHeight: 28, textMargin: 64 },
  {
    step: 2,
    title: "We Shape the Direction",
    desc: "Hooks, angles, and concepts built for your brand.",
    tickHeight: 52,
    textMargin: 88,
  },
  {
    step: 3,
    title: "We Create",
    desc: "Statics, videos, and PDP assets for every placement.",
    tickHeight: 36,
    textMargin: 72,
  },
  { step: 4, title: "You Review", desc: "Feedback in. We refine fast.", tickHeight: 28, textMargin: 64 },
  {
    step: 5,
    title: "Ready to Publish",
    desc: "Final creatives delivered to spec.",
    tickHeight: 52,
    textMargin: 88,
  },
  {
    step: 6,
    title: "Then We Scale",
    desc: "More variants, markets, and winning creatives.",
    tickHeight: 36,
    textMargin: 72,
  },
];

function AnimatedFolder({ isHovered }: { isHovered: boolean }) {
  const folderSize = { width: 88, height: 64 };
  const tabWidth = folderSize.width * 0.35;
  const tabHeight = folderSize.height * 0.25;

  const displayImages = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=300&auto=format&fit=crop",
  ];

  return (
    <div style={{ perspective: "1000px" }} className="pointer-events-none">
      <motion.div
        className="relative"
        style={{
          width: folderSize.width,
          height: folderSize.height,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 rounded-md bg-gradient-to-b from-[#D99A29] to-[#B57C1A] shadow-md">
          <div
            className="absolute left-1 rounded-t-md bg-gradient-to-b from-[#E8A82D] to-[#D99A29]"
            style={{
              top: -tabHeight * 0.8,
              width: tabWidth,
              height: tabHeight,
            }}
          />
        </div>

        {displayImages.map((image, index) => {
          const totalImages = displayImages.length;
          const hoverRotation = 15;
          const hoverTranslateY = -65;
          const hoverSpread = 45;
          const teaserImageSize = { width: 52, height: 36 };
          const hoverImageSize = { width: 112, height: 76 };

          const baseRotation = (index - 1) * hoverRotation;
          const hoverY = hoverTranslateY - (totalImages - 1 - index) * 5;
          const hoverX = (index - 1) * hoverSpread;
          const teaseY = -6 - (totalImages - 1 - index) * 2;
          const teaseRotation = (index - 1) * 3;

          return (
            <motion.div
              key={index}
              className="absolute top-1 left-1/2 origin-bottom overflow-hidden rounded-md bg-black shadow-sm ring-1 ring-white/10"
              animate={{
                x: `calc(-50% + ${isHovered ? hoverX : 0}px)`,
                y: isHovered ? hoverY : teaseY,
                rotate: isHovered ? baseRotation : teaseRotation,
                width: isHovered ? hoverImageSize.width : teaserImageSize.width,
                height: isHovered ? hoverImageSize.height : teaserImageSize.height,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: index * 0.03,
              }}
              style={{ zIndex: 10 + index }}
            >
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover opacity-90"
              />
            </motion.div>
          );
        })}

        <motion.div
          className="absolute inset-x-0 bottom-0 h-[85%] origin-bottom rounded-md bg-gradient-to-b from-[#F2C154] to-[#E8A82D] shadow-[0_-2px_15px_rgba(0,0,0,0.3)]"
          animate={{
            rotateX: isHovered ? -45 : -20,
            scaleY: isHovered ? 0.85 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          style={{
            transformStyle: "preserve-3d",
            zIndex: 20,
          }}
        >
          <div className="absolute top-1 right-1 left-1 h-px bg-white/30" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function BriefCTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [briefFormData, setBriefFormData] = useState<BriefFormData>({
    name: "",
    email: "",
    company: "",
    brief: "",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setIsVisible(true), 200);

    return () => window.clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isModalOpen]);

  const appendFiles = (incoming: FileList | null) => {
    if (!incoming) return;

    const next = Array.from(incoming).filter((file) => file.size > 0);
    if (!next.length) return;

    setFiles((prev) => {
      const key = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;
      const existing = new Set(prev.map(key));
      const merged = [...prev];

      next.forEach((file) => {
        const id = key(file);
        if (!existing.has(id)) {
          existing.add(id);
          merged.push(file);
        }
      });

      return merged;
    });
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = () => {
    if (uploadState === "uploading") return;
    setUploadMessage("");
    setIsModalOpen(true);
  };

  const handleSendBrief = async () => {
    if (uploadState === "uploading") return;

    const hasBriefText = briefFormData.brief.trim().length > 0;
    const hasFiles = files.length > 0;

    if (!briefFormData.email.trim()) {
      setUploadMessage("Please enter your email so we can reply with your draft.");
      return;
    }

    if (!hasBriefText && !hasFiles) {
      setUploadMessage("Add a short brief or attach at least one file.");
      return;
    }

    setUploadState("uploading");
    setProgress(0);
    setIsHovered(false);
    setIsModalOpen(false);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("name", briefFormData.name.trim());
    formData.append("email", briefFormData.email.trim());
    formData.append("company", briefFormData.company.trim());
    formData.append("brief", briefFormData.brief.trim());
    files.forEach((file) => formData.append("files", file));

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/brief-submit");

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.floor((event.loaded / event.total) * 97);
        setProgress((current) => Math.max(current, percent));
      };

      xhr.onload = () => {
        const success = xhr.status >= 200 && xhr.status < 300;
        if (!success) {
          setUploadState("error");
          setUploadMessage("Upload failed. Please try again.");
          setProgress(0);
          resolve();
          return;
        }

        setProgress(100);
        setUploadState("success");
        setUploadMessage("Brief sent successfully.");

        window.setTimeout(() => {
          setUploadState("idle");
          setProgress(0);
          setBriefFormData({ name: "", email: "", company: "", brief: "" });
          setFiles([]);
          setUploadMessage("");
        }, 2400);

        resolve();
      };

      xhr.onerror = () => {
        setUploadState("error");
        setUploadMessage("Network error while uploading. Please try again.");
        setProgress(0);
        resolve();
      };

      xhr.send(formData);
    });
  };

  const lineDrawTime = 2.5;

  return (
    <section
      id="brief-cta"
      className="relative w-full bg-[#020202] text-white overflow-hidden"
      style={{
        padding: "clamp(110px, 13vw, 190px) var(--space-3)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-[45%]">
        <ColorBends
          colors={["#ff8015", "#fe7216", "#ff5c7a"]}
          rotation={1}
          speed={0.17}
          scale={1.1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={0.5}
          parallax={0.5}
          noise={0.1}
          transparent={true}
          autoRotate={0}
        />
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#ff8015] rounded-[100%] blur-[150px] opacity-[0.08] pointer-events-none z-0" />

      <style>
        {`
          @keyframes drawTrack { 0% { width: 0; } 100% { width: 100%; } }
          @keyframes drawTrackVertical { 0% { height: 0; } 100% { height: 100%; } }

          /* Flowing gradient animations */
          @keyframes flowGradientHorizontal {
            0% { background-position: 0% center; }
            100% { background-position: -200% center; }
          }
          @keyframes flowGradientVertical {
            0% { background-position: center 0%; }
            100% { background-position: center -200%; }
          }

          @keyframes nodeActivate {
            0% { border-color: #333; box-shadow: 0 0 0 rgba(255,128,21,0); transform: scale(1); color: #666; opacity: 0; }
            30% { border-color: #ff8015; box-shadow: 0 0 30px rgba(255,128,21,0.6); transform: scale(1.1); color: #fff; opacity: 1; }
            100% { border-color: #ff8015; box-shadow: 0 0 20px rgba(255,128,21,0.3); transform: scale(1); color: #fff; opacity: 1; }
          }

          @keyframes sproutY { 0% { transform: scaleY(0); opacity: 0; } 100% { transform: scaleY(1); opacity: 1; } }
          @keyframes textFadeUp { 0% { opacity: 0; transform: translateY(15px); filter: blur(4px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
          @keyframes textFadeDown { 0% { opacity: 0; transform: translateY(-15px); filter: blur(4px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
          @keyframes sweep { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }

          @keyframes drawCheck {
            0% { stroke-dashoffset: 24; }
            100% { stroke-dashoffset: 0; }
          }

          @keyframes successPop {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            50% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }

          @keyframes textFlow {
            0% { background-position: 0% center; }
            100% { background-position: -200% center; }
          }

          /* Thick timeline track classes */
          .brief-anim-draw-track {
            background: linear-gradient(to right, #ff8015, #f8ff23, #ff8015);
            background-size: 200% auto;
            animation: drawTrack ${lineDrawTime}s linear forwards, flowGradientHorizontal 3s linear infinite;
          }
          .brief-anim-draw-track-vert {
            background: linear-gradient(to bottom, #ff8015, #f8ff23, #ff8015);
            background-size: 100% 200%;
            animation: drawTrackVertical ${lineDrawTime}s linear forwards, flowGradientVertical 3s linear infinite;
          }
          
          .brief-anim-node-activate { animation: nodeActivate 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .brief-anim-sprout { animation: sproutY 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .brief-anim-text-up { animation: textFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .brief-anim-text-down { animation: textFadeDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .brief-anim-draw-check { stroke-dasharray: 24; animation: drawCheck 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s; }
          .brief-anim-success-pop { animation: successPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          .brief-animate-text-flow {
            background: linear-gradient(to right, #ff8015, #ff5315, #ff8015);
            background-size: 200% auto;
            animation: textFlow 4s linear infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
          }

          /* Upload modal (local-only styles) */
          .brief-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 120;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: clamp(12px, 2vw, 24px);
            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(12px);
          }

          .brief-modal-panel {
            width: min(100%, 820px);
            max-height: min(92vh, 840px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: linear-gradient(160deg, #111111, #080808);
            box-shadow: 0 40px 140px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .brief-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 24px 32px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .brief-modal-body {
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
            flex: 1;
            /* Scrollbar styling */
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.2) transparent;
          }
          
          .brief-modal-body::-webkit-scrollbar {
            width: 6px;
          }
          .brief-modal-body::-webkit-scrollbar-track {
            background: transparent;
          }
          .brief-modal-body::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 20px;
          }

          .brief-modal-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
          }

          @media (min-width: 768px) {
            .brief-modal-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          /* General Input Styles */
          .brief-modal-input {
            height: 52px;
            padding: 0 18px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #ffffff;
            font-size: 15px;
            outline: none;
            transition: all 0.2s ease;
          }
          .brief-modal-input::placeholder {
            color: rgba(255, 255, 255, 0.35);
          }
          .brief-modal-input:focus {
            border-color: #ff8015;
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 0 4px rgba(255, 128, 21, 0.1);
          }

          .brief-modal-textarea {
            width: 100%;
            min-height: 160px;
            padding: 16px 18px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #ffffff;
            font-size: 15px;
            line-height: 1.5;
            outline: none;
            transition: all 0.2s ease;
            resize: vertical;
          }
          .brief-modal-textarea::placeholder {
            color: rgba(255, 255, 255, 0.35);
          }
          .brief-modal-textarea:focus {
            border-color: #ff8015;
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 0 4px rgba(255, 128, 21, 0.1);
          }

          .brief-modal-dropzone {
            border-radius: 16px;
            border: 2px dashed rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.02);
            padding: 32px 24px;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            cursor: pointer;
            position: relative;
          }
          
          .brief-modal-dropzone:hover {
            border-color: rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.04);
          }

          .brief-modal-dropzone.is-active {
            border-color: #ff8015;
            background: rgba(255, 128, 21, 0.08);
          }

          .brief-modal-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 16px;
            padding-top: 24px;
            margin-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }

          .brief-modal-btn {
            height: 48px;
            padding: 0 24px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            line-height: 1;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>

      <div
        className="relative z-10 w-full flex flex-col items-center brief-cta-container"
        style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px" }}
      >
        {/* Header section with title and subtitle */}
        <div
          className="w-full text-center brief-cta-header"
          style={{ maxWidth: 1120, margin: "0 auto", marginBottom: "clamp(24px, 4vw, 56px)" }}
        >
          <h2 className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter ${figtree.className}`}>
            <span className="brief-animate-text-flow">Unbelievable</span> right?
          </h2>
          <h4
            style={{
              fontFamily: "var(--font-figtree)",
              marginTop: "clamp(12px, 2.4vw, 20px)",
              fontSize: "clamp(13px, 2vw, 24px)",
              lineHeight: 1.45,
              fontWeight: 600,
              color: "#c6c6c6",
              letterSpacing: "0.01em",
              padding: "0 8px",
            }}
          >
            Send Us Your Idea & We'll Bring It To Life.
          </h4>
        </div>

        {/* Upload card */}
        <div
          onClick={handleUploadClick}
          onMouseEnter={() => uploadState === "idle" && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`brief-upload-card relative w-full max-w-[1120px] mx-auto rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-700 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20 ${
            uploadState === "idle"
              ? "bg-[#050505]/30 hover:bg-[#ff8015]/[0.02] cursor-pointer group shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
              : uploadState === "uploading"
              ? "bg-[#ff8015]/[0.02] cursor-wait shadow-[inset_0_0_80px_rgba(255,95,31,0.05)]"
              : "bg-green-500/[0.02] cursor-default shadow-[inset_0_0_80px_rgba(34,197,94,0.05)]"
          }`}
          style={{ minHeight: "clamp(220px, 30vw, 360px)" }}
        >
          {/* Dashed border */}
          <div className="absolute inset-0 pointer-events-none p-[1px] z-0">
            <svg width="100%" height="100%" className="overflow-visible rounded-[1.5rem] sm:rounded-[2rem]">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                fill="none"
                strokeWidth="2"
                strokeDasharray="12 12"
                className={`transition-colors duration-700 ${
                  uploadState === "idle"
                    ? "stroke-[#444] group-hover:stroke-[#ff8015]/50"
                    : uploadState === "uploading"
                    ? "stroke-[#ff8015]/40"
                    : "stroke-green-500/40"
                }`}
              />
            </svg>
          </div>

          {/* Folder icon animation */}
          <div
            className={`relative z-20 transition-all duration-500 ease-out flex justify-center w-full ${
              uploadState === "idle"
                ? "opacity-100 translate-y-0 h-[70px] sm:h-[90px] mb-6 sm:mb-8"
                : "opacity-0 translate-y-8 h-0 mb-0"
            }`}
          >
            <AnimatedFolder isHovered={isHovered} />
          </div>

          {/* Button and glow effects */}
          <div className="relative z-40">
            <div
              className={`absolute -inset-2 rounded-full blur-xl transition duration-700 ${
                uploadState === "idle"
                  ? "bg-gradient-to-r from-[#ff8015]/0 via-[#ff8015]/40 to-[#ff8015]/0 opacity-40 group-hover:opacity-0"
                  : uploadState === "success"
                  ? "bg-green-500/40 opacity-100"
                  : "opacity-0"
              }`}
            />

            <div
              className={`absolute -inset-2 bg-white/0 rounded-full blur-xl transition duration-500 ${
                uploadState === "idle" ? "group-hover:bg-white/30" : "opacity-0"
              }`}
            />

            <button
              type="button"
              disabled={uploadState === "uploading"}
              style={{ fontFamily: "var(--font-figtree)" }}
              className={`relative min-w-[240px] sm:min-w-[300px] md:min-w-[340px] min-h-[48px] sm:min-h-[52px] md:min-h-[58px] px-8 sm:px-12 md:px-14 py-3 sm:py-4 md:py-5 backdrop-blur-md rounded-full font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-[13px] sm:text-[15px] overflow-hidden flex items-center justify-center transition-all duration-500 ${
                uploadState === "idle"
                  ? "bg-[#0a0a0a]/80 border border-white/20 text-white group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-[0.96] active:bg-[#e0e0e0] active:shadow-inner"
                  : uploadState === "uploading"
                  ? "bg-[#0a0a0a]/80 border border-[#333] text-white cursor-wait shadow-inner"
                  : uploadState === "success"
                  ? "bg-green-500/10 border border-green-500 text-green-400 cursor-default brief-anim-success-pop"
                  : "bg-red-500/10 border border-red-500 text-red-400 cursor-pointer"
              }`}
            >
              {uploadState === "uploading" && (
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-[#ff8015] transition-all duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[10px] bg-[#ff8015] blur-sm" />
                </div>
              )}

              <div
                className={`absolute top-0 left-0 right-0 h-[1px] ${
                  uploadState === "success"
                    ? "bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
                    : "bg-gradient-to-r from-transparent via-white/50 to-transparent"
                }`}
              />

              {uploadState === "idle" && (
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:animate-[sweep_0.8s_ease-in-out]" />
              )}

              <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                {uploadState === "idle" && "Upload Brief"}

                {uploadState === "uploading" && (
                  <div className="flex items-center gap-4 w-full justify-center">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-white/10"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-[#ff8015] transition-all duration-75 ease-out"
                          strokeDasharray="62.83"
                          strokeDashoffset={62.83 - (62.83 * progress) / 100}
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#888]">Uploading</span>
                      <span className="font-mono text-[#ff8015] w-[4ch] text-right">
                        {Math.floor(progress)}%
                      </span>
                    </div>
                  </div>
                )}

                {uploadState === "success" && (
                  <>
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="brief-anim-draw-check"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                        strokeDashoffset="24"
                      />
                    </svg>
                    Uploaded
                  </>
                )}

                {uploadState === "error" && "Retry Upload"}
              </span>
            </button>
          </div>

          {/* Helper text - inside card at bottom */}
          <div
            className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-500 ${
              uploadState === "idle" ? "opacity-100" : "opacity-0 translate-y-2"
            }`}
          >
            <span className="text-[#888] text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] font-mono font-bold group-hover:text-[#ff8015]/80 transition-colors duration-500 whitespace-nowrap">
              Click & Share your brief with us
            </span>
          </div>
        </div>

        {uploadMessage && uploadState === "error" && (
          <p className="mt-4 text-sm text-red-400 font-mono tracking-wide">{uploadMessage}</p>
        )}

        {/* --- TIMELINE COMPONENT TEMPORARILY COMMENTED OUT --- */}
        {false && (
        <div
          className="relative w-full max-w-[1220px] mx-auto"
          style={{ marginTop: "clamp(100px, 9vw, 140px)" }}
        >
          <div className="hidden lg:grid grid-cols-6 relative w-full h-[360px]">
            {/* The main horizontal track */}
            <div className="absolute top-1/2 left-0 w-full h-[6px] bg-[#1a1a1a] rounded-full -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 w-full h-[6px] shadow-[0_0_20px_#ff8015] rounded-full -translate-y-1/2">
              {isVisible && (
                <div className="h-full rounded-full brief-anim-draw-track" />
              )}
            </div>

            {TIMELINE.map((item, index) => {
              const isTop = index % 2 !== 0;
              const reachTime = lineDrawTime * ((index + 0.5) / TIMELINE.length);

              return (
                <div key={item.step} className="relative w-full h-full flex justify-center items-center group">
                  {/* The circular node */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full border-[3px] border-[#333] bg-[#050505] flex items-center justify-center z-20 opacity-0 brief-anim-node-activate my-[1px]"
                    style={{ animationDelay: `${reachTime}s` }}
                  >
                    <span className="text-[17px] font-mono font-bold transition-colors duration-300 group-hover:text-white">{item.step}</span>
                  </div>

                  {/* Top content (Text pointing down) */}
                  {isTop && (
                    <div 
                      className="absolute bottom-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center justify-end w-[240px] z-10"
                      style={{ paddingBottom: `${item.textMargin}px` }}
                    >
                      {isVisible && (
                        <div
                          className="absolute bottom-[28px] left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-t from-[#ff8015] to-[#ff8015]/0 origin-bottom opacity-0 brief-anim-sprout"
                          style={{ height: `${item.tickHeight}px`, animationDelay: `${reachTime}s` }}
                        />
                      )}
                      <div
                        className="opacity-0 brief-anim-text-down flex flex-col items-center text-center"
                        style={{ animationDelay: `${reachTime + 0.2}s` }}
                      >
                        <h3 className={`text-[18px] font-bold text-white tracking-wide mb-2 leading-tight transition-colors duration-300 group-hover:text-[#ff8015] ${figtree.className}`}>
                          {item.title}
                        </h3>
                        <p className="text-[15px] text-[#999] leading-relaxed font-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom content (Text pointing up) */}
                  {!isTop && (
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center justify-start w-[240px] z-10"
                      style={{ paddingTop: `${item.textMargin}px` }}
                    >
                      {isVisible && (
                        <div
                          className="absolute top-[28px] left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-[#ff8015] to-[#ff8015]/0 origin-top opacity-0 brief-anim-sprout"
                          style={{ height: `${item.tickHeight}px`, animationDelay: `${reachTime}s` }}
                        />
                      )}
                      <div
                        className="opacity-0 brief-anim-text-up flex flex-col items-center text-center"
                        style={{ animationDelay: `${reachTime + 0.2}s` }}
                      >
                        <h3 className={`text-[18px] font-bold text-white tracking-wide mb-2 leading-tight transition-colors duration-300 group-hover:text-[#ff8015] ${figtree.className}`}>
                          {item.title}
                        </h3>
                        <p className="text-[15px] text-[#999] leading-relaxed font-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex lg:hidden flex-col relative w-full h-full px-2 mt-16 sm:mt-24 pb-8">
            {/* The main vertical track */}
            <div className="absolute top-0 bottom-0 left-[40px] w-[6px] bg-[#1a1a1a] rounded-full -translate-x-1/2" />
            <div className="absolute top-0 bottom-0 left-[40px] w-[6px] shadow-[0_0_20px_#ff8015] rounded-full -translate-x-1/2">
              {isVisible && (
                <div className="w-full h-full rounded-full brief-anim-draw-track-vert" />
              )}
            </div>

            {TIMELINE.map((item, index) => {
              const reachTime = lineDrawTime * ((index + 0.5) / TIMELINE.length);

              return (
                <div key={item.step} className="relative flex items-center mb-16 sm:mb-20 w-full group min-h-[64px]">
                  {/* The circular node */}
                  <div
                    className="absolute left-[40px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] shrink-0 rounded-full border-[3px] border-[#333] bg-[#050505] flex items-center justify-center z-20 opacity-0 brief-anim-node-activate my-[1px]"
                    style={{ animationDelay: `${reachTime}s` }}
                  >
                    <span className="text-[17px] font-mono font-bold transition-colors duration-300 group-hover:text-white">{item.step}</span>
                  </div>

                  {/* Text content bounded right */}
                  <div
                    className="w-full pl-[96px] pr-4 opacity-0 brief-anim-text-up pt-1"
                    style={{ animationDelay: `${reachTime + 0.2}s` }}
                  >
                    <h3 className={`text-[20px] font-bold text-white tracking-wide mb-2 leading-tight transition-colors duration-300 group-hover:text-[#ff8015] ${figtree.className}`}>
                      {item.title}
                    </h3>
                    <p className="text-[15px] text-[#999] leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
        {/* --- END TIMELINE COMPONENT --- */}
      </div>

      {isModalOpen && (
        <div
          className="brief-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`brief-modal-panel ${figtree.className}`}
            style={{ animation: "textFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="brief-modal-header">
              <h3 className="text-[28px] font-black tracking-tighter text-white m-0">
                Enter your Idea
              </h3>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold"
                onClick={() => setIsModalOpen(false)}
                style={{ fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <div className="brief-modal-body">
              <div className="brief-modal-grid">
                <input
                  type="text"
                  placeholder="Your name"
                  value={briefFormData.name}
                  onChange={(event) =>
                    setBriefFormData((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="brief-modal-input"
                />
                <input
                  type="email"
                  placeholder="Work email *"
                  value={briefFormData.email}
                  onChange={(event) =>
                    setBriefFormData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="brief-modal-input"
                />
              </div>

              <input
                type="text"
                placeholder="Company"
                value={briefFormData.company}
                onChange={(event) =>
                  setBriefFormData((prev) => ({ ...prev, company: event.target.value }))
                }
                className="brief-modal-input w-full"
              />

              <textarea
                placeholder="Type your brief here (goals, audience, channels, guardrails)..."
                value={briefFormData.brief}
                onChange={(event) =>
                  setBriefFormData((prev) => ({ ...prev, brief: event.target.value }))
                }
                className="brief-modal-textarea"
              />

              <div
                className={`brief-modal-dropzone ${isDragOver ? "is-active" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragOver(false);
                  appendFiles(event.dataTransfer.files);
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full bg-white/5 mb-4 flex items-center justify-center border border-white/10 text-white/60"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p className="text-[16px] text-white font-semibold mb-2">Drop files here</p>
                <p className="text-[14px] text-white/40 mb-6">Images, videos, PDFs, decks, docs</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span
                    className="flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-white text-[14px] font-medium transition-colors pointer-events-none"
                    style={{ padding: "8px 24px", minWidth: "120px" }}
                  >
                    Browse Files
                  </span>
                  {files.length > 0 && (
                    <span 
                      className="flex items-center justify-center text-[13px] text-[#ff8015] font-medium bg-[#ff8015]/10 rounded-full"
                      style={{ padding: "8px 16px" }}
                    >
                      {files.length} file(s) selected
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => appendFiles(event.target.files)}
                />
              </div>

              {files.length > 0 && (
                <ul className="flex flex-col gap-2 max-h-[160px] overflow-auto pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}>
                  {files.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                      <span className="text-[14px] text-white/80 truncate pr-4 font-medium">{file.name}</span>
                      <button
                        type="button"
                        className="text-[13px] text-white/40 hover:text-red-400 font-semibold transition-colors flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {uploadMessage && uploadState !== "uploading" && (
                <p className={`text-[14px] font-medium tracking-wide ${uploadState === "error" ? "text-red-400" : "text-white/60"}`}>
                  {uploadMessage}
                </p>
              )}

              <div className="brief-modal-actions">
                <button
                  type="button"
                  className="brief-modal-btn bg-transparent border border-white/10 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="brief-modal-btn bg-[#ff8015] hover:bg-[#ff953f] text-black transition-all shadow-[0_0_20px_rgba(255,128,21,0.3)]"
                  onClick={handleSendBrief}
                >
                  Send Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BriefCTASection;