import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function LiveMetricCard({ label, value, unit, icon: Icon, color, trend }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">
                {value !== null && value !== undefined ? Number(value).toFixed(1) : "—"}
              </span>
              <span className="text-sm font-medium text-muted-foreground">{unit}</span>
            </div>
            {trend && (
              <p className={`text-xs mt-1 ${trend > 0 ? "text-red-500" : "text-blue-500"}`}>
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)} últimos 30min
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${color} bg-opacity-15`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}