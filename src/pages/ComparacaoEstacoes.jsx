import React, { useState, useEffect, useMemo } from "react";
import DateRangeSelector from "@/components/shared/DateRangeSelector";
import StationSelect from "@/components/comparacao/StationSelect";
import CompareTable from "@/components/comparacao/CompareTable";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { GitCompareArrows, LineChart as LineChartIcon } from "lucide-react";
import {
  ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { useExternalIoT, filterByRange, safeNum, fmt, getTs, ONLINE_THRESHOLD_S } from "@/lib/useExternalIoT";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const METRICS = [
  { key: "temperatura_c", label: "Temperatura", unit: "°C", color: "#ef4444" },
  { key: "umidade_relativa_perc", label: "Umidade", unit: "%", color: "#3b82f6" },
  { key: "pressao_atmosferica_hpa", label: "Pressão", unit: "hPa", color: "#8b5cf6" },
  { key: "altitude_m", label: "Altitude", unit: "m", color: "#10b981" },
  { key: "nivel_co2", label: "CO₂", unit: "ppm", color: "#64748b" },
  { key: "status_bateria_v", label: "Bateria", unit: "V", color: "#84cc16" },
];

const stationKey = r => r.estacao_nome || r.estacao_id;
const mean = arr => {
  const v = arr.filter(x => x !== null);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
};

function StationSummaryCard({ title, readings, accent }) {
  const latest = readings[0] ?? null;
  return (
    <GlassCard className="p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-bold" style={{ color: accent }}>{title}</p>
        <p className="text-[10px] text-muted-foreground">
          {latest ? moment(getTs(latest)).format("DD/MM HH:mm:ss") : "sem leituras"}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {METRICS.map(m => (
          <div key={m.key} className="rounded-xl bg-muted/50 px-2 py-1.5">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">{m.label}</p>
            <p className="text-sm font-bold" style={{ color: m.color }}>{latest ? fmt(latest[m.key], 1) : "—"}</p>
            <p className="text-[9px] text-muted-foreground">
              média: {fmt(mean(readings.map(r => safeNum(r[m.key]))), 1)}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-right">
        {readings.length} registros no período
      </p>
    </GlassCard>
  );
}

export default function ComparacaoEstacoes() {
  const [activePreset, setActivePreset] = useState("Tudo");
  const [startDate, setStartDate] = useState("2000-01-01T00:00");
  const [endDate, setEndDate] = useState(moment().add(1, "day").format("YYYY-MM-DDTHH:mm"));
  const [metric, setMetric] = useState("temperatura_c");
  const [stationA, setStationA] = useState("");
  const [stationB, setStationB] = useState("");

  const { data: allData = [], isLoading } = useExternalIoT();

  const stations = useMemo(() => {
    const set = new Set();
    allData.forEach(r => {
      const k = stationKey(r);
      if (k) set.add(k);
    });
    return [...set];
  }, [allData]);

  useEffect(() => {
    if (!stationA && stations[0]) setStationA(stations[0]);
    if (!stationB && stations.length > 1) setStationB(stations[1]);
  }, [stations]);

  const readingsFor = name =>
    name ? allData.filter(r => stationKey(r) === name).sort((a, b) => getTs(b) - getTs(a)) : [];

  const dataA = useMemo(() => filterByRange(readingsFor(stationA), startDate, endDate), [allData, stationA, startDate, endDate]);
  const dataB = useMemo(() => filterByRange(readingsFor(stationB), startDate, endDate), [allData, stationB, startDate, endDate]);

  const compareRows = useMemo(() => METRICS.map(m => {
    const avgA = mean(dataA.map(r => safeNum(r[m.key])));
    const avgB = mean(dataB.map(r => safeNum(r[m.key])));
    return { ...m, avgA, avgB, delta: avgA !== null && avgB !== null ? avgA - avgB : null };
  }), [dataA, dataB]);

  const chartData = useMemo(() => {
    const map = new Map();
    const add = (rows, key) => rows.forEach(r => {
      const v = safeNum(r[metric]);
      if (v === null) return;
      const t = moment(getTs(r)).format("DD/MM HH:mm");
      if (!map.has(t)) map.set(t, { time: t, ts: getTs(r) });
      map.get(t)[key] = v;
    });
    add(dataA, "A");
    add(dataB, "B");
    return [...map.values()].sort((a, b) => a.ts - b.ts);
  }, [dataA, dataB, metric]);

  const handlePreset = (label, hours) => {
    setActivePreset(label);
    if (hours === 0) {
      setStartDate("2000-01-01T00:00");
      setEndDate(moment().add(1, "day").format("YYYY-MM-DDTHH:mm"));
      return;
    }
    setStartDate(moment().subtract(hours, "hours").format("YYYY-MM-DDTHH:mm"));
    setEndDate(moment().format("YYYY-MM-DDTHH:mm"));
  };

  const activeMetric = METRICS.find(m => m.key === metric);

  return (
    <div className="space-y-4 max-w-5xl pointer-events-auto">
      {/* Header */}
      <GlassCard className="p-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-primary" /> Comparação de Estações
          </h1>
          <p className="text-xs text-muted-foreground">Duas estações lado a lado — análise de microclima entre elas</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <StationSelect label="Estação A" value={stationA} onChange={setStationA} stations={stations} />
          <StationSelect label="Estação B" value={stationB} onChange={setStationB} stations={stations} />
        </div>
        <DateRangeSelector
          startDate={startDate} endDate={endDate}
          onStartChange={setStartDate} onEndChange={setEndDate}
          activePreset={activePreset} onPresetChange={handlePreset}
        />
      </GlassCard>

      {isLoading ? (
        <GlassCard className="p-8 text-center text-sm text-muted-foreground">Carregando dados das estações…</GlassCard>
      ) : !stationA ? (
        <GlassCard className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma estação com dados encontrada na tabela do Apps Script.
        </GlassCard>
      ) : (
        <>
          {/* Side-by-side summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StationSummaryCard title={stationA} readings={dataA} accent="#ef4444" />
            <StationSummaryCard title={stationB || "— (selecione a estação B)"} readings={dataB} accent="#3b82f6" />
          </div>

          {/* Comparison chart */}
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {activeMetric.label} — lado a lado
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {METRICS.map(m => (
                  <Button
                    key={m.key}
                    variant={metric === m.key ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setMetric(m.key)}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Sem dados no período selecionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <RLineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9ca3af" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "rgba(255,255,255,0.97)", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="A" name={`${stationA} — ${activeMetric.label}`} stroke="#ef4444" strokeWidth={2} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="B" name={`${stationB || "B"} — ${activeMetric.label}`} stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
                </RLineChart>
              </ResponsiveContainer>
            )}
          </GlassCard>

          {/* Differences table */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <GitCompareArrows className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Diferenças de microclima ({stationA} × {stationB || "—"})
              </p>
            </div>
            <div className="overflow-x-auto">
              <CompareTable rows={compareRows} />
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}