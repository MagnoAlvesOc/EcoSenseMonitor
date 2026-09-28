import React, { useMemo } from "react";
import moment from "moment";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { getTs, safeNum, buildChartSeries } from "@/lib/useExternalIoT";

const TIME_FILTERS = [
  { key: "1h",  label: "1h",  hours: 1 },
  { key: "6h",  label: "6h",  hours: 6 },
  { key: "24h", label: "24h", hours: 24 },
  { key: "7d",  label: "7d",  hours: 168 },
  { key: "30d", label: "30d", hours: 720 },
];

const SERIES = [
  { key: "temperatura_c", name: "Temp °C", color: "#ef4444", yAxisId: "left" },
  { key: "umidade_relativa_perc", name: "Umid %", color: "#3b82f6", yAxisId: "left" },
  { key: "pressao_atmosferica_hpa", name: "Press hPa", color: "#8b5cf6", yAxisId: "right" },
  { key: "nivel_co2", name: "CO₂ ppm", color: "#f59e0b", yAxisId: "right" },
];

export default function TrendChart({ data = [], className }) {
  const [filter, setFilter] = React.useState("24h");

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const now = Date.now();
    const filterObj = TIME_FILTERS.find((f) => f.key === filter);
    const cutoff = now - (filterObj?.hours || 24) * 3600 * 1000;
    const filtered = data.filter((r) => getTs(r) >= cutoff);
    return buildChartSeries(filtered, SERIES.map((s) => s.key));
  }, [data, filter]);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 dark:bg-card/60 dark:backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">Tendências em Tempo Real</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {filteredData.length} leituras no período
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1 text-[11px] font-semibold rounded-md transition-all",
                filter === f.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 240 }}>
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem dados no período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} width={40} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              {SERIES.map((s) => (
                <Line
                  key={s.key}
                  yAxisId={s.yAxisId}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}