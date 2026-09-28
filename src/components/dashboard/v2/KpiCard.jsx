import React from "react";
import { cn } from "@/lib/utils";

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", icon: "text-blue-500" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-500" },
  purple: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400", icon: "text-violet-500" },
  amber:  { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", icon: "text-amber-500" },
  red:    { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", icon: "text-red-500" },
  slate:  { bg: "bg-slate-50 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", icon: "text-slate-500" },
  cyan:   { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-600 dark:text-cyan-400", icon: "text-cyan-500" },
};

export default function KpiCard({ icon: Icon, label, value, sub, color = "blue", className }) {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-xl p-2 flex flex-col gap-0.5 transition-all hover:shadow-md hover:bg-card/95",
        "dark:bg-card/50 dark:backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0", c.bg)}>
          <Icon className={cn("w-2.5 h-2.5", c.icon)} />
        </div>
        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider leading-tight truncate">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={cn("text-base font-bold tracking-tight leading-none", c.text)}>{value}</span>
        {sub && <span className="text-[8px] text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}