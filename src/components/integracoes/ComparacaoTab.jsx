import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveSelect from "@/components/shared/ResponsiveSelect";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import moment from "moment";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

const METRICS = [
  { key: "temperatura_c", label: "Temperatura", unit: "°C" },
  { key: "umidade_relativa_perc", label: "Umidade", unit: "%" },
  { key: "pressao_atmosferica_hpa", label: "Pressão", unit: "hPa" },
];

function DeltaBadge({ delta, unit }) {
  if (delta === null || delta === undefined || isNaN(delta)) return <span className="text-xs text-muted-foreground">—</span>;
  const abs = Math.abs(delta);
  const positive = delta > 0;
  const color = abs > 3 ? "text-red-600" : abs > 1 ? "text-amber-600" : "text-emerald-600";
  const Icon = abs < 0.1 ? Minus : positive ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${color}`}>
      <Icon className="w-3 h-3" />
      {positive ? "+" : ""}{delta.toFixed(2)} {unit}
    </span>
  );
}

export default function ComparacaoTab() {
  const [estacaoId, setEstacaoId] = useState("");

  const { data: estacoes = [] } = useQuery({ queryKey: ["estacoes"], queryFn: () => base44.entities.Estacoes.list() });
  const { data: leituras = [] } = useQuery({
    queryKey: ["leituras-analise"],
    queryFn: () => base44.entities.HistoricoLeituras.list("-timestamp_recebimento", 200),
  });
  const { data: dadosExternos = [] } = useQuery({
    queryKey: ["dados-externos"],
    queryFn: () => base44.entities.DadosExternos.list("-timestamp", 200),
  });

  const estacoesCandidatas = useMemo(() => {
    const idsComDados = [...new Set(dadosExternos.map(d => d.estacao_referencia_id).filter(Boolean))];
    return estacoes.filter(e => idsComDados.includes(e.id));
  }, [estacoes, dadosExternos]);

  const comparacoes = useMemo(() => {
    if (!estacaoId) return [];
    const externos = dadosExternos.filter(d => d.estacao_referencia_id === estacaoId);
    const internos = leituras.filter(l => l.estacao_id === estacaoId);

    return externos.map(ext => {
      // Leitura in-situ mais próxima no tempo
      const tsExt = moment(ext.timestamp);
      const closest = internos.reduce((best, l) => {
        const diff = Math.abs(moment(l.timestamp_recebimento).diff(tsExt, "minutes"));
        if (!best || diff < best.diff) return { l, diff };
        return best;
      }, null);

      const interno = closest?.l;
      const deltas = {};
      METRICS.forEach(m => {
        const extVal = ext[m.key];
        const intVal = interno?.[m.key];
        deltas[m.key] = extVal != null && intVal != null ? intVal - extVal : null;
      });

      return {
        id: ext.id,
        timestamp: ext.timestamp,
        fonte: ext.fonte,
        nome_externo: ext.nome_estacao_externa,
        diffMin: closest?.diff ?? null,
        externo: ext,
        interno,
        deltas,
      };
    }).sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf());
  }, [estacaoId, dadosExternos, leituras]);

  const avgDeltas = useMemo(() => {
    if (!comparacoes.length) return {};
    return METRICS.reduce((acc, m) => {
      const vals = comparacoes.map(c => c.deltas[m.key]).filter(v => v != null);
      acc[m.key] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
      return acc;
    }, {});
  }, [comparacoes]);

  const chartData = useMemo(() => {
    return comparacoes.slice(0, 20).reverse().map(c => ({
      time: moment(c.timestamp).format("DD/MM HH:mm"),
      ...METRICS.reduce((acc, m) => { acc[`delta_${m.key}`] = c.deltas[m.key]; return acc; }, {}),
    }));
  }, [comparacoes]);

  return (
    <div className="space-y-4">
      {/* Selector */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Estação para Comparar</p>
            {estacoesCandidatas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Importe dados externos primeiro na aba "Fontes Externas"</p>
            ) : (
              <ResponsiveSelect value={estacaoId} onValueChange={setEstacaoId}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Selecionar estação" />
                </SelectTrigger>
                <SelectContent>
                  {estacoesCandidatas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                </SelectContent>
              </ResponsiveSelect>
            )}
          </div>
          {estacaoId && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">{comparacoes.length}</span> comparações disponíveis
            </div>
          )}
        </div>
      </GlassCard>

      {estacaoId && comparacoes.length > 0 && (
        <>
          {/* Bias médio */}
          <div className="grid grid-cols-3 gap-3">
            {METRICS.map(m => {
              const avg = avgDeltas[m.key];
              const abs = avg != null ? Math.abs(avg) : 0;
              return (
                <GlassCard key={m.key} className="p-4">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Bias médio — {m.label}</p>
                  <DeltaBadge delta={avg} unit={m.unit} />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {avg == null ? "—" : abs < 0.5 ? "Excelente concordância" : abs < 2 ? "Boa concordância" : "Divergência significativa"}
                  </p>
                </GlassCard>
              );
            })}
          </div>

          {/* Charts */}
          <GlassCard className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Δ InSitu − Externo ao longo do tempo
            </p>
            <div className="space-y-6">
              {METRICS.map(m => (
                <div key={m.key}>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">{m.label} ({m.unit})</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={chartData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="time" tick={{ fontSize: 8, fill: "#9ca3af" }} interval="preserveStartEnd" tickLine={false} />
                      <YAxis tick={{ fontSize: 8, fill: "#9ca3af" }} tickLine={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 10, borderRadius: 8 }}
                        formatter={v => [v != null ? `${Number(v).toFixed(2)} ${m.unit}` : "—", `Δ ${m.label}`]}
                      />
                      <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
                      <Bar dataKey={`delta_${m.key}`} name={`Δ ${m.label}`} fill="#3b82f6" radius={[2, 2, 0, 0]}
                        label={false}
                        cell={(entry) => entry.value >= 0 ? "#3b82f6" : "#ef4444"}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Table */}
          <GlassCard className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tabela de Comparações</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Data/Hora</th>
                    <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Fonte</th>
                    <th className="text-right py-2 pr-3 text-muted-foreground font-medium">T°C Ext.</th>
                    <th className="text-right py-2 pr-3 text-muted-foreground font-medium">T°C InSitu</th>
                    <th className="text-right py-2 pr-3 text-muted-foreground font-medium">Δ T°C</th>
                    <th className="text-right py-2 pr-3 text-muted-foreground font-medium">Δ Umid%</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Δ Pressão</th>
                  </tr>
                </thead>
                <tbody>
                  {comparacoes.slice(0, 20).map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-1.5 pr-3 font-mono">{moment(c.timestamp).format("DD/MM HH:mm")}</td>
                      <td className="py-1.5 pr-3">
                        <Badge variant="outline" className="text-[10px] py-0">
                          {c.fonte}
                        </Badge>
                      </td>
                      <td className="py-1.5 pr-3 text-right">{c.externo.temperatura_c?.toFixed(1) ?? "—"}</td>
                      <td className="py-1.5 pr-3 text-right">{c.interno?.temperatura_c?.toFixed(1) ?? "—"}</td>
                      <td className="py-1.5 pr-3 text-right"><DeltaBadge delta={c.deltas.temperatura_c} unit="°C" /></td>
                      <td className="py-1.5 pr-3 text-right"><DeltaBadge delta={c.deltas.umidade_relativa_perc} unit="%" /></td>
                      <td className="py-1.5 text-right"><DeltaBadge delta={c.deltas.pressao_atmosferica_hpa} unit="hPa" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {estacaoId && comparacoes.length === 0 && (
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum dado externo para esta estação. Importe dados na aba "Fontes Externas".</p>
        </GlassCard>
      )}
    </div>
  );
}