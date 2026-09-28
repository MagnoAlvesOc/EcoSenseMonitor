import React from "react";
import EnvMetricCard from "./EnvMetricCard";

export default function SidePanel({ cards, onlineLoading }) {
  return (
    <div className="fixed left-[68px] right-2 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 pointer-events-auto md:inset-x-auto md:top-12 md:right-3 md:bottom-16 md:w-[224px]">
      <div className="bg-card/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl flex flex-col dark:bg-card/60 md:h-full">
        {/* Header */}
        <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-bold text-foreground">Monitoramento</span>
          <span className="text-[8px] text-muted-foreground">{onlineLoading ? "atualizando..." : "tempo real"}</span>
        </div>

        {/* Cartões — faixa horizontal rolável no celular, coluna no desktop */}
        <div className="p-2 flex gap-1.5 overflow-x-auto touch-pan-x md:overflow-hidden md:flex-1 md:flex-col md:justify-between md:gap-1.5">
          {cards.map((c, i) => (
            <div key={i} className="flex-shrink-0 w-[150px] md:w-full">
              <EnvMetricCard {...c} loading={onlineLoading && c.source === "online" && c.value == null} />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden md:block px-2 py-1.5 border-t border-border/60 flex items-center gap-3">
          <span className="flex items-center gap-1 text-[8px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Estação
          </span>
          <span className="flex items-center gap-1 text-[8px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Online
          </span>
        </div>
      </div>
    </div>
  );
}