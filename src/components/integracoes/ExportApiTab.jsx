import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Code2, CheckCircle2, RefreshCw, Zap, AlertTriangle, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

function CodeBlock({ code, label }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <span className="text-xs text-gray-400 font-mono">{label}</span>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="p-4 text-xs text-green-400 overflow-x-auto font-mono whitespace-pre-wrap max-h-72">{code}</pre>
    </div>
  );
}

function calcStats(values) {
  if (!values.length) return { media: null, min: null, max: null, desvio: null };
  const media = values.reduce((s, v) => s + v, 0) / values.length;
  const desvio = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - media, 2), 0) / values.length);
  return { media: +media.toFixed(4), min: +Math.min(...values).toFixed(4), max: +Math.max(...values).toFixed(4), desvio: +desvio.toFixed(4) };
}

export default function ExportApiTab() {
  const { toast } = useToast();
  const [estacaoId, setEstacaoId] = useState("all");
  const [limit, setLimit] = useState("200");
  const [formato, setFormato] = useState("tudo");
  const [startDate, setStartDate] = useState(moment().subtract(7, "days").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  const { data: estacoes = [] } = useQuery({ queryKey: ["estacoes"], queryFn: () => base44.entities.Estacoes.list() });
  const { data: leituras = [], refetch: refetchLeituras } = useQuery({
    queryKey: ["leituras-export"],
    queryFn: () => base44.entities.HistoricoLeituras.list("-timestamp_recebimento", 1000),
    refetchInterval: autoRefresh ? 60000 : false,
  });
  const { data: dadosExternos = [] } = useQuery({
    queryKey: ["dados-externos"],
    queryFn: () => base44.entities.DadosExternos.list("-timestamp", 200),
    refetchInterval: autoRefresh ? 60000 : false,
  });

  const filteredLeituras = useMemo(() => {
    let data = leituras;
    if (estacaoId !== "all") data = data.filter(l => l.estacao_id === estacaoId);
    data = data.filter(l => {
      const ts = moment(l.timestamp_recebimento);
      return ts.isSameOrAfter(startDate) && ts.isSameOrBefore(moment(endDate).endOf("day"));
    });
    return data.slice(0, parseInt(limit) || 200);
  }, [leituras, estacaoId, startDate, endDate, limit]);

  const buildPayload = useCallback(() => {
    const meta = {
      gerado_em: new Date().toISOString(),
      total_registros: filteredLeituras.length,
      estacao_filtro: estacaoId === "all" ? "todas" : estacoes.find(e => e.id === estacaoId)?.nome,
      periodo_inicio: startDate,
      periodo_fim: endDate,
      formato,
      fonte: "InSitu Monitor",
      versao: "1.0",
    };

    const leiturasFormatadas = filteredLeituras.map(l => {
      const est = estacoes.find(e => e.id === l.estacao_id);
      return {
        id: l.id,
        timestamp: l.timestamp_recebimento,
        estacao_id: l.estacao_id,
        estacao_nome: est?.nome ?? null,
        latitude: est?.latitude ?? null,
        longitude: est?.longitude ?? null,
        temperatura_c: l.temperatura_c ?? null,
        umidade_relativa_perc: l.umidade_relativa_perc ?? null,
        pressao_atmosferica_hpa: l.pressao_atmosferica_hpa ?? null,
        altitude_m: l.altitude_m ?? null,
        indice_uv: l.indice_uv ?? null,
        nivel_co2: l.nivel_co2 ?? null,
        status_bateria_v: l.status_bateria_v ?? null,
      };
    });

    const estatisticasPorEstacao = estacoes.map(e => {
      const items = filteredLeituras.filter(l => l.estacao_id === e.id);
      return {
        estacao_id: e.id,
        estacao_nome: e.nome,
        latitude: e.latitude,
        longitude: e.longitude,
        status: e.status,
        total_leituras: items.length,
        ultima_leitura: items[0]?.timestamp_recebimento ?? null,
        temperatura: calcStats(items.map(l => l.temperatura_c).filter(v => v != null)),
        umidade: calcStats(items.map(l => l.umidade_relativa_perc).filter(v => v != null)),
        pressao: calcStats(items.map(l => l.pressao_atmosferica_hpa).filter(v => v != null)),
        co2: calcStats(items.map(l => l.nivel_co2).filter(v => v != null)),
        uv: calcStats(items.map(l => l.indice_uv).filter(v => v != null)),
      };
    });

    const externos = dadosExternos.filter(d => estacaoId === "all" || d.estacao_referencia_id === estacaoId);
    const comparacoes = externos.map(ext => {
      const extTs = moment(ext.timestamp);
      const internos = filteredLeituras.filter(l => l.estacao_id === ext.estacao_referencia_id);
      const closest = internos.reduce((best, l) => {
        const diff = Math.abs(moment(l.timestamp_recebimento).diff(extTs, "minutes"));
        return !best || diff < best.diff ? { l, diff } : best;
      }, null);
      const i = closest?.l;
      return {
        timestamp: ext.timestamp,
        estacao_id: ext.estacao_referencia_id,
        estacao_nome: ext.estacao_referencia_nome,
        fonte_externa: ext.fonte,
        diff_minutos: closest?.diff ?? null,
        externo: { temperatura_c: ext.temperatura_c, umidade_relativa_perc: ext.umidade_relativa_perc, pressao_atmosferica_hpa: ext.pressao_atmosferica_hpa },
        insitu: i ? { temperatura_c: i.temperatura_c, umidade_relativa_perc: i.umidade_relativa_perc, pressao_atmosferica_hpa: i.pressao_atmosferica_hpa } : null,
        deltas: i ? {
          delta_temperatura_c: i.temperatura_c != null && ext.temperatura_c != null ? +(i.temperatura_c - ext.temperatura_c).toFixed(4) : null,
          delta_umidade_perc: i.umidade_relativa_perc != null && ext.umidade_relativa_perc != null ? +(i.umidade_relativa_perc - ext.umidade_relativa_perc).toFixed(4) : null,
          delta_pressao_hpa: i.pressao_atmosferica_hpa != null && ext.pressao_atmosferica_hpa != null ? +(i.pressao_atmosferica_hpa - ext.pressao_atmosferica_hpa).toFixed(4) : null,
        } : null,
      };
    });

    if (formato === "leituras") return { meta, leituras: leiturasFormatadas };
    if (formato === "estacoes") return { meta, estacoes: estatisticasPorEstacao };
    if (formato === "comparacao") return { meta, comparacoes };
    return { meta, estacoes: estatisticasPorEstacao, leituras: leiturasFormatadas, comparacoes };
  }, [filteredLeituras, estacoes, dadosExternos, estacaoId, formato, startDate, endDate]);

  const jsonData = useMemo(() => buildPayload(), [buildPayload]);
  const jsonString = useMemo(() => JSON.stringify(jsonData, null, 2), [jsonData]);

  // Gera Blob URL para download direto (links que podem ser usados em scripts)
  useEffect(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [jsonString]);

  const downloadJSON = () => {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `insitu_${formato}_${moment().format("YYYYMMDD_HHmm")}.json`;
    a.click();
    setLastGenerated(new Date().toISOString());
  };

  // — Exemplos de integração para modelos de IA —
  const pythonAIExample = `import requests, json, time, pandas as pd
from datetime import datetime, timedelta

# ── Configuração ──────────────────────────────────────────
EXPORT_URL = "${window.location.origin}/functions/dados-insitu"
# (Disponível com plano Builder+ — por enquanto, use download manual)

# ── Alternativa: carregar JSON exportado ──────────────────
def carregar_dados(caminho_json="insitu_tudo.json"):
    with open(caminho_json, "r", encoding="utf-8") as f:
        return json.load(f)

dados = carregar_dados()
leituras = pd.DataFrame(dados["leituras"])
leituras["timestamp"] = pd.to_datetime(leituras["timestamp"])
leituras = leituras.sort_values("timestamp")

# ── Feature engineering para modelo de desastres ─────────
def extrair_features(df):
    df = df.copy()
    # Taxa de variação de temperatura (°C/h)
    df["delta_temp"] = df["temperatura_c"].diff() / (df["timestamp"].diff().dt.total_seconds() / 3600)
    # Anomalia de pressão (queda rápida = frente fria/ciclone)
    df["delta_pressao"] = df["pressao_atmosferica_hpa"].diff()
    # Índice de desconforto térmico
    T = df["temperatura_c"]; U = df["umidade_relativa_perc"]
    df["indice_calor"] = T - 0.55 * (1 - U/100) * (T - 14.5)
    # CO2 anomaly
    df["co2_anomaly"] = df["nivel_co2"] - df["nivel_co2"].rolling(24).mean()
    return df

features = extrair_features(leituras)
print(features[["timestamp","temperatura_c","delta_temp","delta_pressao","indice_calor"]].tail())

# ── Integração com modelo (exemplo sklearn) ───────────────
# from sklearn.ensemble import RandomForestClassifier
# X = features[["delta_temp","delta_pressao","umidade_relativa_perc","nivel_co2"]].dropna()
# risco = model.predict_proba(X)[:, 1]  # Probabilidade de evento extremo`;

  const nodeExample = `const fs = require("fs");
const path = require("path");

// Carrega o JSON exportado (atualize o caminho)
function carregarDados(arquivo = "insitu_tudo.json") {
  const raw = fs.readFileSync(path.resolve(arquivo), "utf-8");
  return JSON.parse(raw);
}

// Detecta anomalias simples para alertas
function detectarAnomalias(leituras, limites = {
  temperatura_max: 40, co2_max: 1000, delta_pressao: -3
}) {
  const alertas = [];
  for (let i = 1; i < leituras.length; i++) {
    const l = leituras[i];
    const prev = leituras[i - 1];
    const deltaPressao = (l.pressao_atmosferica_hpa ?? 0) - (prev.pressao_atmosferica_hpa ?? 0);
    if (l.temperatura_c > limites.temperatura_max)
      alertas.push({ tipo: "temperatura_alta", timestamp: l.timestamp, valor: l.temperatura_c });
    if (l.nivel_co2 > limites.co2_max)
      alertas.push({ tipo: "co2_alto", timestamp: l.timestamp, valor: l.nivel_co2 });
    if (deltaPressao < limites.delta_pressao)
      alertas.push({ tipo: "queda_pressao", timestamp: l.timestamp, delta: deltaPressao });
  }
  return alertas;
}

const { leituras } = carregarDados();
const alertas = detectarAnomalias(leituras);
console.log(\`\${alertas.length} anomalias detectadas\`, alertas.slice(0, 5));`;

  const curlNote = `# Para integração automática com plano Builder+:
# GET https://seu-app.base44.app/functions/dados-insitu?formato=tudo&limit=500
#
# Com chave de acesso:
# GET .../functions/dados-insitu?api_key=SUA_CHAVE&estacao_id=ID&start=2026-01-01
#
# Por enquanto, use download manual e carregue o arquivo no seu modelo:
curl -o insitu_dados.json "${window.location.href.split("#")[0]}"`;

  return (
    <div className="space-y-4">
      {/* Aviso Builder */}
      <GlassCard className="p-4 border-amber-300/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Endpoint HTTP automático requer plano Builder+</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Com o Builder+, um endpoint real <code className="bg-amber-100 px-1 rounded font-mono">/functions/dados-insitu</code> será criado e poderá ser chamado diretamente pelo seu modelo de IA a cada inferência. Por enquanto, use o download JSON abaixo e carregue no seu script.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Config */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configurar Exportação</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label>Formato</Label>
            <Select value={formato} onValueChange={setFormato}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tudo">Tudo (IA completo)</SelectItem>
                <SelectItem value="leituras">Leituras brutas</SelectItem>
                <SelectItem value="estacoes">Estatísticas por estação</SelectItem>
                <SelectItem value="comparacao">Comparação InSitu vs Externo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estação</Label>
            <Select value={estacaoId} onValueChange={setEstacaoId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {estacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Início</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Fim</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="w-32">
            <Label>Limite</Label>
            <Input type="number" value={limit} onChange={e => setLimit(e.target.value)} min="1" max="1000" />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label className="cursor-pointer">Auto-atualizar (60s)</Label>
            {autoRefresh && <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]"><Zap className="w-2.5 h-2.5 mr-1" />Ativo</Badge>}
          </div>
          <Badge variant="outline" className="mt-5">{filteredLeituras.length} registros</Badge>
          {lastGenerated && <span className="text-xs text-muted-foreground mt-5">Gerado: {moment(lastGenerated).format("HH:mm:ss")}</span>}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={downloadJSON}>
            <Download className="w-4 h-4 mr-2" /> Baixar JSON
          </Button>
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(jsonString); toast({ title: "JSON copiado!" }); }}>
            <Copy className="w-4 h-4 mr-2" /> Copiar
          </Button>
          <Button variant="outline" onClick={() => { refetchLeituras(); setLastGenerated(new Date().toISOString()); toast({ title: "Dados atualizados" }); }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar agora
          </Button>
        </div>
      </GlassCard>

      {/* Preview */}
      <GlassCard className="p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Prévia do JSON</p>
        <CodeBlock
          label={`insitu_${formato}.json — ${filteredLeituras.length} leituras`}
          code={JSON.stringify(
            (() => {
              const d = { ...jsonData };
              if (d.leituras) d.leituras = d.leituras.slice(0, 2);
              if (d.comparacoes) d.comparacoes = d.comparacoes.slice(0, 1);
              return d;
            })(),
            null, 2
          ) + "\n// ... (truncado — baixe o arquivo completo)"}
        />
      </GlassCard>

      {/* Exemplos para IA */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integração com Modelo de IA (Desastres Ambientais)</p>
        </div>
        <div className="space-y-3">
          <CodeBlock label="Python — Feature Engineering + Sklearn/PyTorch" code={pythonAIExample} />
          <CodeBlock label="Node.js — Detecção de Anomalias" code={nodeExample} />
          <CodeBlock label="API HTTP (disponível com Builder+)" code={curlNote} />
        </div>
      </GlassCard>
    </div>
  );
}