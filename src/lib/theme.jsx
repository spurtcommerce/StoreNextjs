"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";

export const THEME_STORAGE_KEY = "storenext:theme";

/**
 * Runs in <head> before first paint: applies the saved theme, or the OS preference
 * when nothing is saved, so the page never flashes the wrong theme.
 * If viewing horizon template (store === "horizon"), forces light theme.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var isHorizon=(document.documentElement&&document.documentElement.getAttribute("data-store")==="horizon")||(document.body&&document.body.getAttribute("data-theme")==="horizon");if(isHorizon){document.documentElement.dataset.theme="light";return;}var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;

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

export function ThemeProvider({ children, isHorizon = false }) {
  // If isHorizon is true (Horizon template active on storefront), enforce light theme on DOM
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    if (isHorizon) {
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = "light";
      }
      return;
    }

    setThemeState(readTheme());

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
  }, [isHorizon]);

  const applyTheme = useCallback((next) => {
    if (!isHorizon && typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }, [isHorizon]);

  const setTheme = useCallback(
    (next, origin) => {
      if (isHorizon) return;
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
    [applyTheme, isHorizon]
  );

  const toggleTheme = useCallback(
    (origin) => {
      if (isHorizon) return;
      setTheme(readTheme() === "dark" ? "light" : "dark", origin);
    },
    [setTheme, isHorizon]
  );

  const value = useMemo(
    () => ({ theme: isHorizon ? "light" : theme, setTheme, toggleTheme, isHorizon }),
    [theme, setTheme, toggleTheme, isHorizon]
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
      isHorizon: false,
    };
  }
  return v;
}
