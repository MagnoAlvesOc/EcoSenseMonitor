import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Map, BarChart3, Settings,
  Activity, Sun, Moon, Globe, Info, Mail, Menu, ChevronRight, LogOut,
} from "lucide-react";
import EcoSenseLogo from "@/components/shared/EcoSenseLogo";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toggleTheme } from "@/lib/theme";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useAuth } from "@/lib/AuthContext";

const mainItems = [
  { path: "/",       icon: LayoutDashboard, label: "Dashboard" },
  { path: "/mapa",   icon: Map,             label: "Mapa" },
  { path: "/analises", icon: BarChart3,     label: "Análises" },
];

// Itens secundários — agrupados no bottom sheet "Mais" no celular
const mobileMoreItems = [
  { path: "/logs",         icon: Activity, label: "Logs do Sistema" },
  { path: "/integracoes",  icon: Globe,    label: "Integrações" },
  { path: "/configuracoes",icon: Settings, label: "Configurações" },
  { path: "/sobre",        icon: Info,     label: "Sobre" },
  { path: "/contato",      icon: Mail,     label: "Contato" },
];

// Navegação completa — coluna lateral no desktop
const desktopItems = [
  { path: "/",             icon: LayoutDashboard, label: "Dashboard" },
  { path: "/mapa",         icon: Map,             label: "Mapa" },
  { path: "/analises",     icon: BarChart3,       label: "Análises" },
  { path: "/logs",         icon: Activity,        label: "Logs" },
  { path: "/integracoes",  icon: Globe,           label: "Integrações" },
  { path: "/configuracoes",icon: Settings,        label: "Config" },
  { path: "/sobre",        icon: Info,            label: "Sobre" },
  { path: "/contato",      icon: Mail,            label: "Contato" },
];

// Última sub-rota visitada em cada árvore de navegação (ex.: /analises/estatistica).
// Volta a ser aberta quando o usuário retorna à aba, em vez de resetar para a raiz.
const lastSubRoute = {};

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Aba Configurações exclusiva de administradores
  const mobileMoreItemsAdmin = mobileMoreItems.filter(i => isAdmin || i.path !== "/configuracoes");
  const desktopItemsAdmin = desktopItems.filter(i => isAdmin || i.path !== "/configuracoes");

  // Ativa também nas sub-rotas (ex.: /analises/estatistica mantém a aba Análises acesa)
  const isTabActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Memoriza a sub-rota mais recente visitada em cada árvore de navegação
  useEffect(() => {
    const tab = mainItems.find(
      (i) => i.path !== "/" && location.pathname.startsWith(i.path + "/")
    );
    if (tab) lastSubRoute[tab.path] = location.pathname;
  }, [location.pathname]);

  // Ao trocar de aba, reabre a última sub-rota visitada daquela aba;
  // clicar na aba já ativa reseta a pilha para a rota-raiz dela
  const handleTabReset = (path) => (e) => {
    if (isTabActive(path)) {
      e.preventDefault();
      navigate(path, { replace: location.pathname === path });
    } else if (lastSubRoute[path] && lastSubRoute[path] !== path) {
      e.preventDefault();
      navigate(lastSubRoute[path]);
    }
  };
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [moreOpen, setMoreOpen] = useState(false);

  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-unread"],
    queryFn: () => base44.entities.Alertas.filter({ lido: false }),
    refetchInterval: 30000,
  });

  const handleToggleTheme = () => {
    setDarkMode(toggleTheme() === "dark");
  };

  const handleLogout = async () => {
    setMoreOpen(false);
    await base44.auth.logout();
  };

  const badge = alertas.length > 0;

  const BadgeDot = ({ className = "" }) => (
    badge ? (
      <span className={`w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold ${className}`}>
        {alertas.length > 9 ? "9+" : alertas.length}
      </span>
    ) : null
  );

  // Linha do bottom sheet "Mais" (estilo nativo iOS)
  const MoreRow = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link to={item.path} onClick={() => setMoreOpen(false)} className="block">
        <div className={`flex items-center gap-3 w-full px-3 py-3 min-h-[44px] rounded-xl transition-colors ${
          isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted active:bg-muted"
        }`}>
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{item.label}</span>
          {item.path === "/configuracoes" && <BadgeDot />}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>
    );
  };

  return (
    <aside
      className="fixed z-50 flex bg-background/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl
        left-3 right-3 bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))] h-14
        md:rounded-none md:left-0 md:right-auto md:bottom-auto md:top-0 md:h-full md:w-[170px]
        md:border-t-0 md:border-b-0 md:border-l-0 md:flex-col"
    >
      {/* Logo — apenas desktop */}
      <div className="hidden md:flex items-center gap-3 px-2 py-4 border-b border-border/40">
        <EcoSenseLogo className="w-8 h-8" />
        <span className="font-bold text-sm text-foreground leading-tight whitespace-nowrap overflow-hidden">
          EcoSense<br />Monitor
        </span>
      </div>

      {/* Celular: 4 abas principais (Dashboard, Mapa, Análises, Mais) */}
      <nav className="md:hidden flex-1 flex items-center justify-around px-1">
        {mainItems.map(item => {
          const isActive = isTabActive(item.path);
          return (
            <Link key={item.path} to={item.path} className="flex-1" onClick={handleTabReset(item.path)}>
              <div className={`flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground"
              }`}>
                <item.icon className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex-1 relative"
          title="Mais"
        >
          <div className={`flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 ${
            mobileMoreItems.some(i => i.path === location.pathname)
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground"
          }`}>
            <Menu className="w-4 h-4" />
          </div>
          <BadgeDot className="absolute top-0 right-0" />
        </button>
      </nav>

      {/* Desktop: coluna completa */}
      <nav className="hidden md:flex flex-1 flex-col gap-1 py-3 px-2 overflow-y-auto">
        {desktopItemsAdmin.map(item => {
          const isActive = isTabActive(item.path);
          return (
            <Link key={item.path} to={item.path} className="w-full">
              <div className={`relative flex items-center justify-start gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                {item.path === "/configuracoes" && badge && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {alertas.length > 9 ? "9+" : alertas.length}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        <button
          onClick={handleToggleTheme}
          title={darkMode ? "Modo Claro" : "Modo Escuro"}
          className="flex items-center justify-start gap-3 px-2 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          {darkMode ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          <span className="text-sm font-medium">Tema</span>
        </button>
      </nav>

      {/* Rodapé — apenas desktop */}
      <div className="hidden md:block px-2 pb-3 border-t border-border/40 pt-2 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center justify-start gap-3 w-full px-2 py-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Sair</span>
        </button>
        <p className="text-[9px] text-muted-foreground/60 text-center">EcoSense IoT</p>
      </div>

      {/* Bottom sheet "Mais" — itens secundários no celular */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="md:hidden">
          <div className="px-3 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">Mais</p>
            <div className="space-y-0.5">
              {mobileMoreItemsAdmin.map(item => <MoreRow key={item.path} item={item} />)}
            </div>
            <div className="mt-2 border-t border-border/60 pt-2">
              <button
                onClick={handleToggleTheme}
                className="flex items-center gap-3 w-full px-3 py-3 min-h-[44px] rounded-xl text-foreground hover:bg-muted active:bg-muted transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-sm font-medium flex-1 text-left">{darkMode ? "Modo Claro" : "Modo Escuro"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 min-h-[44px] rounded-xl text-destructive hover:bg-destructive/10 active:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium flex-1 text-left">Sair</span>
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </aside>
  );
}