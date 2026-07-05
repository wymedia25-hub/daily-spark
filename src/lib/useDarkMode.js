import { useEffect } from "react";

export function initDarkMode() {
  const stored = localStorage.getItem("theme") || "system";
  const isDark =
    stored === "dark" ||
    (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function useDarkMode() {
  useEffect(() => {
    initDarkMode();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = localStorage.getItem("theme") || "system";
      if (stored === "system") initDarkMode();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
}

export function setDarkMode(theme) {
  localStorage.setItem("theme", theme);
  initDarkMode();
}

export function getDarkMode() {
  return localStorage.getItem("theme") || "system";
}