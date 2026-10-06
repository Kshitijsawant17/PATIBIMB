"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker.
 *
 * Only runs in production builds. Registering during development would let a
 * cached worker shadow fresh source files, which makes debugging misleading.
 * Failures are non-fatal: the app is fully usable without a service worker, so
 * this deliberately logs nothing and never throws.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Take over as soon as a new worker is ready, rather than waiting for
        // every tab of the app to close.
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              installing.postMessage("SKIP_WAITING");
            }
          });
        });
      } catch {
        // Offline support unavailable. Nothing else depends on it.
      }
    };

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", () => {
        if (!cancelled) void register();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", () => {});
    };
  }, []);

  return null;
}
