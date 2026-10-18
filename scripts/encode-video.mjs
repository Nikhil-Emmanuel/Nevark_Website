// One-off: re-encode the Build Your PC intro video for the web (outputs are committed).
//
//   FFMPEG=/path/to/ffmpeg node scripts/encode-video.mjs "path/to/source.mp4"
//
// Why: the original was 28.5 MB at ~20 Mbps with its `moov` index at the END of the file,
// so iOS Safari had to download almost everything before it could even read the duration.
// These outputs are H.264 (plays everywhere, incl. iOS), have `+faststart` (index first),
// no audio track (the page plays it muted), a keyframe every second, and a 720p rendition for phones.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ffmpeg = process.env.FFMPEG || "ffmpeg";
const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("Usage: FFMPEG=/path/to/ffmpeg node scripts/encode-video.mjs <source.mp4>");
  process.exit(1);
}
const out = "src/video";
fs.mkdirSync(out, { recursive: true });
const run = (args) => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });

const common = ["-an", "-pix_fmt", "yuv420p", "-preset", "slow", "-g", "30", "-keyint_min", "30", "-sc_threshold", "0", "-movflags", "+faststart", "-tag:v", "avc1"];

run(["-i", src, "-c:v", "libx264", "-profile:v", "high", "-level", "4.1", "-crf", "27", "-maxrate", "5M", "-bufsize", "10M", ...common, path.join(out, "pc-build-1080.mp4")]);
run(["-i", src, "-vf", "scale=-2:720", "-c:v", "libx264", "-profile:v", "main", "-level", "3.1", "-crf", "28", "-maxrate", "2.5M", "-bufsize", "5M", ...common, path.join(out, "pc-build-720.mp4")]);

// Still frame of the finished build, used for reduced-motion, Save-Data and as the load fallback
run(["-ss", "5", "-i", src, "-frames:v", "1", "-vf", "scale=1920:-2", "-q:v", "3", "src/assets/img/pc-build-still.jpg"]);

for (const f of ["pc-build-1080.mp4", "pc-build-720.mp4"]) {
  console.log(f, (fs.statSync(path.join(out, f)).size / 1048576).toFixed(2), "MB");
}
