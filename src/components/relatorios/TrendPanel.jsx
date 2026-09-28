import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { LineChart, Thermometer, Droplets } from "lucide-react";
import { buildChartSeries, safeNum } from "@/lib/useExternalIoT";

function statRow(values, dec = 1) {
  const valid = values.filter((v) => v !== null && !isNaN(v));
  if (!valid.length) return { min: "—", med: "—", max: "—" };
  const sorted = [...valid].sort((a, b) => a - b);
  const med = valid.reduce((s, v) => s + v, 0) / valid.length;
  return {
    min: sorted[0].toFixed(dec),
    med: med.toFixed(dec),
    max: sorted[sorted.length - 1].toFixed(dec),
  };
}

export default function TrendPanel({ data = [], isLoading = false }) {
  const chartData = useMemo(
    () => buildChartSeries(data, ["temperatura_c", "umidade_relativa_perc"]),
    [data]
  );

  const temp = statRow(data.map((r) => safeNum(r.temperatura_c)));
  const umid = statRow(data.map((r) => safeNum(r.umidade_relativa_perc)));

  return (
    <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Variação Histórica — Temperatura &amp; Umidade
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground">{data.length} pontos no período</p>
      </div>

      {isLoading ? (
        <div className="h-56 bg-muted/30 animate-pulse rounded-xl" />
      ) : data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
          Sem dados no período selecionado
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <RLineChart data={chartData} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9ca3af" }} interval="preserveStartEnd" />
              <YAxis yAxisId="temp" tick={{ fontSize: 9, fill: "#ef4444" }} domain={["auto", "auto"]} />
              <YAxis yAxisId="umid" orientation="right" domain={[0, 100]} tick={{ fontSize: 9, fill: "#3b82f6" }} />
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.97)", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line yAxisId="temp" type="monotone" dataKey="temperatura_c" name="Temperatura (°C)" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls={false} />
              <Line yAxisId="umid" type="monotone" dataKey="umidade_relativa_perc" name="Umidade (%)" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
            </RLineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl bg-red-50/60 dark:bg-red-500/5 px-3 py-2 flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-[10px] text-muted-foreground">Temp</span>
              <span className="text-[11px] font-semibold ml-auto">min {temp.min}° · méd {temp.med}° · máx {temp.max}°C</span>
            </div>
            <div className="rounded-xl bg-blue-50/60 dark:bg-blue-500/5 px-3 py-2 flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-[10px] text-muted-foreground">Umidade</span>
              <span className="text-[11px] font-semibold ml-auto">min {umid.min}% · méd {umid.med}% · máx {umid.max}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}