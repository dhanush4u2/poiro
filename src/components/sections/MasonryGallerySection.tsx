"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Masonry, { type MasonryItem } from "@/components/Masonry";

type TabConfig = {
  label: string;
  folder: string;
};

const TABS: TabConfig[] = [
  { label: "Short Form", folder: "short-form" },
  { label: "Statics", folder: "statics" },
  { label: "UGC / Affiliate", folder: "ugc-affiliate" },
  { label: "Microdrama", folder: "microdrama" },
  { label: "TVC / Animatics", folder: "tvc-animatics" },
];

type MasonryApiResponse = {
  media?: Array<{
    src: string;
    type: "image" | "video";
  }>;
};

type PrecomputeOptions = {
  eagerVideo: boolean;
};

function hashToUnit(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function mapDisplayAspect(sourceAspect: number, seed: string): number {
  const aspect = Number.isFinite(sourceAspect) && sourceAspect > 0 ? sourceAspect : 1;
  const jitter = (hashToUnit(seed) - 0.5) * 0.08; // +/-4% deterministic jitter

  if (aspect >= 1.35) {
    // Landscape family (16:9-ish with subtle variation)
    return Math.min(2.0, Math.max(1.35, aspect * (1 + jitter)));
  }

  if (aspect <= 0.78) {
    // Portrait family (9:16-ish with subtle variation)
    return Math.min(0.78, Math.max(0.5, aspect * (1 + jitter)));
  }

  // Near-square family keeps slight variation for gallery feel.
  return Math.min(1.15, Math.max(0.85, aspect * (1 + jitter)));
}

async function precomputeMedia(
  items: MasonryItem[],
  options: PrecomputeOptions = { eagerVideo: true }
): Promise<MasonryItem[]> {
  return Promise.all(
    items.map(
      (item) =>
        new Promise<MasonryItem>((resolve) => {
          if (item.type === "video") {
            const video = document.createElement("video");
            let settled = false;
            const finish = () => {
              if (settled) return;
              settled = true;
              const ratio = video.videoWidth > 0 && video.videoHeight > 0
                ? video.videoWidth / video.videoHeight
                : 9 / 16;
              video.removeAttribute("src");
              video.load();
              resolve({ ...item, aspectRatio: mapDisplayAspect(ratio, item.id) });
            };

            video.preload = options.eagerVideo ? "auto" : "metadata";
            video.muted = true;
            video.playsInline = true;
            video.src = item.src;
            if (options.eagerVideo) {
              video.oncanplaythrough = finish;
              video.onloadeddata = finish;
            }
            video.onloadedmetadata = finish;
            video.onerror = finish;
            setTimeout(finish, options.eagerVideo ? 8000 : 2500);
            video.load();
            return;
          }

          const image = new window.Image();
          image.src = item.src;
          image.onload = () => {
            const ratio = image.naturalWidth > 0 && image.naturalHeight > 0
              ? image.naturalWidth / image.naturalHeight
              : 1;
            resolve({ ...item, aspectRatio: mapDisplayAspect(ratio, item.id) });
          };
          image.onerror = () => resolve({ ...item, aspectRatio: mapDisplayAspect(1, item.id) });
        })
    )
  );
}

async function loadCategoryItems(folder: string): Promise<MasonryItem[]> {
  try {
    const response = await fetch(`/api/masonry?folder=${encodeURIComponent(folder)}`, {
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = (await response.json()) as MasonryApiResponse;
    const media = Array.isArray(data.media) ? data.media : [];

    return media.map((item, index) => ({
      id: `${folder}-${index + 1}`,
      src: item.src,
      type: item.type,
      url: "https://showcase.poiroscope.com",
      aspectRatio: 1,
    }));
  } catch {
    return [];
  }
}

export default function MasonryGallerySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<TabConfig>(TABS[0]);
  const [items, setItems] = useState<MasonryItem[]>([]);
  const [itemsByFolder, setItemsByFolder] = useState<Record<string, MasonryItem[]>>({});
  const [isSwitching, setIsSwitching] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const activeLoaded = await loadCategoryItems(activeTab.folder);
      const activePrecomputed = await precomputeMedia(activeLoaded, { eagerVideo: false });

      if (cancelled) return;

      setItemsByFolder({ [activeTab.folder]: activePrecomputed });
      setItems(activePrecomputed);
      if (cancelled) return;
      window.dispatchEvent(new CustomEvent("propheus:masonry-ready"));

      const warmRemainingTabs = async () => {
        for (const tab of TABS) {
          if (cancelled || tab.folder === activeTab.folder) continue;
          const loaded = await loadCategoryItems(tab.folder);
          const precomputed = await precomputeMedia(loaded, { eagerVideo: false });
          if (cancelled) return;
          setItemsByFolder((prev) => ({
            ...prev,
            [tab.folder]: precomputed,
          }));
        }
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as Window & {
          requestIdleCallback: (callback: () => void) => number;
        }).requestIdleCallback(() => {
          void warmRemainingTabs();
        });
      } else {
        setTimeout(() => {
          void warmRemainingTabs();
        }, 300);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasEntered(true);
        setAnimationCycle((value) => value + 1);
        observer.disconnect();
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = async (tab: TabConfig) => {
    if (tab.folder === activeTab.folder || isSwitching) return;

    setIsSwitching(true);

    const cached = itemsByFolder[tab.folder];

    if (cached) {
      setItems(cached);
      setActiveTab(tab);
      setAnimationCycle((value) => value + 1);
      setIsSwitching(false);
      return;
    }

    const loaded = await loadCategoryItems(tab.folder);
    const precomputed = await precomputeMedia(loaded, { eagerVideo: false });
    setItemsByFolder((prev) => ({ ...prev, [tab.folder]: precomputed }));
    setItems(precomputed);
    setActiveTab(tab);
    setAnimationCycle((value) => value + 1);
    setIsSwitching(false);
  };

  const tabButtonStyle = useMemo(
    () => ({
      fontFamily: "var(--font-mono)",
      fontSize: "0.75rem",
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      border: "1px solid var(--color-border-gray)",
      background: "transparent",
      padding: "10px 14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
    []
  );

  return (
    <section
      ref={sectionRef}
      id="masonry-gallery"
      style={{
        background: "#000",
        paddingTop: "clamp(200px, 30vw, 280px)",
        paddingBottom: "clamp(100px, 12vw, 160px)",
        paddingLeft: "var(--space-3)",
        paddingRight: "var(--space-3)",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <p className="text-xs uppercase tracking-[0.35em] text-orange-500 text-center">Gallery Output</p>
        <h2 className="text-5xl md:text-6xl font-black text-center tracking-tight text-white mt-3 mb-6 md:mb-8">
          Creative Output Engine
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "clamp(18px, 2.3vw, 30px)",
            marginBottom: "clamp(34px, 4vw, 54px)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = tab.folder === activeTab.folder;

            return (
              <button
                key={tab.folder}
                type="button"
                onClick={() => {
                  void handleTabChange(tab);
                }}
                disabled={isSwitching}
                style={{
                  ...tabButtonStyle,
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  background: isActive
                    ? "rgba(255,95,31,0.15)"
                    : "rgba(255,255,255,0.04)",
                  color: isActive ? "#FFFFFF" : "var(--color-light-gray)",
                  borderColor: isActive ? "#ff8015" : "#374151",
                  opacity: isSwitching && !isActive ? 0.65 : 1,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {hasEntered ? (
          <Masonry
            items={items}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            gap="clamp(16px, 2vw, 28px)"
            scaleOnHover
            hoverScale={0.95}
            blurToFocus
            colorShiftOnHover={false}
            animationKey={animationCycle}
          />
        ) : (
          <div style={{ minHeight: "clamp(520px, 65vw, 860px)" }} />
        )}
      </div>
    </section>
  );
}
