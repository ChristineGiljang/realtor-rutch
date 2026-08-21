export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `https://res.cloudinary.com/drczxmxfb/image/upload/f_auto,q_${
    quality || "auto"
  },w_${width}/v1783940857/${src}`;
}
