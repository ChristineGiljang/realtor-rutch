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

  // Next.js's <Image> component always passes a numeric quality (defaulting
  // to 75) even when the `quality` prop isn't set on the component. That
  // means a bare `quality || "auto"` fallback can never actually trigger —
  // every image ends up flattened to q_75, overriding Cloudinary's smarter
  // auto-quality algorithm (which picks the lowest quality that's still
  // visually indistinguishable, per image).
  //
  // Treat the untouched default (75) as "no explicit opinion" and fall back
  // to Cloudinary's auto:eco quality. Only respect a *deliberately lowered*
  // quality prop (e.g. Hero.tsx uses 30, AboutTeaser.tsx uses 50) — those
  // stay in full control since they're below 75.
  const q = quality && quality < 75 ? quality : "auto:eco";
  const transforms = `f_auto,q_${q},w_${width}`;

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
