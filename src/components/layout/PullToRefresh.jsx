import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

const LIMIAR_PUXAO = 70;

/**
 * Pull-to-refresh para as páginas roláveis do app.
 * Detecta o gesto de arrastar para baixo no topo do container de rolagem
 * (fora do mapa) e invalida as queries do React Query para recarregar os dados.
 */
export default function PullToRefresh() {
  const queryClient = useQueryClient();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  useEffect(() => {
    let startY = 0;
    let active = false;
    let dist = 0;

    const onStart = (e) => {
      if (refreshingRef.current) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      // Não interceptar toques no mapa, drawers, popovers ou diálogos
      if (t.closest(".leaflet-container")) return;
      if (t.closest("[data-vaul-drawer], [data-radix-popper-content-wrapper], [role='dialog']")) return;
      const container = document.querySelector(".app-scroll-container");
      if (!container || container.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      active = true;
      dist = 0;
    };

    const onMove = (e) => {
      if (!active) return;
      dist = e.touches[0].clientY - startY;
      setPull(Math.max(0, Math.min(90, dist)));
    };

    const onEnd = () => {
      if (!active) return;
      active = false;
      setPull(0);
      if (dist > LIMIAR_PUXAO) {
        refreshingRef.current = true;
        setRefreshing(true);
        queryClient.invalidateQueries();
        setTimeout(() => {
          refreshingRef.current = false;
          setRefreshing(false);
        }, 800);
      }
      dist = 0;
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [queryClient]);

  if (pull <= 12 && !refreshing) return null;

  return (
    <div className="fixed top-[calc(0.6rem_+_env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[70] pointer-events-none md:hidden">
      <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl border border-border rounded-full px-3 py-1.5 shadow-lg">
        <RefreshCw className={`w-3.5 h-3.5 text-primary ${refreshing ? "animate-spin" : ""}`} />
        <span className="text-[10px] font-semibold text-foreground">
          {refreshing ? "Atualizando..." : pull > LIMIAR_PUXAO ? "Solte para atualizar" : "Puxe para atualizar"}
        </span>
      </div>
    </div>
  );
}