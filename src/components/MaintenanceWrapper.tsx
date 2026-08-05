"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type Status = "ok" | "maintenance" | "unknown";

interface MaintenanceInfo {
  active: boolean;
  message?: string;
  eta?: string | null;
  retryAfter?: number;
}

/**
 * Polls /api/maintenance/status periodically. When the backend reports
 * maintenance mode is active, redirect every non-admin page to /maintenance.
 *
 * The wrapper NEVER runs on /maintenance or /admin/** routes to avoid loops
 * and to let administrators continue working while users see the splash page.
 */
const ADMIN_PREFIXES = ["/admin", "/mod", "/api", "/_next"];
const CHECK_INTERVAL_MS = 60_000;

function shouldBypass(pathname: string): boolean {
  if (pathname === "/maintenance") return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/mod")) return true;
  return false;
}

export default function MaintenanceWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldBypass(pathname || "/")) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const check = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/maintenance/status`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          setStatus("unknown");
          return;
        }
        const data = (await res.json()) as MaintenanceInfo;
        if (cancelled) return;
        if (data.active) {
          setStatus("maintenance");
          // Hard navigate so the page state is fully replaced.
          window.location.replace("/maintenance");
          return;
        }
        setStatus("ok");
      } catch {
        // Network error — don't break the user experience.
        setStatus("unknown");
      } finally {
        if (!cancelled) {
          timer = setTimeout(check, CHECK_INTERVAL_MS);
        }
      }
    };

    // Run once on mount, then on the interval.
    check();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [pathname, router]);

  // Also listen for any same-tab fetch that returns 503 and immediately
  // bounce to /maintenance. This covers the case where users are mid-session
  // when maintenance is enabled.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldBypass(pathname || "/")) return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      try {
        if (res && res.status === 503 && res.headers) {
          const mode = res.headers.get("X-Maintenance-Mode");
          if (mode === "true" && !shouldBypass(window.location.pathname)) {
            window.location.replace("/maintenance");
          }
        }
      } catch {
        /* ignore */
      }
      return res;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname]);

  // Silent component — no UI. Status can be wired to a banner later if needed.
  void status;
  return null;
}
