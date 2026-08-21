export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Local/static assets (e.g. /logo.png) — don't touch them
  if (src.startsWith("/")) {
    return src;
  }

  return `https://res.cloudinary.com/drczxmxfb/image/upload/f_auto,q_${
    quality || "auto"
  },w_${width}/v1783940857/${src}`;
}
