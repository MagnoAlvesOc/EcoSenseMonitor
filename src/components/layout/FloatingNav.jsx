import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Map, FileText, BarChart3, Settings, Activity, Sun, Moon, Radio, GitCompareArrows } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/mapa", icon: Map, label: "Mapa" },
  { path: "/relatorios", icon: FileText, label: "Relatórios" },
  { path: "/analise", icon: BarChart3, label: "Análise" },
  { path: "/comparacao", icon: GitCompareArrows, label: "Comparação" },
  { path: "/logs", icon: Activity, label: "Logs" },
  { path: "/configuracoes", icon: Settings, label: "Config" },
];

export default function FloatingNav() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-unread"],
    queryFn: () => base44.entities.Alertas.filter({ lido: false }),
    refetchInterval: 30000,
  });

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(prev => !prev);
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 p-2 bg-background/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mb-1">
        <Radio className="w-4 h-4 text-primary-foreground" />
      </div>

      <div className="w-6 h-px bg-border/60 my-1" />

      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} title={item.label}>
            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}>
              <item.icon className="w-4 h-4" />
              {item.path === "/configuracoes" && alertas.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {alertas.length > 9 ? "9+" : alertas.length}
                </span>
              )}
            </div>
          </Link>
        );
      })}

      <div className="w-6 h-px bg-border/60 my-1" />

      <button
        onClick={toggleTheme}
        title={darkMode ? "Modo Claro" : "Modo Escuro"}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
      >
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}