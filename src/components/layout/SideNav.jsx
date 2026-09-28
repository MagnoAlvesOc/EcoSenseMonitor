import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Map, BarChart3, Settings,
  Activity, Sun, Moon, Radio, Globe
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toggleTheme } from "@/lib/theme";

const navItems = [
  { path: "/",             icon: LayoutDashboard, label: "Dashboard" },
  { path: "/mapa",         icon: Map,             label: "Mapa" },
  { path: "/analises",    icon: BarChart3,       label: "Análises" },
  { path: "/logs",         icon: Activity,        label: "Logs" },
  { path: "/integracoes",  icon: Globe,           label: "Integrações" },
  { path: "/configuracoes",icon: Settings,        label: "Config" },
];

export default function SideNav() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-unread"],
    queryFn: () => base44.entities.Alertas.filter({ lido: false }),
    refetchInterval: 30000,
  });

  const handleToggleTheme = () => {
    setDarkMode(toggleTheme() === "dark");
  };

  return (
    <aside
      className="fixed z-50 flex bg-background/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl
        left-3 right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] h-14
        md:rounded-none md:left-0 md:right-auto md:bottom-auto md:top-0 md:h-full md:w-[170px]
        md:border-t-0 md:border-b-0 md:border-l-0 md:flex-col"
    >
      {/* Logo — apenas desktop */}
      <div className="hidden md:flex items-center gap-3 px-2 py-4 border-b border-border/40">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Radio className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm text-foreground leading-tight whitespace-nowrap overflow-hidden">
          EcoSense<br />Monitor
        </span>
      </div>

      {/* Navegação — faixa horizontal rolável no celular, coluna no desktop */}
      <nav className="flex-1 flex items-center gap-0.5 px-1 overflow-x-auto touch-pan-x md:py-3 md:overflow-x-hidden md:flex-col md:items-stretch md:gap-1 md:px-2 md:overflow-hidden">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex-shrink-0 md:w-full">
              <div className={`relative flex items-center justify-center w-11 h-11 md:w-full md:h-auto md:justify-start md:gap-3 md:px-2 md:py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                {item.path === "/configuracoes" && alertas.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 md:top-1 md:right-1 w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {alertas.length > 9 ? "9+" : alertas.length}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Tema — no fim da faixa no celular, na coluna no desktop */}
        <button
          onClick={handleToggleTheme}
          title={darkMode ? "Modo Claro" : "Modo Escuro"}
          className="flex items-center justify-center flex-shrink-0 w-11 h-11 md:w-full md:h-auto md:justify-start md:gap-3 md:px-2 md:py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          {darkMode ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          <span className="hidden md:inline text-sm font-medium">Tema</span>
        </button>
      </nav>

      {/* Rodapé — apenas desktop */}
      <div className="hidden md:block px-2 pb-3 border-t border-border/40 pt-2">
        <p className="text-[9px] text-muted-foreground/60 text-center">EcoSense IoT</p>
      </div>
    </aside>
  );
}