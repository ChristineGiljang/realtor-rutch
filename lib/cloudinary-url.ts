/**
 * Injects Cloudinary transformation params into an existing Cloudinary
 * delivery URL. Expects a standard URL shape:
 *   https://res.cloudinary.com/<cloud>/image/upload/<...>/<public_id>
 *
 * Usage:
 *   optimizedUrl(img.url, { width: 400 })   // listing card thumbnail
 *   optimizedUrl(img.url, { width: 1600 })  // property detail hero image
 */
export function optimizedUrl(
  url: string,
  opts: { width?: number; quality?: string } = {},
): string {
  const { width, quality = "auto" } = opts;

  const transforms = ["f_auto", `q_${quality}`];
  if (width) transforms.push(`w_${width}`);

  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url; // not a Cloudinary upload URL, leave untouched

  const insertAt = idx + marker.length;
  return (
    url.slice(0, insertAt) + transforms.join(",") + "/" + url.slice(insertAt)
  );
}
