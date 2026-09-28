import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DateRangeSelector from "../components/shared/DateRangeSelector";
import moment from "moment";
import { BarChart3, TrendingUp, LineChart, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceArea
} from "recharts";
import { useExternalIoT, filterByRange, safeNum, fmt, getTs, buildChartSeries, detectGaps } from "@/lib/useExternalIoT";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

function calcStats(arr) {
  const valid = arr.filter(v => v !== null && !isNaN(v));
  if (!valid.length) return { media: null, mediana: null, desvio: null, min: null, max: null, count: 0 };
  const sorted = [...valid].sort((a, b) => a - b);
  const n = sorted.length;
  const media = valid.reduce((s, v) => s + v, 0) / n;
  const mediana = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const desvio = Math.sqrt(valid.reduce((s, v) => s + Math.pow(v - media, 2), 0) / n);
  return { media, mediana, desvio, min: sorted[0], max: sorted[n - 1], count: n };
}

const METRICS = [
  { key: "temperatura_c", label: "Temperatura", unit: "°C", color: "#ef4444" },
  { key: "umidade_relativa_perc", label: "Umidade", unit: "%", color: "#3b82f6" },
  { key: "pressao_atmosferica_hpa", label: "Pressão", unit: "hPa", color: "#8b5cf6" },
  { key: "altitude_m", label: "Altitude", unit: "m", color: "#10b981" },
];

const CHART_METRICS = [
  { key: "temperatura_c", label: "Temp (°C)", color: "#ef4444" },
  { key: "umidade_relativa_perc", label: "Umidade (%)", color: "#3b82f6" },
  { key: "pressao_atmosferica_hpa", label: "Pressão (hPa)", color: "#8b5cf6" },
];

export default function AnaliseEstatistica() {
  const [activePreset, setActivePreset] = useState("24h");
  const [startDate, setStartDate] = useState(moment().subtract(24, "hours").format("YYYY-MM-DDTHH:mm"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DDTHH:mm"));

  const { data: allData = [], isLoading } = useExternalIoT();

  const filteredData = useMemo(() => filterByRange(allData, startDate, endDate), [allData, startDate, endDate]);

  const latest = allData[0];
  const latestTs = latest ? getTs(latest) : null;
  const isOnline = latestTs ? (Date.now() - latestTs) / 1000 < 90 : false;

  const gaps = useMemo(() => detectGaps(filteredData, 2), [filteredData]);

  const stats = useMemo(() => {
    return METRICS.map(m => {
      const values = filteredData.map(d => safeNum(d[m.key]));
      return { ...m, ...calcStats(values) };
    });
  }, [filteredData]);

  const chartData = useMemo(
    () => buildChartSeries(filteredData, CHART_METRICS.map(m => m.key)),
    [filteredData]
  );

  // Gap (offline) areas for the chart — red bands where data is missing
  const gapAreas = useMemo(() => {
    const areas = [];
    for (let i = 0; i < chartData.length; i++) {
      if (chartData[i]?._gap) {
        const before = chartData[i - 1];
        const after = chartData[i + 1];
        if (before?.time && after?.time) {
          areas.push({ x1: before.time, x2: after.time });
        }
      }
    }
    return areas;
  }, [chartData]);

  const handlePreset = (label, hours) => {
    setActivePreset(label);
    setStartDate(moment().subtract(hours, "hours").format("YYYY-MM-DDTHH:mm"));
    setEndDate(moment().format("YYYY-MM-DDTHH:mm"));
  };

  const fmtStat = (v, dec = 2) => v !== null ? Number(v).toFixed(dec) : "—";

  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Análise Estatística</h1>
          <p className="text-xs text-muted-foreground">Estatísticas calculadas sobre dados reais do período</p>
        </div>
        <DateRangeSelector
          startDate={startDate} endDate={endDate}
          onStartChange={setStartDate} onEndChange={setEndDate}
          activePreset={activePreset} onPresetChange={handlePreset}
        />
      </GlassCard>

      {/* Operational status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
          <p className={`text-lg font-bold ${isOnline ? "text-emerald-500" : "text-red-500"}`}>
            {latestTs ? (isOnline ? "ONLINE" : "OFFLINE") : "—"}
          </p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Última leitura</p>
          <p className="text-sm font-bold">{latestTs ? moment(latestTs).format("HH:mm:ss") : "—"}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Registros no período</p>
          <p className="text-lg font-bold">{filteredData.length}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Lacunas detectadas</p>
          <p className={`text-lg font-bold ${gaps.length > 0 ? "text-amber-500" : "text-emerald-500"}`}>{gaps.length}</p>
        </GlassCard>
      </div>

      {/* Gaps alert */}
      {gaps.length > 0 && (
        <GlassCard className="p-3 border-amber-400/30 bg-amber-50/60">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">{gaps.length} Lacuna(s) de Coleta Detectada(s)</p>
          </div>
          <div className="space-y-0.5">
            {gaps.slice(0, 5).map((g, i) => (
              <p key={i} className="text-xs text-amber-600 font-mono">
                {moment(getTs(g.before)).format("HH:mm:ss")} → {moment(getTs(g.after)).format("HH:mm:ss")} ({Math.round(g.gapMinutes)} min)
              </p>
            ))}
            {gaps.length > 5 && <p className="text-xs text-amber-500">...e mais {gaps.length - 5} lacunas</p>}
          </div>
        </GlassCard>
      )}

      {/* Chart with gap breaks */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tendências Históricas — {filteredData.length} pontos
            {gapAreas.length > 0 && <span className="text-red-400 ml-2">• {gapAreas.length} período(s) offline</span>}
            {!isOnline && <span className="text-amber-500 ml-2">• Estação offline agora</span>}
          </p>
        </div>
        {isLoading ? (
          <div className="h-48 bg-muted/30 animate-pulse rounded-xl" />
        ) : filteredData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Sem dados no período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <RLineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              {gapAreas.map((g, i) => (
                <ReferenceArea key={i} x1={g.x1} x2={g.x2} yAxisId="left" strokeOpacity={0} fill="#ef4444" fillOpacity={0.07} />
              ))}
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9ca3af" }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "#9ca3af" }} domain={["auto", "auto"]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: "#9ca3af" }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.97)", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 11 }}
                formatter={(value) => value !== null ? value : "lacuna"}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line yAxisId="left" type="monotone" dataKey="temperatura_c" name="Temp °C" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls={false} />
              <Line yAxisId="left" type="monotone" dataKey="umidade_relativa_perc" name="Umidade %" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
              <Line yAxisId="right" type="monotone" dataKey="pressao_atmosferica_hpa" name="Pressão hPa" stroke="#8b5cf6" strokeWidth={2} dot={false} connectNulls={false} />
            </RLineChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <GlassCard key={s.key} className="p-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{fmtStat(s.media)}</p>
            <p className="text-xs text-muted-foreground">média • {s.count} amostras</p>
          </GlassCard>
        ))}
      </div>

      {/* Stats table */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resumo Estatístico</p>
        </div>
        {filteredData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem dados no período selecionado</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variável</TableHead>
                  <TableHead>N</TableHead>
                  <TableHead>Média</TableHead>
                  <TableHead>Mediana</TableHead>
                  <TableHead>Desvio Padrão</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Máximo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map(s => (
                  <TableRow key={s.key}>
                    <TableCell className="font-medium">{s.label} ({s.unit})</TableCell>
                    <TableCell>{s.count}</TableCell>
                    <TableCell>{fmtStat(s.media)}</TableCell>
                    <TableCell>{fmtStat(s.mediana)}</TableCell>
                    <TableCell>{fmtStat(s.desvio, 3)}</TableCell>
                    <TableCell>{fmtStat(s.min)}</TableCell>
                    <TableCell>{fmtStat(s.max)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Métricas de Erro (MAE & RMSE)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">MAE (Erro Médio Absoluto)</p>
            <p className="text-sm">MAE = (1/n) × Σ|InSitu<sub>i</sub> − Referência<sub>i</sub>|</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">RMSE (Raiz do Erro Quadrático Médio)</p>
            <p className="text-sm">RMSE = √((1/n) × Σ(InSitu<sub>i</sub> − Referência<sub>i</sub>)²)</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}