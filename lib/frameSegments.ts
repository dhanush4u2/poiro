/* ═══════════════════════════════════════════════════════
   FRAME SEGMENT CONFIGURATION
   Tweak start/end values here to resize video segments.
   Scroll distance auto-adjusts to maintain ~60fps feel.
   ═══════════════════════════════════════════════════════ */

export const FRAME_SEGMENTS = {
  HERO: {
    /** First frame of the hero video */
    start: 0,
    /** Last frame of the hero video (0-indexed, inclusive) */
    end: 180,
    /** Frames auto-played before scroll takes over */
    introEnd: 180,
    /** Duration of the auto-play intro in seconds */
    introDuration: 3,
    /** Frame where the explosion effect begins */
    explosionStart: 300,
    /** Frame where the explosion effect ends */
    explosionEnd: 420,
  },
  SECOND_VIDEO: {
    /** First frame of the second video segment */
    start: 181,
    /** Last frame of the second video segment */
    end: 360,
  },
} as const;

/** Percentage of viewport height per frame — keeps both segments at ~60fps scroll rate */
export const PERCENT_PER_FRAME = 1.25;