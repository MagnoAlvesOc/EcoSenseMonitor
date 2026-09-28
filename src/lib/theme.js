// Controle de tema claro/escuro compartilhado.
// - Persiste a escolha no localStorage
// - Na primeira visita, segue a preferência do sistema operacional
// - Aplica uma transição suave de cores durante a troca

const THEME_KEY = "ecosense-theme";

export function getTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch { /* localStorage indisponível */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

// Chame uma vez na inicialização do app (main.jsx).
export function initTheme() {
  applyTheme(getTheme());
}

// Alterna o tema, persiste e retorna o novo tema ("dark" | "light").
export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch { /* localStorage indisponível */ }

  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(next);
  window.setTimeout(() => root.classList.remove("theme-transition"), 300);
  return next;
}