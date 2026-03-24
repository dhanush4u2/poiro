import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set([
  "short-form",
  "statics",
  "ugc-affiliate",
  "microdrama",
  "tvc-animatics",
]);

const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".gif", ".avif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const MAX_MEDIA = 12;

type MediaItem = {
  src: string;
  type: "image" | "video";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") ?? "";

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ media: [] }, { status: 200 });
  }

  try {
    const dirPath = path.join(process.cwd(), "public", folder);
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    const fileNames = files
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
      });

    const videoBaseNames = new Set(
      fileNames
        .filter((name) => VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase()))
        .map((name) => path.basename(name, path.extname(name)).toLowerCase())
    );

    const media: MediaItem[] = fileNames
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext)) return true;

        const baseName = path.basename(name, ext).toLowerCase();
        return !videoBaseNames.has(baseName);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .slice(0, MAX_MEDIA)
      .map((name) => {
        const ext = path.extname(name).toLowerCase();
        return {
          src: `/${folder}/${encodeURIComponent(name)}`,
          type: VIDEO_EXTENSIONS.has(ext) ? "video" : "image",
        };
      });

    return NextResponse.json({ media }, { status: 200 });
  } catch {
    return NextResponse.json({ media: [] }, { status: 200 });
  }
}
