import React from "react";
import { cn } from "@/lib/utils";

const sourceDot = {
  estacao: "bg-emerald-500",
  online: "bg-blue-500",
  offline: "bg-slate-400",
};

export default function EnvMetricCard({ icon: Icon, label, value, unit, color, source = "online", loading = false }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 backdrop-blur-xl px-2.5 py-1.5 hover:bg-card/95 transition-colors dark:bg-card/50">
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", sourceDot[source] || sourceDot.offline)} />
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <span className="text-[10px] font-medium text-muted-foreground truncate flex-1 min-w-0">{label}</span>
      <div className="flex items-baseline gap-0.5 flex-shrink-0">
        {loading ? (
          <div className="h-3 w-8 rounded bg-muted/40 animate-pulse" />
        ) : (
          <span className="text-xs font-bold tracking-tight" style={{ color }}>
            {value != null ? value : "—"}
          </span>
        )}
        {unit && <span className="text-[9px] text-muted-foreground font-medium">{unit}</span>}
      </div>
    </div>
  );
}