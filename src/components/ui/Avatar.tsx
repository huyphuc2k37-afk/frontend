import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const;

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const [error, setError] = React.useState(false);
    const showFallback = !src || error;
    const initials = (fallback ?? alt ?? "?").slice(0, 2).toUpperCase();

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-muted-foreground",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {showFallback ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? ""}
            onError={() => setError(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
