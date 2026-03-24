"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";

type AnimateFrom = "top" | "bottom" | "left" | "right" | "center" | "random";

export interface MasonryItem {
  id: string;
  src: string;
  type: "image" | "video";
  url: string;
  aspectRatio: number;
}

interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: AnimateFrom;
  gap?: string;
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  animationKey?: number;
}

const VIDEO_PREVIEW_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#151515"/><path d="M6 3.2v2.6L9.2 4.5z" fill="#8a8a8a"/></svg>'
  );

function useMedia(queries: string[], values: number[], defaultValue: number) {
  const get = () => {
    const index = queries.findIndex((query) => window.matchMedia(query).matches);
    return values[index] ?? defaultValue;
  };

  const [value, setValue] = useState(() => get());

  useEffect(() => {
    const handler = () => setValue(get());
    handler();

    const mediaQueryLists = queries.map((query) => window.matchMedia(query));
    mediaQueryLists.forEach((mql) => mql.addEventListener("change", handler));

    return () => mediaQueryLists.forEach((mql) => mql.removeEventListener("change", handler));
  }, [queries, values, defaultValue]);

  return value;
}

function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const frameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const update = () => {
      if (!ref.current) return;
      const { width, height } = ref.current.getBoundingClientRect();
      setSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    };

    update();

    const resizeObserver = new ResizeObserver(() => {
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        update();
      });
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return [ref, size] as const;
}

export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  gap = "clamp(16px, 2vw, 24px)",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  animationKey = 0,
}: MasonryProps) {
  const columns = useMedia(["(min-width: 1024px)", "(min-width: 640px)"], [4, 3], 2);

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [videoPlayingById, setVideoPlayingById] = useState<Record<string, boolean>>({});
  const [previewSrcById, setPreviewSrcById] = useState<Record<string, string>>({});
  const previewAvailabilityCacheRef = useRef<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const getVideoPreviewSrc = (videoSrc: string) =>
    videoSrc.replace(/\.(webm|mp4|mov|m4v)(\?.*)?$/i, ".webp$2");

  const checkPreviewExists = async (previewSrc: string) => {
    const cached = previewAvailabilityCacheRef.current[previewSrc];
    if (typeof cached === "boolean") return cached;

    try {
      const response = await fetch(previewSrc, { method: "HEAD" });
      const exists = response.ok;
      previewAvailabilityCacheRef.current[previewSrc] = exists;
      return exists;
    } catch {
      previewAvailabilityCacheRef.current[previewSrc] = false;
      return false;
    }
  };

  const getInitialPosition = (
    item: MasonryItem & { x: number; y: number; w: number; h: number }
  ) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction: AnimateFrom = animateFrom;
    if (animateFrom === "random") {
      const directions: AnimateFrom[] = ["top", "bottom", "left", "right"];
      direction = directions[Math.floor(Math.random() * directions.length)] ?? "bottom";
    }

    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (!video) return;
      video.pause();
      video.currentTime = 0;
    });

    setHoveredVideoId(null);
    setVideoPlayingById({});
    videoRefs.current = {};
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    const videoItems = items.filter((item) => item.type === "video");

    if (!videoItems.length) {
      setPreviewSrcById({});
      return;
    }

    setPreviewSrcById((prev) => {
      const next: Record<string, string> = {};
      for (const item of videoItems) {
        next[item.id] = prev[item.id] ?? VIDEO_PREVIEW_FALLBACK;
      }
      return next;
    });

    const resolvePreviews = async () => {
      for (const item of videoItems) {
        if (cancelled) return;
        const previewSrc = getVideoPreviewSrc(item.src);
        const exists = await checkPreviewExists(previewSrc);
        if (cancelled) return;

        setPreviewSrcById((prev) => ({
          ...prev,
          [item.id]: exists ? previewSrc : VIDEO_PREVIEW_FALLBACK,
        }));
      }
    };

    void resolvePreviews();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const grid = useMemo(() => {
    if (!width || width < 100) {
      return [] as Array<MasonryItem & { x: number; y: number; w: number; h: number }>;
    }

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const normalizedAspect = Math.min(Math.max(child.aspectRatio || 1, 0.45), 2.2);
      const height = columnWidth / normalizedAspect;
      const y = colHeights[col] ?? 0;

      colHeights[col] = (colHeights[col] ?? 0) + height;

      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const maxHeight = useMemo(() => {
    if (!grid.length) return 0;
    return Math.max(...grid.map((item) => item.y + item.h));
  }, [grid]);

  const hasMounted = useRef(false);
  const lastAnimationKey = useRef(animationKey);

  useLayoutEffect(() => {
    if (!containerRef.current || !grid.length) return;

    const shouldPlayEntrance = !hasMounted.current || animationKey !== lastAnimationKey.current;

    grid.forEach((item, index) => {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-key="${item.id}"]`);
      if (!el) return;

      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      };

      if (shouldPlayEntrance) {
        const initialPos = getInitialPosition(item);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: "blur(10px)" }),
        };

        gsap.fromTo(el, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: "blur(0px)" }),
          duration: duration,
          ease: ease,
          delay: index * stagger,
        });
      } else {
        gsap.to(el, {
          ...animationProps,
          opacity: 1,
          ...(blurToFocus && { filter: "blur(0px)" }),
          duration: duration,
          ease: ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
    lastAnimationKey.current = animationKey;
  }, [grid, stagger, animateFrom, blurToFocus, duration, ease, animationKey]);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>, item: MasonryItem) => {
    const element = event.currentTarget;

    if (item.type === "video") {
      setHoveredVideoId(item.id);
      setVideoPlayingById((prev) => ({ ...prev, [item.id]: false }));
    }

    if (scaleOnHover) {
      gsap.to(element, {
        scale: hoverScale,
        force3D: true,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector<HTMLDivElement>(".color-overlay");
      if (overlay) {
        gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
      }
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>, item: MasonryItem) => {
    const element = event.currentTarget;

    if (item.type === "video") {
      const video = videoRefs.current[item.id];
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      setVideoPlayingById((prev) => ({ ...prev, [item.id]: false }));
      setHoveredVideoId((current) => (current === item.id ? null : current));
    }

    if (scaleOnHover) {
      gsap.to(element, {
        scale: 1,
        force3D: true,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector<HTMLDivElement>(".color-overlay");
      if (overlay) {
        gsap.to(overlay, { opacity: 0, duration: 0.3 });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="list"
      style={{
        position: "relative",
        height: maxHeight ? `${maxHeight}px` : "320px",
        ["--masonry-gap" as string]: gap,
      }}
    >
      {grid.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="item-wrapper"
          onClick={() => window.open(item.url, "_blank", "noopener")}
          onMouseEnter={(event) => handleMouseEnter(event, item)}
          onMouseLeave={(event) => handleMouseLeave(event, item)}
        >
          {(() => {
            const isActiveVideoTile = hoveredVideoId === item.id;
            const isVideoPlaying = videoPlayingById[item.id] === true;
            const shouldHidePreview = isActiveVideoTile && isVideoPlaying;

            return (
          <div className="item-img">
            {item.type === "video" ? (
              <>
                {hoveredVideoId === item.id && (
                  <video
                    ref={(node) => {
                      videoRefs.current[item.id] = node;
                    }}
                    src={item.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onPlaying={() => {
                      setVideoPlayingById((prev) => ({ ...prev, [item.id]: true }));
                    }}
                    className="h-full w-full object-cover"
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 0,
                    }}
                  />
                )}
                <Image
                  src={previewSrcById[item.id] ?? VIDEO_PREVIEW_FALLBACK}
                  alt="Masonry video preview"
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    opacity: shouldHidePreview ? 0 : 1,
                    transition:
                      hoveredVideoId === item.id
                        ? "opacity 0.25s ease-out"
                        : "opacity 0s linear",
                  }}
                  onError={() => {
                    setPreviewSrcById((prev) => {
                      if (prev[item.id] === VIDEO_PREVIEW_FALLBACK) return prev;
                      return { ...prev, [item.id]: VIDEO_PREVIEW_FALLBACK };
                    });
                  }}
                />
              </>
            ) : (
              <Image
                src={item.src}
                alt="Masonry gallery image"
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            )}
            {colorShiftOnHover && <div className="color-overlay" />}
          </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
