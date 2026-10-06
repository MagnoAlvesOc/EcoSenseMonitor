import React, { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveSelect from "@/components/shared/ResponsiveSelect";
import { FileDown, Loader2, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import jsPDF from "jspdf";

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
  { key: "nivel_co2", label: "CO₂", unit: "ppm", color: "#10b981" },
  { key: "indice_uv", label: "Índice UV", unit: "", color: "#f59e0b" },
  { key: "status_bateria_v", label: "Bateria", unit: "V", color: "#6b7280" },
];

function calcStats(values) {
  if (!values.length) return { media: null, min: null, max: null, desvio: null };
  const sorted = [...values].sort((a, b) => a - b);
  const media = values.reduce((s, v) => s + v, 0) / values.length;
  const desvio = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - media, 2), 0) / values.length);
  return { media, min: sorted[0], max: sorted[sorted.length - 1], desvio };
}

function PreviewChart({ data, metric }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="time" tick={{ fontSize: 8, fill: "#9ca3af" }} interval="preserveStartEnd" tickLine={false} />
        <YAxis tick={{ fontSize: 8, fill: "#9ca3af" }} domain={["auto", "auto"]} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} formatter={v => [`${Number(v).toFixed(2)} ${metric.unit}`, metric.label]} />
        <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function RelatorioTab() {
  const [estacaoId, setEstacaoId] = useState("");
  const [startDate, setStartDate] = useState(moment().subtract(7, "days").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [generating, setGenerating] = useState(false);

  const { data: estacoes = [] } = useQuery({ queryKey: ["estacoes"], queryFn: () => base44.entities.Estacoes.list() });
  const { data: allLeituras = [] } = useQuery({
    queryKey: ["leituras-relatorio-pdf"],
    queryFn: () => base44.entities.HistoricoLeituras.list("-timestamp_recebimento", 1000),
  });
  const { data: custos = [] } = useQuery({ queryKey: ["custos"], queryFn: () => base44.entities.CustoManutencao.list("-data", 500) });
  const { data: manutencoes = [] } = useQuery({ queryKey: ["manutencoes"], queryFn: () => base44.entities.ManutencaoPreventiva.list("-data_realizada", 500) });

  const estacao = estacoes.find(e => e.id === estacaoId);

  const filteredLeituras = useMemo(() => {
    if (!estacaoId) return [];
    return allLeituras.filter(l => {
      if (l.estacao_id !== estacaoId) return false;
      const ts = moment(l.timestamp_recebimento);
      return ts.isSameOrAfter(startDate) && ts.isSameOrBefore(moment(endDate).endOf("day"));
    });
  }, [allLeituras, estacaoId, startDate, endDate]);

  const chartDataByMetric = useMemo(() => {
    const reversed = [...filteredLeituras].reverse().slice(-60);
    return METRICS.reduce((acc, m) => {
      acc[m.key] = reversed.map(l => ({
        time: moment(l.timestamp_recebimento).format("DD/MM HH:mm"),
        value: l[m.key],
      })).filter(d => d.value != null);
      return acc;
    }, {});
  }, [filteredLeituras]);

  const statsPerMetric = useMemo(() => {
    return METRICS.map(m => {
      const vals = filteredLeituras.map(l => l[m.key]).filter(v => v != null);
      return { ...m, ...calcStats(vals), count: vals.length };
    });
  }, [filteredLeituras]);

  const totalCustos = custos.filter(c => c.estacao_id === estacaoId).reduce((s, c) => s + (c.valor || 0), 0);
  const manutEst = manutencoes.filter(m => m.estacao_id === estacaoId);

  const generatePDF = async () => {
    if (!estacao || !filteredLeituras.length) return;
    setGenerating(true);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    let y = 15;

    // Header
    doc.setFillColor(24, 80, 50);
    doc.rect(0, 0, W, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("InSitu Monitor — Relatório de Estação", 14, 11);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Estação: ${estacao.nome}`, 14, 17);
    doc.text(`Período: ${moment(startDate).format("DD/MM/YYYY")} a ${moment(endDate).format("DD/MM/YYYY")}`, 14, 22);
    doc.text(`Gerado em: ${moment().format("DD/MM/YYYY HH:mm")}`, 130, 22);
    y = 35;

    // Summary row
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo", 14, y); y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const summary = [
      ["Total de Leituras", filteredLeituras.length.toString()],
      ["Custo Total de Manutenção", `R$ ${totalCustos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Registros de Manutenção", manutEst.length.toString()],
      ["Coordenadas", `${estacao.latitude?.toFixed(4)}, ${estacao.longitude?.toFixed(4)}`],
    ];
    summary.forEach(([k, v]) => {
      doc.text(`${k}:`, 14, y);
      doc.text(v, 90, y);
      y += 5;
    });
    y += 4;

    // Stats table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Estatísticas por Variável", 14, y); y += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, W - 28, 7, "F");
    doc.setFontSize(8);
    doc.text("Variável", 16, y + 5);
    doc.text("N", 66, y + 5);
    doc.text("Média", 80, y + 5);
    doc.text("Mín", 110, y + 5);
    doc.text("Máx", 135, y + 5);
    doc.text("Desvio", 160, y + 5);
    y += 9;

    doc.setFont("helvetica", "normal");
    statsPerMetric.forEach((s, i) => {
      if (i % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(14, y - 2, W - 28, 7, "F"); }
      doc.text(`${s.label} (${s.unit})`, 16, y + 3);
      doc.text(s.count.toString(), 66, y + 3);
      doc.text(s.media != null ? s.media.toFixed(2) : "—", 80, y + 3);
      doc.text(s.min != null ? s.min.toFixed(2) : "—", 110, y + 3);
      doc.text(s.max != null ? s.max.toFixed(2) : "—", 135, y + 3);
      doc.text(s.desvio != null ? s.desvio.toFixed(3) : "—", 160, y + 3);
      y += 7;
    });
    y += 6;

    // Last 20 readings table
    if (y > 220) { doc.addPage(); y = 15; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Últimas 20 Leituras", 14, y); y += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, W - 28, 7, "F");
    doc.setFontSize(7);
    const headers = ["Data/Hora", "Temp(°C)", "Umid(%)", "Pres(hPa)", "UV", "CO₂(ppm)", "Bat(V)"];
    const hx = [16, 50, 75, 95, 125, 140, 168];
    headers.forEach((h, i) => doc.text(h, hx[i], y + 5));
    y += 9;
    doc.setFont("helvetica", "normal");
    filteredLeituras.slice(0, 20).forEach((l, i) => {
      if (i % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(14, y - 2, W - 28, 6, "F"); }
      doc.text(moment(l.timestamp_recebimento).format("DD/MM HH:mm"), hx[0], y + 2);
      doc.text(l.temperatura_c?.toFixed(1) ?? "—", hx[1], y + 2);
      doc.text(l.umidade_relativa_perc?.toFixed(1) ?? "—", hx[2], y + 2);
      doc.text(l.pressao_atmosferica_hpa?.toFixed(0) ?? "—", hx[3], y + 2);
      doc.text(l.indice_uv?.toFixed(1) ?? "—", hx[4], y + 2);
      doc.text(l.nivel_co2?.toFixed(0) ?? "—", hx[5], y + 2);
      doc.text(l.status_bateria_v?.toFixed(2) ?? "—", hx[6], y + 2);
      y += 6;
      if (y > 270) { doc.addPage(); y = 15; }
    });

    // Maintenance history
    if (manutEst.length > 0) {
      if (y > 230) { doc.addPage(); y = 15; }
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Histórico de Manutenção Preventiva", 14, y); y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      manutEst.slice(0, 10).forEach(m => {
        doc.text(`• ${moment(m.data_realizada).format("DD/MM/YYYY")} — ${m.tipo?.replace(/_/g, " ")} — ${m.status?.toUpperCase()} — ${m.tecnico_responsavel || "—"}`, 14, y);
        y += 5;
        if (y > 270) { doc.addPage(); y = 15; }
      });
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("InSitu Monitor • Relatório gerado automaticamente", 14, 290);

    doc.save(`relatorio_${estacao.nome.replace(/\s+/g, "_")}_${moment().format("YYYYMMDD_HHmm")}.pdf`);
    setGenerating(false);
  };

  return (
    <div className="space-y-4">
      {/* Config */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configurar Relatório</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Estação</Label>
            <ResponsiveSelect value={estacaoId} onValueChange={setEstacaoId}>
              <SelectTrigger><SelectValue placeholder="Selecionar estação" /></SelectTrigger>
              <SelectContent>{estacoes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
            </ResponsiveSelect>
          </div>
          <div><Label>Data Início</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div><Label>Data Fim</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        </div>
        <Button
          onClick={generatePDF}
          disabled={!estacaoId || !filteredLeituras.length || generating}
          className="w-full md:w-auto"
        >
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
          {generating ? "Gerando PDF..." : `Baixar Relatório PDF (${filteredLeituras.length} leituras)`}
        </Button>
        {estacaoId && !filteredLeituras.length && (
          <p className="text-xs text-muted-foreground mt-2">Nenhuma leitura encontrada para o período selecionado.</p>
        )}
      </GlassCard>

      {/* Preview charts */}
      {filteredLeituras.length > 0 && (
        <GlassCard className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Prévia dos Gráficos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {METRICS.map(m => (
              chartDataByMetric[m.key]?.length > 0 && (
                <div key={m.key}>
                  <p className="text-xs font-semibold mb-1" style={{ color: m.color }}>{m.label} ({m.unit})</p>
                  <PreviewChart data={chartDataByMetric[m.key]} metric={m} />
                </div>
              )
            ))}
          </div>
        </GlassCard>
      )}

      {/* Stats preview */}
      {filteredLeituras.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {statsPerMetric.filter(s => s.count > 0).map(s => (
            <GlassCard key={s.key} className="p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.media?.toFixed(2) ?? "—"} <span className="text-sm font-normal text-muted-foreground">{s.unit}</span></p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.min?.toFixed(1)} — {s.max?.toFixed(1)} • {s.count} amostras</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}