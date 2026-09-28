import { useEffect, useState } from "react";

// Reage à troca de tema claro/escuro (classe "dark" no <html>).
export function useIsDark() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setIsDark(root.classList.contains("dark")));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// Cores das séries por tema: mais profundas no modo claro,
// mais claras no modo escuro — contraste confortável nos dois.
export const SERIES_COLORS = {
  light: { temp: "#ef4444", umid: "#2563eb", press: "#7c3aed", co2: "#d97706", extra: "#059669" },
  dark: { temp: "#f87171", umid: "#60a5fa", press: "#a78bfa", co2: "#fbbf24", extra: "#34d399" },
};

// Cores estruturais dos gráficos (grade, eixos e tooltip) por tema.
export const STRUCT_COLORS = {
  light: {
    grid: "rgba(0, 0, 0, 0.10)",
    tick: "#7a706a",
    tooltipBg: "#fffdfb",
    tooltipBorder: "#e6ddd2",
    tooltipShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  },
  dark: {
    grid: "rgba(255, 255, 255, 0.12)",
    tick: "#b5a99d",
    tooltipBg: "#262020",
    tooltipBorder: "#4a3f39",
    tooltipShadow: "0 4px 12px rgba(0, 0, 0, 0.45)",
  },
};

export function useChartColors() {
  const isDark = useIsDark();
  return {
    isDark,
    series: SERIES_COLORS[isDark ? "dark" : "light"],
    struct: STRUCT_COLORS[isDark ? "dark" : "light"],
  };
}