import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  normal:  { dot: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
  atencao: { dot: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-50/80 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
  critico: { dot: "bg-red-500", text: "text-red-600", badge: "bg-red-50/80 text-red-700 dark:bg-red-950/50 dark:text-red-400" },
  offline: { dot: "bg-slate-400", text: "text-slate-500", badge: "bg-slate-100/80 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400" },
};

const statusLabel = { normal: "Normal", atencao: "Atenção", critico: "Crítico", offline: "Offline" };

function TinySpark({ data, dataKey, color }) {
  if (!data || data.length < 2) return <div className="h-6 w-full rounded bg-muted/30" />;
  return (
    <div className="h-6 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MetricCard({ icon: Icon, label, value, unit, color, status = "normal", delta, sparkData, sparkKey }) {
  const st = statusColors[status] || statusColors.offline;
  const DeltaIcon = delta == null ? Minus : delta >= 0 ? ChevronUp : ChevronDown;
  const deltaColor = delta == null ? "text-muted-foreground" : delta >= 0 ? "text-emerald-500" : "text-red-500";

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-xl p-3 flex flex-col gap-1.5 transition-all hover:shadow-md hover:bg-card/95 dark:bg-card/50 dark:backdrop-blur-xl">
      {/* Header row: icon + label + status */}
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight truncate">{label}</span>
        <span className={cn("ml-auto flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0", st.badge)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", st.dot, status === "normal" && "animate-pulse")} />
          {statusLabel[status]}
        </span>
      </div>

      {/* Value + delta */}
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tracking-tight leading-none" style={{ color }}>
          {value != null ? value : "—"}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">{unit}</span>
        {delta != null && (
          <span className={cn("flex items-center text-[10px] font-semibold ml-auto", deltaColor)}>
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Sparkline */}
      <TinySpark data={sparkData} dataKey={sparkKey} color={color} />
    </div>
  );
}