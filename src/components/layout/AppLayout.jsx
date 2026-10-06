import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingMapBg from "./FloatingMapBg";
import PullToRefresh from "./PullToRefresh";
import SideNav from "./SideNav";
import MobilePageHeader from "./MobilePageHeader";
import InstallAppBanner from "./InstallAppBanner";
import AlertsNotifier from "../dashboard/AlertsNotifier";

export default function AppLayout() {
  // No Dashboard o mapa de fundo precisa continuar interativo nas áreas vazias.
  // Nas demais páginas a camada de conteúdo captura o toque para permitir rolar.
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fullscreen map background — receives pointer events where nothing overlaps */}
      <FloatingMapBg />

      {/* Cabeçalho de navegação mobile (título + voltar) */}
      <MobilePageHeader />

      {/* Fixed sidebar */}
      <SideNav />

      {/* Critical alerts overlay */}
      <AlertsNotifier />

      {/* Mobile install hint */}
      <InstallAppBanner />

      {/* Page content — pointer-events-none so map stays interactive in empty areas.
          Each page is responsible for re-enabling pointer-events on its own panels. */}
      <div className={`absolute inset-0 z-40 overflow-y-auto overflow-x-hidden app-scroll-container ${isDashboard ? "pointer-events-none" : "pointer-events-auto"}`}>
        <PullToRefresh />
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`min-h-full p-3 ${
            isDashboard
              ? "pt-[calc(0.75rem_+_env(safe-area-inset-top))]"
              : "pt-[calc(3.75rem_+_env(safe-area-inset-top))]"
          } pb-[calc(7rem_+_env(safe-area-inset-bottom))] md:p-5 md:pb-6 md:pl-[182px]`}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}