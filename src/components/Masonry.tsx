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

  useLayoutEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  return [ref, size] as const;
}

export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.4,
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
  const [imagesReady, setImagesReady] = useState(false);
  const [playableVideoIds, setPlayableVideoIds] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

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
    setImagesReady(false);
    const raf = requestAnimationFrame(() => setImagesReady(true));
    return () => cancelAnimationFrame(raf);
  }, [items, animationKey]);

  useEffect(() => {
    let cancelled = false;
    setPlayableVideoIds(new Set());

    const videoItems = items.filter((item) => item.type === "video");
    if (!videoItems.length) return;

    const warmAndPlayOneVideo = (id: string) =>
      new Promise<void>((resolve) => {
        const video = videoRefs.current[id];
        if (!video) {
          resolve();
          return;
        }

        let settled = false;

        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.oncanplaythrough = finish;
        video.onloadeddata = finish;
        video.onerror = finish;
        setTimeout(finish, 7000);
        video.load();
      });

    const queue = async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));

      for (const item of videoItems) {
        if (cancelled) return;
        await warmAndPlayOneVideo(item.id);
        if (cancelled) return;

        const mountedVideo = videoRefs.current[item.id];
        if (mountedVideo) {
          try {
            await mountedVideo.play();
          } catch {
            // Ignore autoplay rejections; preview frame is still shown.
          }
        }

        setPlayableVideoIds((prev) => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
      }
    };

    void queue();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [] as Array<MasonryItem & { x: number; y: number; w: number; h: number }>;

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
    if (!imagesReady) return;

    grid.forEach((item, index) => {
      const selector = `[data-key=\"${item.id}\"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      };

      const shouldPlayEntrance = !hasMounted.current || animationKey !== lastAnimationKey.current;

      if (shouldPlayEntrance) {
        const initialPos = getInitialPosition(item);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus ? { filter: "blur(10px)" } : {}),
        };

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus ? { filter: "blur(0px)" } : {}),
          duration: 0.8,
          ease: "power3.out",
          delay: index * stagger,
        });
      } else {
        // Keep non-entrance layout corrections instant to avoid visible reslide jitter.
        gsap.set(selector, {
          ...animationProps,
        });
      }
    });

    hasMounted.current = true;
    lastAnimationKey.current = animationKey;
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease, animationKey]);

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement>,
    item: MasonryItem
  ) => {
    const element = event.currentTarget;
    const selector = `[data-key=\"${item.id}\"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
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

  const handleMouseLeave = (
    event: React.MouseEvent<HTMLDivElement>,
    item: MasonryItem
  ) => {
    const element = event.currentTarget;
    const selector = `[data-key=\"${item.id}\"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
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
          <div className="item-img">
            {item.type === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[item.id] = el;
                }}
                src={item.src}
                autoPlay={playableVideoIds.has(item.id)}
                muted
                loop
                playsInline
                preload={playableVideoIds.has(item.id) ? "auto" : "metadata"}
                onLoadedData={(event) => {
                  if (!playableVideoIds.has(item.id)) {
                    event.currentTarget.pause();
                  }
                }}
                className="h-full w-full object-cover"
              />
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
        </div>
      ))}
    </div>
  );
}
