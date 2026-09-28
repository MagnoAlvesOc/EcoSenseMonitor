import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import moment from "moment";

const METRIC_CONFIG = {
  temperatura_c: { label: "Temperatura (°C)", color: "#ef4444", unit: "°C" },
  umidade_relativa_perc: { label: "Umidade (%)", color: "#3b82f6", unit: "%" },
  pressao_atmosferica_hpa: { label: "Pressão (hPa)", color: "#8b5cf6", unit: "hPa" },
  altitude_m: { label: "Altitude (m)", color: "#10b981", unit: "m" },
  indice_uv: { label: "Índice UV", color: "#f59e0b", unit: "" },
  nivel_co2: { label: "CO₂ (ppm)", color: "#6366f1", unit: "ppm" },
  status_bateria_v: { label: "Bateria (V)", color: "#ec4899", unit: "V" },
};

export default function TelemetryChart({ data, metrics = ["temperatura_c", "umidade_relativa_perc"], title = "Variação Temporal" }) {
  const chartData = (data || [])
    .sort((a, b) => new Date(a.timestamp_recebimento) - new Date(b.timestamp_recebimento))
    .map(d => ({
      ...d,
      time: moment(d.timestamp_recebimento).format("HH:mm"),
      fullTime: moment(d.timestamp_recebimento).format("DD/MM HH:mm"),
    }));

  return (
    <Card className="border-none shadow-lg bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            Sem dados para exibir
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTime || ""}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {metrics.map(metric => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={METRIC_CONFIG[metric]?.label || metric}
                  stroke={METRIC_CONFIG[metric]?.color || "#888"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}