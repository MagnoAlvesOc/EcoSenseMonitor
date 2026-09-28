import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, TrendingUp, TrendingDown, Minus, AlertTriangle, Radio } from "lucide-react";
import moment from "moment";
import { useExternalIoT, getTs, safeNum, ONLINE_THRESHOLD_S } from "@/lib/useExternalIoT";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const METRICS = [
  { key: "temperatura_c", label: "Temperatura", unit: "°C", dec: 1 },
  { key: "umidade_relativa_perc", label: "Umidade", unit: "%", dec: 0 },
  { key: "pressao_atmosferica_hpa", label: "Pressão", unit: "hPa", dec: 0 },
];

function DeltaBadge({ delta, unit }) {
  if (delta == null || isNaN(delta)) return <span className="text-xs text-muted-foreground">—</span>;
  const abs = Math.abs(delta);
  const positive = delta > 0;
  const color = abs > 3 ? "text-red-500" : abs > 1 ? "text-amber-500" : "text-emerald-500";
  const Icon = abs < 0.1 ? Minus : positive ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${color}`}>
      <Icon className="w-3 h-3" />
      {positive ? "+" : ""}{delta.toFixed(1)} {unit}
    </span>
  );
}

// Busca Open-Meteo (pública, sem chave) pela coordenada — condições atuais
async function fetchOpenMeteo(lat, lng) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,surface_pressure&timezone=America/Sao_Paulo`
  );
  if (!res.ok) throw new Error(`Open-Meteo: ${res.status} ${res.statusText}`);
  const d = await res.json();
  const cur = d.current;
  if (!cur) throw new Error("Sem dados atuais do Open-Meteo agora");
  return {
    fonte: "Open-Meteo",
    nome: "Open-Meteo (modelo meteorológico)",
    ts: moment(cur.time).valueOf(),
    temperatura_c: cur.temperature_2m ?? null,
    umidade_relativa_perc: cur.relative_humidity_2m ?? null,
    pressao_atmosferica_hpa: cur.surface_pressure ?? null,
  };
}

// Busca OpenWeather (usa a API Key salva na aba Fontes Externas, se houver)
async function fetchOpenWeather(lat, lng) {
  const apiKey = localStorage.getItem("owm_api_key");
  if (!apiKey) throw new Error("Configure a API Key do OpenWeather na aba Fontes Externas");
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`);
  if (!res.ok) throw new Error(`OpenWeather: ${res.status} ${res.statusText}`);
  const d = await res.json();
  return {
    fonte: "OpenWeather",
    nome: d.name || "OpenWeather",
    ts: Date.now(),
    temperatura_c: d.main?.temp ?? null,
    umidade_relativa_perc: d.main?.humidity ?? null,
    pressao_atmosferica_hpa: d.main?.pressure ?? null,
  };
}

export default function TempoRealTab() {
  const [fonte, setFonte] = useState("openmeteo");
  const [stationKey, setStationKey] = useState("");

  // Leitura ao vivo da(s) estação(ões) — atualiza a cada 3s
  const { data: apiData = [], isLoading: ioLoading } = useExternalIoT();
  const { data: estacoes = [] } = useQuery({
    queryKey: ["estacoes"],
    queryFn: () => base44.entities.Estacoes.list(),
  });

  // Uma entrada por estação (leitura mais recente de cada)
  const stations = useMemo(() => {
    const map = new Map();
    apiData.forEach(r => {
      const key = r.estacao_id || r.estacao_nome;
      if (!key || map.has(key)) return;
      map.set(key, { key, label: r.estacao_nome || key, reading: r });
    });
    return [...map.values()];
  }, [apiData]);

  useEffect(() => {
    if (!stationKey && stations.length) setStationKey(stations[0].key);
  }, [stations, stationKey]);

  const selected = stations.find(s => s.key === stationKey);
  const reading = selected?.reading;

  // Coordenadas: GPS da leitura ao vivo, senão as cadastradas na estação
  const coords = useMemo(() => {
    if (!reading) return null;
    const lat = safeNum(reading.latitude);
    const lng = safeNum(reading.longitude);
    if (reading.gps_fix && lat != null && lng != null) return { lat, lng };
    const est = estacoes.find(
      e => e.ip_local === reading.estacao_id || e.nome === reading.estacao_nome || e.id === reading.estacao_id
    );
    if (est && est.latitude != null) return { lat: est.latitude, lng: est.longitude };
    return null;
  }, [reading, estacoes]);

  // Dados externos — atualização automática a cada 10 min
  const { data: externo, isLoading: extLoading, error: extError } = useQuery({
    queryKey: ["externo-realtime", fonte, coords?.lat?.toFixed?.(4), coords?.lng?.toFixed?.(4)],
    enabled: !!coords,
    queryFn: () => (fonte === "openweather" ? fetchOpenWeather(coords.lat, coords.lng) : fetchOpenMeteo(coords.lat, coords.lng)),
    refetchInterval: 10 * 60 * 1000,
    retry: 0,
  });

  if (ioLoading) {
    return (
      <GlassCard className="p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando dados ao vivo...
      </GlassCard>
    );
  }

  if (!stations.length) {
    return (
      <GlassCard className="p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma leitura ao vivo no momento — aguarde a estação enviar dados.</p>
      </GlassCard>
    );
  }

  const secsSince = reading ? (Date.now() - getTs(reading)) / 1000 : Infinity;
  const online = secsSince < ONLINE_THRESHOLD_S;

  return (
    <div className="space-y-4">
      {/* Seleção */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Comparação em Tempo Real
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Minha Estação (In-Situ)</p>
            <Select value={stationKey} onValueChange={setStationKey}>
              <SelectTrigger><SelectValue placeholder="Selecionar estação" /></SelectTrigger>
              <SelectContent>
                {stations.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Fonte Externa</p>
            <Select value={fonte} onValueChange={setFonte}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openmeteo">Open-Meteo (gratuita, sem chave)</SelectItem>
                <SelectItem value="openweather">OpenWeatherMap (usa a chave salva)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <Radio className="w-3 h-3" /> Sua estação atualiza a cada 3s · a fonte externa é buscada automaticamente a cada 10 min
        </p>
      </GlassCard>

      {!coords && (
        <GlassCard className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Sem coordenadas GPS para esta estação — aguarde um sinal GPS válido ou cadastre a localização no mapa.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Painéis lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">{selected?.label}</p>
            <Badge variant="outline" className={online ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-red-500/15 text-red-500 border-red-500/20"}>
              {online ? "ONLINE" : "OFFLINE"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Última leitura: {reading ? moment(getTs(reading)).format("DD/MM/YYYY HH:mm:ss") : "—"}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {METRICS.map(m => (
              <div key={m.key} className="rounded-xl bg-muted/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                <p className="text-sm font-bold mt-0.5">
                  {reading && reading[m.key] != null ? `${Number(reading[m.key]).toFixed(m.dec)} ${m.unit}` : "—"}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold truncate">{externo?.nome ?? fonte.toUpperCase()}</p>
            {extLoading ? (
              <Badge variant="outline"><Loader2 className="w-3 h-3 animate-spin mr-1" /> Buscando</Badge>
            ) : externo ? (
              <Badge variant="outline" className="bg-blue-500/15 text-blue-600 border-blue-500/20">{externo.fonte}</Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {externo ? `Medição: ${moment(externo.ts).format("DD/MM/YYYY HH:mm:ss")}` : "—"}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {METRICS.map(m => (
              <div key={m.key} className="rounded-xl bg-muted/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                <p className="text-sm font-bold mt-0.5">
                  {externo && externo[m.key] != null ? `${externo[m.key].toFixed(m.dec)} ${m.unit}` : "—"}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Erro da fonte externa */}
      {extError && (
        <GlassCard className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{extError.message}</p>
          </div>
        </GlassCard>
      )}

      {/* Tabela de diferenças */}
      {externo && !extError && (
        <GlassCard className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Diferença (Minha Estação − Fonte Externa)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Métrica</th>
                  <th className="text-right py-2 pr-3 text-muted-foreground font-medium">Minha Estação</th>
                  <th className="text-right py-2 pr-3 text-muted-foreground font-medium">Externa</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map(m => {
                  const myVal = reading && reading[m.key] != null ? Number(reading[m.key]) : null;
                  const extVal = externo[m.key];
                  const delta = myVal != null && extVal != null ? myVal - extVal : null;
                  return (
                    <tr key={m.key} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 pr-3 font-medium">{m.label}</td>
                      <td className="py-2 pr-3 text-right font-mono">{myVal != null ? myVal.toFixed(m.dec) : "—"}</td>
                      <td className="py-2 pr-3 text-right font-mono">{extVal != null ? extVal.toFixed(m.dec) : "—"}</td>
                      <td className="py-2 text-right"><DeltaBadge delta={delta} unit={m.unit} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}