import React, { useState, useMemo, useEffect, useRef } from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useExternalIoT, safeNum, getTs, isDeepSleep, isStationOnline } from "@/lib/useExternalIoT";
import EnergyPanel from "@/components/dashboard/EnergyPanel";
import {
  Thermometer, Droplets, Gauge, Cloud, Mountain, Signal, Radio, Satellite,
  Wifi, WifiOff, Activity, ShieldCheck, Clock, Zap, CloudRain, Moon,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, BarChart3, X,
} from "lucide-react";
import KpiCard from "@/components/dashboard/v2/KpiCard";
import TrendChart from "@/components/dashboard/v2/TrendChart";
import ComparisonChart from "@/components/dashboard/v2/ComparisonChart";
import SidePanel from "@/components/dashboard/v2/SidePanel";
import { buildEnvCards } from "@/lib/envMetrics";
import { useOnlineEnvData } from "@/lib/useOnlineEnvData";

moment.locale("pt-br");

// ── Status helpers ───────────────────────────────────────────────────────────
function getTempStatus(v) {
  if (v == null) return "offline";
  if (v > 40) return "critico";
  if (v > 35) return "atencao";
  return "normal";
}
function getHumidityStatus(v) {
  if (v == null) return "offline";
  if (v > 95 || v < 20) return "critico";
  if (v > 90 || v < 30) return "atencao";
  return "normal";
}
function getCo2Status(v) {
  if (v == null) return "offline";
  if (v > 1000) return "critico";
  if (v > 800) return "atencao";
  return "normal";
}
function getPressureStatus(v) {
  if (v == null) return "offline";
  if (v > 1030 || v < 980) return "critico";
  if (v > 1020 || v < 990) return "atencao";
  return "normal";
}
function getBatteryStatus(v) {
  if (v == null) return "offline";
  if (v < 3.3) return "critico";
  if (v < 3.5) return "atencao";
  return "normal";
}
function getRssiStatus(v) {
  if (v == null) return "offline";
  if (v < -80) return "critico";
  if (v < -70) return "atencao";
  return "normal";
}
function getAltitudeStatus(v) {
  if (v == null) return "offline";
  return "normal";
}
function getSatellitesStatus(v) {
  if (v == null) return "offline";
  if (v < 4) return "critico";
  if (v < 6) return "atencao";
  return "normal";
}

// ── Rain chance heuristic ────────────────────────────────────────────────────
function getRainChance(latest, prev) {
  const humidity = safeNum(latest?.umidade_relativa_perc);
  const pressure = safeNum(latest?.pressao_atmosferica_hpa);
  const prevPressure = safeNum(prev?.pressao_atmosferica_hpa);
  if (humidity == null || pressure == null) return null;

  let chance = 0;
  // Humidity contribution (0–55%)
  if (humidity >= 90) chance += 55;
  else if (humidity >= 80) chance += 40;
  else if (humidity >= 70) chance += 25;
  else if (humidity >= 60) chance += 12;
  else chance += 3;

  // Pressure contribution (0–25%)
  if (pressure < 1005) chance += 25;
  else if (pressure < 1010) chance += 15;
  else if (pressure < 1013) chance += 5;

  // Falling pressure trend (+20%)
  if (prevPressure != null && pressure < prevPressure) chance += 20;

  return Math.min(100, Math.round(chance));
}

function getRainChanceStatus(v) {
  if (v == null) return "offline";
  if (v >= 70) return "critico";
  if (v >= 40) return "atencao";
  return "normal";
}

// ── Top Status Bar ───────────────────────────────────────────────────────────
function TopBar({ isOnline, latest, isError, deepSleep }) {
  const lastTs = latest ? moment(getTs(latest)).format("DD/MM HH:mm:ss") : null;
  // Clamp em 0: evita "há -Ns" se o relógio do dispositivo adiantar
  const secsSinceLast = latest ? Math.max(0, Math.round((Date.now() - getTs(latest)) / 1000)) : null;

  let agoStr = "";
  if (secsSinceLast != null) {
    if (secsSinceLast < 60) agoStr = `${secsSinceLast}s`;
    else if (secsSinceLast < 3600) agoStr = `${Math.floor(secsSinceLast / 60)}min`;
    else agoStr = `${Math.floor(secsSinceLast / 3600)}h`;
  }

  return (
    <div className="fixed top-[calc(0.75rem_+_env(safe-area-inset-top))] md:top-3 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto">
      <div className="flex items-center gap-2 bg-card/85 backdrop-blur-xl border border-border rounded-full px-3 py-1.5 shadow-lg dark:bg-card/50">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isError ? "bg-red-500" : deepSleep ? "bg-amber-500 animate-pulse" : isOnline ? "bg-emerald-500 animate-pulse" : latest ? "bg-red-400" : "bg-slate-400"
        }`} />
        <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">
          {isError ? "Erro API" : deepSleep ? "Deep Sleep" : isOnline ? "Online" : latest ? "Offline" : "Sem dados"}
        </span>
        {lastTs && (
          <>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">·</span>
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline whitespace-nowrap">{lastTs}</span>
          </>
        )}
        {agoStr && (
          <>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">·</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline whitespace-nowrap">há {agoStr}</span>
          </>
        )}
        <span className="text-[10px] text-muted-foreground hidden sm:inline">·</span>
        <span className="text-[10px] text-emerald-500 font-medium hidden sm:inline">5s</span>
      </div>
    </div>
  );
}

// ── Popup wrapper (click-outside to close) ───────────────────────────────────
function Popup({ open, onClose, children, style, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    // Delay to avoid immediate close on the same click that opened it
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] pointer-events-none">
      <div
        ref={ref}
        className={`pointer-events-auto ${className}`}
        style={style}
      >
        {children}
      </div>
    </div>
  );
}

// ── KPI Popup (left side) ────────────────────────────────────────────────────
function KpiPopup({ kpis, open, onClose }) {
  return (
    <Popup open={open} onClose={onClose}
      className="absolute right-3 top-[5.5rem] md:top-12 md:left-[182px] md:right-auto"
    >
      <div className="bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-2.5 w-[168px] dark:bg-card/90">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[10px] font-bold text-foreground">KPIs</span>
          <button onClick={onClose} className="p-0.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* KPI cards */}
        <div className="flex flex-col gap-1">
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-1.5 bg-muted/40 backdrop-blur rounded-xl p-2">
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Legenda</p>
          <div className="space-y-0.5">
            {[
              { dot: "bg-emerald-500", label: "Normal" },
              { dot: "bg-amber-500", label: "Atenção" },
              { dot: "bg-red-500", label: "Crítico" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${l.dot}`} />
                <span className="text-[9px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Popup>
  );
}

// ── Bottom Chart Drawer ──────────────────────────────────────────────────────
function ChartDrawer({ data, externalData }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("trends");

  if (!data || data.length === 0) return null;

  if (!open) {
    return (
      <div className="fixed bottom-[calc(10.5rem_+_env(safe-area-inset-bottom))] md:bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-card/85 backdrop-blur-xl border border-border rounded-full px-4 py-2 shadow-lg hover:bg-card transition-colors dark:bg-card/50"
        >
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Tendências</span>
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] pointer-events-auto">
      <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
      <div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-2xl border-t border-border rounded-t-2xl shadow-2xl max-h-[60vh] overflow-y-auto dark:bg-card/90 md:ml-[182px]">
        <div className="sticky top-0 bg-card/95 backdrop-blur-2xl border-b border-border px-5 py-3 flex items-center justify-between z-10 dark:bg-card/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Tendências em Tempo Real</span>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setView("trends")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  view === "trends" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tendências
              </button>
              <button
                onClick={() => setView("compare")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  view === "compare" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Comparação
              </button>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-3">
          {view === "trends" ? (
            <TrendChart data={data} />
          ) : (
            <ComparisonChart stationData={data} externalData={externalData} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Toggle buttons (KPIs + Energia, juntos) ──────────────────────────────────
function ToggleGroup({ kpiOpen, onKpiToggle, energyOpen, onEnergyToggle, sleeping }) {
  return (
    <div className="fixed right-3 top-[calc(3rem_+_env(safe-area-inset-top))] md:top-3 md:left-[182px] md:right-auto z-40 pointer-events-auto flex items-center gap-1.5">
      <button
        onClick={onKpiToggle}
        className="flex items-center gap-1.5 bg-card/85 backdrop-blur-xl border border-border rounded-lg px-2.5 py-1.5 shadow-lg hover:bg-card transition-colors dark:bg-card/50"
        title="KPIs"
      >
        <span className="text-[11px] font-semibold text-foreground">KPIs</span>
        {kpiOpen ? <ChevronLeft className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
      </button>
      <button
        onClick={onEnergyToggle}
        className={`flex items-center gap-1.5 bg-card/85 backdrop-blur-xl border border-border rounded-lg px-2.5 py-1.5 shadow-lg hover:bg-card transition-colors dark:bg-card/50 ${
          sleeping ? "border-amber-500/50" : ""
        }`}
        title="Energia da Estação"
      >
        {sleeping ? <Moon className="w-3.5 h-3.5 text-amber-500" /> : <Zap className="w-3.5 h-3.5 text-emerald-500" />}
        <span className="text-[11px] font-semibold text-foreground">Energia</span>
        {energyOpen ? <ChevronLeft className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
      </button>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [kpiOpen, setKpiOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);

  const { data: rawData, isLoading, isError } = useExternalIoT();
  const allData = rawData ?? [];
  const { data: onlineEnvData, isLoading: onlineEnvLoading } = useOnlineEnvData();

  const { data: alertas = [] } = useQuery({
    queryKey: ["alertas-kpi"],
    queryFn: () => base44.entities.Alertas.filter({ lido: false }),
    refetchInterval: 15000,
  });

  // ── Computed values ──────────────────────────────────────────────────────
  const latest = allData[0] ?? null;
  const prev = allData[2] ?? null;

  // Última leitura com informação de energia — alimenta o painel "Energia da Estação"
  const energyRow = useMemo(
    () => allData.find((r) => r.estado_energia != null && r.estado_energia !== "") ?? latest,
    [allData, latest]
  );

  const secsSinceLast = latest ? (Date.now() - getTs(latest)) / 1000 : null;
  const isOnline = latest ? isStationOnline(latest) : false;

  const delta = (curr, p) =>
    curr != null && p != null && p !== 0 ? ((curr - p) / Math.abs(p)) * 100 : null;

  const stationStatuses = useMemo(() => {
    const map = {};
    for (const r of allData) {
      const sid = r.estacao_id;
      if (!sid || map[sid]) continue;
      map[sid] = isStationOnline(r) ? "online" : "offline";
    }
    return map;
  }, [allData]);

  const onlineCount = Object.values(stationStatuses).filter((s) => s === "online").length;
  const offlineCount = Object.values(stationStatuses).filter((s) => s === "offline").length;
  const leiturasHoje = allData.filter((r) => getTs(r) >= moment().startOf("day").valueOf()).length;

  const disponibilidade = useMemo(() => {
    if (!allData.length) return null;
    const last24h = allData.filter((r) => getTs(r) >= Date.now() - 86400000);
    if (!last24h.length) return null;
    return Math.min(99.9, (last24h.length / (86400 / 5)) * 100).toFixed(1);
  }, [allData]);

  const sensoresConectados = useMemo(() => {
    if (!latest) return 0;
    const fields = ["temperatura_c", "umidade_relativa_perc", "pressao_atmosferica_hpa", "altitude_m", "rssi"];
    return fields.filter((f) => safeNum(latest[f]) !== null).length;
  }, [latest]);

  const sparkData = useMemo(() => {
    const subset = allData.slice(0, 30).reverse();
    return subset.map((r) => ({
      temp: safeNum(r.temperatura_c),
      umid: safeNum(r.umidade_relativa_perc),
      press: safeNum(r.pressao_atmosferica_hpa),
      alt: safeNum(r.altitude_m),
      rssi: safeNum(r.rssi),
    }));
  }, [allData]);

  // ── KPI definitions ──────────────────────────────────────────────────────
  const rainChance = getRainChance(latest, prev);
  const kpis = [
    { icon: CloudRain, label: "Chuva", value: rainChance != null ? `${rainChance}%` : "—", sub: "chance", color: rainChance >= 70 ? "blue" : rainChance >= 40 ? "amber" : "slate" },
    { icon: Radio, label: "Online", value: onlineCount, sub: "estações", color: "green" },
    { icon: WifiOff, label: "Offline", value: offlineCount, color: offlineCount > 0 ? "red" : "slate" },
    { icon: Zap, label: "Leituras", value: leiturasHoje, sub: "hoje", color: "blue" },
    { icon: Activity, label: "Alertas", value: alertas.length, color: alertas.length > 0 ? "amber" : "slate" },
    { icon: Cloud, label: "Sensores", value: sensoresConectados, sub: "ativos", color: "purple" },
    { icon: ShieldCheck, label: "Uptime", value: disponibilidade ? `${disponibilidade}%` : "—", color: "cyan" },
    { icon: Clock, label: "Sinc", value: secsSinceLast != null ? (secsSinceLast < 60 ? `${Math.round(secsSinceLast)}s` : `${Math.floor(secsSinceLast / 60)}min`) : "—", sub: "atrás", color: "slate" },
  ];

  // ── Metric definitions ────────────────────────────────────────────────────
  const metrics = [
    { icon: Thermometer, label: "Temperatura", color: "#ef4444", unit: "°C", value: latest ? safeNum(latest.temperatura_c)?.toFixed(1) : null, status: getTempStatus(safeNum(latest?.temperatura_c)), delta: delta(safeNum(latest?.temperatura_c), safeNum(prev?.temperatura_c)), sparkData, sparkKey: "temp" },
    { icon: Droplets, label: "Umidade", color: "#3b82f6", unit: "%", value: latest ? safeNum(latest.umidade_relativa_perc)?.toFixed(1) : null, status: getHumidityStatus(safeNum(latest?.umidade_relativa_perc)), delta: delta(safeNum(latest?.umidade_relativa_perc), safeNum(prev?.umidade_relativa_perc)), sparkData, sparkKey: "umid" },
    { icon: Gauge, label: "Pressão", color: "#8b5cf6", unit: "hPa", value: latest ? safeNum(latest.pressao_atmosferica_hpa)?.toFixed(0) : null, status: getPressureStatus(safeNum(latest?.pressao_atmosferica_hpa)), delta: delta(safeNum(latest?.pressao_atmosferica_hpa), safeNum(prev?.pressao_atmosferica_hpa)), sparkData, sparkKey: "press" },
    { icon: Mountain, label: "Altitude", color: "#f59e0b", unit: "m", value: latest ? safeNum(latest.altitude_m)?.toFixed(1) : null, status: getAltitudeStatus(safeNum(latest?.altitude_m)), delta: delta(safeNum(latest?.altitude_m), safeNum(prev?.altitude_m)), sparkData, sparkKey: "alt" },
    { icon: Signal, label: "Sinal Wi-Fi", color: "#10b981", unit: "dBm", value: latest ? safeNum(latest.rssi)?.toFixed(0) : null, status: getRssiStatus(safeNum(latest?.rssi)), delta: delta(safeNum(latest?.rssi), safeNum(prev?.rssi)), sparkData, sparkKey: "rssi" },
    { icon: Satellite, label: "Satélites GPS", color: "#0ea5e9", unit: "sat", value: latest ? safeNum(latest.satellites)?.toFixed(0) : null, status: getSatellitesStatus(safeNum(latest?.satellites)), delta: delta(safeNum(latest?.satellites), safeNum(prev?.satellites)) },
  ];

  // ── Environmental cards (rain chance from station + gases/precip online) ─
  const stationCards = metrics.map((m) => ({ icon: m.icon, label: m.label, value: m.value, unit: m.unit, color: m.color, source: "estacao" }));
  const envCards = buildEnvCards(latest, prev, onlineEnvData);
  const sideCards = [...stationCards, ...envCards];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Top status bar */}
      <TopBar isOnline={isOnline} latest={latest} isError={isError} deepSleep={latest ? isDeepSleep(latest) : false} />

      {/* Toggle buttons (KPIs + Energia) — sempre visíveis */}
      <ToggleGroup
        kpiOpen={kpiOpen}
        onKpiToggle={() => { setKpiOpen(!kpiOpen); if (!kpiOpen) setEnergyOpen(false); }}
        energyOpen={energyOpen}
        onEnergyToggle={() => { setEnergyOpen(!energyOpen); if (!energyOpen) setKpiOpen(false); }}
        sleeping={energyRow ? isDeepSleep(energyRow) : false}
      />

      {/* Popups — shown on demand */}
      <KpiPopup kpis={kpis} open={kpiOpen} onClose={() => setKpiOpen(false)} />

      {/* Unified fixed side panel (station metrics + environmental) */}
      <SidePanel cards={sideCards} onlineLoading={onlineEnvLoading} />

      {/* Energia da estação (ciclo de deep sleep) */}
      <EnergyPanel row={energyRow} open={energyOpen} onClose={() => setEnergyOpen(false)} />

      {/* Bottom chart drawer */}
      <ChartDrawer data={allData} externalData={onlineEnvData} />

      {/* Loading state */}
      {isLoading && !allData.length && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none md:pl-[182px]">
          <div className="bg-card/90 backdrop-blur-xl border border-border rounded-2xl px-6 py-4 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-medium text-muted-foreground">Carregando dados...</span>
            </div>
          </div>
        </div>
      )}

      {/* No data state */}
      {!isLoading && !isError && !latest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none md:pl-[182px]">
          <div className="bg-card/90 backdrop-blur-xl border border-border rounded-2xl px-6 py-4 shadow-xl text-center pointer-events-auto">
            <Wifi className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">Nenhum dado recebido</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Aguardando transmissão do ESP8266...</p>
          </div>
        </div>
      )}
    </>
  );
}