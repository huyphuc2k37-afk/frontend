"use client";

import { useState } from "react";
import Image from "next/image";
import { PLACEHOLDER_COVER } from "./api";

interface CoverImageProps {
  src: string;
  alt: string;
  /** next/image `fill` flag — turns the wrapper into a positioned absolute-fill container. */
  fill?: boolean;
  /** Pre-rendered sizes attribute (only used for next/image). */
  sizes?: string;
  /** Eager-load (above-the-fold). */
  priority?: boolean;
  /** Lazy load (default — Next.js sets loading=lazy). */
  eager?: boolean;
  className?: string;
  /** Fallback URL to try once before the placeholder. */
  fallbackUrl?: string;
}

/**
 * Cover image that works for both inline data URIs (SVG covers) and remote URLs.
 *
 * Why: next/image's loader was rejecting raw SVG data URIs in some browsers,
 * causing the placeholder to render instead of the actual cover. For inline
 * data URIs we use a plain `<img>` tag (the browser handles the data URI natively
 * and avoids the loader entirely). For remote URLs we keep next/image so we get
 * the optimizer + blur placeholder.
 */
export default function CoverImage({
  src,
  alt,
  fill = true,
  sizes,
  priority = false,
  eager = false,
  className,
  fallbackUrl,
}: CoverImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const isInlineDataUri = currentSrc.startsWith("data:");

  const onError = () => {
    if (fallbackUrl && currentSrc !== fallbackUrl) {
      setCurrentSrc(fallbackUrl);
    } else {
      setCurrentSrc(PLACEHOLDER_COVER);
    }
  };

  if (isInlineDataUri) {
    // Plain <img> for inline data URIs (no loader, no placeholder round-trip).
    // Inline images need absolute-fill positioning to mimic next/image's `fill`.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        onError={onError}
      />
    );
  }

  // next/image for remote URLs (Cloudinary, Supabase, etc.) — optimized mode.
  // This enables Vercel CDN caching at edge, cutting ~1.5-2s latency per image.
  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={eager ? "eager" : "lazy"}
      className={className}
      onError={onError}
    />
  );
}
