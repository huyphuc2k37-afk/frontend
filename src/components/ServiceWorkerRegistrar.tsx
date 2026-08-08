"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // eslint-disable-next-line no-console
          console.info("Service worker registered:", reg.scope);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn("Service worker registration failed:", err);
          // If /sw.js is missing or the server returns a non-2xx response,
          // unregister any previously-cached broken SW so it stops
          // intercepting /api/* requests and corrupting the page.
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister());
          });
        });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
  }, []);

  return null;
}

export default ServiceWorkerRegistrar;
