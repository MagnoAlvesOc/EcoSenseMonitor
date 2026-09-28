import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine
} from "recharts";
import moment from "moment";

const CHART_METRICS = [
  { key: "temperatura_c",         label: "Temperatura", unit: "°C",  color: "#ef4444" },
  { key: "umidade_relativa_perc", label: "Umidade",     unit: "%",   color: "#3b82f6" },
  { key: "nivel_co2",             label: "CO₂",         unit: "ppm", color: "#10b981" },
];

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 border border-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value != null ? Number(p.value).toFixed(2) : "—"} {unit}
        </p>
      ))}
    </div>
  );
};

export default function TrendCharts({ leituras, estacoes, filteredData }) {
  const [selectedStation, setSelectedStation] = useState("all");

  // build per-station time series
  const chartData = React.useMemo(() => {
    const data = filteredData
      .filter(l => selectedStation === "all" || l.estacao_id === selectedStation)
      .slice()
      .reverse()
      .slice(-60); // max 60 points

    return data.map(l => ({
      time: moment(l.timestamp_recebimento).format("DD/MM HH:mm"),
      temperatura_c: l.temperatura_c,
      umidade_relativa_perc: l.umidade_relativa_perc,
      nivel_co2: l.nivel_co2,
      estacao: l.estacao_id,
    }));
  }, [filteredData, selectedStation]);

  return (
    <div className="space-y-4">
      {/* Station selector */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Estação:</span>
          <button
            onClick={() => setSelectedStation("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedStation === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            Todas
          </button>
          {estacoes.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedStation(e.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedStation === e.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {e.nome}
            </button>
          ))}
        </div>

        {chartData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Sem dados no período selecionado
          </div>
        ) : (
          <div className="space-y-6">
            {CHART_METRICS.map(metric => (
              <div key={metric.key}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {metric.label} ({metric.unit})
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 9, fill: "#9ca3af" }}
                      interval="preserveStartEnd"
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} domain={["auto", "auto"]} tickLine={false} />
                    <Tooltip content={<CustomTooltip unit={metric.unit} />} />
                    <Line
                      type="monotone"
                      dataKey={metric.key}
                      name={metric.label}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: metric.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}