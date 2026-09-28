import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Map, FileText, BarChart3, Settings,
  Activity, Sun, Moon, Radio, Wrench, Globe, Download, GitCompareArrows
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/",             icon: LayoutDashboard, label: "Dashboard" },
  { path: "/mapa",         icon: Map,             label: "Mapa" },
  { path: "/relatorios",   icon: FileText,        label: "Relatórios" },
  { path: "/analise",      icon: BarChart3,         label: "Análise" },
  { path: "/comparacao",   icon: GitCompareArrows,  label: "Comparação" },
  { path: "/logs",         icon: Activity,        label: "Logs" },
  { path: "/manutencao",   icon: Wrench,          label: "Manutenção" },
  { path: "/integracoes",  icon: Globe,           label: "Integrações" },
  { path: "/configuracoes",icon: Settings,        label: "Config" },
  { path: "/relatorio-pdf", icon: Download,        label: "PDF" },
];

export default function SideNav() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-unread"],
    queryFn: () => base44.entities.Alertas.filter({ lido: false }),
    refetchInterval: 30000,
  });

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(p => !p);
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full z-30 flex flex-col bg-background/95 backdrop-blur-xl border-r border-border/60 shadow-2xl"
      style={{ width: "170px" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-border/40">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Radio className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm text-foreground leading-tight whitespace-nowrap overflow-hidden">
          EcoSense<br />Monitor
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 flex flex-col gap-1 px-2 overflow-hidden">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`relative flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                {item.path === "/configuracoes" && alertas.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {alertas.length > 9 ? "9+" : alertas.length}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 flex flex-col gap-1 border-t border-border/40 pt-2">
        <button
          onClick={toggleTheme}
          title={darkMode ? "Modo Claro" : "Modo Escuro"}
          className="flex items-center gap-3 px-2 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          {darkMode ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          <span className="text-sm font-medium">Tema</span>
        </button>
      </div>
    </aside>
  );
}