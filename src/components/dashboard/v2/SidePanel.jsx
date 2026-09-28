import React from "react";
import EnvMetricCard from "./EnvMetricCard";

export default function SidePanel({ cards, onlineLoading }) {
  return (
    <div className="fixed top-12 right-3 bottom-16 z-30 w-[224px] pointer-events-auto">
      <div className="h-full bg-card/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl flex flex-col dark:bg-card/60">
        {/* Header */}
        <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between">
          <span className="text-[11px] font-bold text-foreground">Monitoramento</span>
          <span className="text-[8px] text-muted-foreground">{onlineLoading ? "atualizando..." : "tempo real"}</span>
        </div>

        {/* Uniform grid — no scroll */}
        <div className="flex-1 overflow-hidden p-2">
          <div className="flex flex-col h-full justify-between">
            {cards.map((c, i) => (
              <EnvMetricCard key={i} {...c} loading={onlineLoading && c.source === "online" && c.value == null} />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="px-2 py-1.5 border-t border-border/60 flex items-center gap-3">
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