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

  const transforms = `f_auto,q_${quality || "auto"},w_${width}`;

  // `src` may already be a full Cloudinary delivery URL (e.g. when it comes
  // straight from the DB as img.url: "https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>").
  // In that case, insert the transforms after "/upload/" instead of wrapping
  // the whole URL as if it were a bare public_id — otherwise we end up
  // nesting one Cloudinary URL inside another and the image 404s.
  const marker = "/upload/";
  const idx = src.indexOf(marker);
  if (idx !== -1) {
    const insertAt = idx + marker.length;
    return src.slice(0, insertAt) + transforms + "/" + src.slice(insertAt);
  }

  // Otherwise treat `src` as a bare public_id (no version, no host).
  return `https://res.cloudinary.com/drczxmxfb/image/upload/${transforms}/${src}`;
}
