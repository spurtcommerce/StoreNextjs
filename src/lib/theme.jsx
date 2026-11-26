"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";

// Filter out React 19 false-positive warning for inline theme scripts in development and legacy Redux state key warnings
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Encountered a script tag") ||
        args[0].includes("Unexpected key") ||
        args[0].includes("Unexpected keys"))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export const THEME_STORAGE_KEY = "storenext:theme";

/**
 * Generates the inline init script for <head> to prevent flash of wrong theme (FOUC).
 * Enforces light theme on all storefront routes, and allows saved theme preference on /manage routes.
 *
 * @param {object} [options]
 * @param {boolean} [options.forceLight=false]
 * @returns {string}
 */
export function getThemeInitScript({ forceLight = false } = {}) {
  return `(function(){try{var d=document.documentElement;var force=${JSON.stringify(Boolean(forceLight))};var p=(window.location&&window.location.pathname)||"";if(force||!p.startsWith("/manage")){d.dataset.theme="light";return;}var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;
}

/**
 * Runs in <head> before first paint: applies the saved theme only on /manage routes,
 * forcing light theme on all storefront routes.
 */
export const THEME_INIT_SCRIPT = getThemeInitScript();

const ThemeContext = createContext(null);

const REVEAL_MS = 500;

function revealFallback(next, origin, apply) {
  if (typeof document === "undefined") return;
  const layer = document.createElement("div");
  layer.dataset.theme = next;
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    pointerEvents: "none",
    background: "var(--color-canvas)",
  });
  document.body.appendChild(layer);

  const at = `at ${origin.x}px ${origin.y}px`;
  const grow = layer.animate([{ clipPath: `circle(0% ${at})` }, { clipPath: `circle(150% ${at})` }], {
    duration: REVEAL_MS,
    easing: "ease-in-out",
    fill: "forwards",
  });
  grow.finished
    .catch(() => undefined)
    .then(() => {
      apply();
      return layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-out", fill: "forwards" })
        .finished;
    })
    .catch(() => undefined)
    .finally(() => layer.remove());
}

function readTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Generic theme provider:
 * - On `/manage` routes: activates dynamic theme (light/dark with OS sync and localStorage).
 * - On storefront routes: enforces light theme across all templates without template hardcoding.
 * - `forceLight`: optional override to enforce light theme regardless of route.
 */
export function ThemeProvider({
  children,
  forceLight = false,
  isHorizon = false, // Backwards-compatible alias for forceLight
  isManageRoute: isManageProp = false,
}) {
  const pathname = usePathname();
  const isManageRoute = typeof pathname === "string" ? pathname.startsWith("/manage") : Boolean(isManageProp);
  const enforceLight = forceLight || isHorizon || !isManageRoute;
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    if (enforceLight) {
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = "light";
      }
      setThemeState("light");
      return;
    }

    let nextTheme = readTheme();
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        nextTheme = saved;
      } else {
        nextTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    } catch {}

    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = nextTheme;
    }
    setThemeState(nextTheme);

    // Follow OS changes until the user picks a theme themselves.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      let saved = null;
      try {
        saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      } catch {}
      if (saved === "light" || saved === "dark") return;
      const next = e.matches ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      setThemeState(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [enforceLight]);

  const applyTheme = useCallback((next) => {
    if (!enforceLight && typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }
    setThemeState(enforceLight ? "light" : next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }, [enforceLight]);

  const setTheme = useCallback(
    (next, origin) => {
      if (enforceLight) return;
      const root = document.documentElement;
      if (!origin) {
        applyTheme(next);
        return;
      }
      if (typeof document.startViewTransition !== "function") {
        revealFallback(next, origin, () => applyTheme(next));
        return;
      }
      root.style.setProperty("--reveal-x", `${origin.x}px`);
      root.style.setProperty("--reveal-y", `${origin.y}px`);
      document.startViewTransition(() => flushSync(() => applyTheme(next)));
    },
    [applyTheme, enforceLight]
  );

  const toggleTheme = useCallback(
    (origin) => {
      if (enforceLight) return;
      setTheme(readTheme() === "dark" ? "light" : "dark", origin);
    },
    [setTheme, enforceLight]
  );

  const value = useMemo(
    () => ({ theme: enforceLight ? "light" : theme, setTheme, toggleTheme, enforceLight }),
    [theme, setTheme, toggleTheme, enforceLight]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (!v) {
    return {
      theme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
      enforceLight: true,
    };
  }
  return v;
}
