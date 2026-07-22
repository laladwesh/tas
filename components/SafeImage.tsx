import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  /** Passed through to next/image for above-the-fold images (e.g. page
   *  heroes). Ignored on the plain-<img> fallback — a native <img> already
   *  loads eagerly unless given loading="lazy", which we never set here. */
  priority?: boolean;
  /** Set BOTH to use intrinsic width/height sizing instead of `fill` (e.g. a
   *  masonry grid). When omitted, the image fills its positioned parent. */
  width?: number;
  height?: number;
};

/**
 * Drop-in replacement for `<Image>` when the src comes from admin-entered
 * content (service/product/article/review images) rather than our own code.
 *
 * next/image throws a hard runtime error for any host not whitelisted in
 * next.config.js — so a staff member pasting a random external image URL
 * into /admin would crash this page for every visitor. Local `/public`
 * paths are always safe and still get full next/image optimisation;
 * anything else falls back to a plain `<img>`, which never throws.
 */
export default function SafeImage({
  src,
  alt,
  sizes,
  className = "",
  priority,
  width,
  height,
}: Props) {
  if (!src) return null;

  const sized = width != null && height != null;

  if (src.startsWith("/")) {
    return sized ? (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={className}
      />
    ) : (
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />
    );
  }

  if (src.startsWith("http")) {
    // eslint-disable-next-line @next/next/no-img-element -- deliberate: unknown
    // external host, must bypass next/image's host allowlist to avoid a crash.
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={sized ? className : `absolute inset-0 h-full w-full ${className}`}
      />
    );
  }

  return null;
}
