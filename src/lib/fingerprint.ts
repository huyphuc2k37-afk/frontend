/**
 * Device Fingerprint Generator for Client-side
 *
 * Generates a stable device fingerprint using browser signals.
 * This fingerprint is used for anti-bot detection on the server.
 */

// Canvas fingerprint data
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("VStory", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Fingerprint", 4, 17);

    return canvas.toDataURL().slice(-50);
  } catch {
    return "canvas-error";
  }
}

// WebGL fingerprint
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "no-webgl";

    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "no-debug-info";

    const vendor = webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`.slice(-50);
  } catch {
    return "webgl-error";
  }
}

// Collect all fingerprint signals
export interface FingerprintSignals {
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  canvasHash: string;
  webglHash: string;
}

async function collectSignals(): Promise<FingerprintSignals> {
  const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage || "unknown";
  const platform = navigator.platform || "unknown";

  // Hash the canvas fingerprint
  const canvasSignal = getCanvasFingerprint();
  const canvasHash = await hashString(canvasSignal);

  // Hash the WebGL fingerprint
  const webglSignal = getWebGLFingerprint();
  const webglHash = await hashString(webglSignal);

  return {
    screen,
    timezone,
    language,
    platform,
    canvasHash,
    webglHash,
  };
}

// Simple hash function using Web Crypto API
async function hashString(input: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  } catch {
    // Fallback: simple string hash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
}

// Combine signals into final fingerprint
async function generateFingerprintHash(signals: FingerprintSignals): Promise<string> {
  const combined = [
    signals.screen,
    signals.timezone,
    signals.language,
    signals.platform,
    signals.canvasHash,
    signals.webglHash,
  ].join("|");

  return hashString(combined);
}

// Cache for fingerprint
let cachedFingerprint: string | null = null;
let cachedSignals: FingerprintSignals | null = null;

/**
 * Get or generate device fingerprint
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    const signals = await collectSignals();
    cachedSignals = signals;
    cachedFingerprint = await generateFingerprintHash(signals);

    // Store in localStorage for stability across sessions
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("vstory_fp", cachedFingerprint);
        window.localStorage.setItem("vstory_fp_signals", JSON.stringify(signals));
      } catch {
        // Ignore localStorage errors
      }
    }

    return cachedFingerprint;
  } catch (error) {
    console.error("[Fingerprint] Generation failed:", error);
    // Return a random ID as fallback
    return `fallback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Get cached fingerprint from localStorage
 */
export function getCachedFingerprint(): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    return window.localStorage.getItem("vstory_fp");
  } catch {
    return null;
  }
}

/**
 * Get fingerprint signals for debugging
 */
export function getFingerprintSignals(): FingerprintSignals | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const signalsJson = window.localStorage.getItem("vstory_fp_signals");
    if (signalsJson) {
      return JSON.parse(signalsJson);
    }
  } catch {
    // Ignore errors
  }

  return cachedSignals;
}

/**
 * Track reading quality signals
 */
export class QualityTracker {
  private storyId: string;
  private startTime: number;
  private maxScrollDepth: number = 0;
  private chaptersRead: Set<string> = new Set();
  private lastActivity: number;
  private activityThreshold = 30000; // 30 seconds
  private isActive: boolean = true;

  constructor(storyId: string) {
    this.storyId = storyId;
    this.startTime = Date.now();
    this.lastActivity = Date.now();
    this.setupScrollTracking();
    this.setupActivityTracking();
  }

  private setupScrollTracking(): void {
    if (typeof window === "undefined") return;

    const updateScrollDepth = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
      this.lastActivity = Date.now();
    };

    // Throttled scroll handler
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateScrollDepth();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    // Initial measurement
    updateScrollDepth();
  }

  private setupActivityTracking(): void {
    if (typeof window === "undefined") return;

    const activityEvents = ["mousemove", "keypress", "touchstart", "scroll"];
    const resetActivity = () => {
      this.lastActivity = Date.now();
      if (!this.isActive) {
        this.isActive = true;
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetActivity, { passive: true });
    });

    // Check for inactivity every 10 seconds
    setInterval(() => {
      if (Date.now() - this.lastActivity > this.activityThreshold) {
        this.isActive = false;
      }
    }, 10000);
  }

  /**
   * Record that a chapter was read
   */
  recordChapter(chapterId: string): void {
    this.chaptersRead.add(chapterId);
    this.lastActivity = Date.now();
  }

  /**
   * Get current quality data
   */
  getQualityData(): {
    dwellTime: number;
    scrollDepth: number;
    chaptersRead: number;
    isActive: boolean;
  } {
    const dwellTime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      dwellTime,
      scrollDepth: Math.round(this.maxScrollDepth * 100) / 100,
      chaptersRead: this.chaptersRead.size,
      isActive: this.isActive,
    };
  }

  /**
   * Send quality data to server
   */
  async sendQualityData(): Promise<void> {
    try {
      const qualityData = this.getQualityData();

      // Only send if user has spent at least 10 seconds
      if (qualityData.dwellTime < 10) return;

      // We would send this to the server via API
      // For now, just log for debugging
      console.log("[QualityTracker] Sending:", qualityData);

      // The server will handle recording this data
      await fetch("/api/stats/views/quality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId: this.storyId,
          ...qualityData,
        }),
      }).catch(() => {
        // Ignore errors
      });
    } catch (error) {
      console.error("[QualityTracker] Send failed:", error);
    }
  }

  /**
   * Cleanup listeners
   */
  destroy(): void {
    this.sendQualityData();
  }
}
