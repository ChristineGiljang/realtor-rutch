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

  // Next.js always passes a numeric quality (default 75). Treat the untouched
  // default as "no opinion" and use Cloudinary's auto:eco; only respect a
  // deliberately lowered quality prop (e.g. Hero 30, AboutTeaser 50).
  const q = quality && quality < 75 ? quality : "auto:eco";
  const transforms = `f_auto,q_${q},w_${width},c_limit`;

  // Drop a trailing image extension so f_auto can choose AVIF/WebP/JPEG
  // per browser instead of being pinned to the extension in the URL.
  const stripExt = (s: string) =>
    s.replace(/\.(jpe?g|png|webp|avif|gif)$/i, "");

  // Full Cloudinary URL from the DB: insert transforms after "/upload/"
  const marker = "/upload/";
  const idx = src.indexOf(marker);
  if (idx !== -1) {
    const insertAt = idx + marker.length;
    return (
      src.slice(0, insertAt) + transforms + "/" + stripExt(src.slice(insertAt))
    );
  }

  // Bare public_id
  return `https://res.cloudinary.com/drczxmxfb/image/upload/${transforms}/${stripExt(src)}`;
}
