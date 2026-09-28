import React, { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";
import { getTs, safeNum, buildChartSeries } from "@/lib/useExternalIoT";

const TIME_FILTERS = [
  { key: "1h", label: "1h", hours: 1 },
  { key: "6h", label: "6h", hours: 6 },
  { key: "24h", label: "24h", hours: 24 },
  { key: "7d", label: "7d", hours: 168 },
];

// Métricas comparáveis entre a estação e o dado externo de São Luís.
const METRICS = [
  { key: "temperatura_c", extKey: "temperatura_c", name: "Temperatura", unit: "°C", color: "#ef4444", tol: 2 },
  { key: "umidade_relativa_perc", extKey: "umidade_relativa_perc", name: "Umidade", unit: "%", color: "#3b82f6", tol: 5 },
  { key: "pressao_atmosferica_hpa", extKey: "pressao_atmosferica_hpa", name: "Pressão", unit: "hPa", color: "#8b5cf6", tol: 5 },
  { key: "nivel_co2", extKey: "co2_ppm", name: "CO₂", unit: "ppm", color: "#f59e0b", tol: 50 },
];

export default function ComparisonChart({ stationData = [], externalData }) {
  const [filter, setFilter] = useState("24h");
  const [metricKey, setMetricKey] = useState("temperatura_c");

  const metric = METRICS.find((m) => m.key === metricKey);
  const extValue = externalData ? safeNum(externalData[metric.extKey]) : null;

  const filteredData = useMemo(() => {
    if (!stationData.length) return [];
    const now = Date.now();
    const f = TIME_FILTERS.find((x) => x.key === filter);
    const cutoff = now - (f?.hours || 24) * 3600 * 1000;
    const filtered = stationData.filter((r) => getTs(r) >= cutoff);
    return buildChartSeries(filtered, [metric.key]);
  }, [stationData, filter, metricKey]);

  const stats = useMemo(() => {
    const vals = filteredData.map((d) => d[metric.key]).filter((v) => v != null);
    if (!vals.length) return null;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return {
      mean,
      ext: extValue,
      diff: extValue != null ? mean - extValue : null,
    };
  }, [filteredData, extValue, metricKey]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 dark:bg-card/60 dark:backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">Comparação: Estação vs São Luís (externo)</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Valide a precisão dos seus sensores contra dados meteorológicos externos
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                filter === f.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric selector */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetricKey(m.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
              metricKey === m.key
                ? "text-white border-transparent shadow-sm"
                : "text-muted-foreground border-border hover:text-foreground"
            }`}
            style={metricKey === m.key ? { background: m.color } : {}}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: metricKey === m.key ? "#fff" : m.color }}
            />
            {m.name} ({m.unit})
          </button>
        ))}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Média Estação</p>
            <p className="text-sm font-bold" style={{ color: metric.color }}>
              {stats.mean.toFixed(1)} {metric.unit}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Externo São Luís</p>
            <p className="text-sm font-bold text-muted-foreground">
              {stats.ext != null ? `${stats.ext.toFixed(1)} ${metric.unit}` : "—"}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Diferença (erro)</p>
            <p
              className={`text-sm font-bold ${
                stats.diff != null
                  ? Math.abs(stats.diff) < metric.tol
                    ? "text-emerald-500"
                    : "text-amber-500"
                  : "text-muted-foreground"
              }`}
            >
              {stats.diff != null
                ? `${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)} ${metric.unit}`
                : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: 240 }}>
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem dados da estação no período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                domain={["auto", "auto"]}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                formatter={(v) => (v != null ? `${Number(v).toFixed(1)} ${metric.unit}` : "--")}
              />
              {extValue != null && (
                <ReferenceLine
                  y={extValue}
                  stroke={metric.color}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Ext. São Luís: ${extValue.toFixed(1)}`,
                    fill: metric.color,
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey={metric.key}
                name="Estação"
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground mt-2">
        Linha sólida = sua estação · Linha tracejada = valor externo atual de São Luís (referência)
      </p>
    </div>
  );
}